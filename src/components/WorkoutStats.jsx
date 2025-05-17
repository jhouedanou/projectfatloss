import React, { useState, useEffect } from 'react';
import { getWorkoutStats, getWeightLiftedByExercise } from '../services/WorkoutStorage';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import './WorkoutStats.css';

function WorkoutStats() {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalCalories: 0,
    totalDuration: 0,
    lastWorkoutDate: null
  });
  
  const [exerciseWeights, setExerciseWeights] = useState({});
  const [topExercises, setTopExercises] = useState([]);
  
  const loadData = () => {
    // Charger les statistiques globales
    const workoutStats = getWorkoutStats();
    setStats({
      totalWorkouts: workoutStats.totalWorkouts || 0,
      totalCalories: Math.round(workoutStats.totalCalories) || 0,
      totalDuration: workoutStats.totalDuration || 0,
      lastWorkoutDate: workoutStats.lastWorkoutDate || null
    });
    
    // Charger les statistiques de poids pour chaque exercice
    const weights = getWeightLiftedByExercise();
    setExerciseWeights(weights);
    
    // Trier les exercices par poids total soulevé
    const exerciseEntries = Object.entries(weights);
    const sortedExercises = exerciseEntries.sort((a, b) => b[1] - a[1]);
    setTopExercises(sortedExercises.slice(0, 5)); // Top 5 des exercices
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  return (
    <div className="workout-stats-container workout-stats-centered">
      <h2 className="stats-title">Statistiques d'Entraînement</h2>
      
      <div className="stats-summary">
        <div className="stat-item">
          <div className="stat-value">{stats.totalWorkouts}</div>
          <div className="stat-label">Entraînements</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.totalCalories}</div>
          <div className="stat-label">Calories</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">
            {Math.floor(stats.totalDuration / 60)}h{' '}
            {Math.floor(stats.totalDuration % 60)}m
          </div>
          <div className="stat-label">Durée totale</div>
        </div>
      </div>
      
      {stats.lastWorkoutDate && (
        <div className="last-workout">
          <p>
            Dernier entraînement:{' '}
            <span className="last-date">
              {format(new Date(stats.lastWorkoutDate), 'EEEE d MMMM yyyy', { locale: fr })}
            </span>
          </p>
        </div>
      )}
      
      {topExercises.length > 0 && (
        <div className="top-exercises">
          <h3 className="top-exercises-title">Top Exercices (poids total soulevé)</h3>
          <ul className="exercise-list-stats">
            {topExercises.map(([exercise, weight], index) => (
              <li key={index} className="exercise-item-stats">
                <span className="exercise-name-stats">{exercise}</span>
                <span className="exercise-weight-stats">{Math.round(weight)} kg</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default WorkoutStats;
