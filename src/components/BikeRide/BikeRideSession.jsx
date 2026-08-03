import React, { useCallback, useEffect, useRef, useState } from 'react';
import RideVideoPlayer from './RideVideoPlayer';
import RideVideoPicker from './RideVideoPicker';
import BikeConnectPanel from './BikeConnectPanel';
import BikeDetectScreen from './BikeDetectScreen';
import BikeHud from './BikeHud';
import RideSummary from './RideSummary';
import useBikeMetrics from './useBikeMetrics';
import usePlaybackRateController from './usePlaybackRateController';
import useRideScreen from './useRideScreen';
import { RIDE_VIDEOS, formatVideoDuration } from '../../data/rideVideos';
import SimulationAdapter from '../../services/bike/adapters/SimulationAdapter';
import './BikeRide.css';

/**
 * Écran de sortie vélo qui ouvre la séance : choix du parcours et de la source,
 * puis vidéo plein écran pilotée par le pédalage, puis récapitulatif.
 *
 * Ne touche jamais aux calories de la séance de musculation : le résultat est
 * remonté au parent, qui l'enregistre comme séance cardio distincte.
 */
export default function BikeRideSession({ dayTitle, onFinish, onSkip }) {
  const [phase, setPhase] = useState('setup');
  const [video, setVideo] = useState(RIDE_VIDEOS[0]);
  const [unavailableIds, setUnavailableIds] = useState([]);
  const [source, setSource] = useState('sim');
  const [hrEnabled, setHrEnabled] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [adapter, setAdapter] = useState(null);
  const [hrAdapter, setHrAdapter] = useState(null);
  const [adaptRate, setAdaptRate] = useState(true);
  // Toujours muet au démarrage : voir RideVideoPlayer.
  const [muted, setMuted] = useState(true);

  const playerRef = useRef(null);
  const adapterRef = useRef(null);
  const hrAdapterRef = useRef(null);
  const rootRef = useRef(null);

  const { fullscreen, enter: enterFullscreen, leave: leaveFullscreen, toggle: toggleFullscreen } = useRideScreen();

  const { metrics } = useBikeMetrics({ adapter, hrAdapter, running: phase === 'riding' });
  const { rate, videoPaused } = usePlaybackRateController({
    playerRef,
    speedKmh: metrics.speedKmh,
    tick: metrics.elapsedSec,
    refSpeedKmh: video?.refSpeedKmh,
    enabled: adaptRate,
    active: phase === 'riding',
  });

  const stopAdapters = useCallback(() => {
    adapterRef.current?.stop();
    hrAdapterRef.current?.stop();
    adapterRef.current = null;
    hrAdapterRef.current = null;
  }, []);

  useEffect(() => stopAdapters, [stopAdapters]);

  const handleUnavailable = useCallback((id) => {
    setUnavailableIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setError('Cette vidéo n\'est pas lisible dans l\'application. Choisis un autre parcours.');
    setPhase('setup');
  }, []);

  const handleStart = useCallback(async () => {
    setError('');
    setStatus('');
    // Demandé ici, dans le geste utilisateur : après un await, le navigateur
    // refuserait le plein écran.
    enterFullscreen(rootRef.current);
    try {
      let bike;
      if (source === 'sim') {
        bike = new SimulationAdapter();
      } else if (source === 'ftms') {
        const { default: FtmsAdapter } = await import('../../services/bike/adapters/FtmsAdapter');
        bike = new FtmsAdapter();
        setStatus('Sélectionne ton vélo dans la fenêtre Bluetooth…');
      } else {
        const { default: DomyosAdapter } = await import('../../services/bike/adapters/DomyosAdapter');
        bike = new DomyosAdapter();
        setStatus('Sélectionne la console Domyos dans la fenêtre Bluetooth…');
      }

      bike.onDisconnect?.(() => setConnected(false));
      await bike.start();
      adapterRef.current = bike;
      setAdapter(bike);
      setConnected(true);

      if (hrEnabled) {
        try {
          const { default: HeartRateAdapter } = await import('../../services/bike/adapters/HeartRateAdapter');
          const strap = new HeartRateAdapter();
          await strap.start();
          hrAdapterRef.current = strap;
          setHrAdapter(strap);
        } catch (hrError) {
          // Une ceinture absente ne doit pas empêcher la sortie.
          setStatus('Ceinture cardio non connectée — la sortie continue sans.');
        }
      }

      setPhase('riding');
    } catch (startError) {
      setConnected(false);
      setError(startError?.message || 'Connexion impossible.');
      leaveFullscreen();
    }
  }, [source, hrEnabled, enterFullscreen, leaveFullscreen]);

  const handleToggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    try {
      if (next) playerRef.current?.mute();
      else playerRef.current?.unMute();
    } catch (error) {
      /* player pas prêt */
    }
  }, [muted]);

  const handleFinishRide = useCallback(() => {
    try {
      playerRef.current?.pauseVideo();
    } catch (playerError) {
      /* player pas prêt */
    }
    stopAdapters();
    leaveFullscreen();
    setPhase('summary');
  }, [stopAdapters, leaveFullscreen]);

  const handleSave = useCallback(() => {
    onFinish({
      durationMin: Math.max(1, Math.round(metrics.elapsedSec / 60)),
      distanceKm: Math.round(metrics.distanceKm * 100) / 100,
      calories: Math.round(metrics.calories),
      avgWatts: metrics.avgWatts == null ? null : Math.round(metrics.avgWatts),
      avgBpm: metrics.avgBpm == null ? null : Math.round(metrics.avgBpm),
      maxSpeedKmh: Math.round(metrics.maxSpeedKmh * 10) / 10,
      videoId: video?.id || null,
      videoTitle: video?.title || null,
      source,
    });
  }, [metrics, video, source, onFinish]);

  // Une seule racine pour toutes les phases : c'est elle qui passe en plein
  // écran. Si chaque phase avait son propre élément, le navigateur quitterait
  // le plein écran dès que l'élément concerné sort du DOM.
  const rootClass = `ride-root ${phase === 'riding' ? 'ride-root-riding' : 'ride-root-panel'}`;

  if (phase === 'riding') {
    return (
      <div className={rootClass} ref={rootRef}>
        <RideVideoPlayer
          videoId={video.id}
          playerRef={playerRef}
          onUnavailable={handleUnavailable}
        />
        <BikeHud
          metrics={metrics}
          rate={rate}
          videoPaused={videoPaused}
          sourceLabel={adapterRef.current?.label || 'Source'}
          connected={connected}
          videoTitle={video.title}
          muted={muted}
          onToggleMute={handleToggleMute}
          fullscreen={fullscreen}
          onToggleFullscreen={() => toggleFullscreen(rootRef.current)}
          onFinish={handleFinishRide}
        />
      </div>
    );
  }

  if (phase === 'detect') {
    return (
      <div className={rootClass} ref={rootRef}>
        <BikeDetectScreen
          onBack={() => setPhase('setup')}
          onUseSource={(nextSource, hasHeartRate) => {
            setSource(nextSource);
            if (hasHeartRate) setHrEnabled(true);
            setStatus(`Source réglée sur ${nextSource === 'ftms' ? 'FTMS' : 'Domyos'} après détection.`);
            setPhase('setup');
          }}
        />
      </div>
    );
  }

  if (phase === 'summary') {
    return (
      <div className={rootClass} ref={rootRef}>
        <RideSummary
          metrics={metrics}
          videoTitle={video.title}
          onSave={handleSave}
          onDiscard={() => onFinish(null)}
        />
      </div>
    );
  }

  return (
    <div className={rootClass} ref={rootRef}>
      <div className="ride-setup">
        <header className="ride-setup-head">
          <p className="ride-eyebrow">Échauffement · {dayTitle || 'Séance'}</p>
          <h2 className="ride-setup-title">Sortie vélo</h2>
        </header>

        <h3 className="ride-section-title">Parcours</h3>
        <RideVideoPicker
          selectedId={video?.id}
          onSelect={setVideo}
          unavailableIds={unavailableIds}
        />

        <BikeConnectPanel
          source={source}
          onSourceChange={setSource}
          hrEnabled={hrEnabled}
          onHrToggle={setHrEnabled}
          status={status}
          error={error}
          onDetect={() => setPhase('detect')}
        />

        <label className="ride-hr-toggle">
          <input type="checkbox" checked={adaptRate} onChange={(e) => setAdaptRate(e.target.checked)} />
          <span>Adapter la vitesse de lecture au pédalage</span>
        </label>

        <p className="ride-status">
          La vidéo démarre sans son — c'est la seule façon dont un navigateur la lance tout seul.
          Le bouton 🔊 en haut de l'écran rétablit le son pendant la sortie.
        </p>

        {video && (
          <p className="ride-status">
            Sélection : {video.title} · {formatVideoDuration(video.durationSec)}
          </p>
        )}

        <div className="ride-actions">
          <button type="button" className="ride-btn ride-btn-primary" onClick={handleStart} disabled={!video}>
            Démarrer la sortie
          </button>
          <button type="button" className="ride-btn ride-btn-ghost" onClick={onSkip}>
            Passer et commencer la muscu
          </button>
        </div>
      </div>
    </div>
  );
}
