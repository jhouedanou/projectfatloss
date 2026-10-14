import React from 'react';
import { formatDuration } from './BikeHud';

const fmt = (value, digits = 0) => (value == null ? '--' : Number(value).toFixed(digits));

/** Récapitulatif de fin de ride, avant enregistrement en séance cardio. */
export default function RideSummary({
  metrics,
  routes = [],
  goalSec = null,
  calorieLabel = '',
  onSave,
  onDiscard,
  saveLabel = 'Enregistrer et continuer',
}) {
  const goalRow = goalSec
    ? [
        'Objectif',
        metrics.elapsedSec >= goalSec
          ? `${formatDuration(goalSec)} — atteint`
          : `${formatDuration(metrics.elapsedSec)} sur ${formatDuration(goalSec)}`,
      ]
    : null;

  const rows = [
    ['Durée', formatDuration(metrics.elapsedSec)],
    goalRow,
    ['Distance', `${fmt(metrics.distanceKm, 2)} km`],
    [calorieLabel ? `Calories (${calorieLabel})` : 'Calories', `${fmt(metrics.calories)} kcal`],
    ['Vitesse moyenne', `${fmt(metrics.avgSpeedKmh, 1)} km/h`],
    ['Vitesse max', `${fmt(metrics.maxSpeedKmh, 1)} km/h`],
    ['Puissance moyenne', metrics.avgWatts == null ? '--' : `${fmt(metrics.avgWatts)} W`],
    ['FC moyenne', metrics.avgBpm == null ? '--' : `${fmt(metrics.avgBpm)} bpm`],
  ].filter(Boolean);

  return (
    <div className="ride-summary">
      <h2 className="ride-summary-title">Sortie terminée</h2>
      {routes.length > 0 && (
        <p className="ride-summary-sub">
          {routes.length > 1 ? `${routes.length} parcours : ` : ''}
          {routes.join(' · ')}
        </p>
      )}

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
          {saveLabel}
        </button>
        <button type="button" className="ride-btn ride-btn-ghost" onClick={onDiscard}>
          Ne pas enregistrer
        </button>
      </div>
    </div>
  );
}
