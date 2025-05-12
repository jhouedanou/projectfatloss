import React, { useState, useEffect } from 'react';
import { syncWorkoutHistory } from '../services/StravaService';
import { getWorkoutHistory } from '../services/WorkoutStorage';
import stravaIcon from '../icons/strava.svg';
import { LinearProgress, Box, Typography, Button } from '@mui/material';

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
        setSyncing(false);
        return;
      }
      // Synchroniser l'historique
      const syncResults = await syncWorkoutHistory(limit);
      setResults(syncResults);
      if (onSyncComplete) {
        onSyncComplete(syncResults);
      }
    } catch (err) {
      setError(err.message || "Erreur lors de la synchronisation");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Box className="sync-history-container" sx={{ my: 2 }}>
      <Button
        variant="contained"
        color={results ? 'success' : error ? 'error' : 'primary'}
        startIcon={<img src={stravaIcon} alt="Strava" className="strava-icon" style={{ width: 24, height: 24 }} />}
        onClick={handleSync}
        disabled={syncing || availableWorkouts === 0}
        sx={{ minWidth: 260 }}
      >
        {syncing ? 'Synchronisation...' :
          availableWorkouts === 0 ? 'Aucun entraînement à synchroniser' :
          `Synchroniser ${availableWorkouts} entraînement${availableWorkouts > 1 ? 's' : ''}`}
      </Button>
      {syncing && <LinearProgress sx={{ mt: 1 }} />}
      {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
      {results && (
        <Box className="sync-results" sx={{ mt: 1 }}>
          <Typography color="success.main">Synchronisation terminée</Typography>
          <Typography>
            {results.synced} entraînement(s) synchronisé(s), {results.failed} échec(s)
          </Typography>
          {results.details.length > 0 && (
            <details style={{ marginTop: 4 }}>
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
        </Box>
      )}
    </Box>
  );
};

export default SyncHistoryButton;
