/**
 * Confort d'écran pendant la sortie : plein écran et écran maintenu allumé.
 *
 * Les deux sont best-effort — un refus du navigateur ou de la WebView ne doit
 * jamais interrompre la sortie. `enter()` doit être appelé depuis un geste
 * utilisateur (bouton « Démarrer »), sinon le plein écran est refusé.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const requestFs = (el) =>
  el.requestFullscreen?.() || el.webkitRequestFullscreen?.() || Promise.reject(new Error('non supporté'));

const exitFs = () =>
  document.exitFullscreen?.() || document.webkitExitFullscreen?.() || Promise.resolve();

const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);

export default function useRideScreen() {
  const [fullscreen, setFullscreen] = useState(false);
  const wakeLockRef = useRef(null);

  // Le plein écran peut être quitté par la touche Échap : suivre l'état réel.
  useEffect(() => {
    const onChange = () => setFullscreen(isFs());
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  const requestWakeLock = useCallback(async () => {
    try {
      if (!navigator.wakeLock || wakeLockRef.current) return;
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      wakeLockRef.current.addEventListener?.('release', () => {
        wakeLockRef.current = null;
      });
    } catch (error) {
      /* verrou refusé : l'écran s'éteindra normalement */
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    try {
      wakeLockRef.current?.release?.();
    } catch (error) {
      /* rien à libérer */
    }
    wakeLockRef.current = null;
  }, []);

  // Le verrou saute quand l'onglet passe en arrière-plan : le reprendre au retour.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && wakeLockRef.current === null) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [requestWakeLock]);

  /** À appeler depuis le geste utilisateur qui démarre la sortie. */
  const enter = useCallback(
    async (element) => {
      requestWakeLock();
      if (!element || isFs()) return;
      try {
        await requestFs(element);
        setFullscreen(true);
      } catch (error) {
        /* plein écran refusé : la sortie continue en fenêtré */
      }
    },
    [requestWakeLock]
  );

  const leave = useCallback(async () => {
    releaseWakeLock();
    if (!isFs()) return;
    try {
      await exitFs();
    } catch (error) {
      /* sortie de plein écran best-effort */
    }
    setFullscreen(false);
  }, [releaseWakeLock]);

  const toggle = useCallback(
    (element) => (isFs() ? leave() : enter(element)),
    [enter, leave]
  );

  useEffect(() => () => releaseWakeLock(), [releaseWakeLock]);

  return { fullscreen, enter, leave, toggle };
}
