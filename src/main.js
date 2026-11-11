import './styles.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { startField } from './anim/field.js';
import { energy } from './ui.js';
import { decorateKickers } from './icons.js';
import proyecto from './views/proyecto.js';
import cotizar from './views/cotizar.js';
import invertir from './views/invertir.js';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
ScrollTrigger.config({ ignoreMobileResize: true });

const routes = { proyecto, cotizar, invertir };
const view = document.getElementById('view');
const tabs = [...document.querySelectorAll('.tabbar a')];
const glow = document.querySelector('.tab-glow');
const wipe = document.querySelectorAll('#wipe span');
let current = null; // { name, cleanup }
let busy = false;

const routeName = () => {
  const h = location.hash.replace('#/', '');
  return routes[h] ? h : 'proyecto';
};

function setTab(name, instant) {
  const i = Object.keys(routes).indexOf(name);
  tabs.forEach((t) => t.classList.toggle('on', t.dataset.r === name));
  gsap.to(glow, { xPercent: i * 100, duration: instant ? 0 : 0.6, ease: 'elastic.out(1,0.75)' });
}

function mount(name) {
  view.innerHTML = '';
  window.scrollTo(0, 0);
  const ctx = gsap.context(() => {}, view);
  let cleanup = null;
  ctx.add(() => { cleanup = routes[name](view, ctx); });
  current = { name, ctx, cleanup };
  decorateKickers(view);
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

function unmount() {
  if (!current) return;
  current.cleanup && current.cleanup();
  current.ctx.revert();
  ScrollTrigger.getAll().forEach((st) => st.kill());
  current = null;
}

async function go(name, first = false) {
  if (busy || (current && current.name === name)) return;
  busy = true;
  setTab(name, first);
  if (first) {
    mount(name);
    busy = false;
    return;
  }
  await gsap.to(wipe, { scaleY: 1, transformOrigin: 'bottom', duration: 0.42, ease: 'power3.in', stagger: 0.07 });
  unmount();
  mount(name);
  await gsap.to(wipe, { scaleY: 0, transformOrigin: 'top', duration: 0.5, ease: 'power3.out', stagger: 0.07 });
  busy = false;
}

window.addEventListener('hashchange', () => go(routeName()));
// Títulos de sección que aparecen después (cotizador) también reciben su ícono
new MutationObserver(() => { if (view.querySelector('.kicker:not([data-done])')) decorateKickers(view); }).observe(view, { childList: true, subtree: true });

// Medidor de energía de la visita (cada interacción suma julios)
const meter = document.getElementById('meter-val');
const cells = [...document.querySelectorAll('.cell-bat i')];
let lastLit = -1;
energy.on((j) => {
  meter.textContent = j.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  // La batería se llena cada 30 J (10 pisadas) y vuelve a empezar
  const lit = j === 0 ? 0 : (Math.floor(j / 5) % 6) + 1;
  if (lit === lastLit) return;
  lastLit = lit;
  cells.forEach((c, i) => c.classList.toggle('on', i < lit));
  if (lit) gsap.fromTo(cells[lit - 1], { scaleY: 0.3 }, { scaleY: 1, duration: 0.4, ease: 'back.out(3)' });
  gsap.fromTo('.cell', { boxShadow: '0 0 0 2px rgba(46,229,157,.55), 0 8px 24px rgba(0,0,0,.45)' }, { boxShadow: '0 0 0 0px rgba(46,229,157,0), 0 8px 24px rgba(0,0,0,.45)', duration: 0.6 });
});

// El encabezado se esconde al bajar y vuelve al subir
let lastY = 0, hidden = false;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const down = y > lastY && y > 120;
  if (down !== hidden) {
    hidden = down;
    gsap.to('#topbar', { yPercent: down ? -140 : 0, duration: 0.45, ease: down ? 'power2.in' : 'expo.out' });
  }
  lastY = y;
}, { passive: true });

// Loader: barra de carga + número
function runLoader() {
  const pct = document.getElementById('ld-pct');
  const o = { v: 0 };
  const tl = gsap.timeline();
  tl.to(o, { v: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: () => { pct.textContent = Math.round(o.v); } }, 0)
    .to('.ld-bar', { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut' }, 0)
    .fromTo('.ld-bolt', { scale: 0.6, opacity: 0.3, transformOrigin: '60px 60px' }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(3)' }, 1.0)
    .to('#loader', { clipPath: 'circle(0% at 50% 50%)', duration: 0.7, ease: 'power3.inOut' }, 1.5)
    .set('#loader', { display: 'none' });
  gsap.set('#loader', { clipPath: 'circle(150% at 50% 50%)' });
  return tl;
}

startField(document.getElementById('field'));
const ld = runLoader();
go(routeName(), true);
if (!location.hash) history.replaceState(null, '', '#/proyecto');
ld.eventCallback('onComplete', () => document.dispatchEvent(new CustomEvent('fp:ready')));
window.__fpReady = () => !document.getElementById('loader') || getComputedStyle(document.getElementById('loader')).display === 'none';
