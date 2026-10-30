/* ------------------------------------------------------------------ *
 * OpenAlternatives — localStorage wrapper for user-added tools.
 *
 * The curated directory is committed in data.js. Users can also add
 * their own tools, which persist under a single localStorage key. If
 * storage is unavailable (private mode, file:// in some browsers),
 * the store silently falls back to memory so the app still works.
 * ------------------------------------------------------------------ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./data.js'));
  } else {
    root.OAData = root.OAData || {};
    root.OAStore = factory(root.OAData);
  }
})(typeof self !== 'undefined' ? self : global, function (Data) {
  'use strict';

  var KEY = 'openalternatives.userTools';
  var MAX_USER_TOOLS = 60;

  // In-memory fallback: when localStorage is unavailable (private mode,
  // Node test suite, some file:// browsers) the store keeps its state
  // here so the app still works for the session.
  var memory = null;

  function hasStorage() {
    try {
      return typeof localStorage !== 'undefined' && localStorage !== null;
    } catch (e) {
      return false;
    }
  }

  function readMemory() {
    if (!hasStorage()) {
      return (memory || []).slice();
    }
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) { return []; }
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function writeMemory(tools) {
    memory = (tools || []).slice();
    if (!hasStorage()) { return; }
    try {
      localStorage.setItem(KEY, JSON.stringify(tools));
    } catch (e) { /* quota / private mode — ignore */ }
  }

  /** The user-added tools, merged after the curated set. */
  function userTools() {
    return readMemory();
  }

  /** All tools: curated + user-added. Returns a fresh array. */
  function allTools() {
    return Data.TOOLS.concat(readMemory());
  }

  /** Add a user tool; validates the shape and dedupes by id. Returns the tool. */
  function addUserTool(raw) {
    var tool = normalizeUserTool(raw);
    var tools = readMemory();
    var idx = -1;
    for (var i = 0; i < tools.length; i++) {
      if (tools[i].id === tool.id) { idx = i; break; }
    }
    if (idx !== -1) { tools[idx] = tool; } else { tools.push(tool); }
    // keep the cap honest
    var capped = tools.slice(0, MAX_USER_TOOLS);
    writeMemory(capped);
    return tool;
  }

  /** Remove a user-added tool by id. Returns true if something was removed. */
  function removeUserTool(id) {
    var tools = readMemory();
    var next = tools.filter(function (t) { return t.id !== id; });
    if (next.length === tools.length) { return false; }
    writeMemory(next);
    return true;
  }

  /** Coerce a raw object from the "Add a tool" form into a valid tool. */
  function normalizeUserTool(raw) {
    if (!raw || typeof raw !== 'object') {
      throw new TypeError('tool: must be an object');
    }
    var name = str(raw.name);
    if (name === '') { throw new TypeError('tool: "name" is required'); }
    var replaces = str(raw.replaces) || name;
    var category = str(raw.category);
    var known = Data.CATEGORIES.some(function (c) { return c.id === category; });
    if (!known) { category = 'productivity'; }
    var price = Number(raw.price);
    if (!isFinite(price) || price < 0) { price = 0; }
    var id = str(raw.id) || slug(name);
    var repo = str(raw.repo);
    if (repo !== '' && !/^https?:\/\//.test(repo)) { repo = ''; }
    return {
      id: id,
      name: name,
      category: category,
      replaces: replaces,
      price: Math.round(price * 100) / 100,
      license: str(raw.license) || '—',
      repo: repo,
      site: str(raw.site) || repo,
      stars: Number(raw.stars) > 0 ? Number(raw.stars) : 0,
      blurb: str(raw.blurb) || ('Open-source replacement for ' + replaces + '.'),
      popular: false,
      user: true
    };
  }

  function str(v) {
    return typeof v === 'string' ? v.trim() : '';
  }

  function slug(v) {
    return String(v).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'user-tool';
  }

  return {
    KEY: KEY,
    userTools: userTools,
    allTools: allTools,
    addUserTool: addUserTool,
    removeUserTool: removeUserTool,
    normalizeUserTool: normalizeUserTool,
    backend: function () { return hasStorage() ? 'localStorage' : 'memory'; }
  };
});
