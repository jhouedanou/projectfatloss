import React from 'react';
import BleBridge from '../../services/bike/BleBridge';

export const SOURCES = [
  { key: 'ftms', label: 'Vélo FTMS', hint: 'Standard — ou EB900 via pont qdomyos-zwift', ble: true },
  { key: 'domyos', label: 'Domyos EB900', hint: 'Protocole propriétaire — à calibrer', ble: true },
  { key: 'sim', label: 'Mode démo', hint: 'Sans vélo, métriques simulées', ble: false },
];

/**
 * Choix de la source de métriques + ceinture cardio optionnelle.
 * Les sources BLE sont masquées quand la plateforme n'expose pas le Bluetooth
 * (iOS Safari, Firefox) : le mode démo reste toujours disponible.
 */
export default function BikeConnectPanel({
  source,
  onSourceChange,
  hrEnabled,
  onHrToggle,
  status,
  error,
  onDetect,
}) {
  const bleOk = BleBridge.isSupported();

  return (
    <div className="ride-connect">
      <h3 className="ride-section-title">Source des données</h3>
      <div className="ride-source-list">
        {SOURCES.map((item) => {
          const disabled = item.ble && !bleOk;
          return (
            <button
              key={item.key}
              type="button"
              className={`ride-source ${source === item.key ? 'is-active' : ''}`}
              onClick={() => onSourceChange(item.key)}
              disabled={disabled}
            >
              <span className="ride-source-label">{item.label}</span>
              <span className="ride-source-hint">
                {disabled ? 'Bluetooth indisponible sur cette plateforme' : item.hint}
              </span>
            </button>
          );
        })}
      </div>

      <button type="button" className="ride-detect-link" onClick={onDetect}>
        Je ne sais pas laquelle choisir — détecter mon vélo
      </button>

      <label className={`ride-hr-toggle ${bleOk ? '' : 'is-disabled'}`}>
        <input type="checkbox" checked={hrEnabled} onChange={(e) => onHrToggle(e.target.checked)} disabled={!bleOk} />
        <span>Ceinture cardio Bluetooth (prioritaire sur le capteur de poignée)</span>
      </label>

      {status && <p className="ride-status">{status}</p>}
      {error && <p className="ride-error">{error}</p>}
    </div>
  );
}
