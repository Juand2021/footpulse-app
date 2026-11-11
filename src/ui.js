import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Energía acumulada en la visita (julios). 1 pisada = 3 J (Informe 2).
export const energy = {
  j: 0,
  fns: [],
  add(v) { this.j += v; this.fns.forEach((f) => f(this.j)); },
  on(f) { this.fns.push(f); f(this.j); },
};

let isReady = false;
document.addEventListener('fp:ready', () => { isReady = true; });
export const whenReady = (cb) => (isReady ? cb() : document.addEventListener('fp:ready', cb, { once: true }));

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Cuenta animada para números
export function countTo(el, to, { dur = 1.6, dec = 0, prefix = '', suffix = '', from = 0, ease = 'power3.out', delay = 0 } = {}) {
  const o = { v: from };
  const f = (v) => {
    const s = Math.abs(v).toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    el.textContent = prefix + (v < 0 ? '−' : '') + s + suffix;
  };
  f(from);
  return gsap.to(o, { v: to, duration: dur, ease, delay, onUpdate: () => f(o.v) });
}

// Cuenta que arranca cuando el elemento entra en pantalla
export function countOnView(el, to, opts = {}) {
  const tw = countTo(el, to, opts);
  tw.pause();
  ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => tw.play() });
}

// Revela elementos en lote al hacer scroll
export function reveals(root) {
  const items = $$('[data-r]', root);
  items.forEach((el) => {
    const t = el.dataset.r;
    const from = { opacity: 0 };
    if (t === 'up' || t === '') from.y = 46;
    if (t === 'left') from.x = -60;
    if (t === 'right') from.x = 60;
    if (t === 'zoom') { from.scale = 0.86; from.y = 20; }
    if (t === 'tilt') { from.rotateX = -35; from.y = 40; from.transformPerspective = 700; from.transformOrigin = '50% 100%'; }
    gsap.from(el, { ...from, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
  // Grupos con stagger
  $$('[data-stagger]', root).forEach((g) => {
    gsap.from(g.children, {
      opacity: 0, y: 40, scale: 0.96, duration: 0.9, ease: 'expo.out', stagger: 0.09,
      scrollTrigger: { trigger: g, start: 'top 88%', once: true },
    });
  });
  // Títulos línea por línea
  $$('[data-split]', root).forEach((h) => {
    const words = h.innerHTML.split(/(<[^>]+>[^<]*<\/[^>]+>|\s+)/).filter((w) => w && w.trim());
    h.innerHTML = words.map((w) => `<span class="split-line" style="display:inline-block"><span>${w}</span></span>`).join(' ');
    gsap.from($$('.split-line > span', h), {
      yPercent: 110, rotate: 4, duration: 1, ease: 'expo.out', stagger: 0.05,
      scrollTrigger: { trigger: h, start: 'top 90%', once: true },
    });
  });
}

// Tooltip simple para gráficos (tap o hover)
let tipEl;
export function tip(html, x, y) {
  if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'tip'; document.body.appendChild(tipEl); }
  if (!html) { tipEl.style.opacity = 0; return; }
  tipEl.innerHTML = html;
  const w = tipEl.offsetWidth;
  tipEl.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, x - w / 2)) + 'px';
  tipEl.style.top = y - tipEl.offsetHeight - 14 + 'px';
  tipEl.style.opacity = 1;
}
window.addEventListener('scroll', () => tip(null), { passive: true });

export const icon = {
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5 10 17 19 7"/></svg>',
  warn: '<svg viewBox="0 0 24 24"><path d="M12 3 2 20h20zM12 9v5M12 17v.5"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  bolt: '<svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
};
