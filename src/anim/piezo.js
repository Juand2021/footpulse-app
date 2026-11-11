// Historia piezoeléctrica ligada al scroll.
// Una escena SVG "mundo" con una cámara (escala + traslado) que recorre:
// baldosa → pisada → cristal PZT → pulso → almacenamiento → uso → datos.
import { gsap } from 'gsap';
import { energy } from '../ui.js';

const VW = 390, VH = 844, VCX = 195, VCY = 340;
const cam = (cx, cy, s) => ({ x: VCX - cx * s, y: VCY - cy * s, scale: s });

const STEPS = [
  { k: 'La baldosa', c: '#ff8a1f', t: 'Una baldosa por cada 50 × 50 cm', d: 'Superficie antideslizante y, por dentro, elementos piezoeléctricos que convierten presión en electricidad. Van 4 por metro cuadrado.' },
  { k: 'La pisada', c: '#ff8a1f', t: 'El peso hunde la superficie', d: 'Cada paso empuja la placa superior unos milímetros y comprime el cristal que está debajo.' },
  { k: 'Efecto piezoeléctrico', c: '#ffe14d', t: 'El cristal se deforma y separa cargas', d: 'En el cristal PZT los iones se desplazan con la presión: las cargas positivas van a un lado y las negativas al otro. Aparece un voltaje.' },
  { k: 'El pulso', c: '#ffe14d', t: 'Unos 3 julios por pisada', d: 'Cada pisada entrega cerca de 5 W durante 0,6 s. Es un pulso muy rápido, por eso lo atrapan supercapacitores.' },
  { k: 'Almacenamiento', c: '#2ee59d', t: 'Se guarda en baterías LiFePO4', d: 'Los supercapacitores pasan la energía a baterías de litio-ferrofosfato, seguras y de larga vida útil.' },
  { k: 'Uso visible', c: '#2ee59d', t: 'Luz LED y energía en pantalla', d: 'El controlador alimenta luces LED de bajo consumo y la pantalla de 55" muestra en vivo la energía que generaron los pasos.' },
  { k: 'Datos', c: '#3aa0ff', t: 'Cada paso también es un dato', d: 'Un sensor cuenta las pisadas y la pasarela envía la afluencia por hora a la plataforma del cliente. Sin cámaras ni datos personales.' },
];

function lattice() {
  // Cristal PZT: 6 × 2 celdas de 20 px. Esquinas (Pb/O) + ion central (Ti/Zr).
  let s = '';
  const x0 = 135, y0 = 380, n = 6, m = 2, c = 20;
  for (let j = 0; j <= m; j++) s += `<line class="bond" x1="${x0}" y1="${y0 + j * c}" x2="${x0 + n * c}" y2="${y0 + j * c}"/>`;
  for (let i = 0; i <= n; i++) s += `<line class="bond" x1="${x0 + i * c}" y1="${y0}" x2="${x0 + i * c}" y2="${y0 + m * c}"/>`;
  for (let j = 0; j <= m; j++) for (let i = 0; i <= n; i++) s += `<circle class="atom" cx="${x0 + i * c}" cy="${y0 + j * c}" r="2.8"/>`;
  for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) s += `<circle class="ion" cx="${x0 + i * c + 10}" cy="${y0 + j * c + 10}" r="2.6"/>`;
  return s;
}
function charges() {
  let s = '';
  for (let i = 0; i < 7; i++) {
    const x = 140 + i * 18;
    s += `<g transform="translate(${x} 398)"><g class="qp"><circle r="4"/><path d="M-2.2 0h4.4M0-2.2v4.4"/></g></g>`;
    s += `<g transform="translate(${x + 6} 402)"><g class="qn"><circle r="4"/><path d="M-2.2 0h4.4"/></g></g>`;
  }
  return s;
}
function spring(x) {
  let d = `M${x} 366`;
  for (let i = 0; i < 8; i++) d += ` L${x + (i % 2 ? -7 : 7)} ${370 + i * 7}`;
  d += ` L${x} 430`;
  return `<path class="spring" d="${d}"/>`;
}
function bars() {
  // Afluencia por hora ilustrativa (forma de curva típica con picos de mañana y tarde)
  const v = [12, 30, 62, 48, 40, 55, 70, 52, 44, 66, 88, 58];
  return v.map((h, i) => `<rect class="dbar" x="${492 + i * 21}" y="${560 - h * 1.6}" width="14" height="${h * 1.6}" rx="3"/>`).join('');
}

export function buildPiezo() {
  return `
<svg class="story-svg" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="gl2" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8"/></filter>
    <linearGradient id="gTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4a6e"/><stop offset="1" stop-color="#1c2640"/></linearGradient>
    <linearGradient id="gCrys" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2150"/><stop offset="1" stop-color="#16203d"/></linearGradient>
    <linearGradient id="gCap" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#16324a"/><stop offset=".5" stop-color="#245a80"/><stop offset="1" stop-color="#16324a"/></linearGradient>
    <linearGradient id="gFill" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffe14d"/><stop offset="1" stop-color="#ff8a1f"/></linearGradient>
    <linearGradient id="gBat" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#12a570"/><stop offset="1" stop-color="#2ee59d"/></linearGradient>
    <linearGradient id="gScr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d2a2a"/><stop offset="1" stop-color="#0b1730"/></linearGradient>
    <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#24304a" stroke-width="2"/></pattern>
    <clipPath id="capClip"><rect x="75" y="572" width="50" height="76" rx="8"/></clipPath>
    <clipPath id="crysClip"><rect x="131" y="376" width="128" height="48" rx="4"/></clipPath>
  </defs>

  <g id="world">
    <!-- grilla de fondo -->
    <g opacity=".5">${Array.from({ length: 18 }, (_, i) => `<line x1="${-200 + i * 60}" y1="-200" x2="${-200 + i * 60}" y2="1100" stroke="#121a2c"/>`).join('')}
    ${Array.from({ length: 22 }, (_, i) => `<line x1="-200" y1="${-200 + i * 60}" x2="1000" y2="${-200 + i * 60}" stroke="#121a2c"/>`).join('')}</g>

    <!-- piso -->
    <rect x="-60" y="440" width="520" height="22" fill="url(#hatch)"/>
    <line x1="-60" y1="440" x2="460" y2="440" stroke="#2c3a5a" stroke-width="2"/>

    <!-- cables (fondo y pulso) -->
    <g class="wires" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path id="w1" d="M295 400 H330 V510 H240" class="wire"/>
      <path id="w2" d="M95 420 H60 V510 H150" class="wire"/>
      <path id="w3" d="M170 530 V552 H100 V572" class="wire"/>
      <path id="w4" d="M125 610 H245" class="wire"/>
      <path id="w5" d="M290 640 V664 H195 V680" class="wire"/>
      <path id="w6" d="M270 432 V470 H440" class="wire data"/>
      <path class="wire-hot" d="M295 400 H330 V510 H240"/>
      <path class="wire-hot" d="M95 420 H60 V510 H150"/>
      <path class="wire-hot h3" d="M170 530 V552 H100 V572"/>
      <path class="wire-hot h4" d="M125 610 H245"/>
      <path class="wire-hot h5" d="M290 640 V664 H195 V680"/>
    </g>

    <!-- BALDOSA (corte) -->
    <g id="tile">
      <rect x="95" y="364" width="200" height="76" rx="6" fill="#0f1628" stroke="#2c3a5a" stroke-width="2"/>
      ${spring(112)}${spring(278)}
      <g id="crystal">
        <rect x="131" y="376" width="128" height="48" rx="4" fill="url(#gCrys)" stroke="#5b4bb0" stroke-width="1.5"/>
        <g clip-path="url(#crysClip)"><g id="lat">${lattice()}</g></g>
        <rect id="elTop" x="131" y="372" width="128" height="4" rx="2" fill="#5a647d"/>
        <rect id="elBot" x="131" y="424" width="128" height="4" rx="2" fill="#5a647d"/>
        <g id="charges">${charges()}</g>
        <g id="dipoles" stroke="#ffe14d" stroke-width="1.6" fill="none" opacity="0">
          ${[150, 190, 230].map((x) => `<path d="M${x} 414 V388 M${x - 4} 392 L${x} 386 L${x + 4} 392"/>`).join('')}
        </g>
      </g>
      <g id="plate">
        <rect x="90" y="350" width="210" height="14" rx="4" fill="url(#gTop)" stroke="#4a5d88" stroke-width="1.5"/>
        ${Array.from({ length: 13 }, (_, i) => `<rect x="${98 + i * 15.5}" y="352" width="8" height="3" rx="1.5" fill="#5f75a8"/>`).join('')}
      </g>
      <circle id="sensor" cx="270" cy="432" r="5" fill="#3aa0ff" filter="url(#gl)"/>
      <text class="lbl" x="195" y="482" text-anchor="middle">Corte de una baldosa</text>
    </g>

    <!-- etiquetas del zoom -->
    <g id="zoomLbls" opacity="0">
      <text class="zl" x="195" y="368" text-anchor="middle">electrodo (+)</text>
      <text class="zl" x="195" y="436" text-anchor="middle">electrodo (−)</text>
      <text class="zl s" x="263" y="390">cristal PZT</text>
    </g>

    <!-- voltímetro -->
    <g id="volt" opacity="0" transform="translate(195 318)">
      <rect x="-46" y="-16" width="92" height="26" rx="13" fill="#0b1020" stroke="#ffe14d" stroke-width="1"/>
      <text id="voltTxt" class="vt" x="0" y="2" text-anchor="middle">0,0 V</text>
    </g>

    <!-- ZAPATO -->
    <ellipse id="shadow" cx="198" cy="349" rx="50" ry="5" fill="#000" opacity=".25"/>
    <g id="shoe" transform="translate(120 228)">
      <g id="shoeBody">
        <path d="M0 62 V46 C0 31 9 23 28 21 L58 15 C68 5 84 0 100 4 L116 10 C127 15 137 27 148 40 C154 47 154 55 151 62 Z" fill="#ff8a1f"/>
        <path d="M58 15 C68 5 84 0 100 4 L104 22 C90 22 72 26 60 30 Z" fill="#ffb066"/>
        <path d="M66 22 l10 -4 M72 28 l10 -4 M80 34 l9 -4" stroke="#7a3a00" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M110 30 C122 34 132 40 140 48" stroke="#ffd2a6" stroke-width="2" fill="none" stroke-linecap="round"/>
        <rect x="-2" y="60" width="156" height="12" rx="6" fill="#eef3ff"/>
        <rect x="-2" y="68" width="156" height="4" rx="2" fill="#9fb0d0"/>
      </g>
    </g>
    <g id="impact" opacity="0">
      <ellipse cx="195" cy="350" rx="110" ry="10" fill="none" stroke="#ffe14d" stroke-width="2"/>
      <ellipse cx="195" cy="350" rx="140" ry="14" fill="none" stroke="#ff8a1f" stroke-width="1.4"/>
    </g>

    <!-- CONTROLADOR -->
    <g id="ctrl">
      <rect x="150" y="490" width="90" height="40" rx="8" fill="#101a30" stroke="#3aa0ff" stroke-width="1.5"/>
      <path d="M168 510 h10 l4 -8 l6 16 l4 -8 h10" stroke="#3aa0ff" stroke-width="2" fill="none" stroke-linejoin="round"/>
      <text class="lbl s" x="195" y="546" text-anchor="middle">controlador</text>
    </g>

    <!-- SUPERCAPACITOR -->
    <g id="supercap">
      <rect x="75" y="572" width="50" height="76" rx="8" fill="url(#gCap)" stroke="#3aa0ff" stroke-width="1.5"/>
      <g clip-path="url(#capClip)"><rect id="capFill" x="75" y="572" width="50" height="76" fill="url(#gFill)" opacity=".9"/></g>
      <ellipse cx="100" cy="573" rx="25" ry="5" fill="#2c5578" stroke="#3aa0ff" stroke-width="1"/>
      <text class="lbl s" x="100" y="668" text-anchor="middle">supercapacitor</text>
    </g>

    <!-- BATERÍA -->
    <g id="battery">
      <rect x="245" y="580" width="90" height="60" rx="8" fill="#0f1828" stroke="#2ee59d" stroke-width="1.5"/>
      <rect x="335" y="598" width="6" height="24" rx="2" fill="#2ee59d"/>
      ${[0, 1, 2, 3].map((i) => `<rect class="cell" x="${252 + i * 20.5}" y="587" width="16" height="46" rx="3" fill="url(#gBat)"/>`).join('')}
      <text class="lbl s" x="290" y="658" text-anchor="middle">batería LiFePO4</text>
    </g>

    <!-- PANTALLA + LED -->
    <g id="screen">
      <rect x="183" y="790" width="24" height="18" fill="#24304a"/>
      <rect x="160" y="806" width="70" height="6" rx="3" fill="#24304a"/>
      <rect x="95" y="680" width="200" height="112" rx="10" fill="#0a0f1b" stroke="#3a4a6e" stroke-width="2"/>
      <rect id="scrOn" x="101" y="686" width="188" height="100" rx="6" fill="url(#gScr)" opacity="0"/>
      <g id="scrUI" opacity="0">
        <text class="scr-k" x="113" y="706">ENERGÍA DE TUS PASOS</text>
        <text id="scrJ" class="scr-v" x="113" y="742">0 J</text>
        <text class="scr-k" x="113" y="770" id="scrSteps">0 pisadas hoy</text>
        <path d="M232 760 l10 -14 l10 6 l12 -22 l12 10" stroke="#2ee59d" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      ${Array.from({ length: 9 }, (_, i) => `<circle class="led" cx="${55 + i * 35}" cy="830" r="5"/>`).join('')}
      <rect x="40" y="836" width="310" height="4" rx="2" fill="#1b2540"/>
    </g>

    <!-- DATOS -->
    <g id="gateway">
      <rect x="440" y="452" width="40" height="34" rx="6" fill="#101a30" stroke="#3aa0ff" stroke-width="1.5"/>
      <line x1="460" y1="452" x2="460" y2="430" stroke="#3aa0ff" stroke-width="2"/>
      <circle cx="460" cy="428" r="3" fill="#3aa0ff"/>
      ${[0, 1, 2].map((i) => `<path class="wave" d="M${468 + i * 9} ${414 - i * 4} q${8 + i * 4} 14 0 ${28 + i * 8}" stroke="#3aa0ff" stroke-width="2" fill="none" opacity="0"/>`).join('')}
      <text class="lbl s" x="460" y="502" text-anchor="middle">pasarela</text>
    </g>
    <g id="dash">
      <rect x="480" y="300" width="290" height="300" rx="22" fill="#0e1424" stroke="#3aa0ff" stroke-width="1.5"/>
      <text class="scr-k" x="500" y="330">PLATAFORMA · AFLUENCIA POR HORA</text>
      <text id="dashN" class="dash-v" x="500" y="372">0</text>
      <text class="scr-k" x="500" y="392">personas detectadas</text>
      <line x1="492" y1="560" x2="752" y2="560" stroke="#24304a"/>
      <g id="dbars">${bars()}</g>
      <text class="scr-k" x="492" y="580">6 a. m.</text><text class="scr-k" x="752" y="580" text-anchor="end">6 p. m.</text>
    </g>

    <!-- partículas de energía -->
    <g id="pulses">${Array.from({ length: 10 }, () => '<circle class="pulse" cx="0" cy="0" r="4"/>').join('')}</g>
  </g>
</svg>`;
}

export const piezoSteps = STEPS;

// Crea la línea de tiempo. Devuelve la timeline (para scrub con ScrollTrigger).
export function piezoTimeline(root) {
  const q = gsap.utils.selector(root);
  const W = q('#world')[0];
  const pulses = q('.pulse');
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  const volt = q('#voltTxt')[0];
  const scrJ = q('#scrJ')[0];
  const scrSteps = q('#scrSteps')[0];
  const dashN = q('#dashN')[0];

  // Estado inicial
  gsap.set(W, { svgOrigin: '0 0' });
  gsap.set(W, { ...cam(195, 395, 1.45) });
  gsap.set(q('#capFill'), { scaleY: 0, transformOrigin: '50% 100%' });
  gsap.set(q('.cell'), { scaleY: 0, transformOrigin: '50% 100%' });
  gsap.set(q('.dbar'), { scaleY: 0, transformOrigin: '50% 100%' });
  gsap.set(q('.qp, .qn'), { opacity: 0 });
  gsap.set(pulses, { opacity: 0 });
  gsap.set(q('.wire-hot'), { strokeDasharray: '0 1000' });

  // Paso 1: presentación de la baldosa (cámara se acerca levemente)
  tl.addLabel('s1')
    .from(q('#shoe'), { y: -140, opacity: 0, duration: 1 }, 's1')
    .from(q('#shadow'), { opacity: 0, duration: 1 }, 's1')
    .to(W, { ...cam(195, 375, 1.55), duration: 1 }, 's1');

  // Paso 2: la pisada
  tl.addLabel('s2')
    .to(q('#shoe'), { y: 50, duration: 0.6, ease: 'power3.in' }, 's2')
    .to(q('#shadow'), { attr: { rx: 82 }, opacity: 0.6, duration: 0.6, ease: 'power3.in' }, 's2')
    .to(q('#plate'), { y: 8, duration: 0.25, ease: 'power2.out' }, 's2+=0.55')
    .to(q('#shoe'), { y: 58, duration: 0.25, ease: 'power2.out' }, 's2+=0.55')
    .to(q('.spring'), { scaleY: 0.86, transformOrigin: '50% 100%', duration: 0.25 }, 's2+=0.55')
    .to(q('#lat'), { scaleY: 0.86, svgOrigin: '195 400', duration: 0.25 }, 's2+=0.55')
    .fromTo(q('#impact'), { opacity: 1, scale: 0.6, svgOrigin: '195 350' }, { opacity: 0, scale: 1.4, duration: 0.6 }, 's2+=0.6')
    .to(W, { ...cam(195, 362, 1.6), duration: 1 }, 's2');

  // Paso 3: zoom al cristal, iones se desplazan y separan cargas
  tl.addLabel('s3')
    .to(W, { ...cam(195, 398, 2.85), duration: 1.2 }, 's3')
    .to(q('#shoe'), { opacity: 0.15, duration: 0.6 }, 's3')
    .to(q('#zoomLbls'), { opacity: 1, duration: 0.5 }, 's3+=0.6')
    .to(q('.ion'), { y: -3.5, fill: '#ffe14d', duration: 0.6, stagger: 0.02 }, 's3+=0.5')
    .to(q('#dipoles'), { opacity: 1, duration: 0.4 }, 's3+=0.9')
    .to(q('.qp'), { opacity: 1, y: -16, duration: 0.7, stagger: 0.03 }, 's3+=0.9')
    .to(q('.qn'), { opacity: 1, y: 16, duration: 0.7, stagger: 0.03 }, 's3+=0.9')
    .to(q('#elTop'), { fill: '#ff8a1f', duration: 0.4 }, 's3+=1.4')
    .to(q('#elBot'), { fill: '#3aa0ff', duration: 0.4 }, 's3+=1.4')
    .to(q('#volt'), { opacity: 1, y: 30, duration: 0.5 }, 's3+=1.2')
    .to({ v: 0 }, { v: 5, duration: 0.8, onUpdate() { volt.textContent = '≈ ' + this.targets()[0].v.toFixed(1).replace('.', ',') + ' W pico'; } }, 's3+=1.3');

  // Paso 4: pulso por los cables (vista general)
  tl.addLabel('s4')
    .to(W, { ...cam(195, 545, 0.98), duration: 1.2 }, 's4')
    .to(q('#zoomLbls, #volt, #dipoles'), { opacity: 0, duration: 0.4 }, 's4')
    .to(q('#shoe'), { opacity: 1, duration: 0.4 }, 's4');
  // tres pisadas rápidas, cada una dispara pulsos
  for (let k = 0; k < 3; k++) {
    const at = `s4+=${0.6 + k * 0.55}`;
    tl.to(q('#shoe'), { y: 26, duration: 0.2, ease: 'power2.out' }, at)
      .to(q('#plate'), { y: 0, duration: 0.15 }, at)
      .to(q('#shoe'), { y: 58, duration: 0.2, ease: 'power3.in' }, `${at}+0.2`)
      .to(q('#plate'), { y: 8, duration: 0.12 }, `${at}+0.35`);
    pulses.slice(k * 2, k * 2 + 2).forEach((p, i) => {
      tl.set(p, { opacity: 1, fill: i ? '#3aa0ff' : '#ffe14d' }, `${at}+0.35`)
        .to(p, { motionPath: { path: q(i ? '#w2' : '#w1')[0], align: q(i ? '#w2' : '#w1')[0], alignOrigin: [0.5, 0.5] }, duration: 0.5, ease: 'none' }, `${at}+0.35`)
        .to(p, { opacity: 0, duration: 0.1 }, `${at}+0.85`);
    });
  }
  tl.to(q('.wire-hot').slice(0, 2), { strokeDasharray: '400 0', duration: 1.4, ease: 'none' }, 's4+=0.9');

  // Paso 5: supercap se llena rápido y pasa a la batería
  tl.addLabel('s5')
    .to(W, { ...cam(200, 600, 1.28), duration: 1 }, 's5')
    .to(q('.h3'), { strokeDasharray: '200 0', duration: 0.5, ease: 'none' }, 's5+=0.2')
    .to(q('#capFill'), { scaleY: 1, duration: 0.5, ease: 'expo.out' }, 's5+=0.6')
    .to(q('#supercap'), { filter: 'drop-shadow(0 0 10px #ffe14d)', duration: 0.3 }, 's5+=0.7')
    .to(q('.h4'), { strokeDasharray: '200 0', duration: 0.5, ease: 'none' }, 's5+=1.0')
    .to(q('#capFill'), { scaleY: 0.25, duration: 0.8 }, 's5+=1.2')
    .to(q('.cell'), { scaleY: 1, duration: 0.5, stagger: 0.2, ease: 'back.out(2)' }, 's5+=1.2')
    .to(q('#battery'), { filter: 'drop-shadow(0 0 10px #2ee59d)', duration: 0.4 }, 's5+=1.8');
  pulses.slice(6, 10).forEach((p, i) => {
    const path = q(i < 2 ? '#w3' : '#w4')[0];
    tl.set(p, { opacity: 1, fill: '#ffe14d' }, `s5+=${0.2 + i * 0.3}`)
      .to(p, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, duration: 0.4, ease: 'none' }, `s5+=${0.2 + i * 0.3}`)
      .to(p, { opacity: 0, duration: 0.1 }, `s5+=${0.6 + i * 0.3}`);
  });

  // Paso 6: pantalla y LED
  tl.addLabel('s6')
    .to(W, { ...cam(195, 745, 1.35), duration: 1 }, 's6')
    .to(q('.h5'), { strokeDasharray: '200 0', duration: 0.5, ease: 'none' }, 's6+=0.2')
    .to(q('#scrOn'), { opacity: 1, duration: 0.3 }, 's6+=0.6')
    .from(q('#scrOn'), { scaleY: 0.02, svgOrigin: '195 736', duration: 0.3, ease: 'expo.out' }, 's6+=0.6')
    .to(q('#scrUI'), { opacity: 1, duration: 0.3 }, 's6+=0.85')
    .to({ v: 0 }, {
      v: 1, duration: 1.2, ease: 'none',
      onUpdate() {
        const v = this.targets()[0].v;
        scrJ.textContent = Math.round(v * 1842).toLocaleString('es-CO') + ' J';
        scrSteps.textContent = Math.round(v * 614).toLocaleString('es-CO') + ' pisadas';
      },
    }, 's6+=0.9')
    .to(q('.led'), { fill: '#fff4b8', filter: 'drop-shadow(0 0 6px #ffe14d)', duration: 0.2, stagger: 0.07 }, 's6+=0.8');

  // Paso 7: datos
  tl.addLabel('s7')
    .to(W, { ...cam(588, 445, 0.96), duration: 1.3 }, 's7')
    .to(q('#w6'), { stroke: '#3aa0ff', duration: 0.4 }, 's7+=0.4')
    .to(q('.wave'), { opacity: 1, duration: 0.3, stagger: 0.12 }, 's7+=0.8')
    .to(q('.dbar'), { scaleY: 1, duration: 0.6, stagger: 0.05, ease: 'back.out(1.6)' }, 's7+=0.9')
    .to({ v: 0 }, { v: 1, duration: 1, ease: 'none', onUpdate() { dashN.textContent = Math.round(this.targets()[0].v * 150000).toLocaleString('es-CO'); } }, 's7+=0.9')
    .addLabel('end');

  return tl;
}

// Animaciones ambientales que corren solas (no dependen del scroll)
export function piezoAmbient(root) {
  const q = gsap.utils.selector(root);
  const a = [];
  a.push(gsap.to(q('.wave'), { x: 6, repeat: -1, yoyo: true, duration: 0.8, ease: 'sine.inOut', stagger: 0.15 }));
  a.push(gsap.to(q('#sensor'), { opacity: 0.3, repeat: -1, yoyo: true, duration: 0.6 }));
  a.push(gsap.to(q('.wire-hot'), { strokeDashoffset: -40, repeat: -1, duration: 1.2, ease: 'none' }));
  return () => a.forEach((t) => t.kill());
}

export function stepEnergy() { energy.add(3); }
