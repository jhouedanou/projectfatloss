import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { canUseGoogleSignIn, resetPassword, signIn, signInWithGoogle, signUp } from '../services/AuthService';
import { isFirebaseConfigured } from '../services/firebase';
import { getAssetPath } from '../utils/paths';
import './LoginForm.css';

const LoginForm = ({ onClose }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const isSignup = mode === 'signup';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email || !password) {
      setError('Email et mot de passe requis');
      return;
    }

    setLoading(true);
    const result = isSignup
      ? await signUp(email, password, displayName)
      : await signIn(email, password);
    setLoading(false);

    if (result.success) {
      if (isSignup && !result.session) {
        setInfo('Compte créé. Vérifie ta boîte mail pour confirmer, puis connecte-toi.');
        setMode('login');
        setPassword('');
      }
      // Sinon : onAuthChange ferme la modale automatiquement
    } else {
      setError(result.error || 'Erreur');
    }
  };

  const handleGoogle = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    const result = await signInWithGoogle();
    setLoading(false);
    // Succès : onAuthChange ferme la modale automatiquement
    if (!result.success) setError(result.error || 'Erreur');
  };

  const handleReset = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);
    if (result.success) {
      setInfo('Email envoyé. Il sert aussi à créer un mot de passe pour l\'APK si tu t\'es inscrit avec Google.');
    } else {
      setError(result.error || 'Erreur');
    }
  };

  const switchMode = () => {
    setMode(isSignup ? 'login' : 'signup');
    setError('');
    setInfo('');
  };

  return (
    <div className="login-card">
      <button className="login-close" onClick={onClose} aria-label="Fermer">×</button>

      <div className="login-brand">
        <img src={getAssetPath('/logo.png')} alt="" className="login-logo" />
        <h2>{isSignup ? 'Créer un compte' : 'Bon retour'}</h2>
        <p className="login-sub">
          {isSignup ? 'Quelques secondes pour démarrer' : 'Connecte-toi pour retrouver tes données'}
        </p>
      </div>

      {!isFirebaseConfigured && (
        <div className="login-error-message">Connexion indisponible pour le moment. L'app fonctionne quand même : vos données restent sur cet appareil.</div>
      )}
      {error && <div className="login-error-message">{error}</div>}
      {info && <div className="login-info-message">{info}</div>}

      {canUseGoogleSignIn && (
        <>
          <button type="button" className="login-google" onClick={handleGoogle} disabled={loading}>
            <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z" />
              <path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.6 10.7l7.9-6.1z" />
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.8-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
            </svg>
            Continuer avec Google
          </button>
          <div className="login-divider"><span>ou</span></div>
        </>
      )}

      <form onSubmit={handleSubmit} className="login-form">
        {isSignup && (
          <div className="login-field">
            <User size={18} className="login-field-icon" />
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
              placeholder="Nom affiché (optionnel)"
              autoComplete="name"
            />
          </div>
        )}

        <div className="login-field">
          <Mail size={18} className="login-field-icon" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="Email"
            autoComplete="email"
            required
          />
        </div>

        <div className="login-field">
          <Lock size={18} className="login-field-icon" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="Mot de passe"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            required
          />
          <button
            type="button"
            className="login-eye"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Masquer' : 'Afficher'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        <button type="submit" className="login-button" disabled={loading || !isFirebaseConfigured}>
          {loading ? '…' : isSignup ? 'Créer le compte' : 'Se connecter'}
        </button>
      </form>

      {!isSignup && isFirebaseConfigured && (
        <button type="button" className="login-switch" onClick={handleReset} disabled={loading}>
          Mot de passe oublié ?
        </button>
      )}

      <button type="button" className="login-switch" onClick={switchMode}>
        {isSignup ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? Créer un compte'}
      </button>
    </div>
  );
};

export default LoginForm;
