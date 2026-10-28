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
  const status = carousel.querySelector('.gallery-status');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let playing = !prefersReducedMotion.matches;
  let readyForAutoplay = false;
  let timer;
  let transitionTimer;
  let requestId = 0;
  let gesture = null;
  let pending = false;

  // Start loading and decoding all carousel images, including hidden slides.
  function loadImage(image) {
    image.loading = 'eager';
    if (image.decode) return image.decode();
    if (image.complete) return image.naturalWidth ? Promise.resolve() : Promise.reject();
    return new Promise((resolve, reject) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', reject, { once: true });
    });
  }
  const slideImages = slides.map(slide => [...slide.querySelectorAll('img')]);
  const imageLoads = slideImages.map(images => Promise.all(images.map(loadImage)));
  // Keep failures handled even before a user requests their slide.
  const slideReady = imageLoads.map(load => load.then(() => true, () => false));
  function withTimeout(promise) {
    return new Promise(resolve => {
      const deadline = setTimeout(() => resolve(false), 12000);
      promise.then(value => { clearTimeout(deadline); resolve(value); });
    });
  }
  function syncPlayback() {
    clearInterval(timer);
    toggle.textContent = playing ? '暂停' : '播放';
    toggle.setAttribute('aria-label', playing ? '暂停自动播放' : '开始自动播放');
    if (playing && readyForAutoplay && !document.hidden) {
      timer = setInterval(() => { if (!pending) requestSlide(current + 1, 1); }, 5500);
    }
  }
  function finishTransition() {
    clearTimeout(transitionTimer);
    slides.forEach((slide, i) => {
      slide.classList.remove('is-entering', 'is-leaving');
      slide.hidden = i !== current;
      slide.removeAttribute('aria-hidden');
    });
  }
  async function requestSlide(index, direction) {
    const target = (index + slides.length) % slides.length;
    const id = ++requestId;
    if (target === current) { pending = false; status.hidden = true; return; }
    pending = true;
    status.textContent = '图片加载中…';
    status.hidden = false;
    const ready = await withTimeout(slideReady[target]);
    if (id !== requestId) return;
    pending = false;
    if (!ready) {
      status.textContent = '图片暂时无法加载，请刷新页面重试。';
      return;
    }
    status.hidden = true;
    finishTransition();
    const old = slides[current];
    current = target;
    const next = slides[current];
    carousel.style.setProperty('--gallery-enter-offset', direction < 0 ? '-35px' : '35px');
    carousel.style.setProperty('--gallery-exit-offset', direction < 0 ? '35px' : '-35px');
    next.hidden = false;
    dots.forEach((dot, i) => {
      if (i === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    if (prefersReducedMotion.matches) {
      old.hidden = true;
    } else {
      old.setAttribute('aria-hidden', 'true');
      old.classList.add('is-leaving');
      next.classList.add('is-entering');
      transitionTimer = setTimeout(finishTransition, 500);
    }
  }
  function choose(index) {
    playing = false;
    syncPlayback();
    requestSlide(index, index < current ? -1 : 1);
  }
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
    if (event.matches) { playing = false; finishTransition(); syncPlayback(); }
  });
  carousel.addEventListener('focusin', event => {
    if (event.target !== toggle && playing) { playing = false; syncPlayback(); }
  });
  syncPlayback();
  withTimeout(Promise.all(slideReady)).then(() => {
    readyForAutoplay = true;
    syncPlayback();
  });
}
