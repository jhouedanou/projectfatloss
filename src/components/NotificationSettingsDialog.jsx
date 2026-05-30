import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  FormControlLabel, 
  Switch, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Box, 
  Typography,
  Alert,
  Divider
} from '@mui/material';
import { 
  getNotificationSettings, 
  updateNotificationSettings, 
  requestNotificationPermission,
  getAvailableNotificationTimes,
  showTestNotification,
  getNotificationPermissionStatus
} from '../services/NotificationService';
import NotificationTestDialog from './NotificationTestDialog';
import GoogleFitService from '../services/GoogleFitService';

const NotificationSettingsDialog = ({ open, onClose }) => {
  const [settings, setSettings] = useState({
    enabled: true,
    time: '16:00',
    permission: false,
    useOneSignal: true
  });
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [testResult, setTestResult] = useState('');
  const [showAdvancedTest, setShowAdvancedTest] = useState(false);
  
  // Google Fit states
  const [isLoadingFit, setIsLoadingFit] = useState(false);
  const [isFitConnected, setIsFitConnected] = useState(false);

  useEffect(() => {
    if (open) {
      const currentSettings = getNotificationSettings();
      setSettings(currentSettings);
      
      // Vérifier le statut des permissions de manière asynchrone
      getNotificationPermissionStatus().then(status => {
        setPermissionStatus(status);
      });

      // Vérifier si Google Fit est déjà connecté
      try {
        setIsFitConnected(GoogleFitService.isSignedIn());
      } catch (e) {
        console.log('Google Fit non initialisé au montage');
        setIsFitConnected(false);
      }
    }
  }, [open]);

  const handleEnableChange = async (event) => {
    const enabled = event.target.checked;
    
    if (enabled && Notification.permission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) {
        return; // Ne pas activer si la permission n'est pas accordée
      }
      setPermissionStatus('granted');
    }
    
    const newSettings = { ...settings, enabled };
    setSettings(newSettings);
    updateNotificationSettings(newSettings);
  };

  const handleTimeChange = (event) => {
    const time = event.target.value;
    const newSettings = { ...settings, time };
    setSettings(newSettings);
    updateNotificationSettings(newSettings);
  };

  const handleTestNotification = async () => {
    try {
      setTestResult('Test en cours...');
      
      const success = await showTestNotification();
      if (success) {
        setTestResult('Notification envoyée avec succès !');
      } else {
        setTestResult('Impossible d\'envoyer la notification. Vérifiez les permissions.');
      }
      
      // Effacer le message après 5 secondes
      setTimeout(() => setTestResult(''), 5000);
      
    } catch (error) {
      console.error('Erreur lors du test de notification:', error);
      setTestResult('Erreur lors du test de notification.');
      setTimeout(() => setTestResult(''), 5000);
    }
  };

  const handleRequestPermission = async () => {
    setTestResult('Demande de permission...');
    
    const granted = await requestNotificationPermission();
    
    if (granted) {
      setPermissionStatus('granted');
      setSettings(prev => ({ ...prev, permission: true }));
      setTestResult('Permissions accordées !');
    } else {
      setPermissionStatus('denied');
      setTestResult('Permission refusée');
    }
    
    setTimeout(() => setTestResult(''), 3000);
  };

  const handleConnectGoogleFit = async () => {
    setIsLoadingFit(true);
    try {
      await GoogleFitService.signIn();
      setIsFitConnected(true);
      alert('Connexion Google Fit réussie ! Vos futures séances pourront être synchronisées.');
    } catch (error) {
      console.error(error);
      alert(`Erreur de connexion à Google Fit : ${error.message || error}`);
    } finally {
      setIsLoadingFit(false);
    }
  };

  const availableTimes = getAvailableNotificationTimes();

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
          backgroundColor: '#18181b',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px'
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontWeight: 'bold' }}>
        Paramètres & Intégrations
      </DialogTitle>
      <DialogContent sx={{ 
        pb: 2,
        pt: 2,
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
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: '600', mb: 1, color: '#fff' }}>
            Rappels d'Entraînement
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Recevez une notification quotidienne pour vous rappeler de faire votre entraînement.
            <br />
            <Typography variant="caption" color="primary">
              Powered by OneSignal - Notifications push fiables
            </Typography>
          </Typography>
          
          {permissionStatus === 'denied' && (
            <Alert severity="warning" sx={{ mb: 2, backgroundColor: 'rgba(255, 152, 0, 0.1)', color: '#ffb74d' }}>
              Les notifications sont bloquées. Vous devez les autoriser dans les paramètres de votre navigateur.
            </Alert>
          )}
          
          {permissionStatus === 'default' && (
            <Alert severity="info" sx={{ mb: 2, backgroundColor: 'rgba(3, 169, 244, 0.1)', color: '#4fc3f7' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Activez les notifications pour ne jamais manquer votre entraînement !
              </Typography>
              <Button 
                size="small" 
                onClick={handleRequestPermission} 
                variant="contained"
                sx={{ mt: 1, background: 'var(--vermilion)', '&:hover': { background: '#c41e0b' } }}
              >
                Autoriser les notifications
              </Button>
            </Alert>
          )}
          
          {testResult && (
            <Alert 
              severity={testResult.includes('succès') ? 'success' : 'error'} 
              sx={{ mb: 2 }}
            >
              {testResult}
            </Alert>
          )}
          
          <FormControlLabel
            control={
              <Switch 
                checked={settings.enabled && permissionStatus === 'granted'} 
                onChange={handleEnableChange}
                disabled={permissionStatus !== 'granted'}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--vermilion)' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'var(--vermilion)' }
                }}
              />
            }
            label="Activer les notifications quotidiennes"
          />
        </Box>
        
        {settings.enabled && permissionStatus === 'granted' && (
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-focused': { color: 'var(--vermilion)' } }}>Heure de notification</InputLabel>
              <Select
                value={settings.time}
                onChange={handleTimeChange}
                label="Heure de notification"
                sx={{
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--vermilion)' },
                  '& .MuiSvgIcon-root': { color: '#fff' }
                }}
              >
                {availableTimes.map((time) => (
                  <MenuItem key={time.value} value={time.value}>
                    {time.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Vous recevrez une notification tous les jours à cette heure.
            </Typography>
          </Box>
        )}
        
        {permissionStatus === 'granted' && (
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={handleTestNotification}
              size="small"
              disabled={testResult === 'Test en cours...'}
              sx={{
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.2)',
                '&:hover': { borderColor: 'var(--vermilion)', color: 'var(--vermilion)' }
              }}
            >
              {testResult === 'Test en cours...' ? 'Test en cours...' : 'Tester la notification'}
            </Button>
          </Box>
        )}

        {/* Section Google Fit */}
        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.05)' }} />
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: '600', mb: 1, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img 
              src="https://www.gstatic.com/images/branding/product/1x/gfit_512dp.png" 
              alt="Google Fit" 
              style={{ width: '20px', height: '20px', objectFit: 'contain' }}
            />
            Intégration Google Fit
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Synchronisez vos séances d'entraînement et vos calories brûlées directement avec votre compte Google Fit.
          </Typography>
          
          <Button 
            variant="contained"
            disabled={isLoadingFit || isFitConnected}
            onClick={handleConnectGoogleFit}
            size="small"
            sx={{
              background: isFitConnected ? 'rgba(76, 175, 80, 0.2)' : 'linear-gradient(135deg, #4285F4, #34A853)',
              color: isFitConnected ? '#4CAF50' : 'white',
              fontWeight: '600',
              textTransform: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              border: isFitConnected ? '1px solid rgba(76, 175, 80, 0.3)' : 'none',
              '&:hover': {
                background: isFitConnected ? 'rgba(76, 175, 80, 0.2)' : 'linear-gradient(135deg, #357ae8, #2c8c43)',
              }
            }}
          >
            {isLoadingFit ? 'Connexion...' : isFitConnected ? '✓ Connecté à Google Fit' : 'Connecter Google Fit'}
          </Button>
        </Box>

        {/* Section diagnostic avancé */}
        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.05)' }} />
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: '600', mb: 1, color: '#fff' }}>
            Diagnostic Avancé
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Si les notifications ne fonctionnent pas sur Android, utilisez notre outil de diagnostic.
          </Typography>
          
          <Button 
            variant="contained"
            color="info"
            onClick={() => setShowAdvancedTest(true)}
            size="small"
            sx={{ mr: 1, background: '#1e293b', '&:hover': { background: '#334155' } }}
          >
            Diagnostic Complet
          </Button>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Détecte automatiquement les problèmes Android et propose des solutions.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff' } }}>Fermer</Button>
      </DialogActions>
      
      {/* Dialog de diagnostic avancé */}
      <NotificationTestDialog 
        open={showAdvancedTest}
        onClose={() => setShowAdvancedTest(false)}
      />
    </Dialog>
  );
};

export default NotificationSettingsDialog;
