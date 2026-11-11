import { gsap } from 'gsap';
import { FIN, fmtM, fmtNum } from '../data.js';
import { reveals, countOnView, countTo, whenReady, $, $$, icon } from '../ui.js';
import { stackedBars, signedBars, cumLine, gauge, donut } from '../anim/charts.js';

const C = { o: '#db6a08', g: '#12a570', b: '#3a8aeb' };

export default function invertir(root) {
  const y5 = [
    { n: 'Costo de ventas (baldosas, obra, Care)', v: 766.1 },
    { n: 'Nómina', v: 299.9 },
    { n: 'Impuesto de renta', v: 138.6 },
    { n: 'Gastos de ventas', v: 58.5 },
    { n: 'Gastos de administración', v: 49.6 },
    { n: 'Depreciación', v: 7.6 },
    { n: 'Utilidad neta', v: 257.3, hi: true },
  ];

  root.innerHTML = `
  <section class="sec" style="padding-top:40px">
    <span class="kicker">Información financiera</span>
    <h2 data-split>Un negocio que <span class="grad">crea valor</span></h2>
    <p class="lead" data-r style="margin-bottom:22px">Con COP 146 millones de los socios y una rentabilidad mínima exigida de 18 %, FootPulse devuelve más de lo que pide.</p>
    <div class="kpis" id="kpis">
      <div class="kpi hero-kpi"><small>Valor presente neto (VPN)</small><b><span id="kVpn">0</span><span class="unit">millones</span></b><span>Dinero que el proyecto crea, medido hoy, por encima de invertir al 18 %.</span></div>
      <div class="kpi"><small>TIR</small><b id="kTir">0</b><span>rentabilidad anual del proyecto</span></div>
      <div class="kpi"><small>Recuperación</small><b id="kPri">0</b><span>años para devolver la inversión</span></div>
      <div class="kpi"><small>Índice de rentabilidad</small><b id="kIr">0</b><span>pesos en valor presente por cada peso</span></div>
      <div class="kpi"><small>Utilidad acumulada</small><b id="kUa">0</b><span>millones en 5 años</span></div>
    </div>
  </section>

  <section class="sec" style="padding-top:20px">
    <span class="kicker y">Rentabilidad</span>
    <h2 data-split>31,5 % contra 18 %</h2>
    <p class="lead" data-r>La TIR supera en 13,5 puntos la tasa mínima que exigen los socios: la tasa del Banco de la República (12,25 %) más 6 puntos por el riesgo de un negocio nuevo.</p>
    <div class="gauge-wrap" id="gauge" style="margin-top:18px"></div>
  </section>

  <section class="sec">
    <span class="kicker b">Inversión inicial</span>
    <h2 data-split>COP 146 millones para arrancar</h2>
    <p class="lead" data-r style="margin-bottom:18px">Sin vehículo ni bodega: el transporte se alquila por obra y las baldosas se importan por pedido. Cada socio aporta unos COP 48,7 millones.</p>
    <div class="chart-card" data-r="zoom">
      <div id="donut"></div>
      <div class="donut-legend">
        <div><i style="background:${C.b}"></i><span>Activos</span><b>62,8 M</b></div>
        <div><i style="background:${C.g}"></i><span>Capital de trabajo</span><b>83,2 M</b></div>
      </div>
      <details class="more" style="margin-top:14px"><summary>Detalle de los activos</summary><div>
        ${FIN.inversion.activos.map((a) => `<div class="qrow"><span>${a.n}</span><b>${fmtM(a.v / 1e6)} M</b></div>`).join('')}
        <p class="muted" style="margin-top:8px">Capital de trabajo: 3 meses de costos fijos (40,9 M) + 60 % de la primera obra (42,2 M). Se recupera en el año 5.</p>
      </div></details>
    </div>
  </section>

  <section class="sec">
    <span class="kicker o">Ingresos</span>
    <h2 data-split>De 250 a 1.577 millones en 5 años</h2>
    <p class="lead" data-r style="margin-bottom:18px">Metros cuadrados por precio, más mantenimiento Care. El 89 % viene de instalaciones; Care crece porque cada cliente se suma a la base.</p>
    <div class="chart-card" data-r="zoom">
      <h3>Ingresos por línea de negocio</h3><p class="muted">Millones de COP, sin IVA. Toca una barra.</p>
      <div id="ing"></div>
      <div class="ckey"><span><i style="background:${C.o}"></i>Instalación</span><span><i style="background:${C.g}"></i>Mantenimiento Care</span></div>
    </div>
    <p class="muted" style="margin-top:12px">m² instalados: 20, 40, 50, 70 y 90. Instalaciones en Care: 0, 2, 5, 8 y 12.</p>
  </section>

  <section class="sec">
    <span class="kicker">Utilidad</span>
    <h2 data-split>Solo el primer año pierde</h2>
    <p class="lead" data-r style="margin-bottom:18px">Con 2 instalaciones el año 1 no cubre los costos fijos. Desde el año 2 hay utilidad, y la pérdida inicial se compensa en la renta.</p>
    <div class="chart-card" data-r="zoom"><h3>Utilidad neta por año</h3><p class="muted">Millones de COP</p><div id="un"></div></div>
  </section>

  <section class="sec">
    <span class="kicker y">Flujo de caja</span>
    <h2 data-split>Del punto más bajo a 427 millones</h2>
    <p class="lead" data-r style="margin-bottom:18px">Desliza: la línea sigue la caja acumulada. El punto más bajo es −211 millones al cierre del año 1; ese es el dinero que los socios deben poder sostener.</p>
    <div class="chart-card" data-r="zoom"><h3>Flujo de caja acumulado</h3><p class="muted">Millones de COP, año 0 a año 5</p><div id="cum"></div></div>
  </section>

  <section class="sec">
    <span class="kicker o">Costos</span>
    <h2 data-split>¿A dónde va cada peso del año 5?</h2>
    <p class="lead" data-r style="margin-bottom:18px">De COP 1.577 millones de ingresos en el año 5:</p>
    <div class="chart-card" id="y5">
      ${y5.map((r) => `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span style="color:${r.hi ? 'var(--green)' : 'var(--ink2)'};font-weight:${r.hi ? 700 : 400}">${r.n}</span><b class="mono">${fmtM(r.v)} M · ${fmtNum((r.v / 1577.5) * 100, 0)} %</b></div><div style="height:10px;border-radius:5px;background:rgba(255,255,255,.05);overflow:hidden"><i class="y5b" style="display:block;height:100%;border-radius:5px;width:${(r.v / 1577.5) * 100}%;background:${r.hi ? C.g : C.b}"></i></div></div>`).join('')}
    </div>
    <details class="more" style="margin-top:14px"><summary>Costos directos de una obra (año 1)</summary><div>
      ${FIN.costoUnitario.map((c) => `<div class="qrow"><span>${c.n}</span><b>${c.v}</b></div>`).join('')}
      <p class="muted" style="margin-top:8px">Una instalación de 10 m² cuesta COP 70,4 millones y deja 44 % de margen bruto; una ampliación deja 53 %. Pantalla, obra y mano de obra son supuestos del equipo.</p>
    </div></details>
  </section>

  <section class="sec">
    <span class="kicker b">Escenarios</span>
    <h2 data-split>¿Y si las cosas cambian?</h2>
    <div class="chart-card" data-r="zoom">
      <div class="seg scen-tabs" id="scTabs"><button data-s="optimista" aria-pressed="false">Optimista</button><button data-s="base" aria-pressed="true">Base</button><button data-s="critico" aria-pressed="false">Crítico</button></div>
      <div class="scen-out">
        <span class="muted mono">VPN (millones COP)</span>
        <div class="scen-vpn pos" id="scV">108,3</div>
        <svg viewBox="0 0 300 30" class="chart" id="scBar"><rect x="0" y="10" width="300" height="10" rx="5" fill="#1b2540"/><line x1="146" x2="146" y1="4" y2="26" stroke="#eef3ff" stroke-width="1.5"/><text x="146" y="2" text-anchor="middle" style="font-size:8px">0</text><rect id="scFill" x="146" y="10" width="0" height="10" rx="5" fill="#12a570"/></svg>
        <div class="qrow"><span>TIR</span><b id="scT">31,5 %</b></div>
        <div class="qrow"><span>Recuperación</span><b id="scP">3,9 años</b></div>
        <div class="qrow"><span>Qué cambia</span><b id="scC" style="font-family:var(--f-body);font-weight:500;font-size:13px">Supuestos del informe</b></div>
      </div>
    </div>
    <div class="chart-card" style="margin-top:14px" data-r="zoom">
      <h3>Una variable a la vez</h3><p class="muted">VPN en millones si solo cambia esa variable (base: 108,3)</p>
      <div id="tor"></div>
    </div>
    <div class="warn" data-r style="margin-top:14px">${icon.warn}<div><b style="color:var(--ink)">El riesgo es comercial.</b> El VPN llega a cero si las ventas caen 14,5 % o si el precio baja 7,2 % (unos COP 11,6 millones por m²). La inversión casi no mueve el resultado.</div></div>
  </section>

  <section class="sec">
    <span class="kicker">Decisión</span>
    <h2 data-split>Continuar, con ajustes</h2>
    <p class="lead" data-r style="margin-bottom:18px">El escenario base cumple los tres criterios: VPN positivo, TIR mayor que la TIO y recuperación dentro del horizonte. Para proteger el margen, tomamos cinco decisiones:</p>
    <div class="vlist" data-stagger>
      ${FIN.decisiones.map((d, i) => `<div class="vitem ${['o', '', 'b', 'y', ''][i]}"><div class="vico"><b class="mono" style="color:var(--ink)">${i + 1}</b></div><div><p style="color:var(--ink);font-size:15px">${d}</p></div></div>`).join('')}
    </div>
  </section>

  <section class="sec">
    <span class="kicker b">Valor en el tiempo</span>
    <h2 data-split>Lo que vale FootPulse al año 5</h2>
    <div class="kpis" data-stagger style="margin-top:18px">
      <div class="kpi"><small>Retorno sobre aportes</small><b>2,9×</b><span>utilidad acumulada sobre los 146 M</span></div>
      <div class="kpi"><small>Margen neto año 5</small><b>16,3 %</b><span>razonable en servicios técnicos</span></div>
      <div class="kpi"><small>Margen bruto</small><b>44→51 %</b><span>del año 1 al año 5</span></div>
      <div class="kpi"><small>Clientes en Care</small><b>12</b><span>ingreso recurrente al año 5</span></div>
    </div>
    <p class="muted" style="margin-top:12px">El informe mide el valor con el VPN y la utilidad acumulada; no calcula un precio de venta de la empresa.</p>
    <details class="more" style="margin-top:16px"><summary>Estado de resultados (millones COP)</summary><div class="table-wrap"><table class="t">
      <thead><tr><th>Concepto</th>${FIN.anos.map((a) => `<th>Año ${a}</th>`).join('')}</tr></thead>
      <tbody>
        ${[['Ingresos', FIN.ingresos, 1], ['Costo de ventas', FIN.costoVentas.map((v) => -v)], ['Nómina', FIN.nomina.map((v) => -v)], ['Administración', FIN.admin.map((v) => -v)], ['Ventas', FIN.ventas.map((v) => -v)], ['EBITDA', FIN.ebitda, 1], ['Utilidad neta', FIN.utilidadNeta, 1]]
          .map(([n, v, s]) => `<tr class="${s ? 'strong' : ''}"><td>${n}</td>${v.map((x) => `<td class="${x < 0 ? 'neg' : ''}">${fmtM(x)}</td>`).join('')}</tr>`).join('')}
      </tbody></table></div></details>
  </section>

  <section class="sec" style="text-align:center">
    <h2 data-split>¿Hablamos?</h2>
    <p class="lead" data-r style="margin:0 auto 22px;max-width:30ch">Arma una cotización o vuelve a ver cómo funciona la energía de cada paso.</p>
    <a class="btn full" href="#/cotizar" data-r="zoom">Cotizar ${icon.arrow}</a>
    <a class="btn ghost full" href="#/proyecto" style="margin-top:10px">Ver el proyecto</a>
  </section>
  <footer class="foot">Fuente: Informe final EPI-3-FootPulse y modelo EPI-3-FootPulse.xlsx (escenario base, horizonte 5 años, TIO 18 %).</footer>
  `;

  // KPIs
  whenReady(() => {
    gsap.from('#kpis .kpi', { y: 40, opacity: 0, scale: 0.94, stagger: 0.08, duration: 1, ease: 'expo.out' });
    countTo($('#kVpn', root), 108.3, { dec: 1, dur: 2.2, ease: 'expo.out' });
    countTo($('#kTir', root), 31.5, { dec: 1, dur: 2, suffix: ' %', ease: 'expo.out' });
    countTo($('#kPri', root), 3.9, { dec: 1, dur: 2, ease: 'expo.out' });
    countTo($('#kIr', root), 1.74, { dec: 2, dur: 2, ease: 'expo.out' });
    countTo($('#kUa', root), 427.6, { dec: 1, dur: 2.2, ease: 'expo.out' });
  });

  gauge($('#gauge', root), { value: FIN.tir, ref: FIN.tio });
  donut($('#donut', root), [{ n: 'Activos', v: FIN.inversion.subtotalActivos, c: C.b }, { n: 'Capital de trabajo', v: FIN.inversion.capitalTrabajo, c: C.g }]);
  stackedBars($('#ing', root), FIN.anos.map((a) => 'Año ' + a), [
    { name: 'Instalación', color: C.o, values: FIN.ingInstalacion },
    { name: 'Care', color: C.g, values: FIN.ingCare },
  ]);
  signedBars($('#un', root), FIN.anos.map((a) => 'Año ' + a), FIN.utilidadNeta);
  cumLine($('#cum', root), [0, 1, 2, 3, 4, 5].map((a) => 'Año ' + a), FIN.flujoAcum);

  // Barras del año 5
  gsap.from($$('.y5b', root), { width: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '#y5', start: 'top 80%' } });

  // Sensibilidad (barras horizontales desde la base)
  const tor = $('#tor', root);
  const rows = FIN.sensibilidad;
  const minV = -120, maxV = 140, Wd = 340;
  const sx = (v) => 10 + ((v - minV) / (maxV - minV)) * (Wd - 20);
  let s = `<svg class="chart" viewBox="0 0 ${Wd} ${rows.length * 46 + 20}">`;
  s += `<line class="zero" x1="${sx(0)}" x2="${sx(0)}" y1="0" y2="${rows.length * 46}"/><line x1="${sx(108.3)}" x2="${sx(108.3)}" y1="0" y2="${rows.length * 46}" stroke="#2ee59d" stroke-dasharray="3 3"/>`;
  s += `<text x="${sx(108.3)}" y="${rows.length * 46 + 14}" text-anchor="middle" style="fill:#2ee59d">base</text><text x="${sx(0)}" y="${rows.length * 46 + 14}" text-anchor="middle">0</text>`;
  rows.forEach((r, i) => {
    const y = i * 46 + 18;
    const a = Math.min(r.vpn, 108.3), b = Math.max(r.vpn, 108.3);
    s += `<text x="10" y="${y - 4}" style="fill:#b3bfd6;font-family:Inter;font-size:11px">${r.n}</text>`;
    s += `<rect class="tb" x="${sx(a)}" y="${y + 2}" width="${sx(b) - sx(a)}" height="14" rx="4" fill="${r.vpn < 0 ? C.o : C.b}" style="transform-origin:${sx(108.3)}px 0"/>`;
    s += `<text class="val-lbl" x="${r.vpn < 0 ? sx(r.vpn) - 4 : sx(r.vpn) - 4}" y="${y + 13}" text-anchor="end">${fmtM(r.vpn)}</text>`;
  });
  s += '</svg>';
  tor.innerHTML = s;
  gsap.from(tor.querySelectorAll('.tb'), { scaleX: 0, duration: 1, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: tor, start: 'top 80%' } });

  // Escenarios
  const tabs = $$('#scTabs button', root);
  const V = $('#scV', root);
  let cur = 108.3, tw;
  const showScen = (k) => {
    const e = FIN.escenarios[k];
    tabs.forEach((t) => t.setAttribute('aria-pressed', t.dataset.s === k));
    tw && tw.kill();
    tw = countTo(V, e.vpn, { from: cur, dec: 1, dur: 1.1, ease: 'expo.out' });
    cur = e.vpn;
    V.className = 'scen-vpn ' + (e.vpn < 0 ? 'neg' : 'pos');
    const zero = 146, scale = 146 / 300;
    const w = Math.abs(e.vpn) * scale;
    gsap.to('#scFill', { attr: { x: e.vpn < 0 ? zero - w : zero, width: w }, fill: e.vpn < 0 ? C.o : C.g, duration: 1, ease: 'expo.out' });
    $('#scT', root).textContent = e.tir;
    $('#scP', root).textContent = e.pri;
    $('#scC', root).textContent = e.cambia;
    gsap.fromTo('.scen-out .qrow b', { opacity: 0, x: 10 }, { opacity: 1, x: 0, stagger: 0.06, duration: 0.4 });
  };
  tabs.forEach((t) => t.addEventListener('click', () => showScen(t.dataset.s)));
  gsap.set('#scFill', { attr: { width: 108.3 * (146 / 300) } });

  reveals(root);
}
