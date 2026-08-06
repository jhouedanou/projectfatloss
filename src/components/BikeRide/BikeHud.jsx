import React from 'react';
import { Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { getUserWeight } from '../../services/CalorieEstimator';

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

const FTP_KEY = 'ride_ftp_watts';
/** FTP par défaut d'un cycliste loisir — ajustable via localStorage (ride_ftp_watts). */
const DEFAULT_FTP = 150;

export const getFtp = () => {
  try {
    const stored = Number(localStorage.getItem(FTP_KEY));
    return Number.isFinite(stored) && stored >= 50 && stored <= 500 ? stored : DEFAULT_FTP;
  } catch (error) {
    return DEFAULT_FTP;
  }
};

/**
 * Zones de puissance, découpage standard (Coggan, repris par Zwift) en % FTP :
 * Z1 récupération < 60 %, Z2 endurance 60-75, Z3 tempo 76-89, Z4 seuil 90-104,
 * Z5 VO2max 105-118, Z6 anaérobie ≥ 119. Les couleurs suivent la convention
 * gris / bleu / vert / jaune / orange / rouge affichée par Zwift.
 */
const POWER_ZONES = [
  { max: 0.6, name: 'Z1', label: 'Récup', color: '#9CA3AF' },
  { max: 0.76, name: 'Z2', label: 'Endurance', color: '#3B82F6' },
  { max: 0.9, name: 'Z3', label: 'Tempo', color: '#22C55E' },
  { max: 1.05, name: 'Z4', label: 'Seuil', color: '#EAB308' },
  { max: 1.19, name: 'Z5', label: 'VO2max', color: '#F97316' },
  { max: Infinity, name: 'Z6', label: 'Anaérobie', color: '#EF4444' },
];

export const powerZone = (watts, ftp) => {
  if (watts == null || !ftp) return null;
  const ratio = watts / ftp;
  return POWER_ZONES.find((zone) => ratio < zone.max) || POWER_ZONES[POWER_ZONES.length - 1];
};

/** Métrique secondaire avec sa valeur moyenne (ou max) en sous-titre. */
function Metric({ value, digits = 0, unit, sub }) {
  return (
    <div className="ride-metric">
      <div className="ride-metric-col">
        <span className="ride-metric-value">{fmt(value, digits)}</span>
        {sub != null && <span className="ride-metric-sub">{sub}</span>}
      </div>
      <span className="ride-metric-unit">{unit}</span>
    </div>
  );
}

/**
 * Overlay de télémétrie posé sur la vidéo, calqué sur les codes des apps de
 * home-trainer (Zwift, Kinomap) : puissance en héros colorée par zone, W/kg,
 * métriques secondaires avec leurs moyennes, et rangée durée/distance/kcal.
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
  const ftp = getFtp();
  const zone = powerZone(metrics.watts, ftp);
  const weight = getUserWeight();
  const wattsPerKg = metrics.watts != null && weight ? metrics.watts / weight : null;

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
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <button
          type="button"
          className="ride-hud-icon"
          onClick={onToggleFullscreen}
          aria-pressed={fullscreen}
          aria-label={fullscreen ? 'Quitter le plein écran' : 'Passer en plein écran'}
          title={fullscreen ? 'Quitter le plein écran' : 'Passer en plein écran'}
        >
          {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
        <button type="button" className="ride-hud-finish" onClick={onFinish}>
          Terminer
        </button>
      </div>

      <div className="ride-hud-main">
        <div className="ride-metric ride-metric-hero">
          <span
            className="ride-metric-value"
            style={zone ? { color: zone.color } : undefined}
          >
            {fmt(metrics.watts)}
          </span>
          <div className="ride-hero-side">
            <span className="ride-metric-unit">watts</span>
            {zone && (
              <span className="ride-zone-badge" style={{ background: zone.color }}>
                {zone.name} · {zone.label}
              </span>
            )}
            {wattsPerKg != null && (
              <span className="ride-metric-sub">{wattsPerKg.toFixed(1)} W/kg</span>
            )}
            {metrics.avgWatts != null && (
              <span className="ride-metric-sub">moy {fmt(metrics.avgWatts)} · max {fmt(metrics.maxWatts)}</span>
            )}
          </div>
        </div>
        <div className="ride-metric-row">
          <Metric
            value={metrics.speedKmh}
            digits={1}
            unit="km/h"
            sub={metrics.avgSpeedKmh ? `moy ${fmt(metrics.avgSpeedKmh, 1)}` : null}
          />
          <Metric
            value={metrics.bpm}
            unit="bpm"
            sub={metrics.avgBpm != null ? `moy ${fmt(metrics.avgBpm)}` : null}
          />
          <Metric value={metrics.cadence} unit="tr/min" />
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
