/**
 * Adapter Domyos EB900 (et vélos Domyos apparentés).
 *
 * L'EB900 n'expose pas FTMS : la console parle un protocole propriétaire sur un
 * service UART transparent ISSC. Le décodage des trames est dans
 * `../eb900Protocol.js` ; ici, seulement le transport : connexion, séquence de
 * mise en route, interrogation toutes les 500 ms.
 *
 * Diagnostic : `localStorage.domyos_debug = '1'` journalise chaque
 * notification et chaque trame recollée (`window.__domyosFrames`).
 */

import BleBridge from '../BleBridge';
import { CMD_POLL, Eb900FrameAssembler, INIT_SEQUENCE, parseEb900Frame } from '../eb900Protocol';

export const DOMYOS_SERVICE = '49535343-fe7d-4ae5-8fa9-9fafd205e455';
export const DOMYOS_WRITE_CHAR = '49535343-8841-43f4-a8d4-ecbe34729bb3';
export const DOMYOS_NOTIFY_CHAR = '49535343-1e4d-4bd9-ba61-23c647249616';

const POLL_MS = 500;
const REPLY_TIMEOUT_MS = 600;

const toHex = (bytes) => Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join(' ');

const logFrame = (label, bytes) => {
  const hex = `${label} ${toHex(bytes)}`;
  console.log('[Domyos]', hex);
  window.__domyosFrames = [...(window.__domyosFrames || []), hex].slice(-100);
};

export default class DomyosAdapter {
  constructor({ debug = false } = {}) {
    this.label = 'Vélo Domyos';
    this.calorieLabel = 'console EB900';
    this._listeners = new Set();
    this._handle = null;
    this._pollTimer = null;
    this._assembler = new Eb900FrameAssembler();
    this._replyWaiters = [];
    this._last = {
      speedKmh: null,
      cadence: null,
      watts: null,
      bpm: null,
      kcalTotal: null,
      distanceKm: null,
      resistance: null,
    };
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
        namePrefix: ['Domyos', 'DOMYOS', 'domyos'],
        optionalServices: [DOMYOS_SERVICE],
      });
      await BleBridge.connect(this._handle);
    }
    this.label = `Domyos · ${this._handle.name}`;
    BleBridge.onDisconnect(this._handle, () => this._disconnectCb?.());
    await BleBridge.subscribe(this._handle, DOMYOS_SERVICE, DOMYOS_NOTIFY_CHAR, (view) => this._onChunk(view));

    await this._handshake();
    // La console ne pousse rien spontanément : elle répond à une interrogation.
    // Pas de nouvelle question tant qu'une trame est à moitié reçue.
    this._pollTimer = setInterval(() => {
      if (this._assembler.isWaiting()) return;
      this._send(CMD_POLL).catch(() => {});
    }, POLL_MS);
  }

  /** Envoie la séquence de mise en route, une commande après la réponse de la précédente. */
  async _handshake() {
    for (const bytes of INIT_SEQUENCE) {
      const reply = this._nextReply(REPLY_TIMEOUT_MS);
      try {
        await this._send(bytes);
      } catch (error) {
        /* écriture refusée : l'interrogation peut quand même fonctionner */
      }
      // Sans réponse, on continue : certaines consoles se taisent pendant l'init.
      await reply;
    }
  }

  /** Promesse résolue à la prochaine notification (true) ou après `timeoutMs` (false). */
  _nextReply(timeoutMs) {
    return new Promise((resolve) => {
      const waiter = (value) => {
        clearTimeout(timer);
        resolve(value);
      };
      const timer = setTimeout(() => {
        this._replyWaiters = this._replyWaiters.filter((item) => item !== waiter);
        resolve(false);
      }, timeoutMs);
      this._replyWaiters.push(waiter);
    });
  }

  async _send(bytes) {
    if (!this._handle) return;
    await BleBridge.write(this._handle, DOMYOS_SERVICE, DOMYOS_WRITE_CHAR, bytes);
  }

  _onChunk(view) {
    const chunk = new Uint8Array(view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength));
    if (this.debug) logFrame('<<', chunk);

    const waiters = this._replyWaiters;
    this._replyWaiters = [];
    waiters.forEach((resolve) => resolve(true));

    this._assembler.push(chunk).forEach((frame) => this._onFrame(frame));
  }

  _onFrame(frame) {
    if (this.debug) logFrame('trame', frame);
    const parsed = parseEb900Frame(frame);
    if (!parsed) return;

    Object.keys(this._last).forEach((key) => {
      if (parsed[key] != null) this._last[key] = parsed[key];
    });
    // Mains retirées des capteurs : le pouls disparaît au lieu de rester figé.
    this._last.bpm = parsed.bpm;
    this._listeners.forEach((cb) => cb({ ...this._last, button: parsed.button, ts: Date.now() }));
  }

  stop() {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
    }
    if (this._handle) BleBridge.disconnect(this._handle);
    this._handle = null;
    this._listeners.clear();
    this._replyWaiters.forEach((resolve) => resolve(false));
    this._replyWaiters = [];
  }
}
