// Título de portada en "vidrio líquido" con energía que corre por dentro y por el borde.
import { gsap } from 'gsap';
import { reduced } from '../ui.js';

const W = 360, LH = 86, FS = 82;

function line(i, txt, energy) {
  const y = 72 + i * LH;
  const t = (extra = '') => `<text x="5" y="${y}" textLength="${W - 10}" lengthAdjust="spacingAndGlyphs" class="gt-font" font-size="${FS}" ${extra}>${txt}</text>`;
  return `
  <g class="gl-line" data-i="${i}">
    <clipPath id="gtc${i}">${t()}</clipPath>
    <!-- profundidad -->
    ${t(`fill="#000" opacity=".55" transform="translate(0 6)"`)}
    ${t(`fill="none" stroke="#000" stroke-width="10" stroke-opacity=".22" stroke-linejoin="round" transform="translate(0 4)"`)}
    <!-- interior: base oscura, energía líquida, haz y brillo -->
    <g clip-path="url(#gtc${i})">
      <rect x="0" y="${y - FS}" width="${W}" height="${LH + 10}" fill="#0b1324" opacity=".72"/>
      <circle class="gb gb-o" cx="${60 + i * 40}" cy="${y - 30}" r="80" fill="url(#gbO)"/>
      <circle class="gb gb-g" cx="${200 - i * 30}" cy="${y - 20}" r="90" fill="url(#gbG)"/>
      <circle class="gb gb-b" cx="${320 - i * 20}" cy="${y - 40}" r="85" fill="url(#gbB)"/>
      <rect class="gbeam" x="-200" y="${y - FS - 10}" width="150" height="${LH + 30}" fill="url(#gBeam)" transform="skewX(-18)"/>
      <rect class="gsheen" x="-80" y="${y - FS - 10}" width="14" height="${LH + 30}" fill="#fff" opacity=".28" transform="skewX(-18)"/>
      <rect x="0" y="${y - FS + 4}" width="${W}" height="20" fill="url(#gTopLight)"/>
    </g>
    <!-- cuerpo de vidrio -->
    ${t(`fill="url(#${energy ? 'gFillE' : 'gFill'})"`)}
    <!-- bordes: contorno, luz superior -->
    ${t(`fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.1" stroke-linejoin="round"`)}
    ${t(`fill="none" stroke="url(#gEdge)" stroke-width="2" stroke-linejoin="round"`)}
    <!-- corriente que recorre el contorno de las letras -->
    ${t(`class="gcur gcur-w" fill="none" stroke="url(#gCur)" stroke-width="6" stroke-opacity=".35" stroke-linecap="round" stroke-dasharray="16 118"`)}
    ${t(`class="gcur gcur-t" fill="none" stroke="#fff6c2" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="16 118"`)}
  </g>`;
}

export function buildGlassTitle() {
  const lines = ['Cada paso', 'enciende', 'la ciudad'];
  return `
  <div class="glass-title" id="glassTitle">
    <h1 class="sr">Cada paso enciende la ciudad</h1>
    <svg viewBox="0 -8 ${W} ${LH * 3 + 14}" aria-hidden="true">
      <defs>
        <linearGradient id="gFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff" stop-opacity=".42"/>
          <stop offset=".42" stop-color="#cfe3ff" stop-opacity=".14"/>
          <stop offset=".58" stop-color="#fff" stop-opacity=".05"/>
          <stop offset="1" stop-color="#fff" stop-opacity=".26"/>
        </linearGradient>
        <linearGradient id="gFillE" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#ff8a1f" stop-opacity=".55"/>
          <stop offset=".35" stop-color="#ffe14d" stop-opacity=".45"/>
          <stop offset=".65" stop-color="#2ee59d" stop-opacity=".45"/>
          <stop offset="1" stop-color="#3aa0ff" stop-opacity=".55"/>
        </linearGradient>
        <linearGradient id="gEdge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff" stop-opacity=".95"/>
          <stop offset=".35" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="gTopLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff" stop-opacity=".35"/>
          <stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="gBeam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#ff8a1f" stop-opacity="0"/>
          <stop offset=".3" stop-color="#ff8a1f" stop-opacity=".7"/>
          <stop offset=".48" stop-color="#ffe14d"/>
          <stop offset=".52" stop-color="#ffffff"/>
          <stop offset=".7" stop-color="#2ee59d" stop-opacity=".8"/>
          <stop offset="1" stop-color="#3aa0ff" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="gCur" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#ffe14d"/><stop offset=".5" stop-color="#2ee59d"/><stop offset="1" stop-color="#3aa0ff"/>
        </linearGradient>
        <radialGradient id="gbO"><stop offset="0" stop-color="#ff8a1f" stop-opacity=".75"/><stop offset="1" stop-color="#ff8a1f" stop-opacity="0"/></radialGradient>
        <radialGradient id="gbG"><stop offset="0" stop-color="#2ee59d" stop-opacity=".65"/><stop offset="1" stop-color="#2ee59d" stop-opacity="0"/></radialGradient>
        <radialGradient id="gbB"><stop offset="0" stop-color="#3aa0ff" stop-opacity=".75"/><stop offset="1" stop-color="#3aa0ff" stop-opacity="0"/></radialGradient>
      </defs>
      ${lines.map((l, i) => line(i, l, i === 2)).join('')}
      <g id="gSparks">${Array.from({ length: 10 }, (_, i) => `<circle cx="${20 + ((i * 97) % 330)}" cy="${30 + ((i * 53) % 230)}" r="${1.2 + (i % 3) * 0.6}" fill="${['#ffe14d', '#2ee59d', '#3aa0ff', '#fff'][i % 4]}" opacity="0"/>`).join('')}</g>
    </svg>
  </div>`;
}

// Animación continua del vidrio. Devuelve función para detener.
export function animateGlass(root) {
  const q = gsap.utils.selector(root);
  const tw = [];
  if (reduced) return () => {};
  // Energía líquida: manchas de color que se mueven dentro de las letras
  q('.gb').forEach((b, k) => {
    tw.push(gsap.to(b, { attr: { cx: `+=${k % 2 ? -90 : 90}`, cy: `+=${k % 3 ? 14 : -14}` }, duration: 3.5 + (k % 4) * 0.7, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
    tw.push(gsap.to(b, { attr: { r: 60 + (k % 3) * 25 }, duration: 2.2 + (k % 5) * 0.4, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
  });
  // Haz de energía: baja línea por línea como una corriente
  const beams = q('.gbeam');
  const pass = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
  beams.forEach((b, i) => pass.fromTo(b, { attr: { x: -200 } }, { attr: { x: 480 }, duration: 1.3, ease: 'power2.inOut' }, i * 0.35));
  tw.push(pass);
  // Brillo especular lento
  q('.gsheen').forEach((s, i) => tw.push(gsap.fromTo(s, { attr: { x: -80 } }, { attr: { x: 520 }, duration: 5, repeat: -1, delay: i * 0.4, ease: 'none' })));
  // Corriente por el contorno
  q('.gl-line').forEach((g, i) => {
    const c = g.querySelectorAll('.gcur');
    tw.push(gsap.fromTo(c, { strokeDashoffset: 0 }, { strokeDashoffset: -134, duration: 1.6 + i * 0.3, repeat: -1, ease: 'none', delay: -i * 1.3 }));
  });
  // Chispas
  q('#gSparks circle').forEach((s, i) => {
    tw.push(gsap.timeline({ repeat: -1, delay: i * 0.37, repeatDelay: 1.5 + (i % 4) * 0.6 })
      .fromTo(s, { opacity: 0, scale: 0.2, transformOrigin: 'center' }, { opacity: 1, scale: 1.6, duration: 0.15 })
      .to(s, { opacity: 0, scale: 0.4, y: -10, duration: 0.6 }));
  });
  return () => tw.forEach((t) => t.kill());
}

// Toque en el título: descarga de energía
export function surgeGlass(root) {
  const q = gsap.utils.selector(root);
  gsap.fromTo(q('.gbeam'), { attr: { x: -200 } }, { attr: { x: 480 }, duration: 0.6, stagger: 0.08, ease: 'power3.out', overwrite: 'auto' });
  gsap.fromTo(q('.gb'), { attr: { r: 140 } }, { attr: { r: 85 }, duration: 0.9, ease: 'expo.out' });
  gsap.fromTo(q('.gcur-t'), { strokeWidth: 3.5 }, { strokeWidth: 1.6, duration: 0.8 });
}
