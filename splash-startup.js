(() => {
  function playIntro(sound = false) {
    if (!window.LongShotStudiosSplash) {
      document.documentElement.removeAttribute('data-splash-pending');
      return;
    }
    try {
      const playback = LongShotStudiosSplash.play({ sound });
      const dialog = document.querySelector('.studio-splash');
      if (dialog) {
        const skip = document.createElement('button');
        skip.type = 'button';
        skip.className = 'btn btn-secondary splash-skip';
        skip.textContent = 'Skip intro';
        skip.addEventListener('click', () => LongShotStudiosSplash.dismiss());
        dialog.append(skip);
      }
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
  playIntro();
})();
