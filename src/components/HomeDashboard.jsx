import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pill, Flame, Scale as ScaleIcon, Flag, Activity, CalendarPlus } from 'lucide-react';
import { getWorkoutHistory } from '../services/WorkoutStorage';
import { getWeightHistory } from '../services/WeightStorage';
import {
  CREATINE_INTAKE_KEY,
  CREATINE_DOSE_G,
  DAILY_DOSE_MS,
  isTakenToday,
  downloadCreatineReminder,
} from '../utils/creatineReminder';
import './HomeDashboard.css';

function startOfWeek(d = new Date()) {
  const day = (d.getDay() + 6) % 7;
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  out.setDate(out.getDate() - day);
  return out;
}

// Compte à rebours lisible (Hh MM) jusqu'à la prochaine dose de créatine.
function fmtHM(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${h}h ${m.toString().padStart(2, '0')}`;
}


function Ring({ percent, label, sub }) {
  const size = 156;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(1, Math.max(0, percent / 100)));
  return (
    <div className="hd-ring-wrap">
      <svg width={size} height={size} className="hd-ring">
        <circle cx={size / 2} cy={size / 2} r={r} className="hd-ring-bg" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="hd-ring-fg"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="hd-ring-center">
        <div className="hd-ring-label">{label}</div>
        <div className="hd-ring-pct">{Math.round(percent)}%</div>
        <div className="hd-ring-sub">{sub}</div>
      </div>
    </div>
  );
}

export default function HomeDashboard({ onStartWorkout }) {
  const { t } = useTranslation();
  const [creatineAt, setCreatineAt] = useState(() => {
    const v = localStorage.getItem(CREATINE_INTAKE_KEY);
    return v ? parseInt(v, 10) : null;
  });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const history = useMemo(() => getWorkoutHistory(), []);
  const weights = useMemo(() => getWeightHistory(), []);

  const weekStart = startOfWeek();
  const weekWorkouts = history.filter(w => new Date(w.date) >= weekStart);
  const target = 7; // musculation 7 jours / 7
  const done = weekWorkouts.length;
  const percent = Math.min(100, (done / target) * 100);

  const weekCalories = weekWorkouts.reduce((s, w) => s + (w.calories || 0), 0);

  const currentWeight = weights.length ? weights[weights.length - 1].weight : null;
  const prevWeight = weights.length > 1 ? weights[weights.length - 2].weight : null;
  const weightDelta = currentWeight != null && prevWeight != null ? currentWeight - prevWeight : null;

  const streak = useMemo(() => {
    if (!history.length) return 0;
    const days = new Set(history.map(w => new Date(w.date).toISOString().slice(0, 10)));
    let s = 0;
    const cur = new Date();
    cur.setHours(0, 0, 0, 0);
    for (;;) {
      const key = cur.toISOString().slice(0, 10);
      if (days.has(key)) {
        s += 1;
        cur.setDate(cur.getDate() - 1);
      } else {
        if (s === 0) {
          cur.setDate(cur.getDate() - 1);
          const k2 = cur.toISOString().slice(0, 10);
          if (days.has(k2)) { s = 1; cur.setDate(cur.getDate() - 1); continue; }
        }
        break;
      }
    }
    return s;
  }, [history]);

  const takenToday = isTakenToday(creatineAt, now);
  const elapsed = creatineAt ? now - creatineAt : null;
  const nextDoseIn = takenToday ? Math.max(0, DAILY_DOSE_MS - elapsed) : 0;

  const handleTakeDose = () => {
    const ts = Date.now();
    localStorage.setItem(CREATINE_INTAKE_KEY, ts.toString());
    setCreatineAt(ts);
  };

  const handleResetDose = () => {
    localStorage.removeItem(CREATINE_INTAKE_KEY);
    setCreatineAt(null);
  };

  const handleAddReminder = () => {
    downloadCreatineReminder(creatineAt || Date.now());
  };

  const creatineStatus = takenToday
    ? t('home.creatine.done', { defaultValue: 'Dose du jour prise ✓' })
    : t('home.creatine.todo', { defaultValue: 'Dose du jour à prendre' });
  const creatineTimer = takenToday ? fmtHM(nextDoseIn) : '';

  return (
    <div className="hd-root">
      <div className="hd-header">
        <h1 className="hd-title">{t('home.title', { defaultValue: 'Aujourd\'hui' })}</h1>
        <p className="hd-subtitle">{t('home.subtitle', { defaultValue: 'Vue d\'ensemble de la semaine' })}</p>
      </div>

      <div className="hd-top">
        <Ring
          percent={percent}
          label={t('home.weekRingLabel', { defaultValue: 'Séances' })}
          sub={`${done} / ${target}`}
        />

        <div className="hd-stack">
          <div className="hd-card hd-card-cal">
            <Flame size={20} />
            <div className="hd-card-body">
              <div className="hd-card-label">{t('home.calories', { defaultValue: 'Calories 7j' })}</div>
              <div className="hd-card-value">{Math.round(weekCalories)}</div>
            </div>
          </div>

          <div className="hd-card hd-card-weight">
            <ScaleIcon size={20} />
            <div className="hd-card-body">
              <div className="hd-card-label">{t('home.weight', { defaultValue: 'Poids' })}</div>
              <div className="hd-card-value">
                {currentWeight != null ? `${currentWeight} kg` : '—'}
                {weightDelta != null && (
                  <span className={`hd-delta ${weightDelta < 0 ? 'down' : weightDelta > 0 ? 'up' : ''}`}>
                    {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="hd-card hd-card-streak">
            <Flag size={20} />
            <div className="hd-card-body">
              <div className="hd-card-label">{t('home.streak', { defaultValue: 'Streak' })}</div>
              <div className="hd-card-value">{streak} {t('home.days', { defaultValue: 'jours' })}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={`hd-creatine ${takenToday ? 'ready' : 'waiting'}`}>
        <div className="hd-creatine-head">
          <Pill size={22} />
          <div className="hd-creatine-title">
            {t('home.creatine.heading', { defaultValue: 'Créatine monohydrate' })}
          </div>
        </div>

        {!takenToday && (
          <>
            <p className="hd-creatine-desc">
              {t('home.creatine.help', { defaultValue: `${CREATINE_DOSE_G} g par jour avec un grand verre d'eau. Aucune fenêtre à respecter : seule la régularité compte.` })}
            </p>
            <p className="hd-creatine-hint">
              {t('home.creatine.protocol', { defaultValue: 'Tous les jours, entraînement ou non. Idéalement à la même heure, après la séance.' })}
            </p>
            <button className="hd-creatine-btn" onClick={handleTakeDose}>
              {t('home.creatine.take', { defaultValue: `J'ai pris mes ${CREATINE_DOSE_G} g` })}
            </button>
            <button className="hd-creatine-btn-secondary hd-creatine-reminder" onClick={handleAddReminder}>
              <CalendarPlus size={16} style={{ marginRight: 6 }} />
              {t('home.creatine.reminder', { defaultValue: 'Ajouter le rappel quotidien à l\'agenda' })}
            </button>
          </>
        )}

        {takenToday && (
          <>
            <div className="hd-creatine-status">{creatineStatus}</div>
            <div className="hd-creatine-timer">{creatineTimer}</div>
            <div className="hd-creatine-next">
              {t('home.creatine.next', { defaultValue: 'Prochaine dose vers' })}{' '}
              {new Date(creatineAt + DAILY_DOSE_MS).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <button className="hd-creatine-btn-secondary hd-creatine-reminder" onClick={handleAddReminder}>
              <CalendarPlus size={16} style={{ marginRight: 6 }} />
              {t('home.creatine.reminder', { defaultValue: 'Ajouter le rappel quotidien à l\'agenda' })}
            </button>
            <div className="hd-creatine-bar">
              <div
                className="hd-creatine-bar-fill"
                style={{ width: `${Math.min(100, ((elapsed || 0) / DAILY_DOSE_MS) * 100)}%` }}
              />
            </div>
            <div className="hd-creatine-actions">
              <button className="hd-creatine-btn-secondary" onClick={handleResetDose}>
                {t('home.creatine.reset', { defaultValue: 'Réinitialiser' })}
              </button>
              {onStartWorkout && (
                <button className="hd-creatine-btn" onClick={onStartWorkout}>
                  <Activity size={16} style={{ marginRight: 6 }} />
                  {t('home.creatine.go', { defaultValue: 'Démarrer la séance' })}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {onStartWorkout && (
        <button className="hd-primary-action" onClick={onStartWorkout}>
          <Activity size={18} strokeWidth={2.4} />
          <span>{t('home.openTodayWorkout', { defaultValue: 'Voir la séance du jour' })}</span>
        </button>
      )}
    </div>
  );
}
