const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class Element {
  constructor() { this.handlers = {}; this.attributes = {}; this.hidden = false; }
  addEventListener(type, handler) { this.handlers[type] = handler; }
  setAttribute(name, value) { this.attributes[name] = value; }
  removeAttribute(name) { delete this.attributes[name]; }
  setPointerCapture() {}
  dispatch(type, event = {}) { this.handlers[type]?.(event); }
}
const slides = Array.from({ length: 4 }, () => {
  const slide = new Element();
  slide.images = [{ loading: 'lazy' }, { loading: 'lazy' }];
  slide.querySelectorAll = () => slide.images;
  return slide;
});
const dots = Array.from({ length: 4 }, () => new Element());
const carousel = new Element();
carousel.style = { setProperty() {} };
const toggle = new Element();
const previous = new Element();
const next = new Element();
carousel.querySelectorAll = selector => selector === '.gallery-slide' ? slides : dots;
carousel.querySelector = selector => ({ '.gallery-toggle': toggle, '.previous': previous, '.next': next })[selector];
const menu = new Element();
const nav = new Element();
const document = new Element();
document.querySelector = selector => ({ '.menu-toggle': menu, '#nav-links': nav, '[data-carousel]': carousel })[selector];
const media = new Element();
media.matches = true;
vm.runInNewContext(fs.readFileSync('script.js', 'utf8'), {
  document, window: { matchMedia: () => media }, clearInterval, setInterval,
});
function pointer(type, x, y, overrides = {}) {
  carousel.dispatch(type, { isPrimary: true, pointerType: 'touch', pointerId: 1,
    clientX: x, clientY: y, target: { closest: () => slides[0] }, ...overrides });
}
function visible() { return slides.findIndex(slide => !slide.hidden); }
assert.equal(visible(), 0);
assert.deepEqual(slides.map(slide => slide.images[0].loading), ['eager', 'eager', 'lazy', 'eager']);
pointer('pointerdown', 200, 100); pointer('pointerup', 100, 105);
assert.equal(visible(), 1);
assert.equal(slides[2].images[0].loading, 'eager');
assert.equal(toggle.textContent, '播放');
pointer('pointerdown', 100, 100); pointer('pointerup', 200, 105);
assert.equal(visible(), 0);
pointer('pointerdown', 100, 100); pointer('pointerup', 110, 220);
assert.equal(visible(), 0);
pointer('pointerdown', 200, 100); carousel.dispatch('pointercancel'); pointer('pointerup', 100, 100);
assert.equal(visible(), 0);
next.dispatch('click'); assert.equal(visible(), 1);
previous.dispatch('click'); assert.equal(visible(), 0);
console.log('carousel interaction and preloading tests passed');
