import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en/translation.json';
import ta from './locales/ta/translation.json';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ta: { translation: ta },
    },
    fallbackLng: 'en',
    defaultNS: 'translation',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'magizhthunnu-lang',
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
