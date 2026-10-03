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
  CircularProgress,
  Fade
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import { requestNotificationPermission, getNotificationPermissionStatus } from '../services/NotificationService';

const NotificationPermissionScreen = ({ onPermissionChange }) => {
  const [permissionStatus, setPermissionStatus] = useState('checking');
  const [isRequesting, setIsRequesting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const status = await getNotificationPermissionStatus();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        setShowSuccess(true);
        // Informer le parent après un délai
        setTimeout(() => {
          onPermissionChange?.(true);
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur vérification permission:', error);
      setPermissionStatus('error');
    }
  };

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    
    try {
      const granted = await requestNotificationPermission();
      
      if (granted) {
        setPermissionStatus('granted');
        setShowSuccess(true);
        
        // Informer le parent après un délai pour montrer le succès
        setTimeout(() => {
          onPermissionChange?.(true);
        }, 2000);
      } else {
        setPermissionStatus('denied');
      }
    } catch (error) {
      console.error('Erreur demande permission:', error);
      setPermissionStatus('error');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    onPermissionChange?.(false);
  };

  if (permissionStatus === 'checking') {
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

  if (showSuccess) {
    return (
      <Container maxWidth="sm">
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="100vh"
        >
          <Fade in={true}>
            <Card elevation={3} sx={{ textAlign: 'center', p: 3 }}>
              <CardContent>
                <CheckCircleIcon 
                  color="success" 
                  sx={{ fontSize: 80, mb: 2 }} 
                />
                <Typography variant="h5" gutterBottom color="success.main">
                  Parfait ! 🎉
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Les notifications sont activées.<br />
                  Vous recevrez vos rappels d'entraînement !
                </Typography>
              </CardContent>
            </Card>
          </Fade>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        py={4}
      >
        <Card elevation={3} sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            
            {/* Icône */}
            <Box sx={{ mb: 3 }}>
              <NotificationsIcon 
                color={permissionStatus === 'denied' ? 'error' : 'primary'} 
                sx={{ fontSize: 80 }} 
              />
            </Box>

            {/* Titre */}
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Notifications d'Entraînement
            </Typography>

            {/* Description */}
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Ne ratez plus jamais vos séances ! Recevez un rappel quotidien 
              pour rester motivé et atteindre vos objectifs.
            </Typography>

            {/* Bénéfices */}
            <Box sx={{ mb: 4 }}>
              <Stack spacing={1} alignItems="flex-start" sx={{ textAlign: 'left' }}>
                <Typography variant="body2" display="flex" alignItems="center">
                  <span style={{ color: '#30d158', marginRight: 8 }}>✓</span>
                  Rappels quotidiens personnalisés
                </Typography>
                <Typography variant="body2" display="flex" alignItems="center">
                  <span style={{ color: '#30d158', marginRight: 8 }}>✓</span>
                  Notifications d'exercice en cours
                </Typography>
                <Typography variant="body2" display="flex" alignItems="center">
                  <span style={{ color: '#30d158', marginRight: 8 }}>✓</span>
                  Suivi des séries et répétitions
                </Typography>
                <Typography variant="body2" display="flex" alignItems="center">
                  <span style={{ color: '#30d158', marginRight: 8 }}>✓</span>
                  Motivation et encouragements
                </Typography>
              </Stack>
            </Box>

            {/* Alertes d'état */}
            {permissionStatus === 'denied' && (
              <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2">
                  <strong>Notifications bloquées</strong><br />
                  Pour les activer : Menu (⋮) → Paramètres du site → Notifications → Autoriser
                </Typography>
              </Alert>
            )}

            {permissionStatus === 'error' && (
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2">
                  Erreur lors de la vérification des permissions. 
                  Vérifiez que votre navigateur supporte les notifications.
                </Typography>
              </Alert>
            )}

            {permissionStatus === 'not-supported' && (
              <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2">
                  Votre navigateur ne supporte pas les notifications push.
                </Typography>
              </Alert>
            )}

            {/* Boutons d'action */}
            <Stack spacing={2}>
              {(permissionStatus === 'default' || permissionStatus === 'denied') && (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleRequestPermission}
                  disabled={isRequesting}
                  startIcon={isRequesting ? <CircularProgress size={20} /> : <NotificationsIcon />}
                  sx={{ 
                    py: 1.5,
                    background: 'linear-gradient(45deg, #F03D32 30%, #FF6B35 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #E02A1F 30%, #FF5722 90%)',
                    }
                  }}
                >
                  {isRequesting ? 'Demande en cours...' : 'Activer les Notifications'}
                </Button>
              )}

              {permissionStatus === 'denied' && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={checkPermissionStatus}
                >
                  Vérifier les Permissions
                </Button>
              )}

              <Button
                variant="text"
                onClick={handleSkip}
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                Passer pour l'instant
              </Button>
            </Stack>

            {/* Note légale */}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
              Vous pouvez modifier ces préférences à tout moment dans les paramètres.
            </Typography>

          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default NotificationPermissionScreen; 