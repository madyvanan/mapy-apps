import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.title')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: t('admin.total_revenue'), value: '₹0', icon: '💰' },
          { label: t('admin.total_orders'), value: '0', icon: '📦' },
          { label: t('admin.active_users'), value: '0', icon: '👥' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <Link to="/admin/analytics" className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium">{t('admin.analytics')}</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
