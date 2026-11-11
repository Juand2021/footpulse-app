// Gráficos SVG propios, animados con GSAP + ScrollTrigger.
import { gsap } from 'gsap';
import { fmtM } from '../data.js';
import { tip } from '../ui.js';

const W = 340;

function attachTip(el, html) {
  const show = (e) => {
    const b = el.getBoundingClientRect();
    tip(html, e && e.clientX ? e.clientX : b.left + b.width / 2, b.top);
  };
  el.addEventListener('pointerenter', show);
  el.addEventListener('pointerdown', show);
  el.addEventListener('pointerleave', () => tip(null));
}

// Barras apiladas verticales (años). series: [{name, color, values}]
export function stackedBars(host, labels, series, { h = 220, unit = 'M' } = {}) {
  const pad = { l: 34, r: 6, t: 18, b: 24 };
  const totals = labels.map((_, i) => series.reduce((s, x) => s + x.values[i], 0));
  const max = Math.ceil(Math.max(...totals) / 400) * 400;
  const ih = h - pad.t - pad.b, iw = W - pad.l - pad.r;
  const bw = (iw / labels.length) * 0.56;
  const y = (v) => pad.t + ih - (v / max) * ih;
  let s = `<svg class="chart" viewBox="0 0 ${W} ${h}">`;
  for (let g = 0; g <= 4; g++) {
    const v = (max / 4) * g;
    s += `<line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${pad.l - 6}" y="${y(v) + 3}" text-anchor="end">${fmtM(v, 0)}</text>`;
  }
  labels.forEach((lb, i) => {
    const x = pad.l + (iw / labels.length) * i + (iw / labels.length - bw) / 2;
    let acc = 0;
    series.forEach((se, k) => {
      const v = se.values[i];
      if (!v) return;
      const top = y(acc + v), bot = y(acc);
      const gap = k > 0 ? 2 : 0;
      s += `<rect class="bar" data-i="${i}" data-k="${k}" x="${x}" y="${top}" width="${bw}" height="${Math.max(0, bot - top - gap)}" rx="${k === series.length - 1 || !series[k + 1]?.values[i] ? 4 : 0}" fill="${se.color}"/>`;
      acc += v;
    });
    s += `<text class="val-lbl" x="${x + bw / 2}" y="${y(totals[i]) - 6}" text-anchor="middle" data-tot="${i}">${fmtM(totals[i], 0)}</text>`;
    s += `<text x="${x + bw / 2}" y="${h - 6}" text-anchor="middle">${lb}</text>`;
    s += `<rect class="hit" data-i="${i}" x="${x - 6}" y="${pad.t}" width="${bw + 12}" height="${ih}" fill="transparent"/>`;
  });
  s += '</svg>';
  host.innerHTML = s;
  const svg = host.firstElementChild;
  host.querySelectorAll('.hit').forEach((r) => {
    const i = +r.dataset.i;
    attachTip(r, `<b>${labels[i]}</b><br>${series.map((se) => `${se.name}: ${fmtM(se.values[i])} ${unit}`).join('<br>')}<br>Total: ${fmtM(totals[i])} ${unit}`);
  });
  const bars = svg.querySelectorAll('.bar');
  gsap.set(bars, { scaleY: 0, transformOrigin: '50% 100%' });
  const tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 85%', end: 'top 35%', scrub: 0.8 } });
  labels.forEach((_, i) => {
    tl.to(svg.querySelectorAll(`.bar[data-i="${i}"][data-k="0"]`), { scaleY: 1, duration: 1, ease: 'power2.out' }, i * 0.4);
    tl.to(svg.querySelectorAll(`.bar[data-i="${i}"]:not([data-k="0"])`), { scaleY: 1, duration: 0.6, ease: 'power2.out' }, i * 0.4 + 0.6);
  });
  tl.from(svg.querySelectorAll('.val-lbl'), { opacity: 0, y: 8, stagger: 0.4, duration: 0.5 }, 0.5);
  return svg;
}

// Barras con signo (positivas y negativas)
export function signedBars(host, labels, values, { h = 200, pos = '#3a8aeb', neg = '#db6a08', unit = 'M' } = {}) {
  const pad = { l: 34, r: 6, t: 18, b: 24 };
  const max = Math.max(...values.map(Math.abs)) * 1.15;
  const mn = Math.min(0, ...values) * 1.25;
  const ih = h - pad.t - pad.b, iw = W - pad.l - pad.r;
  const y = (v) => pad.t + ((max - v) / (max - mn)) * ih;
  const bw = (iw / labels.length) * 0.56;
  let s = `<svg class="chart" viewBox="0 0 ${W} ${h}">`;
  s += `<line class="zero" x1="${pad.l}" x2="${W - pad.r}" y1="${y(0)}" y2="${y(0)}"/><text x="${pad.l - 6}" y="${y(0) + 3}" text-anchor="end">0</text>`;
  labels.forEach((lb, i) => {
    const v = values[i];
    const x = pad.l + (iw / labels.length) * i + (iw / labels.length - bw) / 2;
    const top = v >= 0 ? y(v) : y(0), hh = Math.abs(y(v) - y(0));
    s += `<rect class="bar" data-i="${i}" x="${x}" y="${top}" width="${bw}" height="${hh}" rx="4" fill="${v >= 0 ? pos : neg}" style="transform-origin:${x + bw / 2}px ${y(0)}px"/>`;
    s += `<text class="val-lbl" x="${x + bw / 2}" y="${v >= 0 ? y(v) - 6 : y(v) + 13}" text-anchor="middle">${fmtM(v)}</text>`;
    s += `<text x="${x + bw / 2}" y="${h - 6}" text-anchor="middle">${lb}</text>`;
  });
  s += '</svg>';
  host.innerHTML = s;
  const svg = host.firstElementChild;
  svg.querySelectorAll('.bar').forEach((b) => attachTip(b, `<b>${labels[+b.dataset.i]}</b><br>${fmtM(values[+b.dataset.i])} ${unit}`));
  gsap.fromTo(svg.querySelectorAll('.bar'), { scaleY: 0 }, { scaleY: 1, duration: 1, stagger: 0.12, ease: 'back.out(1.4)', scrollTrigger: { trigger: svg, start: 'top 80%' } });
  gsap.from(svg.querySelectorAll('.val-lbl'), { opacity: 0, duration: 0.5, stagger: 0.12, delay: 0.6, scrollTrigger: { trigger: svg, start: 'top 80%' } });
  return svg;
}

// Línea del flujo acumulado, se dibuja con el scroll
export function cumLine(host, labels, values, { h = 230 } = {}) {
  const pad = { l: 38, r: 14, t: 26, b: 24 };
  const max = Math.max(...values) * 1.12, mn = Math.min(...values) * 1.25;
  const ih = h - pad.t - pad.b, iw = W - pad.l - pad.r;
  const x = (i) => pad.l + (iw / (labels.length - 1)) * i;
  const y = (v) => pad.t + ((max - v) / (max - mn)) * ih;
  const pts = values.map((v, i) => [x(i), y(v)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = d + ` L${x(values.length - 1)} ${y(0)} L${x(0)} ${y(0)} Z`;
  // cruce por cero entre año 3 y 4
  const k = values.findIndex((v, i) => i > 0 && values[i - 1] < 0 && v >= 0);
  const fr = -values[k - 1] / (values[k] - values[k - 1]);
  const zx = x(k - 1) + (x(k) - x(k - 1)) * fr;
  let s = `<svg class="chart" viewBox="0 0 ${W} ${h}">
    <defs><linearGradient id="cumG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2ee59d" stop-opacity=".35"/><stop offset="1" stop-color="#2ee59d" stop-opacity="0"/></linearGradient>
    <clipPath id="cumClip"><rect id="cumRect" x="0" y="0" width="0" height="${h}"/></clipPath></defs>`;
  [400, 200].forEach((v) => {
    if (v === 0) return;
    s += `<line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${pad.l - 6}" y="${y(v) + 3}" text-anchor="end">${fmtM(Math.round(v / 100) * 100, 0)}</text>`;
  });
  s += `<line class="zero" x1="${pad.l}" x2="${W - pad.r}" y1="${y(0)}" y2="${y(0)}"/><text x="${pad.l - 6}" y="${y(0) + 3}" text-anchor="end">0</text>`;
  s += `<g clip-path="url(#cumClip)"><path d="${area}" fill="url(#cumG)"/></g>`;
  s += `<path id="cumPath" d="${d}" fill="none" stroke="#2ee59d" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  pts.forEach((p, i) => { s += `<circle class="cdot" cx="${p[0]}" cy="${p[1]}" r="4.5" fill="#0e1320" stroke="#2ee59d" stroke-width="2"/><text class="val-lbl cl" x="${p[0]}" y="${p[1] + (values[i] < 0 ? 18 : -10)}" text-anchor="middle">${fmtM(values[i])}</text><text x="${p[0]}" y="${h - 6}" text-anchor="middle">${labels[i]}</text>`; });
  s += `<g id="zmark"><line x1="${zx}" x2="${zx}" y1="${pad.t - 6}" y2="${y(0)}" stroke="#ffe14d" stroke-dasharray="3 3"/><circle cx="${zx}" cy="${y(0)}" r="6" fill="#ffe14d"/><text x="${zx}" y="${pad.t - 10}" text-anchor="middle" style="fill:#ffe14d;font-weight:700">Recupera: 3,9 años</text></g>`;
  s += `<circle id="cumHead" cx="0" cy="0" r="7" fill="#2ee59d" style="filter:drop-shadow(0 0 8px #2ee59d)"/>`;
  s += '</svg>';
  host.innerHTML = s;
  const svg = host.firstElementChild;
  const path = svg.querySelector('#cumPath');
  const L = path.getTotalLength();
  gsap.set(path, { strokeDasharray: L, strokeDashoffset: L });
  gsap.set(svg.querySelectorAll('.cdot, .cl'), { opacity: 0 });
  gsap.set('#zmark', { opacity: 0 });
  const head = svg.querySelector('#cumHead');
  const tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 80%', end: 'bottom 35%', scrub: 0.6 } });
  tl.to(path, { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0)
    .to(svg.querySelector('#cumRect'), { attr: { width: W }, ease: 'none', duration: 1 }, 0)
    .to(head, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, ease: 'none', duration: 1 }, 0);
  pts.forEach((_, i) => tl.to([svg.querySelectorAll('.cdot')[i], svg.querySelectorAll('.cl')[i]], { opacity: 1, duration: 0.05 }, (i / (pts.length - 1)) * 0.98));
  tl.to('#zmark', { opacity: 1, duration: 0.1 }, ((k - 1 + fr) / (pts.length - 1)) * 0.98);
  return svg;
}

// Medidor semicircular TIR vs TIO
export function gauge(host, { value, ref, max = 0.6 }) {
  const cx = 150, cy = 140, r = 110;
  const ang = (v) => Math.PI - (v / max) * Math.PI;
  const pt = (v, rr = r) => [cx + rr * Math.cos(ang(v)), cy - rr * Math.sin(ang(v))];
  const arc = (a, b, rr = r) => { const p = pt(a, rr), q = pt(b, rr); return `M${p[0]} ${p[1]} A${rr} ${rr} 0 0 1 ${q[0]} ${q[1]}`; };
  const [rx, ry] = pt(ref, r + 14);
  host.innerHTML = `<svg class="chart" viewBox="0 0 300 220" style="max-width:320px">
    <path d="${arc(0, max)}" fill="none" stroke="#1b2540" stroke-width="18" stroke-linecap="round"/>
    <path d="${arc(0, ref)}" fill="none" stroke="#db6a08" stroke-width="18" stroke-linecap="round" opacity=".55"/>
    <path id="gArc" d="${arc(0, value)}" fill="none" stroke="#2ee59d" stroke-width="18" stroke-linecap="round"/>
    <line x1="${pt(ref, r - 14)[0]}" y1="${pt(ref, r - 14)[1]}" x2="${pt(ref, r + 12)[0]}" y2="${pt(ref, r + 12)[1]}" stroke="#ffe14d" stroke-width="2.5"/>
    <text x="${rx - 6}" y="${ry - 2}" text-anchor="end" style="fill:#ffe14d;font-weight:700">TIO 18 %</text>
    <g id="gNeedle"><line x1="${cx}" y1="${cy}" x2="${cx - r + 34}" y2="${cy}" stroke="#eef3ff" stroke-width="3" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="8" fill="#eef3ff"/></g>
    <text x="${cx}" y="${cy + 50}" text-anchor="middle" style="font-size:32px;fill:#eef3ff;font-weight:700" id="gVal">0 %</text>
    <text x="${cx}" y="${cy + 70}" text-anchor="middle">TIR del proyecto</text>
    <text x="${cx - r}" y="${cy + 22}" text-anchor="middle">0 %</text><text x="${cx + r}" y="${cy + 22}" text-anchor="middle">${max * 100} %</text>
  </svg>`;
  const svg = host.firstElementChild;
  const a = svg.querySelector('#gArc');
  const L = a.getTotalLength();
  gsap.set(a, { strokeDasharray: L, strokeDashoffset: L });
  gsap.set('#gNeedle', { rotation: 0, svgOrigin: `${cx} ${cy}` });
  const o = { v: 0 };
  const val = svg.querySelector('#gVal');
  gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 80%' } })
    .to(a, { strokeDashoffset: 0, duration: 2, ease: 'expo.out' }, 0)
    .to('#gNeedle', { rotation: (value / max) * 180, duration: 2, ease: 'elastic.out(1,0.5)' }, 0)
    .to(o, { v: value * 100, duration: 2, ease: 'expo.out', onUpdate: () => { val.textContent = o.v.toFixed(1).replace('.', ',') + ' %'; } }, 0);
  return svg;
}

// Dona de dos partes
export function donut(host, parts) {
  const cx = 90, cy = 90, r = 70, sw = 26;
  const C = 2 * Math.PI * r;
  const tot = parts.reduce((s, p) => s + p.v, 0);
  let off = 0;
  let s = `<svg class="chart" viewBox="0 0 180 180" style="max-width:200px;margin:0 auto">`;
  parts.forEach((p, i) => {
    const len = (p.v / tot) * C - 3;
    s += `<circle class="dseg" data-i="${i}" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${p.c}" stroke-width="${sw}" stroke-dasharray="0 ${C}" data-len="${len}" stroke-dashoffset="${-off}" transform="rotate(-90 ${cx} ${cy})"/>`;
    off += (p.v / tot) * C;
  });
  s += `<text x="${cx}" y="${cy - 2}" text-anchor="middle" style="font-size:24px;fill:#eef3ff;font-weight:700" id="dTot">0</text><text x="${cx}" y="${cy + 16}" text-anchor="middle">millones COP</text></svg>`;
  host.innerHTML = s;
  const svg = host.firstElementChild;
  const segs = svg.querySelectorAll('.dseg');
  const tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 80%' } });
  segs.forEach((c, i) => {
    tl.to(c, { attr: { 'stroke-dasharray': `${c.dataset.len} ${C}` }, duration: 1.1, ease: 'power3.inOut' }, i * 0.5);
    attachTip(c, `<b>${parts[i].n}</b><br>COP ${fmtM(parts[i].v / 1e6)} M`);
  });
  const o = { v: 0 };
  const t = svg.querySelector('#dTot');
  tl.to(o, { v: tot / 1e6, duration: 1.6, ease: 'expo.out', onUpdate: () => { t.textContent = fmtM(o.v, 1); } }, 0);
  return svg;
}
