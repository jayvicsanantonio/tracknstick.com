// Applies the stored theme before first paint; index.html loads it, blocking, in <head>.
// Without it the class is only set once React mounts, so every load shows a frame in the wrong palette.
(function () {
  try {
    var stored = localStorage.getItem('track-n-stick-theme');
    var mode = stored === 'light' || stored === 'dark' ? stored : 'dark';
    document.documentElement.classList.add(mode);
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
