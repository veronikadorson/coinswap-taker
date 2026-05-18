(function () {
  'use strict';

  // ===== Data =====
  const SWAPPABLE_SATS = 1248300;

  const UTXOS = [
    { id: '7fa2e1c8…b3d291',  amt: 425000, script: 'taproot' },
    { id: 'c4e90b3a…7d12fe',  amt: 318450, script: 'segwit' },
    { id: '2a9bf014…ce7741',  amt: 285200, script: 'taproot' },
    { id: '91d7ae28…0a55b6',  amt: 142800, script: 'segwit' },
    { id: '6e0c5fa1…d28a07',  amt: 51400,  script: 'taproot' },
    { id: '8b34f7c2…9e2103',  amt: 25450,  script: 'segwit' }
  ];

  // Rich maker pool (same identities as Market.js, with metadata).
  const MAKER_POOL = [
    { tor: 'vdd56fff7q3eqx9ntm2p8h4wjk2nrfsvxhq3wsa6rfbg5vh4n2ehb78b.onion', feeRate: 0.030, fidelityBond: 0.05 },
    { tor: 'kp8a3rnxc2yt9whdq5mq4z8e7vw6tp2lknfa7s3xrgvc4nh2m6xrk78b.onion', feeRate: 0.050, fidelityBond: 0.18 },
    { tor: 'bn4qrxh3w8vkpa2eyc7zmt5l9fdsu6pj1xhg0wskrf3vc2yh8n6e4ax78.onion', feeRate: 0.025, fidelityBond: 0.41 },
    { tor: 'j2mkrxh9w5vpc6qy8tn4z7l3fd2us8pj1xhgwm0vskrf3yc6h4n6e8ax78.onion', feeRate: 0.020, fidelityBond: 0.09 },
    { tor: 'tr7wkxh3w6vpc9qy2tn4z8l3fd2us5pj7xhgwm0vskrf3yc6h4n6e8ax78.onion', feeRate: 0.040, fidelityBond: 0.27 },
    { tor: 'lm9wkxh4w8vpc2qy5tn7z3l9fd4us6pj1xhgwm0vskrf3yc6h4n6e8ax78.onion', feeRate: 0.035, fidelityBond: 0.34 },
    { tor: 'qx2vkxh5w7vpc8qy3tn2z6l5fd9us8pj2xhgwm0vskrf3yc6h4n6e8ax78.onion', feeRate: 0.045, fidelityBond: 0.12 },
    { tor: 'ay6vkxh2w4vpc5qy7tn8z1l4fd6us3pj5xhgwm0vskrf3yc6h4n6e8ax78.onion', feeRate: 0.060, fidelityBond: 0.85 }
  ];

  // ===== State =====
  const state = {
    unit: 'sats',
    activePicker: 'utxo',           // utxo | maker
    utxoMode: 'auto',               // auto | manual
    makerMode: 'auto',              // auto | manual
    hops: 3,
    amountSats: 0,
    manualUtxos: new Set(),
    manualMakers: new Set()         // set of tor addresses
  };

  // Read pre-selected makers from Market page
  try {
    const raw = localStorage.getItem('coinswap:selectedMakers');
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length) {
        arr.forEach(t => state.manualMakers.add(t));
        state.makerMode = 'manual';
        state.activePicker = 'maker';
      }
    }
  } catch (_) {}

  // ===== Helpers =====
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmtSats = (n) => Math.round(n).toLocaleString('en-US');
  const fmtBTC = (n) => (n / 1e8).toFixed(8);
  const truncTor = (t) => t.length <= 26 ? t : t.slice(0, 10) + '…' + t.slice(-12);

  function parseAmount(raw) {
    if (!raw) return 0;
    const cleaned = raw.replace(/,/g, '').trim();
    const v = parseFloat(cleaned);
    if (Number.isNaN(v) || v < 0) return 0;
    return state.unit === 'sats' ? Math.floor(v) : Math.floor(v * 1e8);
  }

  // ===== Sidebar =====
  const shell = $('#shell');
  $('#collapseBtn').addEventListener('click', () => shell.classList.remove('expanded'));
  $('#expandBtn').addEventListener('click', () => shell.classList.add('expanded'));

  // ===== Unit toggle =====
  const amountInput = $('#amount');
  $$('#unitSeg button').forEach(b => {
    b.addEventListener('click', () => {
      const u = b.dataset.unit;
      if (u === state.unit) return;
      const sats = state.amountSats;
      state.unit = u;
      $$('#unitSeg button').forEach(x => x.classList.toggle('active', x === b));
      if (sats === 0) amountInput.value = '';
      else amountInput.value = u === 'sats' ? fmtSats(sats) : fmtBTC(sats);
      updateMaxLink();
      recompute();
    });
  });

  amountInput.addEventListener('input', () => {
    state.amountSats = parseAmount(amountInput.value);
    recompute();
  });

  $('#maxLink').addEventListener('click', (e) => {
    e.preventDefault();
    state.amountSats = SWAPPABLE_SATS;
    amountInput.value = state.unit === 'sats' ? fmtSats(SWAPPABLE_SATS) : fmtBTC(SWAPPABLE_SATS);
    recompute();
  });

  function updateMaxLink() {
    const display = state.unit === 'sats'
      ? `${fmtSats(SWAPPABLE_SATS)} sats`
      : `${fmtBTC(SWAPPABLE_SATS)} BTC`;
    $('#maxLink').textContent = `Use max swappable: ${display}`;
  }

  // ===== Picker tabs =====
  $$('#pickerTabs button').forEach(b => {
    b.addEventListener('click', () => {
      const t = b.dataset.tab;
      state.activePicker = t;
      $$('#pickerTabs button').forEach(x => x.classList.toggle('active', x === b));
      $('#utxoPanel').hidden = t !== 'utxo';
      $('#makerPanel').hidden = t !== 'maker';
      $('#pickerTitle').textContent = t === 'utxo' ? 'Select UTXOs' : 'Select Makers';
      recompute();
    });
  });

  // ===== Auto/Manual sub-toggle (handles both UTXO and Maker) =====
  $$('.am-links').forEach(group => {
    const target = group.dataset.target; // 'utxo' | 'maker'
    group.querySelectorAll('a').forEach(b => {
      b.addEventListener('click', (e) => {
        e.preventDefault();
        const m = b.dataset.mode;
        if (target === 'utxo') {
          if (m === state.utxoMode) return;
          state.utxoMode = m;
          group.querySelectorAll('a').forEach(x => x.classList.toggle('active', x === b));
          $('#autoNote').hidden = m !== 'auto';
          $('#manualPanel').hidden = m !== 'manual';
          if (m === 'manual' && state.manualUtxos.size === 0) {
            [...UTXOS].sort((a, b) => b.amt - a.amt).slice(0, 3).forEach(u => state.manualUtxos.add(u.id));
            renderUtxoList();
          }
        } else {
          if (m === state.makerMode) return;
          state.makerMode = m;
          group.querySelectorAll('a').forEach(x => x.classList.toggle('active', x === b));
          $('#makerAutoNote').hidden = m !== 'auto';
          $('#makerManualPanel').hidden = m !== 'manual';
          if (m === 'manual' && state.manualMakers.size === 0) {
            [...MAKER_POOL].sort((a, b) => a.feeRate - b.feeRate).slice(0, 3).forEach(m => state.manualMakers.add(m.tor));
          }
          renderMakerList();
        }
        recompute();
      });
    });
  });

  // Apply initial visibility from state (pre-fill from Market)
  function applyInitialPanelState() {
    // UTXO sub-toggle
    $$('.am-links[data-target="utxo"] a').forEach(b => b.classList.toggle('active', b.dataset.mode === state.utxoMode));
    $('#autoNote').hidden = state.utxoMode !== 'auto';
    $('#manualPanel').hidden = state.utxoMode !== 'manual';
    // Maker sub-toggle
    $$('.am-links[data-target="maker"] a').forEach(b => b.classList.toggle('active', b.dataset.mode === state.makerMode));
    $('#makerAutoNote').hidden = state.makerMode !== 'auto';
    $('#makerManualPanel').hidden = state.makerMode !== 'manual';
    // Top tabs
    $$('#pickerTabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === state.activePicker));
    $('#utxoPanel').hidden = state.activePicker !== 'utxo';
    $('#makerPanel').hidden = state.activePicker !== 'maker';
    $('#pickerTitle').textContent = state.activePicker === 'utxo' ? 'Select UTXOs' : 'Select Makers';
  }

  // ===== UTXO list =====
  function renderUtxoList() {
    const list = $('#utxoList');
    list.innerHTML = UTXOS.map(u => {
      const checked = state.manualUtxos.has(u.id);
      return `
        <label class="utxo-item ${checked ? 'checked' : ''}" data-id="${u.id}">
          <span class="checkbox">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </span>
          <span class="utxo-id">${u.id}</span>
          <span class="pill ${u.script}">${u.script === 'taproot' ? 'Taproot' : 'SegWit'}</span>
          <span class="utxo-amt">${fmtSats(u.amt)}<span class="u">sats</span></span>
        </label>
      `;
    }).join('');
    list.querySelectorAll('.utxo-item').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const id = el.dataset.id;
        if (state.manualUtxos.has(id)) state.manualUtxos.delete(id);
        else state.manualUtxos.add(id);
        renderUtxoList();
        recompute();
      });
    });
    const total = UTXOS.filter(u => state.manualUtxos.has(u.id)).reduce((s, u) => s + u.amt, 0);
    $('#manualTotal').textContent = `${fmtSats(total)} sats`;
  }

  // ===== Maker list =====
  function renderMakerList() {
    const list = $('#makerList');
    list.innerHTML = MAKER_POOL.map(m => {
      const checked = state.manualMakers.has(m.tor);
      return `
        <label class="utxo-item ${checked ? 'checked' : ''}" data-tor="${m.tor}">
          <span class="checkbox">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </span>
          <span class="maker-tor" title="${m.tor}">${truncTor(m.tor)}</span>
          <span class="mk-meta">Fee <span class="v">${m.feeRate.toFixed(3)}</span></span>
          <span class="mk-bond">${m.fidelityBond.toFixed(3)}<span class="u">bond</span></span>
        </label>
      `;
    }).join('');
    list.querySelectorAll('.utxo-item').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const tor = el.dataset.tor;
        if (state.manualMakers.has(tor)) state.manualMakers.delete(tor);
        else state.manualMakers.add(tor);
        renderMakerList();
        recompute();
      });
    });
    $('#makerManualTotal').textContent = `${state.manualMakers.size} maker${state.manualMakers.size === 1 ? '' : 's'}`;
  }

  // ===== Hops =====
  $$('#hops .hop-btn').forEach(b => {
    b.addEventListener('click', () => {
      const h = b.dataset.h;
      state.hops = h === 'custom' ? 6 : parseInt(h, 10);
      $$('#hops .hop-btn').forEach(x => x.classList.toggle('active', x === b));
      recompute();
    });
  });

  // ===== Recompute summary =====
  function recompute() {
    const amt = state.amountSats;
    const hops = state.hops;

    // Determine effective maker count + candidate list
    let makers, makerCandidates;
    if (state.makerMode === 'manual' && state.manualMakers.size > 0) {
      const selected = MAKER_POOL.filter(m => state.manualMakers.has(m.tor));
      makers = selected.length;
      makerCandidates = selected.map(m => m.tor);
    } else {
      makers = hops;
      makerCandidates = MAKER_POOL.slice(0, hops).map(m => m.tor);
    }

    // Picker section meta
    const utxoSelectedSats = state.utxoMode === 'auto'
      ? SWAPPABLE_SATS
      : UTXOS.filter(u => state.manualUtxos.has(u.id)).reduce((s, u) => s + u.amt, 0);
    const utxoCountTxt = state.utxoMode === 'auto'
      ? 'Auto · 3 selected'
      : `Manual · ${state.manualUtxos.size} selected`;
    const makerCountTxt = state.makerMode === 'auto'
      ? `Auto · ${hops} from pool`
      : `Manual · ${state.manualMakers.size} selected`;

    $('#pickerCount').textContent = state.activePicker === 'utxo' ? utxoCountTxt : makerCountTxt;
    $('#pickerUtxoN').textContent = state.utxoMode === 'auto' ? '3' : state.manualUtxos.size;
    $('#pickerMakerN').textContent = state.makerMode === 'auto' ? hops : state.manualMakers.size;
    $('#autoSummary').textContent = `3 UTXOs · ${fmtSats(SWAPPABLE_SATS)} sats`;
    $('#makerAutoSummary').textContent = `${hops} maker${hops === 1 ? '' : 's'} from ${MAKER_POOL.length} candidates`;

    // Hops side label + warning
    $('#hopMakers').textContent = `${makers} maker${makers === 1 ? '' : 's'} required`;
    const help = $('#hopHelp');
    if (hops === 2) {
      help.className = 'hop-help warn';
      help.innerHTML = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> With 2 hops, a colluding maker could deanonymize the swap. 3+ is recommended.';
    } else {
      help.className = 'hop-help';
      help.textContent = 'More hops = better privacy, higher fees.';
    }

    // Summary
    $('#sHops').textContent = hops;
    $('#sMakers').textContent = `${makers} selected`;
    $('#sMakerList').innerHTML = makerCandidates.length
      ? makerCandidates.slice(0, Math.max(hops, 3)).map(t => `<span class="m">${truncTor(t)}</span>`).join('')
      : '<span class="m dim">None selected</span>';

    const fundTx = hops;
    const avgSize = 220 + (hops * 20);
    $('#sFundTx').textContent = fundTx;
    $('#sAvgSize').innerHTML = `${avgSize} <span class="u">vB</span>`;

    const netRate = 2;
    const netFee = fundTx * avgSize * netRate;
    $('#fNet').innerHTML = `${fmtSats(netFee)} <span class="u">sats</span><span class="sub">${netRate} sat/vB</span>`;

    const makerFeeRate = 0.0003 * makers;
    const makerFee = Math.round(amt * makerFeeRate);
    $('#fMaker').innerHTML = `${fmtSats(makerFee)} <span class="u">sats</span>`;
    $('#fMaker').classList.toggle('muted', amt === 0);

    const totalFee = netFee + makerFee;
    $('#fTotal').innerHTML = `${fmtSats(totalFee)} <span class="u">sats</span>`;

    $('#sAmt').innerHTML = `${fmtSats(amt)} <span class="u">sats</span>`;
    $('#sAmt').classList.toggle('muted', amt === 0);

    const etaSec = 30 + hops * 30;
    const mEta = Math.floor(etaSec / 60);
    const sEta = etaSec % 60;
    $('#sEta').textContent = `${mEta}m ${sEta.toString().padStart(2,'0')}s`;

    const receive = Math.max(0, amt - totalFee);
    $('#sReceive').innerHTML = `${fmtSats(receive)}<span class="u">sats</span>`;

    $('#amtConv').textContent = state.unit === 'sats'
      ? `= ${fmtBTC(amt)} BTC`
      : `= ${fmtSats(amt)} sats`;

    // Validation
    const startBtn = $('#startBtn');
    const ctaHint = $('#ctaHint');
    const amtHint = $('#amtHint');
    let valid = true, reason = '';

    if (amt === 0) { valid = false; reason = 'Enter an amount to begin'; }
    else if (amt > SWAPPABLE_SATS) { valid = false; reason = 'Amount exceeds swappable balance'; }
    else if (state.utxoMode === 'manual' && state.manualUtxos.size === 0) { valid = false; reason = 'Pick at least one UTXO'; }
    else if (state.utxoMode === 'manual' && utxoSelectedSats < amt) { valid = false; reason = 'Selected UTXOs are less than swap amount'; }
    else if (state.makerMode === 'manual' && state.manualMakers.size === 0) { valid = false; reason = 'Pick at least one maker'; }

    if (valid) {
      startBtn.removeAttribute('disabled');
      startBtn.classList.remove('is-disabled');
      ctaHint.textContent = `Routing ${fmtSats(amt)} sats through ${hops} hop${hops === 1 ? '' : 's'}`;
      ctaHint.classList.remove('err');
      amtHint.textContent = 'Enter the amount you want to send through the swap.';
      amtHint.classList.remove('err');
    } else {
      startBtn.setAttribute('disabled', '');
      startBtn.classList.add('is-disabled');
      ctaHint.textContent = reason;
      ctaHint.classList.add('err');
      if (amt > SWAPPABLE_SATS) {
        amtHint.textContent = reason; amtHint.classList.add('err');
      } else {
        amtHint.textContent = 'Enter the amount you want to send through the swap.';
        amtHint.classList.remove('err');
      }
    }
  }

  $('#startBtn').addEventListener('click', () => {
    if ($('#startBtn').hasAttribute('disabled')) return;
    window.location.href = 'SwapProgress.html';
  });

  // ===== Init =====
  applyInitialPanelState();
  renderUtxoList();
  renderMakerList();
  updateMaxLink();
  recompute();
})();
