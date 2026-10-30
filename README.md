<p align="center">
  <img src="./icon.svg" alt="OpenAlternatives" width="120" height="120" />
</p>

<h1 align="center">OpenAlternatives</h1>

<p align="center">
  <strong>A curated directory of open-source alternatives to expensive SaaS tools — with a cost-savings calculator.</strong>
</p>

<p align="center">
  The expensive part of a SaaS tool is the seat: a per-user, per-month
  subscription that quietly renews forever. OpenAlternatives is the map of
  what replaces it — 50 genuinely open, self-hostable tools across 8
  categories, each paired with the paid SaaS it replaces and the per-seat
  price you would stop paying. Switch on the tools your team would adopt,
  set your team size, and see the monthly and annual savings. It runs
  entirely in your browser. No backend, no account, no telemetry, no build
  step, zero dependencies.
</p>

<p align="center">
  <img alt="license" src="https://img.shields.io/badge/license-MIT-4c9aff" />
  <img alt="dependencies" src="https://img.shields.io/badge/dependencies-0-orange" />
  <img alt="build" src="https://img.shields.io/badge/build-step%20none-3c873a" />
  <img alt="runtime" src="https://img.shields.io/badge/runtime-any%20modern%20browser-8a6dff" />
  <img alt="storage" src="https://img.shields.io/badge/storage-localStorage-a0a0a0" />
  <img alt="version" src="https://img.shields.io/badge/version-1.0.0-6d5efc" />
  <a href="https://github.com/0xshaikh/OpenAlternatives/actions">
    <img alt="ci" src="https://github.com/0xshaikh/OpenAlternatives/workflows/CI/badge.svg" />
  </a>
</p>

---

## What it is

OpenAlternatives is a **single-page directory + savings calculator** written
in plain vanilla JavaScript. There is no framework, no bundler, no
`package.json`, no `npm install`, and no backend — the whole app is one
`index.html`, a stylesheet, five script files, and two SVG icons.

It is **honest data, not marketing.** Every entry is a real, actively
maintained open-source project (Gitea, Supabase, Nextcloud, Joplin, Penpot,
Blender, Matomo, Twenty, Ghost, and 40 more), paired with the actual
commercial product it replaces and that product's published per-seat
per-month price. The numbers are the numbers — the directory does not
inflate them, and the calculator does not round them away.

## Quick start

There is nothing to install. Pick whichever feels right:

```sh
# Just open the file
xdg-open index.html          # or double-click it

# Or serve it locally
python3 -m http.server 8080
# then visit http://localhost:8080
```

That is it. No build step, no environment variable, no account. The app
opens with all 50 tools sorted by recommendation; start typing to narrow
them.

## Features

**Browse by category.** Eight buckets — dev tools, productivity,
communication, creative, analytics, CRM, marketing, design — each with a
live count. Click a chip to see just that category, or *All* for everything.

**Search and filter.** Free-text search runs across name, the SaaS it
replaces, its licence, and its description. A price slider caps what a
replacement is allowed to cost per seat per month, and the results can be
sorted by recommendation, name, biggest savings, or GitHub stars.

**See the expensive part.** Each card names the SaaS it replaces and the
per-seat per-month price you would stop paying — `Gitea → GitHub Team at
$4/seat/mo`, `Matomo → Adobe Analytics at $150/seat/mo`, and so on — plus
its open-source licence, repository, and a one-line reason it works.

**Savings calculator.** Flip the *Save* switch on any tool, set your team
size with a slider, and the sidebar computes what you save monthly and
annually. It breaks the total down by category with proportional bars, and
shows your current SaaS bill for the same tools — the "before" number you
can hold up against the "after".

**Add your own.** The curated directory lives in the repo, but the
**Add your own** button lets you log a tool you already use that is not on
the list. It is validated, deduplicated, and persisted to
`localStorage`; your additions stay in the browser, not in the codebase.

**Local-first and private.** Everything runs in the browser. There is no
server to call, no analytics script, no cookie banner, and nothing leaves
your machine. Your team size and your saved selection live in
`localStorage` under one key.

## How it saves you money

The math is deliberately transparent. For the tools you switch on:

```
monthly savings = Σ(per-seat price of each replaced SaaS) × team size
annual  savings = monthly × 12
```

A small example with real numbers from the directory, for a team of 5:

| Replaced SaaS | Open alternative | $/seat/mo |
|---|---|---|
| GitHub Team | Gitea | $4 |
| Google Workspace | Nextcloud | $6 |
| Slack | Mattermost | $8.75 |
| Figma | Penpot | $16 |
| Tableau | Metabase | $70 |

That is **$104.75/seat/mo** — **$523.75/mo** for the team, **$6,285/yr**.
Scale the slider to 50 seats and the same five switches are worth **$62,850
a year**. The directory holds 50 such swaps; the calculator sums whatever
you actually select.

Because the whole stack is open source, the savings compound rather than
renew: no per-seat count to pay, no annual price bump, no vendor holding
your data hostage when you want to leave.

## Verification

```sh
node verify.js
```

That is the whole command. No `npm install`, no test runner, no dev
dependencies, no headless browser — `verify.js` is a plain Node script with
its own tiny assert helper, and it exits non-zero on any failure.

The suite runs **70 assertions** against the real production modules:
catalog integrity (every one of the 50 tools has a name, a category, the
SaaS it replaces, a positive per-seat price, a licence, and a valid repo
link; no duplicate names or ids; all 8 categories declared and used),
search and filter correctness (free-text across every field, token-AND
matching, case-insensitivity, category partitioning, price caps, every sort
order, no input mutation), the savings math (per-seat sums, team-size
scaling, monthly→annual, empty and single-tool edges, breakdown rows summing
to the total), the localStorage-backed user-tool store (validation,
slugification, add/remove round-trip, memory fallback), and a final section
that loads every module into a bare VM context with no `module` or
`require` in scope — the exact path a browser takes — to catch bugs the Node
require branch would hide.

```
============================================================
PASS  70/70 assertions passed, 0 failed
============================================================
```

The DOM layer in `app.js` is exercised by hand in a real browser rather
than by jsdom, which is why it stays a thin rendering layer.

## Architecture

```
OpenAlternatives/
├── index.html                  # App shell: topbar, categories, list, calculator
├── css/
│   └── styles.css              # Dark theme, 3-column responsive layout
├── js/
│   ├── data.js                 # The curated directory: 50 tools across 8 categories
│   ├── search.js               # Filter, match, price-cap, and sort logic (pure)
│   ├── calculator.js           # Savings math: per-seat, team, monthly, annual (pure)
│   ├── store.js                # localStorage wrapper + in-memory fallback
│   └── app.js                  # DOM layer: rendering, events, modal
├── verify.js                   # Test suite — plain Node, zero dependencies
├── icon.svg                    # 100×100 app icon
├── favicon.svg                 # 32×32 favicon
├── README.md
├── LICENSE                     # MIT
├── .gitignore
└── .github/workflows/
    └── ci.yml                  # node verify.js on every push
```

Four of the five script files are **pure logic with no DOM access**, wrapped
in a small UMD pattern so the exact same file loads under Node (`require`)
and in a browser (a `window` global). `verify.js` therefore tests the real
production data and code, not a re-implementation:

```sh
node -e "const D = require('./js/data.js'); console.log(D.TOOLS.length + ' tools')"
```

`app.js` is the only file that touches the DOM, and it is deliberately thin
— render functions plus one delegated click listener, so re-rendering never
detaches handlers.

## Contributing

Contributions are welcome. A few ground rules, in the spirit of what this is:

- **Keep the dependency count at zero.** No runtime dependencies, no build
  step, no framework. If a change needs `npm install`, it needs to be
  discussed first.
- **Add tools to the directory, not to the marketing.** New entries must be
  real, actively maintained open-source projects with a working repository
  and a defensible per-seat price for the SaaS they replace.
- **Keep pure logic in pure files.** Anything testable without a browser
  belongs in `data.js`, `search.js`, `calculator.js`, or `store.js` — and
  if you add a function there, add assertions for it.
- **Run `node verify.js` before you push.** It must exit green.
- **Do not add any network call to the app.** This project's value is that
  data never leaves the browser. Adding an API would change what it is.

Issues are a good way to start — in particular, a tool or a price that has
changed is worth reporting, since those numbers live in one object.

## License

MIT — see [LICENSE](LICENSE). Use it, fork it, ship it.
