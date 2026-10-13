import React, { useCallback, useEffect, useRef, useState } from 'react';
import RideVideoPlayer from './RideVideoPlayer';
import RideVideoPicker from './RideVideoPicker';
import Ride360Layer, { setView } from './Ride360Layer';
import BikeConnectPanel from './BikeConnectPanel';
import BikeDetectScreen from './BikeDetectScreen';
import BikeHud from './BikeHud';
import RideSummary from './RideSummary';
import useBikeMetrics from './useBikeMetrics';
import usePlaybackRateController from './usePlaybackRateController';
import useRideScreen from './useRideScreen';
import { RIDE_VIDEOS, formatVideoDuration, loadCustomVideos } from '../../data/rideVideos';
import SimulationAdapter from '../../services/bike/adapters/SimulationAdapter';
import { detectBike, protocolInfo, releaseDetectedHandle } from '../../services/bike/detectBike';
import { GHOST_STEP_SEC, ghostGapMeters, ghostPositionAt, pickNextVideo } from '../../services/bike/rideSession';
import { loadGhost, saveGhosts } from '../../services/bike/RideStorage';
import './BikeRide.css';

/** Objectifs proposés (minutes) ; null = s'arrêter à la fin du parcours. */
const GOAL_CHOICES = [null, 10, 20, 30, 45, 60];
const TOAST_MS = 6000;

/** Libellé de la source des calories, affiché à côté du total. */
const calorieLabel = (calorieSource, source) => {
  if (calorieSource === 'device') {
    if (source === 'domyos') return 'console EB900';
    if (source === 'ftms') return 'compteur du vélo';
    return 'démo';
  }
  if (calorieSource === 'power') return 'puissance';
  if (calorieSource === 'estimate') return 'estimation';
  return '';
};

/**
 * Séance vélo immersive, dans l'esprit de Kinomap et Fit Immersion : choix du
 * parcours et de la source, objectif de durée, puis vidéo plein écran pilotée
 * par le pédalage — enchaînement des parcours jusqu'à l'objectif, fantôme du
 * meilleur passage — puis récapitulatif.
 *
 * Deux usages :
 *  - `mode="session"` : la séance vélo du jour, lancée depuis la check-list
 *    (objectif = minutes prévues par le plan) ;
 *  - `mode="warmup"` : sortie en ouverture de la séance de musculation.
 *
 * Ne touche jamais aux calories de la séance de musculation : le résultat est
 * remonté au parent, qui l'enregistre comme séance cardio distincte.
 */
export default function BikeRideSession({ dayTitle, onFinish, onSkip, mode = 'warmup', targetMin = null }) {
  const isSession = mode === 'session';
  const [phase, setPhase] = useState('setup');
  const [video, setVideo] = useState(RIDE_VIDEOS[0]);
  // Première vidéo de la sortie : seule celle-ci passe au lecteur, les
  // suivantes sont chargées dans le même lecteur (voir RideVideoPlayer).
  const [startVideo, setStartVideo] = useState(null);
  const [goalMin, setGoalMin] = useState(targetMin || null);
  const [unavailableIds, setUnavailableIds] = useState([]);
  const [source, setSource] = useState('sim');
  const [hrEnabled, setHrEnabled] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [adapter, setAdapter] = useState(null);
  const [hrAdapter, setHrAdapter] = useState(null);
  const [adaptRate, setAdaptRate] = useState(true);
  const [detectingEb900, setDetectingEb900] = useState(false);
  // Gyroscope actif d'office sur téléphone / tablette pour les vidéos 360°.
  const [gyro, setGyro] = useState(() => {
    try {
      return window.matchMedia('(pointer: coarse)').matches;
    } catch (error) {
      return false;
    }
  });
  const [progress, setProgress] = useState({ current: 0, duration: 0, ghostSec: null, ghostGapM: null });
  const [toast, setToast] = useState('');
  const [routes, setRoutes] = useState([]);
  const [ghost, setGhost] = useState(null);
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
  // État lu par les callbacks du lecteur, qui ne doivent pas changer d'identité.
  const phaseRef = useRef(phase);
  const videoRef = useRef(video);
  const metricsRef = useRef(null);
  const rateRef = useRef(1);
  const videoPausedRef = useRef(false);
  const gyroRef = useRef(gyro);
  const goalRef = useRef(goalMin);
  const unavailableRef = useRef(unavailableIds);
  // Parcours en cours (positions relevées pour le fantôme) et parcours finis.
  const segmentRef = useRef(null);
  const segmentsRef = useRef([]);
  const justChainedRef = useRef(false);
  const goalAnnouncedRef = useRef(false);
  const toastTimerRef = useRef(null);
  const finishRideRef = useRef(null);

  phaseRef.current = phase;
  videoRef.current = video;
  gyroRef.current = gyro;
  goalRef.current = goalMin;
  unavailableRef.current = unavailableIds;

  const { fullscreen, enter: enterFullscreen, leave: leaveFullscreen, toggle: toggleFullscreen } = useRideScreen();

  const { metrics, reset: resetMetrics } = useBikeMetrics({ adapter, hrAdapter, running: phase === 'riding' });
  metricsRef.current = metrics;
  const { rate, videoPaused } = usePlaybackRateController({
    playerRef,
    speedKmh: metrics.speedKmh,
    tick: metrics.elapsedSec,
    refSpeedKmh: video?.refSpeedKmh,
    enabled: adaptRate,
    active: phase === 'riding',
  });
  rateRef.current = rate;
  videoPausedRef.current = videoPaused;

  const showToast = useCallback((text) => {
    setToast(text);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(''), TOAST_MS);
  }, []);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  /** Ouvre un parcours : relevés du fantôme à zéro, meilleur passage chargé. */
  const openSegment = useCallback((nextVideo, startElapsed) => {
    segmentRef.current = { videoId: nextVideo.id, startElapsed, positions: [] };
    setGhost(loadGhost(nextVideo.id));
    setRoutes((prev) => [...prev, nextVideo.title]);
  }, []);

  const closeSegment = useCallback(() => {
    if (segmentRef.current) segmentsRef.current.push(segmentRef.current);
    segmentRef.current = null;
  }, []);

  // Chaque tick de métriques (1 s) : position dans la vidéo pour la barre de
  // progression, relevé du fantôme, écart avec le meilleur passage, objectif.
  useEffect(() => {
    if (phase !== 'riding') return;
    const player = playerRef.current;
    if (!player?.getCurrentTime) return;
    // Parcours enchaîné pas encore lancé : le lecteur donne encore la position
    // et la durée de la vidéo précédente, qui fausseraient le fantôme.
    if (justChainedRef.current) return;
    let current = 0;
    let duration = 0;
    try {
      current = player.getCurrentTime() || 0;
      duration = player.getDuration() || video?.durationSec || 0;
    } catch (playerError) {
      return; // player pas prêt
    }

    const segment = segmentRef.current;
    let ghostSec = null;
    let ghostGapM = null;
    if (segment) {
      const onRoute = Math.max(0, metrics.elapsedSec - segment.startElapsed);
      if (Math.floor(onRoute / GHOST_STEP_SEC) >= segment.positions.length) segment.positions.push(current);
      if (ghost) {
        ghostSec = ghostPositionAt(ghost, onRoute);
        ghostGapM = ghostGapMeters(current, ghostSec, video?.refSpeedKmh);
      }
    }
    setProgress({ current, duration, ghostSec, ghostGapM });

    if (goalMin && !goalAnnouncedRef.current && metrics.elapsedSec >= goalMin * 60) {
      goalAnnouncedRef.current = true;
      showToast('Objectif atteint ! Termine ce parcours ou appuie sur « Terminer ».');
    }
  }, [metrics.elapsedSec, phase, video, ghost, goalMin, showToast]);

  /**
   * Fin d'un parcours : sans objectif, ou objectif atteint, la sortie se
   * termine ; sinon le parcours suivant est chargé dans le même lecteur.
   */
  const chainToNext = useCallback(() => {
    const current = videoRef.current;
    const elapsed = metricsRef.current?.elapsedSec || 0;
    const goalSec = goalRef.current ? goalRef.current * 60 : null;
    closeSegment();
    if (!goalSec || elapsed >= goalSec) {
      finishRideRef.current?.();
      return;
    }
    const allVideos = [...loadCustomVideos(), ...RIDE_VIDEOS];
    const next = pickNextVideo(allVideos, {
      currentId: current?.id,
      playedIds: segmentsRef.current.map((segment) => segment.videoId),
      unavailableIds: unavailableRef.current,
      remainingSec: goalSec - elapsed,
    });
    if (!next) {
      finishRideRef.current?.();
      return;
    }
    videoRef.current = next;
    setVideo(next);
    openSegment(next, elapsed);
    justChainedRef.current = true;
    try {
      playerRef.current?.loadVideoById(next.id);
    } catch (playerError) {
      /* player pas prêt */
    }
    showToast(`Parcours suivant : ${next.title}`);
  }, [closeSegment, openSegment, showToast]);

  const handleVideoEnded = useCallback(() => {
    if (phaseRef.current === 'riding') chainToNext();
  }, [chainToNext]);

  // Parcours enchaîné : il démarre à ×1, sans gyroscope, et joue même si le
  // cycliste est à l'arrêt — on lui rend l'état de la sortie.
  const handlePlaying = useCallback(() => {
    if (!justChainedRef.current) return;
    justChainedRef.current = false;
    const player = playerRef.current;
    try {
      if (rateRef.current !== 1) player?.setPlaybackRate(rateRef.current);
      if (videoRef.current?.is360) setView(player, { enableOrientationSensor: gyroRef.current });
      if (videoPausedRef.current) player?.pauseVideo();
    } catch (playerError) {
      /* player pas prêt */
    }
  }, []);

  const handleToggleGyro = useCallback(() => {
    const next = !gyro;
    setGyro(next);
    setView(playerRef.current, { enableOrientationSensor: next });
  }, [gyro]);

  const handleRecenter = useCallback(() => {
    setView(playerRef.current, { yaw: 0, pitch: 0, roll: 0 });
  }, []);

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

  /**
   * Vidéo illisible dans l'app. Au tout début, retour au choix du parcours ;
   * en cours de séance, on passe au parcours suivant.
   */
  const handleUnavailable = useCallback(() => {
    const id = videoRef.current?.id;
    if (!id) return;
    unavailableRef.current = [...unavailableRef.current, id];
    setUnavailableIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    const ridden = (metricsRef.current?.elapsedSec || 0) > 10 || segmentsRef.current.length > 0;
    if (phaseRef.current === 'riding' && ridden) {
      chainToNext();
      return;
    }
    // Retour au choix : le vélo est libéré, « Démarrer » le reconnectera.
    stopAdapters();
    setAdapter(null);
    setHrAdapter(null);
    setConnected(false);
    leaveFullscreen();
    setError('Cette vidéo n\'est pas lisible dans l\'application. Choisis un autre parcours.');
    setPhase('setup');
  }, [chainToNext, stopAdapters, leaveFullscreen]);

  /**
   * Détection en un appui : sélecteur Bluetooth filtré sur « Domyos », puis
   * identification. La console reste connectée pour « Démarrer la sortie ».
   */
  const handleDetectEb900 = useCallback(async () => {
    setError('');
    setStatus('Sélectionne ta console Domyos dans la fenêtre Bluetooth…');
    setDetectingEb900(true);
    try {
      const report = await detectBike({ domyosOnly: true });
      const info = protocolInfo(report);
      if (!info?.source) {
        releaseDetectedHandle(report);
        setStatus('');
        setError(`${info.title} (${report.name}). ${info.body}`);
        return;
      }
      if (detectedHandleRef.current && detectedHandleRef.current !== report.handle) {
        releaseDetectedHandle({ handle: detectedHandleRef.current });
      }
      detectedHandleRef.current = report.handle || null;
      setSource(info.source);
      if (report.hasHeartRate) setHrEnabled(true);
      setStatus(`${info.title} · ${report.name} — connecté, appuie sur « Démarrer la sortie ».`);
    } catch (detectError) {
      const message = detectError?.message || 'Détection impossible.';
      setStatus('');
      // Sélecteur fermé sans choix : pas une erreur.
      if (!/cancel|annul/i.test(message)) setError(message);
    } finally {
      setDetectingEb900(false);
    }
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

      resetMetrics();
      segmentsRef.current = [];
      goalAnnouncedRef.current = false;
      setRoutes([]);
      setStartVideo(video);
      openSegment(video, 0);
      setPhase('riding');
    } catch (startError) {
      setConnected(false);
      setError(startError?.message || 'Connexion impossible.');
      leaveFullscreen();
    }
  }, [source, hrEnabled, video, openSegment, resetMetrics, enterFullscreen, leaveFullscreen]);

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
    closeSegment();
    stopAdapters();
    leaveFullscreen();
    setToast('');
    setPhase('summary');
  }, [closeSegment, stopAdapters, leaveFullscreen]);
  finishRideRef.current = handleFinishRide;

  const handleSave = useCallback(() => {
    saveGhosts(segmentsRef.current);
    onFinish({
      mode,
      durationMin: Math.max(1, Math.round(metrics.elapsedSec / 60)),
      distanceKm: Math.round(metrics.distanceKm * 100) / 100,
      calories: Math.round(metrics.calories),
      calorieSource: metrics.calorieSource,
      avgWatts: metrics.avgWatts == null ? null : Math.round(metrics.avgWatts),
      avgBpm: metrics.avgBpm == null ? null : Math.round(metrics.avgBpm),
      maxSpeedKmh: Math.round(metrics.maxSpeedKmh * 10) / 10,
      targetMin: goalMin,
      videoId: startVideo?.id || video?.id || null,
      videoTitle: routes[0] || video?.title || null,
      routes,
      source,
    });
  }, [metrics, video, startVideo, routes, goalMin, source, mode, onFinish]);

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
          videoId={startVideo.id}
          playerRef={playerRef}
          onUnavailable={handleUnavailable}
          onEnded={handleVideoEnded}
          onPlaying={handlePlaying}
          is360={!!startVideo.is360}
          gyro={gyro}
        />
        {video.is360 && <Ride360Layer playerRef={playerRef} />}
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
          is360={!!video.is360}
          gyro={gyro}
          onToggleGyro={handleToggleGyro}
          onRecenter={handleRecenter}
          progress={progress}
          goalSec={goalMin ? goalMin * 60 : null}
          routeIndex={routes.length}
          calorieLabel={calorieLabel(metrics.calorieSource, source)}
          toast={toast}
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
        routes={routes}
        goalSec={goalMin ? goalMin * 60 : null}
        calorieLabel={calorieLabel(metrics.calorieSource, source)}
        onSave={handleSave}
        onDiscard={() => onFinish(null)}
        saveLabel={isSession ? 'Enregistrer la séance' : 'Enregistrer et continuer'}
      />
    );
  } else {
    content = (
      <div className="ride-setup">
        <header className="ride-setup-head">
          <p className="ride-eyebrow">
            {isSession ? 'Séance vélo du jour' : `Échauffement · ${dayTitle || 'Séance'}`}
          </p>
          <h2 className="ride-setup-title">{isSession ? 'Séance vélo immersive' : 'Sortie vélo'}</h2>
        </header>

        <h3 className="ride-section-title">Objectif</h3>
        <div className="ride-goal-choices" role="radiogroup" aria-label="Objectif de durée">
          {Array.from(new Set([...GOAL_CHOICES, targetMin || null]))
            .sort((a, b) => (a ?? -1) - (b ?? -1))
            .map((minutes) => (
              <button
                key={minutes ?? 'route'}
                type="button"
                role="radio"
                aria-checked={goalMin === minutes}
                className={`ride-filter ${goalMin === minutes ? 'is-active' : ''}`}
                onClick={() => setGoalMin(minutes)}
              >
                {minutes ? `${minutes} min` : 'Fin du parcours'}
                {minutes && minutes === targetMin ? ' · plan' : ''}
              </button>
            ))}
        </div>
        <p className="ride-status">
          {goalMin
            ? `Les parcours s'enchaînent jusqu'à ${goalMin} min ; une fois l'objectif atteint, la sortie s'arrête à la fin du parcours en cours.`
            : 'La sortie s\'arrête à la fin de la vidéo choisie.'}
        </p>

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
          onDetectEb900={handleDetectEb900}
          detectingEb900={detectingEb900}
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
            Sélection : {video.title}
            {video.durationSec > 0 && ` · ${formatVideoDuration(video.durationSec)}`}
            {video.is360 && ' · 360° (glisse ou bouge le téléphone pour regarder autour)'}
            {loadGhost(video.id) && ' · ton meilleur passage roule avec toi (fantôme)'}
          </p>
        )}

        <div className="ride-actions">
          <button type="button" className="ride-btn ride-btn-primary" onClick={handleStart} disabled={!video}>
            Démarrer la sortie
          </button>
          <button type="button" className="ride-btn ride-btn-ghost" onClick={onSkip}>
            {isSession ? 'Retour' : 'Passer et commencer la muscu'}
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
