'use client';

import { useEffect, useState } from 'react';

const COLOR_MAP = {
  VERDE:   '#22c55e',
  AZUL:    '#3b82f6',
  ROJO:    '#ef4444',
  NARANJA: '#f97316',
  MORADO:  '#a855f7',
  AMARILLO:'#eab308',
  GRIS:    '#6b7280',
};

const FAC_COLORS = {
  'Educación':      '#2d6a4f',
  'Salud':          '#991b1b',
  'Ingeniería':     '#1e3a5f',
  'Humanidades':    '#6b21a8',
  'Ciencias Básicas': '#1e40af',
  'Económicas':     '#92400e',
};

// Datos de demostración mientras el usuario configura el endpoint real
const DEMO_DATA = {
  actualizado: 'Demo — configura tu endpoint',
  total_candidatos: 11,
  etapas: { f1: 4, f2: 11, f3: 2, f4: 0 },
  f2_estado: { cumple: 9, no_cumple: 2, pendiente: 0 },
  por_facultad: [
    { facultad: 'Educación', count: 5 },
    { facultad: 'Salud', count: 2 },
    { facultad: 'Ingeniería', count: 2 },
    { facultad: 'Humanidades', count: 1 },
    { facultad: 'Ciencias Básicas', count: 1 },
  ],
  por_programa: [
    { programa: 'Lic. Educación Física', count: 4, color: 'VERDE' },
    { programa: 'Biología', count: 2, color: 'MORADO' },
    { programa: 'Ingeniería Civil', count: 1, color: 'AZUL' },
    { programa: 'Ingeniería Electrónica', count: 1, color: 'AZUL' },
    { programa: 'Medicina', count: 1, color: 'ROJO' },
    { programa: 'Enfermería', count: 1, color: 'ROJO' },
    { programa: 'Comunicación Social', count: 1, color: 'NARANJA' },
  ],
  por_perfil: [
    { perfil: 'Perfil 1', count: 10 },
    { perfil: 'Perfil 2', count: 1 },
  ],
};

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = Number(value) || 0;
    if (end === 0) { setDisplay(0); return; }
    const duration = 900;
    const step = Math.ceil(end / (duration / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

function DonutChart({ cumple, noCumple, pendiente }) {
  const total = cumple + noCumple + pendiente || 1;
  const r = 54, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;

  const segments = [
    { value: cumple,    color: '#22c55e', label: 'Cumplen' },
    { value: noCumple,  color: '#ef4444', label: 'No cumplen' },
    { value: pendiente, color: '#64748b', label: 'Pendiente' },
  ];

  let offset = 0;
  const arcs = segments.map(seg => {
    const pct = seg.value / total;
    const dash = pct * circ;
    const arc = { ...seg, dash, offset };
    offset += dash;
    return arc;
  });

  return (
    <div className="donut-wrap">
      <svg width={128} height={128} viewBox="0 0 128 128">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={14} />
        {arcs.map((arc, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={arc.color} strokeWidth={14}
            strokeDasharray={`${arc.dash} ${circ - arc.dash}`}
            strokeDashoffset={-arc.offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#f0f4ff" fontSize={20} fontWeight={800}>{cumple + noCumple + pendiente}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize={9}>candidatos</text>
      </svg>
      <div className="donut-legend">
        {segments.map(seg => (
          <div className="legend-item" key={seg.label}>
            <div className="legend-dot" style={{ background: seg.color }} />
            <div>
              <div className="legend-count">{seg.value}</div>
              <div className="legend-label">{seg.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!API_URL || API_URL.includes('TU_ID_AQUI')) {
      setData(DEMO_DATA);
      setIsDemo(true);
      setLoading(false);
      return;
    }
    fetch(API_URL)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(err => {
        console.error(err);
        setData(DEMO_DATA);
        setIsDemo(true);
        setLoading(false);
      });
  }, [API_URL]);

  if (loading) return (
    <div className="loading-wrap">
      <div className="spinner" />
      <span>Cargando estadísticas…</span>
    </div>
  );

  const maxFac = Math.max(...(data.por_facultad || []).map(f => f.count), 1);

  return (
    <>
      {/* ── HEADER ───────────────────────────────────── */}
      <header className="header">
        <div className="header-badge">
          🏛️ Universidad del Quindío
        </div>
        <h1>Concurso Público de Méritos<br />Docente de Carrera 2026</h1>
        <p>Panel de seguimiento público — Oficina de Asuntos Profesorales</p>
        <span className="updated-tag">
          🕐 Actualizado: {data.actualizado}
          {isDemo && ' — Modo demostración'}
        </span>
        {isDemo && (
          <p style={{ fontSize: '0.75rem', color: '#f97316', marginTop: 8 }}>
            ⚠️ Mostrando datos de ejemplo. Configura <code>NEXT_PUBLIC_API_URL</code> en Vercel para datos reales.
          </p>
        )}
      </header>

      <main className="container">

        {/* ── STAT CARDS ───────────────────────────── */}
        <p className="section-title">Resumen General</p>
        <div className="stats-grid">
          <div className="stat-card gold">
            <div className="label">Total Candidatos</div>
            <div className="value"><AnimatedNumber value={data.total_candidatos} /></div>
            <div className="sub">Inscritos al concurso</div>
          </div>
          <div className="stat-card green">
            <div className="label">Cumplen Requisitos</div>
            <div className="value"><AnimatedNumber value={data.f2_estado?.cumple || 0} /></div>
            <div className="sub">Habilitados en Etapa 2</div>
          </div>
          <div className="stat-card red">
            <div className="label">No Cumplen</div>
            <div className="value"><AnimatedNumber value={data.f2_estado?.no_cumple || 0} /></div>
            <div className="sub">No habilitados</div>
          </div>
          <div className="stat-card">
            <div className="label">En Calificación (F3)</div>
            <div className="value"><AnimatedNumber value={data.etapas?.f3 || 0} /></div>
            <div className="sub">Etapa de Hoja de Vida</div>
          </div>
          <div className="stat-card">
            <div className="label">Ficha de Ingreso (F4)</div>
            <div className="value"><AnimatedNumber value={data.etapas?.f4 || 0} /></div>
            <div className="sub">Etapa final completada</div>
          </div>
        </div>

        {/* ── CHARTS ROW 1 ─────────────────────────── */}
        <p className="section-title">Estado de la Etapa 2 — Verificación de Requisitos</p>
        <div className="two-col">
          <div className="card">
            <h2><span className="icon">✅</span> Resultado F2 por Candidato</h2>
            <DonutChart
              cumple={data.f2_estado?.cumple || 0}
              noCumple={data.f2_estado?.no_cumple || 0}
              pendiente={data.f2_estado?.pendiente || 0}
            />
          </div>

          <div className="card">
            <h2><span className="icon">📊</span> Candidatos por Facultad</h2>
            {(data.por_facultad || []).map(f => (
              <div className="bar-item" key={f.facultad}>
                <div className="bar-label">
                  <strong>{f.facultad}</strong>
                  <span>{f.count} {f.count === 1 ? 'candidato' : 'candidatos'}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(f.count / maxFac) * 100}%`, background: `linear-gradient(90deg, ${FAC_COLORS[f.facultad] || '#003366'}, ${FAC_COLORS[f.facultad] || '#C9A227'}88)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CHARTS ROW 2 ─────────────────────────── */}
        <p className="section-title">Detalle por Programa y Perfil</p>
        <div className="two-col">
          <div className="card">
            <h2><span className="icon">🎓</span> Candidatos por Programa</h2>
            {(data.por_programa || []).map(p => (
              <div className="prog-item" key={p.programa}>
                <div className="prog-color-dot" style={{ background: COLOR_MAP[p.color] || '#64748b' }} />
                <span className="prog-name">{p.programa}</span>
                <span className="prog-badge">{p.count}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <h2><span className="icon">🏷️</span> Distribución por Perfil</h2>
            <div className="perfil-grid">
              {(data.por_perfil || []).map(p => (
                <div className="perfil-pill" key={p.perfil}>
                  <span className="p-count"><AnimatedNumber value={p.count} /></span>
                  <span className="p-label">{p.perfil}</span>
                </div>
              ))}
            </div>

            <h2 style={{ marginTop: 28 }}><span className="icon">🔀</span> Progreso del Proceso</h2>
            {[
              { label: 'F1 — Registro Inicial', key: 'f1', desc: 'Candidatos registrados' },
              { label: 'F2 — Verificación Requisitos', key: 'f2', desc: 'Lista de chequeo completada' },
              { label: 'F3 — Calificación HV', key: 'f3', desc: 'Hoja de vida evaluada' },
              { label: 'F4 — Ficha de Ingreso', key: 'f4', desc: 'Proceso finalizado' },
            ].map(e => {
              const count = data.etapas?.[e.key] || 0;
              const pct = data.total_candidatos > 0 ? (count / data.total_candidatos) * 100 : 0;
              return (
                <div className="etapa-item" key={e.key}>
                  <div className="etapa-header">
                    <div>
                      <div className="etapa-label">{e.label}</div>
                    </div>
                    <div className="etapa-count">{count} / {data.total_candidatos}</div>
                  </div>
                  <div className="etapa-track">
                    <div className="etapa-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      <footer className="footer">
        <p>
          Universidad del Quindío — Oficina de Asuntos Profesorales<br />
          Este panel muestra <strong>estadísticas agregadas</strong>. Ningún dato personal de los candidatos es expuesto públicamente.<br />
          <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>Datos actualizados manualmente desde el sistema interno.</span>
        </p>
      </footer>
    </>
  );
}
