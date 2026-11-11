// Fondo vivo: partículas de energía que suben y se aceleran con el scroll.
import { reduced } from '../ui.js';

export function startField(canvas) {
  const ctx = canvas.getContext('2d');
  const cols = ['255,138,31', '46,229,157', '58,160,255', '255,225,77'];
  let w, h, dpr, parts = [];
  let boost = 0, lastY = window.scrollY;
  // Brillo pre-dibujado por color (shadowBlur por partícula es muy caro en Safari)
  const sprites = cols.map((c) => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 32;
    const g = cv.getContext('2d');
    const rg = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    rg.addColorStop(0, `rgba(255,255,255,1)`);
    rg.addColorStop(0.18, `rgba(${c},1)`);
    rg.addColorStop(0.45, `rgba(${c},.35)`);
    rg.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = rg; g.fillRect(0, 0, 32, 32);
    return cv;
  });

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(60, (w * h) / 9000));
    parts = Array.from({ length: n }, () => spawn(true));
  }
  function spawn(any) {
    return {
      x: Math.random() * w,
      y: any ? Math.random() * h : h + 10,
      r: 0.6 + Math.random() * 1.8,
      v: 0.15 + Math.random() * 0.45,
      a: 0.25 + Math.random() * 0.6,
      ci: (Math.random() * cols.length) | 0,
      ph: Math.random() * Math.PI * 2,
    };
  }
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    boost = Math.min(14, boost + Math.abs(y - lastY) * 0.05);
    lastY = y;
  }, { passive: true });
  resize();

  let t = 0;
  function frame() {
    t += 0.016;
    boost *= 0.94;
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.y -= p.v * (1 + boost);
      p.x += Math.sin(t + p.ph) * 0.2;
      if (p.y < -10) Object.assign(p, spawn(false));
      const tw = 0.6 + 0.4 * Math.sin(t * 2 + p.ph);
      const sz = p.r * 7;
      ctx.globalAlpha = p.a * tw;
      ctx.drawImage(sprites[p.ci], p.x - sz / 2, p.y - sz / 2, sz, sz);
      if (boost > 1.5) { // estela con velocidad
        ctx.globalAlpha = 0.15 * p.a;
        ctx.strokeStyle = `rgb(${cols[p.ci]})`;
        ctx.lineWidth = p.r;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y + boost * 3 * p.v * 4); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    if (!reduced) requestAnimationFrame(frame);
  }
  frame();
}
