/**
 * Intensité du programme réglée d'après les mesures de la balance.
 *
 * Trois niveaux. Ils ne changent ni les exercices ni les charges, seulement :
 *   - le repos entre les séries et entre les exercices (séance guidée) ;
 *   - les minutes de vélo du jour (check-list).
 *
 * Le niveau « automatique » compare la dernière pesée à une pesée d'environ
 * quatre semaines plus tôt (entre 10 et 60 jours) :
 *   1. FREIN — niveau « douce » :
 *      - la masse musculaire baisse d'au moins 1 kg par mois ;
 *      - ou le poids baisse de plus que l'objectif + 1,5 kg par mois.
 *   2. sinon ACCÉLÉRATION — niveau « soutenue » :
 *      - la masse grasse (poids × % de graisse) baisse de moins de la moitié
 *        de l'objectif mensuel ;
 *      - ou, sans mesure de graisse, le poids baisse de moins que
 *        l'objectif − 1 kg par mois.
 *   3. sinon niveau « normale ».
 * Le frein passe avant l'accélération : on ne pousse pas quelqu'un qui perd du
 * muscle. Sans pesée récente (21 jours) ou sans point de comparaison, le
 * niveau reste « normale ».
 *
 * Limite connue : une balance à impédance se trompe facilement d'un point de
 * graisse d'un jour à l'autre. D'où l'écart minimal de 10 jours entre les deux
 * mesures et des seuils larges.
 *
 * Ce fichier n'importe rien : les pesées lui sont passées par l'appelant
 * (WeightLossPlan.getCurrentIntensity).
 */

export const INTENSITY_LEVELS = {
  light: {
    key: 'light',
    label: 'Douce',
    setPause: { base: 25, increment: 5, max: 50 },
    exercisePause: 60,
    bikeMinutes: 15,
    effect: 'Pauses plus longues, vélo 15 min par jour.',
  },
  normal: {
    key: 'normal',
    label: 'Normale',
    setPause: { base: 15, increment: 5, max: 40 },
    exercisePause: 45,
    bikeMinutes: 20,
    effect: 'Pauses habituelles, vélo 20 min par jour.',
  },
  hard: {
    key: 'hard',
    label: 'Soutenue',
    setPause: { base: 10, increment: 5, max: 30 },
    exercisePause: 35,
    bikeMinutes: 25,
    effect: 'Pauses plus courtes, vélo 25 min par jour.',
  },
};

export const INTENSITY_MODES = ['auto', 'light', 'normal', 'hard'];
const MODE_KEY = 'pfl_intensity_mode';

const DAY_MS = 86400000;
const DAYS_PER_MONTH = 30.4;
// Dernière pesée plus vieille que cela : on ne déduit rien.
const MAX_AGE_DAYS = 21;
// Fenêtre où chercher la pesée de comparaison, et écart visé.
const MIN_SPAN_DAYS = 10;
const MAX_SPAN_DAYS = 60;
const TARGET_SPAN_DAYS = 28;

const MUSCLE_LOSS_KG_PER_MONTH = 1;
const TOO_FAST_MARGIN_KG = 1.5;
const TOO_SLOW_MARGIN_KG = 1;
const FAT_SHARE_OF_GOAL = 0.5;

// ── Réglage (automatique ou niveau choisi) ───────────────────────────

export function getIntensityMode() {
  try {
    const stored = localStorage.getItem(MODE_KEY);
    return INTENSITY_MODES.includes(stored) ? stored : 'auto';
  } catch {
    return 'auto';
  }
}

export function setIntensityMode(mode) {
  if (!INTENSITY_MODES.includes(mode)) return false;
  try {
    if (mode === 'auto') localStorage.removeItem(MODE_KEY);
    else localStorage.setItem(MODE_KEY, mode);
    return true;
  } catch {
    return false;
  }
}

// ── Calcul ───────────────────────────────────────────────────────────

const fmt = (value) =>
  Math.abs(value).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const timeOf = (record) => new Date(record.date).getTime();

/** Pesée la plus proche de 28 jours avant `latest`, entre 10 et 60 jours avant. */
function referenceFor(latest, records) {
  const latestTime = timeOf(latest);
  let best = null;
  let bestGap = Infinity;
  for (const record of records) {
    const span = (latestTime - timeOf(record)) / DAY_MS;
    if (span < MIN_SPAN_DAYS || span > MAX_SPAN_DAYS) continue;
    const gap = Math.abs(span - TARGET_SPAN_DAYS);
    if (gap < bestGap) {
      best = record;
      bestGap = gap;
    }
  }
  return best;
}

/** Évolution par mois entre deux mesures datées (positif = hausse). */
function monthlyChange(fromValue, toValue, fromRecord, toRecord) {
  const days = (timeOf(toRecord) - timeOf(fromRecord)) / DAY_MS;
  return ((toValue - fromValue) / days) * DAYS_PER_MONTH;
}

const hasNumber = (record, key) => Number.isFinite(Number(record?.composition?.[key]))
  && record.composition[key] !== '' && record.composition[key] != null;

const fatMassKg = (record) => (Number(record.weight) * Number(record.composition.bodyFat)) / 100;

/**
 * Niveau déduit des pesées.
 * @param {Object} p
 * @param {Array}  p.records pesées ({ weight, date, composition? })
 * @param {number} p.goalKg  objectif de perte par mois
 * @param {Date}   [p.now]
 * @returns {{ level: 'light'|'normal'|'hard', reason: string, stats: Object }}
 */
export function computeAutoIntensity({ records = [], goalKg = 3.5, now = new Date() }) {
  const valid = records
    .filter((r) => r && Number(r.weight) > 0 && !Number.isNaN(timeOf(r)))
    .sort((a, b) => timeOf(a) - timeOf(b));
  const stats = {};

  const latest = valid[valid.length - 1];
  if (!latest) {
    return { level: 'normal', reason: 'Pas encore de pesée : niveau normal.', stats };
  }
  if ((now.getTime() - timeOf(latest)) / DAY_MS > MAX_AGE_DAYS) {
    return { level: 'normal', reason: `Dernière pesée de plus de ${MAX_AGE_DAYS} jours : niveau normal.`, stats };
  }

  // Poids : dernière pesée contre une pesée d'il y a ~4 semaines.
  const weightRef = referenceFor(latest, valid);
  if (weightRef) {
    stats.weightLossPerMonth = -monthlyChange(Number(weightRef.weight), Number(latest.weight), weightRef, latest);
  }

  // Muscle et graisse : dernière mesure de la balance contre une plus ancienne.
  const withMuscle = valid.filter((r) => hasNumber(r, 'muscleKg'));
  const latestMuscle = withMuscle[withMuscle.length - 1];
  const muscleRef = latestMuscle && referenceFor(latestMuscle, withMuscle);
  if (muscleRef && (now.getTime() - timeOf(latestMuscle)) / DAY_MS <= MAX_AGE_DAYS) {
    stats.muscleChangePerMonth = monthlyChange(
      Number(muscleRef.composition.muscleKg), Number(latestMuscle.composition.muscleKg), muscleRef, latestMuscle
    );
  }

  const withFat = valid.filter((r) => hasNumber(r, 'bodyFat'));
  const latestFat = withFat[withFat.length - 1];
  const fatRef = latestFat && referenceFor(latestFat, withFat);
  if (fatRef && (now.getTime() - timeOf(latestFat)) / DAY_MS <= MAX_AGE_DAYS) {
    stats.fatLossPerMonth = -monthlyChange(fatMassKg(fatRef), fatMassKg(latestFat), fatRef, latestFat);
  }

  if (stats.weightLossPerMonth == null && stats.muscleChangePerMonth == null && stats.fatLossPerMonth == null) {
    return {
      level: 'normal',
      reason: `Il faut deux pesées à au moins ${MIN_SPAN_DAYS} jours d'écart pour régler le niveau.`,
      stats,
    };
  }

  // 1. Frein.
  if (stats.muscleChangePerMonth != null && stats.muscleChangePerMonth <= -MUSCLE_LOSS_KG_PER_MONTH) {
    return {
      level: 'light',
      reason: `Vous perdez du muscle (−${fmt(stats.muscleChangePerMonth)} kg par mois) : plus de repos.`,
      stats,
    };
  }
  if (stats.weightLossPerMonth != null && stats.weightLossPerMonth > goalKg + TOO_FAST_MARGIN_KG) {
    return {
      level: 'light',
      reason: `Le poids baisse trop vite (−${fmt(stats.weightLossPerMonth)} kg par mois) : plus de repos.`,
      stats,
    };
  }

  // 2. Accélération.
  if (stats.fatLossPerMonth != null) {
    if (stats.fatLossPerMonth < goalKg * FAT_SHARE_OF_GOAL) {
      const reason = stats.fatLossPerMonth <= 0
        ? `La graisse ne baisse pas (${stats.fatLossPerMonth < 0 ? '+' : ''}${fmt(stats.fatLossPerMonth)} kg par mois) : on accélère.`
        : `La graisse baisse lentement (−${fmt(stats.fatLossPerMonth)} kg par mois) : on accélère.`;
      return { level: 'hard', reason, stats };
    }
  } else if (stats.weightLossPerMonth != null && stats.weightLossPerMonth < goalKg - TOO_SLOW_MARGIN_KG) {
    const reason = stats.weightLossPerMonth <= 0
      ? 'Le poids ne baisse pas : on accélère.'
      : `Le poids baisse lentement (−${fmt(stats.weightLossPerMonth)} kg par mois) : on accélère.`;
    return { level: 'hard', reason, stats };
  }

  // 3. Rien à corriger.
  const reason = stats.fatLossPerMonth != null
    ? `La graisse baisse au bon rythme (−${fmt(stats.fatLossPerMonth)} kg par mois).`
    : `Le poids baisse au bon rythme (−${fmt(stats.weightLossPerMonth ?? 0)} kg par mois).`;
  return { level: 'normal', reason, stats };
}

/**
 * Niveau appliqué : celui choisi à la main, sinon le niveau automatique.
 * @returns {Object} réglages du niveau + { mode, auto, reason }
 */
export function resolveIntensity({ records, goalKg, now, mode = getIntensityMode() }) {
  const auto = computeAutoIntensity({ records, goalKg, now });
  const manual = mode !== 'auto' && INTENSITY_LEVELS[mode];
  const level = manual || INTENSITY_LEVELS[auto.level];
  return {
    ...level,
    mode: manual ? mode : 'auto',
    auto,
    reason: manual ? 'Niveau choisi à la main.' : auto.reason,
  };
}
