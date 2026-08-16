import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Scale as ScaleIcon, Flag, Activity, Clock } from 'lucide-react';
import { getWorkoutHistory } from '../services/WorkoutStorage';
import { getWeightHistory } from '../services/WeightStorage';
import { getActiveWorkoutPlan } from '../services/WorkoutCustomization';
import { recommendNextSession, shortDayTitle } from '../services/RecoveryAdvisor';
import './HomeDashboard.css';

function startOfWeek(d = new Date()) {
  const day = (d.getDay() + 6) % 7;
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  out.setDate(out.getDate() - day);
  return out;
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
  const { t, i18n } = useTranslation();
  const history = useMemo(() => getWorkoutHistory(), []);
  const weights = useMemo(() => getWeightHistory(), []);
  // Plan et jour courant ne bougent pas pendant l'affichage du tableau de
  // bord : lus une fois, pas à chaque tick du minuteur.
  const plan = useMemo(() => getActiveWorkoutPlan(), []);
  const currentDayIndex = useMemo(
    () => parseInt(localStorage.getItem('currentWorkoutDay') || '0', 10) || 0,
    []
  );

  // Horloge à la minute : la carte Récupération suit le temps qui passe
  // (progression, bascule « dès maintenant ») sans recalcul à la seconde.
  const [nowMinute, setNowMinute] = useState(() => Math.floor(Date.now() / 60000));
  useEffect(() => {
    const id = setInterval(() => setNowMinute(Math.floor(Date.now() / 60000)), 15000);
    return () => clearInterval(id);
  }, []);

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

  // Prochain créneau conseillé (récupération) — recalculé à la minute.
  const recovery = useMemo(
    () => recommendNextSession({ history, plan, currentDayIndex, now: new Date(nowMinute * 60000) }),
    [history, plan, currentDayIndex, nowMinute]
  );

  const locale = i18n.language && i18n.language.startsWith('en') ? 'en-US' : 'fr-FR';
  const recoveryDayLabel = (d) => {
    const today = new Date(nowMinute * 60000); today.setHours(0, 0, 0, 0);
    const targetDay = new Date(d); targetDay.setHours(0, 0, 0, 0);
    const diffDays = Math.round((targetDay - today) / 86400000);
    if (diffDays <= 0) return t('home.recovery.today', { defaultValue: 'aujourd\'hui' });
    if (diffDays === 1) return t('home.recovery.tomorrow', { defaultValue: 'demain' });
    return d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
  };
  const recoveryTimeLabel = (d) => d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

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

      {recovery && (
        <div className={`hd-recovery ${recovery.ready ? 'ready' : 'waiting'}`}>
          <div className="hd-recovery-head">
            <Clock size={22} />
            <div className="hd-recovery-title">
              {t('home.recovery.heading', { defaultValue: 'Récupération' })}
            </div>
          </div>

          {recovery.firstSession ? (
            <p className="hd-recovery-desc">
              {t('home.recovery.first', { defaultValue: 'Aucune séance enregistrée — le meilleur créneau, c\'est maintenant.' })}
            </p>
          ) : (
            <>
              <div className="hd-recovery-label">
                {t('home.recovery.nextLabel', { defaultValue: 'Prochaine séance conseillée' })}
              </div>
              <div className="hd-recovery-datetime">
                {recovery.ready && new Date(nowMinute * 60000) >= recovery.recommended
                  ? t('home.recovery.now', { defaultValue: 'Dès maintenant' })
                  : `${recoveryDayLabel(recovery.recommended)} · ${recoveryTimeLabel(recovery.recommended)}`}
              </div>
              <p className="hd-recovery-hint">
                {t('home.recovery.detail', {
                  defaultValue: '~{{hours}} h de récupération après {{last}} · à suivre : {{next}}',
                  hours: recovery.recoveryHours,
                  last: shortDayTitle(recovery.lastTitle),
                  next: shortDayTitle(recovery.nextDay.title),
                })}
              </p>
              <div className="hd-recovery-bar">
                <div
                  className="hd-recovery-bar-fill"
                  style={{ width: `${Math.round(recovery.progress * 100)}%` }}
                />
              </div>
              <div className="hd-recovery-status">
                {recovery.ready
                  ? t('home.recovery.ready', { defaultValue: 'Récupéré ✓' })
                  : t('home.recovery.progress', {
                      defaultValue: 'Récupération : {{pct}} %',
                      pct: Math.round(recovery.progress * 100),
                    })}
              </div>
            </>
          )}
        </div>
      )}

      {onStartWorkout && (
        <button className="hd-primary-action" onClick={onStartWorkout}>
          <Activity size={18} strokeWidth={2.4} />
          <span>{t('home.openTodayWorkout', { defaultValue: 'Voir la séance du jour' })}</span>
        </button>
      )}
    </div>
  );
}
