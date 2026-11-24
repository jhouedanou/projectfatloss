import React, { useState } from 'react';
import { Cloud, FolderOpen, HeartPulse, Smartphone } from 'lucide-react';
import { getDriveSettings, importFromDrive, parseFolderIds, setDriveSettings } from '../services/DriveImport';
import { importFromGoogleHealth } from '../services/GoogleHealth';
import { isHealthConnectApp } from '../services/HealthConnect';
import { setAccountPassword } from '../services/AuthService';

/** « 1 nouvelle séance », « 3 nouvelles séances » : chaque mot prend un s. */
const plural = (count, words) => `${count} ${words.split(' ').map((w) => (count > 1 && w !== 'de' ? `${w}s` : w)).join(' ')}`;

/**
 * Sources de données : d'où le tableau de bord peut lire le poids et
 * l'activité, et un bouton par source.
 * @param {(action: () => Promise<string|void>) => void} run - lance une action et affiche son message
 * @param {boolean} busy - une action est en cours
 * @param {() => Promise<string|void>} onSync - Health Connect (APK) ou compte (site)
 * @param {() => Promise<string|void>} [onGoogleFit] - site : import Google Fit
 * @param {boolean} signedIn
 * @param {{ email: string, hasPassword: boolean }|null} account - compte connecté
 */
export default function Sources({ run, busy, onSync, onGoogleFit, signedIn, account }) {
  const [settings, setSettings] = useState(() => getDriveSettings());
  const [folderUrl, setFolderUrl] = useState(settings.folderUrl);
  const [apiKey, setApiKey] = useState(settings.savedApiKey);
  const [folderError, setFolderError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordSet, setPasswordSet] = useState(false);

  // Compte Google sans mot de passe : l'APK ne peut pas s'y connecter.
  const needsPassword = !isHealthConnectApp() && account && !account.hasPassword && !passwordSet;

  const savePassword = (event) => {
    event.preventDefault();
    run(async () => {
      const result = await setAccountPassword(password);
      if (!result.success) throw new Error(result.error);
      setPassword('');
      setPasswordSet(true);
      return `Mot de passe enregistré. Dans l'application Android, connectez-vous avec ${result.email} et ce mot de passe.`;
    });
  };

  const readDrive = () => {
    const url = folderUrl.trim();
    if (url && parseFolderIds(url).length === 0) {
      setFolderError("Ce lien n'est pas reconnu. Collez le lien de partage du dossier (il contient « /folders/ »).");
      return;
    }
    setFolderError('');
    setSettings(setDriveSettings({ folderUrl: url, ...(apiKey.trim() || settings.savedApiKey ? { apiKey: apiKey.trim() } : {}) }));
    run(async () => {
      const result = await importFromDrive();
      setSettings(getDriveSettings());
      const skipped = result.other ? ` ${plural(result.other, 'autre fichier')} non lu${result.other > 1 ? 's' : ''} (format inconnu).` : '';
      return `Health Sync : ${plural(result.files, 'fichier')} de séances, ${plural(result.sessions, 'nouvelle séance')}.${skipped}`;
    });
  };

  const readGoogleHealth = () => run(async () => {
    const result = await importFromGoogleHealth();
    return `Google Health : ${plural(result.days, 'jour')} de pas, ${plural(result.weights, 'nouvelle pesée')}.`;
  });

  return (
    <section className="db-card db-wide src" aria-labelledby="src-title">
      <div className="db-card-head">
        <h3 id="src-title">Sources de données</h3>
      </div>

      <ul className="src-list">
        <li>
          <Smartphone size={20} className="src-icon" aria-hidden="true" />
          <div className="src-copy">
            <strong>{isHealthConnectApp() ? 'Health Connect' : 'Application Android + compte'}</strong>
            <p>
              {isHealthConnectApp()
                ? 'Pas, calories, distance, séances et pesées du téléphone.'
                : "L'application Android lit Health Connect et envoie tout ici par votre compte. Un site web ne peut pas lire Health Connect."}
            </p>
          </div>
          <button type="button" className="db-btn small" onClick={() => run(onSync)} disabled={busy}>
            {isHealthConnectApp() ? 'Lire' : signedIn ? 'Recevoir' : 'Se connecter'}
          </button>
          {needsPassword && (
            <form className="src-password" onSubmit={savePassword}>
              <p>
                L'application Android n'a pas la connexion Google. Choisissez un mot de passe pour vous y connecter
                avec <strong>{account.email}</strong>.
              </p>
              <label className="src-field" htmlFor="src-password">Mot de passe pour l'application Android</label>
              <input
                id="src-password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="src-password-hint"
                required
              />
              <p id="src-password-hint" className="src-hint">Au moins 6 caractères. Votre connexion Google sur le site reste inchangée.</p>
              <button type="submit" className="db-btn small" disabled={busy}>Enregistrer le mot de passe</button>
            </form>
          )}
        </li>

        <li className="src-block">
          <FolderOpen size={20} className="src-icon" aria-hidden="true" />
          <div className="src-copy">
            <strong>Health Sync (Google Drive)</strong>
            <p>
              Séances exportées par l'application Health Sync (durée, distance, calories, fréquence cardiaque).
              Partagez le dossier avec « Tous les utilisateurs disposant du lien », puis collez son lien.
              Les fichiers .fit et .tcx décrivent les mêmes séances : le fichier .csv de chacune suffit.
            </p>
            <label className="src-field" htmlFor="src-folder">Lien du dossier</label>
            <input
              id="src-folder"
              type="url"
              inputMode="url"
              autoComplete="off"
              value={folderUrl}
              onChange={(e) => setFolderUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/…"
              aria-describedby={folderError ? 'src-folder-error' : undefined}
              aria-invalid={!!folderError}
            />
            {folderError && <p id="src-folder-error" className="src-error" role="alert">{folderError}</p>}
            {!settings.hasBuildKey && (
              <>
                <label className="src-field" htmlFor="src-key">Clé API Google (API Drive activée)</label>
                <input id="src-key" type="text" autoComplete="off" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
              </>
            )}
            <p className="src-hint">
              {settings.lastSyncAt
                ? `Dernière lecture : ${new Date(settings.lastSyncAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}.`
                : 'Sans lien, une connexion Google est demandée pour chercher le dossier dans votre Drive.'}
            </p>
          </div>
          <button type="button" className="db-btn small" onClick={readDrive} disabled={busy}>Lire le dossier</button>
        </li>

        {!isHealthConnectApp() && (
          <li>
            <HeartPulse size={20} className="src-icon" aria-hidden="true" />
            <div className="src-copy">
              <strong>Google Health</strong>
              <p>
                Pas et pesées de votre compte Google Health. À l'essai : il faut d'abord activer « Google Health API »
                dans la console Google Cloud du projet.
              </p>
            </div>
            <button type="button" className="db-btn small" onClick={readGoogleHealth} disabled={busy}>Connecter</button>
          </li>
        )}

        {onGoogleFit && (
          <li>
            <Cloud size={20} className="src-icon" aria-hidden="true" />
            <div className="src-copy">
              <strong>Google Fit</strong>
              <p>Pas, calories, distance et séances. Google ferme ce service fin 2026.</p>
            </div>
            <button type="button" className="db-btn small" onClick={() => run(onGoogleFit)} disabled={busy}>Importer</button>
          </li>
        )}
      </ul>
    </section>
  );
}
