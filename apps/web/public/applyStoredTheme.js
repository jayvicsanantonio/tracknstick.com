// Applies the appearance before first paint: the one chosen, or the system's; index.html loads it, blocking, in <head>.
// Without it the class is only set once React mounts, so every load shows a frame in the wrong palette.
(function () {
  var systemDark = function () {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  try {
    var stored = localStorage.getItem('track-n-stick-appearance');
    var mode =
      stored === 'light' || stored === 'dark'
        ? stored
        : systemDark()
          ? 'dark'
          : 'light';
    document.documentElement.classList.add(mode);
  } catch (e) {
    document.documentElement.classList.add(systemDark() ? 'dark' : 'light');
  }
})();
