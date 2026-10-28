const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class Element {
  constructor() {
    this.handlers = {}; this.attributes = {}; this.hidden = false;
    const classes = new Set();
    this.classList = { add: value => classes.add(value), remove: (...values) => values.forEach(value => classes.delete(value)), contains: value => classes.has(value) };
  }
  addEventListener(type, handler) { this.handlers[type] = handler; }
  setAttribute(name, value) { this.attributes[name] = value; }
  removeAttribute(name) { delete this.attributes[name]; }
  setPointerCapture() {}
  dispatch(type, event = {}) { this.handlers[type]?.(event); }
}
async function main() {
  let releaseSlow;
  const slow = new Promise(resolve => { releaseSlow = resolve; });
  const slides = Array.from({ length: 4 }, (_, i) => {
    const slide = new Element();
    slide.hidden = i !== 0;
    slide.images = [{ loading: 'lazy', decode: () => i === 2 ? slow : Promise.resolve() }];
    slide.querySelectorAll = () => slide.images;
    return slide;
  });
  const dots = Array.from({ length: 4 }, () => new Element());
  const carousel = new Element();
  carousel.style = { setProperty() {} };
  const toggle = new Element(), previous = new Element(), next = new Element(), status = new Element();
  carousel.querySelectorAll = selector => selector === '.gallery-slide' ? slides : dots;
  carousel.querySelector = selector => ({ '.gallery-toggle': toggle, '.previous': previous, '.next': next, '.gallery-status': status })[selector];
  const menu = new Element(), nav = new Element(), document = new Element();
  document.querySelector = selector => ({ '.menu-toggle': menu, '#nav-links': nav, '[data-carousel]': carousel })[selector];
  const media = new Element(); media.matches = true;
  vm.runInNewContext(fs.readFileSync('script.js', 'utf8'), {
    document, window: { matchMedia: () => media, addEventListener() {} }, clearInterval, setInterval, clearTimeout, setTimeout,
  });
  const flush = () => new Promise(resolve => setImmediate(resolve));
  function pointer(type, x, y) {
    carousel.dispatch(type, { isPrimary: true, pointerType: 'touch', pointerId: 1,
      clientX: x, clientY: y, target: { closest: () => slides[0] } });
  }
  function visible() { return slides.findIndex(slide => !slide.hidden); }
  assert.equal(visible(), 0);
  assert.deepEqual(slides.map(slide => slide.images[0].loading), ['eager', 'eager', 'eager', 'eager']);
  pointer('pointerdown', 200, 100); pointer('pointerup', 100, 105); await flush();
  assert.equal(visible(), 1);
  assert.equal(toggle.textContent, '播放');
  pointer('pointerdown', 100, 100); pointer('pointerup', 200, 105); await flush();
  assert.equal(visible(), 0);
  pointer('pointerdown', 100, 100); pointer('pointerup', 110, 220); await flush();
  assert.equal(visible(), 0);
  pointer('pointerdown', 200, 100); carousel.dispatch('pointercancel'); pointer('pointerup', 100, 100); await flush();
  assert.equal(visible(), 0);
  dots[2].dispatch('click'); await flush();
  assert.equal(visible(), 0, 'keep old slide while next image loads');
  assert.equal(status.textContent, '图片加载中…');
  dots[1].dispatch('click'); await flush();
  assert.equal(visible(), 1);
  releaseSlow(); await flush();
  assert.equal(visible(), 1, 'late loads must not override newer choices');
  previous.dispatch('click'); await flush(); assert.equal(visible(), 0);
  next.dispatch('click'); await flush(); assert.equal(visible(), 1);
  console.log('carousel preloading, gestures and race tests passed');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
