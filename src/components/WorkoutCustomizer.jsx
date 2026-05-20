import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, Plus, X } from 'lucide-react';
import { 
  getWorkoutPlan, 
  saveWorkoutPlan, 
  updateExercise, 
  resetWorkoutPlan,
  addExercise,
  removeExercise
} from '../services/WorkoutCustomization';

const WorkoutCustomizer = ({ onClose }) => {
  const { t } = useTranslation();
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [currentDay, setCurrentDay] = useState(0);
  const [editingExercise, setEditingExercise] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sets: '',
    equip: '',
    desc: '',
    caloriesPerSet: [0, 0]
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Charger le programme d'entraînement au chargement du composant
  useEffect(() => {
    const plan = getWorkoutPlan();
    setWorkoutPlan(plan);
  }, []);

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'caloriesMin' || name === 'caloriesMax') {
      // Traiter les calories séparément car elles sont stockées dans un tableau
      const index = name === 'caloriesMin' ? 0 : 1;
      const newCalories = [...formData.caloriesPerSet];
      newCalories[index] = parseInt(value, 10) || 0;
      
      setFormData({
        ...formData,
        caloriesPerSet: newCalories
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Commencer à éditer un exercice
  const handleEditExercise = (exerciseIndex) => {
    const exercise = workoutPlan[currentDay].exercises[exerciseIndex];
    setEditingExercise(exerciseIndex);
    setIsAdding(false);
    
    setFormData({
      name: exercise.name || '',
      sets: exercise.sets || '',
      equip: exercise.equip || '',
      desc: exercise.desc || '',
      caloriesPerSet: exercise.caloriesPerSet || [0, 0]
    });
  };

  // Commencer à ajouter un nouvel exercice
  const handleAddExercise = () => {
    setEditingExercise(null);
    setIsAdding(true);
    
    setFormData({
      name: '',
      sets: '3 × 12',
      equip: 'Haltères 10 kg',
      desc: '',
      caloriesPerSet: [5, 10]
    });
  };

  // Sauvegarder les modifications d'un exercice
  const handleSaveExercise = () => {
    // Vérifier que les champs obligatoires sont remplis
    if (!formData.name || !formData.sets) {
      setErrorMessage(t('customizer.errorRequiredFields'));
      return;
    }
    
    try {
      if (isAdding) {
        // Ajouter un nouvel exercice
        const result = addExercise(currentDay, formData);
        if (result) {
          setSuccessMessage(t('customizer.exerciseAdded'));
        } else {
          setErrorMessage(t('customizer.errorSaving'));
        }
      } else {
        // Mettre à jour un exercice existant
        const result = updateExercise(currentDay, editingExercise, formData);
        if (result) {
          setSuccessMessage(t('customizer.exerciseUpdated'));
        } else {
          setErrorMessage(t('customizer.errorSaving'));
        }
      }
      
      // Recharger le programme mis à jour
      const updatedPlan = getWorkoutPlan();
      setWorkoutPlan(updatedPlan);
      
      // Réinitialiser le formulaire
      setEditingExercise(null);
      setIsAdding(false);
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrorMessage(t('customizer.errorSaving'));
    }
  };

  // Supprimer un exercice
  const handleDeleteExercise = (exerciseIndex) => {
    if (window.confirm(t('customizer.confirmDelete'))) {
      const result = removeExercise(currentDay, exerciseIndex);
      
      if (result) {
        setSuccessMessage(t('customizer.exerciseDeleted'));
        
        // Recharger le programme mis à jour
        const updatedPlan = getWorkoutPlan();
        setWorkoutPlan(updatedPlan);
        
        // Effacer le message de succès après 3 secondes
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setErrorMessage(t('customizer.errorDeleting'));
      }
    }
  };

  // Réinitialiser le programme
  const handleResetProgram = () => {
    if (window.confirm(t('customizer.confirmReset'))) {
      const result = resetWorkoutPlan();
      
      if (result) {
        setSuccessMessage(t('customizer.programReset'));
        
        // Recharger le programme mis à jour
        const updatedPlan = getWorkoutPlan();
        setWorkoutPlan(updatedPlan);
        
        // Effacer le message de succès après 3 secondes
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setErrorMessage(t('customizer.errorResetting'));
      }
    }
  };

  // Annuler l'édition en cours
  const handleCancelEdit = () => {
    setEditingExercise(null);
    setIsAdding(false);
    setErrorMessage('');
  };

  return (
    <div className="customizer-overlay" onClick={onClose}>
      <div className="workout-customizer" onClick={(e) => e.stopPropagation()}>
        <div className="customizer-header">
          <h2>{t('customizer.title')}</h2>
          <button className="close-button" onClick={onClose}><X size={20} /></button>
        </div>
      
      {/* Messages de succès et d'erreur */}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}
      
      {/* Sélection du jour */}
      <div className="day-selector">
        <label>{t('customizer.selectDay')}</label>
        <select 
          value={currentDay} 
          onChange={(e) => setCurrentDay(parseInt(e.target.value, 10))}
          disabled={editingExercise !== null || isAdding}
        >
          {workoutPlan.map((day, index) => (
            <option key={index} value={index}>
              {t('app.tabs.day')} {index + 1}: {day.title}
            </option>
          ))}
        </select>
      </div>
      
      {/* Liste des exercices du jour sélectionné */}
      {workoutPlan[currentDay] && (
        <div className="exercises-list">
          <h3>{workoutPlan[currentDay].title}</h3>
          
          {workoutPlan[currentDay].exercises.map((exercise, index) => (
            <div className="exercise-item" key={index}>
              <div className="exercise-details">
                <div className="exercise-name">{exercise.name}</div>
                <div className="exercise-info">
                  <span className="exercise-sets">{exercise.sets}</span>
                  <span className="exercise-equip">{exercise.equip}</span>
                </div>
              </div>
              <div className="exercise-actions">
                <button 
                  className="edit-button"
                  onClick={() => handleEditExercise(index)}
                  disabled={editingExercise !== null || isAdding}
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  className="delete-button"
                  onClick={() => handleDeleteExercise(index)}
                  disabled={editingExercise !== null || isAdding}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {/* Bouton pour ajouter un exercice */}
          <button 
            className="add-button"
            onClick={handleAddExercise}
            disabled={editingExercise !== null || isAdding}
          >
            <Plus size={16} style={{ marginRight: '6px' }} />
            <span>{t('customizer.addExercise')}</span>
          </button>
        </div>
      )}
      
      {/* Formulaire d'édition/ajout d'exercice */}
      {(editingExercise !== null || isAdding) && (
        <div className="exercise-form">
          <h3>
            {isAdding ? t('customizer.addingExercise') : t('customizer.editingExercise')}
          </h3>
          
          <div className="form-group">
            <label>{t('customizer.exerciseName')}</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>{t('customizer.exerciseSets')}</label>
            <input 
              type="text" 
              name="sets" 
              value={formData.sets} 
              onChange={handleInputChange} 
              required 
              placeholder="Ex: 4 × 12-15"
            />
          </div>
          
          <div className="form-group">
            <label>{t('customizer.exerciseEquipment')}</label>
            <input 
              type="text" 
              name="equip" 
              value={formData.equip} 
              onChange={handleInputChange} 
              placeholder="Ex: Haltères 15 kg"
            />
          </div>
          
          <div className="form-group">
            <label>{t('customizer.exerciseDescription')}</label>
            <textarea 
              name="desc" 
              value={formData.desc} 
              onChange={handleInputChange}
              rows="2"
            ></textarea>
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label>{t('customizer.caloriesMin')}</label>
              <input 
                type="number" 
                name="caloriesMin" 
                value={formData.caloriesPerSet[0]} 
                onChange={handleInputChange} 
                min="0"
              />
            </div>
            <div className="form-group half">
              <label>{t('customizer.caloriesMax')}</label>
              <input 
                type="number" 
                name="caloriesMax" 
                value={formData.caloriesPerSet[1]} 
                onChange={handleInputChange} 
                min="0"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button className="save-button" onClick={handleSaveExercise}>
              {t('customizer.save')}
            </button>
            <button className="cancel-button" onClick={handleCancelEdit}>
              {t('customizer.cancel')}
            </button>
          </div>
        </div>
      )}
      
      {/* Bouton de réinitialisation du programme */}
      <button 
        className="reset-button"
        onClick={handleResetProgram}
        disabled={editingExercise !== null || isAdding}
      >
        {t('customizer.resetProgram')}
      </button>
    </div>
  </div>
  );
};

export default WorkoutCustomizer;
