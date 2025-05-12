import React, { useState, useEffect } from 'react';
import { syncWorkout, isConnectedToStrava, authenticateWithStrava } from '../services/StravaService';
import './StravaButton.css';

// Importer l'icône de Strava
import stravaIcon from '../icons/strava.svg';

const StravaButton = ({ exercise, autoSync = false }) => {
  const [syncing, setSyncing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Synchronisation automatique si la prop autoSync est définie
  useEffect(() => {
    if (autoSync && exercise) {
      handleSync();
    }
  }, [autoSync, exercise]);

  const handleSync = async () => {
    setSyncing(true);
    setSuccess(false);
    setError(null);
    setStatusMessage('Connexion à Strava...');

    try {
      // Vérifier si l'utilisateur est connecté à Strava
      const isConnected = isConnectedToStrava();
      
      if (!isConnected) {
        // Authentifier l'utilisateur
        setStatusMessage('Authentification requise...');
        await authenticateWithStrava();
      }

      setStatusMessage('Préparation des données...');
      
      // Formater les données pour Strava
      const workoutData = {
        name: exercise.name,
        desc: exercise.desc,
        calories: exercise.caloriesPerSet ? 
          Math.round((exercise.caloriesPerSet[0] + exercise.caloriesPerSet[1]) / 2) * exercise.totalSets : 
          0,
        duration: exercise.duration || 1800, // Par défaut 30 minutes
        exerciseCount: exercise.exerciseCount || 1,
        exercises: exercise.exercises || [],
        date: new Date()
      };

      // Synchroniser avec Strava
      setStatusMessage('Envoi à Strava...');
      await syncWorkout(workoutData);
      
      setStatusMessage('Entraînement synchronisé');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Erreur lors de la synchronisation avec Strava:', err);
      setError(err.message || 'Erreur lors de la synchronisation avec Strava');
      setStatusMessage('Échec de la synchronisation');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSyncing(false);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  return (
    <div className="strava-button-container">
      <button 
        className={`strava-button ${syncing ? 'syncing' : ''} ${success ? 'success' : ''} ${error ? 'error' : ''}`}
        onClick={handleSync}
        disabled={syncing}
      >
        <img src={stravaIcon} alt="Strava" className="strava-icon" />
        <span className="strava-text">
          {syncing ? 'Synchronisation...' : 
           success ? 'Synchronisé !' :
           error ? 'Erreur' : 
           'Enregistrer sur Strava'}
        </span>
      </button>
      {statusMessage && <div className="strava-status-message">{statusMessage}</div>}
      {error && <div className="strava-error-message">{error}</div>}
    </div>
  );
};

export default StravaButton;
