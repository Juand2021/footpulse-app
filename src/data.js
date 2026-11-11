// Fuente única de datos de la app.
// Todas las cifras salen del Informe Final (EPI-3-FootPulse.pdf, 11/11/2026),
// del Excel EPI-3-FootPulse.xlsx y del Informe 2 (estudio de mercado).
// Lo que es cálculo o supuesto de la app está marcado con `supuesto: true` o en la nota.

export const EQUIPO = [
  { nombre: 'Juan Diego Chaves Guerrero', ini: 'JD' },
  { nombre: 'Laura Sofía Ocampo Rodríguez', ini: 'LS' },
  { nombre: 'Hans Felipe Aguasaco Díaz', ini: 'HF' },
];

// Física del sistema (Informe 2, tabla de energía; New Atlas, 2016)
export const ENERGIA = {
  julesPorPisada: 3, // 5 W durante ~0,6 s
  wattsPico: 5,
  segundosPisada: 0.6,
  pisadasPorPersona: 2, // franja de 1,5 m en el sentido del flujo
  flujoReferencia: 150000, // personas/día, portal principal (supuesto del Informe 2)
  kwhDiaReferencia: 0.25, // 150.000 × 2 × 3 J = 900 kJ
  kwhMesReferencia: 7.5,
  tarifaCopKwh: 1036, // tarifa comercial Enel, ago-2026 (Informe 2)
  ledW: 10, // equivalencia calculada por el equipo (no está en el PDF)
  celularWh: 15,
  eficienciaCarga: 0.85,
};

export const PRODUCTO = {
  precioM2: 12500000, // COP, sin IVA, año 1
  minimoM2: 10,
  techoCliente: 150000000, // techo de precio del cliente para un piloto (Informe 2)
  careAnual: 14400000, // FootPulse Care, desde el 2.º año
  careMensual: 1200000,
  baldosasPorM2: 4, // 50 × 50 cm
  anticipo: 0.4,
  m2Privado: 10,
  m2Publico: 15,
  m2Ampliacion: 10,
  margenBruto10m2: 0.44,
  margenAmpliacion: 0.53,
  precioMinimoM2: 11600000, // VPN = 0
  descuentoVsTecho: 0.17,
  incluye: [
    'Baldosas antideslizantes de 50 × 50 cm (4 por m²)',
    'Supercapacitores y baterías LiFePO4',
    'Pantalla de 55 pulgadas con la energía en vivo',
    'Sensor de pisadas y pasarela de datos',
    'Obra civil, montaje y puesta en marcha',
    '1 año de garantía y plataforma incluidos',
  ],
  care: [
    'Mantenimiento preventivo trimestral (4 visitas al año)',
    'Soporte técnico local, en pesos',
    'Plataforma de datos de afluencia por hora',
    'Reporte mensual de sostenibilidad',
  ],
};

export const OPERACION = {
  tecnicos: 2,
  diasPorObra: 10, // días hábiles
  obrasPorAno: 20, // 220 días hábiles / 10
  pasos: [
    { t: 'Visita técnica', d: 'Medimos el flujo peatonal y revisamos el piso.' },
    { t: 'Diseño y propuesta', d: 'Ubicación de la franja, pantalla y datos.' },
    { t: 'Contrato e importación', d: 'Firma con 40 % de anticipo; las baldosas se importan por pedido.' },
    { t: 'Obra y puesta en marcha', d: '2 técnicos, unos 10 días hábiles, prueba antideslizante.' },
    { t: 'Mantenimiento Care', d: 'Visitas trimestrales desde el segundo año.' },
  ],
};

export const MERCADO = {
  tam: { sitios: 500, cop: 75000e6 },
  sam: { sitios: 100, cop: 15000e6 },
  metaInstalaciones: 17,
  utilidadPercibida: 0.68,
  valoracion: 4.1,
  clientesInteresados: '4 de 5',
  embudo: [20, 16, 8, 2],
  competencia: ['Pavegen (Reino Unido)', 'Energy Floors (Países Bajos)'],
  nota: 'Encuesta (97) y entrevistas (5) del Informe 2 presentadas como escenario simulado.',
};

// Finanzas (escenario base, millones de COP)
export const FIN = {
  anos: [1, 2, 3, 4, 5],
  m2: [20, 40, 50, 70, 90],
  care: [0, 2, 5, 8, 12],
  ingresos: [250.0, 555.2, 768.4, 1146.3, 1577.5],
  ingInstalacion: [250.0, 525.0, 689.1, 1012.9, 1367.4],
  ingCare: [0, 30.2, 79.4, 133.4, 210.0],
  costoVentas: [140.8, 291.9, 384.4, 561.7, 766.1],
  nomina: [108.6, 116.2, 216.7, 280.3, 299.9],
  admin: [40.8, 42.8, 45.0, 47.2, 49.6],
  ventas: [21.9, 30.9, 36.5, 47.1, 58.5],
  ebitda: [-62.1, 73.5, 85.8, 210.0, 403.4],
  utilidadNeta: [-74.6, 60.9, 52.4, 131.6, 257.3],
  flujoNeto: [-146.0, -65.0, 46.6, 39.3, 132.8, 419.8], // año 0 a 5
  flujoAcum: [-146.0, -211.0, -164.4, -125.0, 7.8, 427.6],
  costosFijos: [163.8, null, null, null, 367.0],
  inversion: {
    total: 145983790,
    activos: [
      { n: 'Herramientas de instalación y taller', v: 12000000 },
      { n: 'Banco de pruebas de baldosas', v: 8000000 },
      { n: 'Módulo de demostración de 2 m²', v: 9796000 },
      { n: 'Equipos de cómputo (3 portátiles)', v: 12000000 },
      { n: 'Plataforma de datos (software)', v: 15000000 },
      { n: 'Gastos preoperativos (SAS, UPME, prueba antideslizante)', v: 6000000 },
    ],
    subtotalActivos: 62796000,
    capitalTrabajo: 83187790,
    porSocio: 48.7,
  },
  vpn: 108344754,
  tir: 0.315,
  tio: 0.18,
  indiceRentabilidad: 1.74,
  pri: 3.9,
  priDescontado: 4.4,
  utilidadAcum: 427.6,
  roi: 2.9,
  margenNeto5: 0.163,
  margenBruto: [0.44, 0.51],
  puntoEquilibrioAno1: 433.5,
  coberturaEquilibrio: [0.58, 1.33, null, null, 2.06],
  cajaMinima: -211,
  costoUnitario: [
    { n: 'Baldosas importadas (4 por m², USD 250 c/u)', v: '3.228.260 por m²' },
    { n: 'Flete, seguro y nacionalización (13 %)', v: '419.674 por m²' },
    { n: 'Superficie, marco, cableado y obra civil', v: '1.300.000 por m²' },
    { n: 'Almacenamiento (2 LiFePO4 + supercapacitores)', v: '4.925.554 por obra' },
    { n: 'Pantalla, sensor y pasarela de datos', v: '6.500.000 por obra' },
    { n: 'Mano de obra (2 técnicos, 10 días) y transporte', v: '4.500.000 por obra' },
  ],
  supuestos: {
    trm: 3228.26,
    inflacion: 0.063,
    tasaBanRep: 0.1225,
    alzaPrecios: 0.05,
    alzaSalarios: 0.07,
    renta: 0.35,
  },
  escenarios: {
    optimista: { vpn: 298.3, tir: '53,2 %', pri: '3,0 años', cambia: 'Ventas +20 % y costos directos −5 %' },
    base: { vpn: 108.3, tir: '31,5 %', pri: '3,9 años', cambia: 'Supuestos del informe' },
    critico: { vpn: -285.1, tir: 'No existe', pri: 'No recupera en 5 años', cambia: 'Ventas −25 %, precio −8 %, costos +10 %, inversión +15 %' },
  },
  sensibilidad: [
    { n: 'Ventas −25 %', vpn: -81.5 },
    { n: 'Precio −10 %', vpn: -41.9 },
    { n: 'Costos directos +10 %', vpn: 31.6 },
    { n: 'Inversión en activos +20 %', vpn: 98.8 },
  ],
  quiebre: { ventas: -0.145, precio: -0.072 },
  decisiones: [
    'Arrancar solo con 2 pilotos firmados con 40 % de anticipo.',
    'Pasar a tiempo completo en el año 3 solo con 5 instalaciones acumuladas.',
    'Defender el precio: nunca bajar de COP 11,6 millones por m².',
    'Tramitar el certificado UPME antes de la primera importación.',
    'Validar en campo la encuesta y las entrevistas en los primeros 3 meses.',
  ],
};

// Beneficios tributarios para el cliente (normativa colombiana real).
// Aplican solo si la UPME certifica el proyecto; no se incluyeron en el modelo financiero.
export const TRIBUTARIO = {
  advertencia:
    'Los beneficios dependen de que la UPME certifique cada proyecto como fuente no convencional de energía o como gestión eficiente de la energía. No son automáticos: el cliente debe pedir el certificado y validarlo con su contador.',
  beneficios: [
    {
      t: 'Deducción de renta del 50 %',
      d: 'Se descuenta de la renta el 50 % del valor invertido, repartido hasta en 15 años desde el año siguiente a la puesta en marcha, sin superar el 50 % de la renta líquida.',
      norma: 'Ley 1715 de 2014, art. 11, modificado por la Ley 2099 de 2021',
      ejemplo: true,
    },
    {
      t: 'Exclusión de IVA',
      d: 'Los equipos, elementos y servicios del proyecto certificado quedan excluidos de IVA.',
      norma: 'Ley 1715 de 2014, art. 12',
    },
    {
      t: 'Sin arancel de importación',
      d: 'La maquinaria y los equipos importados para el proyecto quedan exentos de derechos arancelarios.',
      norma: 'Ley 1715 de 2014, art. 13',
    },
    {
      t: 'Depreciación acelerada',
      d: 'Los activos del proyecto se pueden depreciar hasta 33,33 % al año, en vez de las tasas normales.',
      norma: 'Ley 1715 de 2014, art. 14, modificado por la Ley 2099 de 2021',
    },
  ],
  alternativa:
    'Otra vía es el descuento de 25 % por inversiones ambientales (Estatuto Tributario, art. 255). No se puede usar a la vez que la deducción de la Ley 1715 para la misma inversión: hay que escoger una.',
  tramite: 'Solicitud en el Sistema Único de Usuarios de la UPME (Resolución UPME 135 de 2025). La UPME responde en hasta 30 días hábiles para proyectos de gestión eficiente.',
  fuentes: [
    { n: 'UPME, comunicado 66 sobre incentivos tributarios (2025)', u: 'https://docs.upme.gov.co/SalaPrensa/ComunicadosPrensa/Comunicado_66_UPME_incentivos_tributarios_2025-12-10.pdf' },
    { n: 'MinAmbiente, deducción por gestión eficiente de la energía', u: 'https://beneficios-tributarios.minambiente.gov.co/wp-content/uploads/2022/06/Deduccion-del-impuesto-sobre-la-renta-por-inversiones-realizadas-en-proyectos-de-gestion-eficiente-de-la-energia.pdf' },
    { n: 'Actualícese, cambios de la Ley 2099 de 2021', u: 'https://actualicese.com/archivo/ley-2099-de-julio-10-de-2021-modifico-beneficios-tributarios-por-generacion-de-energia-electrica/' },
  ],
};

export const NORMAS = [
  { t: 'RETIE', d: 'Reglamento Técnico de Instalaciones Eléctricas del Ministerio de Minas y Energía: la conexión de la pantalla, las baterías y el cableado se hace bajo este reglamento.' },
  { t: 'Ley 1581 de 2012', d: 'Protección de datos personales. El sensor solo cuenta pisadas: no toma imágenes ni datos de las personas.' },
  { t: 'Prueba antideslizante', d: 'Cada instalación se entrega con prueba antideslizante; el 34 % de los encuestados temía resbalones.' },
  { t: 'Certificado UPME', d: 'Necesario para los beneficios de la Ley 1715 de 2014 (deducción, IVA y arancel).' },
];

export const fmtCOP = (v) => 'COP ' + Math.round(v).toLocaleString('es-CO');
export const fmtM = (v, d = 1) =>
  (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });
export const fmtNum = (v, d = 0) => v.toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });
