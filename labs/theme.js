/* Share the same theme preference as the main Lottery Insight UI. */
(() => {
  'use strict';
  function read() { try { return localStorage.getItem('lottery-theme') === 'dark' ? 'dark' : 'light'; } catch (_) { return 'light'; } }
  function apply(value) {
    const dark = value === 'dark';
    document.body.classList.toggle('dark', dark);
    const b = document.getElementById('themeBtn');
    b.textContent = dark ? '☀️' : '🌙';
    b.setAttribute('aria-label', dark ? 'เปลี่ยนเป็น Light Mode' : 'เปลี่ยนเป็น Dark Mode');
    b.setAttribute('aria-pressed', String(dark));
  }
  document.addEventListener('DOMContentLoaded', () => {
    apply(read());
    document.getElementById('themeBtn').addEventListener('click', () => {
      const next = document.body.classList.contains('dark') ? 'light' : 'dark';
      try { localStorage.setItem('lottery-theme', next); } catch (_) {}
      apply(next);
    });
    window.addEventListener('storage', e => { if (e.key === 'lottery-theme') apply(read()); });
  });
})();
