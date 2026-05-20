import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import { saveContactInfo } from '../services/ContactService';

export default function ContactInfoDialog({ open, onClose }) {
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const validateWhatsApp = (number) => {
    // Accepte les formats: +33612345678, 0612345678, 612345678
    const phoneRegex = /^(\+?\d{1,3})?[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/;
    return phoneRegex.test(number) && number.replace(/\D/g, '').length >= 8;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validateEmail(email)) {
      newErrors.email = 'Veuillez entrer une adresse Gmail valide';
    }

    if (!validateWhatsApp(whatsapp)) {
      newErrors.whatsapp = 'Veuillez entrer un numéro WhatsApp valide';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Sauvegarder les informations
    const success = saveContactInfo(whatsapp, email);
    if (success) {
      onClose(true);
    } else {
      setErrors({ general: 'Erreur lors de la sauvegarde' });
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => {}} // Prevent closing by clicking outside
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle>
        <Box sx={{ textAlign: 'center', mb: 1 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
            Bienvenue sur Project Fat Loss !
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pour recevoir vos rapports d'entraînement
          </Typography>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Recevez automatiquement un rapport détaillé après chaque séance: 
            calories brûlées, durée, poids soulevé et plus encore!
          </Alert>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
            <EmailIcon sx={{ mt: 2, mr: 1, color: 'primary.main' }} />
            <TextField
              fullWidth
              label="Adresse Gmail"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: '' });
              }}
              error={!!errors.email}
              helperText={errors.email || 'Exemple: votre.email@gmail.com'}
              placeholder="votre.email@gmail.com"
              required
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <WhatsAppIcon sx={{ mt: 2, mr: 1, color: 'success.main' }} />
            <TextField
              fullWidth
              label="Numéro WhatsApp"
              type="tel"
              value={whatsapp}
              onChange={(e) => {
                setWhatsapp(e.target.value);
                setErrors({ ...errors, whatsapp: '' });
              }}
              error={!!errors.whatsapp}
              helperText={errors.whatsapp || 'Exemple: +33 6 12 34 56 78'}
              placeholder="+33 6 12 34 56 78"
              required
            />
          </Box>

          {errors.general && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errors.general}
            </Alert>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            🔒 Vos informations sont stockées localement sur votre appareil et ne seront 
            utilisées que pour vous envoyer vos rapports d'entraînement.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{
              background: 'linear-gradient(45deg, #F03D32 30%, #FF6B35 90%)',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(45deg, #D02020 30%, #FF5520 90%)',
              }
            }}
          >
            Commencer l'aventure
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
