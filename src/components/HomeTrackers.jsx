import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Dumbbell, CheckSquare } from 'lucide-react';
import { getWorkoutHistory } from '../services/WorkoutStorage';
import { getActiveWorkoutPlan } from '../services/WorkoutCustomization';
import { HABITS, getHabitLog, toggleHabit, dateKey, isHabitDone } from '../services/HabitStorage';
import './HomeTrackers.css';

const MUSCLE_LABELS_FR = {
  chest: 'Pectoraux',
  back: 'Dos',
  shoulders: 'Épaules',
  triceps: 'Triceps',
  biceps: 'Biceps',
  forearms: 'Avant-bras',
  trapezius: 'Trapèzes',
  abdominals: 'Abdos',
  obliques: 'Obliques',
  core: 'Gainage',
  quadriceps: 'Quadriceps',
  hamstrings: 'Ischios',
  glutes: 'Fessiers',
  cardio: 'Cardio',
};

const MUSCLE_COLORS = [
  '#F03D32', '#0a84ff', '#30d158', '#ffd60a', '#bf5af2',
  '#ff375f', '#63e6e2', '#ff9f0a', '#5e5ce6', '#a8e05f',
];

function startOfWeek(d = new Date()) {
  const day = (d.getDay() + 6) % 7;
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  out.setDate(out.getDate() - day);
  return out;
}

/* ------------------------------------------------------------------ */
/* Carte 1 : progression du mois (heatmap des séances)                 */
/* ------------------------------------------------------------------ */

function MonthProgressCard({ history }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language && i18n.language.startsWith('en') ? 'en-US' : 'fr-FR';
  const now = new Date();

  const { cells, done, elapsed, monthCalories } = useMemo(() => {
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Calories par jour du mois, agrégées depuis l'historique.
    const byDay = new Map();
    for (const w of history) {
      const d = new Date(w.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        byDay.set(d.getDate(), (byDay.get(d.getDate()) || 0) + (w.calories || 0));
      }
    }
    const max = Math.max(1, ...byDay.values());

    const first = new Date(year, month, 1);
    const lead = (first.getDay() + 6) % 7; // cases vides avant le 1er (semaine lundi)
    const cells = [];
    for (let i = 0; i < lead; i++) cells.push({ key: `pad-${i}`, pad: true });
    for (let day = 1; day <= daysInMonth; day++) {
      const cal = byDay.get(day) || 0;
      const level = cal === 0 ? 0 : Math.min(3, 1 + Math.floor((cal / max) * 2.999 * 0.999));
      cells.push({
        key: `d-${day}`,
        day,
        cal,
        level,
        today: day === now.getDate(),
        future: day > now.getDate(),
      });
    }
    let monthCalories = 0;
    for (const c of byDay.values()) monthCalories += c;
    return { cells, done: byDay.size, elapsed: now.getDate(), monthCalories };
  }, [history]);

  const percent = Math.round((done / Math.max(1, elapsed)) * 100);
  const monthLabel = now.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  return (
    <div className="ht-card">
      <div className="ht-card-head">
        <div className="ht-card-tag">{monthLabel}</div>
      </div>

      <div className="ht-progress-stats">
        <div className="ht-stat">
          <div className="ht-stat-value">{done}</div>
          <div className="ht-stat-label">{t('home.progress.sessions', { defaultValue: 'jours actifs' })}</div>
        </div>
        <div className="ht-stat">
          <div className="ht-stat-value">{percent}%</div>
          <div className="ht-stat-label">{t('home.progress.regularity', { defaultValue: 'régularité' })}</div>
        </div>
        <div className="ht-stat">
          <div className="ht-stat-value">{Math.round(monthCalories)}</div>
          <div className="ht-stat-label">{t('home.progress.calories', { defaultValue: 'kcal du mois' })}</div>
        </div>
      </div>

      <div className="ht-progress-bar">
        <div className="ht-progress-bar-fill" style={{ width: `${percent}%` }} />
      </div>

      <div className="ht-month-grid">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <div key={`h-${i}`} className="ht-month-dow">{d}</div>
        ))}
        {cells.map((c) =>
          c.pad ? (
            <div key={c.key} className="ht-month-cell pad" />
          ) : (
            <div
              key={c.key}
              className={`ht-month-cell lvl-${c.level}${c.today ? ' today' : ''}${c.future ? ' future' : ''}`}
              title={c.cal ? `${c.day} · ${Math.round(c.cal)} kcal` : String(c.day)}
            >
              {c.day}
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Carte 2 : groupes musculaires travaillés (7 derniers jours)         */
/* ------------------------------------------------------------------ */

function MuscleGroupsCard({ history }) {
  const { t } = useTranslation();

  const groups = useMemo(() => {
    // Jointure nom d'exercice → groupes musculaires via le plan actif :
    // l'historique ne stocke que le nom.
    const nameToGroups = new Map();
    for (const day of getActiveWorkoutPlan()) {
      for (const ex of day.exercises || []) {
        const g = ex?.googleFitActivity?.muscleGroups;
        if (ex?.name && g?.length && !nameToGroups.has(ex.name)) {
          nameToGroups.set(ex.name, g);
        }
      }
    }

    const since = new Date();
    since.setDate(since.getDate() - 7);
    const weights = new Map();
    let total = 0;
    for (const w of history) {
      if (new Date(w.date) < since) continue;
      for (const ex of w.exercises || []) {
        const sets = ex.sets || 1;
        for (const g of nameToGroups.get(ex.name) || []) {
          weights.set(g, (weights.get(g) || 0) + sets);
          total += sets;
        }
      }
    }
    return [...weights.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([g, sets], i) => ({
        group: g,
        label: MUSCLE_LABELS_FR[g] || g,
        percent: Math.round((sets / Math.max(1, total)) * 100),
        sets,
        color: MUSCLE_COLORS[i % MUSCLE_COLORS.length],
      }));
  }, [history]);

  return (
    <div className="ht-card">
      <div className="ht-card-head">
        <div className="ht-card-tag">{t('home.muscles.range', { defaultValue: '7 derniers jours' })}</div>
      </div>

      {groups.length === 0 ? (
        <p className="ht-empty">
          {t('home.muscles.empty', { defaultValue: 'Aucune séance sur les 7 derniers jours — les groupes travaillés apparaîtront ici.' })}
        </p>
      ) : (
        <div className="ht-muscle-list">
          {groups.map((g) => (
            <div key={g.group} className="ht-muscle-row">
              <div className="ht-muscle-label">{g.label}</div>
              <div className="ht-muscle-bar">
                <div
                  className="ht-muscle-bar-fill"
                  style={{ width: `${Math.max(4, g.percent)}%`, background: g.color }}
                />
              </div>
              <div className="ht-muscle-pct">{g.percent}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Carte 3 : habit tracker de la semaine                               */
/* ------------------------------------------------------------------ */

function HabitTrackerCard({ history }) {
  const { t } = useTranslation();
  const [log, setLog] = useState(() => getHabitLog());

  const weekDays = useMemo(() => {
    const start = startOfWeek();
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return { date: d, future: d > today, today: dateKey(d) === dateKey(new Date()) };
    });
  }, []);

  // Ligne « Séance » dérivée de l'historique, non modifiable à la main.
  const workoutDays = useMemo(
    () => new Set(history.map((w) => dateKey(new Date(w.date)))),
    [history]
  );

  const dow = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const pastDays = weekDays.filter((d) => !d.future).length;

  const rows = [
    {
      id: 'workout',
      icon: '🏋️',
      color: '#F03D32',
      label: t('home.habits.workout', { defaultValue: 'Séance' }),
      auto: true,
      isDone: (d) => workoutDays.has(dateKey(d.date)),
    },
    ...HABITS.map((h) => ({
      id: h.id,
      icon: h.icon,
      color: h.color,
      label: t(h.labelKey, { defaultValue: h.labelFr }),
      auto: false,
      isDone: (d) => isHabitDone(log, d.date, h.id),
    })),
  ];

  return (
    <div className="ht-card">
      <div className="ht-card-head">
        <div className="ht-card-tag">{t('home.habits.range', { defaultValue: 'cette semaine' })}</div>
      </div>

      <div className="ht-habit-grid" style={{ gridTemplateColumns: 'minmax(96px, 1.4fr) repeat(7, 1fr) 44px' }}>
        <div className="ht-habit-corner" />
        {weekDays.map((d, i) => (
          <div key={`dow-${i}`} className={`ht-habit-dow${d.today ? ' today' : ''}`}>{dow[i]}</div>
        ))}
        <div className="ht-habit-corner" />

        {rows.map((row) => {
          const doneCount = weekDays.filter((d) => !d.future && row.isDone(d)).length;
          const pct = Math.round((doneCount / Math.max(1, pastDays)) * 100);
          return (
            <React.Fragment key={row.id}>
              <div className="ht-habit-label">
                <span className="ht-habit-icon">{row.icon}</span>
                <span className="ht-habit-name">{row.label}</span>
              </div>
              {weekDays.map((d, i) => {
                const done = row.isDone(d);
                const disabled = row.auto || d.future;
                return (
                  <button
                    key={`${row.id}-${i}`}
                    type="button"
                    className={`ht-habit-cell${done ? ' done' : ''}${d.future ? ' future' : ''}${row.auto ? ' auto' : ''}`}
                    style={done ? { background: row.color, borderColor: row.color } : undefined}
                    disabled={disabled}
                    aria-label={`${row.label} — ${dow[i]}`}
                    aria-pressed={done}
                    onClick={() => {
                      if (!disabled) setLog({ ...toggleHabit(d.date, row.id) });
                    }}
                  >
                    {done ? '✓' : ''}
                  </button>
                );
              })}
              <div className="ht-habit-pct" style={{ color: pct >= 60 ? '#30d158' : pct >= 30 ? '#ffd60a' : 'inherit' }}>
                {pct}%
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function HomeTrackers() {
  const { t } = useTranslation();
  const history = useMemo(() => getWorkoutHistory(), []);
  const [tab, setTab] = useState('progress');

  const tabs = [
    { id: 'progress', icon: <TrendingUp size={16} />, label: t('home.tabs.progress', { defaultValue: 'Progrès' }) },
    { id: 'muscles', icon: <Dumbbell size={16} />, label: t('home.tabs.muscles', { defaultValue: 'Muscles' }) },
    { id: 'habits', icon: <CheckSquare size={16} />, label: t('home.tabs.habits', { defaultValue: 'Habitudes' }) },
  ];

  return (
    <div className="ht-root">
      <div className="ht-tabs" role="tablist">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            type="button"
            role="tab"
            aria-selected={tab === tb.id}
            className={`ht-tab${tab === tb.id ? ' active' : ''}`}
            onClick={() => setTab(tb.id)}
          >
            {tb.icon}
            <span>{tb.label}</span>
          </button>
        ))}
      </div>
      {tab === 'progress' && <MonthProgressCard history={history} />}
      {tab === 'muscles' && <MuscleGroupsCard history={history} />}
      {tab === 'habits' && <HabitTrackerCard history={history} />}
    </div>
  );
}
