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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  IconButton,
  Divider
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Battery90 as BatteryIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Android as AndroidIcon,
  Launch as LaunchIcon,
  Apps as AppsIcon,
  PhoneAndroid as PhoneAndroidIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { 
  requestNotificationPermission, 
  getNotificationPermissionStatus,
  getNotificationSettings
} from '../services/NotificationService';
import './AndroidPermissionScreen.css';

function AndroidPermissionScreen({ open, onClose, onComplete }) {
  const [activeStep, setActiveStep] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [batteryOptimized, setBatteryOptimized] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [checking, setChecking] = useState(false);
  const [completed, setCompleted] = useState({
    notifications: false,
    battery: false,
    install: false
  });

  useEffect(() => {
    if (open) {
      checkCurrentStatus();
    }
  }, [open]);

  const checkCurrentStatus = async () => {
    setChecking(true);
    
    // Vérifier le statut des notifications
    try {
      const notificationStatus = await getNotificationPermissionStatus();
      setPermissionStatus(notificationStatus);
      setCompleted(prev => ({ ...prev, notifications: notificationStatus === 'granted' }));
    } catch (error) {
      console.error('Erreur vérification notifications:', error);
    }

    // Vérifier si installé comme PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  window.navigator.standalone ||
                  document.referrer.includes('android-app://');
    setIsInstalled(isPWA);
    setCompleted(prev => ({ ...prev, install: isPWA }));

    // Simulation pour l'optimisation batterie (pas d'API directe)
    setBatteryOptimized(false); // On assume qu'il faut l'optimiser
    
    setChecking(false);
  };

  const handleRequestNotifications = async () => {
    setChecking(true);
    try {
      const granted = await requestNotificationPermission();
      setPermissionStatus(granted ? 'granted' : 'denied');
      setCompleted(prev => ({ ...prev, notifications: granted }));
      
      if (granted) {
        setActiveStep(Math.max(activeStep, 1));
      }
    } catch (error) {
      console.error('Erreur demande permission:', error);
    }
    setChecking(false);
  };

  const handleBatterySettings = () => {
    // Ouvrir les paramètres de batterie Android
    const instructions = `
Pour désactiver l'optimisation de batterie :

1. Ouvrez les Paramètres Android
2. Recherchez "Optimisation de la batterie" ou "Gestion de l'énergie"
3. Trouvez votre navigateur (Chrome, Samsung Internet, etc.)
4. Sélectionnez "Ne pas optimiser" ou "Autoriser en arrière-plan"
5. Confirmez le changement

Cela permettra aux notifications de fonctionner même quand l'écran est éteint.
    `;
    
    alert(instructions);
    setBatteryOptimized(true);
    setCompleted(prev => ({ ...prev, battery: true }));
    setActiveStep(Math.max(activeStep, 2));
  };

  const handleInstallPWA = () => {
    const instructions = `
Pour installer l'application sur votre écran d'accueil :

1. Appuyez sur le menu de votre navigateur (⋮)
2. Sélectionnez "Ajouter à l'écran d'accueil" ou "Installer l'application"
3. Confirmez l'installation
4. L'icône apparaîtra sur votre écran d'accueil

Alternativement, vous pouvez utiliser le bouton d'installation qui peut apparaître dans la barre d'adresse.
    `;
    
    alert(instructions);
    setCompleted(prev => ({ ...prev, install: true }));
  };

  const handleNext = () => {
    setActiveStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(completed);
    }
    onClose();
  };

  const getStepIcon = (stepIndex) => {
    switch (stepIndex) {
      case 0: return <NotificationsIcon />;
      case 1: return <BatteryIcon />;
      case 2: return <HomeIcon />;
      default: return <CheckIcon />;
    }
  };

  const getPermissionChip = () => {
    const colors = {
      granted: 'success',
      denied: 'error',
      default: 'warning',
      unknown: 'default'
    };
    
    const labels = {
      granted: 'Autorisées',
      denied: 'Refusées',
      default: 'En attente',
      unknown: 'Inconnues'
    };
    
    return (
      <Chip 
        label={labels[permissionStatus] || permissionStatus} 
        color={colors[permissionStatus] || 'default'}
        size="small"
        icon={permissionStatus === 'granted' ? <CheckIcon /> : <WarningIcon />}
      />
    );
  };

  const steps = [
    {
      label: 'Notifications',
      description: 'Autoriser les rappels d\'entraînement',
      completed: completed.notifications
    },
    {
      label: 'Optimisation batterie',
      description: 'Désactiver les restrictions d\'arrière-plan',
      completed: completed.battery
    },
    {
      label: 'Installation PWA',
      description: 'Ajouter l\'app à l\'écran d\'accueil',
      completed: completed.install
    }
  ];

  const allCompleted = Object.values(completed).every(Boolean);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        pb: 1
      }}>
        <AndroidIcon sx={{ fontSize: 32, color: '#4CAF50' }} />
        <Box>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            Configuration Android
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Optimiser votre expérience PWA
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        {checking && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress sx={{ borderRadius: 1 }} />
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', opacity: 0.8 }}>
              Vérification des paramètres...
            </Typography>
          </Box>
        )}

        {/* État actuel */}
        <Card sx={{ mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              📱 État Actuel
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`Notifications: ${getPermissionChip().props.label}`}
                color={getPermissionChip().props.color}
                size="small"
              />
              <Chip 
                label={`PWA: ${isInstalled ? 'Installée' : 'Non installée'}`}
                color={isInstalled ? 'success' : 'warning'}
                size="small"
              />
              <Chip 
                label={`Batterie: ${batteryOptimized ? 'Optimisée' : 'À configurer'}`}
                color={batteryOptimized ? 'success' : 'warning'}
                size="small"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Stepper de configuration */}
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ 
          '& .MuiStepLabel-root': { color: 'white' },
          '& .MuiStepContent-root': { borderColor: 'rgba(255, 255, 255, 0.3)' }
        }}>
          {/* Étape 1: Notifications */}
          <Step>
            <StepLabel 
              icon={<NotificationsIcon sx={{ color: completed.notifications ? '#4CAF50' : 'white' }} />}
              sx={{ '& .MuiStepLabel-label': { color: 'white !important' } }}
            >
              <Typography variant="h6">Notifications</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Status: {getPermissionChip()}
              </Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', p: 2, borderRadius: 2, mb: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Autorisez les notifications pour recevoir vos rappels d'entraînement quotidiens.
                  </Typography>
                </Alert>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon><InfoIcon sx={{ color: 'lightblue' }} /></ListItemIcon>
                    <ListItemText 
                      primary="Rappels personnalisés" 
                      secondary="À l'heure que vous choisissez"
                      sx={{ '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' } }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><InfoIcon sx={{ color: 'lightblue' }} /></ListItemIcon>
                    <ListItemText 
                      primary="Motivation quotidienne" 
                      secondary="Messages d'encouragement"
                      sx={{ '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' } }}
                    />
                  </ListItem>
                </List>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  {!completed.notifications && (
                    <Button 
                      variant="contained" 
                      onClick={handleRequestNotifications}
                      disabled={checking}
                      sx={{ 
                        backgroundColor: '#4CAF50',
                        '&:hover': { backgroundColor: '#45a049' }
                      }}
                    >
                      Autoriser les Notifications
                    </Button>
                  )}
                  <Button 
                    onClick={handleNext}
                    sx={{ color: 'white' }}
                  >
                    {completed.notifications ? 'Suivant' : 'Ignorer'}
                  </Button>
                </Box>
              </Box>
            </StepContent>
          </Step>

          {/* Étape 2: Optimisation batterie */}
          <Step>
            <StepLabel 
              icon={<BatteryIcon sx={{ color: completed.battery ? '#4CAF50' : 'white' }} />}
              sx={{ '& .MuiStepLabel-label': { color: 'white !important' } }}
            >
              <Typography variant="h6">Optimisation Batterie</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Permettre l'exécution en arrière-plan
              </Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', p: 2, borderRadius: 2, mb: 2 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Android optimise la batterie en limitant les apps en arrière-plan. 
                    Désactivez cette restriction pour recevoir vos notifications.
                  </Typography>
                </Alert>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Instructions pour Android :</strong>
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><SettingsIcon sx={{ color: 'orange' }} /></ListItemIcon>
                    <ListItemText 
                      primary="Paramètres → Batterie" 
                      secondary="Ou 'Gestion de l'énergie'"
                      sx={{ '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' } }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><AppsIcon sx={{ color: 'orange' }} /></ListItemIcon>
                    <ListItemText 
                      primary="Optimisation de la batterie" 
                      secondary="Trouvez votre navigateur"
                      sx={{ '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' } }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon sx={{ color: 'lightgreen' }} /></ListItemIcon>
                    <ListItemText 
                      primary="Ne pas optimiser" 
                      secondary="Autoriser en arrière-plan"
                      sx={{ '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' } }}
                    />
                  </ListItem>
                </List>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button 
                    variant="contained" 
                    onClick={handleBatterySettings}
                    sx={{ 
                      backgroundColor: '#FF9800',
                      '&:hover': { backgroundColor: '#F57C00' }
                    }}
                  >
                    Ouvrir Paramètres
                  </Button>
                  <Button onClick={handleBack} sx={{ color: 'white' }}>
                    Précédent
                  </Button>
                  <Button onClick={handleNext} sx={{ color: 'white' }}>
                    Suivant
                  </Button>
                </Box>
              </Box>
            </StepContent>
          </Step>

          {/* Étape 3: Installation PWA */}
          <Step>
            <StepLabel 
              icon={<HomeIcon sx={{ color: completed.install ? '#4CAF50' : 'white' }} />}
              sx={{ '& .MuiStepLabel-label': { color: 'white !important' } }}
            >
              <Typography variant="h6">Installation PWA</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Ajouter à l'écran d'accueil
              </Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', p: 2, borderRadius: 2, mb: 2 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Installez l'app comme une vraie application pour une meilleure expérience 
                    et des notifications plus fiables.
                  </Typography>
                </Alert>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Avantages de l'installation :</strong>
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><LaunchIcon sx={{ color: 'lightgreen' }} /></ListItemIcon>
                    <ListItemText 
                      primary="Lancement rapide" 
                      secondary="Icône sur l'écran d'accueil"
                      sx={{ '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' } }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><NotificationsIcon sx={{ color: 'lightgreen' }} /></ListItemIcon>
                    <ListItemText 
                      primary="Notifications fiables" 
                      secondary="Moins de restrictions"
                      sx={{ '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' } }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><PhoneAndroidIcon sx={{ color: 'lightgreen' }} /></ListItemIcon>
                    <ListItemText 
                      primary="Expérience native" 
                      secondary="Comme une vraie app"
                      sx={{ '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' } }}
                    />
                  </ListItem>
                </List>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  {!completed.install && (
                    <Button 
                      variant="contained" 
                      onClick={handleInstallPWA}
                      sx={{ 
                        backgroundColor: '#2196F3',
                        '&:hover': { backgroundColor: '#1976D2' }
                      }}
                    >
                      Guide d'Installation
                    </Button>
                  )}
                  <Button onClick={handleBack} sx={{ color: 'white' }}>
                    Précédent
                  </Button>
                </Box>
              </Box>
            </StepContent>
          </Step>
        </Stepper>

        {/* Message de fin */}
        {allCompleted && (
          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              🎉 Configuration Terminée !
            </Typography>
            <Typography variant="body2">
              Votre application est maintenant optimisée pour Android. 
              Vous devriez recevoir vos notifications d'entraînement de manière fiable.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ color: 'white' }}>
          Fermer
        </Button>
        {allCompleted && (
          <Button 
            onClick={handleComplete}
            variant="contained"
            sx={{ 
              backgroundColor: '#4CAF50',
              '&:hover': { backgroundColor: '#45a049' }
            }}
          >
            Terminer
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default AndroidPermissionScreen; 