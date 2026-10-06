(() => {
  function playIntro(sound = false) {
    if (!window.LongShotStudiosSplash) {
      document.documentElement.removeAttribute('data-splash-pending');
      return;
    }
    try {
      const playback = LongShotStudiosSplash.play({ sound });
      playback.catch(() => {
        LongShotStudiosSplash.dismiss();
        document.documentElement.removeAttribute('data-splash-pending');
      });
    } catch {
      LongShotStudiosSplash.dismiss();
      document.documentElement.removeAttribute('data-splash-pending');
    }
  }
  document.getElementById('replay-intro').addEventListener('click', () => playIntro(true));
  if (window.shouldPlayIntro) {
    try { sessionStorage.setItem('longshot-intro-seen', '1'); } catch {}
    playIntro();
  } else {
    document.documentElement.removeAttribute('data-splash-pending');
  }
})();
