// Íconos detallados para los títulos de sección: placa con bisel + ilustración a varios tonos.
// --k = color de acento de la sección. Y = amarillo, W = blanco, D = fondo oscuro.
const Y = '#ffe14d', W = '#ffffff', D = '#0b1220', G = '#2ee59d', B = '#3aa0ff', O = '#ff8a1f';
const sw = 'stroke-linecap="round" stroke-linejoin="round"';

const frame = (inner) => `<svg viewBox="0 0 56 56" aria-hidden="true">
  <rect x="1.5" y="1.5" width="53" height="53" rx="15" fill="#0c1322" stroke="var(--k)" stroke-opacity=".6" stroke-width="1.5"/>
  <rect x="5" y="5" width="46" height="46" rx="11.5" fill="var(--k)" fill-opacity=".13"/>
  <path d="M5 16.5A11.5 11.5 0 0 1 16.5 5h23A11.5 11.5 0 0 1 51 16.5v1.5H5z" fill="${W}" fill-opacity=".07"/>
  <circle cx="9.5" cy="9.5" r="1.2" fill="${W}" fill-opacity=".3"/><circle cx="46.5" cy="9.5" r="1.2" fill="${W}" fill-opacity=".3"/>
  <circle cx="9.5" cy="46.5" r="1.2" fill="${W}" fill-opacity=".2"/><circle cx="46.5" cy="46.5" r="1.2" fill="${W}" fill-opacity=".2"/>
  ${inner}
</svg>`;

const bolt = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M7 0 0 11h5l-2 8 9-12H7l2-7z" fill="${Y}" stroke="${D}" stroke-width="1.2" ${sw}/>`;

const I = {
  energia: `<path d="M10 37 28 29l18 8-18 8z" fill="var(--k)" fill-opacity=".35" stroke="var(--k)" stroke-width="1.6" ${sw}/>
    <path d="M10 37v3l18 8 18-8v-3" fill="none" stroke="var(--k)" stroke-width="1.6" ${sw}/>
    <path d="M19 37l9-4 9 4-9 4z" fill="var(--k)" fill-opacity=".55"/>
    ${bolt(22, 9, 1.05)}<path d="M15 20l-3-2M41 20l3-2M28 6v-2" stroke="${Y}" stroke-width="1.6" ${sw}/>`,
  como: `<rect x="12" y="13" width="32" height="6" rx="2" fill="#5b6f9c" stroke="${W}" stroke-opacity=".5" stroke-width="1"/>
    <path d="M14 16h3M20 16h3M26 16h3M32 16h3M38 16h3" stroke="${W}" stroke-opacity=".6" stroke-width="1.2" ${sw}/>
    <rect x="18" y="23" width="20" height="12" rx="2" fill="#2a2150" stroke="#b59cff" stroke-width="1.3"/>
    ${[21, 26, 31, 36].map((x) => `<circle cx="${x - 1}" cy="27" r="1.4" fill="${Y}"/><circle cx="${x - 1}" cy="31.5" r="1.4" fill="#b59cff"/>`).join('')}
    <rect x="18" y="21" width="20" height="2" rx="1" fill="${O}"/><rect x="18" y="35" width="20" height="2" rx="1" fill="${B}"/>
    <path d="M14 21l-2 2 2 2-2 2 2 2-2 2 2 2M42 21l2 2-2 2 2 2-2 2 2 2-2 2" fill="none" stroke="#8aa0c8" stroke-width="1.3" ${sw}/>
    <path d="M38 41h6v-4" fill="none" stroke="${Y}" stroke-width="1.8" ${sw}/><circle cx="44" cy="43" r="2.2" fill="${Y}"/>`,
  prueba: `<path d="M9 38 28 30l19 8-19 8z" fill="var(--k)" fill-opacity=".25" stroke="var(--k)" stroke-width="1.4" ${sw}/>
    <ellipse cx="28" cy="38" rx="11" ry="4.5" fill="none" stroke="${Y}" stroke-width="1.4" opacity=".9"/>
    <ellipse cx="28" cy="38" rx="17" ry="7" fill="none" stroke="${Y}" stroke-width="1" opacity=".45"/>
    <path d="M24 9c4-1 8 1 9 6l1 11c0 3-2 5-5 5h-3c-3 0-5-2-5-5l-1-9c0-4 1-7 4-8z" fill="${W}" stroke="${D}" stroke-width="1.3"/>
    <path d="M22 17h11M21.5 22h12" stroke="var(--k)" stroke-width="1.6" ${sw}/><circle cx="27.5" cy="27" r="1.6" fill="var(--k)"/>`,
  escala: `<path d="M9 44h38" stroke="var(--k)" stroke-width="1.6" ${sw}/>
    <rect x="11" y="24" width="9" height="20" rx="1" fill="#24304a" stroke="var(--k)" stroke-width="1.2"/>
    <rect x="22" y="13" width="11" height="31" rx="1" fill="#2c3a5a" stroke="var(--k)" stroke-width="1.2"/>
    <rect x="35" y="20" width="10" height="24" rx="1" fill="#24304a" stroke="var(--k)" stroke-width="1.2"/>
    ${[[13, 27], [16.5, 27], [13, 32], [16.5, 37], [24.5, 16], [29, 16], [24.5, 21], [29, 26], [24.5, 31], [29, 36], [37.5, 23], [41, 28], [37.5, 33], [41, 38]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="2.4" height="2.6" rx=".5" fill="${i % 3 ? Y : G}"/>`).join('')}
    <path d="M27.5 13V8" stroke="${W}" stroke-width="1.2"/><circle cx="27.5" cy="7.5" r="1.6" fill="${O}"/>`,
  equipo: [[16, O], [28, G], [40, B]].map(([x, c], i) => `
    <path d="M${x - 7} ${45 - (i === 1 ? 2 : 0)}c0-6 3-9 7-9s7 3 7 9" fill="${c}" fill-opacity=".85" stroke="${D}" stroke-width="1.2"/>
    <circle cx="${x}" cy="${29 - (i === 1 ? 2 : 0)}" r="5" fill="#f2c9a0" stroke="${D}" stroke-width="1.2"/>
    <path d="M${x - 6.5} ${27 - (i === 1 ? 2 : 0)}a6.5 6.5 0 0 1 13 0z" fill="${Y}" stroke="${D}" stroke-width="1.2"/>
    <path d="M${x - 8} ${27 - (i === 1 ? 2 : 0)}h16" stroke="${D}" stroke-width="1.4" ${sw}/><path d="M${x} ${20.5 - (i === 1 ? 2 : 0)}v6" stroke="${D}" stroke-width="1"/>`).join(''),
  valor: `<path d="M16 15h24l7 10-19 21L9 25z" fill="var(--k)" fill-opacity=".35" stroke="var(--k)" stroke-width="1.6" ${sw}/>
    <path d="M9 25h38M16 15l5 10 7-10 7 10 5-10M21 25l7 21 7-21" fill="none" stroke="${W}" stroke-opacity=".7" stroke-width="1.1" ${sw}/>
    <path d="M16 15l5 10h-12z" fill="${W}" fill-opacity=".35"/><path d="M28 15l-7 10h14z" fill="${W}" fill-opacity=".15"/>
    <path d="M44 9l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="${Y}"/>`,
  sostenible: `<path d="M12 44c0-18 10-30 32-31 0 21-12 31-30 31" fill="var(--k)" fill-opacity=".35" stroke="var(--k)" stroke-width="1.6" ${sw}/>
    <path d="M12 44 37 20M22 34h8v-6M29 27h7v-5" fill="none" stroke="${W}" stroke-opacity=".85" stroke-width="1.4" ${sw}/>
    <circle cx="30" cy="34" r="2" fill="${Y}"/><circle cx="36" cy="27" r="2" fill="${Y}"/><circle cx="36" cy="22" r="1.6" fill="${B}"/>
    ${bolt(38, 33, 0.7)}`,
  contrato: `<path d="M15 9h20l7 7v29H15z" fill="#e9eefb" stroke="${D}" stroke-width="1.3" ${sw}/>
    <path d="M35 9v7h7" fill="#c3cde6" stroke="${D}" stroke-width="1.3" ${sw}/>
    <path d="M19 19h14M19 23.5h18M19 28h12" stroke="#7a87a3" stroke-width="1.6" ${sw}/>
    <path d="M19 36c3-3 4 2 7-1s3 1 6-1" fill="none" stroke="${B}" stroke-width="1.6" ${sw}/>
    <circle cx="39" cy="40" r="6.5" fill="var(--k)" stroke="${D}" stroke-width="1.3"/><path d="M36 40l2 2 4-4" fill="none" stroke="${D}" stroke-width="1.8" ${sw}/>
    <path d="M35 45l-1.5 6 3.5-2 2 2 .5-5" fill="var(--k)" stroke="${D}" stroke-width="1.1" ${sw}/>`,
  impuestos: `<path d="M14 8h28v38l-3.5-2.5-3.5 2.5-3.5-2.5-3.5 2.5-3.5-2.5-3.5 2.5-3.5-2.5L14 46z" fill="#e9eefb" stroke="${D}" stroke-width="1.3" ${sw}/>
    <path d="M19 14h18M19 18.5h12" stroke="#7a87a3" stroke-width="1.6" ${sw}/>
    <circle cx="23" cy="26" r="2.4" fill="none" stroke="${D}" stroke-width="1.6"/><circle cx="31" cy="34" r="2.4" fill="none" stroke="${D}" stroke-width="1.6"/><path d="M33 24 21 36" stroke="${D}" stroke-width="1.8" ${sw}/>
    <circle cx="40" cy="38" r="7" fill="var(--k)" fill-opacity=".9" stroke="${D}" stroke-width="1.3"/><path d="M37 38h6M40 35v6" stroke="${D}" stroke-width="1.8" ${sw}/>`,
  ruta: `<path d="M13 44c0-8 8-8 14-10s14-4 12-11-12-4-12-10" fill="none" stroke="var(--k)" stroke-opacity=".4" stroke-width="5" ${sw}/>
    <path d="M13 44c0-8 8-8 14-10s14-4 12-11-12-4-12-10" fill="none" stroke="${W}" stroke-width="1.3" stroke-dasharray="2.5 3" ${sw}/>
    <path d="M27 13V5" stroke="${W}" stroke-width="1.6" ${sw}/><path d="M27 5h11l-3 3 3 3H27" fill="${O}" stroke="${D}" stroke-width="1" ${sw}/>
    <path d="M13 44c-3-4-4-6-4-8a4 4 0 0 1 8 0c0 2-1 4-4 8z" fill="${G}" stroke="${D}" stroke-width="1.1"/><circle cx="13" cy="36" r="1.4" fill="${D}"/>
    <circle cx="35" cy="27" r="2" fill="${Y}"/>`,
  cotizador: `<rect x="14" y="8" width="28" height="40" rx="5" fill="#2c3a5a" stroke="${D}" stroke-width="1.3"/>
    <rect x="17.5" y="12" width="21" height="9" rx="2" fill="#0e2a24" stroke="var(--k)" stroke-width="1"/>
    <path d="M27 17.5h9" stroke="var(--k)" stroke-width="2" ${sw}/>
    ${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${17.5 + c * 7.3}" y="${25 + r * 7.3}" width="5.6" height="5.6" rx="1.4" fill="${r === 2 && c === 2 ? O : c === 2 ? 'var(--k)' : '#8aa0c8'}"/>`).join('')).join('')}`,
  piloto: `<path d="M10 33 28 25l18 8-18 8z" fill="#24304a" stroke="var(--k)" stroke-width="1.4" ${sw}/>
    <path d="M19 29l9 4M37 29l-9 4M28 25v16" stroke="var(--k)" stroke-opacity=".6" stroke-width="1"/>
    <path d="M28 25l9 4-9 4-9-4z" fill="var(--k)" fill-opacity=".7"/>
    <ellipse cx="38" cy="16" rx="7" ry="3" fill="${Y}" stroke="${D}" stroke-width="1.2"/><path d="M31 16v4c0 1.7 3 3 7 3s7-1.3 7-3v-4" fill="#e7b92f" stroke="${D}" stroke-width="1.2"/>
    <path d="M18 10l2 4 4 1-4 1-2 4-1-4-4-1 4-1z" fill="${W}" fill-opacity=".8"/>`,
  cotizacion: `<path d="M14 8h22l6 6v32H14z" fill="#e9eefb" stroke="${D}" stroke-width="1.3" ${sw}/>
    <path d="M19 16h13M19 21h17M19 26h10" stroke="#7a87a3" stroke-width="1.6" ${sw}/>
    <path d="M24 33h16l3 5-3 5H24z" fill="var(--k)" stroke="${D}" stroke-width="1.3" ${sw}/><circle cx="28" cy="38" r="1.6" fill="${D}"/>
    <path d="M32 38h6" stroke="${D}" stroke-width="1.6" ${sw}/>`,
  finanzas: `<path d="M10 45h36" stroke="${W}" stroke-opacity=".5" stroke-width="1.4" ${sw}/>
    <rect x="12" y="32" width="6" height="13" rx="1.5" fill="${O}"/><rect x="21" y="25" width="6" height="20" rx="1.5" fill="${Y}"/>
    <rect x="30" y="19" width="6" height="26" rx="1.5" fill="${G}"/><rect x="39" y="12" width="6" height="33" rx="1.5" fill="${B}"/>
    <path d="M12 26l9-7 9 3 13-12" fill="none" stroke="${W}" stroke-width="1.8" ${sw}/><path d="M38 10h5v5" fill="none" stroke="${W}" stroke-width="1.8" ${sw}/>`,
  rentabilidad: `<path d="M11 38a17 17 0 0 1 34 0" fill="none" stroke="#24304a" stroke-width="6" ${sw}/>
    <path d="M11 38a17 17 0 0 1 9-15" fill="none" stroke="${O}" stroke-width="6" ${sw}/>
    <path d="M20 23a17 17 0 0 1 19 0" fill="none" stroke="${G}" stroke-width="6" ${sw}/>
    <path d="M28 38l8-14" stroke="${W}" stroke-width="2.2" ${sw}/><circle cx="28" cy="38" r="3.4" fill="${W}" stroke="${D}" stroke-width="1.2"/>
    <path d="M14 45h28" stroke="var(--k)" stroke-width="1.4" ${sw}/>`,
  inversion: [0, 1, 2, 3].map((i) => `<ellipse cx="${i < 2 ? 22 : 35}" cy="${42 - (i % 2) * 6 - (i > 1 ? 4 : 0)}" rx="9" ry="3.5" fill="${Y}" stroke="${D}" stroke-width="1.2"/>
    <path d="M${i < 2 ? 13 : 26} ${42 - (i % 2) * 6 - (i > 1 ? 4 : 0)}v3c0 2 4 3.5 9 3.5s9-1.5 9-3.5v-3" fill="#e7b92f" stroke="${D}" stroke-width="1.2"/>`).reverse().join('') +
    `<path d="M36 10v12M32 14l4-4 4 4" fill="none" stroke="var(--k)" stroke-width="2" ${sw}/>`,
  ingresos: `<rect x="11" y="33" width="7" height="12" rx="1.5" fill="${O}"/><rect x="11" y="28" width="7" height="4" rx="1" fill="${G}"/>
    <rect x="21" y="25" width="7" height="20" rx="1.5" fill="${O}"/><rect x="21" y="20" width="7" height="4" rx="1" fill="${G}"/>
    <rect x="31" y="16" width="7" height="29" rx="1.5" fill="${O}"/><rect x="31" y="10" width="7" height="5" rx="1" fill="${G}"/>
    <path d="M9 45h37" stroke="${W}" stroke-opacity=".5" stroke-width="1.4" ${sw}/><path d="M42 30V12m-4 4 4-4 4 4" fill="none" stroke="${W}" stroke-width="1.8" ${sw}/>`,
  utilidad: `<path d="M22 14h12l-3 5c7 3 11 10 11 17 0 7-6 10-14 10s-14-3-14-10c0-7 4-14 11-17z" fill="#c9a24a" stroke="${D}" stroke-width="1.3" ${sw}/>
    <path d="M22 14l3 5h6l3-5" fill="#e7b92f" stroke="${D}" stroke-width="1.2" ${sw}/><path d="M24 19h8" stroke="${D}" stroke-width="1.6" ${sw}/>
    <path d="M31 28c-1-1.5-6-2-6 1 0 3 7 1.6 7 5 0 3-5 2.6-6.5 1M28.5 25.5v14" fill="none" stroke="${D}" stroke-width="1.7" ${sw}/>
    <path d="M42 11l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="var(--k)"/>`,
  flujo: `<path d="M9 30h38" stroke="${W}" stroke-opacity=".45" stroke-width="1.2" stroke-dasharray="2 2"/>
    <path d="M10 33l6 6 7-3 7-2 7-12 8-10" fill="none" stroke="var(--k)" stroke-width="3" ${sw}/>
    ${[[10, 33], [16, 39], [23, 36], [30, 34], [37, 22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="${D}" stroke="${W}" stroke-width="1.2"/>`).join('')}
    <circle cx="45" cy="12" r="4" fill="${Y}" stroke="${D}" stroke-width="1.2"/><circle cx="33.6" cy="30" r="2.6" fill="${Y}"/>`,
  costos: `<path d="M28 28V10a18 18 0 1 1-17.4 22.6z" fill="${B}" fill-opacity=".85" stroke="${D}" stroke-width="1.3" ${sw}/>
    <path d="M28 28 10.6 32.6A18 18 0 0 1 28 10z" fill="${O}" stroke="${D}" stroke-width="1.3" transform="translate(-3 -3)" ${sw}/>
    <path d="M28 28l15 10" stroke="${D}" stroke-width="1.3"/><path d="M28 28 28 10" stroke="${D}" stroke-width="1.3"/>
    <circle cx="35" cy="34" r="2" fill="${W}" fill-opacity=".8"/>`,
  escenarios: `<path d="M12 28h9" stroke="${W}" stroke-width="2" ${sw}/>
    <path d="M21 28c6 0 6-14 14-14M21 28h14M21 28c6 0 6 14 14 14" fill="none" stroke="${W}" stroke-opacity=".7" stroke-width="2" ${sw}/>
    <circle cx="12" cy="28" r="3.5" fill="var(--k)" stroke="${D}" stroke-width="1.2"/>
    <circle cx="39" cy="14" r="4.5" fill="${G}" stroke="${D}" stroke-width="1.2"/><circle cx="39" cy="28" r="4.5" fill="${Y}" stroke="${D}" stroke-width="1.2"/><circle cx="39" cy="42" r="4.5" fill="${O}" stroke="${D}" stroke-width="1.2"/>`,
  decision: `<circle cx="26" cy="30" r="15" fill="#e9eefb" stroke="${D}" stroke-width="1.3"/><circle cx="26" cy="30" r="10" fill="var(--k)" stroke="${D}" stroke-width="1.2"/>
    <circle cx="26" cy="30" r="5" fill="#e9eefb" stroke="${D}" stroke-width="1.2"/><circle cx="26" cy="30" r="2" fill="${O}"/>
    <path d="M26 30 43 13" stroke="${D}" stroke-width="2.4" ${sw}/><path d="M43 13l-1-5 5 1M43 13l5 1-1-5" fill="${Y}" stroke="${D}" stroke-width="1.1" ${sw}/>`,
  tiempo: `<path d="M17 9h22M17 47h22" stroke="${W}" stroke-width="2.4" ${sw}/>
    <path d="M19 9c0 10 9 13 9 19s-9 9-9 19h18c0-10-9-13-9-19s9-9 9-19z" fill="#e9eefb" fill-opacity=".18" stroke="${W}" stroke-width="1.4" ${sw}/>
    <path d="M22 15h12c-1 4-6 6-6 9-0-3-5-5-6-9z" fill="${Y}"/><path d="M21 45c1-6 7-8 7-12 0 4 6 6 7 12z" fill="var(--k)"/>
    <path d="M28 27v6" stroke="${Y}" stroke-width="1.4" stroke-dasharray="1.5 2" ${sw}/>`,
};

// Texto del título de sección → ícono
const MAP = [
  [/pisos que generan/i, 'energia'], [/cómo funciona/i, 'como'], [/pruébalo/i, 'prueba'], [/escala/i, 'escala'],
  [/quiénes/i, 'equipo'], [/valor agregado/i, 'valor'], [/sostenible/i, 'sostenible'], [/contratarnos/i, 'contrato'],
  [/tributarios/i, 'impuestos'], [/mejoras/i, 'ruta'], [/^cotizador/i, 'cotizador'], [/piloto/i, 'piloto'],
  [/tu cotización/i, 'cotizacion'], [/información financiera/i, 'finanzas'], [/rentabilidad/i, 'rentabilidad'],
  [/inversión/i, 'inversion'], [/ingresos/i, 'ingresos'], [/utilidad/i, 'utilidad'], [/flujo/i, 'flujo'],
  [/costos/i, 'costos'], [/escenarios/i, 'escenarios'], [/decisión/i, 'decision'], [/tiempo/i, 'tiempo'],
];

export function decorateKickers(root) {
  root.querySelectorAll('.kicker').forEach((k, idx) => {
    if (k.dataset.done) return;
    const txt = k.textContent.trim();
    const hit = MAP.find(([re]) => re.test(txt));
    const key = hit ? hit[1] : 'energia';
    k.dataset.done = '1';
    k.innerHTML = `<span class="k-ico">${frame(I[key])}</span><span class="k-txt"><small>${String(idx + 1).padStart(2, '0')}</small>${txt}</span><span class="k-wire"><i></i></span>`;
  });
}
