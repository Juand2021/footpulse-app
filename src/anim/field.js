// Fondo vivo: partículas de energía que suben y se aceleran con el scroll.
import { reduced } from '../ui.js';

export function startField(canvas) {
  const ctx = canvas.getContext('2d');
  const cols = ['255,138,31', '46,229,157', '58,160,255', '255,225,77'];
  let w, h, dpr, parts = [];
  let boost = 0, lastY = window.scrollY;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
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
      c: cols[(Math.random() * cols.length) | 0],
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
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.c},${p.a * tw})`;
      ctx.shadowColor = `rgba(${p.c},1)`;
      ctx.shadowBlur = 8;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      if (boost > 1.5) { // estela con velocidad
        ctx.strokeStyle = `rgba(${p.c},${0.15 * p.a})`;
        ctx.lineWidth = p.r;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y + boost * 3 * p.v * 4); ctx.stroke();
      }
    }
    ctx.shadowBlur = 0;
    if (!reduced) requestAnimationFrame(frame);
  }
  frame();
}
