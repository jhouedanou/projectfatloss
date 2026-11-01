import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('pfl_lang', lng);
  };

  return (
    <div className="language-selector">
      <div className="language-title">{t('language.select')}</div>
      <div className="language-buttons">
        <button 
          className={`language-btn ${i18n.language === 'fr' ? 'active' : ''}`} 
          onClick={() => changeLanguage('fr')}
        >
          <span className="language-flag">🇫🇷</span>
          <span className="language-name">{t('language.fr')}</span>
        </button>
        <button 
          className={`language-btn ${i18n.language === 'en' ? 'active' : ''}`} 
          onClick={() => changeLanguage('en')}
        >
          <span className="language-flag">🇬🇧</span>
          <span className="language-name">{t('language.en')}</span>
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector;
