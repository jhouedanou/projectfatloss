/**
 * Adapter FTMS (Fitness Machine Service, 0x1826) — caractéristique
 * « Indoor Bike Data » 0x2AD2.
 *
 * Couvre tout vélo FTMS standard, ainsi que l'EB900 exposé via un pont
 * qdomyos-zwift (QZ publie une machine FTMS virtuelle).
 *
 * Le parseur est piloté strictement par le bitfield de flags des 2 premiers
 * octets : chaque bit présent consomme sa taille et décale le curseur. Les
 * champs absents restent `null`.
 */

import BleBridge from '../BleBridge';

export const FTMS_SERVICE = 0x1826;
export const INDOOR_BIKE_DATA = 0x2ad2;

/**
 * Décode une trame Indoor Bike Data.
 * @param {DataView} view
 * @returns {Object} champs présents, les autres à null
 */
export function parseIndoorBikeData(view) {
  const flags = view.getUint16(0, true);
  let offset = 2;

  const out = {
    speedKmh: null,
    cadence: null,
    watts: null,
    bpm: null,
    kcalTotal: null,
    distanceM: null,
    resistance: null,
  };

  // bit 0 « More Data » : à 0, la vitesse instantanée EST présente (spec inversée).
  if (!(flags & 0x0001)) {
    out.speedKmh = view.getUint16(offset, true) / 100;
    offset += 2;
  }
  if (flags & 0x0002) offset += 2; // vitesse moyenne
  if (flags & 0x0004) {
    out.cadence = view.getUint16(offset, true) / 2; // 0,5 tr/min
    offset += 2;
  }
  if (flags & 0x0008) offset += 2; // cadence moyenne
  if (flags & 0x0010) {
    out.distanceM = view.getUint8(offset) | (view.getUint8(offset + 1) << 8) | (view.getUint8(offset + 2) << 16);
    offset += 3;
  }
  if (flags & 0x0020) {
    out.resistance = view.getInt16(offset, true);
    offset += 2;
  }
  if (flags & 0x0040) {
    out.watts = view.getInt16(offset, true);
    offset += 2;
  }
  if (flags & 0x0080) offset += 2; // puissance moyenne
  if (flags & 0x0100) {
    out.kcalTotal = view.getUint16(offset, true); // énergie totale (kcal)
    offset += 2; // + énergie/heure (uint16) + énergie/minute (uint8)
    offset += 3;
  }
  if (flags & 0x0200) {
    out.bpm = view.getUint8(offset);
    offset += 1;
  }
  // Les champs restants (MET, temps écoulé, temps restant) ne sont pas utilisés.

  return out;
}

export default class FtmsAdapter {
  constructor() {
    this.label = 'Vélo FTMS';
    this._listeners = new Set();
    this._handle = null;
    this._last = { speedKmh: null, cadence: null, watts: null, bpm: null, kcalTotal: null };
  }

  onMetrics(cb) {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  /** Callback invoqué si le vélo se déconnecte pendant la séance. */
  onDisconnect(cb) {
    this._disconnectCb = cb;
  }

  async start() {
    if (!BleBridge.isSupported()) {
      throw new Error('Bluetooth non disponible sur cette plateforme.');
    }
    this._handle = await BleBridge.requestDevice({
      services: [FTMS_SERVICE],
      optionalServices: [0x180d, 0x180a],
    });
    this.label = `FTMS · ${this._handle.name}`;
    await BleBridge.connect(this._handle);
    BleBridge.onDisconnect(this._handle, () => this._disconnectCb?.());
    await BleBridge.subscribe(this._handle, FTMS_SERVICE, INDOOR_BIKE_DATA, (view) => this._onFrame(view));
  }

  _onFrame(view) {
    let parsed;
    try {
      parsed = parseIndoorBikeData(view);
    } catch (error) {
      return; // trame tronquée : on ignore
    }
    // Les champs absents d'une trame gardent la dernière valeur connue.
    Object.keys(this._last).forEach((key) => {
      if (parsed[key] != null) this._last[key] = parsed[key];
    });
    this._listeners.forEach((cb) => cb({ ...this._last, ts: Date.now() }));
  }

  stop() {
    if (this._handle) BleBridge.disconnect(this._handle);
    this._handle = null;
    this._listeners.clear();
  }
}
