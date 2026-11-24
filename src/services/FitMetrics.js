/**
 * Calculs du tableau de bord : séries de poids, activité par jour, par semaine,
 * comparaisons entre périodes. Fonctions pures, sans stockage ni import : les
 * données leur sont passées (pesées, jours, séances).
 *
 * Formes attendues :
 *   - pesée   : { weight, date (ISO), composition? }
 *   - jour    : { steps?, activeKcal?, totalKcal?, distanceM? } rangé par 'AAAA-MM-JJ'
 *   - séance  : { id, kind, startMs, endMs, minutes, kcal?, km? }
 */

export const DAY_MS = 86400000;

/** Familles de séances, dans l'ordre fixe des couleurs et des légendes. */
export const KINDS = ['bike', 'strength', 'walk', 'other'];
export const KIND_LABELS = {
  bike: 'Vélo',
  strength: 'Musculation',
  walk: 'Marche et course',
  other: 'Autre sport',
};

const pad = (n) => String(n).padStart(2, '0');

/** 'AAAA-MM-JJ' en heure locale. */
export function dayKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Midi local du jour 'AAAA-MM-JJ' (midi : à l'abri des changements d'heure). */
export function dayDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export function addDays(key, n) {
  const d = dayDate(key);
  d.setDate(d.getDate() + n);
  return dayKey(d);
}

export function diffDays(fromKey, toKey) {
  return Math.round((dayDate(toKey) - dayDate(fromKey)) / DAY_MS);
}

/** Lundi de la semaine du jour donné. */
export function weekStart(key) {
  const d = dayDate(key);
  return addDays(key, -((d.getDay() + 6) % 7));
}

/** Liste des jours de `fromKey` à `toKey` compris. */
export function dayRange(fromKey, toKey) {
  const out = [];
  for (let key = fromKey; key <= toKey; key = addDays(key, 1)) out.push(key);
  return out;
}

const mean = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);

// ── Poids ────────────────────────────────────────────────────────────

/**
 * Une valeur par jour pesé (moyenne des pesées du jour), du plus ancien au
 * plus récent, avec la tendance : moyenne des pesées des 7 jours précédents,
 * jour compris. La tendance gomme les écarts d'eau d'un jour à l'autre.
 * @returns {Array<{ day, t, kg, trend, composition }>}
 */
export function weightSeries(records) {
  const byDay = new Map();
  for (const r of records || []) {
    const kg = Number(r?.weight);
    const time = new Date(r?.date).getTime();
    if (!(kg > 0) || Number.isNaN(time)) continue;
    const day = dayKey(new Date(time));
    const slot = byDay.get(day) || { values: [], composition: null, time };
    slot.values.push(kg);
    if (r.composition && typeof r.composition === 'object' && time >= slot.time) {
      slot.composition = r.composition;
      slot.time = time;
    }
    byDay.set(day, slot);
  }
  const points = [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([day, slot]) => ({ day, t: dayDate(day).getTime(), kg: mean(slot.values), composition: slot.composition }));
  points.forEach((point, i) => {
    const window = [];
    for (let j = i; j >= 0 && diffDays(points[j].day, point.day) < 7; j -= 1) window.push(points[j].kg);
    point.trend = mean(window);
  });
  return points;
}

/**
 * Pente de la tendance en kg par semaine (droite des moindres carrés sur les
 * points de la période). null avec moins de deux jours pesés ou moins de
 * 5 jours d'écart.
 */
export function weightSlopePerWeek(points) {
  if (!points || points.length < 2) return null;
  const span = diffDays(points[0].day, points[points.length - 1].day);
  if (span < 5) return null;
  const xs = points.map((p) => diffDays(points[0].day, p.day));
  const ys = points.map((p) => p.kg);
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let den = 0;
  xs.forEach((x, i) => {
    num += (x - mx) * (ys[i] - my);
    den += (x - mx) ** 2;
  });
  return den > 0 ? (num / den) * 7 : null;
}

/**
 * Date à laquelle la tendance atteint `goalKg` au rythme `slopePerWeek`.
 * null si le rythme ne va pas vers l'objectif ou s'il faut plus de 5 ans.
 */
export function projectGoalDate(currentKg, goalKg, slopePerWeek, from = new Date()) {
  if (!(currentKg > 0) || !(goalKg > 0) || !slopePerWeek) return null;
  const remaining = goalKg - currentKg;
  if (Math.abs(remaining) < 0.05) return from;
  if (Math.sign(remaining) !== Math.sign(slopePerWeek)) return null;
  const weeks = remaining / slopePerWeek;
  if (weeks > 260) return null;
  return new Date(from.getTime() + weeks * 7 * DAY_MS);
}

/** Masse grasse en kg d'un point pesé, ou null. */
export function fatMassKg(point) {
  const fat = Number(point?.composition?.bodyFat);
  return fat > 0 ? (point.kg * fat) / 100 : null;
}

// ── Activité par jour ────────────────────────────────────────────────

/**
 * Un enregistrement par jour de `fromKey` à `toKey` : pas, distance, calories
 * actives et minutes de sport par famille. Une valeur absente reste null (jour
 * sans donnée), sauf les minutes de sport : 0 quand il n'y a pas de séance.
 *
 * Calories actives : celles du téléphone si elles existent, sinon la somme des
 * calories des séances du jour.
 */
export function dailyActivity(days, sessions, fromKey, toKey) {
  const byDay = new Map();
  for (const s of sessions || []) {
    const key = dayKey(new Date(s.startMs));
    if (key < fromKey || key > toKey) continue;
    const slot = byDay.get(key) || { minutes: {}, kcal: 0, hasKcal: false, count: 0 };
    slot.minutes[s.kind] = (slot.minutes[s.kind] || 0) + (Number(s.minutes) || 0);
    if (Number(s.kcal) > 0) {
      slot.kcal += Number(s.kcal);
      slot.hasKcal = true;
    }
    slot.count += 1;
    byDay.set(key, slot);
  }
  const num = (v) => (Number.isFinite(Number(v)) && v != null ? Number(v) : null);
  return dayRange(fromKey, toKey).map((key) => {
    const day = days?.[key] || {};
    const slot = byDay.get(key);
    const minutes = Object.fromEntries(KINDS.map((kind) => [kind, slot?.minutes[kind] || 0]));
    const active = num(day.activeKcal);
    return {
      day: key,
      steps: num(day.steps),
      distanceKm: num(day.distanceM) != null ? num(day.distanceM) / 1000 : null,
      totalKcal: num(day.totalKcal),
      activeKcal: active != null && active > 0 ? active : (slot?.hasKcal ? slot.kcal : null),
      minutes,
      sportMinutes: KINDS.reduce((sum, kind) => sum + minutes[kind], 0),
      sessions: slot?.count || 0,
    };
  });
}

/** Mesures d'activité affichables : libellé, unité, lecture d'un jour, mode d'agrégation. */
export const ACTIVITY_METRICS = {
  steps: { label: 'Pas', unit: 'pas', read: (d) => d.steps, aggregate: 'mean', perDayLabel: 'pas par jour', decimals: 0 },
  sport: { label: 'Sport', unit: 'min', read: (d) => d.sportMinutes, aggregate: 'sum', perDayLabel: 'min de sport par jour', decimals: 0, stacked: true },
  kcal: { label: 'Calories', unit: 'kcal', read: (d) => d.activeKcal, aggregate: 'mean', perDayLabel: 'kcal actives par jour', decimals: 0 },
  distance: { label: 'Distance', unit: 'km', read: (d) => d.distanceKm, aggregate: 'mean', perDayLabel: 'km par jour', decimals: 1 },
};

/**
 * Regroupe des jours en barres : par jour, par semaine (lundi) ou par mois.
 * Pour une mesure « mean », la barre est la moyenne par jour des jours qui ont
 * une donnée ; pour « sum », le total.
 * @returns {Array<{ key, from, to, value, parts?, days }>}
 */
export function bucketActivity(daily, metricKey, grain) {
  const metric = ACTIVITY_METRICS[metricKey];
  const groups = new Map();
  for (const d of daily) {
    const key = grain === 'day' ? d.day : grain === 'week' ? weekStart(d.day) : d.day.slice(0, 7);
    const group = groups.get(key) || { key, from: d.day, to: d.day, list: [] };
    group.to = d.day;
    group.list.push(d);
    groups.set(key, group);
  }
  return [...groups.values()].map((group) => {
    const values = group.list.map(metric.read).filter((v) => v != null);
    const total = values.reduce((a, b) => a + b, 0);
    const out = {
      key: group.key,
      from: group.from,
      to: group.to,
      days: group.list.length,
      value: values.length ? (metric.aggregate === 'sum' ? total : total / values.length) : null,
    };
    if (metric.stacked) {
      out.parts = Object.fromEntries(KINDS.map((kind) => [kind, group.list.reduce((sum, d) => sum + d.minutes[kind], 0)]));
    }
    return out;
  });
}

/** Résumé d'une période : moyennes par jour, totaux, jours actifs. */
export function summarize(daily) {
  const pick = (read) => daily.map(read).filter((v) => v != null);
  const steps = pick((d) => d.steps);
  const kcal = pick((d) => d.activeKcal);
  const distance = pick((d) => d.distanceKm);
  const sportTotal = daily.reduce((sum, d) => sum + d.sportMinutes, 0);
  return {
    days: daily.length,
    stepsPerDay: mean(steps),
    kcalPerDay: mean(kcal),
    distancePerDay: mean(distance),
    distanceTotal: distance.length ? distance.reduce((a, b) => a + b, 0) : null,
    sportMinutes: sportTotal,
    sportPerWeek: daily.length ? (sportTotal / daily.length) * 7 : null,
    sessions: daily.reduce((sum, d) => sum + d.sessions, 0),
    activeDays: daily.filter((d) => d.sportMinutes > 0).length,
    byKind: Object.fromEntries(KINDS.map((kind) => [kind, daily.reduce((sum, d) => sum + d.minutes[kind], 0)])),
  };
}

/** Jours de sport d'affilée jusqu'à aujourd'hui (hier compte si aujourd'hui est encore vide). */
export function currentStreak(daily) {
  let i = daily.length - 1;
  if (i >= 0 && daily[i].sportMinutes === 0) i -= 1;
  let streak = 0;
  for (; i >= 0 && daily[i].sportMinutes > 0; i -= 1) streak += 1;
  return streak;
}

// ── Semaine par semaine ──────────────────────────────────────────────

/**
 * Une ligne par semaine (lundi → dimanche), la plus récente d'abord : poids
 * moyen, écart avec la semaine pesée précédente, pas par jour, minutes de
 * sport, calories actives par jour.
 */
export function weeklyTable(points, daily) {
  const weeks = new Map();
  const slot = (key) => {
    if (!weeks.has(key)) weeks.set(key, { week: key, weights: [], list: [] });
    return weeks.get(key);
  };
  for (const p of points) slot(weekStart(p.day)).weights.push(p.kg);
  for (const d of daily) slot(weekStart(d.day)).list.push(d);

  const rows = [...weeks.values()]
    .sort((a, b) => (a.week < b.week ? -1 : 1))
    .map((w) => {
      const summary = summarize(w.list);
      return {
        week: w.week,
        weight: mean(w.weights),
        weighIns: w.weights.length,
        stepsPerDay: summary.stepsPerDay,
        sportMinutes: w.list.length ? summary.sportMinutes : null,
        kcalPerDay: summary.kcalPerDay,
        sessions: summary.sessions,
      };
    });
  let previous = null;
  for (const row of rows) {
    row.delta = row.weight != null && previous != null ? row.weight - previous : null;
    if (row.weight != null) previous = row.weight;
  }
  return rows.reverse();
}

/**
 * Lien entre le sport d'une semaine et l'évolution du poids cette semaine-là :
 * compare les semaines au-dessus et au-dessous de la médiane des minutes de
 * sport. null avec moins de 6 semaines complètes (poids + activité).
 */
export function activityWeightLink(rows) {
  const usable = rows.filter((r) => r.delta != null && r.sportMinutes != null);
  if (usable.length < 6) return null;
  const sorted = usable.map((r) => r.sportMinutes).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const high = usable.filter((r) => r.sportMinutes >= median);
  const low = usable.filter((r) => r.sportMinutes < median);
  if (high.length < 2 || low.length < 2) return null;
  return {
    median,
    weeks: usable.length,
    high: { weeks: high.length, delta: mean(high.map((r) => r.delta)) },
    low: { weeks: low.length, delta: mean(low.map((r) => r.delta)) },
  };
}

// ── Périodes ─────────────────────────────────────────────────────────

export const PERIODS = [
  { key: '7', label: '7 j', days: 7 },
  { key: '30', label: '30 j', days: 30 },
  { key: '90', label: '90 j', days: 90 },
  { key: '365', label: '1 an', days: 365 },
  { key: 'all', label: 'Tout', days: null },
];

/** Grain des barres selon la longueur de la période. */
export function grainFor(days) {
  if (days <= 31) return 'day';
  if (days <= 190) return 'week';
  return 'month';
}

/** Écart relatif entre deux moyennes (0,12 = +12 %), ou null. */
export function relativeChange(current, previous) {
  if (current == null || previous == null || previous === 0) return null;
  return (current - previous) / previous;
}
