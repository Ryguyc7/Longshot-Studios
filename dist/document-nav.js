const toggle = document.querySelector('.document-toggle');
const header = document.querySelector('.document-header');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  header.classList.toggle('menu-open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    header.classList.remove('menu-open');
  }
});
