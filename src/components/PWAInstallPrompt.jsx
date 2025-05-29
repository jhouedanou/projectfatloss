import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Button,
  Box,
  IconButton,
  Typography,
  Fade,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Android as AndroidIcon,
  InstallMobile as InstallIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import AndroidPermissionScreen from './AndroidPermissionScreen';
import { getNotificationPermissionStatus } from '../services/NotificationService';

function PWAInstallPrompt() {
  const [showAndroidScreen, setShowAndroidScreen] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAndroid, setIsAndroid] = useState(false);
  const [needsConfiguration, setNeedsConfiguration] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    checkPlatformAndSetup();
    setupInstallPromptListener();
    
    // Vérifier si l'utilisateur a déjà interagi
    const hasInteractedBefore = localStorage.getItem('pwa_android_configured');
    setHasInteracted(!!hasInteractedBefore);
  }, []);

  const checkPlatformAndSetup = async () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const androidDetected = /android/i.test(userAgent);
    setIsAndroid(androidDetected);

    if (androidDetected) {
      // Vérifier si la configuration est nécessaire
      const config = await checkAndroidConfiguration();
      setNeedsConfiguration(config.needsSetup);
      
      // Afficher l'écran de configuration si nécessaire et pas déjà configuré
      if (config.needsSetup && !hasInteracted) {
        setTimeout(() => {
          setShowAndroidScreen(true);
        }, 3000); // Attendre 3 secondes après le chargement
      }
    }
  };

  const checkAndroidConfiguration = async () => {
    const permissionStatus = await getNotificationPermissionStatus();
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone ||
                       document.referrer.includes('android-app://');

    const needsSetup = permissionStatus !== 'granted' || !isInstalled;

    return {
      needsSetup,
      permissionStatus,
      isInstalled
    };
  };

  const setupInstallPromptListener = () => {
    // Écouter l'événement beforeinstallprompt pour PWA
    window.addEventListener('beforeinstallprompt', (e) => {
      // Empêcher l'affichage automatique par le navigateur
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Afficher notre propre prompt après un délai si Android
      if (isAndroid && !hasInteracted) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 5000);
      }
    });

    // Écouter l'installation de l'app
    window.addEventListener('appinstalled', () => {
      console.log('PWA installée avec succès');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa_installed', 'true');
    });
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        // Afficher le prompt d'installation natif
        deferredPrompt.prompt();
        
        // Attendre la réponse de l'utilisateur
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('Utilisateur a accepté l\'installation');
        } else {
          console.log('Utilisateur a refusé l\'installation');
        }
        
        // Nettoyer
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      } catch (error) {
        console.error('Erreur lors de l\'installation:', error);
      }
    }
  };

  const handleAndroidScreenClose = () => {
    setShowAndroidScreen(false);
    setHasInteracted(true);
    localStorage.setItem('pwa_android_configured', 'true');
  };

  const handleAndroidScreenComplete = (completedSteps) => {
    console.log('Configuration Android terminée:', completedSteps);
    setShowAndroidScreen(false);
    setHasInteracted(true);
    setNeedsConfiguration(false);
    localStorage.setItem('pwa_android_configured', 'true');
    localStorage.setItem('pwa_android_completion', JSON.stringify(completedSteps));
  };

  const handleShowAndroidSetup = () => {
    setShowAndroidScreen(true);
    setShowInstallPrompt(false);
  };

  const handleDismissPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  return (
    <>
      {/* Prompt d'installation PWA pour Android */}
      <Snackbar
        open={showInstallPrompt && isAndroid && !hasInteracted}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: 80 }} // Au-dessus des éventuels boutons flottants
      >
        <Alert
          severity="info"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            minWidth: 350,
            '& .MuiAlert-icon': { color: 'white' }
          }}
          icon={<AndroidIcon />}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                onClick={handleShowAndroidSetup}
                sx={{ 
                  color: 'white', 
                  borderColor: 'white',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                }}
                variant="outlined"
              >
                Configurer
              </Button>
              {deferredPrompt && (
                <Button
                  size="small"
                  onClick={handleInstallClick}
                  sx={{ 
                    backgroundColor: 'white', 
                    color: '#667eea',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                  }}
                  variant="contained"
                >
                  Installer
                </Button>
              )}
              <IconButton
                size="small"
                onClick={handleDismissPrompt}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          }
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              🚀 Optimisez votre expérience Android !
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              Configurez les notifications et installez l'app pour de meilleures performances.
            </Typography>
          </Box>
        </Alert>
      </Snackbar>

      {/* Bouton flottant de configuration pour Android (toujours accessible) */}
      {isAndroid && needsConfiguration && (
        <Fade in timeout={1000}>
          <Paper
            elevation={6}
            sx={{
              position: 'fixed',
              top: 20,
              right: 20,
              p: 2,
              background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
              color: 'white',
              borderRadius: 3,
              cursor: 'pointer',
              zIndex: 1300,
              minWidth: 200,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              boxShadow: '0 4px 20px rgba(255, 152, 0, 0.4)'
            }}
            onClick={handleShowAndroidSetup}
          >
            <AndroidIcon sx={{ fontSize: 24 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                Configuration Android
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.9 }}>
                Optimiser les notifications
              </Typography>
            </Box>
          </Paper>
        </Fade>
      )}

      {/* Écran de configuration Android */}
      <AndroidPermissionScreen
        open={showAndroidScreen}
        onClose={handleAndroidScreenClose}
        onComplete={handleAndroidScreenComplete}
      />
    </>
  );
}

export default PWAInstallPrompt; 