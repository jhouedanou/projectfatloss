import React, { useState, useEffect } from 'react';
import { syncWorkout, isConnectedToStrava, authenticateWithStrava } from '../services/StravaService';
import './StravaButton.css';
import stravaIcon from '../icons/strava.svg';
import { LinearProgress, Button, Box, Typography } from '@mui/material';

const StravaButton = ({ exercise, autoSync = false }) => {
  const [syncing, setSyncing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [stravaConnected, setStravaConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    setStravaConnected(isConnectedToStrava());
  }, []);

  useEffect(() => {
    if (autoSync && exercise) {
      handleSync();
    }
    // eslint-disable-next-line
  }, [autoSync, exercise]);

  const handleConnectStrava = async () => {
    setConnecting(true);
    try {
      const success = await authenticateWithStrava();
      if (success) {
        setStravaConnected(true);
      }
    } catch (error) {
      setError('Erreur lors de la connexion à Strava');
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSuccess(false);
    setError(null);
    setStatusMessage('Connexion à Strava...');
    try {
      const isConnected = isConnectedToStrava();
      if (!isConnected) {
        setStatusMessage('Authentification requise...');
        await authenticateWithStrava();
        setStravaConnected(true);
      }
      setStatusMessage('Préparation des données...');
      const workoutData = {
        name: exercise.name,
        desc: exercise.desc,
        calories: exercise.caloriesPerSet ? 
          Math.round((exercise.caloriesPerSet[0] + exercise.caloriesPerSet[1]) / 2) * exercise.totalSets : 
          0,
        duration: exercise.duration || 1800,
        exerciseCount: exercise.exerciseCount || 1,
        exercises: exercise.exercises || [],
        date: new Date()
      };
      setStatusMessage('Envoi à Strava...');
      await syncWorkout(workoutData);
      setStatusMessage('Entraînement synchronisé');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la synchronisation avec Strava');
      setStatusMessage('Échec de la synchronisation');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSyncing(false);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  if (!stravaConnected) {
    return (
      <Box className="strava-button-container" sx={{ my: 2 }}>
        <Button
          variant="contained"
          color="warning"
          startIcon={<img src={stravaIcon} alt="Strava" className="strava-icon" style={{ width: 24, height: 24 }} />}
          onClick={handleConnectStrava}
          disabled={connecting}
        >
          {connecting ? 'Connexion en cours...' : 'Se connecter à Strava'}
        </Button>
        {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
      </Box>
    );
  }

  return (
    <Box className="strava-button-container" sx={{ my: 2 }}>
      <Button
        variant="contained"
        color={success ? 'success' : error ? 'error' : 'primary'}
        startIcon={<img src={stravaIcon} alt="Strava" className="strava-icon" style={{ width: 24, height: 24 }} />}
        onClick={handleSync}
        disabled={syncing}
        sx={{ minWidth: 220 }}
      >
        {syncing ? 'Synchronisation...' : success ? 'Synchronisé !' : error ? 'Erreur' : 'Enregistrer sur Strava'}
      </Button>
      {syncing && <LinearProgress sx={{ mt: 1 }} />}
      {statusMessage && <Typography sx={{ mt: 1 }} color={error ? 'error' : 'text.secondary'}>{statusMessage}</Typography>}
      {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
    </Box>
  );
};

export default StravaButton;
