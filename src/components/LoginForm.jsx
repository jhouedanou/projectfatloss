import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { signIn, signUp } from '../services/AuthService';
import { isSupabaseConfigured } from '../services/supabase';
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

      {!isSupabaseConfigured && (
        <div className="login-error-message">Supabase non configuré (variables VITE_ manquantes).</div>
      )}
      {error && <div className="login-error-message">{error}</div>}
      {info && <div className="login-info-message">{info}</div>}

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

        <button type="submit" className="login-button" disabled={loading || !isSupabaseConfigured}>
          {loading ? '…' : isSignup ? 'Créer le compte' : 'Se connecter'}
        </button>
      </form>

      <button type="button" className="login-switch" onClick={switchMode}>
        {isSignup ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? Créer un compte'}
      </button>
    </div>
  );
};

export default LoginForm;
