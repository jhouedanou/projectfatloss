/**
 * Détection du vélo : identifie quel protocole parle l'appareil sélectionné.
 *
 * Le navigateur (ou Android) affiche son propre sélecteur d'appareils — on ne
 * peut pas lister soi-même les vélos alentour. En revanche, une fois l'appareil
 * choisi et connecté, ses services GATT disent exactement à quoi on a affaire.
 */

import BleBridge, { fullUuid } from './BleBridge';
import { DOMYOS_SERVICE } from './adapters/DomyosAdapter';
import { FTMS_SERVICE } from './adapters/FtmsAdapter';
import { HR_SERVICE } from './adapters/HeartRateAdapter';

const FTMS_UUID = fullUuid(FTMS_SERVICE);
const HR_UUID = fullUuid(HR_SERVICE);
const DOMYOS_UUID = fullUuid(DOMYOS_SERVICE);
const CSC_UUID = fullUuid(0x1816); // vitesse & cadence, présent sur des capteurs simples

const OPTIONAL_SERVICES = [FTMS_SERVICE, HR_SERVICE, DOMYOS_SERVICE, 0x1816, 0x180a, 0x180f];

/**
 * Se connecte à un appareil déjà choisi, lit ses services et en déduit le
 * protocole. La connexion est LAISSÉE OUVERTE et le handle remonte dans le
 * rapport : la sortie la reprend telle quelle. Le vélo n'accepte qu'une
 * connexion à la fois et quitte le mode appairage une fois associé — fermer
 * ici obligerait à ré-appairer pour démarrer la séance.
 * L'appelant est responsable de `releaseDetectedHandle()` s'il ne l'utilise pas.
 * @param {Object} handle handle BleBridge ({device} web ou {deviceId} natif)
 */
export async function identifyHandle(handle) {
  try {
    await BleBridge.connect(handle);
    const services = await BleBridge.getServices(handle);
    const has = (uuid) => services.includes(uuid);

    let protocol = 'unknown';
    if (has(FTMS_UUID)) protocol = 'ftms';
    else if (has(DOMYOS_UUID)) protocol = 'domyos';
    else if (has(HR_UUID)) protocol = 'hr';
    else if (has(CSC_UUID)) protocol = 'csc';

    return {
      name: handle.name || 'Appareil',
      protocol,
      services,
      hasHeartRate: has(HR_UUID),
      // En Web Bluetooth, seuls les services déclarés dans `optionalServices`
      // sont visibles : un firmware exotique ressort donc avec une liste vide.
      // Le plugin Android, lui, renvoie tout ce que l'appareil expose.
      transport: BleBridge.transportName(),
      // Le handle reste CONNECTÉ et remonte avec le rapport : la sortie le
      // réutilise tel quel. Le vélo n'accepte qu'une connexion à la fois et la
      // console sort du mode appairage après la détection — se déconnecter ici
      // obligerait l'utilisateur à ré-appairer pour démarrer la séance.
      handle,
    };
  } catch (error) {
    // Échec d'identification : rien à réutiliser, on libère la console pour
    // que la tentative suivante puisse s'y connecter.
    BleBridge.disconnect(handle);
    throw error;
  }
}

/** Ferme un handle remonté par la détection et non utilisé par la sortie. */
export function releaseDetectedHandle(report) {
  if (report?.handle) BleBridge.disconnect(report.handle);
}

/**
 * Ouvre le sélecteur Bluetooth du système puis identifie l'appareil choisi.
 * @param {Object} [options]
 * @param {boolean} [options.domyosOnly] ne proposer que les appareils dont le
 *   nom commence par « Domyos » — l'EB900 en mode appairage ressort seul.
 */
export async function detectBike({ domyosOnly = false } = {}) {
  if (!BleBridge.isSupported()) {
    throw new Error(
      'Bluetooth non disponible ici. Sur iPhone, aucun navigateur n\'expose le Bluetooth : utilise le mode démo.'
    );
  }

  const handle = await BleBridge.requestDevice({
    services: [],
    namePrefix: domyosOnly ? 'Domyos' : undefined,
    optionalServices: OPTIONAL_SERVICES,
  });
  return identifyHandle(handle);
}

/**
 * Identifie un appareil trouvé par le scan libre (app Android uniquement) :
 * le deviceId du scan suffit pour se connecter, sans sélecteur système.
 */
export function identifyScannedDevice({ deviceId, name }) {
  return identifyHandle({ deviceId, name: name || 'Appareil' });
}

/** Message lisible pour chaque résultat de détection. */
export const PROTOCOL_INFO = {
  ftms: {
    title: 'Vélo FTMS reconnu',
    body: 'Profil standard : vitesse, cadence, puissance et calories sont lues directement. C\'est le cas le plus fiable.',
    source: 'ftms',
  },
  domyos: {
    title: 'Console Domyos reconnue',
    body: 'Protocole propriétaire détecté. Les données remontent, mais les valeurs doivent être vérifiées contre l\'écran de la console la première fois.',
    source: 'domyos',
  },
  hr: {
    title: 'Ceinture cardio uniquement',
    body: 'Cet appareil ne publie que la fréquence cardiaque. Coche « Ceinture cardio » et choisis une autre source pour la vitesse.',
    source: null,
  },
  csc: {
    title: 'Capteur vitesse / cadence',
    body: 'Cet appareil publie vitesse et cadence mais pas la puissance. Non géré pour l\'instant : utilise le pont qdomyos-zwift ou le mode démo.',
    source: null,
  },
  unknown: {
    title: 'Appareil non reconnu',
    body: 'Aucun service connu. Vérifie que la console est allumée et qu\'aucune autre application n\'y est déjà connectée — un vélo Bluetooth n\'accepte qu\'une connexion à la fois. Depuis un navigateur, le diagnostic ne voit que les services attendus : l\'application Android, elle, liste tout ce que la console expose.',
    source: null,
  },
};

export default detectBike;
