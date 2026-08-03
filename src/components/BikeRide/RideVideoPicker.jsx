import React, { useMemo, useState } from 'react';
import { RIDE_VIDEOS, thumbUrl, formatVideoDuration } from '../../data/rideVideos';

/**
 * Choix du parcours : vignette, titre, chaîne et durée.
 * Tri par durée (croissant par défaut) pour choisir d'abord selon le temps
 * qu'on a. Les vidéos signalées comme non lisibles en embed (`unavailableIds`)
 * sortent de la liste pour la session en cours.
 */
export default function RideVideoPicker({ selectedId, onSelect, unavailableIds = [] }) {
  const channels = useMemo(
    () => ['Tous', ...Array.from(new Set(RIDE_VIDEOS.map((video) => video.channel)))],
    []
  );
  const [channel, setChannel] = useState('Tous');
  const [ascending, setAscending] = useState(true);

  const videos = useMemo(
    () =>
      RIDE_VIDEOS.filter(
        (video) => !unavailableIds.includes(video.id) && (channel === 'Tous' || video.channel === channel)
      ).sort((a, b) => (ascending ? a.durationSec - b.durationSec : b.durationSec - a.durationSec)),
    [channel, ascending, unavailableIds]
  );

  return (
    <div className="ride-picker">
      <div className="ride-picker-filters">
        {channels.map((name) => (
          <button
            key={name}
            type="button"
            className={`ride-filter ${channel === name ? 'is-active' : ''}`}
            onClick={() => setChannel(name)}
          >
            {name}
          </button>
        ))}
        <button
          type="button"
          className="ride-filter ride-filter-sort"
          onClick={() => setAscending((value) => !value)}
          aria-label="Inverser le tri par durée"
        >
          Durée {ascending ? '↑' : '↓'}
        </button>
      </div>

      <div className="ride-picker-grid">
        {videos.map((video) => (
          <button
            key={video.id}
            type="button"
            className={`ride-card ${selectedId === video.id ? 'is-selected' : ''}`}
            onClick={() => onSelect(video)}
          >
            <span className="ride-card-media">
              <img className="ride-card-thumb" src={thumbUrl(video.id)} alt="" loading="lazy" />
              <span className="ride-card-duration">{formatVideoDuration(video.durationSec)}</span>
            </span>
            <span className="ride-card-body">
              <span className="ride-card-title">{video.title}</span>
              <span className="ride-card-meta">
                {video.channel} · réf. {video.refSpeedKmh} km/h
              </span>
            </span>
          </button>
        ))}
        {videos.length === 0 && <p className="ride-empty">Aucun parcours disponible.</p>}
      </div>
    </div>
  );
}
