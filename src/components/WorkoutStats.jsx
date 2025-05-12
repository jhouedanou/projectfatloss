import React, { useEffect, useState } from 'react';
import { getWorkoutStats, getWeightLiftedByExercise } from '../services/WorkoutStorage';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import SyncHistoryButton from './SyncHistoryButton';
import { isConnectedToStrava, authenticateWithStrava } from '../services/StravaService';
import './SyncHistoryButton.css';
import './WorkoutStats.css';

function WorkoutStats() {
  const [stats, setStats] = useState({
    totalCalories: 0,
    totalWorkouts: 0,
    totalWeightLifted: 0,
    lastWorkoutDate: null
  });
  
  const [exerciseWeights, setExerciseWeights] = useState({});
  const [topExercises, setTopExercises] = useState([]);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [stravaConnected, setStravaConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  
  const loadData = () => {
    // Charger les statistiques globales
    const currentStats = getWorkoutStats();
    setStats(currentStats);
    
    // Charger les poids soulevés par exercice
    const weights = getWeightLiftedByExercise();
    setExerciseWeights(weights);
    
    // Calculer les exercices avec le plus de poids soulevé
    const exerciseEntries = Object.entries(weights);
    const sortedExercises = exerciseEntries.sort((a, b) => b[1] - a[1]);
    setTopExercises(sortedExercises.slice(0, 5)); // Top 5 des exercices
    
    // Vérifier la connexion Strava
    setStravaConnected(isConnectedToStrava());
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  const handleSyncComplete = (results) => {
    if (results.synced > 0) {
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
      // Rafraîchir les données
      loadData();
    }
  };
  
  const handleConnectStrava = async () => {
    setConnecting(true);
    try {
      const success = await authenticateWithStrava();
      if (success) {
        setStravaConnected(true);
      }
    } catch (error) {
      console.error('Erreur lors de la connexion à Strava:', error);
    } finally {
      setConnecting(false);
    }
  };
  
  return (
    <div className="workout-stats-container">
      <h2>Statistiques d'Entraînement</h2>
      
      <div className="stats-cards">
        <div className="stat-card calories">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats.totalCalories}</div>
          <div className="stat-label">Calories brûlées</div>
        </div>
        
        <div className="stat-card workouts">
          <div className="stat-icon">💪</div>
          <div className="stat-value">{stats.totalWorkouts}</div>
          <div className="stat-label">Entraînements</div>
        </div>
        
        <div className="stat-card weight">
          <div className="stat-icon">⚖️</div>
          <div className="stat-value">{stats.totalWeightLifted}</div>
          <div className="stat-label">Kilos soulevés</div>
        </div>
      </div>
      
      {stats.lastWorkoutDate && (
        <div className="last-workout">
          <p>Dernier entraînement : {format(new Date(stats.lastWorkoutDate), 'dd MMMM yyyy', { locale: fr })}</p>
        </div>
      )}
      
      {topExercises.length > 0 && (
        <div className="top-exercises">
          <h3>Top 5 des Exercices</h3>
          <ul className="exercise-list">
            {topExercises.map(([name, weight]) => (
              <li key={name} className="exercise-item">
                <span className="exercise-name">{name}</span>
                <span className="exercise-weight">{weight} kg</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="strava-integration">
        <h3>Synchronisation Strava</h3>
        
        {!stravaConnected ? (
          <div className="strava-connection">
            <p>Connectez-vous à Strava pour synchroniser vos entraînements</p>
            <button 
              className="strava-connect-button"
              onClick={handleConnectStrava}
              disabled={connecting}
            >
              {connecting ? 'Connexion en cours...' : 'Se connecter à Strava'}
            </button>
          </div>
        ) : (
          <>
            <p>Synchronisez vos entraînements passés avec Strava</p>
            <SyncHistoryButton onSyncComplete={handleSyncComplete} />
            {syncSuccess && (
              <div className="sync-success-message">
                Entraînements synchronisés avec succès !
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default WorkoutStats;
