import React, { useMemo, useState } from 'react';
import {
  ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Dumbbell, Equal, Flame, Footprints, MapPin, Scale, Star, Timer, Zap,
} from 'lucide-react';
import { addDays, dailyActivity, dayDate, diffDays, weekStart } from '../services/FitMetrics';

const fmt = (value, decimals = 0) =>
  Number(value).toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const hoursMinutes = (minutes) => (minutes >= 60 ? `${Math.floor(minutes / 60)} h ${String(Math.round(minutes % 60)).padStart(2, '0')}` : `${Math.round(minutes)} min`);
const sum = (values) => values.reduce((a, b) => a + b, 0);
const known = (list, read) => list.map(read).filter((v) => v != null);
const mean = (values) => (values.length ? sum(values) / values.length : null);
const dayMonth = (key) => dayDate(key).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

/** Totaux et moyennes d'une suite de jours. */
function totals(daily) {
  const steps = known(daily, (d) => d.steps);
  const km = known(daily, (d) => d.distanceKm);
  const total = known(daily, (d) => d.totalKcal);
  const active = known(daily, (d) => d.activeKcal);
  return {
    steps: steps.length ? sum(steps) : null,
    stepsPerDay: mean(steps),
    km: km.length ? sum(km) : null,
    totalKcal: mean(total),
    activeKcal: mean(active),
    sportMinutes: sum(daily.map((d) => d.sportMinutes)),
    sessions: sum(daily.map((d) => d.sessions)),
  };
}

/**
 * Pastille de comparaison avec la semaine d'avant.
 * @param {number|null} current
 * @param {number|null} previous
 * @param {(n:number) => string} format - écart sans signe, avec son unité
 * @param {'up'|'down'} goodWhen - sens d'une bonne évolution
 */
function Compare({ current, previous, format, goodWhen = 'up', threshold = 0.5 }) {
  if (current == null || previous == null) return <span className="wk-chip none">pas de comparaison</span>;
  const diff = current - previous;
  if (Math.abs(diff) < threshold) {
    return <span className="wk-chip same"><Equal size={13} aria-hidden="true" /> comme la semaine d'avant</span>;
  }
  const good = goodWhen === 'up' ? diff > 0 : diff < 0;
  const Icon = diff > 0 ? ArrowUp : ArrowDown;
  return (
    <span className={`wk-chip ${good ? 'good' : 'less'}`}>
      <Icon size={13} aria-hidden="true" /> {format(Math.abs(diff))} {diff > 0 ? 'de plus' : 'de moins'}
    </span>
  );
}

/** Anneau d'un jour : part du meilleur jour de la semaine. */
function DayRing({ day, share, best, future }) {
  const size = 44;
  const r = 18;
  const length = 2 * Math.PI * r;
  const arc = length * 0.75;
  const label = dayDate(day.day).toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '');
  return (
    <li className={`wk-day${best ? ' best' : ''}${future ? ' future' : ''}`}>
      <span className="wk-ring" aria-hidden="true">
        {best ? (
          <span className="wk-ring-best"><Star size={20} fill="currentColor" /></span>
        ) : (
          <svg className="wk-ring-svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle className="wk-ring-track" cx={size / 2} cy={size / 2} r={r} strokeDasharray={`${arc} ${length}`} transform={`rotate(135 ${size / 2} ${size / 2})`} />
            {share > 0 && (
              <circle className="wk-ring-fill" cx={size / 2} cy={size / 2} r={r} strokeDasharray={`${Math.max(2, arc * share)} ${length}`} transform={`rotate(135 ${size / 2} ${size / 2})`} />
            )}
          </svg>
        )}
        {!best && <Footprints size={15} className="wk-ring-icon" />}
      </span>
      <span className="wk-day-name">{best ? 'Meilleur jour' : label}</span>
      <span className="wk-day-value">{day.steps != null ? fmt(day.steps) : '–'}</span>
    </li>
  );
}

function Stat({ icon: Icon, value, label, children }) {
  return (
    <div className="wk-stat">
      <Icon size={24} className="wk-stat-icon" aria-hidden="true" />
      <span className="wk-stat-value">{value}</span>
      <span className="wk-stat-label">{label}</span>
      {children}
    </div>
  );
}

/**
 * Résumé d'une semaine (lundi → dimanche) : un anneau de pas par jour, le
 * total de pas, puis les autres mesures, chacune comparée à la semaine d'avant.
 * Une semaine en cours est comparée aux mêmes jours de la semaine d'avant.
 * @param {Object} days - totaux par jour (FitStore)
 * @param {Array} sessions - séances
 * @param {Array} points - jours pesés (weightSeries)
 * @param {string} today - 'AAAA-MM-JJ'
 */
export default function WeekSummary({ days, sessions, points, today }) {
  const [offset, setOffset] = useState(0);
  const from = addDays(weekStart(today), offset * 7);
  const to = addDays(from, 6);
  const elapsed = Math.min(7, Math.max(1, diffDays(from, today) + 1));
  const inProgress = offset === 0 && elapsed < 7;

  const week = useMemo(() => {
    const daily = dailyActivity(days, sessions, from, to);
    const done = daily.slice(0, elapsed);
    const previousFrom = addDays(from, -7);
    const previous = dailyActivity(days, sessions, previousFrom, addDays(previousFrom, elapsed - 1));
    const weightOf = (start, end) => mean(points.filter((p) => p.day >= start && p.day <= end).map((p) => p.kg));
    const withSteps = done.filter((d) => d.steps != null && d.steps > 0);
    const best = withSteps.length ? withSteps.reduce((a, b) => (b.steps > a.steps ? b : a)) : null;
    return {
      daily,
      best,
      now: totals(done),
      before: totals(previous),
      weight: weightOf(from, to),
      weightBefore: weightOf(previousFrom, addDays(previousFrom, 6)),
    };
  }, [days, sessions, points, from, to, elapsed]);

  const { now, before, best } = week;
  const stepsDiff = now.steps != null && before.steps != null ? now.steps - before.steps : null;

  return (
    <section className="db-card wk" aria-labelledby="wk-title">
      <div className="wk-head">
        <button type="button" className="db-icon-btn" onClick={() => setOffset((o) => o - 1)} aria-label="Semaine précédente">
          <ChevronLeft size={20} />
        </button>
        <div className="wk-head-copy">
          <h2 id="wk-title">{offset === 0 ? 'Cette semaine' : offset === -1 ? 'La semaine dernière' : 'Semaine'}</h2>
          <span>du {dayMonth(from)} au {dayMonth(to)}{inProgress ? ' · en cours' : ''}</span>
        </div>
        <button type="button" className="db-icon-btn" onClick={() => setOffset((o) => o + 1)} disabled={offset >= 0} aria-label="Semaine suivante">
          <ChevronRight size={20} />
        </button>
      </div>

      <ul className="wk-days">
        {week.daily.map((day) => (
          <DayRing
            key={day.day}
            day={day}
            best={best?.day === day.day}
            future={day.day > today}
            share={best && day.steps ? Math.min(1, day.steps / best.steps) : 0}
          />
        ))}
      </ul>

      <div className="wk-hero">
        <Footprints size={34} className="wk-hero-icon" aria-hidden="true" />
        <div className="wk-hero-value">{now.steps != null ? fmt(now.steps) : '–'}</div>
        <div className="wk-hero-label">pas au total</div>
        <div className="wk-chips">
          {best && <span className="wk-chip good"><Star size={13} aria-hidden="true" /> Meilleur jour · {fmt(best.steps)}</span>}
          {now.stepsPerDay != null && <span className="wk-chip same"><Footprints size={13} aria-hidden="true" /> {fmt(now.stepsPerDay)} pas par jour</span>}
          {stepsDiff != null && Math.abs(stepsDiff) >= 1 && (
            <span className={`wk-chip ${stepsDiff > 0 ? 'good' : 'less'}`}>
              {stepsDiff > 0 ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" />}
              {fmt(Math.abs(stepsDiff))} {stepsDiff > 0 ? 'de plus' : 'de moins'} que la semaine d'avant
            </span>
          )}
        </div>
      </div>

      <div className="wk-stats">
        <Stat icon={MapPin} value={now.km != null ? fmt(now.km, 1) : '–'} label="kilomètres au total">
          <Compare current={now.km} previous={before.km} format={(n) => `${fmt(n, 1)} km`} threshold={0.05} />
        </Stat>
        <Stat icon={Flame} value={now.totalKcal != null ? fmt(now.totalKcal) : '–'} label="calories brûlées par jour">
          <Compare current={now.totalKcal} previous={before.totalKcal} format={(n) => `${fmt(n)} kcal`} threshold={10} />
        </Stat>
        <Stat icon={Zap} value={now.activeKcal != null ? fmt(now.activeKcal) : '–'} label="calories actives par jour">
          <Compare current={now.activeKcal} previous={before.activeKcal} format={(n) => `${fmt(n)} kcal`} threshold={10} />
        </Stat>
        <Stat icon={Timer} value={hoursMinutes(now.sportMinutes)} label="de sport au total">
          <Compare current={now.sportMinutes} previous={before.sportMinutes} format={hoursMinutes} />
        </Stat>
        <Stat icon={Dumbbell} value={fmt(now.sessions)} label={now.sessions > 1 ? 'séances' : 'séance'}>
          <Compare current={now.sessions} previous={before.sessions} format={(n) => fmt(n)} />
        </Stat>
        <Stat icon={Scale} value={week.weight != null ? `${fmt(week.weight, 1)} kg` : '–'} label="poids moyen">
          <Compare current={week.weight} previous={week.weightBefore} format={(n) => `${fmt(n, 1)} kg`} goodWhen="down" threshold={0.05} />
        </Stat>
      </div>
      {inProgress && (
        <p className="db-caption">Semaine en cours : comparée {elapsed === 1 ? 'au lundi' : `aux ${elapsed} premiers jours`} de la semaine d'avant (poids : semaine entière).</p>
      )}
    </section>
  );
}
