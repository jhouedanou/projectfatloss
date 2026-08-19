import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, X, AlertTriangle } from 'lucide-react';
import { loadPoseLandmarker, createRepEngine } from '../services/PoseRepCounter';
import { getRepPattern, applyAmplitude } from '../services/RepPatternRules';
import { getCameraAmplitude } from '../services/CameraRepService';
import { POSE_CONNECTIONS, vis } from '../services/PoseLandmarks';
import './WebcamRepCounter.css';

/** Landmarks du visage : non dessinés (bruit visuel, aucun intérêt pour la posture). */
const FACE_MAX_INDEX = 6;
/** Visibilité minimale pour dessiner un point ou un segment. */
const DRAW_MIN_VISIBILITY = 0.5;

/**
 * Compteur de répétitions par webcam pour un exercice.
 *
 * L'aperçu affiche le squelette détecté par MediaPipe, la consigne de posture
 * en cours et une jauge d'amplitude : l'utilisateur voit ce que le modèle voit,
 * et pourquoi une répétition n'est pas comptée (cadrage, amplitude, élan).
 *
 * Props :
 *  - exo         : exercice courant (pour déterminer le patron de mouvement)
 *  - currentRep  : nombre de reps déjà comptées (affichage)
 *  - targetReps  : objectif (nbRep)
 *  - onRep       : appelé à chaque répétition détectée
 *  - onClose     : ferme la caméra
 *  - resetKey    : toute valeur qui change remet le compteur à zéro sans
 *                  redémarrer la caméra (ex. passage au second côté d'un
 *                  exercice unilatéral : le membre suivi change)
 */
export default function WebcamRepCounter({ exo, currentRep = 0, targetReps = 0, onRep, onClose, resetKey = null }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const engineRef = useRef(null);
  const lastFrameTimeRef = useRef(-1);
  const onRepRef = useRef(onRep);
  onRepRef.current = onRep;

  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const [cue, setCue] = useState(null);
  const [progress, setProgress] = useState(0);
  const [tracking, setTracking] = useState(false);
  const [flash, setFlash] = useState(false);
  // Amplitude choisie au lancement de la séance (dialog caméra) : borne
  // « difficile » du patron relâchée pour compter les reps partielles.
  const amplitude = getCameraAmplitude();

  /**
   * Projette les landmarks normalisés sur le canvas en tenant compte du
   * recadrage `object-fit: cover` de la vidéo, puis dessine le squelette.
   * Le canvas porte la même symétrie CSS que la vidéo : aucune conversion de
   * coordonnées à faire pour le miroir.
   */
  const draw = useCallback((landmarks, ok) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    if (!landmarks) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;
    const scale = Math.max(w / vw, h / vh);
    const dw = vw * scale;
    const dh = vh * scale;
    const ox = (w - dw) / 2;
    const oy = (h - dh) / 2;
    const px = (p) => [ox + p.x * dw, oy + p.y * dh];

    const color = ok ? '#30d158' : '#FFB300';
    ctx.lineWidth = Math.max(2, 3 * dpr);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    for (const [a, b] of POSE_CONNECTIONS) {
      if (vis(landmarks, a) < DRAW_MIN_VISIBILITY || vis(landmarks, b) < DRAW_MIN_VISIBILITY) continue;
      const [x1, y1] = px(landmarks[a]);
      const [x2, y2] = px(landmarks[b]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    const r = Math.max(3, 4 * dpr);
    for (let i = FACE_MAX_INDEX + 1; i < landmarks.length; i++) {
      if (vis(landmarks, i) < DRAW_MIN_VISIBILITY) continue;
      const [x, y] = px(landmarks[i]);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const rule = getRepPattern(exo);
    if (!rule) {
      setStatus('error');
      setErrorMsg("Cet exercice n'est pas comptable par la caméra.");
      return;
    }
    engineRef.current = createRepEngine({
      ...rule,
      pattern: applyAmplitude(rule.pattern, getCameraAmplitude()),
    });
    lastFrameTimeRef.current = -1;

    async function start() {
      try {
        // 0. Contexte sécurisé requis par getUserMedia (HTTPS ou localhost)
        if (!window.isSecureContext) {
          setStatus('error');
          setErrorMsg("La caméra exige HTTPS. Ouvrez l'app en https:// ou localhost.");
          return;
        }
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setStatus('error');
          setErrorMsg('Caméra non supportée par ce navigateur.');
          return;
        }
        // 1. Caméra — contraintes minimales pour éviter OverconstrainedError
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        video.srcObject = stream;
        // play() peut rejeter sur iOS hors geste utilisateur : non bloquant,
        // le flux est déjà attaché (autorisation accordée).
        try {
          await video.play();
        } catch (playErr) {
          /* lecture reprise automatiquement par l'élément vidéo */
        }

        // 2. Modèle de pose (peut prendre quelques secondes au 1er lancement)
        const landmarker = await loadPoseLandmarker();
        if (cancelled) return;
        setStatus('ready');

        // 3. Boucle de détection
        const loop = () => {
          if (cancelled) return;
          rafRef.current = requestAnimationFrame(loop);
          const v = videoRef.current;
          if (!v || v.readyState < 2 || !v.videoWidth) return;
          // Une seule inférence par frame vidéo réellement nouvelle.
          if (v.currentTime === lastFrameTimeRef.current) return;
          lastFrameTimeRef.current = v.currentTime;

          try {
            // detectForVideo exige des horodatages strictement croissants ;
            // performance.now() l'est, y compris entre deux montages du
            // composant qui partagent le même landmarker (singleton).
            const res = landmarker.detectForVideo(v, performance.now());
            const lm = res && res.landmarks && res.landmarks[0];
            const world = res && res.worldLandmarks && res.worldLandmarks[0];
            if (!lm) {
              setTracking(false);
              setCue('Aucune personne détectée');
              draw(null, false);
              return;
            }
            const state = engineRef.current.push(lm, world, performance.now());
            draw(lm, state.ready && !state.cue);
            setTracking(state.ready);
            setCue(state.cue);
            setProgress(state.progress);
            if (state.rep && onRepRef.current) {
              onRepRef.current();
              setFlash(true);
              setTimeout(() => setFlash(false), 220);
            }
          } catch (e) {
            // frame ignorée en cas d'erreur ponctuelle de détection
          }
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (e) {
        if (cancelled) return;
        setStatus('error');
        const name = e && e.name;
        let msg;
        if (name === 'NotAllowedError') msg = 'Accès à la caméra refusé. Autorisez-la dans le navigateur.';
        else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') msg = 'Aucune caméra détectée.';
        else if (name === 'NotReadableError') msg = 'Caméra déjà utilisée par une autre application.';
        else msg = `Impossible d'ouvrir la caméra${name ? ` (${name})` : ''}.`;
        setErrorMsg(msg);
      }
    }
    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
    // On ne relance que si l'exercice change (nom)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exo?.name, draw]);

  // Remise à zéro de la machine à états sans couper le flux vidéo : le côté
  // actif détecté, la ligne de base et l'armement du mouvement repartent de
  // zéro pour le nouveau membre.
  useEffect(() => {
    if (resetKey === null) return;
    if (engineRef.current) engineRef.current.reset();
  }, [resetKey]);

  const live = status === 'ready';

  return (
    <div className="webcam-rep-counter">
      <div className={`wrc-video-wrap${flash ? ' wrc-flash' : ''}`}>
        <video ref={videoRef} className="wrc-video" playsInline muted autoPlay />
        <canvas ref={canvasRef} className="wrc-overlay-canvas" />
        <button className="wrc-close" onClick={onClose} aria-label="Fermer la caméra">
          <X size={18} />
        </button>

        {live && (
          <div className="wrc-count-badge">
            <Camera size={14} />
            <span>
              {currentRep}
              {targetReps ? ` / ${targetReps}` : ''}
            </span>
          </div>
        )}


        {status === 'loading' && (
          <div className="wrc-overlay-msg">Chargement du modèle…</div>
        )}

        {status === 'error' && (
          <div className="wrc-overlay-msg wrc-error">
            <AlertTriangle size={20} />
            <span>{errorMsg}</span>
          </div>
        )}

        {live && (
          <div className="wrc-amplitude" aria-hidden="true">
            <div className="wrc-amplitude-fill" style={{ height: `${Math.round(progress * 100)}%` }} />
          </div>
        )}

        {live && cue && (
          <div className="wrc-cue">
            <AlertTriangle size={14} />
            <span>{cue}</span>
          </div>
        )}
      </div>
      {live && (
        <p className={`wrc-hint${tracking && !cue ? ' wrc-hint-ok' : ''}`}>
          {tracking && !cue
            ? 'Posture détectée — le comptage est actif.'
            : 'Placez-vous de profil, corps entier visible dans le cadre.'}
          {amplitude !== 'full' ? ' Amplitude réduite : reps partielles comptées.' : ''}
        </p>
      )}
    </div>
  );
}
