import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, AlertTriangle } from 'lucide-react';
import { loadPoseLandmarker, createRepEngine } from '../services/PoseRepCounter';
import { getRepPattern } from '../services/RepPatternRules';
import './WebcamRepCounter.css';

/**
 * Compteur de répétitions par webcam pour un exercice.
 *
 * Props :
 *  - exo         : exercice courant (pour déterminer le patron de mouvement)
 *  - currentRep  : nombre de reps déjà comptées (affichage)
 *  - targetReps  : objectif (nbRep)
 *  - onRep       : appelé à chaque répétition détectée
 *  - onClose     : ferme la caméra
 */
export default function WebcamRepCounter({ exo, currentRep = 0, targetReps = 0, onRep, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const engineRef = useRef(null);
  const lastTsRef = useRef(-1);
  const onRepRef = useRef(onRep);
  onRepRef.current = onRep;

  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const [angle, setAngle] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const rule = getRepPattern(exo);
    if (!rule) {
      setStatus('error');
      setErrorMsg("Cet exercice n'est pas comptable par la caméra.");
      return;
    }
    engineRef.current = createRepEngine(rule);

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
        // 1. Caméra
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();

        // 2. Modèle de pose (peut prendre quelques secondes au 1er lancement)
        const landmarker = await loadPoseLandmarker();
        if (cancelled) return;
        setStatus('ready');

        // 3. Boucle de détection
        const loop = () => {
          if (cancelled) return;
          const v = videoRef.current;
          if (v && v.readyState >= 2 && v.currentTime !== lastTsRef.current) {
            lastTsRef.current = v.currentTime;
            try {
              const ts = performance.now();
              const res = landmarker.detectForVideo(v, ts);
              const lm = res && res.landmarks && res.landmarks[0];
              if (lm) {
                const isRep = engineRef.current.push(lm);
                setAngle(engineRef.current.angle);
                if (isRep && onRepRef.current) onRepRef.current();
              }
            } catch (e) {
              // frame ignorée en cas d'erreur ponctuelle de détection
            }
          }
          rafRef.current = requestAnimationFrame(loop);
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
  }, [exo?.name]);

  return (
    <div className="webcam-rep-counter">
      <div className="wrc-video-wrap">
        <video ref={videoRef} className="wrc-video" playsInline muted />
        <button className="wrc-close" onClick={onClose} aria-label="Fermer la caméra">
          <X size={18} />
        </button>

        {status === 'ready' && (
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

        {status === 'ready' && angle !== null && (
          <div className="wrc-angle">{angle}°</div>
        )}
      </div>
      {status === 'ready' && (
        <p className="wrc-hint">Placez-vous de profil, corps entier visible.</p>
      )}
    </div>
  );
}
