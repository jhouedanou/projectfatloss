import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale as ScaleIcon, Clock, Dumbbell, Leaf, Bike, Target, Footprints } from 'lucide-react';
import { getWorkoutHistory } from '../services/WorkoutStorage';
import { getWeightHistory } from '../services/WeightStorage';
import { getActiveWorkoutPlan } from '../services/WorkoutCustomization';
import { recommendNextSession, shortDayTitle } from '../services/RecoveryAdvisor';
import {
  GOAL_OPTIONS_KG,
  getMonthlyGoalKg,
  setMonthlyGoalKg,
  computeWeekTargets,
  getWeekProgress,
  startOfWeek,
  DAILY_STEPS_TARGET,
} from '../services/WeightLossPlan';
import { getStepsSummary } from '../services/StepsStorage';
import DailyChecklist from './DailyChecklist';
import './HomeDashboard.css';

const fmtKg = (kg) => kg.toLocaleString('fr-FR', { maximumFractionDigits: 1 });

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
  // Objectif mensuel de perte de poids : il fixe les minutes de vélo du plan.
  const [goalKg, setGoalKg] = useState(() => getMonthlyGoalKg());
  // Plan et jour courant ne bougent pas pendant l'affichage du tableau de
  // bord : lus une fois, pas à chaque tick du minuteur.
  const plan = useMemo(() => getActiveWorkoutPlan(), []);
  // Incrémenté à chaque case de la check-list : relit les minutes de la semaine.
  const [checklistVersion, setChecklistVersion] = useState(0);
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
  // Séances prévues cette semaine (jours de repos exclus) : le plan couvre
  // plusieurs semaines, on ne compte donc que la tranche de 7 jours en cours.
  const weekPlanDays = useMemo(() => {
    const weekStartIndex = Math.floor(currentDayIndex / 7) * 7;
    return plan.slice(weekStartIndex, weekStartIndex + 7);
  }, [plan, currentDayIndex]);
  const target = Math.max(1, weekPlanDays.filter((d) => !d.isRestDay).length);
  const done = weekWorkouts.length;

  // Objectif en minutes (vélo + musculation légère) et minutes faites depuis lundi.
  const goal = useMemo(() => computeWeekTargets(weekPlanDays, { goalKg }), [weekPlanDays, goalKg]);
  const progress = useMemo(() => getWeekProgress(), [checklistVersion]);
  const stepsAverage = useMemo(() => getStepsSummary(7).average, [checklistVersion]);
  const minutesDone = progress.bikeMinutes + progress.strengthMinutes;
  const percent = Math.min(100, (minutesDone / Math.max(1, goal.totalMinutes)) * 100);

  const handleGoalChange = (kg) => {
    if (kg === goalKg) return;
    setMonthlyGoalKg(kg);
    setGoalKg(kg);
  };

  // Bande semaine : 7 cellules (lundi → dimanche) avec statut par jour.
  const todayIdx = (new Date().getDay() + 6) % 7;
  const weekStrip = useMemo(() => {
    const weekStartIndex = Math.floor(currentDayIndex / 7) * 7;
    const doneDates = new Set(weekWorkouts.map(w => new Date(w.date).toISOString().slice(0, 10)));
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const planDay = plan[weekStartIndex + i];
      return {
        num: date.getDate(),
        isToday: i === todayIdx,
        isDone: doneDates.has(date.toISOString().slice(0, 10)),
        isRest: planDay ? planDay.isRestDay === true : false,
      };
    });
  }, [plan, currentDayIndex, weekWorkouts, todayIdx]);

  // Séance du jour, pour la carte « Aujourd'hui ».
  const todayPlanDay = plan[currentDayIndex] || null;
  const todayTitle = todayPlanDay
    ? todayPlanDay.title.replace(/^JOUR \d+:\s*/i, '').split(' — ')[0]
    : '';

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
        <h1 className="hd-title page-title">{t('home.title', { defaultValue: 'Aujourd\'hui' })}</h1>
        <p className="hd-subtitle page-subtitle">{t('home.subtitle', { defaultValue: 'Vue d\'ensemble de la semaine' })}</p>
      </div>

      {/* Bande semaine : lundi → dimanche */}
      <div className="hd-week" aria-hidden="true">
        {weekStrip.map((d, i) => (
          <div key={i} className={`hd-week-day${d.isToday ? ' today' : ''}`}>
            <span className="hd-week-num">{d.num}</span>
            <span className={`hd-week-dot ${d.isDone ? 'done' : d.isRest ? 'rest' : 'up'}`} />
          </div>
        ))}
      </div>

      {/* Check-list du jour : vélo (hors app, à cocher), muscu, pas */}
      <DailyChecklist
        planDay={todayPlanDay}
        goal={goal}
        onStartWorkout={onStartWorkout}
        onChange={() => setChecklistVersion((v) => v + 1)}
      />

      <div className="hd-top">
        <Ring
          percent={percent}
          label={t('home.minutesRingLabel', { defaultValue: 'Minutes' })}
          sub={`${minutesDone} / ${goal.totalMinutes} min`}
        />

        <div className="hd-stack">
          <div className="hd-card hd-card-bike">
            <Bike size={20} />
            <div className="hd-card-body">
              <div className="hd-card-label">Vélo</div>
              <div className="hd-card-value">
                {progress.bikeMinutes}<span className="hd-card-of"> / {goal.bikeMinutes} min</span>
              </div>
            </div>
          </div>

          <div className="hd-card hd-card-strength">
            <Dumbbell size={20} />
            <div className="hd-card-body">
              <div className="hd-card-label">Muscu légère</div>
              <div className="hd-card-value">
                {progress.strengthMinutes}<span className="hd-card-of"> / {goal.strengthMinutes} min</span>
              </div>
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
        </div>
      </div>

      {/* Objectif mensuel → durées de la semaine */}
      <div className="hd-goal card">
        <div className="hd-goal-head">
          <Target size={20} />
          <span className="hd-goal-title">Objectif de perte de poids</span>
        </div>
        <div className="hd-goal-options" role="radiogroup" aria-label="Kilos à perdre par mois">
          {GOAL_OPTIONS_KG.map((kg) => (
            <button
              key={kg}
              type="button"
              role="radio"
              aria-checked={kg === goalKg}
              className={`hd-goal-option${kg === goalKg ? ' active' : ''}`}
              onClick={() => handleGoalChange(kg)}
            >
              −{fmtKg(kg)} kg<span>/mois</span>
            </button>
          ))}
        </div>
        <ul className="hd-goal-plan">
          <li>
            <Bike size={16} />
            <span>
              <strong>{goal.bikeMinutes} min de vélo</strong> cette semaine
              {goal.sessions > 0 && ` · ${goal.warmup} + ${goal.main} min les jours de séance`}
            </span>
          </li>
          {goal.extraBike > 0 && (
            <li className="hd-goal-extra">
              <Bike size={16} />
              <span>dont {goal.extraBike} min de vélo libre les jours de repos</span>
            </li>
          )}
          <li>
            <Dumbbell size={16} />
            <span><strong>{goal.strengthMinutes} min de muscu légère</strong> ({goal.sessions} séances)</span>
          </li>
          <li>
            <Footprints size={16} />
            <span>
              <strong>{DAILY_STEPS_TARGET.toLocaleString('fr-FR')} pas par jour</strong>
              {stepsAverage != null && ` · moyenne 7 jours : ${stepsAverage.toLocaleString('fr-FR')}`}
            </span>
          </li>
          <li>
            <Leaf size={16} />
            <span>Assiette : <strong>−{goal.dietDaily} kcal/jour</strong> (objectif de l'onglet Nutrition)</span>
          </li>
        </ul>
        <p className="hd-goal-foot">
          Avec ce plan : environ <strong>−{fmtKg(goal.projectedKgPerMonth)} kg par mois</strong>
          {' · '}Séances {done}/{target} · Série {streak} jour{streak > 1 ? 's' : ''}
        </p>
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

    </div>
  );
}
