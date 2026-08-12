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
import { releaseDetectedHandle } from '../../services/bike/detectBike';
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
  // Handle BLE déjà connecté par l'écran de détection : le réutiliser évite de
  // rouvrir le sélecteur Bluetooth au démarrage. Le vélo n'accepte qu'une
  // connexion à la fois et sort du mode appairage une fois associé — sans ce
  // relais, « Démarrer la sortie » redemande une association impossible.
  const detectedHandleRef = useRef(null);

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
    // Détection reprise mais sortie jamais démarrée : libérer la console,
    // sinon elle reste occupée par une connexion fantôme.
    if (detectedHandleRef.current) {
      releaseDetectedHandle({ handle: detectedHandleRef.current });
      detectedHandleRef.current = null;
    }
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
      // Handle repris de la détection : consommé une seule fois. S'il est
      // devenu inutilisable (console éteinte entre-temps), on repasse par le
      // sélecteur plutôt que d'échouer.
      const handle = source === 'sim' ? null : detectedHandleRef.current;
      if (source === 'sim') {
        bike = new SimulationAdapter();
      } else if (source === 'ftms') {
        const { default: FtmsAdapter } = await import('../../services/bike/adapters/FtmsAdapter');
        bike = new FtmsAdapter();
        setStatus(handle ? 'Reprise de la connexion au vélo…' : 'Sélectionne ton vélo dans la fenêtre Bluetooth…');
      } else {
        const { default: DomyosAdapter } = await import('../../services/bike/adapters/DomyosAdapter');
        bike = new DomyosAdapter();
        setStatus(
          handle
            ? 'Reprise de la connexion à la console…'
            : 'Sélectionne la console Domyos dans la fenêtre Bluetooth…'
        );
      }

      bike.onDisconnect?.(() => setConnected(false));
      try {
        await bike.start(handle ? { handle } : undefined);
      } catch (reuseError) {
        if (!handle) throw reuseError;
        // Le handle mémorisé ne répond plus : on l'abandonne et on retente
        // proprement par le sélecteur système.
        detectedHandleRef.current = null;
        setStatus('Connexion perdue — sélectionne à nouveau ton vélo…');
        await bike.start();
      }
      detectedHandleRef.current = null;
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

  // Racine UNIQUE et toujours montée, quelle que soit la phase — c'est
  // l'élément qui passe en plein écran. Si chaque phase rendait son propre
  // <div>, React démonterait l'élément plein écran au changement de phase :
  // le navigateur quitterait alors le plein écran de lui-même (et l'affiche
  // via un toast), y compris juste après un démarrage réussi de la sortie.
  const rootClass = `ride-root ${phase === 'riding' ? 'ride-root-riding' : 'ride-root-panel'}`;

  let content;
  if (phase === 'riding') {
    content = (
      <>
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
      </>
    );
  } else if (phase === 'detect') {
    content = (
      <BikeDetectScreen
        onBack={() => setPhase('setup')}
        onUseSource={(nextSource, hasHeartRate, handle) => {
          setSource(nextSource);
          if (hasHeartRate) setHrEnabled(true);
          detectedHandleRef.current = handle || null;
          setStatus(
            `${nextSource === 'ftms' ? 'FTMS' : 'Domyos'} détecté et connecté — appuie sur « Démarrer la sortie ».`
          );
          setPhase('setup');
        }}
      />
    );
  } else if (phase === 'summary') {
    content = (
      <RideSummary
        metrics={metrics}
        videoTitle={video.title}
        onSave={handleSave}
        onDiscard={() => onFinish(null)}
      />
    );
  } else {
    content = (
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
    );
  }

  return (
    <div className={rootClass} ref={rootRef}>
      {content}
    </div>
  );
}
