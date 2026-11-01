/**
 * Découpe le titre d'un jour du programme, par exemple
 * « JOUR 7: RÉCUPÉRATION ACTIVE (Séance légère, Gainage) — Dimanche · S1 Adaptation » :
 *   name    « Récupération active »  (nom court, en minuscules lisibles)
 *   focus   « Séance légère, Gainage »
 *   weekday « Dimanche »
 *   week    « Semaine 1 · Adaptation »
 */
export function parseDayTitle(title = '') {
  const withoutDay = String(title).replace(/^JOUR \d+:\s*/i, '');
  const [main, rest = ''] = withoutDay.split(' — ');
  const match = main.match(/^(.*?)\s*\((.*)\)\s*$/);
  const [weekday = '', week = ''] = rest.split(' · ');
  return {
    name: sentenceCase((match ? match[1] : main).trim()),
    focus: match ? match[2].trim() : '',
    weekday: weekday.trim(),
    week: week.trim().replace(/^S(\d+)\s*(.*)$/, (_, n, phase) => (phase ? `Semaine ${n} · ${phase}` : `Semaine ${n}`)),
  };
}

/** « BAS DU CORPS A » → « Bas du corps A » (les lettres seules restent en capitale). */
function sentenceCase(text) {
  if (text !== text.toUpperCase()) return text;
  const words = text.toLowerCase().split(' ').map((word) => (word.length === 1 ? word.toUpperCase() : word));
  const sentence = words.join(' ');
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}
