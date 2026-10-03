/**
 * Check-list du jour (accueil) : le vélo se fait hors de l'application, on
 * coche simplement les blocs faits.
 *
 * `daily_checklist` : { 'YYYY-MM-DD': { [itemId]: true | idSéanceCardio } }
 *   - bloc de vélo coché → une séance cardio « vélo » est créée (elle compte
 *     dans les minutes de la semaine, se synchronise comme les autres) et son
 *     id est mémorisé ; décocher supprime cette séance ;
 *   - autres cases cochées à la main (pas) → true.
 */

import { dateKey } from './HabitStorage';
import { addCardioSession, deleteCardioSession, getCardioSessions } from './CardioStorage';
import { estimateBikeCalories } from './WeightLossPlan';

const CHECKLIST_KEY = 'daily_checklist';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(CHECKLIST_KEY)) || {};
  } catch {
    return {};
  }
}

function writeDay(date, day) {
  const all = readAll();
  const key = dateKey(date);
  if (Object.keys(day).length) all[key] = day;
  else delete all[key];
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify(all));
}

/** État coché des cases d'un jour. */
export function getChecklistDay(date = new Date()) {
  return readAll()[dateKey(date)] || {};
}

/** Un bloc de vélo est coché si sa séance cardio existe encore. */
export function isBikeItemDone(day, itemId) {
  const id = day[itemId];
  return id != null && getCardioSessions().some((s) => s.id === id);
}

/** Coche ou décoche un bloc de vélo de `minutes` minutes. */
export function toggleBikeItem(date, itemId, minutes) {
  const day = { ...getChecklistDay(date) };
  if (isBikeItemDone(day, itemId)) {
    deleteCardioSession(day[itemId]);
    delete day[itemId];
  } else {
    const record = addCardioSession({
      type: 'bike',
      duration: minutes,
      calories: estimateBikeCalories(minutes),
      notes: JSON.stringify({ source: 'checklist', item: itemId }),
    });
    day[itemId] = record.id;
  }
  writeDay(date, day);
  return day;
}

/** Coche ou décoche une case simple (sans séance associée). */
export function toggleManualItem(date, itemId) {
  const day = { ...getChecklistDay(date) };
  if (day[itemId]) delete day[itemId];
  else day[itemId] = true;
  writeDay(date, day);
  return day;
}
