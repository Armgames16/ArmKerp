/* ARM ԿԵՐՊ 1.0 — accessible navigation. Existing game IDs and logic are unchanged. */
(() => {
  'use strict';
  const names = ['local', 'online', 'friends', 'rewards'];
  const buttons = [];
  function activate(name, focus = false) {
    if (!names.includes(name)) name = 'local';
    names.forEach(id => {
      const panel = document.getElementById('p20-' + id);
      const button = document.getElementById('p20-tab-' + id);
      const selected = id === name;
      if (panel) { panel.hidden = !selected; panel.classList.toggle('is-active', selected); }
      if (button) {
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
        if (selected && focus) button.focus();
      }
    });
    try { sessionStorage.setItem('armkerp_active_tab_v1', name); } catch (_) { /* storage disabled */ }
  }
  document.addEventListener('DOMContentLoaded', () => {
    const tablist = document.querySelector('.p20-tabs');
    if (!tablist) return;
    names.forEach(name => {
      const button = document.getElementById('p20-tab-' + name);
      if (!button) return;
      buttons.push(button);
      button.addEventListener('click', () => activate(name));
    });
    tablist.addEventListener('keydown', event => {
      const current = names.indexOf(document.activeElement?.dataset?.p20Tab);
      if (current < 0) return;
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!step && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? names.length - 1 : (current + step + names.length) % names.length;
      activate(names[next], true);
    });
    document.querySelectorAll('[data-p20-open]').forEach(button => {
      button.addEventListener('click', () => activate(button.dataset.p20Open, true));
    });
    let saved = 'local';
    try { saved = sessionStorage.getItem('armkerp_active_tab_v1') || 'local'; } catch (_) { /* storage disabled */ }
    activate(saved);
  });
})();
