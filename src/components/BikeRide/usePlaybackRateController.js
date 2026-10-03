/**
 * Asservit la vitesse de lecture de la vidéo à la vitesse de pédalage.
 *
 * Chaîne : vitesse lissée (EMA) → ratio vs vitesse de référence de la vidéo →
 * clamp 0,5–2 → quantification sur les paliers réellement acceptés par le
 * player (`getAvailablePlaybackRates`, pas de 0,25 chez YouTube) → hystérésis
 * (un palier doit tenir 2,5 s avant d'être appliqué) → pause de la vidéo en
 * dessous de 3 km/h pendant 3 s, reprise dès le retour au-dessus.
 *
 * L'hystérésis évite que la vidéo change de vitesse à chaque coup de pédale.
 */

import { useEffect, useRef, useState } from 'react';

const EMA_ALPHA = 0.35;
const RATE_MIN = 0.5;
const RATE_MAX = 2;
const HOLD_MS = 2500;
const PAUSE_SPEED_KMH = 3;
const PAUSE_DELAY_MS = 3000;

const nearest = (value, options) =>
  options.reduce((best, option) => (Math.abs(option - value) < Math.abs(best - value) ? option : best), options[0]);

/**
 * @param {Object} params
 * @param {number} params.tick compteur monotone (secondes écoulées). Indispensable :
 *   une vitesse constante — un vélo réel qui renvoie 0,00 à l'arrêt — ne
 *   relancerait pas l'effet, et le délai de mise en pause ne serait jamais réévalué.
 */
export default function usePlaybackRateController({ playerRef, speedKmh, refSpeedKmh, enabled, active, tick }) {
  const [rate, setRate] = useState(1);
  const [videoPaused, setVideoPaused] = useState(false);

  const emaRef = useRef(null);
  const pendingRef = useRef({ rate: null, since: 0 });
  const slowSinceRef = useRef(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    const player = playerRef.current;
    if (!player) return;

    // Pause / reprise : indépendant de l'asservissement de vitesse, actif même
    // quand l'adaptation est désactivée (rester à l'arrêt ne doit pas défiler).
    const now = Date.now();
    const slow = (Number(speedKmh) || 0) < PAUSE_SPEED_KMH;
    if (slow) {
      if (slowSinceRef.current == null) slowSinceRef.current = now;
      if (!pausedRef.current && now - slowSinceRef.current >= PAUSE_DELAY_MS) {
        pausedRef.current = true;
        setVideoPaused(true);
        try {
          player.pauseVideo();
        } catch (error) {
          /* player pas prêt */
        }
      }
    } else {
      slowSinceRef.current = null;
      if (pausedRef.current) {
        pausedRef.current = false;
        setVideoPaused(false);
        try {
          player.playVideo();
        } catch (error) {
          /* player pas prêt */
        }
      }
    }

    if (!enabled || slow) return;

    // Lissage puis quantification sur les paliers du player.
    emaRef.current =
      emaRef.current == null ? speedKmh : EMA_ALPHA * speedKmh + (1 - EMA_ALPHA) * emaRef.current;

    const ratio = emaRef.current / (refSpeedKmh || 22);
    const clamped = Math.min(RATE_MAX, Math.max(RATE_MIN, ratio));

    let available = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    try {
      const fromPlayer = player.getAvailablePlaybackRates?.();
      if (Array.isArray(fromPlayer) && fromPlayer.length) {
        available = fromPlayer.filter((value) => value >= RATE_MIN && value <= RATE_MAX);
      }
    } catch (error) {
      /* paliers par défaut */
    }

    const candidate = nearest(clamped, available);
    if (candidate === rate) {
      pendingRef.current = { rate: null, since: 0 };
      return;
    }
    if (pendingRef.current.rate !== candidate) {
      pendingRef.current = { rate: candidate, since: now };
      return;
    }
    if (now - pendingRef.current.since >= HOLD_MS) {
      pendingRef.current = { rate: null, since: 0 };
      setRate(candidate);
      try {
        player.setPlaybackRate(candidate);
      } catch (error) {
        /* player pas prêt */
      }
    }
  }, [speedKmh, tick, refSpeedKmh, enabled, active, playerRef, rate]);

  return { rate, videoPaused };
}
