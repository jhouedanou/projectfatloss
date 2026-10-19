/**
 * Test hors-ligne de la séance vélo (aucun vélo requis) : décodage des trames
 * Domyos EB900, calories de la console, enchaînement des parcours, fantôme.
 *
 * Usage : node scripts/test-bike.mjs
 */

import {
  CMD_POLL,
  EB900_FRAME_LENGTH,
  Eb900FrameAssembler,
  INIT_SEQUENCE,
  estimateDomyosWatts,
  parseEb900Frame,
} from '../src/services/bike/eb900Protocol.js';
import { DEVICE_GRACE_SEC, createCalorieState, stepCalories } from '../src/services/bike/rideCalories.js';
import { ghostGapMeters, ghostPositionAt, isBetterGhost, pickNextVideo } from '../src/services/bike/rideSession.js';
import { explainBleError, isQuestBrowser } from '../src/services/bike/BleBridge.js';

let failures = 0;
const check = (label, actual, expected) => {
  const ok = Object.is(actual, expected) || JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${label} — attendu ${JSON.stringify(expected)}, obtenu ${JSON.stringify(actual)}`);
};

/** Trame d'état EB900 de 26 octets, checksum en dernier octet. */
function frame({ speed = 0, cadence = 0, kcal = 0, distance = 0, resistance = 1, hr = 0, button = 0 } = {}) {
  const bytes = new Array(EB900_FRAME_LENGTH).fill(0);
  bytes[0] = 0xf0;
  bytes[1] = 0xbc;
  const speed10 = Math.round(speed * 10);
  bytes[6] = speed10 >> 8;
  bytes[7] = speed10 & 0xff;
  bytes[9] = cadence;
  bytes[10] = kcal >> 8;
  bytes[11] = kcal & 0xff;
  const dist10 = Math.round(distance * 10);
  bytes[12] = dist10 >> 8;
  bytes[13] = dist10 & 0xff;
  bytes[14] = resistance;
  bytes[18] = hr;
  bytes[22] = button;
  bytes[25] = bytes.slice(0, 25).reduce((sum, byte) => (sum + byte) & 0xff, 0);
  return Uint8Array.from(bytes);
}

// --- Commandes ---------------------------------------------------------------
const hex = (bytes) => Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join(' ');
check('poll F0 AC + checksum', hex(CMD_POLL), 'f0 ac 9c');
check('init 1 F0 C8 01 + checksum', hex(INIT_SEQUENCE[0]), 'f0 c8 01 b9');
check('init C4 03 + checksum', hex(INIT_SEQUENCE[6]), 'f0 c4 03 b7');

// --- Décodage ----------------------------------------------------------------
const parsed = parseEb900Frame(frame({ speed: 23.4, cadence: 78, kcal: 312, distance: 12.7, resistance: 8, hr: 131 }));
check('vitesse', parsed.speedKmh, 23.4);
check('cadence', parsed.cadence, 78);
check('calories console', parsed.kcalTotal, 312);
check('distance', parsed.distanceKm, 12.7);
check('résistance', parsed.resistance, 8);
check('pouls', parsed.bpm, 131);
check('pas de bouton', parsed.button, null);

const startup = frame({ speed: 0 });
startup[10] = 0xff;
startup[11] = 0xff;
check('FF FF au démarrage → calories inconnues', parseEb900Frame(startup).kcalTotal, null);
check('mains absentes → pouls null', parseEb900Frame(frame({ hr: 0 })).bpm, null);
check('bouton stop', parseEb900Frame(frame({ button: 0x07 })).button, 'stop');
check('trame d\'une autre famille ignorée', parseEb900Frame(Uint8Array.from([0xf0, 0xdb, ...new Array(24).fill(0)])), null);
check('trame tronquée ignorée', parseEb900Frame(frame().slice(0, 20)), null);

// --- Puissance estimée -------------------------------------------------------
check('0 W à l\'arrêt', estimateDomyosWatts(0, 8), 0);
const watts = estimateDomyosWatts(80, 8);
check('niveau 8 à 80 tr/min ≈ 130 W', watts >= 120 && watts <= 140, true);
check('plus dur = plus de watts', estimateDomyosWatts(80, 12) > estimateDomyosWatts(80, 4), true);

// --- Recollage des notifications ---------------------------------------------
{
  const assembler = new Eb900FrameAssembler();
  const full = frame({ speed: 20, cadence: 70, kcal: 45 });
  check('20 premiers octets : pas encore de trame', assembler.push(full.slice(0, 20), 0).length, 0);
  check('trame à moitié reçue', assembler.isWaiting(100), true);
  const frames = assembler.push(full.slice(20), 100);
  check('20 + 6 octets → une trame', frames.length, 1);
  check('trame recollée lisible', parseEb900Frame(frames[0]).kcalTotal, 45);
  check('plus rien en attente', assembler.isWaiting(200), false);

  // Suite qui commence par F0 par hasard : la taille 20 + 6 l'emporte.
  const tricky = frame({ kcal: 7 });
  tricky[20] = 0xf0;
  assembler.push(tricky.slice(0, 20), 0);
  const trickyFrames = assembler.push(tricky.slice(20), 50);
  check('suite commençant par F0 recollée', trickyFrames.length === 1 && parseEb900Frame(trickyFrames[0]).kcalTotal, 7);

  check('trame entière en une notification (MTU large)', assembler.push(frame({ kcal: 9 }), 0).length, 1);
  check('réponse courte à une commande ignorée', assembler.push(INIT_SEQUENCE[0], 0).length, 0);
  check('réponse courte : rien en attente', assembler.isWaiting(10), false);
  check('octets orphelins ignorés', assembler.push(Uint8Array.from([1, 2, 3]), 0).length, 0);

  assembler.push(full.slice(0, 20), 0);
  check('moitié abandonnée après 1,5 s', assembler.isWaiting(2000), false);
}

// --- Calories ----------------------------------------------------------------
{
  // La console affiche déjà 120 kcal d'une séance précédente : on compte l'écart.
  const state = createCalorieState();
  let result;
  [120, 120, 121, 123, 126].forEach((kcal) => {
    result = stepCalories(state, { kcalTotal: kcal, watts: 100, speedKmh: 20, weightKg: 140 });
  });
  check('écart depuis le début de la sortie', result.calories, 6);
  check('source = compteur du vélo', result.source, 'device');

  // Remise à zéro de la console (bouton stop) : on garde l'acquis.
  [0, 2].forEach((kcal) => {
    result = stepCalories(state, { kcalTotal: kcal, watts: 100, speedKmh: 20, weightKg: 140 });
  });
  check('remise à zéro : 6 + 0 + 2', result.calories, 8);

  // Saut aberrant (trame corrompue) ignoré.
  result = stepCalories(state, { kcalTotal: 900, watts: 100, speedKmh: 20, weightKg: 140 });
  check('saut aberrant ignoré', result.calories, 8);
}
{
  // Compteur bloqué à 0 alors qu'on pédale : repli sur l'estimation.
  const state = createCalorieState();
  let result;
  for (let t = 0; t < DEVICE_GRACE_SEC + 5; t += 1) {
    result = stepCalories(state, { kcalTotal: 0, watts: 150, speedKmh: 25, weightKg: 140 });
  }
  check('compteur muet → estimation', result.source, 'power');
  // 150 W pendant 125 s : 150 × 3,6 kcal/h × 125/3600 h = 18,75 kcal.
  check('estimation = 150 W × 125 s', Math.round(result.calories * 100) / 100, 18.75);
}
{
  // Pas de compteur, pas de puissance : MET × poids tant que ça pédale.
  const state = createCalorieState();
  let result;
  for (let t = 0; t < 60; t += 1) result = stepCalories(state, { speedKmh: 20, weightKg: 140 });
  // MET 7 × 3,5 × 140 kg / 200 = 17,15 kcal/min.
  check('MET × poids sur 1 min', Math.round(result.calories * 100) / 100, 17.15);
  check('source = estimation', result.source, 'estimate');
}

// --- Enchaînement des parcours -----------------------------------------------
{
  const videos = [
    { id: 'a', durationSec: 600 },
    { id: 'b', durationSec: 1200 },
    { id: 'c', durationSec: 1800 },
    { id: 'd', durationSec: 3600 },
  ];
  check(
    'le plus court qui couvre le temps restant',
    pickNextVideo(videos, { currentId: 'a', playedIds: ['a'], remainingSec: 1000 }).id,
    'b'
  );
  check(
    'aucun ne couvre : le plus long',
    pickNextVideo(videos, { currentId: 'a', playedIds: ['a'], remainingSec: 9000 }).id,
    'd'
  );
  check(
    'vidéo illisible écartée',
    pickNextVideo(videos, { currentId: 'a', playedIds: ['a'], unavailableIds: ['b'], remainingSec: 1000 }).id,
    'c'
  );
  check('sans objectif : la suivante dans la liste', pickNextVideo(videos, { currentId: 'b' }).id, 'c');
  check('fin de liste : on reboucle', pickNextVideo(videos, { currentId: 'd' }).id, 'a');
  check(
    'tout roulé : on reprend un parcours déjà fait',
    pickNextVideo(videos, { currentId: 'd', playedIds: ['a', 'b', 'c', 'd'], remainingSec: 500 }).id,
    'a'
  );
  check('liste vide', pickNextVideo([], { currentId: 'a' }), null);
}

// --- Fantôme -----------------------------------------------------------------
{
  const ghost = { step: 5, positions: [0, 5, 10, 15, 20] };
  check('position à 7,5 s (interpolée)', ghostPositionAt(ghost, 7.5), 7.5);
  check('au-delà du dernier relevé : reste arrêté', ghostPositionAt(ghost, 60), 20);
  check('pas de fantôme', ghostPositionAt(null, 10), null);
  check('10 s de vidéo d\'avance à 36 km/h = 100 m', ghostGapMeters(30, 20, 36), 100);
  check('derrière = négatif', ghostGapMeters(10, 20, 36), -100);

  const slow = { positions: [0, 4, 8, 12] };
  const fast = { positions: [0, 6, 12, 18] };
  check('plus loin bat le précédent', isBetterGhost(fast, slow), true);
  check('moins loin ne bat pas', isBetterGhost(slow, fast), false);
  check('premier passage gardé', isBetterGhost(slow, null), true);
  check(
    'aussi loin, plus vite',
    isBetterGhost({ positions: [0, 10, 20, 20] }, { positions: [0, 5, 10, 15, 20] }),
    true
  );
}

// --- Navigateur du Quest (Bluetooth web bloqué) ---------------------------------
{
  const quest3 =
    'Mozilla/5.0 (X11; Linux x86_64; Quest 3) AppleWebKit/537.36 (KHTML, like Gecko) OculusBrowser/35.2.0 SamsungBrowser/4.0 Chrome/128.0.6613.137 VR Safari/537.36';
  const pixel =
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36';
  check('navigateur du Quest 3/3S reconnu', isQuestBrowser(quest3), true);
  check('Chrome Android non concerné', isQuestBrowser(pixel), false);
  check(
    'erreur anglaise traduite',
    explainBleError(new Error('Bluetooth Low Energy not available.')),
    'Bluetooth indisponible : active le Bluetooth de l\'appareil, puis réessaie.'
  );
  check('autre erreur gardée telle quelle', explainBleError(new Error('GATT Server is disconnected.')), 'GATT Server is disconnected.');
}

console.log(failures ? `\n${failures} échec(s)` : '\nTous les tests passent');
process.exit(failures ? 1 : 0);
