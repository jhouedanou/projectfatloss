import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  getWeightHistory, 
  addWeightRecord, 
  deleteWeightRecord,
  getWeightStats
} from '../services/WeightStorage';

// Composant Popup d'encouragement
function EncouragementModal({ isOpen, onClose, weightIncrease }) {
  const encouragementMessages = [
    {
      title: "💪 Restez Motivé(e) !",
      message: "Chaque petit pas compte ! Les fluctuations de poids sont normales. Continuez vos efforts, les résultats viendront !",
      tips: ["Gardez une alimentation équilibrée", "Maintenez votre routine d'exercice", "Le muscle pèse plus que la graisse"]
    },
    {
      title: "🔥 Ne Lâchez Rien !",
      message: "Rome ne s'est pas construite en un jour ! Votre parcours de transformation demande de la patience et de la persévérance.",
      tips: ["Concentrez-vous sur vos sensations", "Mesurez vos progrès autrement", "Prenez des photos pour voir l'évolution"]
    },
    {
      title: "🎯 Vous Êtes Sur la Bonne Voie !",
      message: "Les résultats durables prennent du temps. Votre corps s'adapte et se renforce chaque jour !",
      tips: ["Buvez plus d'eau", "Dormez suffisamment", "Soyez fier(e) de vos efforts"]
    }
  ];

  const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];

  if (!isOpen) return null;

  return (
    <div className="encouragement-modal-overlay">
      <div className="encouragement-modal">
        <div className="encouragement-header">
          <h3>{randomMessage.title}</h3>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        
        <div className="encouragement-content">
          <div className="weight-change-info">
            <span className="weight-increase">+{weightIncrease.toFixed(1)} kg</span>
            <p>depuis votre dernière pesée</p>
          </div>
          
          <p className="encouragement-message">{randomMessage.message}</p>
          
          <div className="encouragement-tips">
            <h4>💡 Conseils pour continuer :</h4>
            <ul>
              {randomMessage.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
          
          <div className="encouragement-reminder">
            <p><strong>Rappel :</strong> Votre valeur ne se mesure pas sur une balance ! 💚</p>
          </div>
        </div>
        
        <div className="encouragement-actions">
          <button className="continue-btn" onClick={onClose}>
            💪 Continuer Mon Parcours !
          </button>
        </div>
      </div>
    </div>
  );
}

function WeightTracker() {
  const { t, i18n } = useTranslation();
  const [weightRecords, setWeightRecords] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [stats, setStats] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [weightIncrease, setWeightIncrease] = useState(0);
  
  // Charger les données au démarrage
  useEffect(() => {
    loadWeightData();
  }, []);
  
  // Fonction pour charger les données de poids
  const loadWeightData = () => {
    const history = getWeightHistory();
    setWeightRecords(history);
    
    // Récupérer les statistiques
    const weightStats = getWeightStats();
    setStats(weightStats);
  };
  
  // Fonction pour ajouter un nouvel enregistrement
  const handleAddWeight = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const weightValue = parseFloat(newWeight.replace(',', '.'));
      
      if (isNaN(weightValue) || weightValue <= 0) {
        setError(t('weight.invalidWeight'));
        return;
      }
      
      // Obtenir le dernier poids avant d'ajouter le nouveau
      const currentHistory = getWeightHistory();
      const lastWeight = currentHistory.length > 0 ? currentHistory[currentHistory.length - 1].weight : null;
      
      // Ajouter l'enregistrement
      addWeightRecord(weightValue, null, notes);
      
      // Vérifier si le poids a augmenté et afficher le popup d'encouragement
      if (lastWeight && weightValue > lastWeight) {
        const increase = weightValue - lastWeight;
        // Afficher le popup seulement si l'augmentation est significative (plus de 0.2 kg)
        if (increase >= 0.2) {
          setWeightIncrease(increase);
          setShowEncouragement(true);
        }
      }
      
      // Recharger les données
      loadWeightData();
      
      // Réinitialiser le formulaire
      setNewWeight('');
      setNotes('');
      setSuccess(t('weight.recordSaved'));
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || t('weight.errorSaving'));
    }
  };
  
  // Fonction pour supprimer un enregistrement
  const handleDeleteRecord = (id) => {
    try {
      deleteWeightRecord(id);
      loadWeightData();
      setSuccess(t('weight.recordDeleted'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(t('weight.errorDeleting'));
    }
  };
  
  // Préparer les données pour le graphique
  const chartData = weightRecords.map(record => ({
    date: format(new Date(record.date), 'dd/MM/yy'),
    poids: record.weight,
    // Ajouter un point pour chaque 10kg (pour référence)
    référence: record.weight > 10 ? Math.floor(record.weight / 10) * 10 : null
  }));
  
  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    const locale = i18n.language === 'fr' ? fr : undefined;
    return format(new Date(dateString), 'dd MMMM yyyy', { locale });
  };
  
  return (
    <div className="weight-tracker">
      <h2>{t('weight.title')}</h2>
      
      {/* Formulaire d'ajout de poids */}
      <div className="weight-form-container">
        <form onSubmit={handleAddWeight} className="weight-form">
          <div className="form-group">
            <label htmlFor="weight">{t('weight.weightKg')}:</label>
            <input
              type="number"
              id="weight"
              min="30"
              max="300"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              required
              placeholder="Ex: 75.5"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="notes">{t('weight.notes')}:</label>
            <input
              type="text"
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Après cardio"
            />
          </div>
          
          <button type="submit" className="add-weight-btn">{t('weight.add')}</button>
        </form>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>
      
      {/* Statistiques de poids */}
      {stats.current && (
        <div className="weight-stats">
          <div className="stat-card current-weight">
            <div className="stat-title">{t('weight.currentWeight')}</div>
            <div className="stat-value">{stats.current.weight} kg</div>
            <div className="stat-date">{formatDate(stats.current.date)}</div>
          </div>
          
          {stats.initial && stats.current.id !== stats.initial.id && (
            <div className={`stat-card weight-change ${stats.change <= 0 ? 'positive' : 'negative'}`}>
              <div className="stat-title">{t('weight.evolution')}</div>
              <div className="stat-value">
                {stats.change > 0 ? '+' : ''}
                {stats.change.toFixed(1)} kg
              </div>
              <div className="stat-percentage">
                {stats.change > 0 ? '+' : ''}
                {stats.changePercentage.toFixed(1)}%
              </div>
            </div>
          )}
          
          <div className="stat-card min-max">
            <div className="min-weight">
              <span className="stat-label">{t('weight.min')}:</span>
              <span className="stat-value">{stats.lowestRecord.weight} kg</span>
            </div>
            <div className="max-weight">
              <span className="stat-label">{t('weight.max')}:</span>
              <span className="stat-value">{stats.highestRecord.weight} kg</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Graphique d'évolution */}
      {weightRecords.length > 0 ? (
        <div className="weight-chart">
          <h3>{t('weight.chart')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="poids" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="référence" 
                stroke="#82ca9d" 
                strokeDasharray="5 5" 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="no-weight-data">
          <p>{t('weight.noData')}</p>
          <p>{t('weight.startTracking')}</p>
        </div>
      )}
      
      {/* Historique des enregistrements */}
      {weightRecords.length > 0 && (
        <div className="weight-history">
          <h3>{t('weight.history')}</h3>
          <div className="weight-records-list">
            {weightRecords.slice().reverse().map(record => (
              <div key={record.id} className="weight-record">
                <div className="record-date">{formatDate(record.date)}</div>
                <div className="record-weight">{record.weight} kg</div>
                {record.notes && <div className="record-notes">{record.notes}</div>}
                <button 
                  className="delete-record" 
                  onClick={() => handleDeleteRecord(record.id)}
                  aria-label="Supprimer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Popup d'encouragement */}
      <EncouragementModal 
        isOpen={showEncouragement}
        onClose={() => setShowEncouragement(false)}
        weightIncrease={weightIncrease}
      />
    </div>
  );
}

export default WeightTracker;
