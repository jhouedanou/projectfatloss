import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale as ScaleIcon, Clock, Dumbbell, Bike, Target } from 'lucide-react';
import { getWorkoutHistory } from '../services/WorkoutStorage';
import { getWeightHistory } from '../services/WeightStorage';
import { getActiveWorkoutPlan } from '../services/WorkoutCustomization';
import { recommendNextSession } from '../services/RecoveryAdvisor';
import {
  GOAL_OPTIONS_KG,
  getMonthlyGoalKg,
  setMonthlyGoalKg,
  computeWeekTargets,
  getWeekProgress,
  startOfWeek,
} from '../services/WeightLossPlan';
import DailyChecklist from './DailyChecklist';
import './HomeDashboard.css';

const fmtKg = (kg) => kg.toLocaleString('fr-FR', { maximumFractionDigits: 1 });

/** Ligne « Vélo 40 / 140 min » avec sa barre de progression. */
function WeekRow({ icon, tone, label, value, total }) {
  const pct = Math.min(100, (value / Math.max(1, total)) * 100);
  return (
    <div className="hd-week-row">
      <span className={`hd-week-row-icon ${tone}`}>{icon}</span>
      <span className="hd-week-row-label">{label}</span>
      <span className="hd-week-row-value">
        {value}<span className="hd-card-of"> / {total} min</span>
      </span>
      <span className="hd-week-row-bar" aria-hidden="true">
        <span className={`hd-week-row-fill ${tone}`} style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
}

export default function HomeDashboard({ onStartWorkout, onStartRide }) {
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

  // Objectif en minutes (vélo + musculation) et minutes faites depuis lundi.
  const goal = useMemo(() => computeWeekTargets(weekPlanDays, { goalKg }), [weekPlanDays, goalKg]);
  const progress = useMemo(() => getWeekProgress(), [checklistVersion]);

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

  // Séance du jour, pour la check-list.
  const todayPlanDay = plan[currentDayIndex] || null;

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
        <p className="hd-subtitle page-subtitle">{t('home.subtitle', { defaultValue: 'Votre journée, puis votre semaine' })}</p>
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

      {/* Check-list du jour : vélo (séance immersive ou cochée), muscu */}
      <DailyChecklist
        planDay={todayPlanDay}
        goal={goal}
        onStartWorkout={onStartWorkout}
        onStartRide={onStartRide}
        onChange={() => setChecklistVersion((v) => v + 1)}
      />

      {/* Récupération : une seule ligne, seulement quand il faut attendre. */}
      {recovery && !recovery.firstSession && !(recovery.ready && new Date(nowMinute * 60000) >= recovery.recommended) && (
        <p className="hd-recovery-line">
          <Clock size={15} />
          <span>
            {t('home.recovery.nextLabel', { defaultValue: 'Prochaine séance conseillée' })} :{' '}
            <strong>{recoveryDayLabel(recovery.recommended)} · {recoveryTimeLabel(recovery.recommended)}</strong>
          </span>
        </p>
      )}

      {/* Cette semaine : vélo, musculation, poids, puis l'objectif du mois */}
      <div className="hd-week-card card">
        <div className="hd-week-card-head">
          <span className="hd-week-card-title">Cette semaine</span>
          <span className="hd-week-card-count">{done}/{target} séances</span>
        </div>

        <div className="hd-week-rows">
          <WeekRow
            icon={<Bike size={18} />}
            tone="bike"
            label="Vélo"
            value={progress.bikeMinutes}
            total={goal.bikeMinutes}
          />
          <WeekRow
            icon={<Dumbbell size={18} />}
            tone="strength"
            label="Musculation"
            value={progress.strengthMinutes}
            total={goal.strengthMinutes}
          />
          <div className="hd-week-row">
            <span className="hd-week-row-icon weight"><ScaleIcon size={18} /></span>
            <span className="hd-week-row-label">{t('home.weight', { defaultValue: 'Poids' })}</span>
            <span className="hd-week-row-value">
              {currentWeight != null ? `${currentWeight} kg` : 'Pas encore de pesée'}
              {weightDelta != null && (
                <span className={`hd-delta ${weightDelta < 0 ? 'down' : weightDelta > 0 ? 'up' : ''}`}>
                  {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="hd-goal-head">
          <Target size={18} />
          <span className="hd-goal-title">Objectif par mois</span>
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
        {goal.missingKcalPerDay > 0 && (
          <p className="hd-goal-gap">
            Pour viser −{fmtKg(goalKg)} kg : encore <strong>−{goal.missingKcalPerDay} kcal/jour</strong> dans l'assiette.
          </p>
        )}
        <p className="hd-goal-foot">
          Avec ce plan ({goal.bikePerSession} min de vélo par jour, assiette −{goal.dietDaily} kcal/jour) :
          environ <strong>−{fmtKg(goal.projectedKgPerMonth)} kg par mois</strong>
          {streak > 1 ? ` · série de ${streak} jours` : ''}
        </p>
      </div>
    </div>
  );
}
