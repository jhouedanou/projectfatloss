import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getWorkoutHistory } from '../services/WorkoutStorage';

// Importez le CSS par défaut de react-calendar
import 'react-calendar/dist/Calendar.css';
import './WorkoutCalendar.css'; // Importer les styles personnalisés

function WorkoutCalendar() {
  const [value, setValue] = useState(new Date());
  const [workouts, setWorkouts] = useState([]);
  const [selectedDayWorkouts, setSelectedDayWorkouts] = useState([]);
  
  // Charger les entraînements au démarrage
  useEffect(() => {
    const history = getWorkoutHistory();
    setWorkouts(history);
  }, []);
  
  // Mettre à jour les entraînements du jour sélectionné
  useEffect(() => {
    if (value) {
      const selected = value.toDateString();
      const dayWorkouts = workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate.toDateString() === selected;
      });
      
      setSelectedDayWorkouts(dayWorkouts);
    }
  }, [value, workouts]);
  
  // Fonction pour personnaliser l'affichage des dates dans le calendrier
  const tileContent = ({ date, view }) => {
    // On ne s'intéresse qu'à la vue mensuelle
    if (view !== 'month') return null;
    
    const dateStr = date.toDateString();
    const hasWorkout = workouts.some(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate.toDateString() === dateStr;
    });
    
    if (hasWorkout) {
      // Trouver tous les entraînements pour cette date
      const dayWorkouts = workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate.toDateString() === dateStr;
      });
      
      // Calculer les calories totales pour cette date
      const totalCalories = dayWorkouts.reduce((total, workout) => total + (workout.calories || 0), 0);
      
      return (
        <div className="workout-calendar-tile">
          <div className="workout-marker"></div>
          <div className="calories-badge">{totalCalories}</div>
        </div>
      );
    }
    
    return null;
  };
  
  // Formatage personnalisé des dates (en français)
  const formatShortWeekday = (locale, date) => {
    return format(date, 'E', { locale: fr });
  };
  
  return (
    <div className="workout-calendar-container workout-calendar-centered">
      <h2 className="calendar-title">Calendrier d'Entraînement</h2>
      
      <Calendar
        onChange={setValue}
        value={value}
        tileContent={tileContent}
        formatShortWeekday={formatShortWeekday}
        locale="fr-FR"
      />
      
      {selectedDayWorkouts.length > 0 ? (
        <div className="selected-day-workouts">
          <h3 className="selected-day-title">Entraînements du {format(value, 'dd MMMM yyyy', { locale: fr })}</h3>
          
          {selectedDayWorkouts.map(workout => (
            <div key={workout.id} className="day-workout-card">
              <div className="workout-header">
                <span className="workout-title">{workout.title}</span>
                <span className="workout-time">{format(new Date(workout.date), 'HH:mm', { locale: fr })}</span>
              </div>
              
              <div className="workout-stats">
                <div className="stat-item">
                  <span className="stat-label">Calories</span>
                  <span className="stat-value">{workout.calories}</span>
                </div>
                
                {workout.weightLifted && (
                  <div className="stat-item">
                    <span className="stat-label">Poids soulevé</span>
                    <span className="stat-value">{workout.weightLifted} kg</span>
                  </div>
                )}
                
                <div className="stat-item">
                  <span className="stat-label">Exercices</span>
                  <span className="stat-value">{workout.exerciseCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-workouts-message">
          Aucun entraînement enregistré pour le {format(value, 'dd MMMM yyyy', { locale: fr })}
        </div>
      )}
    </div>
  );
}

export default WorkoutCalendar;
