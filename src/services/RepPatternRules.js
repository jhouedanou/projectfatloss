/**
 * Règles de détection de répétitions par vision (webcam + MediaPipe Pose).
 *
 * Le programme contient des centaines d'exercices mais seulement une poignée de
 * PATRONS de mouvement. On classe chaque exercice vers un patron via des
 * mots-clés sur son nom, puis on compte les reps avec une machine à états sur
 * une métrique de posture (angle articulaire 3D, ou déplacement normalisé).
 *
 * Le nom affiché est en français dans le programme livré, mais chaque exercice
 * porte aussi son nom canonique anglais (`googleFitActivity.name`) et les plans
 * personnalisés peuvent être saisis dans l'une ou l'autre langue : les deux
 * noms sont testés, avec des mots-clés FR et EN.
 *
 * Indices des 33 landmarks MediaPipe Pose : voir PoseLandmarks.js.
 */

import { LM } from './PoseLandmarks';

// Triplets A-B-C (angle mesuré au point B), pour chaque côté. Le moteur choisit
// la moyenne des deux côtés (mouvement bilatéral) ou le côté actif (unilatéral).
const JOINTS = {
  // Coude : épaule-coude-poignet
  elbow: { left: [LM.L_SHOULDER, LM.L_ELBOW, LM.L_WRIST], right: [LM.R_SHOULDER, LM.R_ELBOW, LM.R_WRIST] },
  // Genou : hanche-genou-cheville
  knee: { left: [LM.L_HIP, LM.L_KNEE, LM.L_ANKLE], right: [LM.R_HIP, LM.R_KNEE, LM.R_ANKLE] },
  // Hanche : épaule-hanche-genou
  hip: { left: [LM.L_SHOULDER, LM.L_HIP, LM.L_KNEE], right: [LM.R_SHOULDER, LM.R_HIP, LM.R_KNEE] },
  // Abduction / flexion d'épaule : hanche-épaule-coude (bras le long du corps ≈ 15°,
  // bras à l'horizontale ≈ 90°, bras au-dessus de la tête ≈ 170°)
  shoulderAbd: { left: [LM.L_HIP, LM.L_SHOULDER, LM.L_ELBOW], right: [LM.R_HIP, LM.R_SHOULDER, LM.R_ELBOW] },
  // Adduction horizontale : ligne d'épaules-épaule-coude (bras écartés ≈ 160°,
  // bras rapprochés devant la poitrine ≈ 90°) — pour les écartés / fly.
  shoulderH: { left: [LM.R_SHOULDER, LM.L_SHOULDER, LM.L_ELBOW], right: [LM.L_SHOULDER, LM.R_SHOULDER, LM.R_ELBOW] },
};

/**
 * Patrons de mouvement. Chaque patron définit :
 *  - metric      : 'angle' (défaut, degrés, calculé en 3D), 'shrug' ou 'sideBend'
 *  - joint       : articulation mesurée (clé de JOINTS) — metric 'angle' seulement
 *  - min / max   : bornes de la métrique. Pour un angle : replié / déplié.
 *  - countOn     : 'max' → rep validée à la borne haute (ex. squat : retour debout)
 *                  'min' → rep validée à la borne basse (ex. curl : contraction)
 *  - framing     : groupe de landmarks qui doit être visible (PoseLandmarks)
 *  - strictTorso : true → alerte si le buste oscille (élan / triche)
 *  - relative    : true → min/max sont des écarts par rapport à la position de
 *                  repos, calibrée sur les premières frames (métriques de
 *                  déplacement, dont les valeurs absolues dépendent du gabarit)
 */
export const PATTERNS = {
  // --- Bas du corps ---
  squat: { metric: 'angle', joint: 'knee', min: 100, max: 160, countOn: 'max', framing: 'full' },
  lunge: { metric: 'angle', joint: 'knee', min: 100, max: 160, countOn: 'max', framing: 'full' },
  hinge: { metric: 'angle', joint: 'hip', min: 110, max: 165, countOn: 'max', framing: 'full' },
  kneeRaise: { metric: 'angle', joint: 'hip', min: 110, max: 160, countOn: 'min', framing: 'full' },

  // --- Poussée ---
  pressOverhead: { metric: 'angle', joint: 'elbow', min: 90, max: 155, countOn: 'max', framing: 'upper', strictTorso: true },
  pressBench: { metric: 'angle', joint: 'elbow', min: 80, max: 155, countOn: 'max', framing: 'upper' },
  pushup: { metric: 'angle', joint: 'elbow', min: 95, max: 160, countOn: 'max', framing: 'full' },
  tricepsExt: { metric: 'angle', joint: 'elbow', min: 70, max: 155, countOn: 'max', framing: 'upper', strictTorso: true },

  // --- Tirage ---
  row: { metric: 'angle', joint: 'elbow', min: 85, max: 150, countOn: 'min', framing: 'upper' },
  uprightRow: { metric: 'angle', joint: 'elbow', min: 75, max: 160, countOn: 'min', framing: 'upper', strictTorso: true },
  pulldown: { metric: 'angle', joint: 'elbow', min: 70, max: 155, countOn: 'min', framing: 'upper' },
  curl: { metric: 'angle', joint: 'elbow', min: 55, max: 150, countOn: 'min', framing: 'upper', strictTorso: true },

  // --- Épaules / poitrine en isolation (rotation autour de l'épaule) ---
  lateralRaise: { metric: 'angle', joint: 'shoulderAbd', min: 25, max: 80, countOn: 'max', framing: 'upper', strictTorso: true },
  frontRaise: { metric: 'angle', joint: 'shoulderAbd', min: 25, max: 80, countOn: 'max', framing: 'upper', strictTorso: true },
  rearDelt: { metric: 'angle', joint: 'shoulderAbd', min: 25, max: 75, countOn: 'max', framing: 'upper' },
  fly: { metric: 'angle', joint: 'shoulderH', min: 100, max: 150, countOn: 'min', framing: 'upper' },
  pullover: { metric: 'angle', joint: 'shoulderAbd', min: 100, max: 160, countOn: 'min', framing: 'upper' },

  // --- Déplacements (pas d'angle exploitable) ---
  // Haussement d'épaules : l'écart oreille-épaule se réduit quand l'épaule monte.
  // Bornes exprimées en fractions de la longueur du torse, relatives au repos.
  shrug: { metric: 'shrug', min: -0.085, max: -0.02, countOn: 'min', framing: 'head', relative: true, smoothing: 0.3 },
  // Inclinaison latérale du buste, en degrés absolus (0 = debout droit).
  sideBend: { metric: 'sideBend', min: 5, max: 17, countOn: 'max', framing: 'upper' },
};

/**
 * Patrons prioritaires : testés AVANT la liste d'exclusions, pour les exercices
 * dont le nom contient un mot par ailleurs exclu (« crunch latéral debout » est
 * un side bend debout parfaitement mesurable, contrairement aux crunchs au sol).
 */
const PRIORITY_MAP = [
  ['side bend', 'sideBend'],
  ['crunch lateral', 'sideBend'],
];

/**
 * Mouvements non mesurables de façon fiable par une pose 2D/3D monoculaire :
 * pas de comptage plutôt qu'un comptage faux. Testé en début de mot pour éviter
 * les faux positifs (ex. « velo » dans « deVELOppe »).
 */
const EXCLUDE = [
  // Isométriques et étirements : pas de répétitions
  'gainage', 'planche', 'plank', 'etirement', 'stretch', 'mobilite', 'mobility',
  // Cardio / machines
  'velo', 'cycling', 'cardio', 'hiit', 'corde a sauter', 'jumping jack', 'burpee',
  // Au sol, hors cadre ou tronc masqué par les bras
  'crunch', 'abdo', 'sit-up', 'situp', 'russian twist',
  // Ports de charge : pas de cycle articulaire
  'farmer', 'carry', 'marche du fermier',
  // Pieds rarement visibles en cadrage smartphone / amplitude trop faible
  'mollet', 'calf', 'releve de pointe',
  // Rotation du tronc : mal restituée par la pose monoculaire
  'woodchopper', 'rotation du buste',
];

/**
 * Table de correspondance mots-clés → patron, du plus spécifique au plus
 * générique (premier match gagne). Mots-clés en minuscules, sans accents.
 */
const KEYWORD_MAP = [
  // --- Développés / presses (avant les mots génériques « press »/« developpe ») ---
  ['developpe couche', 'pressBench'],
  ['developpe incline', 'pressBench'],
  ['bench press', 'pressBench'],
  ['incline barbell press', 'pressBench'],
  ['incline dumbbell press', 'pressBench'],
  ['incline press', 'pressBench'],
  ['developpe militaire', 'pressOverhead'],
  ['developpe arnold', 'pressOverhead'],
  ['developpe epaules', 'pressOverhead'],
  ['developpe haltere', 'pressOverhead'],
  ['push press', 'pressOverhead'],
  ['military press', 'pressOverhead'],
  ['shoulder press', 'pressOverhead'],
  ['arnold press', 'pressOverhead'],
  ['overhead press', 'pressOverhead'],
  ['developpe', 'pressOverhead'],
  ['military', 'pressOverhead'],
  ['arnold', 'pressOverhead'],
  ['pompe', 'pushup'],
  ['pushup', 'pushup'],
  ['push-up', 'pushup'],
  ['push up', 'pushup'],

  // --- Triceps : AVANT le « overhead » générique, sinon l'extension nuque
  //     serait classée comme un développé militaire.
  ['extension triceps', 'tricepsExt'],
  ['triceps nuque', 'tricepsExt'],
  ['overhead triceps', 'tricepsExt'],
  ['triceps extension', 'tricepsExt'],
  ['triceps kickback', 'tricepsExt'],
  ['kickback', 'tricepsExt'],
  ['skull crusher', 'tricepsExt'],
  ['barre au front', 'tricepsExt'],
  ['dips', 'tricepsExt'],
  ['overhead', 'pressOverhead'],

  // --- Poitrine en isolation ---
  ['ecarte', 'fly'],
  ['dumbbell fly', 'fly'],
  ['pec deck', 'fly'],
  ['fly', 'fly'],
  ['pullover', 'pullover'],

  // --- Trapèzes ---
  ['shrug', 'shrug'],
  ['haussement', 'shrug'],

  // --- Biceps ---
  ['curl', 'curl'],
  ['biceps', 'curl'],

  // --- Épaules en isolation ---
  ['elevations laterales', 'lateralRaise'],
  ['elevation laterale', 'lateralRaise'],
  ['lateral raise', 'lateralRaise'],
  ['side raise', 'lateralRaise'],
  ['elevations frontales', 'frontRaise'],
  ['elevation frontale', 'frontRaise'],
  ['front raise', 'frontRaise'],
  ['oiseau', 'rearDelt'],
  ['rear delt', 'rearDelt'],
  ['reverse fly', 'rearDelt'],

  // --- Dos / tirage ---
  ['tirage menton', 'uprightRow'],
  ['upright row', 'uprightRow'],
  ['tirage vertical', 'pulldown'],
  ['lat pulldown', 'pulldown'],
  ['pulldown', 'pulldown'],
  ['traction', 'pulldown'],
  ['pull-up', 'pulldown'],
  ['pull up', 'pulldown'],
  ['chin-up', 'pulldown'],
  ['tirage', 'row'],
  ['rowing', 'row'],
  ['rameur', 'row'],
  ['row', 'row'],

  // --- Charnière de hanche : avant « squat », les deux partagent des mots ---
  ['souleve de terre', 'hinge'],
  ['souleve', 'hinge'],
  ['deadlift', 'hinge'],
  ['rack pull', 'hinge'],
  ['romanian', 'hinge'],
  ['hip thrust', 'hinge'],
  ['extensions de hanche', 'hinge'],
  ['extension de hanche', 'hinge'],
  ['hip extension', 'hinge'],
  ['good morning', 'hinge'],
  ['glute bridge', 'hinge'],
  ['pont', 'hinge'],

  // --- Jambes ---
  ['releves de genoux', 'kneeRaise'],
  ['releve de genou', 'kneeRaise'],
  ['knee raise', 'kneeRaise'],
  ['split squat', 'lunge'],
  ['bulgarian', 'lunge'],
  ['bulgare', 'lunge'],
  ['fente', 'lunge'],
  ['lunge', 'lunge'],
  ['step-up', 'squat'],
  ['step up', 'squat'],
  ['stepup', 'squat'],
  ['montees sur banc', 'squat'],
  ['montee sur banc', 'squat'],
  ['squat', 'squat'],
  ['goblet', 'squat'],
  ['gobelet', 'squat'],
  ['leg press', 'squat'],
  ['presse a cuisses', 'squat'],
  ['presse', 'squat'],
];

/**
 * Indices d'un mouvement unilatéral : un seul membre travaille à la fois. Le
 * moteur suit alors le côté actif au lieu de moyenner les deux (la moyenne
 * diviserait l'amplitude par deux et empêcherait tout comptage).
 */
const UNILATERAL_HINTS = [
  'un bras', 'one arm', '1 bras', 'unilateral', 'single leg', 'single-leg', 'one leg',
  'alterne', 'alternee', 'alternees', 'alternating', 'alternate',
  'bulgare', 'bulgarian', 'split squat',
  'concentre', 'concentration',
  'step-up', 'step up', 'stepup', 'montee sur banc', 'montees sur banc',
  'releve de genou', 'releves de genoux', 'knee raise',
  'extension de hanche', 'extensions de hanche', 'hip extension',
  'kickback',
];

/** Retire les accents et met en minuscules pour un matching robuste. */
function normalize(str) {
  return (str || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Noms candidats d'un exercice : nom affiché + nom canonique anglais. */
function candidateNames(exo) {
  return [exo.name, exo.googleFitActivity && exo.googleFitActivity.name]
    .filter(Boolean)
    .map(normalize);
}

function isExcluded(name) {
  return EXCLUDE.some((k) => new RegExp('\\b' + k).test(name));
}

function buildRule(patternKey, unilateral) {
  const pattern = PATTERNS[patternKey];
  if (!pattern) return null;
  return {
    key: patternKey,
    pattern,
    joint: pattern.joint ? JOINTS[pattern.joint] : null,
    bilateral: !unilateral,
  };
}

/**
 * Détermine le patron de mouvement d'un exercice, ou null si non comptable par
 * la caméra (chrono, étirements, cardio, mobilité, port de charge…).
 * @param {Object} exo - Exercice ({ name, nbRep, timer, sets, googleFitActivity })
 * @returns {{key: string, pattern: Object, joint: Object|null, bilateral: boolean} | null}
 */
export function getRepPattern(exo) {
  if (!exo || !exo.name) return null;
  // Exercices chronométrés / sans reps : pas de comptage vision
  if (exo.timer === true || exo.nbRep === 0) return null;

  const names = candidateNames(exo);
  if (!names.length) return null;

  // Latéralité : indices dans le nom, ou séries notées « /côté » / « /jambe ».
  const sets = normalize(exo.sets);
  const unilateral =
    names.some((n) => UNILATERAL_HINTS.some((h) => n.includes(h))) ||
    sets.includes('/cote') ||
    sets.includes('/jambe') ||
    sets.includes('/bras') ||
    sets.includes('par cote');

  // 1. Patrons prioritaires (avant exclusions)
  for (const [keyword, patternKey] of PRIORITY_MAP) {
    if (names.some((n) => n.includes(keyword))) return buildRule(patternKey, unilateral);
  }

  // 2. Exclusions : si l'un des noms est exclu, on ne compte pas.
  if (names.some(isExcluded)) return null;

  // 3. Table générale, du plus spécifique au plus générique.
  for (const [keyword, patternKey] of KEYWORD_MAP) {
    if (names.some((n) => n.includes(keyword))) return buildRule(patternKey, unilateral);
  }
  return null;
}

/** True si l'exercice peut être compté par la caméra. */
export function isCameraCountable(exo) {
  return getRepPattern(exo) !== null;
}
