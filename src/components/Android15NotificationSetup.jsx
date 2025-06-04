import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Stack,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  Android as AndroidIcon,
  NotificationsActive as NotificationsActiveIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { requestNotificationPermission, testAndroid15GitHubPagesNotification } from '../services/NotificationService';

const Android15NotificationSetup = ({ onComplete, onSkip }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [permission, setPermission] = useState('default');
  const [isAndroid15, setIsAndroid15] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    detectAndroidVersion();
    checkInitialPermission();
  }, []);

  const detectAndroidVersion = () => {
    const userAgent = navigator.userAgent;
    const androidMatch = userAgent.match(/Android (\d+)/);
    const androidVersion = androidMatch ? parseInt(androidMatch[1], 10) : 0;
    const isAndroid15Plus = androidVersion >= 15;
    
    setIsAndroid15(isAndroid15Plus);
    setIsLoading(false);
    
    console.log('Android 15+ détecté:', isAndroid15Plus, 'Version:', androidVersion);
  };

  const checkInitialPermission = () => {
    const currentPermission = Notification.permission;
    setPermission(currentPermission);
    
    if (currentPermission === 'granted') {
      setActiveStep(2); // Aller directement au test
    }
  };

  const handleRequestPermission = async () => {
    setIsLoading(true);
    
    try {
      const granted = await requestNotificationPermission();
      
      if (granted) {
        setPermission('granted');
        setActiveStep(2);
        setTestResult('✅ Permission accordée avec succès !');
      } else {
        setPermission('denied');
        setTestResult('❌ Permission refusée');
      }
    } catch (error) {
      console.error('Erreur demande permission:', error);
      setTestResult('❌ Erreur lors de la demande');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setIsLoading(true);
    
    try {
      const success = await testAndroid15GitHubPagesNotification();
      
      if (success) {
        setTestResult('✅ Notification test envoyée !');
        setTimeout(() => {
          setActiveStep(3);
          onComplete?.({
            permission: 'granted',
            android15: isAndroid15,
            tested: true
          });
        }, 2000);
      } else {
        setTestResult('❌ Échec du test de notification');
      }
    } catch (error) {
      console.error('Erreur test notification:', error);
      setTestResult('❌ Erreur lors du test');
    } finally {
      setIsLoading(false);
    }
  };

  const openAndroidSettings = () => {
    // Essayer d'ouvrir les paramètres Android
    const instructions = `
📱 Paramètres Android pour notifications :

1️⃣ Paramètres → Applications
2️⃣ Chrome → Notifications  
3️⃣ Autoriser toutes les notifications
4️⃣ Notifications importantes → Activer

🔋 Optimisation batterie :
1️⃣ Paramètres → Batterie
2️⃣ Optimisation batterie
3️⃣ Chrome → Ne pas optimiser

Revenez ensuite à l'application.
    `;
    
    alert(instructions);
  };

  const steps = [
    {
      label: 'Détection de l\'appareil',
      content: (
        <Box>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {isAndroid15 ? (
              <>
                <CheckCircleIcon color="success" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Android 15+ détecté ! Configuration optimisée activée.
              </>
            ) : (
              <>
                <AndroidIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Appareil Android détecté. Configuration standard.
              </>
            )}
          </Typography>
          
          {isAndroid15 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Optimisations Android 15 :</strong><br />
                • Notifications persistantes<br />
                • Vibrations améliorées<br />
                • Actions rapides<br />
                • Contrôles d'exercice
              </Typography>
            </Alert>
          )}
          
          <Button
            variant="contained"
            onClick={() => setActiveStep(1)}
            sx={{ mt: 2 }}
            fullWidth
          >
            Continuer
          </Button>
        </Box>
      )
    },
    {
      label: 'Demande de permission',
      content: (
        <Box>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Autorisez les notifications pour recevoir :
          </Typography>
          
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Chip icon="🏋️" label="Rappels d'entraînement" size="small" />
            <Chip icon="⏰" label="Notifications de pause" size="small" />
            <Chip icon="🔥" label="Suivi d'exercices en cours" size="small" />
            <Chip icon="📊" label="Statistiques de progression" size="small" />
          </Stack>

          {permission === 'denied' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Permission bloquée</strong><br />
                Cliquez sur "Paramètres Android" pour débloquer manuellement.
              </Typography>
            </Alert>
          )}

          <Stack spacing={2}>
            <Button
              variant="contained"
              onClick={handleRequestPermission}
              disabled={isLoading || permission === 'granted'}
              startIcon={isLoading ? <CircularProgress size={20} /> : <NotificationsActiveIcon />}
              fullWidth
            >
              {permission === 'granted' ? 'Permission accordée ✅' : 
               isLoading ? 'Demande en cours...' : 
               'Autoriser les Notifications'}
            </Button>
            
            {permission === 'denied' && (
              <Button
                variant="outlined"
                onClick={openAndroidSettings}
                startIcon={<SettingsIcon />}
                fullWidth
              >
                Paramètres Android
              </Button>
            )}
          </Stack>
          
          {testResult && (
            <Alert 
              severity={testResult.includes('✅') ? 'success' : 'error'} 
              sx={{ mt: 2 }}
            >
              {testResult}
            </Alert>
          )}
        </Box>
      )
    },
    {
      label: 'Test des notifications',
      content: (
        <Box>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Testons maintenant le système de notifications :
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Ce qui va être testé :</strong><br />
              • Affichage de la notification<br />
              • Son et vibration<br />
              • Icône et badge<br />
              {isAndroid15 && '• Fonctionnalités Android 15'}
            </Typography>
          </Alert>
          
          <Button
            variant="contained"
            onClick={handleTestNotification}
            disabled={isLoading || permission !== 'granted'}
            startIcon={isLoading ? <CircularProgress size={20} /> : '🧪'}
            fullWidth
            sx={{ mb: 2 }}
          >
            {isLoading ? 'Test en cours...' : 'Tester les Notifications'}
          </Button>
          
          {testResult && (
            <Alert 
              severity={testResult.includes('✅') ? 'success' : 'error'} 
              sx={{ mt: 2 }}
            >
              {testResult}
            </Alert>
          )}
        </Box>
      )
    },
    {
      label: 'Configuration terminée',
      content: (
        <Box textAlign="center">
          <CheckCircleIcon 
            color="success" 
            sx={{ fontSize: 60, mb: 2 }} 
          />
          <Typography variant="h6" gutterBottom color="success.main">
            Configuration réussie ! 🎉
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Vos notifications sont maintenant configurées{isAndroid15 ? ' avec les optimisations Android 15' : ''}.
            Vous êtes prêt à commencer vos entraînements !
          </Typography>
          
          <Button
            variant="contained"
            onClick={() => onComplete?.({
              permission: 'granted',
              android15: isAndroid15,
              tested: true
            })}
            size="large"
          >
            Commencer l'Entraînement 🚀
          </Button>
        </Box>
      )
    }
  ];

  if (isLoading && activeStep === 0) {
    return (
      <Container maxWidth="sm">
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <AndroidIcon 
                color="primary" 
                sx={{ fontSize: 50, mb: 2 }} 
              />
              <Typography variant="h5" gutterBottom>
                Configuration Android{isAndroid15 ? ' 15' : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Optimisation des notifications pour votre appareil
              </Typography>
            </Box>

            {/* Stepper */}
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel>
                    <Typography variant="body1" fontWeight="medium">
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    {step.content}
                  </StepContent>
                </Step>
              ))}
            </Stepper>

            {/* Actions Footer */}
            <Box mt={4} display="flex" justifyContent="space-between">
              <Button
                variant="text"
                onClick={() => onSkip?.()}
                color="text.secondary"
              >
                Passer pour l'instant
              </Button>
              
              <Chip 
                label={`Android ${isAndroid15 ? '15+' : 'Standard'}`}
                color={isAndroid15 ? 'success' : 'primary'}
                size="small"
              />
            </Box>

          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Android15NotificationSetup; 