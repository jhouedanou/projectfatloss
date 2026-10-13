/**
 * Logique de la séance vélo immersive — fonctions pures, testables en node.
 *
 *  - Enchaînement des parcours : quand une vidéo se termine avant l'objectif,
 *    la suivante est choisie pour couvrir le temps restant.
 *  - Fantôme : position dans la vidéo, relevée toutes les 5 s de sortie, de
 *    ton meilleur passage sur ce parcours. On compare à temps de sortie égal,
 *    comme le fantôme de Kinomap.
 */

/** Pas d'échantillonnage du fantôme, en secondes de sortie. */
export const GHOST_STEP_SEC = 5;

/**
 * Choisit le parcours suivant.
 * @param {Array} videos liste dans l'ordre d'affichage
 * @param {Object} options
 * @param {string} options.currentId parcours qui vient de se terminer
 * @param {string[]} [options.playedIds] déjà roulés pendant la séance
 * @param {string[]} [options.unavailableIds] non lisibles dans l'app
 * @param {number|null} [options.remainingSec] temps restant avant l'objectif
 * @returns {Object|null}
 */
export function pickNextVideo(videos, { currentId, playedIds = [], unavailableIds = [], remainingSec = null } = {}) {
  const usable = (videos || []).filter((video) => video.id !== currentId && !unavailableIds.includes(video.id));
  if (!usable.length) return null;
  const fresh = usable.filter((video) => !playedIds.includes(video.id));
  const pool = fresh.length ? fresh : usable;

  const known = pool.filter((video) => video.durationSec > 0);
  if (remainingSec != null && remainingSec > 0 && known.length) {
    // Le plus court parcours qui couvre le temps restant, sinon le plus long.
    const covering = known
      .filter((video) => video.durationSec >= remainingSec)
      .sort((a, b) => a.durationSec - b.durationSec);
    if (covering.length) return covering[0];
    return [...known].sort((a, b) => b.durationSec - a.durationSec)[0];
  }

  // Sans objectif : le suivant dans la liste, après le parcours courant.
  const start = videos.findIndex((video) => video.id === currentId);
  for (let step = 1; step <= videos.length; step += 1) {
    const candidate = videos[(start + step + videos.length) % videos.length];
    if (pool.includes(candidate)) return candidate;
  }
  return pool[0];
}

/**
 * Position du fantôme (secondes de vidéo) après `elapsedSec` de sortie sur ce
 * parcours, interpolée entre deux relevés. Au-delà du dernier relevé, le
 * fantôme reste où il s'est arrêté.
 */
export function ghostPositionAt(ghost, elapsedSec) {
  const positions = ghost?.positions;
  if (!positions?.length) return null;
  const step = ghost.step || GHOST_STEP_SEC;
  const x = Math.max(0, elapsedSec) / step;
  const index = Math.floor(x);
  if (index >= positions.length - 1) return positions[positions.length - 1];
  return positions[index] + (positions[index + 1] - positions[index]) * (x - index);
}

/**
 * Écart avec le fantôme en mètres sur le parcours (positif = devant). Une
 * seconde de vidéo vaut la distance parcourue à la vitesse de référence.
 */
export function ghostGapMeters(positionSec, ghostSec, refSpeedKmh) {
  if (positionSec == null || ghostSec == null) return null;
  return Math.round(((positionSec - ghostSec) * (refSpeedKmh || 20)) / 3.6);
}

/** Temps (en relevés) pour atteindre la position la plus avancée. */
const reach = (positions) => {
  const best = Math.max(...positions);
  return { best, index: positions.findIndex((value) => value >= best - 1) };
};

/**
 * Le nouveau passage bat-il l'ancien ? Plus loin dans la vidéo, ou aussi loin
 * en moins de temps.
 */
export function isBetterGhost(candidate, previous) {
  if (!candidate?.positions?.length) return false;
  if (!previous?.positions?.length) return true;
  const a = reach(candidate.positions);
  const b = reach(previous.positions);
  if (Math.abs(a.best - b.best) > 1) return a.best > b.best;
  return a.index < b.index;
}
