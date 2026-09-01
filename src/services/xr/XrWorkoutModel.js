/**
 * Modèle pur du mode immersif : état publié par React, texte du HUD par
 * phase, et routage des gestes du casque vers les handlers React.
 *
 * Aucun accès au navigateur ici : tout est testable en node
 * (scripts/test-xr-workout.mjs).
 */

/** État HUD par défaut (React le complète par fusion partielle). */
export const EMPTY_STATE = Object.freeze({
  // Séance
  phase: 'exercise', // 'exercise' | 'rest' | 'finished'
  dayTitle: '',
  stepIndex: 0,
  total: 0,
  setNum: 0,
  totalSets: 1,
  calories: 0,
  autoMode: false,
  // Exercice en cours
  exerciseName: '',
  kind: 'reps', // 'reps' | 'chrono' | 'timer'
  currentRep: 0,
  targetReps: 0,
  countdown: null, // 3,2,1 avant le rythme, sinon null
  isPulsing: false,
  side: 0,
  isDoubleSided: false,
  sideSwitchCountdown: null,
  chrono: 0,
  chronoRunning: false,
  exerciseTimer: 0,
  timerRunning: false,
  duration: 0,
  showCalories: false,
  caloriesToShow: 0,
  xrProfile: null, // profil de comptage tête/mains (XrRepRules) ou null
  // Repos
  restLeft: null,
  restTotal: null,
  isExerciseTransition: false,
  nextExercise: null, // { name, sets, nbRep } | null
  // Statut du compteur casque (posé par la session elle-même)
  xrStatus: null,
  xrStatusColor: null,
});

export const COLORS = Object.freeze({
  white: '#ffffff',
  green: '#30d158',
  blue: '#0a84ff',
  orange: '#ff9f0a',
  red: '#ff453a',
  label2: 'rgba(235, 235, 245, 0.6)',
  label3: 'rgba(235, 235, 245, 0.3)',
});

export const FOOTER = 'Quitter : bouton système, ou regardez votre paume et pincez';

/** Clé de la série en cours : sert à remettre le compteur de reps à zéro. */
export function repKeyOf(state) {
  return `${state.stepIndex}-${state.setNum}-${state.side}`;
}

export function formatClock(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

const seriesLabel = (state) => {
  const base = `Série ${Math.min(state.setNum + 1, state.totalSets)}/${state.totalSets}`;
  return state.isDoubleSided ? `${base} · Côté ${state.side + 1}/2` : base;
};

const isSetDone = (state) => state.targetReps > 0 && state.currentRep >= state.targetReps;

/**
 * Texte du HUD pour l'état donné.
 * @returns {{ kicker, kcal, title, series, big, bigColor, sub, subColor, hint, footer }}
 */
export function buildHudModel(input) {
  const state = { ...EMPTY_STATE, ...input };
  const base = {
    kicker: state.total > 0
      ? `${state.dayTitle ? `${state.dayTitle} · ` : ''}Exercice ${Math.min(state.stepIndex + 1, state.total)}/${state.total}`
      : state.dayTitle,
    kcal: `${Math.round(state.calories || 0)} kcal`,
    title: state.exerciseName || 'Exercice',
    series: seriesLabel(state),
    big: '',
    bigColor: COLORS.white,
    sub: '',
    subColor: COLORS.label2,
    hint: '',
    footer: FOOTER,
  };

  if (state.phase === 'finished') {
    return {
      ...base,
      title: 'Séance terminée ✓',
      series: '',
      big: `${Math.round(state.calories || 0)} kcal`,
      bigColor: COLORS.green,
      sub: 'Retirez le casque pour enregistrer',
      hint: 'Gâchette : quitter le mode immersif',
    };
  }

  if (state.phase === 'rest') {
    const left = state.restLeft == null ? '' : `${state.restLeft} s`;
    const next = state.nextExercise;
    let sub;
    if (state.isExerciseTransition && next) {
      sub = `Prochain : ${next.name}${next.sets ? ` — ${next.sets}` : ''}`;
    } else {
      sub = `Ensuite : série ${Math.min(state.setNum + 2, state.totalSets)}/${state.totalSets}`;
    }
    return {
      ...base,
      title: `Repos${state.autoMode ? ' auto' : ''}`,
      series: state.exerciseName,
      big: left,
      bigColor: state.restLeft != null && state.restLeft <= 3 ? COLORS.orange : COLORS.white,
      sub,
      hint: 'Gâchette : passer la pause',
    };
  }

  // ── Phase exercice ──
  if (state.sideSwitchCountdown != null) {
    return {
      ...base,
      big: `Changez de côté… ${state.sideSwitchCountdown}`,
      bigColor: COLORS.blue,
      sub: 'Côté 2 sur 2',
      hint: 'Gâchette : passer maintenant',
    };
  }

  if (state.kind === 'chrono' || state.kind === 'timer') {
    const isTimer = state.kind === 'timer';
    const value = isTimer ? state.exerciseTimer : state.chrono;
    const running = isTimer ? state.timerRunning : state.chronoRunning;
    const sideHint = state.isDoubleSided && state.side === 0 ? 'Gâchette : côté suivant' : 'Gâchette : terminer';
    return {
      ...base,
      big: formatClock(value),
      bigColor: isTimer && value <= 10 && value > 0 ? COLORS.red : COLORS.white,
      sub: isTimer
        ? `Timer ${state.duration} s${running ? '' : ' — en pause'}`
        : `Chronomètre${running ? '' : ' — en pause'}`,
      hint: `${sideHint} · Poignée : ${running ? 'pause' : 'reprendre'}`,
    };
  }

  // Reps
  if (state.countdown != null) {
    return {
      ...base,
      big: state.countdown > 0 ? String(state.countdown) : 'Go !',
      bigColor: COLORS.green,
      sub: 'Rythme automatique',
      hint: 'Poignée : arrêter le rythme',
    };
  }

  if (isSetDone(state)) {
    const nextIsSide = state.isDoubleSided && state.side === 0;
    return {
      ...base,
      big: 'OK !',
      bigColor: COLORS.green,
      sub: state.showCalories ? `+${state.caloriesToShow} kcal` : 'Série validée',
      subColor: COLORS.green,
      hint: nextIsSide ? 'Gâchette : changer de côté' : 'Gâchette : suivant',
    };
  }

  let sub;
  let subColor = COLORS.label2;
  if (state.xrProfile && state.xrStatus) {
    sub = state.xrStatus;
    subColor = state.xrStatusColor || COLORS.label2;
  } else if (state.xrProfile) {
    sub = 'Calibrage : restez immobile…';
  } else {
    sub = 'Gâchette : +1 rep';
  }
  return {
    ...base,
    big: `${state.currentRep} / ${state.targetReps}`,
    sub,
    subColor,
    hint: `Gâchette : +1 · Poignée : ${state.isPulsing ? 'arrêter le rythme' : 'rythme'}`,
  };
}

/**
 * Handler React à appeler pour un geste du casque, ou null.
 * @param {Object} input état HUD courant
 * @param {'select'|'squeeze'|'rep'} type
 * @returns {string|null} nom du handler (dans xrActionsRef)
 */
export function resolveXrAction(input, type) {
  const state = { ...EMPTY_STATE, ...input };

  if (state.phase === 'rest') return type === 'select' ? 'skipRest' : null;
  if (state.phase === 'finished') return type === 'select' ? 'endSession' : null;

  if (state.sideSwitchCountdown != null) return type === 'select' ? 'switchSide' : null;

  const firstSide = state.isDoubleSided && state.side === 0;

  if (state.kind === 'chrono' || state.kind === 'timer') {
    if (type === 'select') return firstSide ? 'switchSide' : 'finishChrono';
    if (type === 'squeeze') return 'togglePause';
    return null;
  }

  // Reps
  if (state.showCalories) return null;
  if (isSetDone(state)) {
    return type === 'select' ? (firstSide ? 'switchSide' : 'next') : null;
  }
  if (type === 'rep') return 'rep';
  if (type === 'squeeze') return 'toggleRhythm';
  if (type === 'select') return state.countdown != null ? null : 'addRep';
  return null;
}
