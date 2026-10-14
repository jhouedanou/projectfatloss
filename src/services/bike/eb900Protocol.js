/**
 * Protocole de la console Domyos EB900 — fonctions pures, sans Bluetooth,
 * testables en node (scripts/test-bike.mjs).
 *
 * Trame d'état : 26 octets, entête F0 BC, renvoyée à chaque interrogation
 * (commande F0 AC). Avec le MTU Bluetooth par défaut (20 octets utiles), elle
 * arrive en deux notifications de 20 + 6 octets : il faut les recoller avant de
 * lire quoi que ce soit — sans ça, les octets 20-25 manquent et les champs lus
 * sont décalés.
 *
 *   octets 6-7   vitesse, km/h × 10 (big-endian)
 *   octet  9     cadence, tr/min
 *   octets 10-11 calories cumulées affichées par la console (kcal) ;
 *                FF FF au démarrage = pas encore de valeur
 *   octets 12-13 distance, km × 10
 *   octet  14    niveau de résistance
 *   octet  18    pouls des capteurs de poignée (0 = mains absentes)
 *   octet  22    bouton console : 06 = start, 07 = stop
 *
 * Ces faits du protocole sont publics (documentés par la communauté autour de
 * qdomyos-zwift) ; aucun code de qdomyos-zwift (GPLv3) n'est repris.
 */

const FRAME_HEADER = 0xf0;
/** Second octet des trames d'état envoyées par la console. */
const STATUS_FRAME = 0xbc;
export const EB900_FRAME_LENGTH = 26;
/** Taille d'une notification avec le MTU par défaut : la trame est coupée là. */
const BLE_CHUNK = 20;

/** Ajoute le checksum (somme des octets, 8 bits) à la fin d'une commande. */
const withChecksum = (bytes) => {
  const sum = bytes.reduce((acc, byte) => (acc + byte) & 0xff, 0);
  return Uint8Array.from([...bytes, sum]);
};
const command = (...bytes) => withChecksum([FRAME_HEADER, ...bytes]);

/**
 * Séquence de mise en route : la console répond à chaque commande, et en perd
 * si on enchaîne sans attendre sa réponse.
 */
export const INIT_SEQUENCE = [
  command(0xc8, 0x01),
  command(0xc9),
  command(0xa3),
  command(0xa4),
  command(0xa5),
  command(0xab),
  command(0xc4, 0x03),
];
/** Interrogation : la console renvoie une trame d'état. */
export const CMD_POLL = command(0xac);

/** Au-delà, la fin d'une trame coupée ne viendra plus : on l'abandonne. */
const PARTIAL_FRAME_TIMEOUT_MS = 1500;

/**
 * Puissance estimée : la console n'en publie pas. Couple croissant avec le
 * niveau de résistance (≈ 5 N·m au niveau 1, + 1,5 N·m par niveau), multiplié
 * par la vitesse angulaire du pédalier. Ordre de grandeur, pas une mesure :
 * niveau 8 à 80 tr/min ≈ 130 W.
 */
export function estimateDomyosWatts(cadence, resistance) {
  if (!cadence || cadence <= 0) return 0;
  const level = Math.max(1, Number(resistance) || 1);
  const torqueNm = 5 + 1.5 * (level - 1);
  return Math.round((torqueNm * cadence * 2 * Math.PI) / 60);
}

/**
 * Lit une trame d'état complète (26 octets). Renvoie null si ce n'en est pas
 * une. Les champs inconnus valent null, jamais 0.
 * @param {Uint8Array|number[]} bytes
 */
export function parseEb900Frame(bytes) {
  if (!bytes || bytes.length < EB900_FRAME_LENGTH) return null;
  if (bytes[0] !== FRAME_HEADER || bytes[1] !== STATUS_FRAME) return null;
  const u16 = (index) => (bytes[index] << 8) | bytes[index + 1];

  const cadence = bytes[9];
  const resistance = bytes[14] || null;
  return {
    speedKmh: u16(6) / 10,
    cadence,
    // FF FF tant que la console n'a pas démarré son compteur.
    kcalTotal: bytes[10] === 0xff ? null : u16(10),
    distanceKm: bytes[12] === 0xff ? null : u16(12) / 10,
    resistance,
    bpm: bytes[18] || null,
    watts: estimateDomyosWatts(cadence, resistance),
    button: bytes[22] === 0x06 ? 'start' : bytes[22] === 0x07 ? 'stop' : null,
  };
}

/**
 * Recolle les notifications en trames d'état de 26 octets.
 * `push(bytes)` renvoie la liste des trames complètes (souvent 0 ou 1).
 */
export class Eb900FrameAssembler {
  constructor() {
    this._pending = [];
    this._since = 0;
  }

  /**
   * Une trame d'état est-elle à moitié reçue ? (ne pas interroger pendant ce
   * temps). Une moitié trop ancienne est abandonnée, sinon l'interrogation
   * resterait bloquée pour toujours.
   */
  isWaiting(now = Date.now()) {
    const waiting = this._pending.length > 0 && this._pending[1] === STATUS_FRAME;
    if (waiting && now - this._since > PARTIAL_FRAME_TIMEOUT_MS) {
      this._pending = [];
      return false;
    }
    return waiting;
  }

  push(chunk, now = Date.now()) {
    const bytes = Array.from(chunk || []);
    if (!bytes.length) return [];
    const pending = this._pending;
    const completesFrame =
      pending.length === BLE_CHUNK &&
      pending[1] === STATUS_FRAME &&
      pending.length + bytes.length === EB900_FRAME_LENGTH;

    // La suite d'une trame coupée peut commencer par F0 par hasard : la taille
    // attendue (20 + 6) passe avant l'entête.
    if (completesFrame) this._pending = [...pending, ...bytes];
    else if (bytes[0] === FRAME_HEADER) {
      this._pending = bytes;
      this._since = now;
    } else if (pending.length) this._pending = [...pending, ...bytes];
    else return [];

    const frames = [];
    while (
      this._pending.length >= EB900_FRAME_LENGTH &&
      this._pending[0] === FRAME_HEADER &&
      this._pending[1] === STATUS_FRAME
    ) {
      frames.push(Uint8Array.from(this._pending.slice(0, EB900_FRAME_LENGTH)));
      this._pending = this._pending.slice(EB900_FRAME_LENGTH);
    }
    // Réponse courte à une commande (F0 C8…, F0 A3…) ou reste sans entête : on jette.
    if (this._pending.length && (this._pending[0] !== FRAME_HEADER || this._pending[1] !== STATUS_FRAME)) {
      if (this._pending.length >= 2) this._pending = [];
    }
    if (this._pending.length > EB900_FRAME_LENGTH * 2) this._pending = [];
    return frames;
  }
}
