import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { i18n } = useTranslation();
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-lg font-bold text-white mb-1">
          Magizh<span className="text-primary">thunnu</span>
        </p>
        <p className="text-sm">
          {i18n.language === 'ta'
            ? 'சுவையான உணவு, விரைவான டெலிவரி'
            : 'Delicious Food, Fast Delivery'}
        </p>
        <p className="text-xs mt-4">© {new Date().getFullYear()} Magizhthunnu. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
