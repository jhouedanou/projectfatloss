/**
 * Comptage de répétitions par vision avec MediaPipe Pose Landmarker.
 *
 * - loadPoseLandmarker() : charge (une seule fois) le modèle en mode VIDEO.
 * - createRepEngine(rule) : machine à états qui transforme un flux de landmarks
 *   en répétitions, selon un patron de mouvement (RepPatternRules).
 *
 * Points clés de la détection :
 *  - les ANGLES sont calculés sur les `worldLandmarks` 3D (repère métrique
 *    centré bassin). Sur la projection 2D, l'angle d'un coude ou d'un genou
 *    dépend de l'orientation du corps face à la caméra : c'est la principale
 *    source de faux comptages sur les mouvements de charge (développé, rowing,
 *    presse) où le membre sort du plan image ;
 *  - les mesures purement verticales (haussement d'épaules, inclinaison
 *    latérale) restent en 2D image, normalisées par la longueur du torse ;
 *  - le signal est filtré (médiane 3 + lissage exponentiel) puis validé par une
 *    machine à états avec hystérésis, durée minimale de demi-répétition et
 *    période réfractaire, pour éliminer le bruit et les micro-oscillations ;
 *  - le cadrage et la tenue du buste sont contrôlés en continu et renvoyés sous
 *    forme de consigne, et aucune répétition n'est comptée hors cadrage.
 *
 * Tout tourne en local dans le navigateur (aucune image envoyée sur le réseau).
 * Le WASM et le modèle sont chargés depuis le CDN au premier usage puis mis en
 * cache par le navigateur / service worker.
 */

import {
  LM,
  angleAt,
  checkFraming,
  midpoint,
  torsoScale,
  torsoTilt,
  vis,
} from './PoseLandmarks';

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

let landmarkerPromise = null;

/**
 * Charge le PoseLandmarker (singleton). Réessaie en CPU si le GPU échoue.
 * @returns {Promise<import('@mediapipe/tasks-vision').PoseLandmarker>}
 */
export function loadPoseLandmarker() {
  if (landmarkerPromise) return landmarkerPromise;
  landmarkerPromise = (async () => {
    const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision');
    const vision = await FilesetResolver.forVisionTasks(WASM_URL);
    const build = (delegate) =>
      PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputSegmentationMasks: false,
      });
    try {
      return await build('GPU');
    } catch (e) {
      return await build('CPU');
    }
  })();
  return landmarkerPromise;
}

// ---------------------------------------------------------------------------
// Paramètres de validation d'une répétition
// ---------------------------------------------------------------------------

const MIN_VISIBILITY = 0.5;
/** Durée minimale entre l'extrême et la validation (demi-répétition). */
const MIN_HALF_REP_MS = 420;
/** Délai minimal entre deux répétitions validées. */
const REFRACTORY_MS = 320;
/** Nombre de frames consécutives requises pour valider le franchissement. */
const CONFIRM_FRAMES = 2;
/** Fenêtre glissante utilisée pour l'amplitude, l'élan et le choix du côté. */
const WINDOW_MS = 2500;
/** Écart gauche/droite (en unités de la métrique) au-delà duquel on alerte. */
const ASYMMETRY_DEG = 28;
/** Amplitude d'oscillation du buste tolérée sur les mouvements « stricts ». */
const TORSO_SWING_DEG = 14;

/** Frames de repos utilisées pour calibrer les métriques relatives. */
const BASELINE_FRAMES = 20;

export const CUES = {
  framing: (label) => `Cadrez ${label}`,
  noPose: 'Aucune personne détectée',
  partial: 'Amplitude incomplète',
  swing: 'Gardez le buste fixe',
  asymmetry: 'Mouvement asymétrique',
  tooFast: 'Ralentissez le mouvement',
  calibrating: 'Calibration : restez immobile',
};

// ---------------------------------------------------------------------------
// Métriques
// ---------------------------------------------------------------------------

/**
 * Chaque métrique renvoie une valeur scalaire par côté, ou null si le côté
 * n'est pas exploitable. Le patron définit ensuite deux seuils (`min`, `max`)
 * et le sens de comptage.
 */
const METRICS = {
  /** Angle d'une articulation (degrés), en 3D dès que les worldLandmarks existent. */
  angle(ctx, side) {
    const triplet = ctx.joint && ctx.joint[side];
    if (!triplet) return null;
    const [ia, ib, ic] = triplet;
    if (Math.min(vis(ctx.lm, ia), vis(ctx.lm, ib), vis(ctx.lm, ic)) < MIN_VISIBILITY) return null;
    if (ctx.world) return angleAt(ctx.world[ia], ctx.world[ib], ctx.world[ic]);
    // Repli 2D : le z des landmarks normalisés est une profondeur relative peu
    // fiable, on l'écarte plutôt que de fausser l'angle avec.
    const flat = (i) => ({ x: ctx.lm[i].x, y: ctx.lm[i].y, z: 0 });
    return angleAt(flat(ia), flat(ib), flat(ic));
  },

  /**
   * Haussement d'épaule (shrug) : distance verticale oreille → épaule rapportée
   * à la longueur du torse. Diminue quand l'épaule monte.
   */
  shrug(ctx, side) {
    const ear = side === 'left' ? LM.L_EAR : LM.R_EAR;
    const sh = side === 'left' ? LM.L_SHOULDER : LM.R_SHOULDER;
    if (Math.min(vis(ctx.lm, ear), vis(ctx.lm, sh)) < MIN_VISIBILITY) return null;
    if (!ctx.scale) return null;
    return (ctx.lm[sh].y - ctx.lm[ear].y) / ctx.scale;
  },

  /**
   * Inclinaison latérale du buste (side bend), en degrés, valeur absolue :
   * 0 = droit, augmente quand on se penche d'un côté ou de l'autre.
   * Métrique globale — identique pour les deux côtés.
   */
  sideBend(ctx) {
    const tilt = torsoTilt(ctx.lm);
    return tilt === null ? null : Math.abs(tilt);
  },
};

// ---------------------------------------------------------------------------
// Filtrage du signal
// ---------------------------------------------------------------------------

/** Médiane sur 3 échantillons (tue les pics isolés) + lissage exponentiel. */
function createFilter(alpha = 0.4) {
  const buf = [];
  let ema = null;
  return {
    push(v) {
      buf.push(v);
      if (buf.length > 3) buf.shift();
      const sorted = [...buf].sort((a, b) => a - b);
      const med = sorted[Math.floor(sorted.length / 2)];
      ema = ema === null ? med : ema + alpha * (med - ema);
      return ema;
    },
    get value() {
      return ema;
    },
    reset() {
      buf.length = 0;
      ema = null;
    },
  };
}

/** Fenêtre glissante de valeurs horodatées, pour amplitude et élan. */
function createWindow(spanMs = WINDOW_MS) {
  let items = [];
  return {
    push(t, v) {
      items.push({ t, v });
      const cutoff = t - spanMs;
      if (items[0] && items[0].t < cutoff) items = items.filter((it) => it.t >= cutoff);
    },
    /** Amplitude observée sur la fenêtre (0 si moins de 2 points). */
    range() {
      if (items.length < 2) return 0;
      let min = Infinity;
      let max = -Infinity;
      for (const it of items) {
        if (it.v < min) min = it.v;
        if (it.v > max) max = it.v;
      }
      return max - min;
    },
    reset() {
      items = [];
    },
  };
}

// ---------------------------------------------------------------------------
// Moteur de comptage
// ---------------------------------------------------------------------------

/**
 * Crée un moteur de comptage pour un patron donné.
 *
 * @param {Object} rule - Résultat de `getRepPattern()` :
 *   { key, pattern, joint, bilateral }
 * @returns {{
 *   push: (landmarks: any[], worldLandmarks: any[], now: number) => {
 *     rep: boolean, value: number|null, progress: number,
 *     ready: boolean, cue: string|null, armed: boolean
 *   },
 *   reset: () => void,
 *   value: number|null
 * }}
 */
export function createRepEngine(rule) {
  const { pattern, joint } = rule;
  const bilateral = rule.bilateral !== false;
  const metric = METRICS[pattern.metric] || METRICS.angle;
  const countHigh = pattern.countOn === 'max';
  const span = Math.abs(pattern.max - pattern.min) || 1;

  const filter = createFilter(pattern.smoothing ?? 0.4);
  const window = createWindow();
  const sideWindows = { left: createWindow(), right: createWindow() };
  const tiltWindow = createWindow();

  let armed = false;
  let armedAt = 0;
  let extreme = null;
  let lastRepAt = 0;
  let confirm = 0;
  let activeSide = null;
  let lastCue = null;
  // Métriques relatives : position de repos mesurée sur les premières frames.
  let baseline = pattern.relative ? null : 0;
  const baselineBuf = [];

  /** Valeur brute de la métrique + diagnostic gauche/droite. */
  function sample(ctx, now) {
    if (pattern.metric === 'sideBend') {
      const v = metric(ctx);
      return { value: v, asym: null };
    }
    const left = metric(ctx, 'left');
    const right = metric(ctx, 'right');
    if (left !== null) sideWindows.left.push(now, left);
    if (right !== null) sideWindows.right.push(now, right);

    if (left === null && right === null) return { value: null, asym: null };
    if (left === null) return { value: right, asym: null };
    if (right === null) return { value: left, asym: null };

    const asym = Math.abs(left - right);
    if (bilateral) {
      // Les deux membres travaillent : la moyenne est bien plus stable qu'un
      // choix de côté qui bascule d'une frame à l'autre.
      return { value: (left + right) / 2, asym };
    }
    // Unilatéral : suivre le membre qui bouge réellement. On ne change de côté
    // que si l'autre est nettement plus actif, pour éviter les allers-retours.
    const rangeL = sideWindows.left.range();
    const rangeR = sideWindows.right.range();
    if (!activeSide) activeSide = rangeR > rangeL ? 'right' : 'left';
    const current = activeSide === 'left' ? rangeL : rangeR;
    const other = activeSide === 'left' ? rangeR : rangeL;
    if (other > current * 1.5 && other > span * 0.25) {
      activeSide = activeSide === 'left' ? 'right' : 'left';
    }
    return { value: activeSide === 'left' ? left : right, asym };
  }

  const engine = {
    value: null,
    reset() {
      filter.reset();
      window.reset();
      sideWindows.left.reset();
      sideWindows.right.reset();
      tiltWindow.reset();
      armed = false;
      armedAt = 0;
      extreme = null;
      lastRepAt = 0;
      confirm = 0;
      activeSide = null;
      lastCue = null;
      baseline = pattern.relative ? null : 0;
      baselineBuf.length = 0;
      engine.value = null;
    },

    /**
     * Traite une frame. `landmarks` = coordonnées image normalisées,
     * `worldLandmarks` = coordonnées métriques 3D (optionnelles mais fortement
     * recommandées : les angles y sont bien plus justes).
     */
    push(landmarks, worldLandmarks, now) {
      const idle = { rep: false, value: engine.value, progress: 0, ready: false, cue: lastCue, armed };

      if (!landmarks || landmarks.length < 33) {
        lastCue = CUES.noPose;
        return { ...idle, cue: lastCue };
      }

      // 1. Cadrage : on ne compte rien tant que la posture n'est pas exploitable.
      const framing = checkFraming(landmarks, pattern.framing, MIN_VISIBILITY);
      if (!framing.ok) {
        // Le mouvement est perdu : on désarme pour ne pas valider une rep
        // fabriquée par la réapparition du corps dans le cadre.
        armed = false;
        extreme = null;
        confirm = 0;
        lastCue = CUES.framing(framing.label);
        return { ...idle, cue: lastCue };
      }

      const ctx = {
        lm: landmarks,
        world: worldLandmarks && worldLandmarks.length >= 33 ? worldLandmarks : null,
        joint,
        scale: torsoScale(landmarks),
      };

      const { value: raw, asym } = sample(ctx, now);
      if (raw === null || Number.isNaN(raw)) {
        lastCue = CUES.framing(framing.label);
        return { ...idle, cue: lastCue };
      }

      // 1 bis. Métriques de déplacement : leur valeur absolue dépend du gabarit
      // et du cadrage, on les rapporte à la position de repos de l'utilisateur.
      if (baseline === null) {
        baselineBuf.push(raw);
        if (baselineBuf.length < BASELINE_FRAMES) {
          lastCue = CUES.calibrating;
          return { ...idle, cue: lastCue };
        }
        const sorted = [...baselineBuf].sort((a, b) => a - b);
        baseline = sorted[Math.floor(sorted.length / 2)];
      }

      const v = filter.push(raw - baseline);
      engine.value = v;
      window.push(now, v);

      const tilt = torsoTilt(landmarks);
      if (tilt !== null) tiltWindow.push(now, tilt);

      // 2. Machine à états avec hystérésis.
      const armThreshold = countHigh ? pattern.min : pattern.max;
      const fireThreshold = countHigh ? pattern.max : pattern.min;
      const atArm = countHigh ? v <= armThreshold : v >= armThreshold;
      const atFire = countHigh ? v >= fireThreshold : v <= fireThreshold;

      if (atArm) {
        if (!armed) {
          armed = true;
          armedAt = now;
          extreme = v;
        }
        extreme = countHigh ? Math.min(extreme, v) : Math.max(extreme, v);
      } else if (armed && extreme !== null) {
        extreme = countHigh ? Math.min(extreme, v) : Math.max(extreme, v);
      }

      let rep = false;
      if (armed && atFire) {
        confirm++;
        if (confirm >= CONFIRM_FRAMES) {
          const halfRepMs = now - armedAt;
          if (halfRepMs < MIN_HALF_REP_MS) {
            // Trop rapide pour être un vrai mouvement : rejet + consigne.
            lastCue = CUES.tooFast;
            armed = false;
            extreme = null;
            confirm = 0;
          } else if (now - lastRepAt < REFRACTORY_MS) {
            armed = false;
            extreme = null;
            confirm = 0;
          } else {
            rep = true;
            lastRepAt = now;
            armed = false;
            extreme = null;
            confirm = 0;
          }
        }
      } else if (!atFire) {
        confirm = 0;
      }

      // 3. Consignes de posture (par ordre de priorité).
      let cue = null;
      if (pattern.strictTorso && tiltWindow.range() > TORSO_SWING_DEG) {
        cue = CUES.swing;
      } else if (bilateral && pattern.metric === 'angle' && asym !== null && asym > ASYMMETRY_DEG) {
        cue = CUES.asymmetry;
      } else if (!rep && !armed) {
        // L'utilisateur bouge mais n'atteint jamais les deux extrêmes.
        const r = window.range();
        if (r > span * 0.35 && r < span * 0.9 && now - lastRepAt > 1500) cue = CUES.partial;
      }
      lastCue = cue;

      // 4. Progression 0..1 pour la jauge d'amplitude de l'interface.
      const lo = Math.min(pattern.min, pattern.max);
      const hi = Math.max(pattern.min, pattern.max);
      let progress = (v - lo) / (hi - lo);
      progress = Math.max(0, Math.min(1, progress));
      if (!countHigh) progress = 1 - progress;

      return { rep, value: v, progress, ready: true, cue, armed };
    },
  };

  return engine;
}
