import { useTranslation } from 'react-i18next';

const MenuManagement = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.menu')}</h1>
        <button className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark">
          + {t('dashboard.add_item')}
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
        {t('restaurant.no_items')}
      </div>
    </div>
  );
};

export default MenuManagement;
