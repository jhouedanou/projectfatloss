import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Stack,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Android as AndroidIcon,
  NotificationsActive as NotificationsActiveIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Dumbbell, Timer, Activity, BarChart3 } from 'lucide-react';
import GradientButton from './GradientButton';
import { requestNotificationPermission, testAndroid15GitHubPagesNotification } from '../services/NotificationService';

const Android15NotificationSetup = ({ onComplete, onSkip }) => {
  const theme = useTheme();
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
        setTestResult('Permission accordée avec succès !');
      } else {
        setPermission('denied');
        setTestResult('Permission refusée');
      }
    } catch (error) {
      console.error('Erreur demande permission:', error);
      setTestResult('Erreur lors de la demande');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setIsLoading(true);
    
    try {
      const success = await testAndroid15GitHubPagesNotification();
      
      if (success) {
        setTestResult('Notification test envoyée !');
        setTimeout(() => {
          setActiveStep(3);
          onComplete?.({
            permission: 'granted',
            android15: isAndroid15,
            tested: true
          });
        }, 2000);
      } else {
        setTestResult('Échec du test de notification');
      }
    } catch (error) {
      console.error('Erreur test notification:', error);
      setTestResult('Erreur lors du test');
    } finally {
      setIsLoading(false);
    }
  };

  const openAndroidSettings = () => {
    const instructions = `
Paramètres Android pour notifications :

1. Paramètres → Applications
2. Chrome → Notifications  
3. Autoriser toutes les notifications
4. Notifications importantes → Activer

Optimisation batterie :
1. Paramètres → Batterie
2. Optimisation batterie
3. Chrome → Ne pas optimiser

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
            <Alert 
              severity="info" 
              sx={{ 
                mt: 2,
                borderRadius: '12px',
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.info.main, 0.1)} 0%, 
                  ${alpha(theme.palette.primary.main, 0.05)} 100%
                )`,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              }}
            >
              <Typography variant="body2">
                <strong>Optimisations Android 15 :</strong><br />
                • Notifications persistantes avec contrôles<br />
                • Vibrations personnalisées<br />
                • Actions rapides d'entraînement<br />
                • Interface optimisée pour le fitness
              </Typography>
            </Alert>
          )}
          
          <GradientButton
            onClick={() => setActiveStep(1)}
            sx={{ mt: 2 }}
            fullWidth
            size="large"
          >
            Continuer la Configuration
          </GradientButton>
        </Box>
      )
    },
    {
      label: 'Demande de permission',
      content: (
        <Box>
          <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.primary }}>
            Autorisez les notifications pour recevoir :
          </Typography>
          
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Chip 
              icon={<Dumbbell size={16} />} 
              label="Rappels d'entraînement quotidiens" 
              size="small"
              sx={{ 
                background: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 500,
                paddingLeft: '4px'
              }}
            />
            <Chip 
              icon={<Timer size={16} />} 
              label="Minuteurs de pause et exercices" 
              size="small"
              sx={{ 
                background: alpha(theme.palette.secondary.main, 0.1),
                color: theme.palette.secondary.main,
                fontWeight: 500,
                paddingLeft: '4px'
              }}
            />
            <Chip 
              icon={<Activity size={16} />} 
              label="Suivi d'exercices en temps réel" 
              size="small"
              sx={{ 
                background: alpha(theme.palette.warning.main, 0.1),
                color: theme.palette.warning.main,
                fontWeight: 500,
                paddingLeft: '4px'
              }}
            />
            <Chip 
              icon={<BarChart3 size={16} />} 
              label="Statistiques et progression" 
              size="small"
              sx={{ 
                background: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                fontWeight: 500,
                paddingLeft: '4px'
              }}
            />
          </Stack>

          {permission === 'denied' && (
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 2,
                borderRadius: '12px',
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.warning.main, 0.1)} 0%, 
                  ${alpha(theme.palette.error.main, 0.05)} 100%
                )`,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
              }}
            >
              <Typography variant="body2">
                <strong>Permission bloquée</strong><br />
                Cliquez sur "Paramètres Android" pour débloquer manuellement les notifications.
              </Typography>
            </Alert>
          )}

          <Stack spacing={2}>
            <GradientButton
              onClick={handleRequestPermission}
              disabled={isLoading || permission === 'granted'}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <NotificationsActiveIcon />}
              fullWidth
              size="large"
            >
              {permission === 'granted' ? 'Permission Accordée' : 
               isLoading ? 'Demande en cours...' : 
               'Autoriser les Notifications'}
            </GradientButton>
            
            {permission === 'denied' && (
              <GradientButton
                variant="outlined"
                onClick={openAndroidSettings}
                startIcon={<SettingsIcon />}
                fullWidth
              >
                Ouvrir Paramètres Android
              </GradientButton>
            )}
          </Stack>
          
          {testResult && (
            <Alert 
              severity={testResult.includes('échoué') || testResult.includes('refusée') || testResult.includes('Erreur') ? 'error' : 'success'} 
              sx={{ 
                mt: 2,
                borderRadius: '12px',
                fontWeight: 500
              }}
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
            Testons maintenant votre système de notifications :
          </Typography>
          
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              borderRadius: '12px',
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.info.main, 0.1)} 0%, 
                ${alpha(theme.palette.primary.main, 0.05)} 100%
              )`,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            }}
          >
            <Typography variant="body2">
              <strong>Test complet :</strong><br />
              • Affichage de la notification push<br />
              • Vibration et son personnalisés<br />
              • Icône et badge Project Fat Loss<br />
              {isAndroid15 && '• Fonctionnalités avancées Android 15'}
            </Typography>
          </Alert>
          
          <GradientButton
            onClick={handleTestNotification}
            disabled={isLoading || permission !== 'granted'}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <NotificationsActiveIcon />}
            fullWidth
            size="large"
            sx={{ mb: 2 }}
          >
            {isLoading ? 'Test en cours...' : 'Tester les Notifications'}
          </GradientButton>
          
          {testResult && (
            <Alert 
              severity={testResult.includes('échoué') || testResult.includes('refusée') || testResult.includes('Erreur') ? 'error' : 'success'} 
              sx={{ 
                mt: 2,
                borderRadius: '12px',
                fontWeight: 500
              }}
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
            sx={{ fontSize: 80, mb: 2 }} 
          />
          <Typography variant="h5" gutterBottom sx={{ 
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.primary.main} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Configuration Réussie !
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Vos notifications sont maintenant configurées{isAndroid15 ? ' avec les optimisations Android 15' : ''}.
            <br />Vous êtes prêt à transformer votre corps !
          </Typography>
          
          <GradientButton
            onClick={() => onComplete?.({
              permission: 'granted',
              android15: isAndroid15,
              tested: true
            })}
            size="large"
            sx={{ minWidth: '200px' }}
          >
            Commencer l'Entraînement
          </GradientButton>
        </Box>
      )
    }
  ];

  if (isLoading && activeStep === 0) {
    return (
      <Container maxWidth="sm">
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight="100vh"
          gap={3}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Détection de votre appareil...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box py={{ xs: 2, sm: 4 }} sx={{ maxHeight: '100vh', overflow: 'auto' }}>
        <Card 
          elevation={0}
          sx={{
            borderRadius: '24px',
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.background.paper, 0.9)} 0%, 
              ${alpha(theme.palette.primary.main, 0.02)} 100%
            )`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            backdropFilter: 'blur(10px)',
            overflow: 'visible',
            maxWidth: { xs: 'calc(100vw - 32px)', sm: 'none' },
            mx: 'auto',
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
            
            <Box textAlign="center" mb={4}>
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 2,
                  borderRadius: '50%',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  mb: 2,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <AndroidIcon 
                  sx={{ fontSize: 40, color: 'white' }}
                />
              </Box>
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Configuration Android{isAndroid15 ? ' 15' : ''}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Optimisation des notifications pour votre entraînement
              </Typography>
            </Box>

            <Stepper 
              activeStep={activeStep} 
              orientation="vertical"
              sx={{
                '& .MuiStepLabel-root': {
                  '& .MuiStepLabel-iconContainer': {
                    '& .Mui-active': {
                      color: theme.palette.primary.main,
                    },
                    '& .Mui-completed': {
                      color: theme.palette.success.main,
                    },
                  },
                },
                '& .MuiStepContent-root': {
                  borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  ml: 1,
                },
              }}
            >
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel>
                    <Typography variant="h6" fontWeight={600}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box py={2}>
                      {step.content}
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>

            <Box mt={4} display="flex" justifyContent="space-between" alignItems="center">
              <GradientButton
                variant="text"
                onClick={() => onSkip?.()}
                size="small"
              >
                Passer pour l'instant
              </GradientButton>
              
              <Chip 
                label={`Android ${isAndroid15 ? '15+' : 'Standard'}`}
                sx={{
                  background: isAndroid15 ? 
                    `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.primary.main} 90%)` :
                    `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              />
            </Box>

          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Android15NotificationSetup;