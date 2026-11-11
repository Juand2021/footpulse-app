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

// ---------- helpers de dibujo 3D (proyección oblicua: profundidad hacia arriba-derecha) ----------
const pts = (a) => a.map((p) => p.join(',')).join(' ');
// Caras superior y lateral de una caja cuyo frente es (x, y, w, h)
function box3d(x, y, w, h, dx, dy, top, side, stroke = 'none', extra = '') {
  return `<polygon points="${pts([[x, y], [x + w, y], [x + w + dx, y + dy], [x + dx, y + dy]])}" fill="${top}" stroke="${stroke}" stroke-width=".8" stroke-linejoin="round" ${extra}/>`
    + `<polygon points="${pts([[x + w, y], [x + w + dx, y + dy], [x + w + dx, y + h + dy], [x + w, y + h]])}" fill="${side}" stroke="${stroke}" stroke-width=".8" stroke-linejoin="round" ${extra}/>`;
}

function lattice() {
  // Cristal PZT (perovskita): capa trasera desplazada + capa frontal, enlaces entre capas.
  let s = '';
  const x0 = 135, y0 = 380, n = 6, m = 2, c = 20, bx = 7, by = -5;
  // capa trasera
  for (let j = 0; j <= m; j++) s += `<line class="bond b" x1="${x0 + bx}" y1="${y0 + j * c + by}" x2="${x0 + n * c + bx}" y2="${y0 + j * c + by}"/>`;
  for (let i = 0; i <= n; i++) s += `<line class="bond b" x1="${x0 + i * c + bx}" y1="${y0 + by}" x2="${x0 + i * c + bx}" y2="${y0 + m * c + by}"/>`;
  for (let j = 0; j <= m; j++) for (let i = 0; i <= n; i++) s += `<circle cx="${x0 + i * c + bx}" cy="${y0 + j * c + by}" r="2.2" fill="url(#gAtomB)"/>`;
  // enlaces de profundidad
  for (let j = 0; j <= m; j++) for (let i = 0; i <= n; i++) s += `<line class="bond d" x1="${x0 + i * c}" y1="${y0 + j * c}" x2="${x0 + i * c + bx}" y2="${y0 + j * c + by}"/>`;
  // capa frontal
  for (let j = 0; j <= m; j++) s += `<line class="bond" x1="${x0}" y1="${y0 + j * c}" x2="${x0 + n * c}" y2="${y0 + j * c}"/>`;
  for (let i = 0; i <= n; i++) s += `<line class="bond" x1="${x0 + i * c}" y1="${y0}" x2="${x0 + i * c}" y2="${y0 + m * c}"/>`;
  // octaedro de oxígeno alrededor del ion central (rombos tenues)
  for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) {
    const cx = x0 + i * c + 10 + bx / 2, cy = y0 + j * c + 10 + by / 2;
    s += `<path class="oct" d="M${cx} ${cy - 8} L${cx + 8} ${cy} L${cx} ${cy + 8} L${cx - 8} ${cy}Z"/>`;
  }
  for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) {
    const cx = x0 + i * c + 10 + bx / 2, cy = y0 + j * c + 10 + by / 2;
    s += `<g class="ion"><circle cx="${cx}" cy="${cy}" r="3"/><circle cx="${cx - 1}" cy="${cy - 1.1}" r="1" fill="#fff" opacity=".8"/></g>`;
  }
  for (let j = 0; j <= m; j++) for (let i = 0; i <= n; i++) s += `<circle class="atom" cx="${x0 + i * c}" cy="${y0 + j * c}" r="3"/>`;
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
  // Resorte metálico en espiral: media vuelta trasera oscura + media vuelta frontal brillante
  let back = '', front = '';
  for (let i = 0; i < 9; i++) {
    const y = 372 + i * 7;
    back += `M${x - 8} ${y} A8 2.6 0 0 1 ${x + 8} ${y} `;
    front += `M${x - 8} ${y} A8 2.6 0 0 0 ${x + 8} ${y + 1.5} `;
  }
  return `<g class="spring">
    <ellipse cx="${x}" cy="368" rx="10" ry="3" fill="#4a5878" stroke="#7d8db0" stroke-width=".8"/>
    <path d="${back}" fill="none" stroke="#2d3956" stroke-width="2.2"/>
    <path d="${front}" fill="none" stroke="url(#gMetal)" stroke-width="2.6" stroke-linecap="round"/>
    <ellipse cx="${x}" cy="434" rx="10" ry="3" fill="#3a4766" stroke="#6b7ba0" stroke-width=".8"/>
  </g>`;
}
function bars() {
  // Afluencia por hora ilustrativa (forma de curva típica con picos de mañana y tarde)
  const v = [12, 30, 62, 48, 40, 55, 70, 52, 44, 66, 88, 58];
  return v.map((h, i) => `<rect class="dbar" x="${492 + i * 21}" y="${560 - h * 1.6}" width="14" height="${h * 1.6}" rx="3"/>`).join('');
}
// Losas vecinas del andén (dan contexto de piso real)
function slab(x, w) {
  let s = `<rect x="${x}" y="350" width="${w}" height="14" fill="url(#gPlateF)" opacity=".75"/>`
    + `<polygon points="${pts([[x, 350], [x + w, 350], [x + w + 16, 338], [x + 16, 338]])}" fill="url(#gSlabTop)"/>`;
  for (let i = 1; i < 4; i++) { const xx = x + (w / 4) * i; s += `<line x1="${xx}" y1="350" x2="${xx + 16}" y2="338" stroke="#0a0f1c" stroke-width="1.2"/>`; }
  s += `<line x1="${x + 8}" y1="344" x2="${x + w + 8}" y2="344" stroke="#0a0f1c" stroke-width="1"/>`;
  return s;
}
function shoe() {
  // Pierna (jean) + zapatilla de perfil. Coordenadas locales: suela abajo en y=72, punta a la derecha.
  const tread = Array.from({ length: 18 }, (_, i) => `<rect x="${4 + i * 8}" y="69.4" width="4.6" height="2.6" rx=".8"/>`).join('');
  const laces = [0, 1, 2, 3].map((i) => {
    const x = 70 + i * 11, y = 12 + i * 4.6;
    return `<path d="M${x} ${y + 9} L${x + 9} ${y + 1}" stroke="#f4f7ff" stroke-width="2.4" stroke-linecap="round"/>`
      + `<path d="M${x} ${y + 1} L${x + 9} ${y + 9}" stroke="#d5dcef" stroke-width="2.2" stroke-linecap="round"/>`;
  }).join('');
  const eyelets = [0, 1, 2, 3, 4].map((i) => `<circle cx="${68 + i * 11}" cy="${22 + i * 4.6}" r="1.6" fill="#2a1406" stroke="#ffd7ae" stroke-width=".7"/>`).join('');
  const perf = Array.from({ length: 10 }, (_, i) => `<circle cx="${132 + (i % 5) * 4 + (i > 4 ? 2 : 0)}" cy="${44 + (i > 4 ? 4 : 0) + (i % 5) * 0.6}" r=".9"/>`).join('');
  return `
      <g class="leg">
        <path d="M12 22 C10 -50 8 -170 2 -320 L82 -320 C80 -170 72 -50 66 20 Z" fill="url(#gDenim)"/>
        <path d="M12 22 C10 -50 8 -170 2 -320 L20 -320 C22 -170 24 -50 24 22Z" fill="#050a18" opacity=".35"/>
        <path d="M60 -320 C62 -170 60 -60 56 18" stroke="#9db8ea" stroke-width="1" stroke-dasharray="3 2.4" fill="none" opacity=".6"/>
        <path d="M44 -320 C46 -170 46 -60 44 18" stroke="#fff" stroke-width="5" fill="none" opacity=".06"/>
        <path d="M10 6 C26 13 52 13 70 4 L70 16 C52 25 26 25 10 18Z" fill="#4d71b3"/>
        <path d="M10 10 C26 17 52 17 70 8" stroke="#9db8ea" stroke-width=".8" stroke-dasharray="2.4 2" fill="none"/>
        <path d="M14 17 C28 23 52 23 64 17 L64 28 C52 33 28 33 14 28Z" fill="#e9edf7"/>
        <path d="M20 20v8M26 21v9M32 22v9M38 22v9M44 22v9M50 22v8M56 20v8" stroke="#c5cde0" stroke-width="1"/>
      </g>
      <g class="sneaker">
        <path d="M2 60 C0 46 2 32 12 26 C17 23 23 23 28 25 C38 31 52 31 60 25 L66 16 C70 10 78 8 84 10 L96 16 C110 23 124 29 136 35 C148 41 155 49 155 60 Z" fill="url(#gShoe)"/>
        <path d="M2 60 C0 46 2 32 12 26 L22 26 C15 36 15 50 22 60Z" fill="#c95a08"/>
        <path d="M22 60 C15 50 15 36 22 26" stroke="#7a3a00" stroke-width=".8" stroke-dasharray="2 1.6" fill="none"/>
        <path d="M122 31 C136 37 151 45 155 60 L128 60 C130 50 128 40 122 31Z" fill="#e06a0c"/>
        <g fill="#7a3a00" opacity=".7">${perf}</g>
        <path d="M60 25 L64 6 C66 0 74 -2 81 2 L85 9 C78 7 71 9 67 15Z" fill="#ffb066"/>
        <path d="M66 4 C70 1 76 1 80 3" stroke="#fff" stroke-width="1" opacity=".6" fill="none"/>
        <path d="M12 26 C18 21 25 22 29 26 C38 31 52 31 60 25 L62 31 C52 37 38 37 29 32 C23 28 17 29 13 31Z" fill="#3a2010"/>
        <path d="M63 17 L88 11 L120 29 L110 37 L83 23 L65 28Z" fill="#ffa04a"/>
        <path d="M65 28 L83 23 L110 37" stroke="#7a3a00" stroke-width=".8" stroke-dasharray="2 1.6" fill="none"/>
        ${eyelets}${laces}
        <path d="M28 47 h14 l5 -9 l7 17 l5 -9 h34" stroke="#3a1a04" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/>
        <path d="M28 46 h14 l5 -9 l7 17 l5 -9 h34" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18 33 C50 28 92 25 132 38" stroke="#fff" stroke-width="2.4" fill="none" opacity=".22" stroke-linecap="round"/>
        <path d="M6 56 C40 54 100 54 152 56" stroke="#7a3a00" stroke-width=".9" stroke-dasharray="2.4 1.8" fill="none"/>
        <!-- entresuela con cámara de aire -->
        <path d="M-1 58 H156 C159 58 159 64 157 66 H-1 C-4 66 -4 58 -1 58Z" fill="url(#gMid)"/>
        <rect x="9" y="59.5" width="32" height="5.4" rx="2.7" fill="url(#gAir)" stroke="#bff6ff" stroke-width=".6"/>
        <path d="M13 61 h20" stroke="#fff" stroke-width=".8" opacity=".8"/>
        <path d="M48 63.4 H150" stroke="#3aa0ff" stroke-width="1.6" stroke-linecap="round"/>
        <!-- suela con labrado -->
        <path d="M-2 65 H154 C158 65 158 70 155 71.4 C153 72 150 72 148 72 H2 C-1 72 -3 70 -2 66Z" fill="#1e2536"/>
        <g fill="#0b0f18">${tread}</g>
      </g>`;
}

export function buildPiezo() {
  return `
<svg class="story-svg" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="gl2" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="soft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.4"/></filter>
    <linearGradient id="gTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4a6e"/><stop offset="1" stop-color="#1c2640"/></linearGradient>
    <linearGradient id="gPlateTop" x1="0" y1="1" x2=".3" y2="0"><stop offset="0" stop-color="#4a5f8e"/><stop offset=".6" stop-color="#36466c"/><stop offset="1" stop-color="#28344f"/></linearGradient>
    <linearGradient id="gPlateF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f3d5e"/><stop offset="1" stop-color="#18213a"/></linearGradient>
    <linearGradient id="gSlabTop" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2a3550"/><stop offset="1" stop-color="#1a2238"/></linearGradient>
    <linearGradient id="gSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#141b2e"/><stop offset="1" stop-color="#0b101e"/></linearGradient>
    <linearGradient id="gCrys" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a2c72"/><stop offset=".5" stop-color="#241d52"/><stop offset="1" stop-color="#16203d"/></linearGradient>
    <linearGradient id="gCrysTop" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#5b4bb0"/><stop offset="1" stop-color="#3a2f80"/></linearGradient>
    <linearGradient id="gMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6c7ca2"/><stop offset=".45" stop-color="#e6ecff"/><stop offset="1" stop-color="#5a6a90"/></linearGradient>
    <linearGradient id="gElec" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a95b0"/><stop offset=".5" stop-color="#c9d1e6"/><stop offset="1" stop-color="#7a86a3"/></linearGradient>
    <radialGradient id="gAtom" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#e6eeff"/><stop offset=".5" stop-color="#8aa0c8"/><stop offset="1" stop-color="#3c4d72"/></radialGradient>
    <radialGradient id="gAtomB" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#8a9cc4"/><stop offset="1" stop-color="#2b3756"/></radialGradient>
    <linearGradient id="gCap" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0f2236"/><stop offset=".3" stop-color="#2d6c98"/><stop offset=".45" stop-color="#5aa6d6"/><stop offset=".7" stop-color="#1e4a6c"/><stop offset="1" stop-color="#0c1a2a"/></linearGradient>
    <linearGradient id="gCyl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".35" stop-color="#fff" stop-opacity=".0"/><stop offset=".45" stop-color="#fff" stop-opacity=".35"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>
    <linearGradient id="gFill" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffe14d"/><stop offset="1" stop-color="#ff8a1f"/></linearGradient>
    <linearGradient id="gBat" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#0d8a5c"/><stop offset=".6" stop-color="#2ee59d"/><stop offset="1" stop-color="#b8ffe2"/></linearGradient>
    <linearGradient id="gBatF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2840"/><stop offset="1" stop-color="#0c1322"/></linearGradient>
    <linearGradient id="gScr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d2a2a"/><stop offset="1" stop-color="#0b1730"/></linearGradient>
    <linearGradient id="gGlare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset=".4" stop-color="#fff" stop-opacity=".03"/><stop offset=".41" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="gPcb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f3b2c"/><stop offset="1" stop-color="#082419"/></linearGradient>
    <linearGradient id="gDenim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1d3566"/><stop offset=".55" stop-color="#3b5f9f"/><stop offset="1" stop-color="#22407a"/></linearGradient>
    <linearGradient id="gShoe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb35c"/><stop offset=".45" stop-color="#ff8a1f"/><stop offset="1" stop-color="#d9650a"/></linearGradient>
    <linearGradient id="gMid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#b9c4dc"/></linearGradient>
    <linearGradient id="gAir" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bff6ff"/><stop offset="1" stop-color="#3aa0ff"/></linearGradient>
    <linearGradient id="gDbar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc0ff"/><stop offset="1" stop-color="#2a6fc2"/></linearGradient>
    <radialGradient id="gPrint" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff4b8"/><stop offset=".45" stop-color="#ffe14d" stop-opacity=".9"/><stop offset="1" stop-color="#ff8a1f" stop-opacity="0"/></radialGradient>
    <radialGradient id="gHalo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe14d" stop-opacity=".55"/><stop offset="1" stop-color="#ffe14d" stop-opacity="0"/></radialGradient>
    <radialGradient id="gShadow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".85"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#24304a" stroke-width="2"/></pattern>
    <pattern id="conc" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="#111829"/><path d="M0 26 L26 0" stroke="#1d2740" stroke-width="1.4"/><circle cx="6" cy="7" r="1.6" fill="#232e48"/><circle cx="18" cy="17" r="2.2" fill="#1f2942"/><circle cx="20" cy="5" r="1" fill="#2a3654"/><circle cx="9" cy="20" r="1.2" fill="#2a3654"/></pattern>
    <pattern id="grip" width="9" height="6" patternUnits="userSpaceOnUse" patternTransform="skewX(-53)"><rect x="1" y="1.4" width="5" height="2" rx="1" fill="#6a82b8" opacity=".55"/></pattern>
    <clipPath id="capClip"><rect x="75" y="572" width="50" height="76" rx="8"/></clipPath>
    <clipPath id="crysClip"><rect x="131" y="376" width="128" height="48" rx="4"/></clipPath>
  </defs>

  <g id="world">
    <!-- grilla de fondo -->
    <g opacity=".5">${Array.from({ length: 18 }, (_, i) => `<line x1="${-200 + i * 60}" y1="-200" x2="${-200 + i * 60}" y2="1100" stroke="#121a2c"/>`).join('')}
    ${Array.from({ length: 22 }, (_, i) => `<line x1="-200" y1="${-200 + i * 60}" x2="1000" y2="${-200 + i * 60}" stroke="#121a2c"/>`).join('')}</g>

    <!-- andén en corte: losas vecinas + concreto -->
    <g id="ground">
      <rect x="-60" y="364" width="520" height="98" fill="url(#conc)"/>
      <rect x="-60" y="456" width="520" height="6" fill="url(#hatch)"/>
      <line x1="-60" y1="462" x2="460" y2="462" stroke="#2c3a5a" stroke-width="1.5"/>
      ${slab(-60, 148)}${slab(302, 160)}
      <line x1="-60" y1="350" x2="460" y2="350" stroke="#56689a" stroke-width=".8" opacity=".6"/>
    </g>

    <!-- cables: funda oscura + núcleo -->
    <g class="wires" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g class="wire-sh">
        <path d="M295 400 H330 V510 H240"/><path d="M95 420 H60 V510 H150"/><path d="M170 530 V552 H100 V572"/>
        <path d="M125 610 H245"/><path d="M290 640 V664 H195 V680"/><path d="M270 432 V470 H440"/>
      </g>
      <path id="w1" d="M295 400 H330 V510 H240" class="wire"/>
      <path id="w2" d="M95 420 H60 V510 H150" class="wire"/>
      <path id="w3" d="M170 530 V552 H100 V572" class="wire"/>
      <path id="w4" d="M125 610 H245" class="wire"/>
      <path id="w5" d="M290 640 V664 H195 V680" class="wire"/>
      <path id="w6" d="M270 432 V470 H440" class="wire data"/>
      <g class="wire-hl">
        <path d="M295 399 H329 V510"/><path d="M95 419 H61 V510"/><path d="M170 530 V551 H101"/><path d="M125 609 H245"/><path d="M290 640 V663 H196"/>
      </g>
      <path class="wire-hot" d="M295 400 H330 V510 H240"/>
      <path class="wire-hot" d="M95 420 H60 V510 H150"/>
      <path class="wire-hot h3" d="M170 530 V552 H100 V572"/>
      <path class="wire-hot h4" d="M125 610 H245"/>
      <path class="wire-hot h5" d="M290 640 V664 H195 V680"/>
      <g class="plug">${[[240, 510], [150, 510], [100, 572], [245, 610], [195, 680], [440, 470]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2"/>`).join('')}</g>
    </g>

    <!-- BALDOSA (corte 3D) -->
    <g id="tile">
      <!-- interior: pared trasera y fondo -->
      <polygon points="${pts([[101, 366], [289, 366], [305, 354], [117, 354]])}" fill="#0a0f1d"/>
      <rect x="101" y="364" width="188" height="70" fill="#0d1426"/>
      <polygon points="${pts([[101, 434], [289, 434], [303, 424], [115, 424]])}" fill="#141d33"/>
      <path d="M115 424 V366 M303 424 V356" stroke="#1d2842" stroke-width="1"/>
      <!-- paredes cortadas (rayado de corte) -->
      <rect x="95" y="364" width="6" height="76" fill="url(#hatch)" stroke="#3a4a72" stroke-width="1"/>
      <rect x="289" y="364" width="6" height="76" fill="url(#hatch)" stroke="#3a4a72" stroke-width="1"/>
      <rect x="95" y="434" width="200" height="6" fill="url(#hatch)" stroke="#3a4a72" stroke-width="1"/>
      <polygon points="${pts([[295, 364], [311, 352], [311, 428], [295, 440]])}" fill="url(#gSide)" stroke="#2c3a5a" stroke-width="1"/>
      ${spring(112)}${spring(278)}
      <g id="crystal">
        <polygon points="${pts([[259, 376], [268, 370], [268, 418], [259, 424]])}" fill="#120f2e" stroke="#4a3d96" stroke-width="1"/>
        <polygon points="${pts([[131, 376], [259, 376], [268, 370], [140, 370]])}" fill="url(#gCrysTop)"/>
        <rect x="131" y="376" width="128" height="48" rx="4" fill="url(#gCrys)" stroke="#6d5bd0" stroke-width="1.5"/>
        <g clip-path="url(#crysClip)">
          <g id="lat">${lattice()}</g>
          <path d="M131 376 L170 376 L140 424 L131 424Z" fill="#fff" opacity=".05"/>
        </g>
        <polygon points="${pts([[131, 372], [259, 372], [267, 366], [139, 366]])}" fill="#a9b4cf" opacity=".8"/>
        <rect id="elTop" x="131" y="372" width="128" height="4" rx="1" fill="#5a647d"/>
        <rect id="elBot" x="131" y="424" width="128" height="4" rx="1" fill="#5a647d"/>
        <rect x="131" y="372" width="128" height="1.2" fill="#fff" opacity=".35"/>
        <rect x="131" y="424" width="128" height="1.2" fill="#fff" opacity=".25"/>
        <g id="charges">${charges()}</g>
        <g id="dipoles" stroke="#ffe14d" stroke-width="1.6" fill="none" opacity="0">
          ${[150, 190, 230].map((x) => `<path d="M${x} 414 V388 M${x - 4} 392 L${x} 386 L${x + 4} 392"/>`).join('')}
        </g>
      </g>
      <g id="sensorBox">
        <rect x="262" y="427" width="16" height="7" rx="2" fill="#1a2440" stroke="#3aa0ff" stroke-width=".8"/>
      </g>
      <circle id="sensor" cx="270" cy="430.5" r="3.4" fill="#3aa0ff" filter="url(#gl)"/>
      <g id="plate">
        <polygon points="${pts([[300, 350], [316, 338], [316, 352], [300, 364]])}" fill="url(#gSide)" stroke="#4a5d88" stroke-width="1"/>
        <polygon points="${pts([[90, 350], [300, 350], [316, 338], [106, 338]])}" fill="url(#gPlateTop)" stroke="#5a70a3" stroke-width="1" stroke-linejoin="round"/>
        <polygon points="${pts([[96, 348.5], [296, 348.5], [309, 339], [109, 339]])}" fill="url(#grip)"/>
        <path d="M195 350 L211 338 M142 350 L158 338 M248 350 L264 338" stroke="#1a2440" stroke-width="1.2"/>
        <path d="M98 344 H306" stroke="#1a2440" stroke-width="1"/>
        <g id="print" opacity="0">
          <path d="M122 348 C112 344 124 339 146 339 L262 339.5 C290 340 294 346 270 348.6 Z" fill="url(#gPrint)" filter="url(#soft)"/>
          <path d="M128 347.4 C122 344.6 130 341 146 341 L258 341.4 C280 341.8 284 345.6 266 347.6 Z" fill="none" stroke="#fff4b8" stroke-width="1" opacity=".9"/>
        </g>
        <rect x="90" y="350" width="210" height="14" fill="url(#gPlateF)" stroke="#4a5d88" stroke-width="1.2"/>
        <rect x="90" y="350" width="210" height="1.4" fill="#8da3d6" opacity=".7"/>
        ${Array.from({ length: 13 }, (_, i) => `<rect x="${98 + i * 15.5}" y="354.5" width="8" height="2.4" rx="1.2" fill="#0b1120"/>`).join('')}
        <rect x="90" y="361" width="210" height="3" fill="#0b1120" opacity=".5"/>
      </g>
      <text class="lbl" x="195" y="482" text-anchor="middle">Corte de una baldosa</text>
    </g>

    <!-- etiquetas del zoom -->
    <g id="zoomLbls" opacity="0">
      <text class="zl" x="195" y="368" text-anchor="middle">electrodo (+)</text>
      <text class="zl" x="195" y="436" text-anchor="middle">electrodo (−)</text>
      <text class="zl s" x="270" y="390">cristal PZT</text>
      <path d="M268 392 h-6" stroke="#b59cff" stroke-width=".4"/>
    </g>

    <!-- voltímetro -->
    <g id="volt" opacity="0" transform="translate(195 318)">
      <rect x="-48" y="-15" width="100" height="28" rx="14" fill="#000" opacity=".4" transform="translate(3 3)"/>
      <rect x="-50" y="-17" width="100" height="28" rx="14" fill="#0b1020" stroke="#ffe14d" stroke-width="1"/>
      <rect x="-46" y="-14" width="92" height="9" rx="4.5" fill="#fff" opacity=".06"/>
      <text id="voltTxt" class="vt" x="0" y="1.5" text-anchor="middle">0,0 V</text>
    </g>

    <!-- PIERNA + ZAPATO -->
    <ellipse id="shadow" cx="198" cy="345" rx="50" ry="6" fill="url(#gShadow)" opacity=".35"/>
    <g transform="translate(120 228)"><g id="shoe">
      <g id="shoeBody" transform="rotate(-14 4 72)">${shoe()}</g>
    </g></g>
    <g id="impact" opacity="0">
      <ellipse cx="195" cy="346" rx="110" ry="10" fill="none" stroke="#ffe14d" stroke-width="2.2"/>
      <ellipse cx="195" cy="346" rx="140" ry="14" fill="none" stroke="#ff8a1f" stroke-width="1.4"/>
      <ellipse cx="195" cy="346" rx="170" ry="18" fill="none" stroke="#ff8a1f" stroke-width=".8" opacity=".6"/>
      ${[-1, 1].map((s) => [0, 1, 2].map((k) => `<path d="M${195 + s * (84 + k * 14)} ${334 - k * 6} l${s * 10} ${-8 - k * 3}" stroke="#ffe14d" stroke-width="1.6" stroke-linecap="round"/>`).join('')).join('')}
    </g>

    <!-- CONTROLADOR (placa electrónica) -->
    <g id="ctrl">
      ${box3d(150, 490, 90, 40, 12, -9, '#14523b', '#06180f', '#1f7a56')}
      <rect x="150" y="490" width="90" height="40" rx="3" fill="url(#gPcb)" stroke="#2ee59d" stroke-width="1.2"/>
      <path d="M154 497 h18 v8 h10 M154 524 h22 l6 -6 h12 M236 497 h-14 v12 M236 524 h-10 l-4 -5" stroke="#c9a54a" stroke-width=".9" fill="none" opacity=".85"/>
      ${[0, 1, 2, 3, 4].map((i) => `<rect x="${186 + i * 4.4}" y="494.5" width="1.6" height="3" fill="#c9d1e6"/><rect x="${186 + i * 4.4}" y="514.5" width="1.6" height="3" fill="#c9d1e6"/>`).join('')}
      <rect x="183" y="497" width="25" height="18" rx="2" fill="#0b0f18" stroke="#2a3348" stroke-width=".8"/>
      <circle cx="187" cy="501" r="1.2" fill="#2a3348"/>
      <path d="M187 510 h4 l2 -4 l3 7 l2 -3 h5" stroke="#3aa0ff" stroke-width="1.2" fill="none" stroke-linejoin="round"/>
      ${[0, 1].map((i) => `<g transform="translate(${160 + i * 10} 512)"><rect x="-3" y="-6" width="6" height="11" rx="1" fill="#2a3c66"/><ellipse cx="0" cy="-6" rx="3" ry="1.2" fill="#8ea6d8"/></g>`).join('')}
      <rect x="216" y="500" width="14" height="8" rx="1.2" fill="#202838"/><rect x="216" y="512" width="14" height="8" rx="1.2" fill="#202838"/>
      <circle cx="232" cy="524" r="2" fill="#2ee59d" filter="url(#gl)"/>
      <text class="lbl s" x="195" y="546" text-anchor="middle">controlador</text>
    </g>

    <!-- SUPERCAPACITOR (cilindro) -->
    <g id="supercap">
      <ellipse cx="100" cy="648" rx="25" ry="5.5" fill="#0a1626"/>
      <rect x="75" y="572" width="50" height="76" rx="8" fill="url(#gCap)" stroke="#3aa0ff" stroke-width="1.2"/>
      <g clip-path="url(#capClip)"><rect id="capFill" x="75" y="572" width="50" height="76" fill="url(#gFill)" opacity=".9"/></g>
      <rect x="75" y="572" width="50" height="76" rx="8" fill="url(#gCyl)"/>
      <rect x="75" y="604" width="50" height="16" fill="#0b1626" opacity=".75"/>
      <text x="100" y="615.5" text-anchor="middle" class="cap-t">SUPERCAP</text>
      <path d="M75 585 Q100 591 125 585 M75 636 Q100 642 125 636" stroke="#9cc8ec" stroke-width=".8" fill="none" opacity=".6"/>
      <ellipse cx="100" cy="573" rx="25" ry="5.5" fill="#3a6f98" stroke="#7cc0ff" stroke-width="1"/>
      <ellipse cx="100" cy="573" rx="18" ry="3.6" fill="#24506f"/>
      <g><rect x="88" y="562" width="5" height="10" rx="1" fill="#c9d1e6"/><ellipse cx="90.5" cy="562" rx="2.5" ry="1" fill="#fff"/>
         <rect x="107" y="562" width="5" height="10" rx="1" fill="#c9d1e6"/><ellipse cx="109.5" cy="562" rx="2.5" ry="1" fill="#fff"/></g>
      <text class="lbl s" x="100" y="668" text-anchor="middle">supercapacitor</text>
    </g>

    <!-- BATERÍA (caja 3D) -->
    <g id="battery">
      ${box3d(245, 580, 90, 60, 14, -10, '#1d3a33', '#0a1a16', '#2ee59d')}
      <rect x="245" y="580" width="90" height="60" rx="5" fill="url(#gBatF)" stroke="#2ee59d" stroke-width="1.3"/>
      <rect x="249" y="584" width="82" height="52" rx="3" fill="#050a12" stroke="#1d3a33" stroke-width="1"/>
      ${[0, 1, 2, 3].map((i) => `<rect class="cell" x="${252 + i * 20.5}" y="587" width="16" height="46" rx="3" fill="url(#gBat)"/>`).join('')}
      <polygon points="249,584 285,584 262,636 249,636" fill="#fff" opacity=".06"/>
      <g transform="translate(270 573)"><rect x="-4" y="-7" width="8" height="7" rx="1" fill="#c94a3a"/><ellipse cx="0" cy="-7" rx="4" ry="1.4" fill="#ff8a7a"/><text x="0" y="-10" text-anchor="middle" class="cap-t">+</text></g>
      <g transform="translate(312 573)"><rect x="-4" y="-7" width="8" height="7" rx="1" fill="#2a3348"/><ellipse cx="0" cy="-7" rx="4" ry="1.4" fill="#6b7ba0"/><text x="0" y="-10" text-anchor="middle" class="cap-t">−</text></g>
      <text class="lbl s" x="290" y="658" text-anchor="middle">batería LiFePO4</text>
    </g>

    <!-- PANTALLA + LED -->
    <g id="screen">
      <ellipse cx="195" cy="812" rx="44" ry="6" fill="#141c30" stroke="#2c3a5a" stroke-width="1"/>
      <ellipse cx="195" cy="810" rx="40" ry="4.4" fill="#1e2842"/>
      <path d="M186 792 h18 l3 18 h-24z" fill="#24304a"/>
      <polygon points="${pts([[95, 680], [295, 680], [305, 673], [105, 673]])}" fill="#1d2640"/>
      <polygon points="${pts([[295, 680], [305, 673], [305, 785], [295, 792]])}" fill="#0b101c" stroke="#2c3a5a" stroke-width=".8"/>
      <rect x="95" y="680" width="200" height="112" rx="8" fill="#0a0f1b" stroke="#4a5d88" stroke-width="1.6"/>
      <rect x="101" y="686" width="188" height="100" rx="4" fill="#050810"/>
      <rect id="scrOn" x="101" y="686" width="188" height="100" rx="4" fill="url(#gScr)" opacity="0"/>
      <g id="scrUI" opacity="0">
        <text class="scr-k" x="113" y="706">ENERGÍA DE TUS PASOS</text>
        <text id="scrJ" class="scr-v" x="113" y="742">0 J</text>
        <text class="scr-k" x="113" y="770" id="scrSteps">0 pisadas hoy</text>
        <path d="M232 760 l10 -14 l10 6 l12 -22 l12 10 V770 H232Z" fill="#2ee59d" opacity=".12"/>
        <path d="M232 760 l10 -14 l10 6 l12 -22 l12 10" stroke="#2ee59d" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="276" cy="740" r="2.6" fill="#2ee59d" filter="url(#gl)"/>
        <circle cx="280" cy="700" r="2.4" fill="#ff8a1f"/>
      </g>
      <rect x="101" y="686" width="188" height="100" rx="4" fill="url(#gGlare)" pointer-events="none"/>
      <circle cx="195" cy="788.6" r="1.2" fill="#2ee59d" opacity=".7"/>
      <!-- riel de LED -->
      ${box3d(40, 836, 310, 6, 8, -5, '#1f2a46', '#0c1222')}
      <rect x="40" y="836" width="310" height="6" rx="1.5" fill="#141c30" stroke="#2c3a5a" stroke-width=".8"/>
      ${Array.from({ length: 9 }, (_, i) => `<ellipse class="halo" cx="${55 + i * 35}" cy="830" rx="15" ry="15" fill="url(#gHalo)" opacity="0"/>`).join('')}
      ${Array.from({ length: 9 }, (_, i) => `<rect x="${50 + i * 35}" y="831" width="10" height="5" rx="1" fill="#3a4766"/>`).join('')}
      ${Array.from({ length: 9 }, (_, i) => `<circle class="led" cx="${55 + i * 35}" cy="830" r="5"/>`).join('')}
      ${Array.from({ length: 9 }, (_, i) => `<circle cx="${53.4 + i * 35}" cy="828.2" r="1.5" fill="#fff" opacity=".55"/>`).join('')}
    </g>

    <!-- DATOS -->
    <g id="gateway">
      ${box3d(440, 452, 40, 34, 10, -7, '#1c2a4a', '#0a1222', '#3aa0ff')}
      <rect x="440" y="452" width="40" height="34" rx="4" fill="#101a30" stroke="#3aa0ff" stroke-width="1.3"/>
      <rect x="446" y="458" width="28" height="5" rx="2.5" fill="#060b16"/>
      ${[0, 1, 2].map((i) => `<circle cx="${450 + i * 6}" cy="460.5" r="1.4" fill="${['#2ee59d', '#3aa0ff', '#ffe14d'][i]}"/>`).join('')}
      ${[0, 1, 2, 3, 4].map((i) => `<rect x="${447 + i * 5.4}" y="470" width="3" height="10" rx="1" fill="#0a1222"/>`).join('')}
      <rect x="466" y="438" width="3.4" height="14" rx="1.2" fill="#6b7ba0"/>
      <rect x="466" y="424" width="3.4" height="16" rx="1.7" fill="#2a3348"/>
      <circle cx="467.7" cy="423" r="3" fill="#3aa0ff" filter="url(#gl)"/>
      ${[0, 1, 2].map((i) => `<path class="wave" d="M${476 + i * 9} ${409 - i * 4} q${8 + i * 4} 14 0 ${28 + i * 8}" stroke="#3aa0ff" stroke-width="2" fill="none" opacity="0"/>`).join('')}
      <text class="lbl s" x="460" y="502" text-anchor="middle">pasarela</text>
    </g>
    <g id="dash">
      <path d="M770 322 L782 312 V610 L770 600Z" fill="#070b16" stroke="#2c3a5a" stroke-width="1"/>
      <path d="M502 300 L514 290 H760 L770 300Z" fill="#141c30"/>
      <rect x="480" y="300" width="290" height="300" rx="22" fill="#0e1424" stroke="#3aa0ff" stroke-width="1.5"/>
      <rect x="488" y="308" width="274" height="284" rx="16" fill="none" stroke="#1d2842" stroke-width="1"/>
      <rect x="600" y="306" width="50" height="5" rx="2.5" fill="#060b16"/>
      <text class="scr-k" x="500" y="334">PLATAFORMA · AFLUENCIA POR HORA</text>
      <circle cx="742" cy="331" r="3" fill="#2ee59d" filter="url(#gl)"/>
      <text id="dashN" class="dash-v" x="500" y="374">0</text>
      <text class="scr-k" x="500" y="394">personas detectadas</text>
      ${[0, 1, 2, 3].map((i) => `<line x1="492" y1="${420 + i * 35}" x2="752" y2="${420 + i * 35}" stroke="#18213a" stroke-dasharray="2 3"/>`).join('')}
      <line x1="492" y1="560" x2="752" y2="560" stroke="#2c3a5a"/>
      <g id="dbars">${bars()}</g>
      <text class="scr-k" x="492" y="580">6 a. m.</text><text class="scr-k" x="752" y="580" text-anchor="end">6 p. m.</text>
      <path d="M480 322 Q480 300 502 300 H640 L560 600 H502 Q480 600 480 578Z" fill="#fff" opacity=".025"/>
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

  // Paso 2: la pisada (talón primero, luego apoya toda la planta)
  const body = q('#shoeBody')[0];
  const tilt = { a: -14 };
  const setTilt = () => body.setAttribute('transform', `rotate(${tilt.a.toFixed(2)} 4 72)`);
  tl.addLabel('s2')
    .to(q('#shoe'), { y: 50, duration: 0.6, ease: 'power3.in' }, 's2')
    .to(tilt, { a: -5, duration: 0.6, ease: 'power3.in', onUpdate: setTilt }, 's2')
    .to(tilt, { a: 0, duration: 0.22, ease: 'power2.out', onUpdate: setTilt }, 's2+=0.58')
    .fromTo(q('#print'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 's2+=0.6')
    .to(q('#shadow'), { attr: { rx: 82 }, opacity: 0.6, duration: 0.6, ease: 'power3.in' }, 's2')
    .to(q('#plate'), { y: 8, duration: 0.25, ease: 'power2.out' }, 's2+=0.55')
    .to(q('#shoe'), { y: 58, duration: 0.25, ease: 'power2.out' }, 's2+=0.55')
    .to(q('.spring'), { scaleY: 0.86, transformOrigin: '50% 100%', duration: 0.25 }, 's2+=0.55')
    .to(q('#lat'), { scaleY: 0.86, svgOrigin: '195 400', duration: 0.25 }, 's2+=0.55')
    .fromTo(q('#impact'), { opacity: 1, scale: 0.6, svgOrigin: '195 346' }, { opacity: 0, scale: 1.4, duration: 0.6, immediateRender: false }, 's2+=0.6')
    .to(W, { ...cam(195, 362, 1.6), duration: 1 }, 's2');

  // Paso 3: zoom al cristal, iones se desplazan y separan cargas
  tl.addLabel('s3')
    .to(W, { ...cam(195, 398, 2.85), duration: 1.2 }, 's3')
    .to(q('#shoe'), { opacity: 0.15, duration: 0.6 }, 's3')
    .to(q('#print'), { opacity: 0.45, duration: 0.6 }, 's3')
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
      .to(q('#plate'), { y: 8, duration: 0.12 }, `${at}+0.35`)
      .to(q('#print'), { opacity: 0.2, duration: 0.15 }, at)
      .to(q('#print'), { opacity: 1, duration: 0.12 }, `${at}+0.35`)
      .fromTo(q('#impact'), { opacity: 0.9, scale: 0.6, svgOrigin: '195 346' }, { opacity: 0, scale: 1.3, duration: 0.4, immediateRender: false }, `${at}+0.36`);
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
    .to(q('.led'), { fill: '#fff4b8', filter: 'drop-shadow(0 0 6px #ffe14d)', duration: 0.2, stagger: 0.07 }, 's6+=0.8')
    .to(q('.halo'), { opacity: 1, duration: 0.25, stagger: 0.07 }, 's6+=0.8');

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
