import React, { useState } from 'react';
import GoogleFitService from '../services/GoogleFitService';
import './GoogleFitButton.css';

const GoogleFitButton = ({ exercise }) => {
  const [isLoading, setIsLoading] = useState(false);

  const syncWithGoogleFit = async () => {
    setIsLoading(true);
    try {
      // Calculer les calories totales
      const totalCalories = exercise.totalSets * 
        ((exercise.caloriesPerSet[0] + exercise.caloriesPerSet[1]) / 2);

      // Se connecter à Google Fit si nécessaire
      await GoogleFitService.signIn();

      // Créer l'activité pour Google Fit
      const activity = {
        activityType: exercise.googleFitActivity.type,
        name: exercise.name,
        description: exercise.desc,
        startTime: new Date().getTime(),
        duration: (exercise.duration || 3600) * 1000, // en millisecondes
        calories: totalCalories,
        muscleGroups: exercise.googleFitActivity.muscleGroups
      };

      // Envoyer l'activité à Google Fit
      await GoogleFitService.addActivity(activity);
      
      alert('Exercice synchronisé avec Google Fit !');
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      alert('Erreur lors de la synchronisation avec Google Fit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      className={`google-fit-btn ${isLoading ? 'loading' : ''}`}
      onClick={syncWithGoogleFit}
      disabled={isLoading}
    >
      <img 
        src="/icons/google-fit.svg" 
        alt="Google Fit"
        width="24"
        height="24"
      />
      {isLoading ? 'Synchronisation...' : 'Ajouter à Google Fit'}
    </button>
  );
};

export default GoogleFitButton;