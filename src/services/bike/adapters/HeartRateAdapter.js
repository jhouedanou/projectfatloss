/**
 * Adapter Heart Rate standard (service 0x180D, mesure 0x2A37).
 * Pour une ceinture cardio : le pouls de la ceinture prime sur le capteur
 * de poignée du vélo, peu fiable.
 *
 * N'émet que `{ bpm, ts }` — il est fusionné aux métriques vélo par
 * `useBikeMetrics`.
 */

import BleBridge from '../BleBridge';

export const HR_SERVICE = 0x180d;
export const HR_MEASUREMENT = 0x2a37;

export default class HeartRateAdapter {
  constructor() {
    this.label = 'Ceinture cardio';
    this._listeners = new Set();
    this._handle = null;
  }

  onMetrics(cb) {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  onDisconnect(cb) {
    this._disconnectCb = cb;
  }

  async start() {
    if (!BleBridge.isSupported()) {
      throw new Error('Bluetooth non disponible sur cette plateforme.');
    }
    this._handle = await BleBridge.requestDevice({ services: [HR_SERVICE] });
    this.label = `Cardio · ${this._handle.name}`;
    await BleBridge.connect(this._handle);
    BleBridge.onDisconnect(this._handle, () => this._disconnectCb?.());
    await BleBridge.subscribe(this._handle, HR_SERVICE, HR_MEASUREMENT, (view) => {
      // bit 0 des flags : 0 = BPM sur uint8, 1 = BPM sur uint16.
      const flags = view.getUint8(0);
      const bpm = flags & 0x01 ? view.getUint16(1, true) : view.getUint8(1);
      this._listeners.forEach((cb) => cb({ bpm, ts: Date.now() }));
    });
  }

  stop() {
    if (this._handle) BleBridge.disconnect(this._handle);
    this._handle = null;
    this._listeners.clear();
  }
}
