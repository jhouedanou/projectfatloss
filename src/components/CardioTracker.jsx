import React, { useState, useEffect } from 'react';
import { Footprints, Bike, Flame, Trash2, Plus, Clock, MapPin } from 'lucide-react';
import {
  getCardioSessions,
  addCardioSession,
  deleteCardioSession,
  getCardioStats,
} from '../services/CardioStorage';
import { getWeightHistory } from '../services/WeightStorage';
import GoogleFitSyncButton from './GoogleFitSyncButton';
import GoogleFitItemButton from './GoogleFitItemButton';
import {
  getUnsyncedCardio,
  syncAllCardio,
  syncCardioToGoogleFit,
  isSyncedWithGoogleFit
} from '../services/GoogleFitSync';
import './CardioTracker.css';

// MET approximatifs : marche d'un bon pas et vélo stationnaire modéré-vigoureux.
// La marche est suivie comme un exercice à part entière, distinct du vélo.
const MET = { walk: 3.5, bike: 7.5 };

const estimateCalories = (type, durationMin, weightKg) => {
  if (!durationMin) return '';
  const w = weightKg || 75;
  return Math.round(MET[type] * w * (durationMin / 60));
};

const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });
};

const CardioTracker = () => {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [type, setType] = useState('bike');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [touchedCalories, setTouchedCalories] = useState(false);

  const refresh = () => {
    setSessions(getCardioSessions());
    setStats(getCardioStats());
  };

  useEffect(() => { refresh(); }, []);

  // Auto-estime les calories tant que l'utilisateur n'y a pas touché
  useEffect(() => {
    if (!touchedCalories) {
      const weight = getWeightHistory().slice(-1)[0]?.weight;
      const est = estimateCalories(type, Number(duration), weight);
      setCalories(est === '' ? '' : String(est));
    }
  }, [type, duration, touchedCalories]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!duration && !calories && !distance) return;
    addCardioSession({
      type,
      duration: duration ? Number(duration) : null,
      distance: distance ? Number(distance) : null,
      calories: calories ? Number(calories) : null,
    });
    setDuration(''); setDistance(''); setCalories(''); setTouchedCalories(false);
    refresh();
  };

  const handleDelete = (id) => {
    deleteCardioSession(id);
    refresh();
  };

  return (
    <div className="cardio-tracker">
      <h2 className="cardio-title">Cardio — Vélo &amp; Marche</h2>

      {stats && (
        <div className="cardio-stats">
          <div className="cardio-stat">
            <Flame size={18} color="#F03D32" />
            <div><strong>{Math.round(stats.totalCalories)}</strong><span>kcal brûlées</span></div>
          </div>
          <div className="cardio-stat">
            <Bike size={18} color="#0a84ff" />
            <div><strong>{stats.byType.bike.count}</strong><span>séances vélo</span></div>
          </div>
          <div className="cardio-stat">
            <Footprints size={18} color="#30d158" />
            <div><strong>{stats.byType.walk.count}</strong><span>marches</span></div>
          </div>
        </div>
      )}

      <form className="cardio-form" onSubmit={handleAdd}>
        {/* Choix de l'exercice : vélo ou marche, suivis séparément */}
        <div className="cardio-type-switch" role="radiogroup" aria-label="Type d'exercice cardio">
          <button
            type="button"
            role="radio"
            aria-checked={type === 'bike'}
            className={`cardio-type-btn ${type === 'bike' ? 'is-active' : ''}`}
            onClick={() => setType('bike')}
          >
            <Bike size={16} /> Vélo
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={type === 'walk'}
            className={`cardio-type-btn ${type === 'walk' ? 'is-active is-walk' : ''}`}
            onClick={() => setType('walk')}
          >
            <Footprints size={16} /> Marche
          </button>
        </div>

        <div className="cardio-inputs">
          <label>
            <Clock size={14} /> Durée (min)
            <input type="number" min="0" inputMode="numeric" value={duration}
              onChange={(e) => setDuration(e.target.value)} placeholder="30" />
          </label>
          <label>
            <MapPin size={14} /> Distance (km)
            <input type="number" min="0" step="0.1" inputMode="decimal" value={distance}
              onChange={(e) => setDistance(e.target.value)} placeholder="3.5" />
          </label>
          <label>
            <Flame size={14} /> Calories
            <input type="number" min="0" inputMode="numeric" value={calories}
              onChange={(e) => { setCalories(e.target.value); setTouchedCalories(true); }}
              placeholder="auto" />
          </label>
        </div>

        <button type="submit" className="cardio-add-btn">
          <Plus size={18} /> Enregistrer la séance
        </button>
      </form>

      <GoogleFitSyncButton
        getUnsyncedCount={() => getUnsyncedCardio().length}
        onSync={syncAllCardio}
        noun="séance cardio"
        nounPlural="séances cardio"
      />

      <div className="cardio-list">
        {sessions.length === 0 && <p className="cardio-empty">Aucune séance enregistrée.</p>}
        {sessions.map((s) => (
          <div key={s.id} className={`cardio-item ${s.type}`}>
            <div className="cardio-item-icon">
              {s.type === 'walk' ? <Footprints size={20} /> : <Bike size={20} />}
            </div>
            <div className="cardio-item-main">
              <div className="cardio-item-top">
                <span className="cardio-item-type">{s.type === 'walk' ? 'Marche' : 'Vélo'}</span>
                <span className="cardio-item-date">{fmtDate(s.date)}</span>
              </div>
              <div className="cardio-item-meta">
                {s.duration != null && <span>{s.duration} min</span>}
                {s.distance != null && <span>{s.distance} km</span>}
                {s.calories != null && <span className="cardio-cal">{Math.round(s.calories)} kcal</span>}
              </div>
            </div>
            <GoogleFitItemButton
              synced={isSyncedWithGoogleFit('cardio', s.id)}
              onSync={() => syncCardioToGoogleFit(s)}
              title="Synchroniser cette séance cardio avec Google Fit"
            />
            <button className="cardio-del" onClick={() => handleDelete(s.id)} aria-label="Supprimer">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardioTracker;
