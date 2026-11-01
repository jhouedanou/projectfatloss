import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en.json';
import translationFR from './locales/fr.json';

const resources = {
  en: {
    translation: translationEN
  },
  fr: {
    translation: translationFR
  }
};

i18n
  // Français par défaut : tout le contenu (programme, conseils) est en français.
  // Seul un choix fait dans le sélecteur de langue (clé pfl_lang) change la
  // langue ; la langue du navigateur (anglaise sur le Quest) est ignorée.
  .use(LanguageDetector)
  // Intégration avec React
  .use(initReactI18next)
  // Configuration
  .init({
    resources,
    fallbackLng: 'fr',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false // React s'occupe de l'échappement
    },
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'pfl_lang',
      caches: []
    }
  });

export default i18n;
