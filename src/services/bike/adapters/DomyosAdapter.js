/**
 * Adapter Domyos (EB900 et vélos Domyos apparentés) — BEST-EFFORT, NON VALIDÉ.
 *
 * L'EB900 n'expose pas FTMS : la console parle un protocole propriétaire sur un
 * service UART transparent ISSC. Le principe (service/caractéristiques, trame
 * d'entête 0xF0, checksum = somme des octets) est de notoriété publique et
 * réimplémenté ici d'après la documentation du protocole ; aucun code de
 * qdomyos-zwift (GPLv3) n'est repris.
 *
 * Les décalages d'octets varient selon le firmware. Avant de se fier aux
 * valeurs, calibrer avec le frame-logger :
 *
 *   1. activer `DomyosAdapter.debug = true` (ou `localStorage.domyos_debug = '1'`)
 *   2. pédaler à vitesse connue affichée sur la console
 *   3. lire les trames hex dans la console du navigateur, ou
 *      `window.__domyosFrames` (100 dernières trames)
 *   4. ajuster EB900_LAYOUT ci-dessous
 *
 * Tant que la calibration n'est pas faite, l'adapter FTMS (via un pont
 * qdomyos-zwift) et le mode démo restent les chemins fiables.
 */

import BleBridge from '../BleBridge';

export const DOMYOS_SERVICE = '49535343-fe7d-4ae5-8fa9-9fafd205e455';
export const DOMYOS_WRITE_CHAR = '49535343-8841-43f4-a8d4-ecbe34729bb3';
export const DOMYOS_NOTIFY_CHAR = '49535343-1e4d-4bd9-ba61-23c647249616';

const FRAME_HEADER = 0xf0;
/** Entête des trames de données envoyées par la console. */
const DATA_FRAME = 0xbc;

/** Ajoute le checksum (somme des octets, 8 bits) à la fin d'une commande. */
const withChecksum = (bytes) => {
  const sum = bytes.reduce((acc, byte) => (acc + byte) & 0xff, 0);
  return Uint8Array.from([...bytes, sum]);
};

const CMD_INIT = withChecksum([0xf0, 0xa3]);
const CMD_START = withChecksum([0xf0, 0xa5, 0x01, 0x01]);
const CMD_POLL = withChecksum([0xf0, 0xac]);

/**
 * Décalages d'octets dans la trame de données, à calibrer par firmware.
 * `scale` convertit l'entier brut dans l'unité affichée.
 */
export const EB900_LAYOUT = {
  speedKmh: { offset: 6, size: 2, scale: 0.1 },
  cadence: { offset: 8, size: 2, scale: 1 },
  bpm: { offset: 10, size: 1, scale: 1 },
  kcalTotal: { offset: 12, size: 2, scale: 1 },
  resistance: { offset: 14, size: 1, scale: 1 },
};

const readField = (view, field) => {
  if (!field) return null;
  const { offset, size, scale } = field;
  if (offset + size > view.byteLength) return null;
  const raw = size === 1 ? view.getUint8(offset) : view.getUint16(offset, false);
  return Math.round(raw * scale * 10) / 10;
};

const toHex = (view) =>
  Array.from(new Uint8Array(view.buffer, view.byteOffset, view.byteLength))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join(' ');

export default class DomyosAdapter {
  constructor({ debug = false } = {}) {
    this.label = 'Vélo Domyos';
    this._listeners = new Set();
    this._handle = null;
    this._pollTimer = null;
    this._last = { speedKmh: null, cadence: null, watts: null, bpm: null, kcalTotal: null };
    let stored = false;
    try {
      stored = localStorage.getItem('domyos_debug') === '1';
    } catch (error) {
      stored = false;
    }
    this.debug = debug || stored;
  }

  onMetrics(cb) {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  onDisconnect(cb) {
    this._disconnectCb = cb;
  }

  /**
   * @param {Object} [options]
   * @param {Object} [options.handle] handle déjà connecté par la détection.
   *   Fourni, il est réutilisé tel quel : ni sélecteur système, ni seconde
   *   connexion — la console n'en accepte qu'une à la fois.
   */
  async start({ handle } = {}) {
    if (!BleBridge.isSupported()) {
      throw new Error('Bluetooth non disponible sur cette plateforme.');
    }
    if (handle) {
      this._handle = handle;
    } else {
      // Filtre sur le nom seul : la console n'annonce pas son service ISSC
      // dans sa trame d'annonce, un filtre `services` renverrait une liste vide.
      this._handle = await BleBridge.requestDevice({
        services: [],
        namePrefix: 'Domyos',
        optionalServices: [DOMYOS_SERVICE],
      });
      await BleBridge.connect(this._handle);
    }
    this.label = `Domyos · ${this._handle.name}`;
    BleBridge.onDisconnect(this._handle, () => this._disconnectCb?.());
    await BleBridge.subscribe(this._handle, DOMYOS_SERVICE, DOMYOS_NOTIFY_CHAR, (view) => this._onFrame(view));

    await this._send(CMD_INIT);
    await this._send(CMD_START);
    // La console ne pousse rien spontanément : elle répond à une interrogation.
    this._pollTimer = setInterval(() => {
      this._send(CMD_POLL).catch(() => {});
    }, 1000);
  }

  async _send(bytes) {
    if (!this._handle) return;
    await BleBridge.write(this._handle, DOMYOS_SERVICE, DOMYOS_WRITE_CHAR, bytes);
  }

  _onFrame(view) {
    if (this.debug) {
      const hex = toHex(view);
      console.log('[Domyos]', hex);
      window.__domyosFrames = [...(window.__domyosFrames || []), hex].slice(-100);
    }
    if (view.byteLength < 4) return;
    if (view.getUint8(0) !== FRAME_HEADER || view.getUint8(1) !== DATA_FRAME) return;

    const speedKmh = readField(view, EB900_LAYOUT.speedKmh);
    const cadence = readField(view, EB900_LAYOUT.cadence);
    const bpm = readField(view, EB900_LAYOUT.bpm);
    const kcalTotal = readField(view, EB900_LAYOUT.kcalTotal);
    const resistance = readField(view, EB900_LAYOUT.resistance);

    // La console n'expose pas de puissance : estimation à partir de la vitesse
    // et de la résistance (ordre de grandeur, pas une mesure).
    const watts =
      speedKmh != null ? Math.round(0.3 * speedKmh * speedKmh * (1 + (resistance || 0) / 15)) : null;

    const parsed = { speedKmh, cadence, watts, bpm: bpm || null, kcalTotal };
    Object.keys(this._last).forEach((key) => {
      if (parsed[key] != null) this._last[key] = parsed[key];
    });
    this._listeners.forEach((cb) => cb({ ...this._last, ts: Date.now() }));
  }

  stop() {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
    }
    if (this._handle) BleBridge.disconnect(this._handle);
    this._handle = null;
    this._listeners.clear();
  }
}
