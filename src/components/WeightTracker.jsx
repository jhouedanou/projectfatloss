import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Dumbbell, Flame, Target, Lightbulb, Heart, Trash2, Scale, X, Activity, TrendingDown, TrendingUp
} from 'lucide-react';
import { 
  getWeightHistory, 
  addWeightRecord, 
  deleteWeightRecord,
  getWeightStats
} from '../services/WeightStorage';
import GoogleFitSyncButton from './GoogleFitSyncButton';
import GoogleFitItemButton from './GoogleFitItemButton';
import {
  getUnsyncedWeights,
  syncAllWeights,
  syncWeightToGoogleFit,
  isSyncedWithGoogleFit
} from '../services/GoogleFitSync';
import './WeightTracker.css';

// Composant Popup d'encouragement
function EncouragementModal({ isOpen, onClose, weightIncrease }) {
  const encouragementMessages = [
    {
      title: "Restez Motivé(e) !",
      icon: <Dumbbell size={28} color="var(--vermilion)" />,
      message: "Chaque petit pas compte ! Les fluctuations de poids sont normales. Continuez vos efforts, les résultats viendront !",
      tips: ["Gardez une alimentation équilibrée", "Maintenez votre routine d'exercice", "Le muscle pèse plus que la graisse"]
    },
    {
      title: "Ne Lâchez Rien !",
      icon: <Flame size={28} color="var(--vermilion)" />,
      message: "Rome ne s'est pas construite en un jour ! Votre parcours de transformation demande de la patience et de la persévérance.",
      tips: ["Concentrez-vous sur vos sensations", "Mesurez vos progrès autrement", "Prenez des photos pour voir l'évolution"]
    },
    {
      title: "Vous Êtes Sur la Bonne Voie !",
      icon: <Target size={28} color="var(--vermilion)" />,
      message: "Les résultats durables prennent du temps. Votre corps s'adapte et se renforce chaque jour !",
      tips: ["Buvez plus d'eau", "Dormez suffisamment", "Soyez fier(e) de vos efforts"]
    }
  ];

  const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];

  if (!isOpen) return null;

  return (
    <div className="encouragement-modal-overlay">
      <div className="encouragement-modal">
        <button className="close-modal-icon" onClick={onClose}><X size={20} /></button>
        
        <div className="encouragement-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            {randomMessage.icon}
            <h3>{randomMessage.title}</h3>
          </div>
        </div>
        
        <div className="weight-change-info">
          <span className="weight-increase">+{weightIncrease.toFixed(1)} kg</span>
          <p>depuis votre dernière pesée</p>
        </div>
        
        <p className="encouragement-message">{randomMessage.message}</p>
        
        <div className="encouragement-tips">
          <h4>
            <Lightbulb size={18} color="#FFD700" />
            Conseils pour continuer :
          </h4>
          <ul>
            {randomMessage.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
        
        <button className="continue-btn" onClick={onClose}>
          <Dumbbell size={20} />
          <span>Continuer Mon Parcours !</span>
        </button>
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
  
  useEffect(() => {
    loadWeightData();
  }, []);
  
  const loadWeightData = () => {
    const history = getWeightHistory();
    setWeightRecords(history);
    setStats(getWeightStats());
  };
  
  const handleAddWeight = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const weightValue = parseFloat(newWeight.replace(',', '.'));
      
      if (isNaN(weightValue) || weightValue <= 0) {
        setError(t('weight.invalidWeight', { defaultValue: 'Poids invalide' }));
        return;
      }
      
      const currentHistory = getWeightHistory();
      const lastWeight = currentHistory.length > 0 ? currentHistory[currentHistory.length - 1].weight : null;
      
      addWeightRecord(weightValue, null, notes);
      
      if (lastWeight && weightValue > lastWeight) {
        const increase = weightValue - lastWeight;
        if (increase >= 0.2) {
          setWeightIncrease(increase);
          setShowEncouragement(true);
        }
      }
      
      loadWeightData();
      setNewWeight('');
      setNotes('');
      setSuccess(t('weight.recordSaved', { defaultValue: 'Poids enregistré !' }));
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || t('weight.errorSaving', { defaultValue: 'Erreur lors de l\'enregistrement' }));
    }
  };
  
  const handleDeleteRecord = (id) => {
    try {
      deleteWeightRecord(id);
      loadWeightData();
      setSuccess(t('weight.recordDeleted', { defaultValue: 'Enregistrement supprimé' }));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(t('weight.errorDeleting', { defaultValue: 'Erreur lors de la suppression' }));
    }
  };
  
  const chartData = weightRecords.map(record => ({
    date: format(new Date(record.date), 'dd/MM/yy'),
    poids: record.weight,
    référence: record.weight > 10 ? Math.floor(record.weight / 10) * 10 : null
  }));
  
  const formatDate = (dateString) => {
    const locale = i18n.language === 'fr' ? fr : undefined;
    return format(new Date(dateString), 'dd MMM yyyy', { locale });
  };
  
  return (
    <div className="weight-tracker">
      <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <Scale size={28} color="var(--vermilion)" />
        {t('weight.title', { defaultValue: 'Suivi de Poids' })}
      </h2>
      
      {/* Formulaire d'ajout de poids */}
      <div className="weight-form-container">
        <form onSubmit={handleAddWeight} className="weight-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="weight">{t('weight.weightKg', { defaultValue: 'Poids (kg)' })}</label>
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
              <label htmlFor="notes">{t('weight.notes', { defaultValue: 'Notes (Optionnel)' })}</label>
              <input
                type="text"
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="À jeun, après le sport..."
              />
            </div>
          </div>
          
          <button type="submit" className="add-weight-btn">
            {t('weight.add', { defaultValue: 'Enregistrer mon poids' })}
          </button>
        </form>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>
      
      {/* Statistiques de poids */}
      {stats.current && (
        <div className="weight-stats">
          <div className="stat-card current-weight">
            <div className="stat-title">{t('weight.currentWeight', { defaultValue: 'Poids Actuel' })}</div>
            <div className="stat-value">{stats.current.weight} <span style={{ fontSize: '1rem', color: '#71717a' }}>kg</span></div>
            <div className="stat-date">{formatDate(stats.current.date)}</div>
          </div>
          
          {stats.initial && stats.current.id !== stats.initial.id && (
            <div className={`stat-card weight-change ${stats.change <= 0 ? 'positive' : 'negative'}`}>
              <div className="stat-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {stats.change <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                {t('weight.evolution', { defaultValue: 'Évolution' })}
              </div>
              <div className="stat-value">
                {stats.change > 0 ? '+' : ''}
                {stats.change.toFixed(1)} <span style={{ fontSize: '1rem', color: 'inherit' }}>kg</span>
              </div>
              <div className="stat-percentage">
                {stats.change > 0 ? '+' : ''}
                {stats.changePercentage.toFixed(1)}%
              </div>
            </div>
          )}
          
          <div className="stat-card min-max">
            <div className="min-weight">
              <span className="stat-label">{t('weight.min', { defaultValue: 'Minimum' })}</span>
              <span className="stat-value">{stats.lowestRecord.weight} kg</span>
            </div>
            <div style={{ width: '1px', height: '100%', background: 'rgba(255,255,255,0.1)' }}></div>
            <div className="max-weight">
              <span className="stat-label">{t('weight.max', { defaultValue: 'Maximum' })}</span>
              <span className="stat-value">{stats.highestRecord.weight} kg</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Graphique d'évolution */}
      {weightRecords.length > 0 ? (
        <div className="weight-chart">
          <h3>
            <Activity size={20} color="var(--vermilion)" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {t('weight.chart', { defaultValue: 'Évolution Graphique' })}
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} dy={10} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(20, 20, 22, 0.9)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '12px',
                  color: '#fff',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="poids" 
                stroke="var(--vermilion)" 
                activeDot={{ r: 6, fill: 'var(--vermilion)', stroke: '#fff', strokeWidth: 2 }} 
                strokeWidth={3}
                dot={{ r: 3, fill: '#18181b', stroke: 'var(--vermilion)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="no-weight-data">
          <Scale size={40} color="rgba(255,255,255,0.2)" style={{ marginBottom: '16px' }} />
          <p>{t('weight.noData', { defaultValue: 'Aucune donnée disponible.' })}</p>
          <p>{t('weight.startTracking', { defaultValue: 'Enregistrez votre premier poids !' })}</p>
        </div>
      )}
      
      {/* Historique des enregistrements */}
      {weightRecords.length > 0 && (
        <div className="weight-history">
          <h3>{t('weight.history', { defaultValue: 'Historique des Pesées' })}</h3>
          <GoogleFitSyncButton
            getUnsyncedCount={() => getUnsyncedWeights().length}
            onSync={syncAllWeights}
            noun="pesée"
            nounPlural="pesées"
          />
          <div className="weight-records-list">
            {weightRecords.slice().reverse().map(record => (
              <div key={record.id} className="weight-record">
                <div className="record-info">
                  <div className="record-weight">{record.weight} <span style={{ fontSize: '0.9rem', color: '#71717a', fontWeight: 600 }}>kg</span></div>
                  <div className="record-date">{formatDate(record.date)}</div>
                  {record.notes && <div className="record-notes">{record.notes}</div>}
                </div>
                <div className="record-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GoogleFitItemButton
                    synced={isSyncedWithGoogleFit('weight', record.id)}
                    onSync={() => syncWeightToGoogleFit(record)}
                    title="Synchroniser cette pesée avec Google Fit"
                  />
                  <button
                    className="delete-record"
                    onClick={() => handleDeleteRecord(record.id)}
                    aria-label="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <EncouragementModal 
        isOpen={showEncouragement}
        onClose={() => setShowEncouragement(false)}
        weightIncrease={weightIncrease}
      />
    </div>
  );
}

export default WeightTracker;
