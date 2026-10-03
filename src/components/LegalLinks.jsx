import React from 'react';
import { Box, Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

// URL absolues volontairement : ces pages doivent être publiquement accessibles
// (exigence de l'écran de consentement OAuth Google) et les liens doivent
// fonctionner aussi bien sur le web que dans l'APK Capacitor, où la page est
// servie depuis https://localhost — un chemin relatif y donnerait un 404.
export const PRIVACY_URL = 'https://jhouedanou.github.io/projectfatloss/privacy.html';
export const TERMS_URL = 'https://jhouedanou.github.io/projectfatloss/terms.html';

/** Liens vers la politique de confidentialité et les conditions d'utilisation. */
export default function LegalLinks({ sx }) {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', ...sx }}>
      <Link
        href={PRIVACY_URL}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
      >
        <Typography variant="caption">
          {t('legal.privacy', { defaultValue: 'Politique de confidentialité' })}
        </Typography>
      </Link>
      <Link
        href={TERMS_URL}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
      >
        <Typography variant="caption">
          {t('legal.terms', { defaultValue: 'Conditions d\'utilisation' })}
        </Typography>
      </Link>
    </Box>
  );
}
