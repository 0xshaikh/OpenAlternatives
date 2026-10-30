/* ------------------------------------------------------------------ *
 * OpenAlternatives — search and filter logic (pure, no DOM).
 *
 * filterTools is the single query function the UI and verify.js share.
 * It is deliberately simple and testable:
 *
 *   filterTools(tools, {
 *     query:    'git',            // free text, matched loosely
 *     category: 'dev-tools',      // '' or null = all
 *     maxPrice: 25,               // Infinity/0 = no cap
 *     sort:     'savings'         // 'default' | 'name' | 'savings' | 'stars'
 *   })
 * ------------------------------------------------------------------ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./data.js'));
  } else {
    root.OAData = root.OAData || {};
    root.OASearch = factory(root.OAData);
  }
})(typeof self !== 'undefined' ? self : global, function (Data) {
  'use strict';

  /** Lowercase the searchable haystack for one tool. */
  function haystack(tool) {
    return [
      tool.name, tool.replaces, tool.category,
      tool.license, tool.blurb, tool.site, tool.repo
    ].join(' ').toLowerCase();
  }

  /** Does `tool` match the free-text query (token AND, loose substring)? */
  function matchesQuery(tool, query) {
    if (!query) { return true; }
    var q = String(query).trim().toLowerCase();
    if (q === '') { return true; }
    var text = haystack(tool);
    var tokens = q.split(/\s+/).filter(function (t) { return t !== ''; });
    for (var i = 0; i < tokens.length; i++) {
      if (text.indexOf(tokens[i]) === -1) { return false; }
    }
    return true;
  }

  /** Does `tool` fall within the price cap? A tool's price is the SaaS
   *  per-seat-per-month cost it replaces. */
  function withinPrice(tool, maxPrice) {
    if (!maxPrice || maxPrice <= 0) { return true; }
    return tool.price <= maxPrice;
  }

  /**
   * Filter `tools` by category, free-text query, and an optional
   * per-seat price cap, then sort. Never mutates the input.
   */
  function filterTools(tools, opts) {
    opts = opts || {};
    var category = opts.category || '';
    var query = opts.query || '';
    var maxPrice = opts.maxPrice || 0;
    var sort = opts.sort || 'default';

    var out = (tools || []).filter(function (t) {
      if (category && t.category !== category) { return false; }
      if (!matchesQuery(t, query)) { return false; }
      if (!withinPrice(t, maxPrice)) { return false; }
      return true;
    });

    switch (sort) {
      case 'name':
        out.sort(function (a, b) { return a.name.localeCompare(b.name); });
        break;
      case 'savings':
        out.sort(function (a, b) { return b.price - a.price || a.name.localeCompare(b.name); });
        break;
      case 'stars':
        out.sort(function (a, b) {
          return (b.stars - a.stars) || a.name.localeCompare(b.name);
        });
        break;
      case 'default':
      default:
        out = Data.defaultSort(out);
        break;
    }
    return out;
  }

  /** Count tools per category for the sidebar chips (all, not filtered). */
  function categoryCounts(tools) {
    var counts = {};
    (tools || []).forEach(function (t) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }

  return {
    haystack: haystack,
    matchesQuery: matchesQuery,
    withinPrice: withinPrice,
    filterTools: filterTools,
    categoryCounts: categoryCounts
  };
});
