/**
 * Pont Bluetooth Low Energy à deux transports.
 *
 *  - Web Bluetooth (`navigator.bluetooth`) : Chrome desktop / Chrome Android en PWA.
 *  - @capacitor-community/bluetooth-le : app Android Capacitor (la WebView
 *    n'expose pas Web Bluetooth). Le plugin est importé dynamiquement pour que
 *    le build web ne le réclame pas.
 *
 * API commune (toutes les méthodes en Promise) :
 *   isSupported() -> boolean
 *   requestDevice({ services, namePrefix, optionalServices }) -> handle opaque
 *   connect(handle)
 *   subscribe(handle, serviceUuid, charUuid, cb)   cb reçoit un DataView
 *   write(handle, serviceUuid, charUuid, Uint8Array)
 *   disconnect(handle)
 *   onDisconnect(handle, cb)
 *
 * Les UUID sont normalisés en minuscules, forme longue 128 bits.
 */

const BLE_BASE = '-0000-1000-8000-00805f9b34fb';

/** Normalise un UUID court (0x1826 ou '1826') en UUID 128 bits minuscule. */
export function fullUuid(uuid) {
  if (typeof uuid === 'number') {
    return `0000${uuid.toString(16).padStart(4, '0')}${BLE_BASE}`;
  }
  const s = String(uuid).toLowerCase().replace(/^0x/, '');
  if (s.length === 4) return `0000${s}${BLE_BASE}`;
  if (s.length === 8) return `${s}${BLE_BASE}`;
  return s;
}

const isNative = () => {
  try {
    // Capacitor injecte cet objet dans la WebView native.
    return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  } catch (error) {
    return false;
  }
};

// --- Transport Web Bluetooth --------------------------------------------------

const webTransport = {
  name: 'web',

  isSupported: () => typeof navigator !== 'undefined' && !!navigator.bluetooth,

  // Web Bluetooth n'autorise pas le scan libre : seul le sélecteur du
  // navigateur voit les appareils alentour. Le filtrage (namePrefix) est le
  // seul levier pour que le vélo ressorte seul dans la liste.
  canScan: () => false,
  scan: () => {
    throw new Error('Scan libre indisponible dans le navigateur.');
  },
  stopScan: () => {},

  async requestDevice({ services = [], namePrefix, optionalServices = [] }) {
    const filters = [];
    if (services.length) filters.push({ services: services.map(fullUuid) });
    if (namePrefix) filters.push({ namePrefix });

    const device = await navigator.bluetooth.requestDevice(
      filters.length
        ? { filters, optionalServices: optionalServices.map(fullUuid) }
        : { acceptAllDevices: true, optionalServices: [...services, ...optionalServices].map(fullUuid) }
    );
    return { device, server: null, name: device.name || 'Appareil BLE' };
  },

  async connect(handle) {
    handle.server = await handle.device.gatt.connect();
  },

  async subscribe(handle, serviceUuid, charUuid, cb) {
    const service = await handle.server.getPrimaryService(fullUuid(serviceUuid));
    const characteristic = await service.getCharacteristic(fullUuid(charUuid));
    characteristic.addEventListener('characteristicvaluechanged', (event) => cb(event.target.value));
    await characteristic.startNotifications();
    return characteristic;
  },

  async write(handle, serviceUuid, charUuid, bytes) {
    const service = await handle.server.getPrimaryService(fullUuid(serviceUuid));
    const characteristic = await service.getCharacteristic(fullUuid(charUuid));
    if (characteristic.writeValueWithoutResponse) {
      await characteristic.writeValueWithoutResponse(bytes);
    } else {
      await characteristic.writeValue(bytes);
    }
  },

  async getServices(handle) {
    const services = await handle.server.getPrimaryServices();
    return services.map((service) => service.uuid.toLowerCase());
  },

  async disconnect(handle) {
    try {
      if (handle?.device?.gatt?.connected) handle.device.gatt.disconnect();
    } catch (error) {
      /* déconnexion best-effort */
    }
  },

  onDisconnect(handle, cb) {
    handle.device.addEventListener('gattserverdisconnected', cb);
  },
};

// --- Transport Capacitor ------------------------------------------------------

let capacitorBle = null;

async function loadCapacitorBle() {
  if (capacitorBle) return capacitorBle;
  const mod = await import('@capacitor-community/bluetooth-le');
  capacitorBle = mod.BleClient;
  await capacitorBle.initialize({ androidNeverForLocation: true });
  return capacitorBle;
}

const capacitorTransport = {
  name: 'capacitor',

  isSupported: () => isNative(),

  canScan: () => true,

  /**
   * Scan libre : appelle `onDevice({ deviceId, name, rssi, uuids })` pour
   * chaque annonce reçue (le même appareil peut remonter plusieurs fois, le
   * RSSI évoluant à chaque annonce).
   */
  async scan(onDevice) {
    const BleClient = await loadCapacitorBle();
    await BleClient.requestLEScan({ allowDuplicates: false }, (result) => {
      onDevice({
        deviceId: result.device?.deviceId,
        name: result.device?.name || result.localName || null,
        rssi: result.rssi ?? null,
        uuids: (result.uuids || []).map((uuid) => String(uuid).toLowerCase()),
      });
    });
  },

  async stopScan() {
    try {
      const BleClient = await loadCapacitorBle();
      await BleClient.stopLEScan();
    } catch (error) {
      /* arrêt best-effort */
    }
  },

  async requestDevice({ services = [], namePrefix, optionalServices = [] }) {
    const BleClient = await loadCapacitorBle();
    const device = await BleClient.requestDevice({
      services: services.map(fullUuid),
      namePrefix: namePrefix || undefined,
      optionalServices: optionalServices.map(fullUuid),
    });
    return { deviceId: device.deviceId, name: device.name || 'Appareil BLE' };
  },

  async connect(handle) {
    const BleClient = await loadCapacitorBle();
    await BleClient.connect(handle.deviceId, () => {
      handle._onDisconnect?.();
    });
  },

  async subscribe(handle, serviceUuid, charUuid, cb) {
    const BleClient = await loadCapacitorBle();
    await BleClient.startNotifications(handle.deviceId, fullUuid(serviceUuid), fullUuid(charUuid), cb);
    return { serviceUuid, charUuid };
  },

  async write(handle, serviceUuid, charUuid, bytes) {
    const BleClient = await loadCapacitorBle();
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    await BleClient.writeWithoutResponse(handle.deviceId, fullUuid(serviceUuid), fullUuid(charUuid), view);
  },

  async getServices(handle) {
    const BleClient = await loadCapacitorBle();
    const services = await BleClient.getServices(handle.deviceId);
    return services.map((service) => String(service.uuid).toLowerCase());
  },

  async disconnect(handle) {
    try {
      const BleClient = await loadCapacitorBle();
      await BleClient.disconnect(handle.deviceId);
    } catch (error) {
      /* déconnexion best-effort */
    }
  },

  onDisconnect(handle, cb) {
    handle._onDisconnect = cb;
  },
};

// --- Façade -------------------------------------------------------------------

const transport = () => (isNative() ? capacitorTransport : webTransport);

const BleBridge = {
  /** Le BLE est-il utilisable sur cette plateforme ? (iOS Safari / Firefox : non) */
  isSupported: () => transport().isSupported(),
  /** Nom du transport actif — utile pour les messages d'erreur. */
  transportName: () => transport().name,
  /** Scan libre possible ? (app Android : oui ; navigateur : non) */
  canScan: () => transport().canScan(),
  scan: (onDevice) => transport().scan(onDevice),
  stopScan: () => transport().stopScan(),
  requestDevice: (options) => transport().requestDevice(options),
  connect: (handle) => transport().connect(handle),
  subscribe: (handle, service, characteristic, cb) => transport().subscribe(handle, service, characteristic, cb),
  /** UUID des services exposés par l'appareil connecté (minuscules, 128 bits). */
  getServices: (handle) => transport().getServices(handle),
  write: (handle, service, characteristic, bytes) => transport().write(handle, service, characteristic, bytes),
  disconnect: (handle) => transport().disconnect(handle),
  onDisconnect: (handle, cb) => transport().onDisconnect(handle, cb),
};

export default BleBridge;
