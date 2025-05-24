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
  Alert
} from '@mui/material';
import { 
  getNotificationSettings, 
  updateNotificationSettings, 
  requestNotificationPermission,
  getAvailableNotificationTimes,
  showTestNotification,
  getNotificationPermissionStatus
} from '../services/NotificationService';

const NotificationSettingsDialog = ({ open, onClose }) => {
  const [settings, setSettings] = useState({
    enabled: true,
    time: '16:00',
    permission: false,
    useOneSignal: true
  });
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    if (open) {
      const currentSettings = getNotificationSettings();
      setSettings(currentSettings);
      
      // Vérifier le statut des permissions de manière asynchrone
      getNotificationPermissionStatus().then(status => {
        setPermissionStatus(status);
      });
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
      setTestResult('🔄 Test en cours...');
      
      const success = await showTestNotification();
      if (success) {
        setTestResult('✅ Notification envoyée avec succès !');
      } else {
        setTestResult('❌ Impossible d\'envoyer la notification. Vérifiez les permissions.');
      }
      
      // Effacer le message après 5 secondes
      setTimeout(() => setTestResult(''), 5000);
      
    } catch (error) {
      console.error('Erreur lors du test de notification:', error);
      setTestResult('❌ Erreur lors du test de notification.');
      setTimeout(() => setTestResult(''), 5000);
    }
  };

  const handleRequestPermission = async () => {
    setTestResult('🔄 Demande de permission...');
    
    const granted = await requestNotificationPermission();
    
    if (granted) {
      setPermissionStatus('granted');
      setSettings(prev => ({ ...prev, permission: true }));
      setTestResult('✅ Permissions accordées !');
    } else {
      setPermissionStatus('denied');
      setTestResult('❌ Permission refusée');
    }
    
    setTimeout(() => setTestResult(''), 3000);
  };

  const availableTimes = getAvailableNotificationTimes();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Paramètres de notification</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Recevez une notification quotidienne pour vous rappeler de faire votre entraînement.
            <br />
            <Typography variant="caption" color="primary">
              🚀 Powered by OneSignal - Notifications push fiables
            </Typography>
          </Typography>
          
          {permissionStatus === 'denied' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Les notifications sont bloquées. Vous devez les autoriser dans les paramètres de votre navigateur.
            </Alert>
          )}
          
          {permissionStatus === 'default' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Activez les notifications pour ne jamais manquer votre entraînement !
              </Typography>
              <Button 
                size="small" 
                onClick={handleRequestPermission} 
                variant="contained"
                sx={{ mt: 1 }}
              >
                🔔 Autoriser les notifications
              </Button>
            </Alert>
          )}
          
          {testResult && (
            <Alert 
              severity={testResult.includes('✅') ? 'success' : testResult.includes('🔄') ? 'info' : 'error'} 
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
              />
            }
            label="Activer les notifications quotidiennes"
          />
        </Box>
        
        {settings.enabled && permissionStatus === 'granted' && (
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Heure de notification</InputLabel>
              <Select
                value={settings.time}
                onChange={handleTimeChange}
                label="Heure de notification"
              >
                {availableTimes.map((time) => (
                  <MenuItem key={time} value={time}>
                    {time}
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
              disabled={testResult.includes('🔄')}
              startIcon={testResult.includes('🔄') ? '🔄' : '🧪'}
            >
              {testResult.includes('🔄') ? 'Test en cours...' : 'Tester la notification'}
            </Button>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Utilisez ce bouton pour vérifier que les notifications fonctionnent correctement.
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationSettingsDialog;
