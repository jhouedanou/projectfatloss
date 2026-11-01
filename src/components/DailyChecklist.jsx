import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Check, Bike, Dumbbell, Leaf, RefreshCw, Play } from 'lucide-react';
import { getWorkoutHistory } from '../services/WorkoutStorage';
import { getCardioSessions } from '../services/CardioStorage';
import { dateKey } from '../services/HabitStorage';
import { estimateSessionMinutes } from '../services/WeightLossPlan';
import { getChecklistDay, isBikeItemDone, toggleBikeItem } from '../services/DailyChecklist';
import { importBikeSessionsFromDrive, isPublicSyncConfigured } from '../services/GoogleDriveImport';
import { bikeSessionDayKey, importBikeSessionsFromGoogleFit, importStepsFromGoogleFit } from '../services/GoogleFitSync';
import { isHealthConnectApp } from '../services/HealthConnect';
import { parseDayTitle } from '../utils/dayTitle';

// APK : import automatique Health Connect au plus toutes les 15 minutes.
const HEALTH_AUTOSYNC_KEY = 'pfl_hc_autosync_at';
const HEALTH_AUTOSYNC_MS = 15 * 60 * 1000;
import './DailyChecklist.css';

/**
 * Check-list du jour : une séance de vélo (immersive dans l'app, ou faite
 * ailleurs et cochée ici) et la séance de musculation guidée.
 * @param {Object} planDay - jour du programme
 * @param {Object} goal - cibles de la semaine (computeWeekTargets)
 * @param {Function} onStartWorkout - ouvre la séance de musculation
 * @param {Function} [onStartRide] - ouvre la séance vélo immersive (minutes prévues)
 * @param {Function} onChange - appelé après chaque case cochée/décochée
 */
export default function DailyChecklist({ planDay, goal, onStartWorkout, onStartRide, onChange }) {
  const today = useMemo(() => new Date(), []);
  const [day, setDay] = useState(() => getChecklistDay(today));
  // Synchro depuis la ligne vélo : Health Connect (APK) ou Health Sync (dossier Drive public)
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

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // APK : sorties vélo et pas de Health Connect importés à l'ouverture, sans
  // demande d'autorisation (l'accès s'accorde depuis Cardio ou les réglages).
  useEffect(() => {
    if (!isHealthConnectApp()) return;
    let last = 0;
    try { last = Number(sessionStorage.getItem(HEALTH_AUTOSYNC_KEY)) || 0; } catch { /* stockage indisponible */ }
    if (Date.now() - last < HEALTH_AUTOSYNC_MS) return;
    try { sessionStorage.setItem(HEALTH_AUTOSYNC_KEY, String(Date.now())); } catch { /* idem */ }
    Promise.all([
      importBikeSessionsFromGoogleFit({ days: 7, prompt: false }),
      importStepsFromGoogleFit({ days: 7, prompt: false }),
    ])
      .then(([bike]) => {
        if (!bike.imported) return;
        setDay(getChecklistDay(today));
        setSyncVersion((v) => v + 1);
        onChangeRef.current?.();
      })
      .catch((error) => console.warn('[health] import automatique différé:', error?.message));
  }, [today]);

  if (!planDay) return null;

  const title = parseDayTitle(planDay.title).name;
  // Vélo chaque jour (même un jour sans musculation), puis la séance du jour.
  const items = [
    { id: 'bike', kind: 'bike', minutes: goal.bikePerSession, label: `Vélo ${goal.bikePerSession} min`, hint: 'chaque jour, au moment qui vous arrange' },
  ];
  if (!planDay.isRestDay) {
    items.push({ id: 'strength', kind: 'strength', label: 'Musculation', hint: `${title} · ~${estimateSessionMinutes(planDay).strength} min` });
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
      if (isHealthConnectApp()) await importBikeSessionsFromGoogleFit({ days: 30 });
      else await importBikeSessionsFromDrive();
      setDay(getChecklistDay(today));
      setSyncVersion((v) => v + 1);
      onChange && onChange();
    } catch (error) {
      setSyncError(error.message || 'Synchronisation impossible');
    } finally {
      setSyncing(false);
    }
  };

  const canSync = isHealthConnectApp() || isPublicSyncConfigured();
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
          <><Leaf size={13} /> Pas de musculation aujourd'hui : seulement le vélo.</>
        ) : (
          onStartRide
            ? '« Rouler » lance la séance vélo en vidéo, pilotée par votre EB900. Faite ailleurs ? Cochez-la.'
            : 'Le vélo se fait hors de l\'app : cochez la séance une fois faite.'
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
                {item.kind === 'bike' && !done && onStartRide && (
                  <button
                    type="button"
                    className="dcl-ride"
                    onClick={() => onStartRide(item.minutes)}
                    aria-label={`Lancer la séance vélo immersive de ${item.minutes} min`}
                  >
                    <Play size={13} fill="currentColor" /> Rouler
                  </button>
                )}
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
