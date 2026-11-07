/* Phase 4 visual effects: no external dependencies. */
(function () {
  'use strict';
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastSecond = null;
  let toastTimeout;
  let confettiTimeout;
  function replay(el, name) {
    if (!el || reduceMotion()) return;
    el.classList.remove(name);
    void el.offsetWidth;
    el.classList.add(name);
  }
  window.phase4TimerTick = function (seconds, active) {
    const timer = document.getElementById('game-timer');
    if (!timer) return;
    timer.classList.toggle('p4-urgent', Boolean(active && seconds > 0 && seconds <= 5) && !reduceMotion());
    if (seconds !== lastSecond && active && seconds <= 10 && seconds > 0) replay(timer, 'p4-tick');
    lastSecond = seconds;
  };
  window.phase4ComboCelebrate = function (count) {
    const box = document.getElementById('combo-box');
    replay(box, 'p4-combo-pop');
    if (count >= 3 && (count === 3 || count === 5 || count % 10 === 0)) {
      const label = count >= 10 ? '🚀 ԱՆՀԱՎԱՆԱԿԱՆ COMBO x' : count >= 5 ? '🔥 SUPER COMBO x' : '⚡ COMBO x';
      showToast(label + count);
    }
  };
  function showToast(message) {
    if (reduceMotion()) return;
    document.querySelectorAll('.p4-toast').forEach(el => el.remove());
    clearTimeout(toastTimeout);
    const el = document.createElement('div');
    el.className = 'p4-toast';
    el.setAttribute('role', 'status');
    el.textContent = message;
    document.body.appendChild(el);
    toastTimeout = setTimeout(() => el.remove(), 1400);
  }
  window.phase4WinnerCelebrate = function (isDraw) {
    const screen = document.getElementById('winner-screen');
    if (!screen) return;
    screen.classList.toggle('p4-draw', Boolean(isDraw));
    document.querySelectorAll('.p4-celebration-layer').forEach(el => el.remove());
    clearTimeout(confettiTimeout);
    if (reduceMotion()) return;
    const layer = document.createElement('div');
    layer.className = 'p4-celebration-layer';
    layer.setAttribute('aria-hidden', 'true');
    const colors = ['#ffd166', '#06d6a0', '#118ab2', '#ef476f', '#a78bfa', '#ffffff'];
    const count = isDraw ? 36 : 80;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('span');
      piece.className = 'p4-confetti';
      piece.style.left = (Math.random() * 100) + '%';
      piece.style.backgroundColor = colors[i % colors.length];
      piece.style.setProperty('--delay', (Math.random() * .85) + 's');
      piece.style.setProperty('--duration', (2.4 + Math.random() * 1.9) + 's');
      piece.style.setProperty('--drift', ((Math.random() - .5) * 240) + 'px');
      piece.style.setProperty('--spin', (360 + Math.random() * 900) + 'deg');
      layer.appendChild(piece);
    }
    document.body.appendChild(layer);
    confettiTimeout = setTimeout(() => layer.remove(), 5500);
  };
})();
