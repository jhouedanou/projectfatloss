/**
 * Rappel Lipo 6 — 2e gélule ~6 h après la 1re prise.
 * Génère un événement .ics téléchargeable (ouvre l'Agenda iOS/Android/desktop).
 */

export const LIPO6_INTAKE_KEY = 'caffeineIntakeAt';
export const SECOND_DOSE_MS = 6 * 60 * 60 * 1000; // 6 h

// Horodatage de la 1re prise du jour (ms) ou null.
export function getFirstDoseAt() {
  try {
    const v = localStorage.getItem(LIPO6_INTAKE_KEY);
    return v ? parseInt(v, 10) : null;
  } catch (e) {
    return null;
  }
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
 * Télécharge un .ics pour la 2e gélule, calé 6 h après firstDoseMs.
 * Alarme -5 min. Ouvre l'app Agenda à l'ouverture du fichier.
 */
export function downloadLipo6Reminder(firstDoseMs) {
  if (!firstDoseMs) return;
  const startMs = firstDoseMs + SECOND_DOSE_MS;
  const endMs = startMs + 15 * 60 * 1000;
  const when = new Date(startMs).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const title = 'Lipo 6 — 2e gélule';
  const description = `Prendre la 2e gélule de Nutrex Lipo 6 Black, hors repas (~6 h après la 1re, vers ${when}).`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//projectfatloss//lipo6//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:lipo6-${startMs}@projectfatloss`,
    `DTSTAMP:${icsDate(Date.now())}`,
    `DTSTART:${icsDate(startMs)}`,
    `DTEND:${icsDate(endMs)}`,
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
  a.download = 'lipo6-rappel.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
