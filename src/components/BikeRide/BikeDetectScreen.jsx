import React, { useCallback, useEffect, useRef, useState } from 'react';
import BleBridge from '../../services/bike/BleBridge';
import { detectBike, identifyScannedDevice, PROTOCOL_INFO } from '../../services/bike/detectBike';

const STEPS = [
  'Allume la console du vélo et lance un programme (elle n\'émet rien en veille).',
  'Ferme toute autre appli connectée au vélo — il n\'accepte qu\'une connexion à la fois.',
  'Pédale quelques secondes pour réveiller le Bluetooth de la console.',
];

const SCAN_DURATION_MS = 12000;

const isDomyosName = (name) => /^domyos/i.test(name || '');

/**
 * Écran de détection du vélo.
 *
 * App Android : scan libre — l'écran liste lui-même les appareils trouvés
 * (les Domyos en tête), un appui identifie le protocole. Navigateur : le scan
 * libre est interdit par Web Bluetooth, on ouvre le sélecteur du système,
 * filtré sur « Domyos » pour que l'EB900 en mode appairage ressorte seul.
 */
export default function BikeDetectScreen({ onUseSource, onBack }) {
  const [state, setState] = useState('idle'); // idle | scanning | identifying | done | error
  const [devices, setDevices] = useState([]); // scan natif : {deviceId, name, rssi}
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const scanningRef = useRef(false);
  const scanTimerRef = useRef(null);

  const bleOk = BleBridge.isSupported();
  const canScan = bleOk && BleBridge.canScan();

  const stopScan = useCallback(() => {
    if (!scanningRef.current) return;
    scanningRef.current = false;
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    BleBridge.stopScan();
  }, []);

  useEffect(() => stopScan, [stopScan]);

  const finishIdentify = useCallback((report) => {
    setResult(report);
    setState('done');
  }, []);

  const failDetect = useCallback((detectError) => {
    const message = detectError?.message || 'Détection impossible.';
    // Annulation du sélecteur système : simple retour à l'état initial.
    if (/cancel|annul|User cancelled/i.test(message)) {
      setState('idle');
      return;
    }
    setError(message);
    setState('error');
  }, []);

  /** Navigateur : sélecteur système. `domyosOnly` filtre la liste sur le vélo. */
  const handleChooser = useCallback(
    async (domyosOnly) => {
      setError('');
      setResult(null);
      setState('identifying');
      try {
        finishIdentify(await detectBike({ domyosOnly }));
      } catch (detectError) {
        failDetect(detectError);
      }
    },
    [finishIdentify, failDetect]
  );

  /** App Android : scan libre pendant 12 s, liste triée Domyos d'abord puis signal. */
  const handleScan = useCallback(async () => {
    setError('');
    setResult(null);
    setDevices([]);
    setState('scanning');
    scanningRef.current = true;
    try {
      await BleBridge.scan((found) => {
        if (!found.deviceId) return;
        setDevices((prev) => {
          const rest = prev.filter((d) => d.deviceId !== found.deviceId);
          const next = [...rest, { ...found, name: found.name || 'Appareil sans nom' }];
          return next.sort((a, b) => {
            const aDomyos = isDomyosName(a.name) ? 1 : 0;
            const bDomyos = isDomyosName(b.name) ? 1 : 0;
            if (aDomyos !== bDomyos) return bDomyos - aDomyos;
            return (b.rssi ?? -999) - (a.rssi ?? -999);
          });
        });
      });
      scanTimerRef.current = setTimeout(() => {
        stopScan();
        setState((current) => (current === 'scanning' ? 'idle' : current));
      }, SCAN_DURATION_MS);
    } catch (scanError) {
      scanningRef.current = false;
      failDetect(scanError);
    }
  }, [stopScan, failDetect]);

  /** Appui sur un appareil de la liste : connexion + identification. */
  const handlePick = useCallback(
    async (device) => {
      stopScan();
      setState('identifying');
      setError('');
      try {
        finishIdentify(await identifyScannedDevice(device));
      } catch (identifyError) {
        failDetect(identifyError);
      }
    },
    [stopScan, finishIdentify, failDetect]
  );

  const info = result ? PROTOCOL_INFO[result.protocol] || PROTOCOL_INFO.unknown : null;

  return (
    <div className="ride-detect">
      <header className="ride-setup-head">
        <p className="ride-eyebrow">Bluetooth</p>
        <h2 className="ride-setup-title">Détecter le vélo</h2>
        <p className="ride-detect-lede">
          {canScan
            ? 'L\'application scanne les appareils Bluetooth autour de toi et identifie le protocole de la console.'
            : 'Le navigateur ouvre sa liste d\'appareils Bluetooth ; la détection identifie ensuite le protocole de la console.'}
        </p>
      </header>

      <ol className="ride-steps">
        {STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      {!bleOk && (
        <p className="ride-error">
          Bluetooth indisponible sur cette plateforme. Dans Chrome sur Android — y compris
          l'application installée — la détection fonctionne ; sur iPhone, non.
        </p>
      )}

      {state === 'scanning' && (
        <p className="ride-status">Scan en cours ({devices.length} appareil{devices.length > 1 ? 's' : ''} trouvé{devices.length > 1 ? 's' : ''})…</p>
      )}
      {state === 'identifying' && <p className="ride-status">Connexion et identification…</p>}
      {state === 'error' && <p className="ride-error">{error}</p>}

      {canScan && devices.length > 0 && state !== 'done' && (
        <div className="ride-device-list">
          {devices.map((device) => (
            <button
              key={device.deviceId}
              type="button"
              className={`ride-device ${isDomyosName(device.name) ? 'is-domyos' : ''}`}
              onClick={() => handlePick(device)}
              disabled={state === 'identifying'}
            >
              <span className="ride-device-name">
                {device.name}
                {isDomyosName(device.name) && <span className="ride-device-badge">vélo Domyos</span>}
              </span>
              <span className="ride-device-rssi">{device.rssi != null ? `${device.rssi} dBm` : ''}</span>
            </button>
          ))}
        </div>
      )}

      {result && info && (
        <div className={`ride-result ${info.source ? 'is-ok' : 'is-warn'}`}>
          <div className="ride-result-head">
            <span className="ride-result-title">{info.title}</span>
            <span className="ride-result-name">{result.name}</span>
          </div>
          <p className="ride-result-body">{info.body}</p>
          {result.hasHeartRate && (
            <p className="ride-result-body">Cet appareil publie aussi une fréquence cardiaque.</p>
          )}
          <details className="ride-result-services">
            <summary>
              Services Bluetooth lus ({result.services.length})
              {result.transport === 'web' && ' — limités à ceux que l\'app sait demander'}
            </summary>
            <ul>
              {result.services.map((uuid) => (
                <li key={uuid}>{uuid}</li>
              ))}
            </ul>
          </details>
        </div>
      )}

      <div className="ride-actions">
        {canScan ? (
          <button
            type="button"
            className="ride-btn ride-btn-primary"
            onClick={state === 'scanning' ? stopScan : handleScan}
            disabled={!bleOk || state === 'identifying'}
          >
            {state === 'scanning' ? 'Arrêter le scan' : 'Scanner les appareils'}
          </button>
        ) : (
          <>
            <button
              type="button"
              className="ride-btn ride-btn-primary"
              onClick={() => handleChooser(true)}
              disabled={!bleOk || state === 'identifying'}
            >
              {state === 'identifying' ? 'Détection…' : 'Détecter mon vélo Domyos'}
            </button>
            <button
              type="button"
              className="ride-btn ride-btn-ghost"
              onClick={() => handleChooser(false)}
              disabled={!bleOk || state === 'identifying'}
            >
              Autre appareil (tout afficher)
            </button>
          </>
        )}
        {result && info?.source && (
          <button type="button" className="ride-btn ride-btn-ghost" onClick={() => onUseSource(info.source, result.hasHeartRate)}>
            Utiliser cette source pour la sortie
          </button>
        )}
        <button type="button" className="ride-btn ride-btn-ghost" onClick={onBack}>
          Retour
        </button>
      </div>
    </div>
  );
}
