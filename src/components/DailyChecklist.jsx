import React, { useState, useMemo } from 'react';
import { Check, Bike, Dumbbell, Leaf, RefreshCw } from 'lucide-react';
import { getWorkoutHistory } from '../services/WorkoutStorage';
import { getCardioSessions } from '../services/CardioStorage';
import { dateKey } from '../services/HabitStorage';
import { estimateSessionMinutes } from '../services/WeightLossPlan';
import { getChecklistDay, isBikeItemDone, toggleBikeItem } from '../services/DailyChecklist';
import { importBikeSessionsFromDrive, isPublicSyncConfigured } from '../services/GoogleDriveImport';
import { bikeSessionDayKey } from '../services/GoogleFitSync';
import './DailyChecklist.css';

/**
 * Check-list du jour : une séance de vélo (faite hors de l'app, cochée ici)
 * et la séance de musculation guidée.
 * @param {Object} planDay - jour du programme
 * @param {Object} goal - cibles de la semaine (computeWeekTargets)
 * @param {Function} onStartWorkout - ouvre la séance de musculation
 * @param {Function} onChange - appelé après chaque case cochée/décochée
 */
export default function DailyChecklist({ planDay, goal, onStartWorkout, onChange }) {
  const today = useMemo(() => new Date(), []);
  const [day, setDay] = useState(() => getChecklistDay(today));
  // Synchro Health Sync (dossier Drive public) depuis la ligne vélo
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [syncVersion, setSyncVersion] = useState(0);

  const workoutDone = useMemo(
    () => getWorkoutHistory().some((w) => dateKey(new Date(w.date)) === dateKey(today)),
    [today]
  );

  // Minutes de vélo du jour venues d'ailleurs (import Google Fit : Strava,
  // Holofit…, ou saisie manuelle) : elles suffisent à cocher la séance.
  const otherBikeMinutes = useMemo(() => {
    const ownIds = new Set(Object.values(day));
    return getCardioSessions()
      .filter((s) => s.type === 'bike' && !ownIds.has(s.id) && bikeSessionDayKey(s) === dateKey(today))
      .reduce((sum, s) => sum + (Number(s.duration) || 0), 0);
  }, [day, today, syncVersion]);

  if (!planDay) return null;

  const title = planDay.title.replace(/^JOUR \d+:\s*/i, '').split(' — ')[0];
  const items = [];
  if (planDay.isRestDay) {
    if (goal.extraPerRestDay > 0) {
      items.push({ id: 'bikeExtra', kind: 'bike', minutes: goal.extraPerRestDay, label: `Vélo ${goal.extraPerRestDay} min`, hint: 'vélo libre pour tenir l\'objectif' });
    }
  } else {
    items.push({ id: 'bike', kind: 'bike', minutes: goal.bikePerSession, label: `Vélo ${goal.bikePerSession} min`, hint: 'une seule séance, au moment qui vous arrange' });
    items.push({ id: 'strength', kind: 'strength', label: 'Muscu légère', hint: `${title} · ~${estimateSessionMinutes(planDay).strength} min` });
  }

  const bikeDoneElsewhere = (item) => otherBikeMinutes >= item.minutes;
  const isDone = (item) => {
    if (item.kind === 'bike') return isBikeItemDone(day, item.id) || bikeDoneElsewhere(item);
    return workoutDone;
  };
  const doneCount = items.filter(isDone).length;

  const handleItem = (item) => {
    if (item.kind === 'strength') {
      if (!workoutDone && onStartWorkout) onStartWorkout();
      return;
    }
    // Séance déjà enregistrée par ailleurs (import) : rien à cocher.
    if (bikeDoneElsewhere(item) && !isBikeItemDone(day, item.id)) return;
    setDay(toggleBikeItem(today, item.id, item.minutes));
    onChange && onChange();
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      await importBikeSessionsFromDrive();
      setDay(getChecklistDay(today));
      setSyncVersion((v) => v + 1);
      onChange && onChange();
    } catch (error) {
      setSyncError(error.message || 'Synchronisation impossible');
    } finally {
      setSyncing(false);
    }
  };

  const canSync = isPublicSyncConfigured();
  const icons = { bike: Bike, strength: Dumbbell };
  const hintOf = (item) => (item.kind === 'bike' && bikeDoneElsewhere(item) && !isBikeItemDone(day, item.id)
    ? `${otherBikeMinutes} min importées aujourd'hui`
    : item.hint);

  return (
    <div className="dcl card">
      <div className="dcl-head">
        <span className="dcl-title">Check-list du jour</span>
        {items.length > 0 && <span className="dcl-count">{doneCount}/{items.length}</span>}
      </div>
      <p className="dcl-sub">
        {planDay.isRestDay ? (
          <><Leaf size={13} /> Jour de repos{items.length === 0 ? ' : rien à faire aujourd\'hui.' : ''}</>
        ) : (
          'Le vélo se fait hors de l\'app : cochez la séance une fois faite.'
        )}
      </p>

      {items.length > 0 && (
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
                  aria-label={`${item.label} — ${hintOf(item)}`}
                  onClick={() => handleItem(item)}
                >
                  <span className="dcl-box">{done && <Check size={14} strokeWidth={3} />}</span>
                  <Icon size={18} className={`dcl-icon ${item.kind}`} />
                  <span className="dcl-copy">
                    <span className="dcl-label">{item.label}</span>
                    <span className="dcl-hint">{hintOf(item)}</span>
                  </span>
                  {item.kind === 'strength' && !done && <span className="dcl-start">Démarrer</span>}
                </button>
                {item.kind === 'bike' && canSync && (
                  <button
                    type="button"
                    className="dcl-refresh"
                    onClick={handleSync}
                    disabled={syncing}
                    aria-label="Synchroniser les séances vélo depuis Google Drive"
                    title="Synchroniser les séances vélo depuis Google Drive"
                  >
                    <RefreshCw size={16} className={syncing ? 'spin' : ''} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {syncError && <p className="dcl-error">{syncError}</p>}
    </div>
  );
}
