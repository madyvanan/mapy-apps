import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const RestaurantDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('dashboard.title')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: t('dashboard.today_orders'), value: '0', icon: '📦' },
          { label: t('dashboard.revenue'), value: '₹0', icon: '💰' },
          { label: t('admin.active_users'), value: '0', icon: '👥' },
          { label: t('restaurant.ratings'), value: '0.0', icon: '⭐' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <Link to="/dashboard/menu" className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark">
          {t('dashboard.menu')}
        </Link>
        <Link to="/dashboard/orders" className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
          {t('today')}
        </Link>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
