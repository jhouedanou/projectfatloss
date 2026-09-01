/**
 * Test hors-ligne du mode immersif (aucun casque requis) : détection,
 * routage des gestes et texte du HUD.
 *
 * Usage : node scripts/test-xr-workout.mjs
 */

import { isHeadsetUserAgent, chooseXrMode } from '../src/services/xr/XrDevice.js';
import { buildHudModel, resolveXrAction, formatClock, repKeyOf, EMPTY_STATE } from '../src/services/xr/XrWorkoutModel.js';

let failures = 0;
const check = (label, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failures += 1;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${label} — attendu ${JSON.stringify(expected)}, obtenu ${JSON.stringify(actual)}`);
};

console.log('\n— Détection —');
check('UA Quest 3', isHeadsetUserAgent('Mozilla/5.0 (X11; Linux x86_64; Quest 3) AppleWebKit/537.36 OculusBrowser/33.0'), true);
check('UA Pico', isHeadsetUserAgent('Mozilla/5.0 (Linux; Android 10; Pico 4) PicoBrowser'), true);
check('UA iPhone', isHeadsetUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari'), false);
check('UA Chrome desktop', isHeadsetUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0'), false);
check('UA vide', isHeadsetUserAgent(undefined), false);
check('mode ar+vr → ar', chooseXrMode({ ar: true, vr: true }), 'immersive-ar');
check('mode vr seul → vr', chooseXrMode({ ar: false, vr: true }), 'immersive-vr');
check('mode aucun → null', chooseXrMode({ ar: false, vr: false }), null);

console.log('\n— Routage des gestes —');
const reps = (extra = {}) => ({ ...EMPTY_STATE, phase: 'exercise', kind: 'reps', targetReps: 12, currentRep: 3, ...extra });
check('repos + select → skipRest', resolveXrAction({ phase: 'rest' }, 'select'), 'skipRest');
check('repos + squeeze → null', resolveXrAction({ phase: 'rest' }, 'squeeze'), null);
check('terminé + select → endSession', resolveXrAction({ phase: 'finished' }, 'select'), 'endSession');
check('changement de côté + select → switchSide', resolveXrAction(reps({ sideSwitchCountdown: 2 }), 'select'), 'switchSide');
check('changement de côté + rep → null', resolveXrAction(reps({ sideSwitchCountdown: 2 }), 'rep'), null);
check('reps + select → addRep', resolveXrAction(reps(), 'select'), 'addRep');
check('reps + squeeze → toggleRhythm', resolveXrAction(reps(), 'squeeze'), 'toggleRhythm');
check('reps + rep → rep', resolveXrAction(reps(), 'rep'), 'rep');
check('reps + décompte + select → null', resolveXrAction(reps({ countdown: 2 }), 'select'), null);
check('reps + décompte + rep → rep', resolveXrAction(reps({ countdown: 2 }), 'rep'), 'rep');
check('série finie + select → next', resolveXrAction(reps({ currentRep: 12 }), 'select'), 'next');
check('série finie + rep → null', resolveXrAction(reps({ currentRep: 12 }), 'rep'), null);
check('série finie côté 1 + select → switchSide', resolveXrAction(reps({ currentRep: 12, isDoubleSided: true, side: 0 }), 'select'), 'switchSide');
check('série finie côté 2 + select → next', resolveXrAction(reps({ currentRep: 12, isDoubleSided: true, side: 1 }), 'select'), 'next');
check('toast calories + select → null', resolveXrAction(reps({ currentRep: 12, showCalories: true }), 'select'), null);
const chrono = (extra = {}) => ({ ...EMPTY_STATE, phase: 'exercise', kind: 'chrono', ...extra });
check('chrono + select → finishChrono', resolveXrAction(chrono(), 'select'), 'finishChrono');
check('chrono côté 1 + select → switchSide', resolveXrAction(chrono({ isDoubleSided: true, side: 0 }), 'select'), 'switchSide');
check('chrono + squeeze → togglePause', resolveXrAction(chrono(), 'squeeze'), 'togglePause');
check('timer + rep → null', resolveXrAction({ ...chrono(), kind: 'timer' }, 'rep'), null);

console.log('\n— HUD —');
check('clé de série', repKeyOf({ stepIndex: 2, setNum: 1, side: 0 }), '2-1-0');
check('formatClock 65', formatClock(65), '01:05');
check('formatClock 0', formatClock(0), '00:00');
const longName = 'Soulevé de terre roumain (départ debout, haltères)';
const m1 = buildHudModel(reps({ exerciseName: longName, stepIndex: 1, total: 8, setNum: 0, totalSets: 3, calories: 42.4, dayTitle: 'Jour 2' }));
check('reps big', m1.big, '3 / 12');
check('reps kicker', m1.kicker, 'Jour 2 · Exercice 2/8');
check('reps kcal', m1.kcal, '42 kcal');
check('reps series', m1.series, 'Série 1/3');
check('reps titre conservé (ellipse faite au dessin)', m1.title, longName);
check('reps sans profil → aide gâchette', m1.sub, 'Gâchette : +1 rep');
const m2 = buildHudModel(reps({ xrProfile: { source: 'head' }, xrStatus: 'Prêt — à vous !', xrStatusColor: '#30d158' }));
check('reps avec profil → statut du casque', m2.sub, 'Prêt — à vous !');
check('reps avec profil sans statut → calibrage', buildHudModel(reps({ xrProfile: { source: 'head' } })).sub, 'Calibrage : restez immobile…');
check('série finie → OK', buildHudModel(reps({ currentRep: 12 })).big, 'OK !');
check('série finie + calories', buildHudModel(reps({ currentRep: 12, showCalories: true, caloriesToShow: 9 })).sub, '+9 kcal');
check('décompte 3', buildHudModel(reps({ countdown: 3 })).big, '3');
check('décompte 0 → Go', buildHudModel(reps({ countdown: 0 })).big, 'Go !');
check('côté', buildHudModel(reps({ isDoubleSided: true, side: 1, setNum: 1, totalSets: 3 })).series, 'Série 2/3 · Côté 2/2');
check('changement de côté', buildHudModel(reps({ sideSwitchCountdown: 2 })).big, 'Changez de côté… 2');
const rest = buildHudModel({ phase: 'rest', restLeft: 12, exerciseName: 'Squat', setNum: 0, totalSets: 4 });
check('repos big', rest.big, '12 s');
check('repos sub série suivante', rest.sub, 'Ensuite : série 2/4');
check('repos orange ≤3', buildHudModel({ phase: 'rest', restLeft: 3 }).bigColor, '#ff9f0a');
const restT = buildHudModel({ phase: 'rest', restLeft: 30, isExerciseTransition: true, nextExercise: { name: 'Fentes', sets: '3x12' } });
check('repos transition → prochain exercice', restT.sub, 'Prochain : Fentes — 3x12');
check('repos auto titre', buildHudModel({ phase: 'rest', autoMode: true }).title, 'Repos auto');
check('chrono big', buildHudModel(chrono({ chrono: 125, chronoRunning: true })).big, '02:05');
check('chrono en pause', buildHudModel(chrono({ chrono: 5 })).sub, 'Chronomètre — en pause');
check('timer rouge ≤10', buildHudModel({ ...chrono(), kind: 'timer', exerciseTimer: 8, timerRunning: true, duration: 30 }).bigColor, '#ff453a');
check('terminé', buildHudModel({ phase: 'finished', calories: 310 }).big, '310 kcal');
check('footer', buildHudModel({}).footer, 'Quitter : bouton système, ou regardez votre paume et pincez');

console.log(failures === 0 ? '\nTous les tests passent.' : `\n${failures} test(s) en échec.`);
process.exit(failures === 0 ? 0 : 1);
