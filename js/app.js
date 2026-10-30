/* ------------------------------------------------------------------ *
 * OpenAlternatives — DOM layer. The only file that touches the DOM.
 *
 * Thin by design: it wires the pure modules (data, search, calculator,
 * store) to the page, keeps a single delegated click listener, and
 * re-renders on state change. Nothing here does math or query logic.
 * ------------------------------------------------------------------ */
(function (root) {
  'use strict';

  var Data = root.OAData;
  var Search = root.OASearch;
  var Calc = root.OACalc;
  var Store = root.OAStore;

  var state = {
    query: '',
    category: '',
    maxPrice: 0,
    sort: 'default',
    teamSize: 5,
    selected: {},   // id -> true, the calculator's switch list
    userTools: Store.userTools()
  };

  var $ = function (sel) { return document.querySelector(sel); };

  function tools() { return Data.TOOLS.concat(state.userTools); }
  function selectedTools() {
    return tools().filter(function (t) { return state.selected[t.id]; });
  }

  // ---------- rendering ----------

  function renderCategories() {
    var counts = Search.categoryCounts(tools());
    var el = $('#category-list');
    var html = '<button class="chip' + (state.category === '' ? ' is-active' : '') +
      '" data-action="category" data-value="">All <span class="chip__n">' +
      tools().length + '</span></button>';
    Data.CATEGORIES.forEach(function (c) {
      var n = counts[c.id] || 0;
      if (n === 0) { return; }
      html += '<button class="chip' + (state.category === c.id ? ' is-active' : '') +
        '" data-action="category" data-value="' + c.id + '">' +
        c.label + ' <span class="chip__n">' + n + '</span></button>';
    });
    el.innerHTML = html;
  }

  function renderList() {
    var list = Search.filterTools(tools(), {
      query: state.query,
      category: state.category,
      maxPrice: state.maxPrice,
      sort: state.sort
    });
    var el = $('#tool-list');
    $('#count').textContent = list.length + ' tool' + (list.length === 1 ? '' : 's');

    if (list.length === 0) {
      el.innerHTML = '<div class="empty">No tools match. Try clearing the search or picking another category.</div>';
      return;
    }

    var html = '';
    list.forEach(function (t) {
      var checked = state.selected[t.id] ? ' checked' : '';
      var catLabel = Data.categoryLabel(t.category);
      html +=
        '<article class="tool' + (t.user ? ' tool--user' : '') + '">' +
          '<div class="tool__head">' +
            '<h3 class="tool__name">' + esc(t.name) + '</h3>' +
            (t.popular ? '<span class="badge badge--popular">popular</span>' : '') +
            (t.user ? '<span class="badge badge--user">yours</span>' : '') +
            '<span class="badge">' + esc(t.license) + '</span>' +
          '</div>' +
          '<p class="tool__blurb">' + esc(t.blurb) + '</p>' +
          '<div class="tool__meta">' +
            '<span class="tool__cat">' + esc(catLabel) + '</span>' +
            '<span class="tool__replaces">replaces <strong>' + esc(t.replaces) + '</strong></span>' +
            '<span class="tool__price">' + Calc.money(t.price) + '/seat/mo</span>' +
            (t.stars > 0 ? '<span class="tool__stars">★ ' + t.stars + 'k</span>' : '') +
          '</div>' +
          '<div class="tool__actions">' +
            (t.repo ? '<a class="btn btn--sm" href="' + esc(t.repo) + '" target="_blank" rel="noopener">Repo</a>' : '') +
            (t.site ? '<a class="btn btn--sm" href="' + esc(t.site) + '" target="_blank" rel="noopener">Site</a>' : '') +
            (t.user ? '<button class="btn btn--sm btn--danger" data-action="remove" data-id="' + esc(t.id) + '">Remove</button>' : '') +
            '<label class="switch"><input type="checkbox" data-action="select" data-id="' + esc(t.id) + '"' + checked + '>' +
              '<span class="switch__track"><span class="switch__thumb"></span></span><span class="switch__label">Save</span></label>' +
          '</div>' +
        '</article>';
    });
    el.innerHTML = html;
  }

  function renderCalculator() {
    var sel = selectedTools();
    var n = sel.length;
    var team = Math.max(1, Math.floor(state.teamSize));
    var monthly = Calc.monthlySavings(sel, team);
    var annual = Calc.annualSavings(sel, team);
    var bill = Calc.yearlySaaSBill(sel, team);

    $('#calc-count').textContent = n;
    $('#calc-team').value = team;
    $('#calc-team-label').textContent = team;
    $('#calc-monthly').textContent = Calc.money(monthly);
    $('#calc-annual').textContent = Calc.money(annual);
    $('#calc-bill').textContent = Calc.money(bill);
    $('#calc-per-seat').textContent = Calc.money(Calc.annualPerSeat(sel));

    var rows = Calc.byCategory(sel, team);
    var maxAnnual = rows.length ? rows[0].annual : 1;
    var html = '';
    rows.forEach(function (r) {
      var pct = Math.round((r.annual / maxAnnual) * 100);
      html +=
        '<div class="calc-row">' +
          '<div class="calc-row__label">' + esc(r.label) + ' <span class="calc-row__n">' + r.count + '×</span></div>' +
          '<div class="calc-row__bar"><span style="width:' + pct + '%"></span></div>' +
          '<div class="calc-row__val">' + Calc.money(r.annual) + '/yr</div>' +
        '</div>';
    });
    $('#calc-breakdown').innerHTML = html || '<div class="empty">Switch on tools to see the breakdown by category.</div>';
  }

  function renderStatus() {
    $('#storage-label').textContent = Store.backend();
  }

  function renderAll() {
    renderCategories();
    renderList();
    renderCalculator();
    renderStatus();
  }

  // ---------- events (single delegated listener) ----------

  function onSelect(id, checked) {
    if (checked) { state.selected[id] = true; } else { delete state.selected[id]; }
    renderList();
    renderCalculator();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) { return; }
    var action = btn.getAttribute('data-action');

    if (action === 'category') {
      state.category = btn.getAttribute('data-value') || '';
      renderAll();
    } else if (action === 'sort') {
      state.sort = btn.getAttribute('data-value') || 'default';
      $('#sort-select').value = state.sort;
      renderList();
    } else if (action === 'clear') {
      state.query = '';
      state.category = '';
      state.maxPrice = 0;
      $('#search').value = '';
      $('#price-cap').value = 0;
      $('#price-label').textContent = 'Any price';
      renderAll();
    } else if (action === 'remove') {
      Store.removeUserTool(btn.getAttribute('data-id'));
      state.userTools = Store.userTools();
      delete state.selected[btn.getAttribute('data-id')];
      renderAll();
    } else if (action === 'add-tool') {
      addToolForm();
    } else if (action === 'submit-tool') {
      submitTool();
    } else if (action === 'close-modal') {
      $('#modal').hidden = true;
    }
  });

  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'search') {
      state.query = t.value;
      renderList();
    } else if (t.id === 'price-cap') {
      state.maxPrice = Number(t.value) || 0;
      $('#price-label').textContent = state.maxPrice ? '≤ $' + state.maxPrice + '/seat/mo' : 'Any price';
      renderList();
    } else if (t.id === 'sort-select') {
      state.sort = t.value;
      renderList();
    } else if (t.id === 'calc-team') {
      state.teamSize = Math.max(1, Math.floor(Number(t.value) || 1));
      renderCalculator();
    } else if (t.getAttribute('data-action') === 'select') {
      onSelect(t.getAttribute('data-id'), t.checked);
    } else if (t.id === 'category') {
      state.category = t.value || '';
      renderAll();
    }
  });

  // ---------- add-your-own modal ----------

  function addToolForm() {
    var m = $('#modal');
    m.hidden = false;
    $('#modal-title').textContent = 'Add your own tool';
    $('#form-name').value = '';
    $('#form-replaces').value = '';
    $('#form-price').value = '';
    $('#form-cat').innerHTML = Data.CATEGORIES.map(function (c) {
      return '<option value="' + c.id + '">' + c.label + '</option>';
    }).join('');
    $('#form-repo').value = '';
    $('#form-site').value = '';
    $('#form-license').value = '';
    $('#form-blurb').value = '';
    $('#form-error').textContent = '';
    $('#form-name').focus();
  }

  function submitTool() {
    try {
      var tool = Store.normalizeUserTool({
        name: $('#form-name').value,
        replaces: $('#form-replaces').value,
        price: $('#form-price').value,
        category: $('#form-cat').value,
        repo: $('#form-repo').value,
        site: $('#form-site').value,
        license: $('#form-license').value,
        blurb: $('#form-blurb').value
      });
      Store.addUserTool(tool);
      state.userTools = Store.userTools();
      state.selected[tool.id] = true; // default the new one to "on"
      $('#modal').hidden = true;
      state.category = tool.category;
      renderAll();
    } catch (err) {
      $('#form-error').textContent = err.message;
    }
  }

  // ---------- helpers ----------

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ---------- boot ----------
  renderAll();
})(typeof self !== 'undefined' ? self : global);
