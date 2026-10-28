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
  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
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
  function choose(index) { playing = false; show(index); syncPlayback(); }
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
