// Applies the stored theme before first paint; index.html loads it, blocking, in <head>.
// Defaults to the device's system colour scheme when no explicit theme has been stored,
// and syncs <meta name="theme-color"> and color-scheme so iOS status bars match seamlessly.
(function () {
  var LIGHT_BG = '#fdf2f8';
  var DARK_BG = '#00140b';

  function resolveMode(stored) {
    if (stored === 'light' || stored === 'dark') return stored;
    try {
      if (typeof window.matchMedia !== 'function') return 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch (_err) {
      return 'dark';
    }
  }

  try {
    var stored = localStorage.getItem('track-n-stick-theme');
    var mode = resolveMode(stored);
    var root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    root.style.colorScheme = mode;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', mode === 'dark' ? DARK_BG : LIGHT_BG);
    }
  } catch (_err) {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  }
})();
