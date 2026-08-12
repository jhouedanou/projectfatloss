import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bike, Footprints } from 'lucide-react';
import { getWorkoutHistory } from '../services/WorkoutStorage';
import { getCardioSessions } from '../services/CardioStorage';
import GoogleFitSyncButton from './GoogleFitSyncButton';
import GoogleFitItemButton from './GoogleFitItemButton';
import {
  getUnsyncedWorkouts,
  syncAllWorkouts,
  syncWorkoutToGoogleFit,
  syncCardioToGoogleFit,
  isSyncedWithGoogleFit
} from '../services/GoogleFitSync';

// Importez le CSS par défaut de react-calendar
import 'react-calendar/dist/Calendar.css';
import './WorkoutCalendar.css'; // Importer les styles personnalisés

function WorkoutCalendar() {
  // La date du jour est sélectionnée à l'ouverture : les séances du jour
  // (muscu + cardio) sont visibles immédiatement.
  const [value, setValue] = useState(new Date());
  const [workouts, setWorkouts] = useState([]);
  const [cardio, setCardio] = useState([]);
  const [selectedDayWorkouts, setSelectedDayWorkouts] = useState([]);
  const [selectedDayCardio, setSelectedDayCardio] = useState([]);

  // Charger les entraînements et les séances cardio au démarrage
  useEffect(() => {
    setWorkouts(getWorkoutHistory());
    setCardio(getCardioSessions());
  }, []);

  const sameDay = (isoDate, ref) => new Date(isoDate).toDateString() === ref;

  // Mettre à jour les séances du jour sélectionné
  useEffect(() => {
    if (value) {
      const selected = value.toDateString();
      setSelectedDayWorkouts(workouts.filter(w => sameDay(w.date, selected)));
      setSelectedDayCardio(cardio.filter(s => sameDay(s.date, selected)));
    }
  }, [value, workouts, cardio]);

  // Fonction pour personnaliser l'affichage des dates dans le calendrier
  const tileContent = ({ date, view }) => {
    // On ne s'intéresse qu'à la vue mensuelle
    if (view !== 'month') return null;

    const dateStr = date.toDateString();
    const dayWorkouts = workouts.filter(w => sameDay(w.date, dateStr));
    const dayCardio = cardio.filter(s => sameDay(s.date, dateStr));
    if (dayWorkouts.length === 0 && dayCardio.length === 0) return null;

    // Calories cumulées muscu + cardio pour la pastille du jour
    const totalCalories =
      dayWorkouts.reduce((total, w) => total + (w.calories || 0), 0) +
      dayCardio.reduce((total, s) => total + (s.calories || 0), 0);

    return (
      <div className="workout-calendar-tile">
        <div className={`workout-marker ${dayWorkouts.length === 0 ? 'cardio-only' : ''}`}></div>
        <div className="calories-badge">{Math.round(totalCalories)}</div>
      </div>
    );
  };
  
  // Formatage personnalisé des dates (en français)
  const formatShortWeekday = (locale, date) => {
    return format(date, 'E', { locale: fr });
  };
  
  return (
    <div className="workout-calendar-container workout-calendar-centered">
      <h2 className="calendar-title">Calendrier d'Entraînement</h2>

      <GoogleFitSyncButton
        getUnsyncedCount={() => getUnsyncedWorkouts().length}
        onSync={syncAllWorkouts}
        noun="séance"
        nounPlural="séances"
      />

      <Calendar
        onChange={setValue}
        value={value}
        tileContent={tileContent}
        formatShortWeekday={formatShortWeekday}
        locale="fr-FR"
      />
      
      {selectedDayWorkouts.length > 0 || selectedDayCardio.length > 0 ? (
        <div className="selected-day-workouts">
          <h3 className="selected-day-title">Entraînements du {format(value, 'dd MMMM yyyy', { locale: fr })}</h3>

          {selectedDayCardio.map(session => (
            <div key={`cardio-${session.id}`} className="day-workout-card day-cardio-card">
              <div className="workout-header">
                <span className="workout-title" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {session.type === 'bike' ? <Bike size={16} color="#3B82F6" /> : <Footprints size={16} color="#22C55E" />}
                  {session.type === 'bike' ? 'Vélo' : 'Marche'}
                </span>
                <span className="workout-time">{format(new Date(session.date), 'HH:mm', { locale: fr })}</span>
                <GoogleFitItemButton
                  synced={isSyncedWithGoogleFit('cardio', session.id)}
                  onSync={() => syncCardioToGoogleFit(session)}
                  title="Synchroniser cette séance cardio avec Google Fit"
                />
              </div>

              <div className="workout-stats">
                {session.duration != null && (
                  <div className="stat-item">
                    <span className="stat-label">Durée</span>
                    <span className="stat-value">{session.duration} min</span>
                  </div>
                )}
                {session.distance != null && (
                  <div className="stat-item">
                    <span className="stat-label">Distance</span>
                    <span className="stat-value">{session.distance} km</span>
                  </div>
                )}
                {session.calories != null && (
                  <div className="stat-item">
                    <span className="stat-label">Calories</span>
                    <span className="stat-value">{Math.round(session.calories)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {selectedDayWorkouts.map(workout => (
            <div key={workout.id} className="day-workout-card">
              <div className="workout-header">
                <span className="workout-title">{workout.title}</span>
                <span className="workout-time">{format(new Date(workout.date), 'HH:mm', { locale: fr })}</span>
                <GoogleFitItemButton
                  synced={isSyncedWithGoogleFit('workout', workout.id)}
                  onSync={() => syncWorkoutToGoogleFit(workout)}
                  title="Synchroniser cette séance avec Google Fit"
                />
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
