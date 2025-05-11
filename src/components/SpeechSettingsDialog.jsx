import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Slider, 
  Switch, 
  FormControlLabel, 
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  getConfig, 
  updateConfig, 
  getVoices, 
  speak 
} from '../services/SpeechService';
import './SpeechSettings.css';

/**
 * Composant de configuration de la synthèse vocale
 */
function SpeechSettingsDialog({ open, onClose, speechEnabled }) {
  // États pour les paramètres
  const [config, setConfig] = useState(getConfig());
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');

  // Charger les voix disponibles
  useEffect(() => {
    const availableVoices = getVoices();
    setVoices(availableVoices);
    
    // Définir la voix sélectionnée si elle existe
    if (config.voice) {
      setSelectedVoice(config.voice.name);
    }
  }, [open]);

  // Gestionnaire de changement de volume
  const handleVolumeChange = (event, newValue) => {
    setConfig(prev => ({ ...prev, volume: newValue }));
  };

  // Gestionnaire de changement de vitesse
  const handleRateChange = (event, newValue) => {
    setConfig(prev => ({ ...prev, rate: newValue }));
  };

  // Gestionnaire de changement de tonalité
  const handlePitchChange = (event, newValue) => {
    setConfig(prev => ({ ...prev, pitch: newValue }));
  };

  // Gestionnaire de commutateur pour les décomptes
  const handleCountdownToggle = (event) => {
    setConfig(prev => ({ ...prev, countdownEnabled: event.target.checked }));
  };

  // Gestionnaire de commutateur pour les exercices
  const handleExerciseToggle = (event) => {
    setConfig(prev => ({ ...prev, exerciseEnabled: event.target.checked }));
  };

  // Gestionnaire de commutateur pour les pauses
  const handlePauseToggle = (event) => {
    setConfig(prev => ({ ...prev, pauseEnabled: event.target.checked }));
  };

  // Gestionnaire de changement de voix
  const handleVoiceChange = (event) => {
    const voiceName = event.target.value;
    setSelectedVoice(voiceName);
    
    // Trouver l'objet voix correspondant
    const selectedVoiceObj = voices.find(v => v.name === voiceName);
    if (selectedVoiceObj) {
      setConfig(prev => ({ 
        ...prev, 
        voice: selectedVoiceObj,
        lang: selectedVoiceObj.lang
      }));
    }
  };

  // Prévisualiser les réglages actuels
  const handlePreview = () => {
    speak("Ceci est un exemple de la synthèse vocale avec les paramètres actuels.", config);
  };

  // Enregistrer les paramètres
  const handleSave = () => {
    updateConfig(config);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth className="speech-settings-dialog">
      <DialogTitle>Paramètres de synthèse vocale</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            Volume:
          </Typography>
          <Slider
            value={config.volume}
            onChange={handleVolumeChange}
            aria-labelledby="volume-slider"
            step={0.1}
            marks
            min={0}
            max={1}
            valueLabelDisplay="auto"
            disabled={!speechEnabled}
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            Vitesse:
          </Typography>
          <Slider
            value={config.rate}
            onChange={handleRateChange}
            aria-labelledby="rate-slider"
            step={0.1}
            marks
            min={0.5}
            max={2}
            valueLabelDisplay="auto"
            disabled={!speechEnabled}
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            Tonalité:
          </Typography>
          <Slider
            value={config.pitch}
            onChange={handlePitchChange}
            aria-labelledby="pitch-slider"
            step={0.1}
            marks
            min={0.1}
            max={2}
            valueLabelDisplay="auto"
            disabled={!speechEnabled}
          />
        </Box>
        
        {voices.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth disabled={!speechEnabled}>
              <InputLabel id="voice-select-label">Voix</InputLabel>
              <Select
                labelId="voice-select-label"
                id="voice-select"
                value={selectedVoice}
                label="Voix"
                onChange={handleVoiceChange}
              >
                {voices.map((voice) => (
                  <MenuItem key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
        
        <Box sx={{ mb: 1 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={config.countdownEnabled} 
                onChange={handleCountdownToggle}
                disabled={!speechEnabled}
              />
            }
            label="Annoncer les décomptes"
          />
        </Box>
        
        <Box sx={{ mb: 1 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={config.exerciseEnabled} 
                onChange={handleExerciseToggle}
                disabled={!speechEnabled}
              />
            }
            label="Annoncer les exercices"
          />
        </Box>
        
        <Box sx={{ mb: 1 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={config.pauseEnabled} 
                onChange={handlePauseToggle}
                disabled={!speechEnabled}
              />
            }
            label="Annoncer les pauses"
          />
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handlePreview} disabled={!speechEnabled}>
          Prévisualiser
        </Button>
        <Button onClick={onClose} color="secondary">
          Annuler
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SpeechSettingsDialog;
