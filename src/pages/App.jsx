import React, { useCallback, useEffect, useState } from 'react';
import Header from '../components/Header/Header';
import LoginForm from '../components/LoginForm';
import Dashboard from '../dashboard/Dashboard';
import { onAuthChange, signOut } from '../services/AuthService';
import { fullSync } from '../services/SyncService';
import { syncFit } from '../services/FitSync';
import { isHealthConnectApp } from '../services/HealthConnect';
import { PRIVACY_URL, TERMS_URL } from '../utils/legal';

const plural = (count, word) => `${count} ${word}${count > 1 ? 's' : ''}`;

/** Résumé d'un import, pour le message affiché après la synchro. */
const importMessage = (result) =>
  `${result.source} : ${plural(result.days, 'jour')}, ${plural(result.sessions, 'séance')}`
  + `${result.weights ? `, ${plural(result.weights, 'pesée')}` : ''} lus.`;

/**
 * L'application : un tableau de bord (poids, composition, activité).
 * Les données viennent de Health Connect dans l'APK ; le site les reçoit par
 * le compte, ou les lit dans Google Fit.
 */
export default function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  // Incrémenté quand les données locales changent hors du tableau de bord.
  const [dataVersion, setDataVersion] = useState(0);
  const bump = useCallback(() => setDataVersion((v) => v + 1), []);

  // Compte : à la connexion, reçoit puis envoie les données.
  useEffect(() => onAuthChange((u) => {
    setUser(u);
    if (!u) return;
    setShowLogin(false);
    fullSync()
      .then(bump)
      .catch((error) => console.warn('[sync] différée :', error?.message));
  }), [bump]);

  // APK : lecture de Health Connect à l'ouverture, sans demande d'autorisation.
  useEffect(() => {
    if (!isHealthConnectApp()) return;
    syncFit({ prompt: false })
      .then((result) => { if (result) bump(); })
      .catch((error) => console.warn('[fit] lecture automatique différée :', error?.message));
  }, [bump]);

  // Échap ferme la fenêtre de connexion.
  useEffect(() => {
    if (!showLogin) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') setShowLogin(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showLogin]);

  const handleSync = async () => {
    if (isHealthConnectApp()) {
      const result = await syncFit({ prompt: true });
      if (user) await fullSync();
      return result ? importMessage(result) : undefined;
    }
    if (!user) {
      setShowLogin(true);
      return 'Connectez-vous pour recevoir les données de votre téléphone.';
    }
    const result = await fullSync();
    if (!result.success) throw new Error(result.error);
    return 'Données du compte à jour.';
  };

  const handleGoogleFit = async () => {
    const result = await syncFit({ prompt: true });
    return result ? importMessage(result) : undefined;
  };

  const handleAccount = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    if (window.confirm('Se déconnecter du compte ? Les données restent sur cet appareil.')) {
      await signOut();
      setUser(null);
    }
  };

  return (
    <div className="fit-app">
      <Header user={user} onAccountClick={handleAccount} />

      <main>
        <Dashboard
          dataVersion={dataVersion}
          signedIn={!!user}
          onSync={handleSync}
          onLogin={() => setShowLogin(true)}
          onGoogleFit={isHealthConnectApp() ? null : handleGoogleFit}
        />
      </main>

      <footer className="fit-footer">
        <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">Politique de confidentialité</a>
        <a href={TERMS_URL} target="_blank" rel="noopener noreferrer">Conditions d'utilisation</a>
      </footer>

      {showLogin && !user && (
        <div className="fit-modal" role="dialog" aria-modal="true" aria-label="Connexion au compte" onClick={() => setShowLogin(false)}>
          <div className="fit-modal-box" onClick={(e) => e.stopPropagation()}>
            <LoginForm onClose={() => setShowLogin(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
