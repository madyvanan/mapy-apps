import { useTranslation } from 'react-i18next';
import { MapPin, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.title')}</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
            {user.name[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded-full font-medium capitalize">
              {user.role}
            </span>
          </div>
        </div>

        <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
          <User size={16} className="text-primary" /> {t('profile.personal_info')}
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{t('auth.name')}</p>
            <p className="font-medium text-gray-900">{user.name}</p>
          </div>
          <div>
            <p className="text-gray-500">{t('auth.email')}</p>
            <p className="font-medium text-gray-900">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
          <MapPin size={16} className="text-primary" /> {t('profile.addresses')}
        </h3>
        {user.addresses.length === 0 ? (
          <p className="text-gray-500 text-sm">{t('profile.add_address')}</p>
        ) : (
          <div className="space-y-3">
            {user.addresses.map((addr) => (
              <div key={addr._id} className="p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{t('profile.default')}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
