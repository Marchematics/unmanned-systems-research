const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav');
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? '收起导航' : '展开导航');
});
nav.addEventListener('click', e => {
  if (e.target.closest('a')) { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', '展开导航'); }
});
const slides = [...document.querySelectorAll('.slide')];
const dots = [...document.querySelectorAll('.dots button')];
let current = 0;
function showSlide(index) {
  current = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
  dots.forEach((dot, i) => { dot.classList.toggle('active', i === current); if (i === current) dot.setAttribute('aria-current', 'true'); else dot.removeAttribute('aria-current'); });
}
document.querySelector('.prev').addEventListener('click', () => showSlide(current - 1));
document.querySelector('.next').addEventListener('click', () => showSlide(current + 1));
dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => showSlide(current + 1), 5000);
document.querySelectorAll('[role=tab]').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('[role=tab]').forEach(item => { const selected = item === tab; item.setAttribute('aria-selected', String(selected)); document.getElementById(item.getAttribute('aria-controls')).hidden = !selected; });
}));
document.querySelector('.search').addEventListener('submit', e => {
  e.preventDefault();
  const term = e.currentTarget.querySelector('input').value.trim();
  const status = document.querySelector('.search-status');
  if (!term) { status.textContent = '请输入搜索内容'; return; }
  const sections = [...document.querySelectorAll('main section')];
  const match = sections.find(section => section.textContent.toLowerCase().includes(term.toLowerCase()));
  if (match) { status.textContent = '已定位到相关栏目'; match.scrollIntoView({behavior:'smooth'}); }
  else status.textContent = '未找到相关内容';
});
