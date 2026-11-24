import React from 'react';
import { LogOut, User } from 'lucide-react';
import './Header.css';
import { getAssetPath } from '../../utils/paths';

/** En-tête : logo, date du jour et bouton du compte. */
export default function Header({ user, onAccountClick }) {
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <header className="pfl-header">
      <div className="pfl-header-toolbar">
        <div className="pfl-header-brand">
          <span className="pfl-header-logo">
            <img src={getAssetPath('/logo.png')} alt="" />
          </span>
          <div className="pfl-header-copy">
            <h1 className="pfl-header-title">Project Fat Loss</h1>
            <p className="pfl-header-subtitle">{today.charAt(0).toUpperCase() + today.slice(1)}</p>
          </div>
        </div>

        <div className="pfl-header-actions">
          <button
            type="button"
            onClick={onAccountClick}
            className={`pfl-header-icon${user ? ' pfl-header-icon--auth' : ''}`}
            aria-label={user ? 'Se déconnecter' : 'Se connecter'}
            title={user ? `Connecté : ${user.email || 'compte'}` : 'Se connecter'}
          >
            {user ? <LogOut size={19} strokeWidth={2.25} /> : <User size={19} strokeWidth={2.25} />}
          </button>
        </div>
      </div>
    </header>
  );
}
