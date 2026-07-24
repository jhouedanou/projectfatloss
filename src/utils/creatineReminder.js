/**
 * Rappel créatine — 5 g de créatine monohydrate, une prise par jour.
 * Contrairement à un brûleur caféiné, la créatine n'a pas de fenêtre d'action :
 * seule la régularité compte (dose quotidienne, jours d'entraînement comme de repos).
 * Génère un événement .ics quotidien téléchargeable (Agenda iOS/Android/desktop).
 */

export const CREATINE_INTAKE_KEY = 'creatineIntakeAt';
export const DAILY_DOSE_MS = 24 * 60 * 60 * 1000; // 24 h
export const CREATINE_DOSE_G = 5;

// Horodatage de la dernière prise enregistrée (ms) ou null.
export function getLastDoseAt() {
  try {
    const v = localStorage.getItem(CREATINE_INTAKE_KEY);
    return v ? parseInt(v, 10) : null;
  } catch (e) {
    return null;
  }
}

// Vrai si la dose du jour est déjà enregistrée.
export function isTakenToday(lastDoseMs = getLastDoseAt(), now = Date.now()) {
  if (!lastDoseMs) return false;
  const a = new Date(lastDoseMs);
  const b = new Date(now);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Échappement champ texte iCalendar (RFC 5545).
function icsEscape(s) {
  return String(s).replace(/([,;\\])/g, '\\$1').replace(/\r?\n/g, '\\n');
}

// Format date UTC iCalendar: YYYYMMDDTHHMMSSZ
function icsDate(ms) {
  return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Télécharge un .ics quotidien pour la prise de créatine, calé 24 h après
 * referenceMs (par défaut : maintenant). Alarme -5 min, répétition quotidienne.
 */
export function downloadCreatineReminder(referenceMs = Date.now()) {
  const startMs = referenceMs + DAILY_DOSE_MS;
  const endMs = startMs + 10 * 60 * 1000;
  const when = new Date(startMs).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const title = `Créatine — ${CREATINE_DOSE_G} g`;
  const description = `Prendre ${CREATINE_DOSE_G} g de créatine monohydrate avec un grand verre d'eau (tous les jours, vers ${when}, entraînement ou non).`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//projectfatloss//creatine//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:creatine-${startMs}@projectfatloss`,
    `DTSTAMP:${icsDate(Date.now())}`,
    `DTSTART:${icsDate(startMs)}`,
    `DTEND:${icsDate(endMs)}`,
    'RRULE:FREQ=DAILY',
    `SUMMARY:${icsEscape(title)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsEscape(title)}`,
    'TRIGGER:-PT5M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'creatine-rappel.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
