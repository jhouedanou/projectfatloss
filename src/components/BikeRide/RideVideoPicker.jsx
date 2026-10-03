import React, { useMemo, useState } from 'react';
import {
  RIDE_VIDEOS,
  thumbUrl,
  formatVideoDuration,
  parseYoutubeId,
  looks360,
  loadCustomVideos,
  saveCustomVideos,
  fetchVideoTitle,
} from '../../data/rideVideos';

const ALL = 'Tous';
const FILTER_360 = '360°';
const MINE = 'Mes vidéos';
/** Vitesse de référence par défaut d'une vidéo ajoutée : allure de balade. */
const DEFAULT_REF_SPEED = 20;

/**
 * Choix du parcours : vignette, titre, chaîne et durée.
 * Tri par durée (croissant par défaut) pour choisir d'abord selon le temps
 * qu'on a. Les vidéos signalées comme non lisibles en embed (`unavailableIds`)
 * sortent de la liste pour la session en cours.
 *
 * Un lien YouTube collé ajoute la vidéo à « Mes vidéos », gardées sur
 * l'appareil. Une vidéo 360° se reconnaît à son titre, ou se coche à la main.
 */
export default function RideVideoPicker({ selectedId, onSelect, unavailableIds = [] }) {
  const [custom, setCustom] = useState(() => loadCustomVideos());
  const [channel, setChannel] = useState(ALL);
  const [ascending, setAscending] = useState(true);
  const [link, setLink] = useState('');
  const [link360, setLink360] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [adding, setAdding] = useState(false);

  const allVideos = useMemo(() => [...custom, ...RIDE_VIDEOS], [custom]);

  const filters = useMemo(() => {
    const names = Array.from(new Set(RIDE_VIDEOS.map((video) => video.channel)));
    return [ALL, FILTER_360, ...(custom.length ? [MINE] : []), ...names];
  }, [custom.length]);

  const matchesFilter = (video) => {
    if (channel === ALL) return true;
    if (channel === FILTER_360) return !!video.is360;
    if (channel === MINE) return !!video.custom;
    return video.channel === channel;
  };

  const videos = allVideos
    .filter((video) => !unavailableIds.includes(video.id) && matchesFilter(video))
    .sort((a, b) => {
      // Mes vidéos d'abord (durée souvent inconnue), puis tri par durée.
      if (!!a.custom !== !!b.custom) return a.custom ? -1 : 1;
      return ascending ? a.durationSec - b.durationSec : b.durationSec - a.durationSec;
    });

  const updateCustom = (next) => {
    setCustom(next);
    saveCustomVideos(next);
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    setLinkError('');
    const id = parseYoutubeId(link);
    if (!id) {
      setLinkError('Lien YouTube non reconnu. Exemple : https://www.youtube.com/watch?v=…');
      return;
    }
    const existing = allVideos.find((video) => video.id === id);
    if (existing) {
      onSelect(existing);
      setLink('');
      return;
    }
    setAdding(true);
    const meta = await fetchVideoTitle(id);
    setAdding(false);
    const title = meta?.title || 'Ma vidéo YouTube';
    const video = {
      id,
      title,
      channel: meta?.channel || 'YouTube',
      durationSec: 0,
      refSpeedKmh: DEFAULT_REF_SPEED,
      is360: link360 || looks360(title),
      custom: true,
    };
    updateCustom([video, ...custom]);
    onSelect(video);
    setLink('');
    setLink360(false);
  };

  const handleRemove = (id) => {
    updateCustom(custom.filter((video) => video.id !== id));
    if (selectedId === id) onSelect(RIDE_VIDEOS[0]);
  };

  return (
    <div className="ride-picker">
      <form className="ride-link-form" onSubmit={handleAdd}>
        <label className="ride-link-label" htmlFor="ride-link-input">
          Coller un lien YouTube
        </label>
        <div className="ride-link-row">
          <input
            id="ride-link-input"
            className="ride-link-input"
            type="url"
            inputMode="url"
            placeholder="https://www.youtube.com/watch?v=…"
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              setLinkError('');
            }}
          />
          <button type="submit" className="ride-btn ride-btn-primary ride-link-add" disabled={!link.trim() || adding}>
            {adding ? '…' : 'Ajouter'}
          </button>
        </div>
        <label className="ride-hr-toggle">
          <input type="checkbox" checked={link360} onChange={(e) => setLink360(e.target.checked)} />
          <span>Vidéo à 360° (détectée toute seule si le titre contient « 360 »)</span>
        </label>
        {linkError && <p className="ride-error">{linkError}</p>}
      </form>

      <div className="ride-picker-filters">
        {filters.map((name) => (
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
          <div key={video.id} className="ride-card-wrap">
            <button
              type="button"
              className={`ride-card ${selectedId === video.id ? 'is-selected' : ''}`}
              onClick={() => onSelect(video)}
            >
              <span className="ride-card-media">
                <img className="ride-card-thumb" src={thumbUrl(video.id)} alt="" loading="lazy" />
                {video.is360 && <span className="ride-card-360">360°</span>}
                {video.durationSec > 0 && (
                  <span className="ride-card-duration">{formatVideoDuration(video.durationSec)}</span>
                )}
              </span>
              <span className="ride-card-body">
                <span className="ride-card-title">{video.title}</span>
                <span className="ride-card-meta">
                  {video.channel} · réf. {video.refSpeedKmh} km/h
                </span>
              </span>
            </button>
            {video.custom && (
              <button
                type="button"
                className="ride-card-remove"
                onClick={() => handleRemove(video.id)}
                aria-label={`Retirer ${video.title}`}
                title="Retirer de mes vidéos"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {videos.length === 0 && <p className="ride-empty">Aucun parcours disponible.</p>}
      </div>
    </div>
  );
}
