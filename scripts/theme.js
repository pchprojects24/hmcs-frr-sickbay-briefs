/* theme.js — Dark mode toggle for HMCS FRR Health Hub */
(() => {
  'use strict';

  const STORAGE_KEY = 'frr-theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  function getPreferred() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === DARK || saved === LIGHT) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.querySelector('[data-theme-toggle]');
    if (btn) {
      btn.textContent = theme === DARK ? '☀️' : '🌙';
      btn.setAttribute('aria-label', theme === DARK ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || getPreferred();
    const next = current === DARK ? LIGHT : DARK;
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  // Apply immediately (before paint) to avoid flash
  applyTheme(getPreferred());

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getPreferred());
    const btn = document.querySelector('[data-theme-toggle]');
    if (btn) btn.addEventListener('click', toggleTheme);
  });
})();
