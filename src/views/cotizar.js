import { gsap } from 'gsap';
import { ENERGIA, PRODUCTO, OPERACION, NORMAS, fmtNum } from '../data.js';
import { countTo, energy, whenReady, $, $$, icon } from '../ui.js';

const SITIOS = [
  { id: 'cc', n: 'Centro comercial', s: 'Entradas y plazoletas', m2: 10, ico: '<svg viewBox="0 0 24 24"><path d="M3 9h18l-2-5H5zM4 9v11h16V9M9 20v-6h6v6"/></svg>' },
  { id: 'uni', n: 'Universidad', s: 'Accesos y bibliotecas', m2: 10, ico: '<svg viewBox="0 0 24 24"><path d="M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5"/></svg>' },
  { id: 'pub', n: 'Entidad pública', s: 'Parques, plazas, IDRD', m2: 15, ico: '<svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V10M19 21V10M9 21V10M15 21V10M2 10l10-6 10 6z"/></svg>' },
  { id: 'est', n: 'Estación o portal', s: 'Transporte masivo', m2: 15, ico: '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M8 21l2-4M16 21l-2-4"/><circle cx="9" cy="14" r=".5"/><circle cx="15" cy="14" r=".5"/></svg>' },
  { id: 'emp', n: 'Empresa u oficinas', s: 'Lobbies corporativos', m2: 10, ico: '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2"/></svg>' },
  { id: 'evt', n: 'Recinto o estadio', s: 'Eventos y escenarios', m2: 10, ico: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="9" ry="5"/><ellipse cx="12" cy="12" rx="4" ry="2"/><path d="M3 12v4c0 2.8 4 5 9 5s9-2.2 9-5v-4"/></svg>' },
];

const UBIC = [
  { id: 'int', n: 'Interior' },
  { id: 'cub', n: 'Exterior cubierto' },
  { id: 'desc', n: 'Exterior abierto' },
];

const st = { sitio: null, tipo: 'nueva', m2: 10, ubic: 'int', flujo: 60000, upme: false, fecha: null };
const IVA = 0.19;

// flujo en escala logarítmica para el slider (5.000 a 300.000)
const fMin = Math.log(5000), fMax = Math.log(300000);
const toFlujo = (v) => Math.round(Math.exp(fMin + (v / 100) * (fMax - fMin)) / 1000) * 1000;
const fromFlujo = (f) => ((Math.log(f) - fMin) / (fMax - fMin)) * 100;

const M = (v, d = 1) => 'COP ' + fmtNum(v / 1e6, d) + ' M';

export default function cotizar(root) {
  root.innerHTML = `
  <section class="sec" style="padding-top:96px">
    <span class="kicker">Cotizador</span>
    <h2 id="qT">Diseña tu piso de energía</h2>
    <p class="lead" id="qL" style="margin-bottom:22px">Cuatro pasos. Validamos el tamaño, las normas y la disponibilidad de obra al instante.</p>
    <div class="steps" id="bar">${'<i></i>'.repeat(4)}</div>
    <div id="wiz" style="position:relative"></div>
  </section>`;

  const wiz = $('#wiz', root);
  const bar = $$('#bar i', root);
  let step = 0;

  const setBar = () => bar.forEach((b, i) => b.style.setProperty('--p', i < step ? 1 : i === step ? 0.5 : 0));

  function nav(prevOk = true, nextLabel = 'Siguiente', nextOk = true) {
    return `<div style="display:flex;gap:10px;margin-top:8px">
      ${step > 0 && prevOk ? `<button class="btn ghost" data-a="back" aria-label="Atrás" style="flex:0 0 60px;padding:0">←</button>` : ''}
      <button class="btn full" data-a="next" ${nextOk ? '' : 'disabled style="opacity:.4"'}>${nextLabel} ${icon.arrow}</button>
    </div>`;
  }

  const screens = [
    // 1. Tipo de sitio
    () => `
      <div class="q"><div class="q-label">1 · ¿Dónde lo quieres instalar?</div>
        <div class="chips">${SITIOS.map((s) => `<button class="chip" data-sitio="${s.id}" aria-pressed="${st.sitio === s.id}">${s.ico}<b>${s.n}</b><small>${s.s}</small></button>`).join('')}</div>
      </div>${nav(true, 'Siguiente', !!st.sitio)}`,
    // 2. Tamaño y ubicación
    () => `
      <div class="q"><div class="q-label">2 · Tipo de proyecto</div>
        <div class="seg" data-g="tipo"><button data-v="nueva" aria-pressed="${st.tipo === 'nueva'}">Instalación nueva</button><button data-v="amp" aria-pressed="${st.tipo === 'amp'}">Ampliación</button></div>
      </div>
      <div class="q"><div class="q-label">Área a cubrir <output id="m2o">${st.m2} m²</output></div>
        <input type="range" id="m2" min="4" max="120" step="1" value="${st.m2}" aria-label="Metros cuadrados"/>
        <div class="range-scale"><span>4 m²</span><span>mín. 10</span><span>120 m²</span></div>
        <div class="tile-preview" id="tp"></div>
        <p class="muted" style="margin-top:8px" id="tpL"></p>
      </div>
      <div class="q"><div class="q-label">Ubicación</div>
        <div class="seg" data-g="ubic">${UBIC.map((u) => `<button data-v="${u.id}" aria-pressed="${st.ubic === u.id}">${u.n}</button>`).join('')}</div>
      </div>
      <div class="val" id="val2"></div>${nav()}`,
    // 3. Flujo
    () => `
      <div class="q"><div class="q-label">3 · Personas que pasan al día <output id="flo">${fmtNum(st.flujo)}</output></div>
        <input type="range" id="fl" min="0" max="100" step="0.5" value="${fromFlujo(st.flujo)}" aria-label="Personas por día"/>
        <div class="range-scale"><span>5.000</span><span>50.000</span><span>300.000</span></div>
      </div>
      <div class="card glow" style="margin-bottom:16px">
        <span class="muted mono">ENERGÍA ESTIMADA</span>
        <div class="big-num" style="margin:10px 0 2px"><span id="eWh">0</span><span class="unit">Wh / día</span></div>
        <div class="stomp-stats" style="margin-top:14px">
          <div class="stat"><b id="eLed">0</b><span>h de LED 10 W</span></div>
          <div class="stat"><b id="eCel">0</b><span>cargas de celular</span></div>
          <div class="stat"><b id="eMes">0</b><span>kWh al mes</span></div>
        </div>
        <svg viewBox="0 0 300 60" style="width:100%;margin-top:14px" id="flowViz"></svg>
      </div>
      <div class="val" id="val3"></div>
      <p class="muted" style="margin-bottom:14px">Cálculo: personas × 2 pisadas × 3 J (Informe 2). La energía depende del flujo, no del área.</p>${nav()}`,
    // 4. Fecha
    () => `
      <div class="q"><div class="q-label">4 · Elige cuándo empezar la obra</div>
        <div class="card" style="padding:16px"><div style="display:flex;justify-content:space-between;margin-bottom:10px"><b class="mono" id="calM"></b><span class="muted" id="calCap"></span></div>
          <div class="cal" id="cal"></div>
          <div class="legend"><span><i style="background:rgba(46,229,157,.4)"></i>Disponible</span><span><i style="background:rgba(255,90,106,.4)"></i>Equipo en otra obra</span><span><i style="background:rgba(255,255,255,.08)"></i>Preparación</span></div>
        </div>
        <p class="muted" style="margin-top:8px">Disponibilidad simulada por la app con la capacidad del informe: 2 técnicos, unas 20 obras al año. Las primeras semanas se reservan para visita técnica, diseño, firma e importación.</p>
      </div>
      <div class="q"><div class="q-label">Certificado UPME (Ley 1715)</div>
        <div class="seg" data-g="upme"><button data-v="1" aria-pressed="${st.upme}">Lo tramitaremos</button><button data-v="0" aria-pressed="${!st.upme}">Sin certificado</button></div>
      </div>
      ${nav(true, 'Ver mi cotización', !!st.fecha)}`,
  ];

  function render(dir = 1) {
    setBar();
    const old = wiz.firstElementChild;
    const el = document.createElement('div');
    el.innerHTML = step < 4 ? screens[step]() : quote();
    if (old) {
      gsap.to(old, { x: -60 * dir, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => old.remove() });
      gsap.set(el, { position: 'relative' });
    }
    wiz.appendChild(el);
    if (old) gsap.set(old, { position: 'absolute', top: 0, left: 0, right: 0 });
    gsap.from(el, { x: 70 * dir, opacity: 0, duration: 0.55, delay: old ? 0.18 : 0, ease: 'expo.out' });
    gsap.from(el.querySelectorAll('.chip, .seg, input, .card, .stat, .val-row, .q-label'), { y: 24, opacity: 0, stagger: 0.035, duration: 0.6, delay: old ? 0.22 : 0.05, ease: 'expo.out' });
    bind(el);
    if (step < 4) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function bind(el) {
    el.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => {
      if (b.disabled) return;
      if (b.dataset.a === 'next') { step++; render(1); }
      if (b.dataset.a === 'back') { step--; render(-1); }
      if (b.dataset.a === 'restart') { step = 0; render(-1); }
      if (b.dataset.a === 'send') sent();
    }));
    el.querySelectorAll('[data-sitio]').forEach((b) => b.addEventListener('click', () => {
      st.sitio = b.dataset.sitio;
      const s = SITIOS.find((x) => x.id === st.sitio);
      st.m2 = Math.max(st.m2, s.m2);
      if (st.sitio === 'pub' || st.sitio === 'est') st.m2 = Math.max(15, st.m2);
      el.querySelectorAll('[data-sitio]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      gsap.fromTo(b.querySelector('svg'), { scale: 0.6, rotate: -15 }, { scale: 1, rotate: 0, duration: 0.6, ease: 'back.out(3)' });
      const n = el.querySelector('[data-a="next"]');
      n.disabled = false; n.style.opacity = 1;
      gsap.fromTo(n, { scale: 0.95 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1,0.5)' });
    }));
    el.querySelectorAll('.seg').forEach((g) => g.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      g.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
      const k = g.dataset.g;
      st[k] = k === 'upme' ? b.dataset.v === '1' : b.dataset.v;
      if (step === 1) upd2(el);
    })));
    if (step === 1) {
      const r = el.querySelector('#m2');
      r.addEventListener('input', () => { st.m2 = +r.value; upd2(el); });
      upd2(el, true);
    }
    if (step === 2) {
      const r = el.querySelector('#fl');
      r.addEventListener('input', () => { st.flujo = toFlujo(+r.value); upd3(el); });
      upd3(el, true);
    }
    if (step === 3) cal(el);
    if (step === 4) animQuote(el);
  }

  // ---------- Paso 2: vista previa y validación ----------
  let lastCells = -1;
  function upd2(el, first) {
    const r = el.querySelector('#m2');
    r.style.setProperty('--v', ((st.m2 - 4) / 116) * 100 + '%');
    el.querySelector('#m2o').textContent = st.m2 + ' m²';
    const tp = el.querySelector('#tp');
    const cols = 10, cells = Math.ceil(st.m2);
    tp.style.gridTemplateColumns = `repeat(${cols},1fr)`;
    if (cells !== lastCells || first) {
      const total = Math.ceil(Math.max(cells, 20) / cols) * cols;
      tp.innerHTML = Array.from({ length: total }, (_, i) => `<i class="${i < cells ? 'on' : ''}${st.tipo === 'nueva' && i === 0 && cells >= 10 ? ' screen' : ''}"></i>`).join('');
      const on = tp.querySelectorAll('i.on');
      if (cells > lastCells && !first) gsap.from([...on].slice(Math.max(0, lastCells)), { scale: 0, duration: 0.35, ease: 'back.out(3)', stagger: 0.01 });
      lastCells = cells;
    }
    el.querySelector('#tpL').innerHTML = `Cada cuadro es 1 m² = <b style="color:var(--ink)">${PRODUCTO.baldosasPorM2} baldosas</b>. Total: <b style="color:var(--ink)">${fmtNum(st.m2 * 4)} baldosas</b>.${st.tipo === 'nueva' ? ' El cuadro naranja marca la pantalla.' : ''}`;
    validations(el.querySelector('#val2'), rules2());
    const n = el.querySelector('[data-a="next"]');
    const bad = st.tipo === 'nueva' && st.m2 < PRODUCTO.minimoM2;
    n.disabled = bad; n.style.opacity = bad ? 0.4 : 1;
  }

  function rules2() {
    const out = [];
    const pub = st.sitio === 'pub' || st.sitio === 'est';
    if (st.tipo === 'nueva' && st.m2 < 10) out.push(['er', `El mínimo de una instalación nueva es ${PRODUCTO.minimoM2} m²: por debajo, la pantalla y las baterías no se justifican.`]);
    else if (st.tipo === 'nueva') out.push(['ok', `Cumple el mínimo de ${PRODUCTO.minimoM2} m². Incluye pantalla, almacenamiento y sensor.`]);
    if (st.tipo === 'amp') out.push(['wa', 'La ampliación es solo para clientes con una instalación FootPulse: usa la pantalla y las baterías que ya tienes.']);
    if (pub && st.m2 < 15 && st.tipo === 'nueva') out.push(['wa', 'Para espacios públicos recomendamos 15 m²: hay más flujo y la franja debe cubrir el ancho de paso.']);
    if (pub) out.push(['wa', 'Una entidad pública contrata mediante su propio proceso de contratación estatal (Ley 80 de 1993). Esta cotización sirve como estudio de mercado.']);
    if (st.tipo === 'nueva' && st.m2 > 30) out.push(['wa', `Recomendación: empezar con un piloto de 10 m² y ampliar según los datos. Así arriesgas ${M(10 * PRODUCTO.precioM2, 0)} y no ${M(st.m2 * PRODUCTO.precioM2, 0)}.`]);
    if (st.ubic === 'desc') out.push(['wa', 'Exterior abierto: los módulos están adaptados a la lluvia, pero la pantalla debe ir bajo techo y la obra incluye drenaje.']);
    if (st.ubic === 'cub') out.push(['ok', 'Exterior cubierto: ubicación ideal para baldosas y pantalla.']);
    out.push(['ok', 'Superficie antideslizante con prueba antes de la entrega.']);
    return out;
  }

  // ---------- Paso 3: energía ----------
  let eTw = [];
  function upd3(el) {
    const r = el.querySelector('#fl');
    r.style.setProperty('--v', r.value + '%');
    el.querySelector('#flo').textContent = fmtNum(st.flujo);
    const wh = (st.flujo * ENERGIA.pisadasPorPersona * ENERGIA.julesPorPisada) / 3600;
    eTw.forEach((t) => t.kill());
    const prev = (id) => parseFloat(el.querySelector(id).dataset.v || 0);
    const set = (id, v, dec) => { const n = el.querySelector(id); eTw.push(countTo(n, v, { from: prev(id), dur: 0.5, dec })); n.dataset.v = v; };
    set('#eWh', wh, 0);
    set('#eLed', wh / ENERGIA.ledW, 1);
    set('#eCel', wh / (ENERGIA.celularWh / ENERGIA.eficienciaCarga), 1);
    set('#eMes', (wh * 30) / 1000, 1);
    // visual de flujo: personas = puntos que cruzan
    const svg = el.querySelector('#flowViz');
    const n = Math.round(4 + (fromFlujo(st.flujo) / 100) * 36);
    if (+svg.dataset.n !== n) {
      svg.dataset.n = n;
      gsap.killTweensOf(svg.querySelectorAll('circle'));
      svg.innerHTML = `<rect x="110" y="6" width="80" height="48" rx="6" fill="rgba(58,160,255,.12)" stroke="rgba(58,160,255,.5)"/>` +
        Array.from({ length: n }, (_, i) => `<circle r="2.6" cx="-10" cy="${10 + ((i * 37) % 40)}" fill="${['#ff8a1f', '#2ee59d', '#3aa0ff'][i % 3]}"/>`).join('');
      svg.querySelectorAll('circle').forEach((c, i) => {
        gsap.fromTo(c, { attr: { cx: -10 } }, { attr: { cx: 310 }, duration: 3 + (i % 5) * 0.4, repeat: -1, ease: 'none', delay: -((i * 0.53) % 4) });
      });
    }
    const out = [];
    if (st.flujo < 20000) out.push(['wa', 'Flujo bajo: la energía será pequeña. El valor estará en la visibilidad y los datos. Ubica la franja en la entrada principal o en un paso obligado.']);
    else if (st.flujo >= 100000) out.push(['ok', 'Alto tráfico: es el perfil de punto que usamos como referencia en el estudio.']);
    else out.push(['ok', 'Flujo adecuado para mostrar energía en pantalla y medir afluencia por hora.']);
    out.push(['ok', 'Datos: el sensor solo cuenta pisadas, sin cámaras ni datos personales (Ley 1581 de 2012).']);
    validations(el.querySelector('#val3'), out);
  }

  // ---------- Paso 4: calendario de disponibilidad (simulado) ----------
  function obraDias() {
    // Informe: unos 10 días hábiles por obra. Supuesto de la app: +5 días por cada 10 m² sobre 15 m².
    return OPERACION.diasPorObra + Math.max(0, Math.ceil((st.m2 - 15) / 10)) * 5;
  }
  function cal(el) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21); // 3 semanas de preparación
    const first = new Date(start.getFullYear(), start.getMonth(), 1);
    const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    el.querySelector('#calM').textContent = first.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }).toUpperCase();
    const ocup = (d) => { const x = (d * 7919 + first.getMonth() * 31) % 11; return x < 3; };
    let h = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d) => `<b>${d}</b>`).join('');
    const off = (first.getDay() + 6) % 7;
    h += '<i class="x"></i>'.repeat(off);
    for (let d = 1; d <= days; d++) {
      const dt = new Date(first.getFullYear(), first.getMonth(), d);
      const wk = dt.getDay() === 0 || dt.getDay() === 6;
      let c = 'prep';
      if (dt >= start && !wk) c = ocup(d) ? 'busy' : 'free';
      if (wk) c = '';
      const pick = st.fecha && st.fecha.toDateString() === dt.toDateString();
      h += `<i class="${c}${pick ? ' pick' : ''}" data-d="${d}" ${c === 'free' ? 'role="button" tabindex="0"' : ''}>${d}</i>`;
    }
    const calEl = el.querySelector('#cal');
    calEl.innerHTML = h;
    const free = calEl.querySelectorAll('.free').length;
    el.querySelector('#calCap').textContent = `${free} días libres`;
    gsap.from(calEl.querySelectorAll('i:not(.x)'), { scale: 0.4, opacity: 0, duration: 0.4, stagger: { each: 0.012, grid: 'auto', from: 'start' }, ease: 'back.out(2)' });
    calEl.querySelectorAll('.free').forEach((c) => c.addEventListener('click', () => {
      st.fecha = new Date(first.getFullYear(), first.getMonth(), +c.dataset.d);
      calEl.querySelectorAll('.pick').forEach((p) => p.classList.remove('pick'));
      c.classList.add('pick');
      gsap.fromTo(c, { scale: 1.5 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1,0.4)' });
      const n = el.querySelector('[data-a="next"]');
      n.disabled = false; n.style.opacity = 1;
    }));
  }

  // ---------- Resultado ----------
  function quote() {
    const s = SITIOS.find((x) => x.id === st.sitio) || SITIOS[0];
    const sub = st.m2 * PRODUCTO.precioM2;
    const iva = st.upme ? 0 : sub * IVA;
    const total = sub + iva;
    const wh = (st.flujo * 2 * 3) / 3600;
    const ded = sub * 0.5 * 0.35;
    const dias = obraDias();
    const fin = addBiz(st.fecha, dias);
    const f = (d) => d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
    const techo = st.m2 <= 12 && st.tipo === 'nueva';
    return `
    <div class="quote" id="qcard">
      <div style="display:flex;justify-content:space-between;align-items:center"><span class="kicker" style="margin:0">Tu cotización</span><span class="tag">Precio año 1</span></div>
      <div class="muted" style="margin-top:12px">${s.n} · ${st.tipo === 'nueva' ? 'Instalación nueva' : 'Ampliación'} · ${st.m2} m² · ${UBIC.find((u) => u.id === st.ubic).n}</div>
      <div class="quote-total" id="qTotal">COP 0</div>
      <div class="muted">${st.upme ? 'Total sin IVA: proyecto con certificado UPME (Ley 1715, art. 12).' : 'Total con IVA de 19 %.'}</div>
      <div style="margin-top:16px">
        <div class="qrow"><span>${st.m2} m² × COP 12,5 M</span><b>${M(sub)}</b></div>
        <div class="qrow"><span>IVA ${st.upme ? '(excluido con UPME)' : '19 %'}</span><b>${M(iva)}</b></div>
        <div class="qrow"><span>Anticipo al firmar (40 %)</span><b>${M(total * PRODUCTO.anticipo)}</b></div>
        <div class="qrow"><span>Mantenimiento Care, año 1</span><b style="color:var(--green)">Incluido</b></div>
        <div class="qrow"><span>Care desde el año 2</span><b>COP 1,2 M/mes</b></div>
      </div>
    </div>

    ${techo ? `<div class="val-row ok" style="margin-top:12px">${icon.check}<span>Tu piloto queda ${M(PRODUCTO.techoCliente - sub, 0)} por debajo del techo de COP 150 M que los clientes dijeron estar dispuestos a pagar.</span></div>` : ''}

    <div class="kpis" style="margin-top:14px">
      <div class="kpi"><small>Energía</small><b id="qWh">0</b><span>Wh al día con ${fmtNum(st.flujo)} personas</span></div>
      <div class="kpi"><small>Baldosas</small><b id="qTiles">0</b><span>de 50 × 50 cm</span></div>
      <div class="kpi"><small>Obra</small><b id="qDias">0</b><span>días hábiles estimados</span></div>
      <div class="kpi"><small>Menos renta</small><b id="qDed" style="color:var(--green)">0</b><span>millones, si la UPME certifica</span></div>
    </div>

    <div class="card" style="margin-top:14px">
      <h3 style="margin-bottom:14px">Tu cronograma</h3>
      <div class="timeline" id="qtl"><span class="tl-fill"></span>
        ${OPERACION.pasos.map((p, i) => `<div class="tl"><em>${['HOY', 'SEMANA 1', 'SEMANA 2', f(st.fecha) + ' → ' + f(fin), 'CADA TRIMESTRE'][i]}</em><b>${p.t}</b><span>${p.d}</span></div>`).join('')}
      </div>
      <p class="muted">Fechas simuladas por la app. La duración de obras de más de 15 m² es un supuesto de la app (+5 días por cada 10 m²).</p>
    </div>

    <div class="card" style="margin-top:14px">
      <h3 style="margin-bottom:12px">Qué incluye</h3>
      <div class="val">${(st.tipo === 'nueva' ? PRODUCTO.incluye : PRODUCTO.incluye.filter((x) => !/Pantalla|Supercap/.test(x))).map((x) => `<div class="val-row ok">${icon.check}<span>${x}</span></div>`).join('')}</div>
      <h3 style="margin:16px 0 12px">FootPulse Care</h3>
      <div class="val">${PRODUCTO.care.map((x) => `<div class="val-row ok">${icon.check}<span>${x}</span></div>`).join('')}</div>
    </div>

    <div class="card" style="margin-top:14px">
      <h3 style="margin-bottom:12px">Normas que cumplimos</h3>
      <div class="val">${NORMAS.map((n) => `<div class="val-row ok">${icon.check}<span><b style="color:var(--ink)">${n.t}.</b> ${n.d}</span></div>`).join('')}</div>
    </div>

    <div class="val" style="margin-top:14px">${[...rules2(), ...(st.flujo < 20000 ? [['wa', 'Flujo bajo: prioriza la ubicación en un paso obligado.']] : [])].filter((r) => r[0] !== 'ok').map(([c, t]) => `<div class="val-row ${c}">${c === 'wa' ? icon.warn : icon.x}<span>${t}</span></div>`).join('')}</div>

    <p class="muted" style="margin:6px 0 16px">Precios del año 1 sin IVA según el informe final; suben cerca de 5 % al año. Cotización demostrativa: no es una oferta comercial.</p>
    <button class="btn full" data-a="send">Enviar solicitud ${icon.arrow}</button>
    <button class="btn ghost full" data-a="restart" style="margin-top:10px">Cotizar otra instalación</button>`;
  }

  function addBiz(d, n) {
    const x = new Date(d);
    let k = 0;
    while (k < n - 1) { x.setDate(x.getDate() + 1); if (x.getDay() % 6 !== 0) k++; }
    return x;
  }

  function animQuote(el) {
    const sub = st.m2 * PRODUCTO.precioM2;
    const total = sub * (st.upme ? 1 : 1 + IVA);
    countTo(el.querySelector('#qTotal'), total, { prefix: 'COP ', dur: 1.8, ease: 'expo.out' });
    countTo(el.querySelector('#qWh'), (st.flujo * 2 * 3) / 3600, { dur: 1.4 });
    countTo(el.querySelector('#qTiles'), st.m2 * 4, { dur: 1.4 });
    countTo(el.querySelector('#qDias'), obraDias(), { dur: 1.4 });
    countTo(el.querySelector('#qDed'), (sub * 0.5 * 0.35) / 1e6, { dur: 1.4, dec: 1 });
    gsap.from(el.querySelector('#qcard'), { rotateX: -25, transformPerspective: 900, transformOrigin: '50% 0', duration: 1, ease: 'expo.out' });
    gsap.to(el.querySelector('#qtl .tl-fill'), { scaleY: 1, duration: 1.6, ease: 'power2.inOut', delay: 0.4 });
    $('#qT', root).textContent = 'Tu piso FootPulse';
    $('#qL', root).textContent = 'Revisa el detalle, las normas y tu cronograma.';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    bar.forEach((b) => b.style.setProperty('--p', 1));
  }

  function sent() {
    const o = document.createElement('div');
    o.className = 'success';
    o.innerHTML = `<div class="success-card">
      <svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="38" fill="none" stroke="#2ee59d" stroke-width="4" id="sc"/><path d="M26 43 37 54 59 31" fill="none" stroke="#2ee59d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" id="sk"/></svg>
      <h3 style="font-size:24px;margin-bottom:8px">¡Solicitud lista!</h3>
      <p class="muted" style="margin-bottom:18px">Esta es una app demostrativa: no se envió ningún dato. En la versión real, un ingeniero te contactaría para agendar la visita técnica.</p>
      <button class="btn full">Listo</button></div>`;
    document.body.appendChild(o);
    const c = o.querySelector('#sc'), k = o.querySelector('#sk');
    gsap.set([c, k], { strokeDasharray: 300, strokeDashoffset: 300 });
    gsap.timeline()
      .from(o, { opacity: 0, duration: 0.3 })
      .from(o.querySelector('.success-card'), { scale: 0.8, y: 40, duration: 0.6, ease: 'back.out(2)' }, 0)
      .to(c, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.out' }, 0.2)
      .to(k, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, 0.7);
    energy.add(3);
    o.querySelector('button').addEventListener('click', () => gsap.to(o, { opacity: 0, duration: 0.3, onComplete: () => o.remove() }));
  }

  function validations(box, list) {
    const before = box.children.length;
    box.innerHTML = list.map(([c, t]) => `<div class="val-row ${c}">${c === 'ok' ? icon.check : c === 'wa' ? icon.warn : icon.x}<span>${t}</span></div>`).join('');
    if (list.length !== before) gsap.from(box.children, { opacity: 0, x: -16, stagger: 0.04, duration: 0.4 });
  }

  whenReady(() => {
    gsap.from('#qT, #qL, #bar', { y: 30, opacity: 0, stagger: 0.08, duration: 0.9, ease: 'expo.out' });
  });
  render(1);
  return () => { eTw.forEach((t) => t.kill()); };
}
