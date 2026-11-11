// Título de portada en "vidrio líquido" con energía que corre por dentro y por el borde.
//
// Optimizado para celulares (Safari): las capas fijas del vidrio (sombra, base,
// relleno, bordes) se dibujan UNA sola vez en <canvas>. Lo que se mueve (manchas
// de color, haz, brillo, corriente del contorno, chispas) son <div> que solo
// cambian transform/opacity dentro de una máscara con la forma de las letras,
// así el navegador los mueve en la GPU sin volver a pintar el texto en cada cuadro.
import { gsap } from 'gsap';
import { reduced } from '../ui.js';

const W = 360, LH = 86, FS = 82, BOX = 108, BASE = 80; // unidades del diseño original
const LINES = ['Cada paso', 'enciende', 'la ciudad'];
const FONT = (px) => `900 ${px}px Archivo, 'Arial Narrow', sans-serif`;

function lineHTML(i) {
  const blobs = [
    ['o', 60 + i * 40, BASE - 30, 80],
    ['g', 200 - i * 30, BASE - 20, 90],
    ['b', 320 - i * 20, BASE - 40, 85],
  ].map(([c, cx, cy, r]) => `<i class="gb gb-${c}" style="left:${((cx - r) / W) * 100}%;top:${((cy - r) / BOX) * 100}%;width:${((2 * r) / W) * 100}%;height:${((2 * r) / BOX) * 100}%"></i>`).join('');
  const bars = [0, 1, 2, 3, 4].map(() => '<i class="gc"></i>').join('');
  return `
  <div class="gl-line" data-i="${i}" style="top:${((i * LH) / (2 * LH + BOX)) * 100}%;height:${(BOX / (2 * LH + BOX)) * 100}%">
    <canvas class="gt-under"></canvas>
    <div class="gt-energy">${blobs}<i class="gbeam"></i><i class="gsheen"></i></div>
    <canvas class="gt-over"></canvas>
    <div class="gt-cur">${bars}</div>
  </div>`;
}

export function buildGlassTitle() {
  return `
  <div class="glass-title" id="glassTitle">
    <h1 class="sr">Cada paso enciende la ciudad</h1>
    <div class="gt-box" aria-hidden="true">
      ${LINES.map((_, i) => lineHTML(i)).join('')}
      <div class="gt-sparks">${Array.from({ length: 10 }, (_, i) => `<i style="left:${((20 + ((i * 97) % 330)) / W) * 100}%;top:${((30 + ((i * 53) % 230)) / (2 * LH + BOX)) * 100}%;width:${(1.2 + (i % 3) * 0.6) * 2.4}px;height:${(1.2 + (i % 3) * 0.6) * 2.4}px;background:${['#ffe14d', '#2ee59d', '#3aa0ff', '#fff'][i % 4]}"></i>`).join('')}</div>
    </div>
  </div>`;
}

// ---------- dibujo en canvas ----------
function setFont(ctx) {
  ctx.font = FONT(FS);
  try { ctx.fontStretch = 'semi-expanded'; } catch (e) { /* navegadores sin soporte */ }
}
// Dibuja el texto de la línea ajustado a 350 unidades de ancho (igual que textLength)
function textPath(ctx, txt, op) {
  setFont(ctx);
  const w = ctx.measureText(txt).width || 1;
  ctx.save();
  ctx.translate(5, BASE);
  ctx.scale(350 / w, 1);
  op(ctx, w);
  ctx.restore();
}
function sized(cv, k, dpr) {
  cv.width = Math.round(W * k * dpr);
  cv.height = Math.round(BOX * k * dpr);
  const ctx = cv.getContext('2d');
  ctx.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
  ctx.clearRect(0, 0, W, BOX);
  return ctx;
}
function maskURL(k, dpr, txt, draw) {
  const cv = document.createElement('canvas');
  const ctx = sized(cv, k, dpr);
  draw(ctx, txt);
  return cv.toDataURL('image/png');
}

function paintLine(el, i, k, dpr) {
  const txt = LINES[i];
  const last = i === 2;
  // 1) debajo: profundidad + base oscura
  const u = sized(el.querySelector('.gt-under'), k, dpr);
  u.save(); u.translate(0, 6); u.globalAlpha = 0.55; u.fillStyle = '#000';
  textPath(u, txt, (c) => c.fillText(txt, 0, 0)); u.restore();
  u.save(); u.translate(0, 4); u.globalAlpha = 0.22; u.strokeStyle = '#000'; u.lineWidth = 10; u.lineJoin = 'round';
  textPath(u, txt, (c) => c.strokeText(txt, 0, 0)); u.restore();
  u.save(); u.globalAlpha = 0.72; u.fillStyle = '#0b1324';
  textPath(u, txt, (c) => c.fillText(txt, 0, 0)); u.restore();

  // 2) encima: luz superior (recortada al texto), relleno de vidrio y bordes.
  // Ojo: dentro de textPath el origen está en la línea base y x va de 0 a w.
  const o = sized(el.querySelector('.gt-over'), k, dpr);
  o.fillStyle = '#fff';
  textPath(o, txt, (c) => c.fillText(txt, 0, 0));
  o.globalCompositeOperation = 'source-in';
  textPath(o, txt, (c, w) => {
    const tl = c.createLinearGradient(0, -FS + 4, 0, -FS + 24);
    tl.addColorStop(0, 'rgba(255,255,255,.35)'); tl.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = tl; c.fillRect(-10, -FS - 10, w + 20, BOX + 20);
  });
  o.globalCompositeOperation = 'source-over';
  o.lineJoin = 'round';
  textPath(o, txt, (c, w) => {
    let fill;
    if (last) {
      fill = c.createLinearGradient(0, 0, w, 0);
      fill.addColorStop(0, 'rgba(255,138,31,.55)'); fill.addColorStop(0.35, 'rgba(255,225,77,.45)');
      fill.addColorStop(0.65, 'rgba(46,229,157,.45)'); fill.addColorStop(1, 'rgba(58,160,255,.55)');
    } else {
      fill = c.createLinearGradient(0, -64, 0, 20);
      fill.addColorStop(0, 'rgba(255,255,255,.42)'); fill.addColorStop(0.42, 'rgba(207,227,255,.14)');
      fill.addColorStop(0.58, 'rgba(255,255,255,.05)'); fill.addColorStop(1, 'rgba(255,255,255,.26)');
    }
    c.fillStyle = fill; c.fillText(txt, 0, 0);
    const edge = c.createLinearGradient(0, -64, 0, 20);
    edge.addColorStop(0, 'rgba(255,255,255,.95)'); edge.addColorStop(0.35, 'rgba(255,255,255,0)');
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.1; c.strokeText(txt, 0, 0);
    c.strokeStyle = edge; c.lineWidth = 2; c.strokeText(txt, 0, 0);
  });

  // 3) máscaras: forma de las letras (energía) y contorno (corriente)
  const fillMask = maskURL(k, dpr, txt, (c, t) => { c.fillStyle = '#fff'; textPath(c, t, (x) => x.fillText(t, 0, 0)); });
  const strokeMask = maskURL(k, dpr, txt, (c, t) => {
    c.lineJoin = 'round'; c.strokeStyle = '#fff';
    textPath(c, t, (x) => { x.globalAlpha = 0.35; x.lineWidth = 6; x.strokeText(t, 0, 0); x.globalAlpha = 1; x.lineWidth = 1.8; x.strokeText(t, 0, 0); });
  });
  for (const [sel, url] of [['.gt-energy', fillMask], ['.gt-cur', strokeMask]]) {
    const m = el.querySelector(sel).style;
    m.webkitMaskImage = m.maskImage = `url(${url})`;
  }
}

function paintAll(root) {
  const box = root.querySelector('.gt-box');
  const k = box.clientWidth / W;
  if (!k) return;
  // En celulares con pantalla 3× basta con 2× para el vidrio; ahorra memoria y tiempo
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  box.style.height = `${(2 * LH + BOX) * k}px`;
  root.querySelectorAll('.gl-line').forEach((el, i) => paintLine(el, i, k, dpr));
}

// Dibuja el título (y lo vuelve a dibujar si cambia el ancho o cargan las fuentes)
export function paintGlass(root) {
  let lastW = 0;
  const run = () => {
    const w = root.querySelector('.gt-box').clientWidth;
    if (w && w !== lastW) { lastW = w; paintAll(root); }
  };
  run();
  const ro = new ResizeObserver(run);
  ro.observe(root);
  let alive = true;
  document.fonts?.load(FONT(FS)).then(() => { if (alive) { lastW = 0; run(); } }).catch(() => {});
  return () => { alive = false; ro.disconnect(); };
}

// Animación continua del vidrio (solo transform y opacity). Devuelve función para detener.
export function animateGlass(root) {
  const q = gsap.utils.selector(root);
  const stopPaint = paintGlass(root);
  const tw = [];
  if (reduced) return stopPaint;
  // Energía líquida: manchas de color que se mueven dentro de las letras
  q('.gb').forEach((b, k) => {
    tw.push(gsap.to(b, { xPercent: k % 2 ? -56 : 56, yPercent: k % 3 ? 8 : -8, duration: 3.5 + (k % 4) * 0.7, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
    tw.push(gsap.fromTo(b, { scale: 1 }, { scale: 0.75 + (k % 3) * 0.28, duration: 2.2 + (k % 5) * 0.4, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
  });
  // Haz de energía: baja línea por línea como una corriente
  const beams = q('.gbeam');
  gsap.set(beams, { skewX: -18, xPercent: -133 });
  const pass = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
  beams.forEach((b, i) => pass.fromTo(b, { xPercent: -133 }, { xPercent: 320, duration: 1.3, ease: 'power2.inOut' }, i * 0.35));
  tw.push(pass);
  // Brillo especular lento
  q('.gsheen').forEach((s, i) => {
    gsap.set(s, { skewX: -18 });
    tw.push(gsap.fromTo(s, { xPercent: -570 }, { xPercent: 3700, duration: 5, repeat: -1, delay: i * 0.4, ease: 'none' }));
  });
  // Corriente por el contorno: destellos que recorren el borde de las letras
  q('.gl-line').forEach((g, i) => {
    g.querySelectorAll('.gc').forEach((c, j) => {
      tw.push(gsap.fromTo(c, { xPercent: -100 }, { xPercent: 900, duration: 1.5 + ((i + j) % 3) * 0.35, repeat: -1, ease: 'none', delay: -(j * 0.37 + i * 0.6) }));
    });
  });
  // Chispas
  q('.gt-sparks i').forEach((s, i) => {
    tw.push(gsap.timeline({ repeat: -1, delay: i * 0.37, repeatDelay: 1.5 + (i % 4) * 0.6 })
      .fromTo(s, { opacity: 0, scale: 0.2, y: 0 }, { opacity: 1, scale: 1.6, duration: 0.15 })
      .to(s, { opacity: 0, scale: 0.4, y: -10, duration: 0.6 }));
  });
  // Si la portada no se ve, se pausa todo (ahorra batería y CPU)
  const io = new IntersectionObserver(([e]) => tw.forEach((t) => (e.isIntersecting ? t.resume() : t.pause())));
  io.observe(root);
  return () => { stopPaint(); io.disconnect(); tw.forEach((t) => t.kill()); };
}

// Toque en el título: descarga de energía
export function surgeGlass(root) {
  const q = gsap.utils.selector(root);
  gsap.fromTo(q('.gbeam'), { xPercent: -133 }, { xPercent: 320, duration: 0.6, stagger: 0.08, ease: 'power3.out', overwrite: 'auto' });
  gsap.fromTo(q('.gt-sparks i'), { opacity: 1, scale: 2.2 }, { opacity: 0, scale: 0.4, y: -14, duration: 0.7, stagger: 0.03, overwrite: false });
  gsap.fromTo(q('.gt-cur'), { opacity: 1 }, { opacity: 0.55, duration: 0.15, yoyo: true, repeat: 3 });
}
