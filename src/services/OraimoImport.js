/**
 * Lecture d'une capture d'écran de l'app « oraimo home » (balance à impédance).
 *
 * La reconnaissance de texte (Tesseract) tourne dans le navigateur : la
 * capture n'est envoyée à aucun serveur. Seuls le moteur et le modèle de
 * langue française sont téléchargés une fois depuis le CDN jsDelivr, puis
 * gardés en cache par le navigateur.
 *
 * L'écran oraimo range les valeurs en grille : le libellé (« Poids »,
 * « Masse musculaire »…) au-dessus, la valeur juste en dessous, dans la même
 * colonne. On cherche donc chaque libellé, puis le nombre le plus proche sous
 * lui ; à défaut (écran en liste), le nombre à sa droite sur la même ligne.
 * Les valeurs restent à vérifier : l'utilisateur les relit avant d'enregistrer.
 */

import { COMPOSITION_FIELDS, WEIGHT_FIELD, roundTo, isPlausible } from './BodyComposition';

// Début (sans accents, en minuscules) des mots qui désignent chaque valeur.
// Pour les libellés sur deux lignes, c'est le mot du bas qui sert de repère.
const ANCHORS = {
  weight: ['poids', 'weight'],
  bmi: ['imc', 'bmi'],
  bodyFat: ['corpor', 'bodyfat'],
  muscleKg: ['muscul', 'muscle'],
  visceral: ['viscer', 'visceral'],
  water: ['eau', 'water'],
  boneKg: ['osseu', 'bone'],
  protein: ['protei', 'protein'],
  bmr: ['bmr'],
};

const FIELDS = [WEIGHT_FIELD, ...COMPOSITION_FIELDS];
const NUMBER_RE = /\d+(?:[.,]\d+)?/;

/** « Viscérale » → « viscerale » : minuscules, sans accents ni ponctuation. */
const normalize = (text) =>
  String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const toItem = (word) => {
  const { x0, y0, x1, y1 } = word.bbox;
  return {
    text: String(word.text || ''),
    norm: normalize(word.text),
    x0, y0, x1, y1,
    cx: (x0 + x1) / 2,
    cy: (y0 + y1) / 2,
    h: Math.max(1, y1 - y0),
  };
};

/**
 * Nombre lu dans un mot, ramené dans la plage plausible du champ. L'OCR perd
 * parfois la virgule (« 47.1 » lu « 471 ») : on essaie aussi /10 et /100.
 */
function readValue(text, field) {
  const match = String(text).match(NUMBER_RE);
  if (!match) return null;
  let value = parseFloat(match[0].replace(',', '.'));
  if (field.unit === 'kg' && /lb/i.test(text)) value *= 0.45359237;
  for (const candidate of [value, value / 10, value / 100]) {
    if (isPlausible(candidate, field)) return roundTo(candidate, field.decimals);
  }
  return null;
}

/** Nombre sous le libellé, dans sa colonne ; sinon à sa droite, sur sa ligne. */
function findValue(anchor, numbers, field, { width, height }) {
  const below = numbers.filter((n) =>
    n.y0 >= anchor.y1 - anchor.h * 0.3
    && n.y0 - anchor.y1 <= height * 0.08
    && Math.abs(n.cx - anchor.cx) <= width * 0.14);
  if (below.length) {
    // Première rangée sous le libellé ; s'il y a plusieurs mots (bruit de
    // l'OCR), le plus long porte la valeur (« 33.3% » plutôt que « 0 »).
    const top = Math.min(...below.map((n) => n.y0));
    const row = below
      .filter((n) => n.y0 - top < anchor.h)
      .sort((a, b) => b.text.length - a.text.length);
    for (const n of row) {
      const value = readValue(n.text, field);
      if (value != null) return value;
    }
  }
  const right = numbers
    .filter((n) => Math.abs(n.cy - anchor.cy) < anchor.h * 0.8 && n.x0 > anchor.x1)
    .sort((a, b) => a.x0 - b.x0);
  for (const n of right) {
    const value = readValue(n.text, field);
    if (value != null) return value;
  }
  return null;
}

/** Date complète affichée sur la capture (2026/11/10, 10/11/2026…), sinon null. */
function findDate(text) {
  const iso = text.match(/(20\d{2})[/.-](\d{1,2})[/.-](\d{1,2})/);
  const fr = text.match(/(\d{1,2})[/.-](\d{1,2})[/.-](20\d{2})/);
  const [year, month, day] = iso
    ? [iso[1], iso[2], iso[3]]
    : fr ? [fr[3], fr[2], fr[1]] : [];
  if (!year) return null;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(date.getTime()) || date.getMonth() !== Number(month) - 1 || date > new Date()) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Extrait les valeurs d'une capture à partir des mots reconnus et de leur
 * position.
 * @param {Array<{ text: string, bbox: { x0, y0, x1, y1 } }>} words
 * @param {{ width: number, height: number }} size - taille de l'image
 * @returns {{ values: Object, isAverage: boolean, date: string|null }}
 */
export function parseOraimoWords(words, size) {
  const items = (words || []).filter((w) => w?.bbox && w.text).map(toItem);
  // La barre d'état du téléphone (heure, batterie) n'est pas une mesure.
  const content = items.filter((item) => item.cy > size.height * 0.04);
  const numbers = content.filter((item) => NUMBER_RE.test(item.text));

  const values = {};
  for (const field of FIELDS) {
    const anchors = content.filter((item) => ANCHORS[field.key].some((a) => item.norm.startsWith(a)));
    for (const anchor of anchors) {
      const value = findValue(anchor, numbers, field, size);
      if (value != null) {
        values[field.key] = value;
        break;
      }
    }
  }

  const text = content.map((item) => item.text).join(' ');
  return {
    values,
    // Onglet « Mois » ou « semaine » : « Valeur moyenne anthropométrique ».
    isAverage: content.some((item) => item.norm.startsWith('moyenne')),
    date: findDate(text),
  };
}

/** Réunit les lectures de plusieurs captures (la liste oraimo défile). */
export function mergeReadings(readings) {
  return readings.reduce(
    (merged, reading) => ({
      values: { ...reading.values, ...merged.values },
      isAverage: merged.isAverage || reading.isAverage,
      date: merged.date || reading.date,
    }),
    { values: {}, isAverage: false, date: null }
  );
}

async function imageSize(file) {
  const bitmap = await createImageBitmap(file);
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close?.();
  return size;
}

/**
 * Lit une ou plusieurs captures oraimo.
 * @param {File[]} files
 * @param {(progress: number) => void} [onProgress] - de 0 à 1
 * @returns {Promise<{ values: Object, isAverage: boolean, date: string|null }>}
 */
export async function readOraimoScreenshots(files, onProgress) {
  const { createWorker } = await import('tesseract.js');
  let current = 0;
  const worker = await createWorker('fra', 1, {
    logger: (message) => {
      if (message.status === 'recognizing text' && typeof message.progress === 'number') {
        onProgress?.((current + message.progress) / files.length);
      }
    },
  });
  try {
    const readings = [];
    for (const [index, file] of files.entries()) {
      current = index;
      const size = await imageSize(file);
      const { data } = await worker.recognize(file, {}, { blocks: true });
      const words = (data.blocks || []).flatMap((block) =>
        block.paragraphs.flatMap((paragraph) => paragraph.lines.flatMap((line) => line.words)));
      readings.push(parseOraimoWords(words, size));
    }
    onProgress?.(1);
    return mergeReadings(readings);
  } finally {
    await worker.terminate();
  }
}
