#!/usr/bin/env node
/* ------------------------------------------------------------------ *
 * OpenAlternatives verification suite
 *
 * Plain Node, zero dependencies. No npm install, no jest, no jsdom.
 *
 *     node verify.js
 *
 * The data / search / calculator / store modules are pure and
 * UMD-wrapped, so this file loads them straight from ./js and asserts
 * real behaviour. The DOM layer (app.js) is exercised manually.
 * ------------------------------------------------------------------ */
'use strict';

const vm = require('vm');
const fs = require('fs');
const path = require('path');

const Data = require('./js/data.js');
const Search = require('./js/search.js');
const Calc = require('./js/calculator.js');
const Store = require('./js/store.js');

let pass = 0;
let fail = 0;
const failures = [];

function ok(name) { pass++; }
function bad(name, extra) { fail++; failures.push(name + (extra ? ' — ' + extra : '')); }

function check(name, cond, extra) {
  if (cond) { ok(name); } else { bad(name, extra); }
}

function eq(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  check(name, a === e, 'expected ' + e + ', got ' + a);
}

function throws(name, fn) {
  try {
    fn();
    bad(name, 'expected a TypeError, none thrown');
  } catch (e) {
    if (e instanceof TypeError) { ok(name); } else { bad(name, 'wrong error: ' + e.message); }
  }
}

function close(name, actual, expected, eps) {
  eps = eps || 0.001;
  check(name, Math.abs(actual - expected) <= eps,
    'expected ' + expected + ' ± ' + eps + ', got ' + actual);
}

/* ================================================================== */
console.log('\nOpenAlternatives verification\n');
console.log('— data integrity —');
/* ================================================================== */

const CAT_IDS = Data.CATEGORIES.map(c => c.id);

check('catalog has exactly the 8 documented categories',
  CAT_IDS.length === 8 &&
  CAT_IDS.join(',') === 'dev-tools,productivity,communication,creative,analytics,crm,marketing,design');

check('catalog is non-trivial (at least 30 curated tools)',
  Data.TOOLS.length >= 30, 'got ' + Data.TOOLS.length);

// every tool is well-formed
let integrityOK = true;
const seenNames = {};
const seenIds = {};
const seenCats = {};
Data.TOOLS.forEach(t => {
  const problems = [];
  if (typeof t.name !== 'string' || t.name.trim() === '') problems.push('name');
  if (typeof t.category !== 'string') problems.push('category');
  if (typeof t.replaces !== 'string' || t.replaces.trim() === '') problems.push('replaces');
  if (typeof t.price !== 'number' || !isFinite(t.price) || t.price <= 0) problems.push('price');
  if (typeof t.license !== 'string' || t.license.trim() === '') problems.push('license');
  if (typeof t.repo !== 'string' || !/^https?:\/\//.test(t.repo)) problems.push('repo');
  if (typeof t.blurb !== 'string' || t.blurb.trim() === '') problems.push('blurb');
  if (CAT_IDS.indexOf(t.category) === -1) problems.push('unknown-category:' + t.category);
  if (seenNames[t.name]) problems.push('duplicate-name:' + t.name);
  if (seenIds[t.id]) problems.push('duplicate-id:' + t.id);
  seenNames[t.name] = true;
  seenIds[t.id] = true;
  seenCats[t.category] = true;
  if (problems.length) {
    integrityOK = false;
    failures.push(t.id + ' has problems: ' + problems.join(', '));
  }
});
check('every curated tool is well-formed (name, category, replaces, price>0, license, repo, blurb, valid category, unique name/id)',
  integrityOK);

// every category referenced actually exists in CATEGORIES
check('every category referenced by a tool is declared',
  Object.keys(seenCats).every(c => CAT_IDS.indexOf(c) !== -1));

// every category is actually used (no empty buckets)
check('every declared category has at least one tool',
  CAT_IDS.every(c => Data.TOOLS.some(t => t.category === c)),
  'missing: ' + CAT_IDS.filter(c => !Data.TOOLS.some(t => t.category === c)).join(','));

// prices are sane
const maxPrice = Math.max.apply(null, Data.TOOLS.map(t => t.price));
check('every price is a plausible per-seat monthly SaaS price (≤ $300)',
  maxPrice <= 300, 'max is ' + maxPrice);

// popular flag is a subset
check('only flagged tools carry the popular badge',
  Data.TOOLS.every(t => typeof t.popular === 'boolean' || t.popular === undefined));

/* ================================================================== */
console.log('— search & filter —');
/* ================================================================== */

// free text across name / replaces / blurb / license / repo
const git = Search.filterTools(Data.TOOLS, { query: 'git' });
check('search "git" returns at least the Git forge (Gitea)',
  git.some(t => t.id === 'gitea'), 'gitea not found');
check('search "git" is case-insensitive',
  Search.filterTools(Data.TOOLS, { query: 'GIT' }).length === git.length);
check('search "git" results are a subset of all tools',
  git.every(t => Data.TOOLS.indexOf(t) !== -1));
check('search matching is token-AND (both words must appear)',
  Search.filterTools(Data.TOOLS, { query: 'git forge' }).some(t => t.id === 'gitea'));
check('search by license name finds that license',
  Search.filterTools(Data.TOOLS, { query: 'AGPL' }).length > 0);
check('nonsense query returns nothing',
  Search.filterTools(Data.TOOLS, { query: 'zzzznope' }).length === 0);
check('empty query returns every tool',
  Search.filterTools(Data.TOOLS, { query: '' }).length === Data.TOOLS.length);
check('null query returns every tool',
  Search.filterTools(Data.TOOLS, { query: null }).length === Data.TOOLS.length);
check('matchesQuery: null/empty always true',
  Search.matchesQuery(Data.TOOLS[0], '') && Search.matchesQuery(Data.TOOLS[0], null));

// category filter
const crm = Search.filterTools(Data.TOOLS, { category: 'crm' });
check('category "crm" returns only CRM tools',
  crm.length > 0 && crm.every(t => t.category === 'crm'));
check('every CRM tool replaces a real CRM SaaS',
  crm.every(t => /Salesforce|HubSpot|Pipedrive|Cloze/.test(t.replaces)));
const allByCat = Data.CATEGORIES.reduce((sum, c) =>
  sum + Search.filterTools(Data.TOOLS, { category: c.id }).length, 0);
check('category filters partition the catalog (sum equals total)',
  allByCat === Data.TOOLS.length,
  'sum ' + allByCat + ' vs total ' + Data.TOOLS.length);

// combined category + query
const commSlack = Search.filterTools(Data.TOOLS, { category: 'communication', query: 'slack' });
check('combined category+query: communication × slack returns Slack replacements',
  commSlack.length >= 2 && commSlack.every(t => t.category === 'communication'));

// price cap
const cheap = Search.filterTools(Data.TOOLS, { maxPrice: 10 });
check('price cap ≤ $10 excludes the $70+ Tableau/Salesforce stand-ins',
  cheap.length > 0 && cheap.every(t => t.price <= 10));
check('price cap 0 / null means no cap',
  Search.filterTools(Data.TOOLS, { maxPrice: 0 }).length === Data.TOOLS.length &&
  Search.filterTools(Data.TOOLS, { maxPrice: null }).length === Data.TOOLS.length);
check('withinPrice: null cap is true, cap below price is false',
  Search.withinPrice(Data.TOOLS[0], null) && !Search.withinPrice(Data.TOOLS[0], Data.TOOLS[0].price - 0.01));

// sorts
const byName = Search.filterTools(Data.TOOLS, { sort: 'name' });
check('sort by name is ascending',
  byName.every((t, i) => i === 0 || byName[i - 1].name.localeCompare(t.name) <= 0));
const bySavings = Search.filterTools(Data.TOOLS, { sort: 'savings' });
check('sort by savings is descending price',
  bySavings.every((t, i) => i === 0 || bySavings[i - 1].price >= t.price));
const byStars = Search.filterTools(Data.TOOLS, { sort: 'stars' });
check('sort by stars is descending stars',
  byStars.every((t, i) => i === 0 || byStars[i - 1].stars >= t.stars));
const byDefault = Search.filterTools(Data.TOOLS, { sort: 'default' });
check('default sort puts popular tools first',
  byDefault.length > 0 && byDefault[0].popular === true);

// defaultSort never mutates input
const before = Data.TOOLS.slice();
Search.filterTools(Data.TOOLS, { query: 'git' });
eq('filterTools does not mutate the input array', Data.TOOLS, before);

// category counts
const counts = Search.categoryCounts(Data.TOOLS);
check('categoryCounts totals equal the catalog size',
  Object.keys(counts).reduce((s, k) => s + counts[k], 0) === Data.TOOLS.length);
check('categoryCounts has an entry for every category',
  CAT_IDS.every(c => typeof counts[c] === 'number' && counts[c] > 0));

/* ================================================================== */
console.log('— savings calculator —');
/* ================================================================== */

// a hand-picked set with known prices
const set = Data.TOOLS.filter(t =>
  t.id === 'gitea' || t.id === 'nextcloud' || t.id === 'penpot' || t.id === 'matomo');
const knownPerSeat = set.reduce((s, t) => s + t.price, 0); // 4 + 6 + 16 + 150

close('monthlyPerSeat sums the SaaS prices exactly',
  Calc.monthlyPerSeat(set), knownPerSeat);

// team of 5
close('monthlySavings = per-seat × team size (5)',
  Calc.monthlySavings(set, 5), knownPerSeat * 5);
close('annualSavings = monthly × 12',
  Calc.annualSavings(set, 5), knownPerSeat * 5 * 12);
close('annualPerSeat = per-seat × 12',
  Calc.annualPerSeat(set), knownPerSeat * 12);
close('yearlySaaSBill equals annualSavings',
  Calc.yearlySaaSBill(set, 5), knownPerSeat * 5 * 12);

// per-team-size scaling is linear
const m1 = Calc.monthlySavings(set, 1);
const m10 = Calc.monthlySavings(set, 10);
close('savings scale linearly with team size (×10)',
  m10, m1 * 10);
close('savings for 0 seats clamps to 1 seat',
  Calc.monthlySavings(set, 0), knownPerSeat);
close('savings for negative seats clamps to 1 seat',
  Calc.monthlySavings(set, -5), knownPerSeat);

// empty selection saves nothing
eq('empty selection saves $0 monthly', Calc.monthlySavings([], 5), 0);
eq('empty selection saves $0 annually', Calc.annualSavings([], 5), 0);
close('single tool at team of 1 = its own price',
  Calc.monthlySavings([Data.TOOLS[0]], 1), Data.TOOLS[0].price);

// byCategory breakdown
const breakdown = Calc.byCategory(set, 5);
check('breakdown has one row per distinct category',
  breakdown.length === new Set(set.map(t => t.category)).size);
check('breakdown is sorted by annual descending',
  breakdown.every((r, i) => i === 0 || breakdown[i - 1].annual >= r.annual));
const breakdownSum = breakdown.reduce((s, r) => s + r.annual, 0);
close('breakdown rows sum to the annual total',
  breakdownSum, Calc.annualSavings(set, 5), 0.01);
check('breakdown rows carry a human label and count',
  breakdown.every(r => typeof r.label === 'string' && r.label.length > 0 && r.count >= 1));

// money formatting
eq('money formats whole dollars without decimals', Calc.money(1500), '$1500');
eq('money formats cents when needed', Calc.money(8.75), '$8.75');
eq('money formats zero', Calc.money(0), '$0');
check('money rounds fractional cents',
  Calc.money(2.333) === '$2.33' || Calc.money(2.333) === '$2.34');

/* ================================================================== */
console.log('— store / user-added tools —');
/* ================================================================== */

// normalizeUserTool validation
throws('store rejects a non-object tool', () => Store.normalizeUserTool(null));
throws('store requires a name', () => Store.normalizeUserTool({ name: '  ' }));
check('store falls back to a known category for a bad one',
  Store.normalizeUserTool({ name: 'X', category: 'not-real' }).category === 'productivity');
check('store rejects non-http repo URLs',
  Store.normalizeUserTool({ name: 'X', repo: 'not a url' }).repo === '');
check('store keeps valid https repo URLs',
  /^https:\/\//.test(Store.normalizeUserTool({ name: 'X', repo: 'https://github.com/a/b' }).repo));
check('store clamps a missing price to zero',
  Store.normalizeUserTool({ name: 'X' }).price === 0);
check('store sets the user flag and defaults the blurb',
  Store.normalizeUserTool({ name: 'X' }).user === true);
check('store slugifies an id from the name',
  Store.normalizeUserTool({ name: 'My Tool' }).id === 'my-tool');

// add / remove round-trip against the in-memory fallback (no localStorage in Node)
const beforeTools = Store.userTools().length;
const added = Store.addUserTool({ name: 'TestTool', price: 12, category: 'design' });
check('addUserTool returns the normalised tool', added.name === 'TestTool');
check('addUserTool persists into userTools', Store.userTools().some(t => t.id === added.id));
check('allTools includes curated + user tools',
  Store.allTools().length === Data.TOOLS.length + Store.userTools().length);
check('removeUserTool removes by id', Store.removeUserTool(added.id) === true);
check('removeUserTool reports false for a missing id', Store.removeUserTool('nope') === false);
check('userTools returns to its original length',
  Store.userTools().length === beforeTools);
check('backend reports memory fallback under Node', Store.backend() === 'memory');

/* ================================================================== */
console.log('— browser-mode cross-module load (VM, no require) —');
/* ================================================================== */

// Load every pure module into a bare VM context with no `module` or
// `require` — the exact path a browser takes — to catch bugs that the
// Node require branch would hide.
const sandbox = {};
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.global = sandbox;
vm.createContext(sandbox);

['data', 'search', 'calculator', 'store'].forEach(name => {
  const src = fs.readFileSync(path.join(__dirname, 'js', name + '.js'), 'utf8');
  vm.runInContext(src, sandbox, { filename: name + '.js' });
});

check('browser mode: the context really has no `module` or `require`',
  vm.runInContext('typeof module + "/" + typeof require', sandbox) === 'undefined/undefined');

check('browser mode: data module loads as a global',
  typeof sandbox.OAData === 'object' && Array.isArray(sandbox.OAData.TOOLS));
check('browser mode: search reaches data across modules',
  sandbox.OASearch.filterTools(sandbox.OAData.TOOLS, { category: 'crm' }).length ===
  Search.filterTools(Data.TOOLS, { category: 'crm' }).length);
check('browser mode: calculator reaches data across modules',
  sandbox.OACalc.monthlySavings(sandbox.OAData.TOOLS.slice(0, 3), 4) ===
  Calc.monthlySavings(Data.TOOLS.slice(0, 3), 4));
check('browser mode: store falls back to memory',
  sandbox.OAStore.backend() === 'memory');
check('browser mode: store add/remove round-trips',
  (() => {
    const t = sandbox.OAStore.addUserTool({ name: 'VM Tool', price: 5, category: 'creative' });
    const ok = sandbox.OAStore.userTools().some(x => x.id === t.id);
    sandbox.OAStore.removeUserTool(t.id);
    return ok;
  })());

/* ================================================================== */
const total = pass + fail;
console.log('\n' + '='.repeat(60));
if (fail === 0) {
  console.log('PASS  ' + pass + '/' + total + ' assertions passed, 0 failed');
} else {
  console.log('FAIL  ' + pass + '/' + total + ' passed, ' + fail + ' failed:');
  failures.forEach(f => console.log('   × ' + f));
}
console.log('='.repeat(60));
process.exit(fail === 0 ? 0 : 1);
