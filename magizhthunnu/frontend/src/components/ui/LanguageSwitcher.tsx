import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';

  const toggle = () => {
    void i18n.changeLanguage(isTamil ? 'en' : 'ta');
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
      title={isTamil ? 'Switch to English' : 'தமிழில் காண்க'}
    >
      <Languages size={16} /> {isTamil ? 'English' : 'தமிழ்'}
    </button>
  );
};

export default LanguageSwitcher;
