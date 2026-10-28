const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav-links');
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? '收起导航' : '展开导航');
});
nav.addEventListener('click', event => {
  if (event.target.closest('a')) {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', '展开导航');
  }
});

const carousel = document.querySelector('[data-carousel]');
if (carousel) {
  const slides = [...carousel.querySelectorAll('.gallery-slide')];
  const dots = [...carousel.querySelectorAll('.gallery-dots button')];
  const toggle = carousel.querySelector('.gallery-toggle');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let playing = !prefersReducedMotion.matches;
  let timer;
  let gesture = null;

  // Hidden lazy images otherwise start loading only after a slide becomes visible.
  function preload(index) {
    const slide = slides[(index + slides.length) % slides.length];
    slide.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
  }
  function show(index, direction = 1) {
    carousel.style.setProperty('--gallery-enter-offset', direction < 0 ? '-24px' : '24px');
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    preload(current);
    preload(current + 1);
    preload(current - 1);
    dots.forEach((dot, i) => {
      if (i === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }
  function syncPlayback() {
    clearInterval(timer);
    toggle.textContent = playing ? '暂停' : '播放';
    toggle.setAttribute('aria-label', playing ? '暂停自动播放' : '开始自动播放');
    if (playing && !document.hidden) timer = setInterval(() => show(current + 1), 5500);
  }
  function choose(index) { playing = false; show(index, index < current ? -1 : 1); syncPlayback(); }
  carousel.addEventListener('dragstart', event => {
    if (event.target.closest('.gallery-slide')) event.preventDefault();
  });
  carousel.addEventListener('pointerdown', event => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0) ||
        !event.target.closest('.gallery-slide')) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
    carousel.setPointerCapture(event.pointerId);
  });
  carousel.addEventListener('pointerup', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    gesture = null;
    if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      choose(current + (dx < 0 ? 1 : -1));
    }
  });
  carousel.addEventListener('pointercancel', () => { gesture = null; });
  carousel.addEventListener('lostpointercapture', () => { gesture = null; });
  carousel.querySelector('.previous').addEventListener('click', () => choose(current - 1));
  carousel.querySelector('.next').addEventListener('click', () => choose(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => choose(i)));
  toggle.addEventListener('click', () => { playing = !playing; syncPlayback(); });
  document.addEventListener('visibilitychange', syncPlayback);
  prefersReducedMotion.addEventListener('change', event => {
    if (event.matches) { playing = false; syncPlayback(); }
  });
  carousel.addEventListener('focusin', event => {
    if (event.target !== toggle && playing) { playing = false; syncPlayback(); }
  });
  show(0);
  syncPlayback();
}
