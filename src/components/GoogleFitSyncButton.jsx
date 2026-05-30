import React, { useState, useEffect, useCallback } from 'react';
import googleFitIcon from '../icons/google-fit.svg';
import './GoogleFitSync.css';

/**
 * Bouton de synchronisation Google Fit "en masse".
 * @param {() => number} getUnsyncedCount - renvoie le nombre d'éléments non synchronisés.
 * @param {() => Promise<{synced:number, failed:number, details:Array}>} onSync - lance la synchro.
 * @param {string} noun / nounPlural - libellé de l'élément (ex: "séance" / "séances").
 */
const GoogleFitSyncButton = ({ getUnsyncedCount, onSync, noun = 'élément', nounPlural = 'éléments' }) => {
  const [count, setCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(() => setCount(getUnsyncedCount()), [getUnsyncedCount]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleClick = async () => {
    if (syncing || count === 0) return;
    setSyncing(true);
    setResult(null);
    setError(null);
    try {
      const res = await onSync();
      setResult(res);
      refresh();
    } catch (err) {
      setError(err.message || 'Erreur lors de la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  const label = syncing
    ? 'Synchronisation…'
    : count === 0
      ? 'Tout est synchronisé avec Google Fit'
      : `Synchroniser ${count} ${count > 1 ? nounPlural : noun} avec Google Fit`;

  return (
    <div className="gfit-sync">
      <button
        className="gfit-sync-btn"
        onClick={handleClick}
        disabled={syncing || count === 0}
      >
        <img src={googleFitIcon} alt="Google Fit" width={20} height={20} />
        <span>{label}</span>
      </button>
      {syncing && <div className="gfit-sync-progress"><div className="gfit-sync-bar" /></div>}
      {error && <p className="gfit-sync-error">{error}</p>}
      {result && (
        <p className="gfit-sync-result">
          {result.synced} synchronisé{result.synced > 1 ? 's' : ''}
          {result.failed > 0 ? `, ${result.failed} échec${result.failed > 1 ? 's' : ''}` : ''}
        </p>
      )}
    </div>
  );
};

export default GoogleFitSyncButton;
