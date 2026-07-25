/**
 * Indices, connexions et helpers géométriques pour les 33 landmarks du modèle
 * MediaPipe Pose Landmarker.
 *
 * Deux repères sont fournis par MediaPipe et servent à des choses différentes :
 *  - `landmarks`      : coordonnées normalisées dans l'image (0..1), y vers le bas.
 *                       Utiles pour le cadrage, l'affichage et les mesures
 *                       purement verticales (haussement d'épaules, inclinaison).
 *  - `worldLandmarks` : coordonnées métriques 3D centrées sur le bassin.
 *                       Indispensables pour les ANGLES : un angle calculé sur la
 *                       projection 2D est faux dès que le membre n'est pas dans
 *                       le plan de la caméra (développé couché vu de profil,
 *                       rowing, presse…).
 */

export const LM = {
  NOSE: 0,
  L_EAR: 7,
  R_EAR: 8,
  L_SHOULDER: 11,
  R_SHOULDER: 12,
  L_ELBOW: 13,
  R_ELBOW: 14,
  L_WRIST: 15,
  R_WRIST: 16,
  L_HIP: 23,
  R_HIP: 24,
  L_KNEE: 25,
  R_KNEE: 26,
  L_ANKLE: 27,
  R_ANKLE: 28,
  L_HEEL: 29,
  R_HEEL: 30,
  L_FOOT: 31,
  R_FOOT: 32,
};

/** Segments dessinés dans l'overlay (torse + membres, sans le détail du visage). */
export const POSE_CONNECTIONS = [
  // Torse
  [LM.L_SHOULDER, LM.R_SHOULDER],
  [LM.L_SHOULDER, LM.L_HIP],
  [LM.R_SHOULDER, LM.R_HIP],
  [LM.L_HIP, LM.R_HIP],
  // Bras
  [LM.L_SHOULDER, LM.L_ELBOW],
  [LM.L_ELBOW, LM.L_WRIST],
  [LM.R_SHOULDER, LM.R_ELBOW],
  [LM.R_ELBOW, LM.R_WRIST],
  // Jambes
  [LM.L_HIP, LM.L_KNEE],
  [LM.L_KNEE, LM.L_ANKLE],
  [LM.L_ANKLE, LM.L_FOOT],
  [LM.L_ANKLE, LM.L_HEEL],
  [LM.R_HIP, LM.R_KNEE],
  [LM.R_KNEE, LM.R_ANKLE],
  [LM.R_ANKLE, LM.R_FOOT],
  [LM.R_ANKLE, LM.R_HEEL],
  // Tête / cou
  [LM.L_EAR, LM.L_SHOULDER],
  [LM.R_EAR, LM.R_SHOULDER],
];

/**
 * Groupes de landmarks qui doivent être visibles selon le patron de mouvement.
 * Sert au contrôle de cadrage : on refuse de compter tant que la posture n'est
 * pas exploitable, et on dit à l'utilisateur ce qui manque.
 */
export const FRAMING_GROUPS = {
  upper: {
    label: 'le buste et les bras',
    indices: [LM.L_SHOULDER, LM.R_SHOULDER, LM.L_ELBOW, LM.R_ELBOW, LM.L_WRIST, LM.R_WRIST, LM.L_HIP, LM.R_HIP],
    // Un seul côté suffit pour les mouvements de profil : on exige la moitié.
    minRatio: 0.5,
  },
  lower: {
    label: 'les jambes',
    indices: [LM.L_HIP, LM.R_HIP, LM.L_KNEE, LM.R_KNEE, LM.L_ANKLE, LM.R_ANKLE],
    minRatio: 0.5,
  },
  full: {
    label: 'tout le corps',
    indices: [
      LM.L_SHOULDER, LM.R_SHOULDER, LM.L_HIP, LM.R_HIP,
      LM.L_KNEE, LM.R_KNEE, LM.L_ANKLE, LM.R_ANKLE,
    ],
    minRatio: 0.5,
  },
  head: {
    label: 'la tête et les épaules',
    indices: [LM.L_EAR, LM.R_EAR, LM.L_SHOULDER, LM.R_SHOULDER, LM.L_HIP, LM.R_HIP],
    minRatio: 0.5,
  },
};

/** Visibilité d'un landmark (1 par défaut si le modèle ne la fournit pas). */
export function vis(lm, i) {
  const p = lm && lm[i];
  if (!p) return 0;
  return typeof p.visibility === 'number' ? p.visibility : 1;
}

/** Le point est-il dans le cadre (petite marge tolérée) ? */
function inFrame(p) {
  return !!p && p.x > -0.05 && p.x < 1.05 && p.y > -0.05 && p.y < 1.05;
}

/**
 * Contrôle de cadrage sur les landmarks normalisés.
 * @returns {{ok: boolean, label: string}} label = partie du corps manquante.
 */
export function checkFraming(landmarks, groupKey, minVisibility = 0.5) {
  const group = FRAMING_GROUPS[groupKey] || FRAMING_GROUPS.full;
  if (!landmarks) return { ok: false, label: group.label };
  let seen = 0;
  for (const i of group.indices) {
    if (vis(landmarks, i) >= minVisibility && inFrame(landmarks[i])) seen++;
  }
  const ok = seen / group.indices.length >= group.minRatio;
  return { ok, label: group.label };
}

/** Milieu de deux points ({x,y[,z]}). */
export function midpoint(a, b) {
  if (!a || !b) return null;
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: ((a.z || 0) + (b.z || 0)) / 2 };
}

/**
 * Angle (degrés) au point b formé par a-b-c, en 3D si z est disponible.
 * Les worldLandmarks portent un z métrique fiable, contrairement au z des
 * landmarks normalisés — c'est pour eux que cette fonction est prévue.
 */
export function angleAt(a, b, c) {
  if (!a || !b || !c) return null;
  const ab = [a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0)];
  const cb = [c.x - b.x, c.y - b.y, (c.z || 0) - (b.z || 0)];
  const dot = ab[0] * cb[0] + ab[1] * cb[1] + ab[2] * cb[2];
  const magAb = Math.hypot(ab[0], ab[1], ab[2]);
  const magCb = Math.hypot(cb[0], cb[1], cb[2]);
  if (!magAb || !magCb) return null;
  const cos = Math.max(-1, Math.min(1, dot / (magAb * magCb)));
  return (Math.acos(cos) * 180) / Math.PI;
}

/**
 * Longueur du torse dans l'image (épaules → hanches). Sert d'unité de mesure
 * pour rendre les déplacements verticaux indépendants de la distance à la
 * caméra. Renvoie null si le torse n'est pas exploitable.
 */
export function torsoScale(landmarks) {
  const sh = midpoint(landmarks[LM.L_SHOULDER], landmarks[LM.R_SHOULDER]);
  const hip = midpoint(landmarks[LM.L_HIP], landmarks[LM.R_HIP]);
  if (!sh || !hip) return null;
  const d = Math.hypot(sh.x - hip.x, sh.y - hip.y);
  return d > 0.02 ? d : null;
}

/**
 * Inclinaison du buste par rapport à la verticale, en degrés (0 = droit).
 * Positif ou négatif selon le côté ; on s'en sert pour détecter l'élan du corps
 * (triche au curl / aux élévations) et la fermeture de hanche.
 */
export function torsoTilt(landmarks) {
  const sh = midpoint(landmarks[LM.L_SHOULDER], landmarks[LM.R_SHOULDER]);
  const hip = midpoint(landmarks[LM.L_HIP], landmarks[LM.R_HIP]);
  if (!sh || !hip) return null;
  // y est orienté vers le bas : le vecteur hanche→épaule pointe vers le haut.
  const dx = sh.x - hip.x;
  const dy = hip.y - sh.y;
  if (dy === 0 && dx === 0) return null;
  return (Math.atan2(dx, dy) * 180) / Math.PI;
}
