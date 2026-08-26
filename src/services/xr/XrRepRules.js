/**
 * Règles de comptage de répétitions en réalité mixte (WebXR, casque Meta Quest).
 *
 * Contrairement au comptage caméra (MediaPipe, angles articulaires), le casque
 * ne « voit » pas le corps : il connaît en revanche très précisément la
 * position 6DoF de la TÊTE (le casque lui-même) et celle des MAINS (hand
 * tracking par les caméras IR, exposé par WebXR).
 *
 * On classe donc chaque exercice vers un signal :
 *  - 'head'  : la tête descend (squats, fentes, soulevés…) ou monte (montées
 *              sur banc) — signal le plus fiable du casque ;
 *  - 'hands' : les mains montent/descendent (développés debout, curls,
 *              élévations…). Fiable, avec une réserve : le hand tracking se
 *              dégrade quand la main serre un haltère (occlusion des doigts) —
 *              on suit la position globale de la main, pas les doigts.
 *
 * Exclusions volontaires : les exercices allongés sur banc (le casque bouge à
 * peine et les mains sortent du champ des caméras), les mouvements diagonaux
 * (woodchopper) et les isométries chronométrées.
 *
 * Chaque profil définit :
 *  - source    : 'head' | 'hands'
 *  - direction : 'down' | 'up' — sens de la phase active par rapport au repos
 *  - amp       : excursion minimale (m) pour engager une répétition
 *  - back      : bande de retour (m) autour du repos qui valide la répétition
 */

export const XR_PROFILES = {
  headDrop: { source: 'head', direction: 'down', amp: 0.18, back: 0.09 },
  headDropSmall: { source: 'head', direction: 'down', amp: 0.12, back: 0.06 },
  headRise: { source: 'head', direction: 'up', amp: 0.13, back: 0.06 },
  handRaise: { source: 'hands', direction: 'up', amp: 0.2, back: 0.1 },
  handCurl: { source: 'hands', direction: 'up', amp: 0.14, back: 0.07 },
};

// Mots-clés FR + EN (nom affiché et nom Google Fit canonique), testés en
// minuscules sans accents. Premier patron trouvé gagne : l'ordre compte.
const RULES = [
  // Tête qui monte : montées sur banc / step-ups
  { keys: ['montee', 'step-up', 'step up'], profile: 'headRise' },
  // Tête qui descend nettement : squats et fentes
  { keys: ['squat', 'fente', 'lunge', 'gobelet', 'goblet', 'sumo', 'bulgare', 'bulgarian'], profile: 'headDrop' },
  // Charnière de hanche : le buste bascule, la tête descend un peu moins
  { keys: ['souleve', 'deadlift', 'rack pull', 'romanian', 'roumain', 'good morning'], profile: 'headDropSmall' },
  // Mains au-dessus de la tête ou à l'épaule : développés debout, élévations
  { keys: ['developpe militaire', 'military press', 'arnold', 'push press', 'overhead', 'elevation', 'raise', 'tirage menton', 'upright row'], profile: 'handRaise' },
  // Flexions de bras et tirages : amplitude verticale des mains plus courte
  { keys: ['curl', 'rowing', 'row', 'oiseau', 'rear delt'], profile: 'handCurl' },
];

// Exclusions dures, testées AVANT les règles (un « développé couché » contient
// « développé » mais se fait allongé : hors périmètre casque).
const EXCLUDED = ['couche', 'bench', 'incline', 'ecarte', 'fly', 'pullover', 'allonge'];

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/**
 * Profil XR d'un exercice, ou null s'il n'est pas comptable au casque.
 * @param {Object} exo — exercice du programme ({ name, googleFitActivity })
 * @returns {{source, direction, amp, back, key}|null}
 */
export function getXrProfile(exo) {
  const haystack = normalize(`${exo?.name || ''} ${exo?.googleFitActivity?.name || ''}`);
  if (!haystack.trim()) return null;
  if (EXCLUDED.some((k) => haystack.includes(k))) return null;
  for (const rule of RULES) {
    if (rule.keys.some((k) => haystack.includes(k))) {
      return { ...XR_PROFILES[rule.profile], key: rule.profile };
    }
  }
  return null;
}

/** L'exercice est-il comptable en mode casque ? */
export function isXrCountable(exo) {
  return getXrProfile(exo) !== null;
}
