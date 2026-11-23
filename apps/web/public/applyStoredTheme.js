// Applies the stored theme before the app renders; index.html loads it, blocking, after the launch splash.
// Defaults to the device's system colour scheme when no explicit theme has been stored,
// and syncs <meta name="theme-color"> and color-scheme so iOS status bars match seamlessly,
// and the favicon so the browser tab shows the theme's icon.
(function () {
  var LIGHT_BG = '#fdf2f8';
  var DARK_BG = '#00140b';
  var LIGHT_FAVICON = '/icons/favicon-light.svg';
  var DARK_FAVICON = '/icons/favicon-dark.svg';

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
    var favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.setAttribute(
        'href',
        mode === 'dark' ? DARK_FAVICON : LIGHT_FAVICON,
      );
    }
  } catch (_err) {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  }
})();
