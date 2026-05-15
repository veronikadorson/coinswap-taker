(function () {
  'use strict';

  // ===== Data =====
  const goodMakers = [
    { tor: 'vdd56fff7q3eqx9ntm2p8h4wjk2nrfsvxhq3wsa6rfbg5vh4n2ehb78b.onion', baseFee: 0.00001, feeRate: 0.03, timeRate: 0.0005, minSwap: 0.001, maxSwap: 1.0,  fidelityBond: 0.05 },
    { tor: 'kp8a3rnxc2yt9whdq5mq4z8e7vw6tp2lknfa7s3xrgvc4nh2m6xrk78b.onion', baseFee: 0.00002, feeRate: 0.05, timeRate: 0.0004, minSwap: 0.005, maxSwap: 2.5,  fidelityBond: 0.18 },
    { tor: 'bn4qrxh3w8vkpa2eyc7zmt5l9fdsu6pj1xhg0wskrf3vc2yh8n6e4ax78.onion', baseFee: 0.00001, feeRate: 0.025, timeRate: 0.0003, minSwap: 0.01,  maxSwap: 5.0,  fidelityBond: 0.41 },
    { tor: 'j2mkrxh9w5vpc6qy8tn4z7l3fd2us8pj1xhgwm0vskrf3yc6h4n6e8ax78.onion', baseFee: 0.000005, feeRate: 0.02, timeRate: 0.0006, minSwap: 0.002, maxSwap: 1.5,  fidelityBond: 0.09 },
    { tor: 'tr7wkxh3w6vpc9qy2tn4z8l3fd2us5pj7xhgwm0vskrf3yc6h4n6e8ax78.onion', baseFee: 0.000015, feeRate: 0.04, timeRate: 0.0005, minSwap: 0.005, maxSwap: 3.0,  fidelityBond: 0.27 },
    { tor: 'lm9wkxh4w8vpc2qy5tn7z3l9fd4us6pj1xhgwm0vskrf3yc6h4n6e8ax78.onion', baseFee: 0.00002, feeRate: 0.035, timeRate: 0.0004, minSwap: 0.01,  maxSwap: 4.0,  fidelityBond: 0.34 },
    { tor: 'qx2vkxh5w7vpc8qy3tn2z6l5fd9us8pj2xhgwm0vskrf3yc6h4n6e8ax78.onion', baseFee: 0.00001, feeRate: 0.045, timeRate: 0.0007, minSwap: 0.005, maxSwap: 2.0,  fidelityBond: 0.12 },
    { tor: 'ay6vkxh2w4vpc5qy7tn8z1l4fd6us3pj5xhgwm0vskrf3yc6h4n6e8ax78.onion', baseFee: 0.00003, feeRate: 0.06, timeRate: 0.0008, minSwap: 0.02,  maxSwap: 10.0, fidelityBond: 0.85 }
  ];

  const badMakers = [
    { tor: 'fk2bkxh8w3vpc4qy9tn1z5l2fd7us4pj9xhgwm0vskrf3yc6h4n6e8ax78.onion', reason: 'Invalid fidelity proof', lastSeen: '2 h ago', flagged: '12 h ago' },
    { tor: 'gp5bkxh1w6vpc7qy4tn3z9l8fd1us2pj6xhgwm0vskrf3yc6h4n6e8ax78.onion', reason: 'Fee schema mismatch',  lastSeen: '47 m ago', flagged: '3 h ago' }
  ];

  const unresMakers = []; // demonstrates empty state

  // ===== State =====
  let activeTab = 'good';
  let openMakerIdx = null;
  const selectedMakers = new Set();
  let sortKey = null;
  let sortDir = 'asc'; // 'asc' | 'desc'

  // ===== Helpers =====
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const fmtBTC = (n, digits = 8) => {
    if (n === 0) return '0';
    const s = n.toFixed(digits);
    // trim trailing zeros, but keep at least 2 decimals
    return s.replace(/0+$/, '').replace(/\.$/, '.0');
  };
  const fmtBTCShort = (n) => {
    if (n >= 1) return n.toFixed(4);
    if (n >= 0.01) return n.toFixed(5);
    return n.toFixed(8).replace(/0+$/, '').replace(/\.$/, '.0');
  };
  const truncTor = (t) => {
    if (t.length <= 28) return t;
    return t.slice(0, 10) + '…' + t.slice(-12);
  };

  // ===== Sidebar toggle =====
  const shell = $('#shell');
  $('#collapseBtn').addEventListener('click', () => shell.classList.remove('expanded'));
  $('#expandBtn').addEventListener('click', () => shell.classList.add('expanded'));

  // ===== Refresh button (visual only) =====
  $('#refreshBtn').addEventListener('click', () => {
    $('#lastPoll').textContent = 'Synced just now';
  });

  // ===== Render table =====
  const tableEl = $('#table');
  const headEl = $('#tableHead');
  const rowsEl = $('#tableRows');
  const scrollEl = $('#tableScroll');
  const footMeta = $('#footMeta');

  const COLS = {
    good: [
      { k: 'check',       label: '' },
      { k: 'tor',         label: 'Tor Address' },
      { k: 'baseFee',     label: 'Base Fee',      sortable: true },
      { k: 'feeRate',     label: 'Fee Rate',      sortable: true },
      { k: 'timeRate',    label: 'Time Rate',     sortable: true },
      { k: 'minSwap',     label: 'Min Swap',      sortable: true },
      { k: 'maxSwap',     label: 'Max Swap',      sortable: true },
      { k: 'fidelityBond',label: 'Fidelity Bond', sortable: true },
      { k: 'fee',         label: 'Fee', align: 'right' }
    ],
    bad: [
      { k: 'tor',      label: 'Tor Address' },
      { k: 'reason',   label: 'Reason' },
      { k: 'flagged',  label: 'Flagged' },
      { k: 'lastSeen', label: 'Last Seen' },
      { k: 'action',   label: 'Action', align: 'right' }
    ],
    unres: [
      { k: 'tor',      label: 'Tor Address' },
      { k: 'lastTry',  label: 'Last Attempt' },
      { k: 'retries',  label: 'Retries' },
      { k: 'timeout',  label: 'Timeout' },
      { k: 'action',   label: 'Action', align: 'right' }
    ]
  };

  const EXT_SVG = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"></path><path d="M20 4L10 14"></path><path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6"></path></svg>';

  const SORT_ARROW = '<span class="sort-ic">' +
    '<svg class="up" viewBox="0 0 8 4" fill="currentColor"><polygon points="4,0 8,4 0,4"/></svg>' +
    '<svg class="down" viewBox="0 0 8 4" fill="currentColor"><polygon points="0,0 8,0 4,4"/></svg>' +
    '</span>';

  function renderHead() {
    headEl.innerHTML = COLS[activeTab].map(c => {
      const align = c.align === 'right' ? ' right' : '';
      if (c.sortable) {
        const active = sortKey === c.k;
        const cls = `col sortable${align}${active ? ' active ' + sortDir : ''}`;
        return `<div class="${cls}" data-sort="${c.k}">${c.label}${SORT_ARROW}</div>`;
      }
      return `<div class="col${align}">${c.label}</div>`;
    }).join('');

    // wire sort clicks
    $$('.col.sortable', headEl).forEach(el => {
      el.addEventListener('click', () => {
        const k = el.dataset.sort;
        if (sortKey === k) {
          sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          sortKey = k;
          sortDir = 'asc';
        }
        renderRows();
      });
    });
  }

  function torCell(addr) {
    return `<div class="tor">
      <span class="addr" title="${addr}">${truncTor(addr)}</span>
    </div>`;
  }

  function renderRows() {
    tableEl.setAttribute('data-tab', activeTab);
    renderHead();

    let data, emptyHtml;
    if (activeTab === 'good') {
      data = goodMakers.slice();
      if (sortKey) {
        data.sort((a, b) => {
          const av = a[sortKey];
          const bv = b[sortKey];
          return sortDir === 'asc' ? av - bv : bv - av;
        });
      }
    }
    else if (activeTab === 'bad') data = badMakers;
    else data = unresMakers;

    if (!data.length) {
      rowsEl.innerHTML = emptyStateHtml(activeTab);
      footMeta.textContent = activeTab === 'good' ? '0 selected' : '0 makers';
      if (swapSelectedBtn) {
        swapSelectedBtn.style.display = activeTab === 'good' ? '' : 'none';
      }
      return;
    }

    if (swapSelectedBtn) {
      swapSelectedBtn.style.display = activeTab === 'good' ? '' : 'none';
    }

    if (activeTab === 'good') {
      rowsEl.innerHTML = data.map((m) => {
        const origI = goodMakers.indexOf(m);
        const sel = selectedMakers.has(origI);
        return `
        <div class="table-row ${sel ? 'selected' : ''}" data-i="${origI}">
          <span class="row-check" data-check="${origI}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </span>
          ${torCell(m.tor)}
          <span class="val">${fmtBTCShort(m.baseFee)}</span>
          <span class="val">${m.feeRate.toFixed(3)}</span>
          <span class="val">${m.timeRate.toFixed(4)}</span>
          <span class="val muted">${fmtBTCShort(m.minSwap)}</span>
          <span class="val muted">${fmtBTCShort(m.maxSwap)}</span>
          <span class="val muted fb-cell">
            ${fmtBTCShort(m.fidelityBond)}
            <a href="#" class="fb-link" title="View bond on mempool.space" onclick="event.preventDefault(); event.stopPropagation();">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"></path><path d="M20 4L10 14"></path><path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6"></path></svg>
            </a>
          </span>
          <a href="#" class="calc-link" data-calc="${origI}" onclick="event.preventDefault(); event.stopPropagation();">Calculate</a>
        </div>
      `;}).join('');
      // wire checkboxes (clicking anywhere on the row toggles, except calc/fb-link)
      $$('.table-row[data-i]', rowsEl).forEach(row => {
        row.addEventListener('click', (e) => {
          if (e.target.closest('.calc-link') || e.target.closest('.fb-link')) return;
          const i = parseInt(row.dataset.i, 10);
          if (selectedMakers.has(i)) selectedMakers.delete(i);
          else selectedMakers.add(i);
          renderRows();
        });
      });
      updateSelectionUI();
    } else if (activeTab === 'bad') {
      rowsEl.innerHTML = data.map((m) => `
        <div class="table-row">
          ${torCell(m.tor)}
          <span><span class="pill red">${m.reason}</span></span>
          <span class="val dim">${m.flagged}</span>
          <span class="val dim">${m.lastSeen}</span>
          <a href="#" class="calc-link" onclick="event.preventDefault()">Re-test</a>
        </div>
      `).join('');
      footMeta.textContent = `Showing ${data.length} of ${data.length}`;
    } else {
      rowsEl.innerHTML = data.map((m) => `
        <div class="table-row">
          ${torCell(m.tor)}
          <span class="val dim">${m.lastTry}</span>
          <span class="val dim">${m.retries}</span>
          <span class="val">${m.timeout}</span>
          <a href="#" class="calc-link" onclick="event.preventDefault()">Retry</a>
        </div>
      `).join('');
      footMeta.textContent = `Showing ${data.length} of ${data.length}`;
    }

    // Wire Calculate links
    $$('[data-calc]', rowsEl).forEach(el => {
      el.addEventListener('click', () => openModal(parseInt(el.dataset.calc, 10)));
    });
  }

  function emptyStateHtml(tab) {
    const copy = {
      good: {
        title: 'No good makers right now',
        why: 'No makers have completed a healthy handshake in this polling window.',
        reasons: ['Tor circuit still warming up', 'Node not fully synced', 'Network reachability degraded']
      },
      bad: {
        title: 'No flagged makers',
        why: 'No makers have failed validation in the last 24 hours. That\'s a good thing.',
        reasons: []
      },
      unres: {
        title: 'No unresponsive makers',
        why: 'Every polled maker has answered within the timeout window.',
        reasons: ['Tor circuit healthy', 'All known peers reachable']
      }
    }[tab];

    const reasonsHtml = copy.reasons.length
      ? `<ul class="reasons">${copy.reasons.map(r => `<li>${r}</li>`).join('')}</ul>`
      : '';

    return `
      <div class="empty">
        <div class="empty-mark">
          <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M12 8v4"></path>
            <circle cx="12" cy="16" r="0.6" fill="currentColor"></circle>
          </svg>
        </div>
        <h4>${copy.title}</h4>
        <p class="why">${copy.why}</p>
        ${reasonsHtml}
        <div class="empty-actions">
          <button class="btn sm" onclick="document.getElementById('refreshBtn').click()">Refresh</button>
        </div>
      </div>
    `;
  }

  // ===== Tab switching =====
  $$('#tabs .tab').forEach(t => {
    t.addEventListener('click', () => {
      activeTab = t.dataset.tab;
      $$('#tabs .tab').forEach(x => x.classList.toggle('active', x === t));
      renderRows();
      scrollEl.scrollTop = 0;
    });
  });

  // ===== Modal =====
  const backdrop = $('#modalBackdrop');
  const swapInput = $('#swapAmount');
  const lockInput = $('#locktimePos');

  function openModal(i) {
    openMakerIdx = i;
    const m = goodMakers[i];
    $('#modalMaker').textContent = m.tor;
    $('#modalMaker').title = m.tor;
    $('#rangeHint').textContent = `${fmtBTCShort(m.minSwap)} – ${fmtBTCShort(m.maxSwap)}`;
    // default swap amount: midpoint clamped
    const mid = Math.min(Math.max(0.1, m.minSwap), m.maxSwap);
    swapInput.value = mid.toFixed(3);
    swapInput.min = m.minSwap;
    swapInput.max = m.maxSwap;
    lockInput.value = 0;
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add('open'));
    recalc();
  }

  function closeModal() {
    backdrop.classList.remove('open');
    setTimeout(() => { backdrop.hidden = true; openMakerIdx = null; }, 200);
  }

  $('#modalClose').addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !backdrop.hidden) closeModal(); });

  function recalc() {
    if (openMakerIdx === null) return;
    const m = goodMakers[openMakerIdx];
    const amt = Math.max(0, parseFloat(swapInput.value) || 0);
    const n = Math.max(0, parseInt(lockInput.value, 10) || 0);
    const locktime = 20 * (n + 1);

    const base = m.baseFee;
    const vol = amt * (m.feeRate / 100);
    const time = locktime * amt * (m.timeRate / 100);
    const total = base + vol + time;
    const pct = amt > 0 ? (total / amt) * 100 : 0;

    $('#locktimeHint').textContent = `${locktime} blocks`;
    $('#bdBase').textContent = 'Fixed maker fee';
    $('#bdVol').textContent = `${fmtBTCShort(amt)} × ${m.feeRate.toFixed(3)} fee rate`;
    $('#bdTime').textContent = `${locktime} × ${fmtBTCShort(amt)} × ${m.timeRate.toFixed(4)} time rate`;
    $('#bdPct').textContent = `${pct.toFixed(4)} of swap amount`;

    $('#vBase').innerHTML = `${fmtBTC(base)}`;
    $('#vVol').innerHTML = `${fmtBTC(vol)}`;
    $('#vTime').innerHTML = `${fmtBTC(time)}`;
    $('#vTotal').innerHTML = `${fmtBTC(total)}`;
  }

  swapInput.addEventListener('input', recalc);
  lockInput.addEventListener('input', recalc);

  // ===== Swap with selected makers =====
  const swapSelectedBtn = $('#swapSelectedBtn');
  function updateSelectionUI() {
    const n = selectedMakers.size;
    if (activeTab === 'good') {
      footMeta.textContent = n === 0 ? '0 selected' : `${n} maker${n === 1 ? '' : 's'} selected`;
    }
    if (n === 0) {
      swapSelectedBtn.setAttribute('disabled', '');
      swapSelectedBtn.classList.add('is-disabled');
    } else {
      swapSelectedBtn.removeAttribute('disabled');
      swapSelectedBtn.classList.remove('is-disabled');
    }
  }
  swapSelectedBtn.addEventListener('click', () => {
    if (selectedMakers.size === 0) return;
    const tors = [...selectedMakers].map(i => goodMakers[i].tor);
    try { localStorage.setItem('coinswap:selectedMakers', JSON.stringify(tors)); } catch (_) {}
    window.location.href = 'Swap.html';
  });

  // ===== Init =====
  renderRows();
})();
