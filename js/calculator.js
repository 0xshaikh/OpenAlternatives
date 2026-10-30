/* ------------------------------------------------------------------ *
 * OpenAlternatives — cost-savings calculator (pure, no DOM).
 *
 * The expensive part being replaced is the per-seat subscription, so
 * the core number is:
 *
 *   monthly = Σ(selected tool's SaaS pricePerSeat) × teamSize
 *   annual  = monthly × 12
 *
 * `price` on a tool is the USD per-seat per-month cost of the SaaS it
 * replaces. Everything below is exact arithmetic on that field.
 * ------------------------------------------------------------------ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./data.js'));
  } else {
    root.OAData = root.OAData || {};
    root.OACalc = factory(root.OAData);
  }
})(typeof self !== 'undefined' ? self : global, function (Data) {
  'use strict';

  /** Total per-seat monthly cost of a set of tools (the SaaS prices). */
  function monthlyPerSeat(tools) {
    var sum = 0;
    (tools || []).forEach(function (t) {
      sum += (typeof t.price === 'number' && isFinite(t.price)) ? t.price : 0;
    });
    return sum;
  }

  /** Team-wide monthly savings for the selected tools. */
  function monthlySavings(tools, teamSize) {
    var seats = Math.max(1, Math.floor(Number(teamSize) || 1));
    return round2(monthlyPerSeat(tools) * seats);
  }

  /** Team-wide annual savings. */
  function annualSavings(tools, teamSize) {
    return round2(monthlySavings(tools, teamSize) * 12);
  }

  /** Annual savings per seat (price sum × 12), useful for comparison. */
  function annualPerSeat(tools) {
    return round2(monthlyPerSeat(tools) * 12);
  }

  /** Savings per category, for the breakdown bars in the calculator. */
  function byCategory(tools, teamSize) {
    var seats = Math.max(1, Math.floor(Number(teamSize) || 1));
    var map = {};
    (tools || []).forEach(function (t) {
      if (!map[t.category]) {
        map[t.category] = { category: t.category, count: 0, monthlyPerSeat: 0 };
      }
      map[t.category].count += 1;
      map[t.category].monthlyPerSeat += t.price;
    });
    return Object.keys(map).map(function (key) {
      var row = map[key];
      return {
        category: row.category,
        label: Data.categoryLabel(row.category),
        count: row.count,
        monthlyPerSeat: round2(row.monthlyPerSeat),
        monthly: round2(row.monthlyPerSeat * seats),
        annual: round2(row.monthlyPerSeat * seats * 12)
      };
    }).sort(function (a, b) { return b.annual - a.annual; });
  }

  /** Rough yearly SaaS budget a team of `teamSize` pays today for the
   *  tools in `selected` — the "before" number in the pitch. */
  function yearlySaaSBill(tools, teamSize) {
    return round2(monthlySavings(tools, teamSize) * 12);
  }

  function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  /** Format USD for display: no decimals when whole, else two. */
  function money(n) {
    var v = Math.round((Number(n) + Number.EPSILON) * 100) / 100;
    var hasCents = Math.abs(v - Math.round(v)) > 0.004;
    return '$' + (hasCents ? v.toFixed(2) : String(Math.round(v)));
  }

  return {
    monthlyPerSeat: monthlyPerSeat,
    monthlySavings: monthlySavings,
    annualSavings: annualSavings,
    annualPerSeat: annualPerSeat,
    byCategory: byCategory,
    yearlySaaSBill: yearlySaaSBill,
    money: money
  };
});
