/**
 * Test hors-ligne du compteur de répétitions XR (aucun casque requis).
 * Simule des flux tête/mains à 72 Hz et vérifie le nombre de reps comptées.
 *
 * Usage : node scripts/test-xr-counter.mjs
 */

import { XrRepCounter } from '../src/services/xr/XrRepCounter.js';
import { XR_PROFILES, getXrProfile } from '../src/services/xr/XrRepRules.js';

let failures = 0;
const check = (label, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failures += 1;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${label} — attendu ${expected}, obtenu ${actual}`);
};

/** Fait tourner un profil sur une série d'échantillons (dt = 1000/72 ms). */
function run(profile, samples) {
  let reps = 0;
  const counter = new XrRepCounter(profile, (e) => { if (e.type === 'rep') reps += 1; });
  let t = 0;
  for (const s of samples) {
    t += 1000 / 72;
    counter.push({ t, ...s });
  }
  return reps;
}

/** Génère un flux : `holdMs` d'immobilité puis `n` cycles (descente/retour). */
function cycles({ base, amp, n, cycleMs, holdMs = 2000, noise = 0.005, key = 'headY' }) {
  const out = [];
  const dt = 1000 / 72;
  for (let t = 0; t < holdMs; t += dt) {
    out.push({ [key]: base + (Math.random() - 0.5) * noise });
  }
  for (let i = 0; i < n; i += 1) {
    for (let t = 0; t < cycleMs; t += dt) {
      const phase = Math.sin((Math.PI * t) / cycleMs); // 0 → 1 → 0
      out.push({ [key]: base + amp * phase + (Math.random() - 0.5) * noise });
    }
  }
  return out;
}

// 1) Squat : tête à 1,55 m, 10 descentes de 35 cm en ~2,5 s chacune.
check(
  '10 squats profonds comptés',
  run(XR_PROFILES.headDrop, cycles({ base: 1.55, amp: -0.35, n: 10, cycleMs: 2500 })),
  10
);

// 2) Demi-squats trop courts (10 cm) : rien ne doit compter.
check(
  'Demi-squats de 10 cm ignorés',
  run(XR_PROFILES.headDrop, cycles({ base: 1.55, amp: -0.1, n: 10, cycleMs: 2500 })),
  0
);

// 3) Tremblement rapide de la tête (5 cm à 3 Hz) : aucun faux positif.
check(
  'Oscillation parasite ignorée',
  run(XR_PROFILES.headDrop, cycles({ base: 1.55, amp: -0.05, n: 30, cycleMs: 330 })),
  0
);

// 4) Développé debout : mains de 1,45 m à +0,45 m, 12 reps.
check(
  '12 développés debout comptés',
  run(XR_PROFILES.handRaise, cycles({ base: 1.45, amp: 0.45, n: 12, cycleMs: 2200, key: 'handsY' })),
  12
);

// 5) Curls : mains +0,3 m, 12 reps, avec 20 % de frames perdues (occlusion).
{
  const stream = cycles({ base: 0.95, amp: 0.3, n: 12, cycleMs: 2000, key: 'handsY' })
    .map((s) => (Math.random() < 0.2 ? { handsY: null } : s));
  check('12 curls comptés malgré 20% de frames perdues', run(XR_PROFILES.handCurl, stream), 12);
}

// 6) Montées sur banc : la tête MONTE de 18 cm, 8 reps.
check(
  '8 montées sur banc comptées',
  run(XR_PROFILES.headRise, cycles({ base: 1.55, amp: 0.18, n: 8, cycleMs: 2400 })),
  8
);

// 7) Dérive lente de posture (l'utilisateur se tasse de 4 cm sur 30 s) sans reps.
{
  const dt = 1000 / 72;
  const stream = [];
  for (let t = 0; t < 30000; t += dt) {
    stream.push({ headY: 1.55 - 0.04 * (t / 30000) + (Math.random() - 0.5) * 0.005 });
  }
  check('Dérive lente sans reps : 0 compté', run(XR_PROFILES.headDrop, stream), 0);
}

// 8) Classement des exercices du programme vers les bons profils.
const cases = [
  ['Squat gobelet haltère', 'headDrop'],
  ['Fentes bulgares haltères', 'headDrop'],
  ['Soulevé de terre roumain (départ debout)', 'headDropSmall'],
  ['Montées sur banc lestées', 'headRise'],
  ['Développé militaire barre', 'handRaise'],
  ['Élévations latérales haltères', 'handRaise'],
  ['Curl biceps haltères', 'handCurl'],
  ['Rowing haltères deux bras', 'handCurl'],
  ['Développé couché barre', null],       // allongé : exclu
  ['Écarté haltères sur banc', null],     // allongé : exclu
  ['Woodchopper haltère', null],          // diagonal : non couvert
  ['Marche du fermier (farmer carry)', null], // chronométré : non couvert
];
for (const [name, expected] of cases) {
  const p = getXrProfile({ name });
  check(`Profil « ${name} »`, p ? p.key : null, expected);
}

console.log(failures === 0 ? '\nTous les tests passent.' : `\n${failures} échec(s).`);
process.exit(failures === 0 ? 0 : 1);
