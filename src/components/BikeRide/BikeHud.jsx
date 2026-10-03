import React from 'react';
import { Volume2, VolumeX, Maximize, Minimize, Smartphone, LocateFixed } from 'lucide-react';
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

/** Tuile de métrique en verre dépoli : valeur, unité, sous-valeur. */
function Tile({ label, value, digits = 0, unit, sub, accent }) {
  return (
    <div className="ride-tile" style={accent ? { '--tile-accent': accent } : undefined}>
      <span className="ride-tile-label">{label}</span>
      <span className="ride-tile-value">
        {fmt(value, digits)}
        <span className="ride-tile-unit">{unit}</span>
      </span>
      {sub && <span className="ride-tile-sub">{sub}</span>}
    </div>
  );
}

/** Jauge des 6 zones de puissance, la zone courante allumée. */
function ZoneBar({ zone }) {
  return (
    <div className="ride-zonebar" aria-hidden="true">
      {POWER_ZONES.map((item) => (
        <span
          key={item.name}
          className={`ride-zonebar-seg ${zone?.name === item.name ? 'is-on' : ''}`}
          style={{ background: item.color }}
        />
      ))}
    </div>
  );
}

/**
 * Overlay de télémétrie posé sur la vidéo, dans l'esprit de Kinomap VR : la
 * route reste dégagée au centre, les commandes en haut, un tableau de bord en
 * verre dépoli en bas — puissance colorée par zone, vitesse en héros, cadence,
 * cardio — et une barre de progression du parcours (position dans la vidéo,
 * temps restant à la vitesse de lecture courante).
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
  is360 = false,
  gyro = false,
  onToggleGyro,
  onRecenter,
  progress,
}) {
  const ftp = getFtp();
  const zone = powerZone(metrics.watts, ftp);
  const weight = getUserWeight();
  const wattsPerKg = metrics.watts != null && weight ? metrics.watts / weight : null;

  const duration = progress?.duration || 0;
  const current = Math.min(progress?.current || 0, duration || Infinity);
  const ratio = duration ? current / duration : 0;
  // Temps réel restant : la vidéo défile à `rate`, pas à ×1.
  const remainingSec = duration && rate > 0 ? (duration - current) / rate : null;

  return (
    <div className="ride-hud">
      <div className="ride-hud-top">
        <div className={`ride-chip ${connected ? 'is-live' : 'is-off'}`}>
          <span className="ride-chip-dot" />
          {sourceLabel}
        </div>
        <div className="ride-hud-title">
          {is360 && <span className="ride-hud-360">360°</span>}
          {videoTitle}
        </div>
        {is360 && (
          <>
            <button
              type="button"
              className={`ride-hud-icon ${gyro ? 'is-on' : ''}`}
              onClick={onToggleGyro}
              aria-pressed={gyro}
              aria-label={gyro ? 'Couper le gyroscope' : 'Regarder en bougeant le téléphone'}
              title={gyro ? 'Couper le gyroscope' : 'Regarder en bougeant le téléphone'}
            >
              <Smartphone size={18} />
            </button>
            <button
              type="button"
              className="ride-hud-icon"
              onClick={onRecenter}
              aria-label="Recentrer la vue"
              title="Recentrer la vue"
            >
              <LocateFixed size={18} />
            </button>
          </>
        )}
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

      <div className="ride-dash">
        <div className="ride-dash-tiles">
          <div className="ride-tile ride-tile-power" style={zone ? { '--tile-accent': zone.color } : undefined}>
            <span className="ride-tile-label">
              Puissance{zone && <span className="ride-zone-badge" style={{ background: zone.color }}>
                  {zone.name}<span className="ride-zone-label"> · {zone.label}</span>
                </span>}
            </span>
            <span className="ride-tile-value">
              {fmt(metrics.watts)}
              <span className="ride-tile-unit">W</span>
            </span>
            <ZoneBar zone={zone} />
            <span className="ride-tile-sub">
              {wattsPerKg != null ? `${wattsPerKg.toFixed(1)} W/kg` : ''}
              {metrics.avgWatts != null ? ` · moy ${fmt(metrics.avgWatts)}` : ''}
            </span>
          </div>

          <div className="ride-tile ride-tile-speed">
            <span className="ride-tile-label">Vitesse</span>
            <span className="ride-tile-value">
              {fmt(metrics.speedKmh, 1)}
              <span className="ride-tile-unit">km/h</span>
            </span>
            <span className="ride-tile-sub">
              {metrics.avgSpeedKmh ? `moy ${fmt(metrics.avgSpeedKmh, 1)}` : ''}
              {metrics.maxSpeedKmh ? ` · max ${fmt(metrics.maxSpeedKmh, 1)}` : ''}
            </span>
          </div>

          <Tile label="Cadence" value={metrics.cadence} unit="rpm" />
          <Tile
            label="Cardio"
            value={metrics.bpm}
            unit="bpm"
            accent="#EF4444"
            sub={metrics.avgBpm != null ? `moy ${fmt(metrics.avgBpm)}` : null}
          />
        </div>

        <div className="ride-dash-route">
          <div className="ride-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ratio * 100)} aria-label="Progression du parcours">
            <span className="ride-progress-fill" style={{ width: `${ratio * 100}%` }} />
            <span className="ride-progress-rider" style={{ left: `${ratio * 100}%` }} />
          </div>
          <div className="ride-dash-stats">
            <span className="ride-dash-stat">
              <strong>{formatDuration(metrics.elapsedSec)}</strong> durée
            </span>
            <span className="ride-dash-stat">
              <strong>{fmt(metrics.distanceKm, 2)}</strong> km
            </span>
            <span className="ride-dash-stat">
              <strong>{fmt(metrics.calories)}</strong> kcal
            </span>
            <span className={`ride-dash-stat ride-dash-rate ${videoPaused ? 'is-paused' : ''}`}>
              <strong>{videoPaused ? 'pause' : `×${rate}`}</strong> lecture
            </span>
            {remainingSec != null && (
              <span className="ride-dash-stat ride-dash-remaining">
                <strong>{formatDuration(remainingSec)}</strong> restant
              </span>
            )}
          </div>
        </div>
      </div>

      {videoPaused && (
        <div className="ride-paused-banner">Vidéo en pause — reprends le pédalage</div>
      )}
    </div>
  );
}
