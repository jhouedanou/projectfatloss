import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KINDS, KIND_LABELS, dayDate } from '../services/FitMetrics';

/**
 * Graphiques du tableau de bord, dessinés en SVG.
 *
 * Couleurs (validées sur le fond des cartes #1c1c1e, daltonisme compris) :
 *   - une mesure seule (poids, pas, calories, distance) : violet ;
 *   - familles de séances, dans cet ordre fixe : vélo bleu, musculation
 *     orange, marche et course vert d'eau, autre sport jaune.
 * Le texte garde les couleurs de texte : la couleur n'est portée que par les marques.
 */
export const MEASURE_COLOR = '#9085e9';
export const KIND_COLORS = {
  bike: '#3987e5',
  strength: '#d95926',
  walk: '#199e70',
  other: '#c98500',
};
const RAW_POINT_COLOR = '#77777d';

const fmtDate = (date, options) => date.toLocaleDateString('fr-FR', options);
export const shortDate = (key) => fmtDate(dayDate(key), { day: 'numeric', month: 'short' });
export const longDate = (key) => fmtDate(dayDate(key), { weekday: 'short', day: 'numeric', month: 'long' });

/** Largeur disponible d'un élément, suivie au redimensionnement. */
export function useWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const update = () => setWidth(node.clientWidth);
    update();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

/** Graduations rondes couvrant [min, max] (environ `count` pas). */
export function niceTicks(min, max, count = 4) {
  if (!(max > min)) return [min];
  const rough = (max - min) / count;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= rough) || rough;
  const ticks = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-6; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return ticks;
}

const fmtNumber = (value, decimals = 0) =>
  Number(value).toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** 12 000 → « 12 k » sur un axe qui dépasse 10 000. */
const axisNumber = (value, max) => {
  if (max >= 10000) return `${fmtNumber(value / 1000, value % 1000 ? 1 : 0)} k`;
  return fmtNumber(value, max < 10 && value % 1 ? 1 : 0);
};

/** Bulle d'information, placée près du point survolé et gardée dans le graphique. */
function Tooltip({ x, y, width, children }) {
  const left = Math.min(Math.max(x, 78), Math.max(78, width - 78));
  return (
    <div className="viz-tip" style={{ left, top: y }} role="status">
      {children}
    </div>
  );
}

function TipRow({ color, value, label }) {
  return (
    <div className="viz-tip-row">
      {color && <span className="viz-tip-key" style={{ background: color }} />}
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

// ── Courbe de poids ──────────────────────────────────────────────────

/**
 * Tendance du poids (courbe) et pesées (points gris).
 * @param {Array<{ day, t, kg, trend }>} points
 * @param {number|null} goalKg - tracé seulement s'il tombe dans l'échelle
 */
export function WeightChart({ points, goalKg = null, height = 220 }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const pad = { top: 12, right: 14, bottom: 26, left: 40 };

  const scale = useMemo(() => {
    if (!points.length || !width) return null;
    const values = points.flatMap((p) => [p.kg, p.trend]);
    let min = Math.min(...values);
    let max = Math.max(...values);
    const spread = Math.max(max - min, 1);
    // L'objectif entre dans l'échelle s'il est proche ; sinon il la tasserait.
    const goalVisible = goalKg != null && goalKg > min - spread * 0.5 && goalKg < max + spread * 0.5;
    if (goalVisible) {
      min = Math.min(min, goalKg);
      max = Math.max(max, goalKg);
    }
    const margin = Math.max((max - min) * 0.12, 0.3);
    const ticks = niceTicks(min - margin, max + margin, 4);
    const y0 = Math.min(ticks[0], min - margin);
    const y1 = Math.max(ticks[ticks.length - 1], max + margin);
    const t0 = points[0].t;
    const t1 = points[points.length - 1].t;
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;
    const x = (t) => pad.left + (t1 === t0 ? innerW / 2 : ((t - t0) / (t1 - t0)) * innerW);
    const y = (v) => pad.top + (1 - (v - y0) / (y1 - y0)) * innerH;
    return { x, y, ticks, goalVisible, innerW, innerH };
  }, [points, width, height, goalKg]);

  if (!points.length) return <div ref={ref} className="viz-empty">Pas de pesée sur cette période.</div>;

  const xTicks = (() => {
    if (!scale) return [];
    const count = Math.max(2, Math.min(5, Math.floor(scale.innerW / 80)));
    const picked = new Map();
    for (let i = 0; i < count; i += 1) {
      const index = Math.round((i / (count - 1)) * (points.length - 1));
      picked.set(points[index].day, points[index]);
    }
    return [...picked.values()];
  })();

  const onMove = (event) => {
    if (!scale) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - bounds.left;
    let best = 0;
    points.forEach((p, i) => {
      if (Math.abs(scale.x(p.t) - px) < Math.abs(scale.x(points[best].t) - px)) best = i;
    });
    setHover(best);
  };

  const last = points[points.length - 1];
  const active = hover != null ? points[hover] : null;

  return (
    <div ref={ref} className="viz" style={{ height }}>
      {scale && (
        <>
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={`Courbe du poids : ${fmtNumber(points[0].trend, 1)} kg le ${shortDate(points[0].day)}, ${fmtNumber(last.trend, 1)} kg le ${shortDate(last.day)}`}
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={() => setHover(null)}
          >
            {scale.ticks.map((tick) => (
              <g key={tick}>
                <line className="viz-grid" x1={pad.left} x2={width - pad.right} y1={scale.y(tick)} y2={scale.y(tick)} />
                <text className="viz-axis" x={pad.left - 8} y={scale.y(tick)} dy="0.32em" textAnchor="end">{fmtNumber(tick, tick % 1 ? 1 : 0)}</text>
              </g>
            ))}
            {xTicks.map((p, i) => (
              <text
                key={p.day}
                className="viz-axis"
                x={scale.x(p.t)}
                y={height - 8}
                textAnchor={i === 0 ? 'start' : i === xTicks.length - 1 ? 'end' : 'middle'}
              >
                {shortDate(p.day)}
              </text>
            ))}
            {scale.goalVisible && (
              <g>
                <line className="viz-goal" x1={pad.left} x2={width - pad.right} y1={scale.y(goalKg)} y2={scale.y(goalKg)} />
                <text className="viz-axis viz-goal-label" x={width - pad.right} y={scale.y(goalKg) - 6} textAnchor="end">
                  Objectif {fmtNumber(goalKg, goalKg % 1 ? 1 : 0)} kg
                </text>
              </g>
            )}
            {points.map((p) => (
              <circle key={p.day} cx={scale.x(p.t)} cy={scale.y(p.kg)} r={points.length > 60 ? 1.5 : 2.5} fill={RAW_POINT_COLOR} />
            ))}
            <polyline
              fill="none"
              stroke={MEASURE_COLOR}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={points.map((p) => `${scale.x(p.t)},${scale.y(p.trend)}`).join(' ')}
            />
            <circle className="viz-ring" cx={scale.x(last.t)} cy={scale.y(last.trend)} r="4.5" fill={MEASURE_COLOR} />
            {active && (
              <g>
                <line className="viz-cross" x1={scale.x(active.t)} x2={scale.x(active.t)} y1={pad.top} y2={height - pad.bottom} />
                <circle className="viz-ring" cx={scale.x(active.t)} cy={scale.y(active.trend)} r="4.5" fill={MEASURE_COLOR} />
              </g>
            )}
          </svg>
          {active && (
            <Tooltip x={scale.x(active.t)} y={pad.top} width={width}>
              <div className="viz-tip-title">{longDate(active.day)}</div>
              <TipRow color={MEASURE_COLOR} value={`${fmtNumber(active.trend, 1)} kg`} label="tendance" />
              <TipRow color={RAW_POINT_COLOR} value={`${fmtNumber(active.kg, 1)} kg`} label="pesée" />
            </Tooltip>
          )}
        </>
      )}
    </div>
  );
}

// ── Barres d'activité ────────────────────────────────────────────────

/**
 * Colonnes : une mesure seule, ou des minutes de sport empilées par famille.
 * @param {Array<{ key, label, title, value, parts? }>} bars
 * @param {(value:number) => string} format - valeur avec son unité
 */
export function BarChart({ bars, stacked = false, format, height = 200 }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const pad = { top: 10, right: 6, bottom: 24, left: 40 };

  const max = Math.max(0, ...bars.map((b) => b.value || 0));
  if (!bars.length || max <= 0) {
    return <div ref={ref} className="viz-empty">Pas de donnée sur cette période.</div>;
  }
  const ticks = niceTicks(0, max, 3);
  const top = Math.max(ticks[ticks.length - 1], max);
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;
  const slot = innerW / bars.length;
  const barW = Math.max(2, Math.min(24, slot - 2));
  const y = (v) => pad.top + (1 - v / top) * innerH;
  const labelEvery = Math.max(1, Math.ceil(bars.length / Math.max(2, Math.floor(innerW / 56))));
  const active = hover != null ? bars[hover] : null;

  return (
    <div ref={ref} className="viz" style={{ height }}>
      {width > 0 && (
        <>
          <svg width={width} height={height} role="img" aria-label="Activité par période">
            {ticks.map((tick) => (
              <g key={tick}>
                <line className="viz-grid" x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} />
                <text className="viz-axis" x={pad.left - 8} y={y(tick)} dy="0.32em" textAnchor="end">{axisNumber(tick, top)}</text>
              </g>
            ))}
            {bars.map((bar, i) => {
              const cx = pad.left + slot * i + slot / 2;
              const x = cx - barW / 2;
              let segments = [];
              if (stacked && bar.parts) {
                let base = 0;
                segments = KINDS.filter((kind) => bar.parts[kind] > 0).map((kind) => {
                  const from = base;
                  base += bar.parts[kind];
                  return { kind, from, to: base, color: KIND_COLORS[kind] };
                });
              } else if (bar.value > 0) {
                segments = [{ kind: 'value', from: 0, to: bar.value, color: MEASURE_COLOR }];
              }
              return (
                <g key={bar.key} opacity={hover == null || hover === i ? 1 : 0.45}>
                  {segments.map((segment, index) => {
                    const isTop = index === segments.length - 1;
                    const yTop = y(segment.to);
                    // 2 px de fond entre deux segments empilés.
                    const h = Math.max(1, y(segment.from) - yTop - (index > 0 ? 2 : 0));
                    const r = isTop ? Math.min(4, barW / 2, h) : 0;
                    return (
                      <path
                        key={segment.kind}
                        fill={segment.color}
                        d={`M${x},${yTop + h} V${yTop + r} Q${x},${yTop} ${x + r},${yTop} H${x + barW - r} Q${x + barW},${yTop} ${x + barW},${yTop + r} V${yTop + h} Z`}
                      />
                    );
                  })}
                  {i % labelEvery === 0 && (
                    <text className="viz-axis" x={cx} y={height - 7} textAnchor="middle">{bar.label}</text>
                  )}
                  <rect
                    className="viz-hit"
                    x={pad.left + slot * i}
                    y={pad.top}
                    width={slot}
                    height={innerH}
                    tabIndex={0}
                    aria-label={`${bar.title} : ${bar.value != null ? format(bar.value) : 'pas de donnée'}`}
                    onPointerEnter={() => setHover(i)}
                    onPointerDown={() => setHover(i)}
                    onPointerLeave={() => setHover(null)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                  />
                </g>
              );
            })}
          </svg>
          {active && (
            <Tooltip x={pad.left + slot * hover + slot / 2} y={pad.top} width={width}>
              <div className="viz-tip-title">{active.title}</div>
              {active.value == null && <div className="viz-tip-row"><span>Pas de donnée</span></div>}
              {active.value != null && stacked && active.parts
                ? (
                  <>
                    {KINDS.filter((kind) => active.parts[kind] > 0).map((kind) => (
                      <TipRow key={kind} color={KIND_COLORS[kind]} value={format(active.parts[kind])} label={KIND_LABELS[kind]} />
                    ))}
                    <TipRow value={format(active.value)} label="au total" />
                  </>
                )
                : active.value != null && <TipRow color={MEASURE_COLOR} value={format(active.value)} label={active.note || ''} />}
            </Tooltip>
          )}
        </>
      )}
    </div>
  );
}

/** Légende des familles de séances (carrés, comme les barres). */
export function KindLegend({ kinds = KINDS }) {
  return (
    <ul className="viz-legend">
      {kinds.map((kind) => (
        <li key={kind}>
          <span className="viz-legend-key" style={{ background: KIND_COLORS[kind] }} />
          {KIND_LABELS[kind]}
        </li>
      ))}
    </ul>
  );
}

// ── Mini-courbe ──────────────────────────────────────────────────────

/** Mini-courbe d'une tuile : la forme de l'évolution, sans axe. */
export function Sparkline({ values, width = 84, height = 28 }) {
  const known = values.filter((v) => v != null);
  if (known.length < 2) return <svg width={width} height={height} aria-hidden="true" />;
  const min = Math.min(...known);
  const max = Math.max(...known);
  const span = max - min || 1;
  const step = (width - 8) / (values.length - 1);
  const coords = values
    .map((v, i) => (v == null ? null : [4 + i * step, 4 + (1 - (v - min) / span) * (height - 8)]))
    .filter(Boolean);
  const [lastX, lastY] = coords[coords.length - 1];
  return (
    <svg width={width} height={height} aria-hidden="true">
      <polyline
        fill="none"
        stroke={RAW_POINT_COLOR}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={coords.map((c) => c.join(',')).join(' ')}
      />
      <circle cx={lastX} cy={lastY} r="3" fill={MEASURE_COLOR} />
    </svg>
  );
}

// ── Calendrier de régularité ─────────────────────────────────────────

const HEAT_LEVELS = [
  { min: 60, opacity: 1, label: '60 min et plus' },
  { min: 40, opacity: 0.72, label: '40 à 59 min' },
  { min: 20, opacity: 0.46, label: '20 à 39 min' },
  { min: 1, opacity: 0.24, label: '1 à 19 min' },
];

const heatLevel = (minutes) => HEAT_LEVELS.find((level) => minutes >= level.min) || null;

/**
 * Une case par jour, une colonne par semaine (lundi en haut) : plus la case
 * est claire, plus il y a eu de sport ce jour-là.
 * @param {Array<{ day, sportMinutes }>} daily - doit commencer un lundi
 */
export function Heatmap({ daily }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const weeks = Math.ceil(daily.length / 7);
  const labelW = 14;
  const gap = 3;
  const cell = Math.max(8, Math.min(18, Math.floor((width - labelW - gap) / weeks) - gap));
  const height = 7 * (cell + gap) + 16;
  const active = hover != null ? daily[hover] : null;
  const monthLabels = [];
  for (let w = 0; w < weeks; w += 1) {
    const month = dayDate(daily[w * 7].day).toLocaleDateString('fr-FR', { month: 'short' });
    if (!monthLabels.length || monthLabels[monthLabels.length - 1].month !== month) monthLabels.push({ w, month });
  }

  return (
    <div ref={ref} className="viz" style={{ height }}>
      {width > 0 && (
        <>
          <svg width={width} height={height} role="img" aria-label="Minutes de sport par jour">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((letter, row) => (row % 2 === 0 ? (
              <text key={row} className="viz-axis" x={0} y={16 + row * (cell + gap) + cell / 2} dy="0.32em">{letter}</text>
            ) : null))}
            {monthLabels.filter((m, i) => i === 0 || m.w - monthLabels[i - 1].w >= 3).map((m) => (
              <text key={m.w} className="viz-axis" x={labelW + m.w * (cell + gap)} y={9}>{m.month}</text>
            ))}
            {daily.map((d, i) => {
              const level = heatLevel(d.sportMinutes);
              return (
                <rect
                  key={d.day}
                  className={`viz-heat${hover === i ? ' is-active' : ''}`}
                  x={labelW + Math.floor(i / 7) * (cell + gap)}
                  y={16 + (i % 7) * (cell + gap)}
                  width={cell}
                  height={cell}
                  rx="3"
                  fill={level ? MEASURE_COLOR : 'var(--surface-2)'}
                  fillOpacity={level ? level.opacity : 1}
                  tabIndex={0}
                  aria-label={`${longDate(d.day)} : ${d.sportMinutes} min de sport`}
                  onPointerEnter={() => setHover(i)}
                  onPointerDown={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                />
              );
            })}
          </svg>
          {active && (
            <Tooltip x={labelW + Math.floor(hover / 7) * (cell + gap) + cell / 2} y={0} width={width}>
              <div className="viz-tip-title">{longDate(active.day)}</div>
              <TipRow color={MEASURE_COLOR} value={`${active.sportMinutes} min`} label="de sport" />
            </Tooltip>
          )}
        </>
      )}
    </div>
  );
}

/** Échelle du calendrier : de « rien » à « 60 min et plus ». */
export function HeatLegend() {
  return (
    <div className="viz-heat-legend" aria-hidden="true">
      <span>Moins</span>
      <span className="viz-heat-key" style={{ background: 'var(--surface-2)' }} />
      {[...HEAT_LEVELS].reverse().map((level) => (
        <span key={level.min} className="viz-heat-key" style={{ background: MEASURE_COLOR, opacity: level.opacity }} title={level.label} />
      ))}
      <span>Plus</span>
    </div>
  );
}
