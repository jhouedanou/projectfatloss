/**
 * Comptage de répétitions par vision avec MediaPipe Pose Landmarker.
 *
 * - loadPoseLandmarker() : charge (une seule fois) le modèle en mode VIDEO.
 * - createRepEngine(pattern) : machine à états qui transforme un flux de
 *   landmarks en répétitions, selon un patron de mouvement (RepPatternRules).
 *
 * Tout tourne en local dans le navigateur (aucune image envoyée sur le réseau).
 * Le WASM et le modèle sont chargés depuis le CDN au premier usage puis mis en
 * cache par le navigateur / service worker.
 */

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
      });
    try {
      return await build('GPU');
    } catch (e) {
      return await build('CPU');
    }
  })();
  return landmarkerPromise;
}

/**
 * Angle (en degrés) au point b formé par a-b-c. Points {x,y}.
 */
function angleAt(a, b, c) {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const dot = abx * cbx + aby * cby;
  const magAb = Math.hypot(abx, aby);
  const magCb = Math.hypot(cbx, cby);
  if (magAb === 0 || magCb === 0) return null;
  let cos = dot / (magAb * magCb);
  cos = Math.max(-1, Math.min(1, cos));
  return (Math.acos(cos) * 180) / Math.PI;
}

const MIN_VISIBILITY = 0.3;

/** Visibilité moyenne d'un triplet de landmarks. */
function tripletVisibility(lm, [a, b, c]) {
  const v = (i) => (lm[i] && typeof lm[i].visibility === 'number' ? lm[i].visibility : 1);
  return (v(a) + v(b) + v(c)) / 3;
}

/**
 * Crée un moteur de comptage pour un patron donné.
 * @param {{pattern: Object, joint: {left:number[], right:number[]}}} rule
 * @returns {{ push: (landmarks: any[]) => boolean, angle: number|null, reset: () => void }}
 */
export function createRepEngine(rule) {
  const { pattern, joint } = rule;
  let seenOpposite = false; // a-t-on atteint l'extrême opposé depuis la dernière rep ?
  let lastAngle = null;

  const engine = {
    angle: null,
    reset() {
      seenOpposite = false;
      lastAngle = null;
      engine.angle = null;
    },
    /**
     * Traite une frame de landmarks, renvoie true si une rep vient d'être validée.
     */
    push(landmarks) {
      if (!landmarks || landmarks.length < 29) return false;
      // Choisir le côté le plus visible
      const visL = tripletVisibility(landmarks, joint.left);
      const visR = tripletVisibility(landmarks, joint.right);
      const side = visR > visL ? joint.right : joint.left;
      if (Math.max(visL, visR) < MIN_VISIBILITY) return false;

      const [ia, ib, ic] = side;
      const ang = angleAt(landmarks[ia], landmarks[ib], landmarks[ic]);
      if (ang === null) return false;
      // Lissage léger pour réduire le bruit
      lastAngle = lastAngle === null ? ang : lastAngle * 0.5 + ang * 0.5;
      engine.angle = Math.round(lastAngle);

      if (pattern.countOn === 'extend') {
        // Rep validée en revenant déplié, après être passé par le replié
        if (lastAngle < pattern.flexAngle) seenOpposite = true;
        if (lastAngle > pattern.extAngle && seenOpposite) {
          seenOpposite = false;
          return true;
        }
      } else {
        // countOn === 'flex' : rep validée au point replié, après le déplié
        if (lastAngle > pattern.extAngle) seenOpposite = true;
        if (lastAngle < pattern.flexAngle && seenOpposite) {
          seenOpposite = false;
          return true;
        }
      }
      return false;
    },
  };
  return engine;
}
