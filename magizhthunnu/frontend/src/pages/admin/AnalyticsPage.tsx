import { useTranslation } from 'react-i18next';

const AnalyticsPage = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.analytics')}</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
        Analytics charts coming soon
      </div>
    </div>
  );
};

export default AnalyticsPage;
