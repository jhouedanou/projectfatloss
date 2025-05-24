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
  showTestNotification
} from '../services/NotificationService';

const NotificationSettingsDialog = ({ open, onClose }) => {
  const [settings, setSettings] = useState({
    enabled: true,
    time: '16:00',
    permission: false
  });
  const [permissionStatus, setPermissionStatus] = useState('default');

  useEffect(() => {
    if (open) {
      const currentSettings = getNotificationSettings();
      setSettings(currentSettings);
      setPermissionStatus(Notification.permission);
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

  const handleTestNotification = () => {
    const success = showTestNotification();
    if (!success) {
      alert('Impossible d\'afficher la notification. Vérifiez les permissions.');
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
    if (granted) {
      setSettings(prev => ({ ...prev, permission: true }));
    }
  };

  const availableTimes = getAvailableNotificationTimes();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Paramètres de notification</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Recevez une notification quotidienne pour vous rappeler de faire votre entraînement.
          </Typography>
          
          {permissionStatus === 'denied' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Les notifications sont bloquées. Vous devez les autoriser dans les paramètres de votre navigateur.
            </Alert>
          )}
          
          {permissionStatus === 'default' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Button size="small" onClick={handleRequestPermission} sx={{ mt: 1 }}>
                Autoriser les notifications
              </Button>
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
            >
              Tester la notification
            </Button>
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
