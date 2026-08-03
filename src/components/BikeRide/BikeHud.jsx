import React from 'react';

/** mm:ss ou h:mm:ss selon la durée. */
export const formatDuration = (totalSec) => {
  const sec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

const fmt = (value, digits = 0) => (value == null ? '--' : Number(value).toFixed(digits));

/**
 * Overlay de télémétrie posé sur la vidéo.
 * La puissance domine la hiérarchie (c'est la mesure d'effort), le reste est en
 * rang secondaire. Tout est en `tabular-nums` pour que les chiffres ne dansent pas.
 */
export default function BikeHud({
  metrics,
  rate,
  videoPaused,
  sourceLabel,
  connected,
  onFinish,
  videoTitle,
  muted,
  onToggleMute,
  fullscreen,
  onToggleFullscreen,
}) {
  return (
    <div className="ride-hud">
      <div className="ride-hud-top">
        <div className={`ride-chip ${connected ? 'is-live' : 'is-off'}`}>
          <span className="ride-chip-dot" />
          {sourceLabel}
        </div>
        <div className="ride-hud-title">{videoTitle}</div>
        <button
          type="button"
          className="ride-hud-icon"
          onClick={onToggleMute}
          aria-pressed={muted}
          aria-label={muted ? 'Rétablir le son' : 'Couper le son'}
          title={muted ? 'Rétablir le son' : 'Couper le son'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <button
          type="button"
          className="ride-hud-icon"
          onClick={onToggleFullscreen}
          aria-pressed={fullscreen}
          aria-label={fullscreen ? 'Quitter le plein écran' : 'Passer en plein écran'}
          title={fullscreen ? 'Quitter le plein écran' : 'Passer en plein écran'}
        >
          {fullscreen ? '⤢' : '⛶'}
        </button>
        <button type="button" className="ride-hud-finish" onClick={onFinish}>
          Terminer
        </button>
      </div>

      <div className="ride-hud-main">
        <div className="ride-metric ride-metric-hero">
          <span className="ride-metric-value">{fmt(metrics.watts)}</span>
          <span className="ride-metric-unit">watts</span>
        </div>
        <div className="ride-metric-row">
          <div className="ride-metric">
            <span className="ride-metric-value">{fmt(metrics.speedKmh, 1)}</span>
            <span className="ride-metric-unit">km/h</span>
          </div>
          <div className="ride-metric">
            <span className="ride-metric-value">{fmt(metrics.bpm)}</span>
            <span className="ride-metric-unit">bpm</span>
          </div>
          <div className="ride-metric">
            <span className="ride-metric-value">{fmt(metrics.cadence)}</span>
            <span className="ride-metric-unit">tr/min</span>
          </div>
        </div>
      </div>

      <div className="ride-hud-bottom">
        <div className="ride-stat">
          <span className="ride-stat-value">{formatDuration(metrics.elapsedSec)}</span>
          <span className="ride-stat-label">durée</span>
        </div>
        <div className="ride-stat">
          <span className="ride-stat-value">{fmt(metrics.distanceKm, 2)}</span>
          <span className="ride-stat-label">km</span>
        </div>
        <div className="ride-stat">
          <span className="ride-stat-value">{fmt(metrics.calories)}</span>
          <span className="ride-stat-label">kcal</span>
        </div>
        <div className={`ride-stat ride-stat-rate ${videoPaused ? 'is-paused' : ''}`}>
          <span className="ride-stat-value">{videoPaused ? 'pause' : `×${rate}`}</span>
          <span className="ride-stat-label">lecture</span>
        </div>
      </div>

      {videoPaused && (
        <div className="ride-paused-banner">Vidéo en pause — reprends le pédalage</div>
      )}
    </div>
  );
}
