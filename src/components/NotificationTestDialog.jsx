import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Android as AndroidIcon,
  Apple as AppleIcon,
  Computer as ComputerIcon
} from '@mui/icons-material';
import { 
  requestNotificationPermission, 
  showTestNotification, 
  getNotificationPermissionStatus 
} from '../services/NotificationService';

function getPlatformInfo() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  return {
    isAndroid: /android/i.test(userAgent),
    isIOS: /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream,
    isChrome: /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor),
    isFirefox: /Firefox/.test(userAgent),
    isSamsung: /SamsungBrowser/.test(userAgent),
    isStandalone: window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone,
    isPWA: window.matchMedia('(display-mode: standalone)').matches,
    userAgent: userAgent
  };
}

export default function NotificationTestDialog({ open, onClose }) {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState([]);
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [platform, setPlatform] = useState({});

  useEffect(() => {
    if (open) {
      setPlatform(getPlatformInfo());
      checkPermissionStatus();
    }
  }, [open]);

  const checkPermissionStatus = async () => {
    try {
      const status = await getNotificationPermissionStatus();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Erreur vérification permission:', error);
      setPermissionStatus('error');
    }
  };

  const runDiagnostic = async () => {
    setTesting(true);
    setResults([]);
    
    const testResults = [];
    
    // Test 1: Support des notifications
    testResults.push({
      name: 'Support des notifications',
      status: 'Notification' in window ? 'success' : 'error',
      message: 'Notification' in window ? 'Supporté' : 'Non supporté par ce navigateur'
    });

    // Test 2: Service Worker
    testResults.push({
      name: 'Service Worker',
      status: 'serviceWorker' in navigator ? 'success' : 'error',
      message: 'serviceWorker' in navigator ? 'Disponible' : 'Non disponible'
    });

    // Test 3: Permission actuelle
    const currentPermission = Notification.permission;
    testResults.push({
      name: 'Permission notifications',
      status: currentPermission === 'granted' ? 'success' : 
              currentPermission === 'denied' ? 'error' : 'warning',
      message: `Status: ${currentPermission}`
    });

    // Test 4: Plateforme
    let platformMessage = 'Plateforme non identifiée';
    if (platform.isAndroid) {
      platformMessage = `Android - ${platform.isChrome ? 'Chrome' : platform.isSamsung ? 'Samsung Browser' : 'Autre navigateur'}`;
    } else if (platform.isIOS) {
      platformMessage = 'iOS/iPadOS';
    } else {
      platformMessage = 'Desktop/Autre';
    }
    
    testResults.push({
      name: 'Plateforme détectée',
      status: 'info',
      message: platformMessage
    });

    // Test 5: Mode PWA
    testResults.push({
      name: 'Mode PWA',
      status: platform.isStandalone ? 'success' : 'warning',
      message: platform.isStandalone ? 'Installée comme PWA' : 'Navigation standard'
    });

    setResults(testResults);
    
    // Attendre un peu pour l'effet visuel
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setTesting(false);
  };

  const requestPermission = async () => {
    setTesting(true);
    try {
      const granted = await requestNotificationPermission();
      
      setResults(prev => [...prev, {
        name: 'Demande de permission',
        status: granted ? 'success' : 'error',
        message: granted ? 'Permission accordée !' : 'Permission refusée'
      }]);
      
      await checkPermissionStatus();
    } catch (error) {
      setResults(prev => [...prev, {
        name: 'Demande de permission',
        status: 'error',
        message: `Erreur: ${error.message}`
      }]);
    }
    setTesting(false);
  };

  const testNotification = async () => {
    setTesting(true);
    try {
      const success = await showTestNotification();
      
      setResults(prev => [...prev, {
        name: 'Test de notification',
        status: success ? 'success' : 'error',
        message: success ? 'Notification envoyée !' : 'Échec de l\'envoi'
      }]);
    } catch (error) {
      setResults(prev => [...prev, {
        name: 'Test de notification',
        status: 'error',
        message: `Erreur: ${error.message}`
      }]);
    }
    setTesting(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckIcon color="success" />;
      case 'error': return <CloseIcon color="error" />;
      case 'warning': return <WarningIcon color="warning" />;
      default: return <NotificationsIcon color="info" />;
    }
  };

  const getPlatformIcon = () => {
    if (platform.isAndroid) return <AndroidIcon color="success" />;
    if (platform.isIOS) return <AppleIcon color="info" />;
    return <ComputerIcon color="action" />;
  };

  const getPermissionChip = () => {
    const colors = {
      granted: 'success',
      denied: 'error',
      default: 'warning',
      unknown: 'default'
    };
    
    return (
      <Chip 
        label={permissionStatus} 
        color={colors[permissionStatus] || 'default'}
        size="small"
      />
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          maxHeight: '90vh',
          margin: { xs: '16px', sm: '32px' },
          maxWidth: { xs: 'calc(100vw - 32px)', sm: '600px' },
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <NotificationsIcon />
          Test des Notifications
          {getPlatformIcon()}
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0,0,0,0.1)',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: '3px',
        },
      }}>
        <Box mb={2}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Diagnostiquez les problèmes de notifications sur votre appareil
          </Typography>
          
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Typography variant="body2">Status:</Typography>
            {getPermissionChip()}
          </Box>
        </Box>

        {platform.isAndroid && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Android détecté:</strong> Les notifications peuvent nécessiter des étapes supplémentaires.
              {!platform.isStandalone && (
                <span> Installez l'app (Ajouter à l'écran d'accueil) pour une meilleure expérience.</span>
              )}
            </Typography>
          </Alert>
        )}

        {testing && (
          <Box mb={2}>
            <LinearProgress />
            <Typography variant="body2" align="center" mt={1}>
              Test en cours...
            </Typography>
          </Box>
        )}

        {results.length > 0 && (
          <List dense>
            {results.map((result, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {getStatusIcon(result.status)}
                </ListItemIcon>
                <ListItemText
                  primary={result.name}
                  secondary={result.message}
                />
              </ListItem>
            ))}
          </List>
        )}

        {platform.isAndroid && results.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Conseils Android:</strong>
              </Typography>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Vérifiez que les notifications ne sont pas bloquées dans les paramètres du navigateur</li>
                <li>Autorisez les notifications en arrière-plan</li>
                <li>Désactivez l'optimisation de batterie pour le navigateur</li>
                <li>Installez l'app comme PWA (Ajouter à l'écran d'accueil)</li>
              </ul>
            </Alert>
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Fermer
        </Button>
        <Button onClick={runDiagnostic} disabled={testing}>
          Diagnostic
        </Button>
        {permissionStatus !== 'granted' && (
          <Button onClick={requestPermission} disabled={testing} color="primary">
            Demander Permission
          </Button>
        )}
        {permissionStatus === 'granted' && (
          <Button onClick={testNotification} disabled={testing} color="success">
            Test Notification
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 