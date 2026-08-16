import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getUserProfile, getUserWeight, setUserProfile } from '../services/CalorieEstimator';
import { addWeightRecord } from '../services/WeightStorage';
import { getCalorieTarget, getProteinTargetGrams } from '../services/NutritionGoals';

/**
 * Édition du profil (poids, taille, âge, sexe) — alimente le calcul des
 * calories brûlées et l'objectif calorique quotidien (Mifflin-St Jeor).
 * Un poids modifié est aussi enregistré comme pesée pour garder la courbe
 * de poids et getUserWeight() cohérents.
 */
const ProfileDialog = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('M');

  useEffect(() => {
    if (open) {
      const profile = getUserProfile();
      setWeight(String(getUserWeight()));
      setHeight(String(profile.heightCm));
      setAge(String(profile.ageYears));
      setSex(profile.sex || 'M');
    }
  }, [open]);

  const handleSave = () => {
    const weightKg = parseFloat(weight);
    const heightCm = parseFloat(height);
    const ageYears = parseInt(age, 10);
    const previousWeight = getUserWeight();

    setUserProfile({
      ...(weightKg > 30 && weightKg < 350 ? { weightKg } : {}),
      ...(heightCm > 100 && heightCm < 250 ? { heightCm } : {}),
      ...(ageYears > 10 && ageYears < 120 ? { ageYears } : {}),
      sex,
    });

    if (weightKg > 30 && weightKg < 350 && weightKg !== previousWeight) {
      addWeightRecord(weightKg, null, 'Profil mis à jour');
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('profile.title', { defaultValue: 'Mon profil' })}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label={t('profile.weight', { defaultValue: 'Poids (kg)' })}
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            inputProps={{ min: 30, max: 350, step: 0.1 }}
            fullWidth
          />
          <TextField
            label={t('profile.height', { defaultValue: 'Taille (cm)' })}
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            inputProps={{ min: 100, max: 250 }}
            fullWidth
          />
          <TextField
            label={t('profile.age', { defaultValue: 'Âge' })}
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            inputProps={{ min: 10, max: 120 }}
            fullWidth
          />
          <Box>
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
              {t('profile.sex', { defaultValue: 'Sexe' })}
            </Typography>
            <ToggleButtonGroup
              value={sex}
              exclusive
              onChange={(e, value) => value && setSex(value)}
              size="small"
              fullWidth
            >
              <ToggleButton value="M">{t('profile.male', { defaultValue: 'Homme' })}</ToggleButton>
              <ToggleButton value="F">{t('profile.female', { defaultValue: 'Femme' })}</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {t('profile.goalPreview', {
              defaultValue: 'Objectif actuel : {{kcal}} kcal/jour • {{protein}} g de protéines',
              kcal: getCalorieTarget(),
              protein: getProteinTargetGrams(),
            })}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('profile.cancel', { defaultValue: 'Annuler' })}</Button>
        <Button onClick={handleSave} variant="contained">
          {t('profile.save', { defaultValue: 'Enregistrer' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileDialog;
