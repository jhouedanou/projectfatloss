import React from 'react';
import { formatDuration } from './BikeHud';

const fmt = (value, digits = 0) => (value == null ? '--' : Number(value).toFixed(digits));

/** Récapitulatif de fin de ride, avant enregistrement en séance cardio. */
export default function RideSummary({ metrics, videoTitle, onSave, onDiscard }) {
  const rows = [
    ['Durée', formatDuration(metrics.elapsedSec)],
    ['Distance', `${fmt(metrics.distanceKm, 2)} km`],
    ['Calories', `${fmt(metrics.calories)} kcal`],
    ['Vitesse moyenne', `${fmt(metrics.avgSpeedKmh, 1)} km/h`],
    ['Vitesse max', `${fmt(metrics.maxSpeedKmh, 1)} km/h`],
    ['Puissance moyenne', metrics.avgWatts == null ? '--' : `${fmt(metrics.avgWatts)} W`],
    ['FC moyenne', metrics.avgBpm == null ? '--' : `${fmt(metrics.avgBpm)} bpm`],
  ];

  return (
    <div className="ride-summary">
      <h2 className="ride-summary-title">Sortie terminée</h2>
      <p className="ride-summary-sub">{videoTitle}</p>

      <div className="ride-summary-grid">
        {rows.map(([label, value]) => (
          <div key={label} className="ride-summary-row">
            <span className="ride-summary-label">{label}</span>
            <span className="ride-summary-value">{value}</span>
          </div>
        ))}
      </div>

      <div className="ride-actions">
        <button type="button" className="ride-btn ride-btn-primary" onClick={onSave}>
          Enregistrer et continuer
        </button>
        <button type="button" className="ride-btn ride-btn-ghost" onClick={onDiscard}>
          Ne pas enregistrer
        </button>
      </div>
    </div>
  );
}
