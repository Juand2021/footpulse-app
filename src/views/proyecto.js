import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { buildGlassTitle, animateGlass, surgeGlass } from '../anim/glass.js';
import { buildPiezo, piezoTimeline, piezoAmbient, piezoSteps } from '../anim/piezo.js';
import { EQUIPO, ENERGIA, PRODUCTO, TRIBUTARIO, MERCADO, fmtNum } from '../data.js';
import { reveals, countOnView, countTo, energy, whenReady, reduced, $, $$, icon } from '../ui.js';

const I = {
  key: '<svg viewBox="0 0 24 24"><path d="M15 7a4 4 0 1 1-3.9 5H3v3h3v3h3v-3h2.1A4 4 0 0 1 15 7z"/><circle cx="16" cy="11" r="1"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  grow: '<svg viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8M15 7h6v6"/></svg>',
  drop: '<svg viewBox="0 0 24 24"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M9 14a3 3 0 0 0 3 3"/></svg>',
  screen: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
  leaf: '<svg viewBox="0 0 24 24"><path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19 13 11"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  battery: '<svg viewBox="0 0 24 24"><rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 11v2M6 10v4M10 10v4"/></svg>',
  users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6M16 4a3.5 3.5 0 0 1 0 7M18 14c2.5.5 4 2.6 4 6"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  bulb: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
  phone: '<svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>',
};

function heroFloor() {
  const cols = 7, rows = 9, s = 60;
  let t = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) t += `<rect class="ht" data-c="${c}" data-r="${r}" x="${c * s + 3}" y="${r * s + 3}" width="${s - 6}" height="${s - 6}" rx="6"/>`;
  // Capa de baldosas encendidas en HTML (solo opacidad: se anima en la GPU, sin repintar el SVG)
  const lit = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const st = `left:${((c * s + 3) / (cols * s)) * 100}%;top:${((r * s + 3) / (rows * s)) * 100}%;width:${((s - 6) / (cols * s)) * 100}%;height:${((s - 6) / (rows * s)) * 100}%`;
    lit.push(`<i class="hl hl-g" data-c="${c}" data-r="${r}" style="${st}"></i><i class="hl hl-b" data-c="${c}" data-r="${r}" style="${st}"></i>`);
  }
  return `<div class="hf-plane"><svg viewBox="0 0 ${cols * s} ${rows * s}">
    <defs><radialGradient id="htg"><stop offset="0" stop-color="#2ee59d" stop-opacity=".9"/><stop offset="1" stop-color="#2ee59d" stop-opacity="0"/></radialGradient></defs>
    <style>.ht{fill:#101828;stroke:#1f2b45;stroke-width:1.5}</style>
    ${t}</svg><div class="hf-lit">${lit.join('')}</div></div>`;
}

export default function proyecto(root) {
  const flujo = ENERGIA.flujoReferencia;
  const wh = ENERGIA.kwhDiaReferencia * 1000;
  const ledH = wh / ENERGIA.ledW;
  const cargas = wh / (ENERGIA.celularWh / ENERGIA.eficienciaCarga);
  const copMes = ENERGIA.kwhMesReferencia * ENERGIA.tarifaCopKwh;

  root.innerHTML = `
  <section class="hero" id="top">
    <div class="hero-floor">${heroFloor()}</div>
    <div class="hero-txt">
      <span class="kicker">Pisos que generan energía en Bogotá</span>
      ${buildGlassTitle()}
      <p class="lead" id="hlead">Baldosas que convierten las pisadas de la gente en energía limpia que se ve, y en datos de afluencia que se usan.</p>
      <div class="hero-ctas" id="hctas">
        <a class="btn" href="#como">Ver cómo funciona</a>
        <a class="btn ghost" href="#/cotizar">Cotizar</a>
      </div>
    </div>
    <div class="scroll-cue">DESLIZA<i></i></div>
  </section>

  <section class="sec" id="como" style="padding-bottom:24px">
    <span class="kicker y">Cómo funciona</span>
    <h2 data-split>Del pie a la pantalla en 7 pasos</h2>
    <p class="lead" data-r>Desliza despacio: la animación avanza con tu dedo.</p>
  </section>

  <section class="story" id="story">
    ${buildPiezo()}
    <div class="story-hud">
      <div><div class="story-step"><b id="stepN">01</b>/ 07</div><div class="story-prog"><i id="stepBar"></i></div></div>
      <div class="story-step" id="stepK" style="text-align:right;color:var(--orange)">${piezoSteps[0].k.toUpperCase()}</div>
    </div>
    <div class="story-caps">
      ${piezoSteps.map((s, i) => `<div class="cap" data-i="${i}"><span class="k" style="color:${s.c}">${String(i + 1).padStart(2, '0')} · ${s.k}</span><h3>${s.t}</h3><p>${s.d}</p></div>`).join('')}
    </div>
  </section>

  <section class="sec">
    <span class="kicker o">Pruébalo</span>
    <h2 data-split>Pisa la baldosa</h2>
    <p class="lead" data-r style="margin-bottom:20px">Toca la baldosa: cada toque es una pisada de unos 3 julios. Mira el contador de arriba.</p>
    <div class="stomp" data-r="zoom">
      <div class="stomp-stage"><div class="stomp-pad" id="pad" role="button" tabindex="0" aria-label="Pisar la baldosa">
        <svg class="fp-print" viewBox="0 0 74 150" aria-hidden="true"><defs><radialGradient id="fpG" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#fff4b8"/><stop offset=".6" stop-color="#ffe14d"/><stop offset="1" stop-color="#ff8a1f"/></radialGradient></defs>
          <path d="M37 4 C58 4 70 22 68 48 C66 70 58 80 58 96 C58 116 54 146 36 146 C18 146 14 124 16 104 C18 86 8 72 6 50 C4 22 16 4 37 4Z" fill="url(#fpG)" opacity=".85"/>
          <path d="M14 30 H60 M10 46 H64 M12 62 H62 M20 112 H54 M18 126 H54" stroke="#ff8a1f" stroke-width="4" stroke-linecap="round" opacity=".7"/>
        </svg>
        <span class="hint">${icon.bolt.replace('<svg', '<svg width="18" height="18" fill="currentColor"')} Toca aquí</span>
      </div>
      </div>
      <div class="stomp-stats">
        <div class="stat"><b id="sSteps">0</b><span>pisadas</span></div>
        <div class="stat"><b id="sJ">0</b><span>julios</span></div>
        <div class="stat"><b id="sLed">0,0</b><span>s de LED 1 W</span></div>
      </div>
    </div>
  </section>

  <section class="sec tight">
    <span class="kicker">A escala real</span>
    <h2 data-split>Un punto de alto tráfico, un día</h2>
    <div class="card glow" data-r="zoom" style="margin-bottom:10px">
      <div class="muted mono">${fmtNum(flujo)} personas × 2 pisadas × 3 J</div>
      <div class="big-num" style="margin:8px 0 4px"><span id="kwh">0</span><span class="unit">kWh / día</span></div>
      <div class="muted">${fmtNum(ENERGIA.kwhMesReferencia, 1)} kWh al mes · unos COP ${fmtNum(Math.round(copMes / 100) * 100)} al mes en la red.</div>
    </div>
    <div class="eq-grid" data-stagger>
      <div class="eq">${I.bulb.replace('<svg', '<svg style="stroke:var(--yellow);fill:none;stroke-width:1.7"')}<div><b id="eqLed">0</b><span>horas de LED de 10 W al día</span></div></div>
      <div class="eq">${I.phone.replace('<svg', '<svg style="stroke:var(--green);fill:none;stroke-width:1.7"')}<div><b id="eqCel">0</b><span>cargas de celular al día</span></div></div>
    </div>
    <p class="muted fine">Fuente: Informe 2 (New Atlas, 2016). Equivalencias del equipo: LED de 10 W, celular de 15 Wh al 85 %.</p>
  </section>

  <section class="sec tight">
    <span class="kicker b">Quiénes somos</span>
    <h2 data-split>Tres ingenieros, una idea que se pisa</h2>
    <p class="lead sm" data-r>Empresa integradora bogotana que diseña, instala y mantiene pisos piezoeléctricos. Nace en Evaluación de Proyectos de Ingeniería de la U. Jorge Tadeo Lozano.</p>
    <div class="team" data-stagger>
      ${EQUIPO.map((m) => `<div class="member"><div class="avatar">${m.ini}</div><b>${m.nombre.split(' ').slice(0, 2).join(' ')}</b></div>`).join('')}
    </div>
  </section>

  <section class="sec tight">
    <span class="kicker o">Valor agregado</span>
    <h2 data-split>Vendemos una experiencia medible</h2>
    <div class="vgrid" data-stagger>
      <div class="vitem o"><div class="vico">${I.key}</div><h3>Llave en mano</h3><p>Diseño, importación, obra y puesta en marcha.</p></div>
      <div class="vitem"><div class="vico">${I.chart}</div><h3>Datos de afluencia</h3><p>Quién pasa y a qué hora, en tiempo real.</p></div>
      <div class="vitem b"><div class="vico">${I.screen}</div><h3>Energía que se ve</h3><p>Pantalla de 55" con la energía en vivo.</p></div>
      <div class="vitem y"><div class="vico">${I.drop}</div><h3>Hecho para Bogotá</h3><p>Lluvia, desgaste y superficie antideslizante.</p></div>
      <div class="vitem"><div class="vico">${I.grow}</div><h3>Crece por etapas</h3><p>Piloto de 10 m² y ampliaciones de 10 m².</p></div>
      <div class="vitem o"><div class="vico">${I.pin}</div><h3>Soporte local</h3><p>Pavegen y Energy Floors no están en Colombia.</p></div>
    </div>
  </section>

  <section class="sec tight">
    <span class="kicker">Por qué es sostenible</span>
    <h2 data-split>Energía que hoy se pierde en el piso</h2>
    <div class="card" data-r="zoom" style="margin:6px 0 10px;padding:8px 12px">
      <svg viewBox="0 -14 320 180" id="cycle" style="width:100%;max-height:170px">
        <defs><marker id="ar" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10z" fill="#2ee59d"/></marker></defs>
        <path id="cyc" d="M60 75 A100 55 0 1 1 260 75 A100 55 0 1 1 60 75" fill="none" stroke="#24304a" stroke-width="2"/>
        <path id="cycHot" d="M60 75 A100 55 0 1 1 260 75 A100 55 0 1 1 60 75" fill="none" stroke="#2ee59d" stroke-width="3" stroke-linecap="round" marker-end="url(#ar)"/>
        ${[['Pasos', 160, 20, -12, '#ff8a1f'], ['Energía', 260, 75, 24, '#ffe14d'], ['Luz y datos', 160, 130, 26, '#2ee59d'], ['Más visitas', 60, 75, 24, '#3aa0ff']].map(([t, x, y, dy, c]) => `<g class="cyc-n"><circle cx="${x}" cy="${y}" r="7" fill="${c}" stroke="#0e1320" stroke-width="3"/><text x="${x}" y="${y + dy}" text-anchor="middle" fill="#eef3ff" font-family="Archivo" font-size="13" font-weight="700">${t}</text></g>`).join('')}
      </svg>
    </div>
    <div class="chips3" data-stagger>
      <div class="vitem"><div class="vico">${I.leaf}</div><h3>Cero emisiones al generar</h3></div>
      <div class="vitem b"><div class="vico">${I.battery}</div><h3>Baterías LiFePO4 seguras</h3></div>
      <div class="vitem y"><div class="vico">${I.users}</div><h3>68 % la vio útil*</h3></div>
    </div>
    <p class="muted fine">* Escenario simulado del Informe 2 (valoración 4,1 / 5).</p>
  </section>

  <section class="sec tight" id="why">
    <span class="kicker y">Por qué contratarnos</span>
    <h2 style="margin-bottom:12px">Cinco razones para firmar</h2>
    <div class="swipe" id="whyTrack">
      <article class="hcard c1"><span class="num">01</span><span class="tag">Precio</span><h3>17 % bajo el techo del cliente</h3><p>Piloto de 10 m² a COP 125 M, bajo los 150 M que el cliente aceptaba pagar.</p><div class="mono hv" style="color:var(--orange)">125 M</div></article>
      <article class="hcard c2"><span class="num">02</span><span class="tag">Incluido</span><h3>Primer año sin mantenimiento</h3><p>Garantía y datos incluidos; luego FootPulse Care.</p><div class="mono hv" style="color:var(--green)">1,2 M/mes</div></article>
      <article class="hcard c3"><span class="num">03</span><span class="tag">Datos</span><h3>Afluencia en tu celular</h3><p>Sin cámaras ni datos personales, con reporte mensual.</p><div class="mono hv" style="color:var(--blue)">24/7</div></article>
      <article class="hcard c4"><span class="num">04</span><span class="tag">Impuestos</span><h3>Beneficios Ley 1715</h3><p>Con certificado UPME: hasta 50 % deducible, sin IVA ni arancel.</p><div class="mono hv" style="color:var(--yellow)">−50 %</div></article>
      <article class="hcard c5"><span class="num">05</span><span class="tag">Rápido</span><h3>Obra en ~10 días hábiles</h3><p>Dos técnicos instalan y prueban con mínima interrupción.</p><div class="mono hv" style="color:#c99bff">10 días</div></article>
    </div>
    <div class="swipe-dots" aria-hidden="true">${[0, 1, 2, 3, 4].map((i) => `<i${i ? '' : ' class="on"'}></i>`).join('')}</div>
  </section>

  <section class="sec tight">
    <span class="kicker y">Beneficios tributarios</span>
    <h2 data-split>Lo que la ley devuelve a tu empresa</h2>
    <p class="lead sm" data-r>Ley 1715 de 2014, modificada por la Ley 2099 de 2021, para inversiones en energía no convencional y gestión eficiente.</p>
    <div class="tax" data-stagger>
      ${TRIBUTARIO.beneficios.map((b, i) => `<div class="tax-item"><div class="pct">${['50 %', '0 % IVA', '0 %', '33,33 %'][i]}</div><h3>${['Deducción de renta', 'Exclusión de IVA', 'Sin arancel', 'Depreciación anual'][i]}</h3><div class="norma">${b.norma.replace('Ley 1715 de 2014', 'L. 1715').replace(', modificado por la Ley 2099 de 2021', ' (L. 2099)')}</div></div>`).join('')}
    </div>

    <div class="card glow taxsim" data-r="zoom" style="margin-top:12px">
      <div class="q-label" style="margin:0">Ejemplo:&nbsp;<output id="tInvO">COP 125 M</output></div>
      <input type="range" id="tInv" min="10" max="60" step="1" value="10" aria-label="Metros cuadrados" />
      <div class="range-scale"><span>10 m²</span><span>60 m²</span></div>
      <div class="qrow"><span>Deducción de renta (50 %)</span><b id="tDed">COP 62,5 M</b></div>
      <div class="qrow"><span>Menos impuesto (renta 35 %)</span><b id="tSave" style="color:var(--green)">COP 21,9 M</b></div>
      <div class="taxsim-bar"><i id="tBarA" style="background:var(--c-blue);width:50%"></i><i id="tBarB" style="background:var(--c-green);width:17.5%;margin-left:2px"></i></div>
      <div class="ckey" style="margin-top:0"><span><i style="background:var(--c-blue)"></i>Deducible (50 %)</span><span><i style="background:var(--c-green)"></i>Ahorro en impuesto</span></div>
    </div>

    <div class="warn" data-r style="margin-top:10px">${icon.warn}<div><b style="color:var(--ink)">No es automático.</b> Requiere certificado UPME y validación del contador. El descuento del art. 255 ET (25 %) no se combina con esta deducción.</div></div>
    <details class="more" style="margin-top:10px"><summary>Detalle, supuestos y fuentes</summary><div class="sources">${TRIBUTARIO.beneficios.map((b) => `<p><b>${b.t}.</b> ${b.d} <i>${b.norma}.</i></p>`).join('')}<p>${TRIBUTARIO.advertencia} ${TRIBUTARIO.alternativa}</p><p>Ejemplo ilustrativo: supone certificado UPME aprobado, renta de 35 % (ET art. 240) y renta líquida suficiente; no incluye el IVA ni el arancel ahorrados.</p><p>${TRIBUTARIO.tramite}</p>${TRIBUTARIO.fuentes.map((f) => `<a href="${f.u}" target="_blank" rel="noopener">${f.n}</a>`).join('')}</div></details>
  </section>

  <section class="sec tight">
    <span class="kicker b">Mejoras y próximos pasos</span>
    <h2 data-split>Hacia dónde crece FootPulse</h2>
    <div class="timeline" style="margin-top:12px" id="road">
      <span class="tl-fill"></span>
      <div class="tl"><em>AÑO 1</em><b>2 pilotos de 10 m² y validación en campo</b></div>
      <div class="tl"><em>AÑO 2 A 5</em><b>25 % a 50 % de clientes amplía 10 m²/año</b></div>
      <div class="tl"><em>AÑO 4</em><b>Espacios públicos de 15 m²</b></div>
      <div class="tl"><em>AÑO 5</em><b>${MERCADO.metaInstalaciones} instalaciones (17 % del mercado)</b></div>
      <div class="tl"><em>FUTURO</em><b>Datos de afluencia como servicio</b></div>
    </div>
  </section>

  <section class="sec" style="text-align:center">
    <h2 data-split>¿Listo para que tu piso trabaje?</h2>
    <p class="lead" data-r style="margin:0 auto 22px;max-width:28ch">Arma tu cotización en menos de un minuto.</p>
    <a class="btn full" href="#/cotizar" data-r="zoom">Cotizar mi instalación ${icon.arrow}</a>
  </section>
  <footer class="foot"><b>FootPulse</b> · Proyecto semestral EPI Grupo 3 · Universidad de Bogotá Jorge Tadeo Lozano · 2026<br/>App demostrativa: las cifras vienen del informe final del proyecto.</footer>
  `;

  const kills = [];

  // ---------- HERO ----------
  const tiles = $$('.ht', root);
  const litAt = (cls, c, r) => root.querySelector(`.${cls}[data-c="${c}"][data-r="${r}"]`);
  // Camino de pisadas que cruza el piso, en bucle
  const path = [[3, 8], [2, 7], [3, 6], [4, 5], [3, 4], [2, 3], [3, 2], [4, 1], [3, 0]];
  const walk = gsap.timeline({ repeat: -1, repeatDelay: 0.4, paused: true });
  path.forEach(([c, r], i) => {
    const t = litAt('hl-g', c, r);
    walk.to(t, { opacity: 1, duration: 0.08 }, i * 0.32)
      .to(t, { opacity: 0.22, duration: 0.9, ease: 'power2.out' }, i * 0.32 + 0.1)
      .to(t, { opacity: 0, duration: 1.2 }, i * 0.32 + 1.0);
    // vecinos se encienden un poco (onda)
    [[c - 1, r], [c + 1, r], [c, r - 1], [c, r + 1]].forEach(([a, b]) => {
      const n = litAt('hl-b', a, b);
      if (n) walk.to(n, { opacity: 1, duration: 0.12, yoyo: true, repeat: 1 }, i * 0.32 + 0.05);
    });
    walk.call(() => energy.add(3), null, i * 0.32);
  });
  let walkOn = false;
  const heroIO = new IntersectionObserver(([e]) => { if (walkOn) (e.isIntersecting ? walk.resume() : walk.pause()); });
  heroIO.observe($('.hero', root));
  kills.push(() => heroIO.disconnect());
  kills.push(() => walk.kill());

  whenReady(() => {
    const tl = gsap.timeline();
    tl.from('.hero-floor', { opacity: 0, y: 80, duration: 1.4, ease: 'expo.out' })
      .from(tiles, { opacity: 0, scale: 0.4, transformOrigin: '50% 50%', duration: 0.6, stagger: { each: 0.008, from: 'end' }, ease: 'back.out(2)' }, 0)
      .from('.gl-line', { y: 40, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out' }, 0.25)
      .from('.hero .kicker', { opacity: 0, x: -20, duration: 0.6 }, 0.2)
      .from('#hlead', { opacity: 0, y: 20, duration: 0.8 }, 0.6)
      .from('#hctas > *', { opacity: 0, y: 20, stagger: 0.08, duration: 0.6 }, 0.75)
      .from('.scroll-cue', { opacity: 0, duration: 0.6 }, 1)
      .add(() => { walkOn = true; walk.play(); }, 0.6);
  });
  const glass = $('#glassTitle', root);
  kills.push(animateGlass(glass));
  glass.addEventListener('pointerdown', () => { surgeGlass(glass); energy.add(3); });
  gsap.to('.scroll-cue i', { scaleY: 0.3, transformOrigin: 'top', repeat: -1, yoyo: true, duration: 0.9, ease: 'sine.inOut' });
  // Parallax del hero al hacer scroll
  gsap.to('.hero-floor', { yPercent: 25, scale: 1.15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-txt', { y: -60, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });
  $('a[href="#como"]', root).addEventListener('click', (e) => { e.preventDefault(); $('#como', root).scrollIntoView({ behavior: 'smooth' }); });

  // ---------- HISTORIA PIEZOELÉCTRICA (pin + scrub) ----------
  const story = $('#story', root);
  const tl = piezoTimeline(story);
  const caps = $$('.cap', root);
  const labels = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 'end'].map((l) => tl.labels[l]);
  const total = tl.duration();
  let shown = -1;
  const showCap = (i) => {
    if (i === shown) return;
    const prev = caps[shown];
    if (prev) gsap.to(prev, { autoAlpha: 0, y: -20, duration: 0.3, overwrite: true });
    gsap.fromTo(caps[i], { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'expo.out', overwrite: true });
    $('#stepN', root).textContent = String(i + 1).padStart(2, '0');
    const k = $('#stepK', root);
    k.textContent = piezoSteps[i].k.toUpperCase();
    k.style.color = piezoSteps[i].c;
    shown = i;
  };
  showCap(0);
  ScrollTrigger.create({
    trigger: story,
    start: 'top top',
    end: '+=' + Math.round(total * 70) + '%',
    pin: true,
    scrub: reduced ? true : 0.8,
    animation: tl,
    anticipatePin: 1,
    onUpdate: (self) => {
      const t = self.progress * total;
      let i = 0;
      for (let k = 0; k < 7; k++) if (t >= labels[k] - 0.05) i = k;
      showCap(i);
      gsap.set('#stepBar', { scaleX: self.progress });
    },
  });
  kills.push(piezoAmbient(story));

  // ---------- PISA LA BALDOSA ----------
  const pad = $('#pad', root);
  gsap.set(pad, { rotateX: 26 });
  let steps = 0;
  const sSteps = $('#sSteps', root), sJ = $('#sJ', root), sLed = $('#sLed', root);
  const stomp = (x, y) => {
    steps++;
    energy.add(3);
    sSteps.textContent = fmtNum(steps);
    sJ.textContent = fmtNum(steps * 3);
    sLed.textContent = fmtNum(steps * 3, 1); // 3 J = 3 s de un LED de 1 W
    gsap.fromTo(pad, { y: 7, rotateX: 26 }, { y: 0, rotateX: 26, duration: 0.55, ease: 'elastic.out(1,0.45)' });
    const fp = pad.querySelector('.fp-print');
    gsap.fromTo(fp, { x: x - 37, y: y - 75, rotation: gsap.utils.random(-18, 18), scale: 1.25, opacity: 1 }, { scale: 1, opacity: 0, duration: 1.1, ease: 'power2.out' });
    const edge = '0 2px 0 #26324f, 0 4px 0 #1b2440, 0 6px 0 #141b31, 0 8px 0 #0e1426, 0 10px 0 #0a0f1d, 0 26px 40px rgba(0,0,0,.55)';
    gsap.fromTo(pad, { boxShadow: `inset 0 1px 0 rgba(255,255,255,.18), inset 0 0 80px rgba(46,229,157,.5), ${edge}` }, { boxShadow: `inset 0 1px 0 rgba(255,255,255,.18), inset 0 0 40px rgba(46,229,157,.08), ${edge}`, duration: 0.8 });
    for (let k = 0; k < 2; k++) {
      const r = document.createElement('span');
      r.className = 'ring';
      pad.appendChild(r);
      gsap.fromTo(r, { x: x - 20, y: y - 20, scale: 0.3, opacity: 1, borderColor: k ? '#2ee59d' : '#ffe14d' }, { scale: 5 + k * 2, opacity: 0, duration: 0.9 + k * 0.3, ease: 'expo.out', onComplete: () => r.remove() });
    }
    const z = document.createElement('span');
    z.className = 'zap';
    z.textContent = '+3 J';
    pad.appendChild(z);
    gsap.fromTo(z, { x: x - 18, y: y - 10, opacity: 1, scale: 0.6 }, { y: y - 70, scale: 1.2, opacity: 0, duration: 1, ease: 'power2.out', onComplete: () => z.remove() });
    if (navigator.vibrate) navigator.vibrate(12);
  };
  pad.addEventListener('pointerdown', (e) => {
    const b = pad.getBoundingClientRect();
    stomp(e.clientX - b.left, e.clientY - b.top);
  });
  pad.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stomp(pad.clientWidth / 2, pad.clientHeight / 2); } });
  gsap.to('.stomp-pad .hint', { opacity: 0.4, repeat: -1, yoyo: true, duration: 0.9 });

  // ---------- ESCALA ----------
  countOnView($('#kwh', root), ENERGIA.kwhDiaReferencia, { dec: 2, dur: 2 });
  countOnView($('#eqLed', root), ledH, { dur: 2 });
  countOnView($('#eqCel', root), cargas, { dur: 2 });

  // ---------- CICLO SOSTENIBLE ----------
  const hot = $('#cycHot', root);
  const L = hot.getTotalLength();
  gsap.set(hot, { strokeDasharray: L, strokeDashoffset: L });
  gsap.to(hot, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '#cycle', start: 'top 80%', end: 'bottom 40%', scrub: 1 } });
  gsap.from($$('.cyc-n', root), { scale: 0, transformOrigin: 'center', opacity: 0, stagger: 0.15, duration: 0.6, ease: 'back.out(3)', scrollTrigger: { trigger: '#cycle', start: 'top 80%' } });

  // ---------- CARRUSEL (deslizable con el dedo, sin alargar el scroll) ----------
  const track = $('#whyTrack', root);
  const hcards = $$('.hcard', root);
  const dots = $$('.swipe-dots i', root);
  gsap.from(hcards, { x: 60, opacity: 0, stagger: 0.08, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '#why', start: 'top 75%' } });
  track.addEventListener('scroll', () => {
    const i = Math.round(track.scrollLeft / (hcards[0].offsetWidth + 12));
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
  }, { passive: true });

  // ---------- SIMULADOR TRIBUTARIO ----------
  const tInv = $('#tInv', root);
  const upd = () => {
    const m2 = +tInv.value;
    const inv = m2 * PRODUCTO.precioM2;
    const ded = inv * 0.5;
    const save = ded * 0.35;
    tInv.style.setProperty('--v', ((m2 - 10) / 50) * 100 + '%');
    $('#tInvO', root).textContent = `${m2} m² · COP ${fmtNum(inv / 1e6, 1)} M`;
    $('#tDed', root).textContent = `COP ${fmtNum(ded / 1e6, 1)} M`;
    $('#tSave', root).textContent = `COP ${fmtNum(save / 1e6, 1)} M`;
  };
  tInv.addEventListener('input', upd);
  upd();
  gsap.from('#tBarA, #tBarB', { width: 0, duration: 1.2, ease: 'expo.out', stagger: 0.2, scrollTrigger: { trigger: '.taxsim', start: 'top 80%' } });

  // ---------- LÍNEA DE TIEMPO ----------
  gsap.to('#road .tl-fill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#road', start: 'top 75%', end: 'bottom 60%', scrub: true } });
  $$('#road .tl', root).forEach((el) => gsap.from(el, { opacity: 0, x: 30, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } }));

  reveals(root);

  return () => kills.forEach((k) => k());
}
