import React, { useState } from 'react';
import { syncWorkout, isConnectedToStrava, authenticateWithStrava } from '../services/StravaService';
import './StravaButton.css';

// Importer l'icône de Strava
import stravaIcon from '../icons/strava.svg';

const StravaButton = ({ exercise }) => {
  const [syncing, setSyncing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setSyncing(true);
    setSuccess(false);
    setError(null);

    try {
      // Vérifier si l'utilisateur est connecté à Strava
      const isConnected = isConnectedToStrava();
      
      if (!isConnected) {
        // Authentifier l'utilisateur
        await authenticateWithStrava();
      }

      // Formater les données pour Strava
      const workoutData = {
        name: exercise.name,
        desc: exercise.desc,
        calories: exercise.caloriesPerSet ? 
          Math.round((exercise.caloriesPerSet[0] + exercise.caloriesPerSet[1]) / 2) * exercise.totalSets : 
          0,
        duration: exercise.duration || 1800, // Par défaut 30 minutes
        exerciseCount: 1,
        date: new Date()
      };

      // Synchroniser avec Strava
      await syncWorkout(workoutData);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Erreur lors de la synchronisation avec Strava:', err);
      setError(err.message || 'Erreur lors de la synchronisation avec Strava');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSyncing(false);
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
      {error && <div className="strava-error-message">{error}</div>}
    </div>
  );
};

export default StravaButton;
