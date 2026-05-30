import React, { useState } from 'react';
import googleFitIcon from '../icons/google-fit.svg';
import './GoogleFitSync.css';

/**
 * Petit bouton de synchronisation Google Fit pour un élément individuel.
 * Composant présentationnel : la gestion de l'erreur est déléguée au parent
 * via `onError` (l'erreur est aussi reflétée dans le tooltip du bouton).
 * @param {boolean} synced - true si déjà synchronisé (état initial).
 * @param {() => Promise<void>} onSync - lance la synchro de l'élément.
 * @param {(error: Error) => void} [onError] - notifié en cas d'échec.
 * @param {boolean} allowResync - si true, le bouton reste cliquable après succès
 *   (utile pour la nutrition d'une journée encore modifiable).
 */
const GoogleFitItemButton = ({ synced = false, onSync, onError, allowResync = false, title = 'Synchroniser avec Google Fit' }) => {
  const [state, setState] = useState(synced ? 'done' : 'idle'); // idle | loading | done | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleClick = async (e) => {
    e.stopPropagation();
    if (state === 'loading' || (state === 'done' && !allowResync)) return;
    setState('loading');
    setErrorMsg('');
    try {
      await onSync();
      setState('done');
      if (allowResync) {
        setTimeout(() => setState('idle'), 2500);
      }
    } catch (err) {
      console.error(err);
      setState('error');
      setErrorMsg(err.message || String(err));
      if (typeof onError === 'function') onError(err);
    }
  };

  const tooltip = state === 'done'
    ? 'Synchronisé avec Google Fit'
    : state === 'error'
      ? `Échec : ${errorMsg}`
      : title;

  return (
    <button
      type="button"
      className={`gfit-item-btn gfit-item-${state}`}
      onClick={handleClick}
      disabled={state === 'loading' || (state === 'done' && !allowResync)}
      title={tooltip}
      aria-label={title}
    >
      {state === 'loading'
        ? <span className="gfit-spinner" aria-hidden="true" />
        : <img src={googleFitIcon} alt="" width={18} height={18} />}
      {state === 'done' && <span className="gfit-check" aria-hidden="true">✓</span>}
    </button>
  );
};

export default GoogleFitItemButton;
