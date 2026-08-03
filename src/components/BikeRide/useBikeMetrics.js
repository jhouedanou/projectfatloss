/**
 * Agrège le flux d'un adapter vélo en état de séance : distance intégrée,
 * moyennes, maxima, chrono et calories.
 *
 * Le hook ne connaît rien du transport : il consomme l'interface commune des
 * adapters (`onMetrics`, `start`, `stop`). Une source cardio secondaire
 * (ceinture) peut être branchée : son BPM prime sur celui du vélo.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getUserWeight } from '../../services/CalorieEstimator';

/** MET vélo stationnaire vigoureux, utilisé quand la puissance est inconnue. */
const BIKE_MET = 7.0;
const TICK_MS = 1000;

const initialState = {
  speedKmh: 0,
  cadence: null,
  watts: null,
  bpm: null,
  distanceKm: 0,
  calories: 0,
  elapsedSec: 0,
  avgSpeedKmh: 0,
  avgWatts: null,
  avgBpm: null,
  maxSpeedKmh: 0,
  maxWatts: null,
};

export default function useBikeMetrics({ adapter, hrAdapter = null, running }) {
  const [metrics, setMetrics] = useState(initialState);

  const liveRef = useRef({ speedKmh: 0, cadence: null, watts: null, bpm: null, kcalTotal: null });
  const strapBpmRef = useRef(null);
  const accRef = useRef({
    distanceKm: 0,
    calories: 0,
    elapsedSec: 0,
    speedSum: 0,
    wattsSum: 0,
    wattsCount: 0,
    bpmSum: 0,
    bpmCount: 0,
    maxSpeedKmh: 0,
    maxWatts: 0,
    deviceKcalBase: null,
  });
  const weightRef = useRef(getUserWeight());

  const reset = useCallback(() => {
    accRef.current = {
      distanceKm: 0,
      calories: 0,
      elapsedSec: 0,
      speedSum: 0,
      wattsSum: 0,
      wattsCount: 0,
      bpmSum: 0,
      bpmCount: 0,
      maxSpeedKmh: 0,
      maxWatts: 0,
      deviceKcalBase: null,
    };
    liveRef.current = { speedKmh: 0, cadence: null, watts: null, bpm: null, kcalTotal: null };
    setMetrics(initialState);
  }, []);

  // Abonnement aux sources : le vélo, puis la ceinture qui écrase le BPM.
  useEffect(() => {
    if (!adapter) return undefined;
    const unsubscribe = adapter.onMetrics((sample) => {
      liveRef.current = { ...liveRef.current, ...sample };
    });
    return unsubscribe;
  }, [adapter]);

  useEffect(() => {
    if (!hrAdapter) return undefined;
    const unsubscribe = hrAdapter.onMetrics((sample) => {
      if (sample.bpm != null) strapBpmRef.current = sample.bpm;
    });
    return unsubscribe;
  }, [hrAdapter]);

  // Boucle d'agrégation à 1 Hz — indépendante de la cadence d'émission BLE,
  // pour que distance et calories restent cohérentes quelle que soit la source.
  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => {
      const live = liveRef.current;
      const acc = accRef.current;
      const speed = Number(live.speedKmh) || 0;
      const bpm = strapBpmRef.current != null ? strapBpmRef.current : live.bpm;

      acc.elapsedSec += 1;
      acc.distanceKm += speed / 3600;
      acc.speedSum += speed;
      if (speed > acc.maxSpeedKmh) acc.maxSpeedKmh = speed;

      if (live.watts != null) {
        acc.wattsSum += live.watts;
        acc.wattsCount += 1;
        if (live.watts > acc.maxWatts) acc.maxWatts = live.watts;
      }
      if (bpm != null) {
        acc.bpmSum += bpm;
        acc.bpmCount += 1;
      }

      // Calories : compteur de la console si disponible (delta depuis le début),
      // sinon puissance mesurée, sinon MET × poids tant que ça pédale.
      if (live.kcalTotal != null) {
        if (acc.deviceKcalBase == null) acc.deviceKcalBase = live.kcalTotal;
        acc.calories = Math.max(0, live.kcalTotal - acc.deviceKcalBase);
      } else if (live.watts != null) {
        acc.calories += (live.watts * 3.6) / 3600;
      } else if (speed > 1) {
        acc.calories += ((BIKE_MET * 3.5 * weightRef.current) / 200) / 60;
      }

      setMetrics({
        speedKmh: speed,
        cadence: live.cadence,
        watts: live.watts,
        bpm,
        distanceKm: acc.distanceKm,
        calories: acc.calories,
        elapsedSec: acc.elapsedSec,
        avgSpeedKmh: acc.speedSum / acc.elapsedSec,
        avgWatts: acc.wattsCount ? acc.wattsSum / acc.wattsCount : null,
        avgBpm: acc.bpmCount ? acc.bpmSum / acc.bpmCount : null,
        maxSpeedKmh: acc.maxSpeedKmh,
        maxWatts: acc.wattsCount ? acc.maxWatts : null,
      });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [running]);

  return { metrics, reset };
}
