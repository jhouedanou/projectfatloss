import React, { useState } from 'react';
import googleFitIcon from '../icons/google-fit.svg';
import './GoogleFitSync.css';

/**
 * Petit bouton de synchronisation Google Fit pour un élément individuel.
 * @param {boolean} synced - true si déjà synchronisé (état initial).
 * @param {() => Promise<void>} onSync - lance la synchro de l'élément.
 * @param {boolean} allowResync - si true, le bouton reste cliquable après succès
 *   (utile pour la nutrition d'une journée encore modifiable).
 */
const GoogleFitItemButton = ({ synced = false, onSync, allowResync = false, title = 'Synchroniser avec Google Fit' }) => {
  const [state, setState] = useState(synced ? 'done' : 'idle'); // idle | loading | done | error

  const handleClick = async (e) => {
    e.stopPropagation();
    if (state === 'loading' || (state === 'done' && !allowResync)) return;
    setState('loading');
    try {
      await onSync();
      setState('done');
      if (allowResync) {
        setTimeout(() => setState('idle'), 2500);
      }
    } catch (err) {
      console.error(err);
      setState('error');
      alert(`Erreur de synchronisation Google Fit : ${err.message || err}`);
    }
  };

  return (
    <button
      type="button"
      className={`gfit-item-btn gfit-item-${state}`}
      onClick={handleClick}
      disabled={state === 'loading' || (state === 'done' && !allowResync)}
      title={state === 'done' ? 'Synchronisé avec Google Fit' : title}
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
