import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { syncData, fetchSyncedData, applySyncedData } from '../services/SyncService';
import { logout } from '../services/AuthService';
import './SyncPanel.css';

const SyncPanel = ({ user, onLogout, onSyncComplete }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [error, setError] = useState('');
  const [lastSyncDate, setLastSyncDate] = useState(null);

  // Formater la date de dernière synchronisation
  useEffect(() => {
    if (user && user.lastSyncTime) {
      const date = new Date(user.lastSyncTime);
      setLastSyncDate(date.toLocaleString());
    }
  }, [user]);

  // Synchroniser les données (upload)
  const handleSync = async () => {
    setIsLoading(true);
    setError('');
    setSyncMessage('');
    
    try {
      const result = await syncData();
      
      if (result.success) {
        setSyncMessage(t('sync.uploadSuccess', { date: result.syncedAt }));
        
        if (onSyncComplete) {
          onSyncComplete();
        }
      } else {
        setError(result.error || t('sync.uploadError'));
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      setError(t('sync.uploadError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer les données synchronisées (download)
  const handleFetchSync = async () => {
    setIsLoading(true);
    setError('');
    setSyncMessage('');
    
    try {
      const result = await fetchSyncedData();
      
      if (result.success) {
        if (result.noChange) {
          setSyncMessage(t('sync.noNewData'));
        } else {
          // Appliquer les données récupérées
          const applied = applySyncedData(result.data);
          
          if (applied) {
            setSyncMessage(t('sync.downloadSuccess', { date: result.syncedAt }));
            
            if (onSyncComplete) {
              onSyncComplete();
            }
          } else {
            setError(t('sync.applyError'));
          }
        }
      } else {
        setError(result.error || t('sync.downloadError'));
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      setError(t('sync.downloadError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la déconnexion
  const handleLogout = async () => {
    await logout();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="sync-panel">
      <div className="sync-header">
        <h2>{t('sync.title')}</h2>
        <div className="user-info">
          <span className="username">{user.user_metadata?.full_name || user.user_metadata?.user_name || user.email}</span>
          <button className="logout-button" onClick={handleLogout}>
            {t('auth.logout')}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="sync-error-message">{error}</div>
      )}
      
      {syncMessage && (
        <div className="sync-success-message">{syncMessage}</div>
      )}
      
      <div className="sync-info">
        {lastSyncDate ? (
          <p>{t('sync.lastSync')}: <span className="sync-date">{lastSyncDate}</span></p>
        ) : (
          <p>{t('sync.noSync')}</p>
        )}
      </div>
      
      <div className="sync-actions">
        <button 
          className="sync-button upload"
          onClick={handleSync}
          disabled={isLoading}
        >
          {isLoading ? t('sync.uploading') : t('sync.upload')}
          <span className="sync-icon">☁️↑</span>
        </button>
        
        <button 
          className="sync-button download"
          onClick={handleFetchSync}
          disabled={isLoading}
        >
          {isLoading ? t('sync.downloading') : t('sync.download')}
          <span className="sync-icon">☁️↓</span>
        </button>
      </div>
      
      <div className="sync-disclaimer">
        <p>{t('sync.disclaimer')}</p>
      </div>
    </div>
  );
};

export default SyncPanel;
