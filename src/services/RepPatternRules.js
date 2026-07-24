/**
 * Règles de détection de répétitions par vision (webcam + MediaPipe Pose).
 *
 * Le programme contient des centaines d'exercices mais seulement une poignée de
 * PATRONS de mouvement. On classe chaque exercice vers un patron via des
 * mots-clés sur son nom, puis on compte les reps avec une machine à états sur
 * l'angle d'une articulation (A-B-C, angle au point B).
 *
 * Indices des 33 landmarks MediaPipe Pose :
 *   11 épaule G   12 épaule D
 *   13 coude G    14 coude D
 *   15 poignet G  16 poignet D
 *   23 hanche G   24 hanche D
 *   25 genou G    26 genou D
 *   27 cheville G 28 cheville D
 */

// Paires gauche/droite pour chaque articulation utile (on choisit à l'exécution
// le côté le plus visible).
const JOINTS = {
  // angle au coude : épaule-coude-poignet
  elbow: { left: [11, 13, 15], right: [12, 14, 16] },
  // angle au genou : hanche-genou-cheville
  knee: { left: [23, 25, 27], right: [24, 26, 28] },
  // angle à la hanche : épaule-hanche-genou
  hip: { left: [11, 23, 25], right: [12, 24, 26] },
  // abduction d'épaule : hanche-épaule-coude
  shoulderAbd: { left: [23, 11, 13], right: [24, 12, 14] },
};

/**
 * Patrons de mouvement. Chaque patron définit :
 *  - joint     : articulation mesurée (clé de JOINTS)
 *  - flexAngle : angle « replié » (petit)
 *  - extAngle  : angle « déplié » (grand)
 *  - countOn   : 'extend' → rep validée en revenant déplié (ex. squat : debout)
 *                'flex'   → rep validée au point replié (ex. curl : contraction)
 */
export const PATTERNS = {
  squat: { joint: 'knee', flexAngle: 100, extAngle: 160, countOn: 'extend' },
  lunge: { joint: 'knee', flexAngle: 100, extAngle: 160, countOn: 'extend' },
  hinge: { joint: 'hip', flexAngle: 110, extAngle: 165, countOn: 'extend' },
  pressOverhead: { joint: 'elbow', flexAngle: 90, extAngle: 155, countOn: 'extend' },
  pressBench: { joint: 'elbow', flexAngle: 80, extAngle: 155, countOn: 'extend' },
  pushup: { joint: 'elbow', flexAngle: 95, extAngle: 160, countOn: 'extend' },
  curl: { joint: 'elbow', flexAngle: 55, extAngle: 150, countOn: 'flex' },
  row: { joint: 'elbow', flexAngle: 85, extAngle: 150, countOn: 'flex' },
  pulldown: { joint: 'elbow', flexAngle: 70, extAngle: 155, countOn: 'flex' },
  lateralRaise: { joint: 'shoulderAbd', flexAngle: 25, extAngle: 80, countOn: 'extend' },
  // Extension triceps (nuque / kickback) : coude qui se déplie
  tricepsExt: { joint: 'elbow', flexAngle: 70, extAngle: 155, countOn: 'extend' },
  // Relevé de genou debout : hanche qui se plie (cuisse qui monte)
  kneeRaise: { joint: 'hip', flexAngle: 110, extAngle: 160, countOn: 'flex' },
};

/**
 * Table de correspondance mots-clés → patron. Ordre important : on teste du plus
 * spécifique au plus générique. Premier match gagne.
 * Mots-clés en minuscules, sans accents (le nom d'exo est normalisé avant test).
 */
const KEYWORD_MAP = [
  // Développés spécifiques d'abord
  ['developpe couche', 'pressBench'],
  ['developpe incline', 'pressBench'],
  ['developpe militaire', 'pressOverhead'],
  ['developpe arnold', 'pressOverhead'],
  ['developpe epaules', 'pressOverhead'],
  ['developpe haltere', 'pressOverhead'],
  ['push press', 'pressOverhead'],
  ['developpe', 'pressOverhead'],
  ['military', 'pressOverhead'],
  ['overhead', 'pressOverhead'],
  ['arnold', 'pressOverhead'],
  ['pompe', 'pushup'],
  ['pushup', 'pushup'],
  // Triceps (extension du coude)
  ['extension triceps', 'tricepsExt'],
  ['triceps nuque', 'tricepsExt'],
  ['kickback', 'tricepsExt'],
  // Écarté / fly (ouverture des bras) — approximé par l'abduction d'épaule
  ['ecarte', 'lateralRaise'],
  // Bras
  ['curl', 'curl'],
  ['biceps', 'curl'],
  // Épaules isolation
  ['elevations laterales', 'lateralRaise'],
  ['elevation laterale', 'lateralRaise'],
  ['elevations frontales', 'lateralRaise'],
  ['oiseau', 'lateralRaise'],
  // Dos / tirage
  ['tirage vertical', 'pulldown'],
  ['traction', 'pulldown'],
  ['tirage', 'row'],
  ['rowing', 'row'],
  ['rameur', 'row'],
  // Jambes
  ['releves de genoux', 'kneeRaise'],
  ['releve de genou', 'kneeRaise'],
  ['fente', 'lunge'],
  ['split squat', 'lunge'],
  ['step-up', 'squat'],
  ['step up', 'squat'],
  ['stepup', 'squat'],
  ['montees sur banc', 'squat'],
  ['montee sur banc', 'squat'],
  ['squat', 'squat'],
  ['goblet', 'squat'],
  ['presse', 'squat'],
  // Charnière de hanche
  ['souleve de terre', 'hinge'],
  ['souleve', 'hinge'],
  ['hip thrust', 'hinge'],
  ['extension de hanche', 'hinge'],
  ['extensions de hanche', 'hinge'],
  ['good morning', 'hinge'],
  ['romanian', 'hinge'],
  ['pont', 'hinge'],
];

/** Retire les accents et met en minuscules pour un matching robuste. */
function normalize(str) {
  return (str || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * Détermine le patron de mouvement d'un exercice, ou null si non comptable par
 * la caméra (chrono, étirements, cardio, mobilité, exercices au sol non gérés).
 * @param {Object} exo - Exercice ({ name, nbRep, timer, sets })
 * @returns {{key: string, pattern: Object, joint: Object} | null}
 */
export function getRepPattern(exo) {
  if (!exo || !exo.name) return null;
  // Exercices chronométrés / sans reps : pas de comptage vision
  if (exo.timer === true || exo.nbRep === 0) return null;

  const name = normalize(exo.name);
  // Exclusions explicites (non fiables en pose 2D). Match sur début de mot pour
  // éviter les faux positifs (ex. « velo » dans « deVELOppe »).
  const EXCLUDE = ['mollet', 'gainage', 'planche', 'etirement', 'mobilite', 'velo', 'cardio', 'crunch', 'abdo', 'gainer', 'shrug', 'farmer', 'carry'];
  if (EXCLUDE.some((k) => new RegExp('\\b' + k).test(name))) return null;

  for (const [keyword, patternKey] of KEYWORD_MAP) {
    if (name.includes(keyword)) {
      return { key: patternKey, pattern: PATTERNS[patternKey], joint: JOINTS[PATTERNS[patternKey].joint] };
    }
  }
  return null;
}

/** True si l'exercice peut être compté par la caméra. */
export function isCameraCountable(exo) {
  return getRepPattern(exo) !== null;
}
