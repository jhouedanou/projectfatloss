import React, { useState, useMemo } from 'react';
import { Check, Bike, Dumbbell, Footprints, RefreshCw, Leaf } from 'lucide-react';
import { getWorkoutHistory } from '../services/WorkoutStorage';
import { getStepsForDate } from '../services/StepsStorage';
import { dateKey } from '../services/HabitStorage';
import { estimateSessionMinutes, DAILY_STEPS_TARGET } from '../services/WeightLossPlan';
import { getChecklistDay, isBikeItemDone, toggleBikeItem, toggleManualItem } from '../services/DailyChecklist';
import { importStepsFromGoogleFit } from '../services/GoogleFitSync';
import './DailyChecklist.css';

const fmtSteps = (n) => (n == null ? '—' : n.toLocaleString('fr-FR'));

/**
 * Check-list du jour : blocs de vélo (faits hors de l'app, cochés ici),
 * séance de musculation guidée et objectif de pas.
 * @param {Object} planDay - jour du programme
 * @param {Object} goal - cibles de la semaine (computeWeekTargets)
 * @param {Function} onStartWorkout - ouvre la séance de musculation
 * @param {Function} onChange - appelé après chaque case cochée/décochée
 */
export default function DailyChecklist({ planDay, goal, onStartWorkout, onChange }) {
  const today = useMemo(() => new Date(), []);
  const [day, setDay] = useState(() => getChecklistDay(today));
  const [steps, setSteps] = useState(() => getStepsForDate(today));
  const [stepsLoading, setStepsLoading] = useState(false);
  const [stepsError, setStepsError] = useState(null);

  const workoutDone = useMemo(
    () => getWorkoutHistory().some((w) => dateKey(new Date(w.date)) === dateKey(today)),
    [today]
  );

  if (!planDay) return null;

  const title = planDay.title.replace(/^JOUR \d+:\s*/i, '').split(' — ')[0];
  const items = [];
  if (planDay.isRestDay) {
    if (goal.extraPerRestDay > 0) {
      items.push({ id: 'bikeExtra', kind: 'bike', minutes: goal.extraPerRestDay, label: `Vélo ${goal.extraPerRestDay} min`, hint: 'vélo libre pour tenir l\'objectif' });
    }
  } else {
    items.push({ id: 'bike1', kind: 'bike', minutes: goal.warmup, label: `Vélo ${goal.warmup} min`, hint: 'avant la muscu' });
    items.push({ id: 'strength', kind: 'strength', label: 'Muscu légère', hint: `${title} · ~${estimateSessionMinutes(planDay).strength} min` });
    items.push({ id: 'bike2', kind: 'bike', minutes: goal.main, label: `Vélo ${goal.main} min`, hint: 'après la muscu' });
  }
  items.push({ id: 'steps', kind: 'steps', label: `${fmtSteps(DAILY_STEPS_TARGET)} pas`, hint: `${fmtSteps(steps)} aujourd'hui` });

  const isDone = (item) => {
    if (item.kind === 'bike') return isBikeItemDone(day, item.id);
    if (item.kind === 'strength') return workoutDone;
    return (steps != null && steps >= DAILY_STEPS_TARGET) || !!day.steps;
  };
  const doneCount = items.filter(isDone).length;

  const handleItem = (item) => {
    if (item.kind === 'strength') {
      if (!workoutDone && onStartWorkout) onStartWorkout();
      return;
    }
    if (item.kind === 'steps' && steps != null && steps >= DAILY_STEPS_TARGET) return;
    const next = item.kind === 'bike'
      ? toggleBikeItem(today, item.id, item.minutes)
      : toggleManualItem(today, item.id);
    setDay(next);
    onChange && onChange();
  };

  const refreshSteps = async () => {
    setStepsLoading(true);
    setStepsError(null);
    try {
      const result = await importStepsFromGoogleFit({ days: 7 });
      setSteps(result.today ?? getStepsForDate(today));
      onChange && onChange();
    } catch (error) {
      setStepsError(error.message || 'Google Fit indisponible');
    } finally {
      setStepsLoading(false);
    }
  };

  const icons = { bike: Bike, strength: Dumbbell, steps: Footprints };

  return (
    <div className="dcl card">
      <div className="dcl-head">
        <span className="dcl-title">Check-list du jour</span>
        <span className="dcl-count">{doneCount}/{items.length}</span>
      </div>
      <p className="dcl-sub">
        {planDay.isRestDay ? (
          <><Leaf size={13} /> Jour de repos</>
        ) : (
          'Le vélo se fait hors de l\'app : cochez les blocs faits.'
        )}
      </p>

      <ul className="dcl-list">
        {items.map((item) => {
          const done = isDone(item);
          const Icon = icons[item.kind];
          return (
            <li key={item.id} className={`dcl-item${done ? ' done' : ''}`}>
              <button
                type="button"
                className="dcl-check"
                role="checkbox"
                aria-checked={done}
                aria-label={`${item.label} — ${item.hint}`}
                onClick={() => handleItem(item)}
              >
                <span className="dcl-box">{done && <Check size={14} strokeWidth={3} />}</span>
                <Icon size={18} className={`dcl-icon ${item.kind}`} />
                <span className="dcl-copy">
                  <span className="dcl-label">{item.label}</span>
                  <span className="dcl-hint">{item.hint}</span>
                </span>
                {item.kind === 'strength' && !done && <span className="dcl-start">Démarrer</span>}
              </button>
              {item.kind === 'steps' && (
                <button
                  type="button"
                  className="dcl-refresh"
                  onClick={refreshSteps}
                  disabled={stepsLoading}
                  aria-label="Actualiser les pas depuis Google Fit"
                  title="Actualiser les pas depuis Google Fit"
                >
                  <RefreshCw size={16} className={stepsLoading ? 'spin' : ''} />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {stepsError && <p className="dcl-error">{stepsError}</p>}
    </div>
  );
}
