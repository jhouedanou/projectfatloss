import React, { useState, useEffect } from 'react';
import { syncWorkoutHistory } from '../services/StravaService';
import { getWorkoutHistory } from '../services/WorkoutStorage';
import stravaIcon from '../icons/strava.svg';

const SyncHistoryButton = ({ limit = 5, onSyncComplete }) => {
  const [syncing, setSyncing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [availableWorkouts, setAvailableWorkouts] = useState(0);
  
  useEffect(() => {
    const history = getWorkoutHistory();
    const unsyncedWorkouts = history.filter(workout => !workout.syncedWithStrava);
    setAvailableWorkouts(unsyncedWorkouts.length);
  }, []);

  const handleSync = async () => {
    if (syncing) return;

    setSyncing(true);
    setResults(null);
    setError(null);
    
    try {
      const history = getWorkoutHistory();
      
      if (history.length === 0) {
        setError("Aucun entraînement à synchroniser dans l'historique");
        return;
      }
      
      // Synchroniser l'historique
      const syncResults = await syncWorkoutHistory(limit);
      setResults(syncResults);
      
      // Notifier le parent si nécessaire
      if (onSyncComplete) {
        onSyncComplete(syncResults);
      }
    } catch (err) {
      console.error("Erreur lors de la synchronisation de l'historique:", err);
      setError(err.message || "Erreur lors de la synchronisation");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="sync-history-container">
      <button 
        className={`strava-button ${syncing ? 'syncing' : ''} ${results ? 'success' : ''}`}
        onClick={handleSync}
        disabled={syncing || availableWorkouts === 0}
      >
        <img src={stravaIcon} alt="Strava" className="strava-icon" />
        <span className="strava-text">
          {syncing ? 'Synchronisation...' : 
           availableWorkouts === 0 ? 'Aucun entraînement à synchroniser' :
           `Synchroniser ${availableWorkouts} entraînement${availableWorkouts > 1 ? 's' : ''}`}
        </span>
      </button>
      
      {error && (
        <div className="sync-error">
          {error}
        </div>
      )}
      
      {results && (
        <div className="sync-results">
          <p>Synchronisation terminée</p>
          <p>
            {results.synced} entraînement(s) synchronisé(s), 
            {results.failed} échec(s)
          </p>
          {results.details.length > 0 && (
            <details>
              <summary>Détails</summary>
              <ul className="sync-details-list">
                {results.details.map((detail, index) => (
                  <li key={index} className={`sync-detail sync-${detail.status}`}>
                    {detail.title}: {detail.status === 'success' ? 'Synchronisé' : 
                      detail.status === 'skipped' ? detail.reason : 'Échec'}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

export default SyncHistoryButton;
