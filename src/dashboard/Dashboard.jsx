import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowDownRight, ArrowUpRight, Bike, Dumbbell, Flame, Footprints, MapPin, Plus, RefreshCw,
  Scale, Target, Timer, Trash2, X,
} from 'lucide-react';
import {
  ACTIVITY_METRICS, KINDS, KIND_LABELS, PERIODS,
  activityWeightLink, addDays, bucketActivity, currentStreak, dailyActivity, dayDate, dayKey, diffDays,
  fatMassKg, grainFor, projectGoalDate, relativeChange, summarize, weekStart, weeklyTable, weightSeries,
  weightSlopePerWeek,
} from '../services/FitMetrics';
import { getAllSessions, getFitDays, getFitMeta, getGoalKg, setGoalKg } from '../services/FitStore';
import { addWeightRecord, deleteWeightRecord, getWeightHistory } from '../services/WeightStorage';
import { isHealthConnectApp } from '../services/HealthConnect';
import {
  BarChart, HeatLegend, Heatmap, KIND_COLORS, KindLegend, Sparkline, WeightChart, longDate, shortDate,
} from './charts';
import { ScaleImport } from './ScaleImport';
import WeekSummary from './WeekSummary';
import Sources from './Sources';
import './Dashboard.css';

const PERIOD_KEY = 'fit_period';
const HEATMAP_WEEKS = 16;
const TABLE_WEEKS = 12;
const LINK_WEEKS = 26;
const SESSIONS_SHOWN = 6;

const fmt = (value, decimals = 0) =>
  Number(value).toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
/** « +1,2 », « −0,4 », « 0,0 » : le signe suit la valeur arrondie. */
const signed = (value, decimals = 1) => {
  const rounded = Number(Math.abs(value).toFixed(decimals));
  return `${rounded === 0 ? '' : value > 0 ? '+' : '−'}${fmt(rounded, decimals)}`;
};
const hoursMinutes = (minutes) => (minutes >= 60 ? `${Math.floor(minutes / 60)} h ${String(Math.round(minutes % 60)).padStart(2, '0')}` : `${Math.round(minutes)} min`);

const KIND_ICONS = { bike: Bike, strength: Dumbbell, walk: Footprints, other: Activity };

/** « il y a 5 min », « il y a 3 h », « le 12 nov. ». */
function ago(time) {
  const minutes = Math.round((Date.now() - time) / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  if (minutes < 24 * 60) return `il y a ${Math.round(minutes / 60)} h`;
  return `le ${new Date(time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
}

/** Écart chiffré : flèche + valeur, vert si l'évolution va dans le bon sens. */
function Delta({ value, text, goodWhen = 'down', suffix = '' }) {
  if (value == null || !Number.isFinite(value)) return null;
  // « 0,0 » une fois arrondi : ni hausse ni baisse.
  const flat = !/^[+−]/.test(text);
  const good = !flat && (goodWhen === 'down' ? value < 0 : value > 0);
  const Icon = value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`db-delta ${flat || goodWhen === 'none' ? 'flat' : good ? 'good' : 'bad'}`}>
      {!flat && <Icon size={14} aria-hidden="true" />}
      {text}{suffix && <span className="db-delta-suffix"> {suffix}</span>}
    </span>
  );
}

function Tile({ icon: Icon, label, value, unit, delta, spark, hint }) {
  return (
    <div className="db-tile">
      <div className="db-tile-head">
        {Icon && <Icon size={15} aria-hidden="true" />}
        <span>{label}</span>
      </div>
      <div className="db-tile-value">
        {value}{unit && <span className="db-tile-unit"> {unit}</span>}
      </div>
      <div className="db-tile-foot">
        <span className="db-tile-delta">{delta || (hint && <span className="db-tile-hint">{hint}</span>)}</span>
        {spark}
      </div>
    </div>
  );
}

// Valeurs de composition montrées en tuiles : lecture d'un point pesé.
const COMPOSITION_TILES = [
  { key: 'bodyFat', label: 'Graisse', unit: '%', decimals: 1, better: 'down', read: (p) => p.composition?.bodyFat },
  { key: 'fatMass', label: 'Masse grasse', unit: 'kg', decimals: 1, better: 'down', read: fatMassKg },
  { key: 'muscleKg', label: 'Muscles', unit: 'kg', decimals: 1, better: 'up', read: (p) => p.composition?.muscleKg },
  { key: 'visceral', label: 'Graisse viscérale', unit: '', decimals: 0, better: 'down', read: (p) => p.composition?.visceral },
  { key: 'water', label: 'Eau', unit: '%', decimals: 1, better: 'up', read: (p) => p.composition?.water },
  { key: 'bmi', label: 'IMC', unit: '', decimals: 1, better: 'down', read: (p) => p.composition?.bmi },
];

/**
 * Tableau de bord : poids, composition, activité.
 * @param {number} dataVersion - change quand les données locales ont été modifiées ailleurs (synchro du compte)
 * @param {() => Promise<string|void>} onSync - synchro demandée par l'utilisateur ; peut renvoyer un message
 * @param {() => Promise<string|void>} [onGoogleFit] - site : import Google Fit
 * @param {() => void} onLogin - ouvre la connexion au compte
 */
export default function Dashboard({ dataVersion, onSync, onGoogleFit, onLogin, signedIn }) {
  const [version, setVersion] = useState(0);
  const [periodKey, setPeriodKey] = useState(() => {
    try {
      const stored = localStorage.getItem(PERIOD_KEY);
      return PERIODS.some((p) => p.key === stored) ? stored : '30';
    } catch {
      return '30';
    }
  });
  const [metricKey, setMetricKey] = useState('steps');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);
  const [showWeighIn, setShowWeighIn] = useState(false);
  const [editGoal, setEditGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState('');
  const [allSessions, setAllSessions] = useState(false);

  const refresh = () => setVersion((v) => v + 1);
  const stamp = `${dataVersion}-${version}`;

  const data = useMemo(() => ({
    records: getWeightHistory(),
    days: getFitDays(),
    sessions: getAllSessions(),
    meta: getFitMeta(),
    goalKg: getGoalKg(),
  }), [stamp]); // eslint-disable-line react-hooks/exhaustive-deps

  const today = dayKey(new Date());
  const points = useMemo(() => weightSeries(data.records), [data.records]);

  // Premier jour connu, toutes données confondues.
  const firstDay = useMemo(() => {
    const candidates = [
      points[0]?.day,
      Object.keys(data.days).sort()[0],
      data.sessions.length ? dayKey(new Date(data.sessions[data.sessions.length - 1].startMs)) : null,
    ].filter(Boolean).sort();
    return candidates[0] || null;
  }, [points, data.days, data.sessions]);

  const period = PERIODS.find((p) => p.key === periodKey);
  const from = period.days ? addDays(today, -(period.days - 1)) : (firstDay || addDays(today, -29));
  const periodDays = diffDays(from, today) + 1;

  const daily = useMemo(() => dailyActivity(data.days, data.sessions, from, today), [data.days, data.sessions, from, today]);
  // Période d'avant, pour comparer : seulement si les données la couvrent en entier.
  const previousFrom = period.days ? addDays(from, -period.days) : null;
  const canCompare = previousFrom && firstDay && firstDay <= previousFrom;
  const previousDaily = useMemo(
    () => (canCompare ? dailyActivity(data.days, data.sessions, previousFrom, addDays(from, -1)) : null),
    [data.days, data.sessions, from, previousFrom, canCompare]
  );
  const summary = useMemo(() => summarize(daily), [daily]);
  const previous = useMemo(() => (previousDaily ? summarize(previousDaily) : null), [previousDaily]);
  const todayActivity = daily[daily.length - 1];

  // ── Poids ──────────────────────────────────────────────────────────
  const periodPoints = points.filter((p) => p.day >= from);
  const last = points[points.length - 1] || null;
  // Dernière pesée telle qu'elle a été faite (un jour peut en compter plusieurs).
  const latestRecord = useMemo(
    () => [...data.records].sort((a, b) => new Date(a.date) - new Date(b.date)).pop() || null,
    [data.records]
  );
  const first = points[0] || null;
  const beforePeriod = [...points].reverse().find((p) => p.day < from) || null;
  const periodStart = beforePeriod || periodPoints[0] || null;
  const periodChange = last && periodStart && periodStart !== last ? last.trend - periodStart.trend : null;
  const totalChange = last && first && first !== last ? last.kg - first.kg : null;
  // Rythme : pente sur les 28 derniers jours pesés.
  const recentPoints = last ? points.filter((p) => diffDays(p.day, last.day) < 28) : [];
  const slope = weightSlopePerWeek(recentPoints);
  const goalDate = last && data.goalKg ? projectGoalDate(last.trend, data.goalKg, slope) : null;
  const goalReached = last && data.goalKg && last.trend <= data.goalKg;

  // ── Composition ────────────────────────────────────────────────────
  const compositionPoints = points.filter((p) => p.composition);
  const latestComposition = compositionPoints[compositionPoints.length - 1] || null;
  const compositionRef = latestComposition
    ? ([...compositionPoints].reverse().find((p) => p.day < from)
      || compositionPoints.find((p) => p.day >= from && p !== latestComposition)
      || null)
    : null;

  // ── Activité ───────────────────────────────────────────────────────
  const grain = grainFor(periodDays);
  const metric = ACTIVITY_METRICS[metricKey];
  const bars = useMemo(() => bucketActivity(daily, metricKey, grain).map((b) => {
    const date = dayDate(b.from);
    let label;
    let title;
    if (grain === 'day') {
      label = periodDays <= 7 ? date.toLocaleDateString('fr-FR', { weekday: 'short' }) : String(date.getDate());
      title = longDate(b.from);
    } else if (grain === 'week') {
      label = shortDate(b.from);
      title = `Semaine du ${shortDate(b.from)}`;
    } else {
      label = date.toLocaleDateString('fr-FR', { month: 'short' });
      title = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
    return { ...b, label, title, note: grain !== 'day' && metric.aggregate === 'mean' ? 'par jour en moyenne' : '' };
  }), [daily, metricKey, grain, periodDays, metric.aggregate]);
  const formatMetric = (value) => `${fmt(value, metric.decimals)} ${metric.unit}`;
  const sparkOf = (key) => bucketActivity(daily, key, grain).map((b) => b.value);

  const usedKinds = KINDS.filter((kind) => summary.byKind[kind] > 0);

  // Calendrier : 16 semaines, à partir d'un lundi.
  const heatDaily = useMemo(() => {
    const start = weekStart(addDays(today, -7 * (HEATMAP_WEEKS - 1)));
    return dailyActivity(data.days, data.sessions, start, today);
  }, [data.days, data.sessions, today]);
  const streak = currentStreak(heatDaily);

  // Semaine par semaine.
  const { tableRows, link } = useMemo(() => {
    const start = weekStart(addDays(today, -7 * (LINK_WEEKS - 1)));
    const rows = weeklyTable(points.filter((p) => p.day >= start), dailyActivity(data.days, data.sessions, start, today));
    return { tableRows: rows.slice(0, TABLE_WEEKS), link: activityWeightLink(rows.slice(1)) };
  }, [points, data.days, data.sessions, today]);

  const periodSessions = data.sessions.filter((s) => dayKey(new Date(s.startMs)) >= from);
  const shownSessions = allSessions ? periodSessions : periodSessions.slice(0, SESSIONS_SHOWN);

  const hasActivity = Object.keys(data.days).length > 0 || data.sessions.length > 0;

  // ── Actions ────────────────────────────────────────────────────────
  const choosePeriod = (key) => {
    setPeriodKey(key);
    setAllSessions(false);
    try { localStorage.setItem(PERIOD_KEY, key); } catch { /* stockage indisponible */ }
  };

  const run = async (action) => {
    if (busy || !action) return;
    setBusy(true);
    setNote(null);
    try {
      const message = await action();
      if (message) setNote({ tone: 'ok', text: message });
    } catch (error) {
      setNote({ tone: 'err', text: error?.message || 'Synchronisation impossible.' });
    } finally {
      setBusy(false);
      refresh();
    }
  };

  // Échap ferme la feuille « pesée ».
  useEffect(() => {
    if (!showWeighIn) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') setShowWeighIn(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showWeighIn]);

  // Le message de synchro s'efface seul.
  useEffect(() => {
    if (!note || note.tone !== 'ok') return undefined;
    const id = setTimeout(() => setNote(null), 6000);
    return () => clearTimeout(id);
  }, [note]);

  const saveMeasure = ({ weight, date, composition }) => {
    const isToday = date === today;
    addWeightRecord(weight, isToday ? null : new Date(`${date}T08:00:00`).toISOString(), composition ? 'Balance' : '', composition);
    refresh();
  };

  const removeWeighIn = (record) => {
    const when = new Date(record.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    if (!window.confirm(`Supprimer la pesée du ${when} (${fmt(record.weight, 1)} kg) ?`)) return;
    deleteWeightRecord(record.id);
    refresh();
  };

  const saveGoal = (event) => {
    event.preventDefault();
    const value = Number(String(goalDraft).replace(',', '.'));
    setGoalKg(value);
    import('../services/SyncService').then(({ pushGoal }) => pushGoal(getGoalKg())).catch(() => {});
    setEditGoal(false);
    refresh();
  };

  const lastSync = Number(data.meta.lastSyncAt) || null;

  return (
    <div className="db">
      {/* Synchro : d'où viennent les données et de quand elles datent */}
      <div className="db-sync">
        <div className="db-sync-copy">
          <span className="db-sync-title">
            {isHealthConnectApp() ? 'Health Connect' : signedIn ? 'Compte' : 'Données de cet appareil'}
          </span>
          <span className="db-sync-sub">
            {lastSync ? `Activité lue ${ago(lastSync)}` : isHealthConnectApp() ? 'Activité pas encore lue' : 'Activité reçue du téléphone par le compte'}
          </span>
        </div>
        <button type="button" className="db-btn" onClick={() => run(onSync)} disabled={busy}>
          <RefreshCw size={16} className={busy ? 'db-spin' : ''} aria-hidden="true" />
          {busy ? 'Synchro…' : 'Synchroniser'}
        </button>
      </div>
      {note && (
        <p className={`db-note ${note.tone}`} role={note.tone === 'err' ? 'alert' : 'status'}>
          {note.text}
          {note.tone === 'err' && <button type="button" className="db-link" onClick={() => setNote(null)}>Fermer</button>}
        </p>
      )}

      {/* Pas encore d'activité : dire d'où elle vient et quoi faire */}
      {!hasActivity && (
        <div className="db-card db-setup">
          <h2>Vos données d'activité ne sont pas encore ici</h2>
          {isHealthConnectApp() ? (
            <>
              <p>Appuyez sur « Synchroniser » pour lire vos pas, vos séances et vos pesées dans Health Connect.</p>
              <div className="db-setup-actions">
                <button type="button" className="db-btn primary" onClick={() => run(onSync)} disabled={busy}>
                  <RefreshCw size={16} aria-hidden="true" /> Synchroniser
                </button>
              </div>
            </>
          ) : (
            <>
              <p>
                Un site web ne peut pas lire Health Connect. C'est l'application Android qui lit vos pas, vos séances
                et vos pesées, puis les envoie ici par votre compte.
              </p>
              <ol>
                <li>Installez l'application Android (APK) sur votre téléphone et appuyez sur « Synchroniser ».</li>
                <li>Connectez-vous au même compte dans l'application Android et sur ce site.</li>
              </ol>
              <div className="db-setup-actions">
                {signedIn ? (
                  <button type="button" className="db-btn primary" onClick={() => run(onSync)} disabled={busy}>
                    <RefreshCw size={16} aria-hidden="true" /> Recevoir les données du compte
                  </button>
                ) : (
                  <button type="button" className="db-btn primary" onClick={onLogin}>Se connecter</button>
                )}
                <button type="button" className="db-btn" onClick={() => setShowWeighIn(true)}>
                  <Plus size={16} aria-hidden="true" /> Ajouter une pesée
                </button>
              </div>
              <p className="db-setup-more">
                Sans l'application Android : le dossier Health Sync de Google Drive ou Google Health.{' '}
                <button type="button" className="db-link" onClick={() => document.getElementById('src-title')?.scrollIntoView({ block: 'start' })}>
                  Voir les sources de données
                </button>
              </p>
            </>
          )}
        </div>
      )}

        <>
          <WeekSummary days={data.days} sessions={data.sessions} points={points} today={today} />

          <h2 className="db-section">Évolution</h2>
          {/* Une seule rangée de filtres, au-dessus de tous les graphiques */}
          <div className="db-periods" role="radiogroup" aria-label="Période affichée">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                role="radio"
                aria-checked={p.key === periodKey}
                className={`db-period${p.key === periodKey ? ' active' : ''}`}
                onClick={() => choosePeriod(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="db-grid">
            {/* ── Poids ─────────────────────────────────────────────── */}
            <section className="db-card db-weight" aria-labelledby="db-weight-title">
              <div className="db-card-head">
                <h3 id="db-weight-title"><Scale size={17} aria-hidden="true" /> Poids</h3>
                <button type="button" className="db-btn small" onClick={() => setShowWeighIn(true)}>
                  <Plus size={15} aria-hidden="true" /> Pesée
                </button>
              </div>

              {last && latestRecord ? (
                <>
                  <div className="db-hero">
                    <div className="db-hero-value">{fmt(latestRecord.weight, 1)}<span> kg</span></div>
                    <div className="db-hero-sub">
                      Dernière pesée : {longDate(last.day)} · tendance {fmt(last.trend, 1)} kg
                    </div>
                  </div>
                  <div className="db-facts">
                    {periodChange != null && (
                      <div className="db-fact">
                        <Delta value={periodChange} text={`${signed(periodChange)} kg`} />
                        <span>{period.days ? `sur ${period.label}` : 'depuis le début'}</span>
                      </div>
                    )}
                    {slope != null && (
                      <div className="db-fact">
                        <Delta value={slope} text={`${signed(slope)} kg`} />
                        <span>par semaine (4 dernières semaines)</span>
                      </div>
                    )}
                    {totalChange != null && period.days && (
                      <div className="db-fact">
                        <Delta value={totalChange} text={`${signed(totalChange)} kg`} />
                        <span>depuis le {shortDate(first.day)}</span>
                      </div>
                    )}
                  </div>

                  <WeightChart points={periodPoints.length >= 2 ? periodPoints : points.slice(-2)} goalKg={data.goalKg} />
                  <p className="db-caption">
                    Courbe : moyenne des 7 derniers jours pesés. Points gris : chaque pesée.
                  </p>

                  <div className="db-goal">
                    <Target size={16} aria-hidden="true" />
                    {editGoal ? (
                      <form className="db-goal-form" onSubmit={saveGoal}>
                        <label htmlFor="db-goal-input">Poids visé (kg)</label>
                        <input
                          id="db-goal-input"
                          type="text"
                          inputMode="decimal"
                          value={goalDraft}
                          onChange={(e) => setGoalDraft(e.target.value)}
                          placeholder="ex. 120"
                          autoFocus
                        />
                        <button type="submit" className="db-btn small primary">Enregistrer</button>
                        <button type="button" className="db-btn small" onClick={() => setEditGoal(false)}>Annuler</button>
                      </form>
                    ) : (
                      <>
                        <span className="db-goal-text">
                          {!data.goalKg && 'Pas de poids visé.'}
                          {data.goalKg && goalReached && <>Objectif de <strong>{fmt(data.goalKg, data.goalKg % 1 ? 1 : 0)} kg</strong> atteint.</>}
                          {data.goalKg && !goalReached && (
                            <>
                              Objectif <strong>{fmt(data.goalKg, data.goalKg % 1 ? 1 : 0)} kg</strong> : encore{' '}
                              <strong>{fmt(last.trend - data.goalKg, 1)} kg</strong>.{' '}
                              {goalDate
                                ? <>À ce rythme : vers <strong>{goalDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</strong>.</>
                                : slope == null
                                  ? 'Il faut plus de pesées pour estimer une date.'
                                  : 'Au rythme actuel, le poids ne baisse pas.'}
                            </>
                          )}
                        </span>
                        <button
                          type="button"
                          className="db-link"
                          onClick={() => { setGoalDraft(data.goalKg ? String(data.goalKg).replace('.', ',') : ''); setEditGoal(true); }}
                        >
                          {data.goalKg ? 'Modifier' : 'Fixer un objectif'}
                        </button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="viz-empty">
                  Pas encore de pesée. Ajoutez-en une avec le bouton « Pesée ».
                </div>
              )}
            </section>

            {/* ── Composition corporelle ───────────────────────────── */}
            {latestComposition && (
              <section className="db-card" aria-labelledby="db-comp-title">
                <div className="db-card-head">
                  <h3 id="db-comp-title">Composition corporelle</h3>
                  <span className="db-card-note">{shortDate(latestComposition.day)}</span>
                </div>
                <div className="db-tiles">
                  {COMPOSITION_TILES.map((tile) => {
                    const value = Number(tile.read(latestComposition));
                    if (!(value > 0)) return null;
                    const ref = compositionRef ? Number(tile.read(compositionRef)) : NaN;
                    const change = ref > 0 ? value - ref : null;
                    const series = compositionPoints.filter((p) => p.day >= from).map((p) => Number(tile.read(p)) || null);
                    const spark = series.filter((v) => v != null).length >= 2
                      ? series
                      : compositionPoints.map((p) => Number(tile.read(p)) || null);
                    return (
                      <Tile
                        key={tile.key}
                        label={tile.label}
                        value={fmt(value, tile.decimals)}
                        unit={tile.unit}
                        delta={change != null && (
                          <Delta
                            value={change}
                            text={signed(change, tile.decimals)}
                            goodWhen={tile.better}
                            suffix={`depuis le ${shortDate(compositionRef.day)}`}
                          />
                        )}
                        hint="une seule mesure"
                        spark={<Sparkline values={spark} />}
                      />
                    );
                  })}
                </div>
                <p className="db-caption">
                  Mesures de la balance à impédance : elles varient d'un jour à l'autre, c'est l'évolution sur plusieurs semaines qui compte.
                </p>
              </section>
            )}

            {/* ── Activité ─────────────────────────────────────────── */}
            <section className="db-card db-activity" aria-labelledby="db-activity-title">
              <div className="db-card-head">
                <h3 id="db-activity-title"><Activity size={17} aria-hidden="true" /> Activité</h3>
                <span className="db-card-note">{!period.days ? 'depuis le début' : canCompare ? `${period.label}, comparé aux ${period.label} d'avant` : period.label}</span>
              </div>

              <div className="db-today">
                <span className="db-today-label">Aujourd'hui</span>
                <span><strong>{todayActivity.steps != null ? fmt(todayActivity.steps) : '–'}</strong> pas</span>
                <span><strong>{fmt(todayActivity.sportMinutes)}</strong> min de sport</span>
                <span><strong>{todayActivity.activeKcal != null ? fmt(todayActivity.activeKcal) : '–'}</strong> kcal actives</span>
                <span><strong>{todayActivity.distanceKm != null ? fmt(todayActivity.distanceKm, 1) : '–'}</strong> km</span>
              </div>

              <div className="db-tiles">
                <Tile
                  icon={Footprints}
                  label="Pas par jour"
                  value={summary.stepsPerDay != null ? fmt(summary.stepsPerDay) : '–'}
                  delta={previous && relativeChange(summary.stepsPerDay, previous.stepsPerDay) != null && (
                    <Delta value={relativeChange(summary.stepsPerDay, previous.stepsPerDay)} goodWhen="up" text={`${signed(relativeChange(summary.stepsPerDay, previous.stepsPerDay) * 100, 0)} %`} />
                  )}
                  spark={<Sparkline values={sparkOf('steps')} />}
                />
                <Tile
                  icon={Timer}
                  label="Sport par semaine"
                  value={summary.sportPerWeek != null ? hoursMinutes(summary.sportPerWeek) : '–'}
                  delta={previous && relativeChange(summary.sportPerWeek, previous.sportPerWeek) != null && (
                    <Delta value={relativeChange(summary.sportPerWeek, previous.sportPerWeek)} goodWhen="up" text={`${signed(relativeChange(summary.sportPerWeek, previous.sportPerWeek) * 100, 0)} %`} />
                  )}
                  hint={`${summary.sessions} séance${summary.sessions > 1 ? 's' : ''}`}
                  spark={<Sparkline values={sparkOf('sport')} />}
                />
                <Tile
                  icon={Flame}
                  label="Calories actives par jour"
                  value={summary.kcalPerDay != null ? fmt(summary.kcalPerDay) : '–'}
                  unit={summary.kcalPerDay != null ? 'kcal' : ''}
                  delta={previous && relativeChange(summary.kcalPerDay, previous.kcalPerDay) != null && (
                    <Delta value={relativeChange(summary.kcalPerDay, previous.kcalPerDay)} goodWhen="up" text={`${signed(relativeChange(summary.kcalPerDay, previous.kcalPerDay) * 100, 0)} %`} />
                  )}
                  spark={<Sparkline values={sparkOf('kcal')} />}
                />
                <Tile
                  icon={MapPin}
                  label="Distance"
                  value={summary.distanceTotal != null ? fmt(summary.distanceTotal, summary.distanceTotal < 100 ? 1 : 0) : '–'}
                  unit={summary.distanceTotal != null ? 'km' : ''}
                  delta={previous && relativeChange(summary.distanceTotal, previous.distanceTotal) != null && (
                    <Delta value={relativeChange(summary.distanceTotal, previous.distanceTotal)} goodWhen="up" text={`${signed(relativeChange(summary.distanceTotal, previous.distanceTotal) * 100, 0)} %`} />
                  )}
                  spark={<Sparkline values={sparkOf('distance')} />}
                />
              </div>

              <div className="db-metrics" role="radiogroup" aria-label="Mesure du graphique">
                {Object.entries(ACTIVITY_METRICS).map(([key, m]) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={key === metricKey}
                    className={`db-metric${key === metricKey ? ' active' : ''}`}
                    onClick={() => setMetricKey(key)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <p className="db-chart-title">
                {metric.stacked ? 'Minutes de sport' : metric.label}
                {' '}{grain === 'day' ? 'par jour' : grain === 'week' ? 'par semaine' : 'par mois'}
                {grain !== 'day' && metric.aggregate === 'mean' ? ' (moyenne par jour)' : ''}
              </p>
              <BarChart bars={bars} stacked={!!metric.stacked} format={formatMetric} />
              {metric.stacked && usedKinds.length > 0 && <KindLegend kinds={usedKinds} />}
            </section>

            {/* ── Régularité ───────────────────────────────────────── */}
            <section className="db-card" aria-labelledby="db-heat-title">
              <div className="db-card-head">
                <h3 id="db-heat-title">Régularité</h3>
                <span className="db-card-note">{HEATMAP_WEEKS} dernières semaines</span>
              </div>
              <div className="db-facts">
                <div className="db-fact"><strong>{streak}</strong><span>jour{streak > 1 ? 's' : ''} de sport d'affilée</span></div>
                <div className="db-fact">
                  <strong>{summary.activeDays} / {periodDays}</strong>
                  <span>jours avec du sport {period.days ? `sur ${period.label}` : 'depuis le début'}</span>
                </div>
              </div>
              <Heatmap daily={heatDaily} />
              <HeatLegend />
            </section>

            {/* ── Semaine par semaine ──────────────────────────────── */}
            <section className="db-card db-wide" aria-labelledby="db-table-title">
              <div className="db-card-head">
                <h3 id="db-table-title">Semaine par semaine</h3>
                <span className="db-card-note">{TABLE_WEEKS} dernières semaines</span>
              </div>
              {tableRows.length === 0 && <div className="viz-empty">Pas encore de semaine à afficher.</div>}
              <div className="db-table-wrap" hidden={tableRows.length === 0}>
                <table className="db-table">
                  <thead>
                    <tr>
                      <th scope="col">Semaine du</th>
                      <th scope="col">Poids moyen</th>
                      <th scope="col">Écart</th>
                      <th scope="col">Pas / jour</th>
                      <th scope="col">Sport</th>
                      <th scope="col">kcal actives / jour</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row) => (
                      <tr key={row.week}>
                        <th scope="row">{shortDate(row.week)}</th>
                        <td>{row.weight != null ? `${fmt(row.weight, 1)} kg` : '–'}</td>
                        <td>{row.delta != null ? <Delta value={row.delta} text={signed(row.delta)} /> : '–'}</td>
                        <td>{row.stepsPerDay != null ? fmt(row.stepsPerDay) : '–'}</td>
                        <td>{row.sportMinutes ? hoursMinutes(row.sportMinutes) : '–'}</td>
                        <td>{row.kcalPerDay != null ? fmt(row.kcalPerDay) : '–'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {link && (
                <p className="db-insight">
                  Sur {link.weeks} semaines : les {link.high.weeks} semaines avec au moins {hoursMinutes(link.median)} de sport
                  donnent en moyenne <strong>{signed(link.high.delta)} kg</strong>, les {link.low.weeks} autres{' '}
                  <strong>{signed(link.low.delta)} kg</strong>. C'est un constat sur peu de semaines, pas une preuve.
                </p>
              )}
            </section>

            {/* ── Séances ──────────────────────────────────────────── */}
            <section className="db-card db-wide" aria-labelledby="db-sessions-title">
              <div className="db-card-head">
                <h3 id="db-sessions-title">Séances</h3>
                <span className="db-card-note">
                  {periodSessions.length} séance{periodSessions.length > 1 ? 's' : ''} · {hoursMinutes(summary.sportMinutes)}
                </span>
              </div>
              {usedKinds.length > 0 && (
                <ul className="db-kinds">
                  {usedKinds.map((kind) => (
                    <li key={kind}>
                      <span className="db-kind-name">
                        <span className="viz-legend-key" style={{ background: KIND_COLORS[kind] }} />
                        {KIND_LABELS[kind]}
                      </span>
                      <span className="db-kind-bar" aria-hidden="true">
                        <span style={{ width: `${(summary.byKind[kind] / Math.max(...usedKinds.map((k) => summary.byKind[k]))) * 100}%`, background: KIND_COLORS[kind] }} />
                      </span>
                      <span className="db-kind-value">{hoursMinutes(summary.byKind[kind])}</span>
                    </li>
                  ))}
                </ul>
              )}
              {periodSessions.length === 0 ? (
                <div className="viz-empty">Pas de séance sur cette période.</div>
              ) : (
                <ul className="db-sessions">
                  {shownSessions.map((s) => {
                    const Icon = KIND_ICONS[s.kind] || Activity;
                    return (
                      <li key={s.id}>
                        <span className="db-session-icon" style={{ color: KIND_COLORS[s.kind] }}><Icon size={18} aria-hidden="true" /></span>
                        <span className="db-session-copy">
                          <span className="db-session-title">{s.title || s.label}</span>
                          <span className="db-session-sub">
                            {longDate(dayKey(new Date(s.startMs)))}
                            {s.app ? ` · ${s.app}` : ''}{s.manual ? ' · coché à la main' : ''}
                          </span>
                        </span>
                        <span className="db-session-stats">
                          <strong>{hoursMinutes(s.minutes)}</strong>
                          <span>
                            {[s.kcal ? `${fmt(s.kcal)} kcal` : null, s.km ? `${fmt(s.km, 1)} km` : null].filter(Boolean).join(' · ')}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              {periodSessions.length > SESSIONS_SHOWN && (
                <button type="button" className="db-link db-more" onClick={() => setAllSessions((v) => !v)}>
                  {allSessions ? 'Afficher moins' : `Afficher les ${periodSessions.length} séances`}
                </button>
              )}
            </section>

            <Sources run={run} busy={busy} onSync={onSync} onGoogleFit={onGoogleFit} signedIn={signedIn} />
          </div>

        </>

      {/* Feuille « pesée » : saisie, capture de la balance, dernières pesées */}
      {showWeighIn && (
        <div className="db-sheet-backdrop" onClick={() => setShowWeighIn(false)}>
          <div
            className="db-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="db-sheet-title"
            tabIndex={-1}
            ref={(node) => { if (node && !node.contains(document.activeElement)) node.focus(); }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="db-card-head">
              <h2 id="db-sheet-title">Ajouter une pesée</h2>
              <button type="button" className="db-icon-btn" onClick={() => setShowWeighIn(false)} aria-label="Fermer">
                <X size={20} />
              </button>
            </div>
            <ScaleImport onSave={saveMeasure} />
            {data.records.length > 0 && (
              <>
                <h3 className="db-sheet-sub">Dernières pesées</h3>
                <ul className="db-weighins">
                  {[...data.records].reverse().slice(0, 6).map((record) => (
                    <li key={record.id}>
                      <span>{new Date(record.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <strong>{fmt(record.weight, 1)} kg</strong>
                      <button type="button" className="db-icon-btn" onClick={() => removeWeighIn(record)} aria-label="Supprimer cette pesée">
                        <Trash2 size={17} />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
