(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Sidebar
  const shell = $('#shell');
  $('#collapseBtn')?.addEventListener('click', () => shell.classList.remove('expanded'));
  $('#expandBtn')?.addEventListener('click', () => shell.classList.add('expanded'));

  // Copy buttons
  $$('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const txid = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(txid);
      } catch (_) {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = txid;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
      }
      btn.classList.add('copied');
      const ic = btn.querySelector('svg');
      const original = ic.outerHTML;
      ic.outerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      setTimeout(() => {
        btn.classList.remove('copied');
        const sv = btn.querySelector('svg');
        if (sv) sv.outerHTML = original;
      }, 1400);
    });
  });

  // Back to Swap
  $('#backBtn')?.addEventListener('click', () => {
    // clear pre-selected maker handoff so a fresh swap starts clean
    try { localStorage.removeItem('coinswap:selectedMakers'); } catch (_) {}
    window.location.href = 'Swap.html';
  });

  // Export report (visual stub)
  $('#exportBtn')?.addEventListener('click', () => {
    const b = $('#exportBtn');
    const orig = b.innerHTML;
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="20 6 9 17 4 12"></polyline></svg> Report ready';
    b.classList.add('is-success');
    setTimeout(() => { b.innerHTML = orig; b.classList.remove('is-success'); }, 1800);
  });
})();
