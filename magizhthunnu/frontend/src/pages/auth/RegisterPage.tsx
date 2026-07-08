import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Lock, type LucideIcon, Mail, Phone, Store, User, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROLE_ICONS: Record<'customer' | 'restaurant', LucideIcon> = {
  customer: UtensilsCrossed,
  restaurant: Store,
};

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  mobile: z.string().regex(/^\d{10}$/),
  role: z.enum(['customer', 'restaurant']),
});
type FormData = z.infer<typeof schema>;

const RegisterPage = () => {
  const { t } = useTranslation();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'customer' },
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    setLoading(true);
    try {
      const result = await registerUser(data);
      if (result.mailVerificationRequired || result.mobileVerificationRequired) {
        navigate('/auth/verify-mobile', { state: { userId: result.id } });
      } else {
        navigate('/auth/login');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(msg ?? t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Magizh<span className="text-primary">thunnu</span></h1>
          <h2 className="text-xl font-semibold text-gray-800 mt-4">{t('auth.register_title')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('auth.register_subtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-5">
            {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.name')}</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('name')}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{t('errors.required')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{t('errors.invalid_email')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.mobile')}</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('mobile')}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{t('errors.invalid_mobile')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('password')}
                  type="password"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{t('errors.password_min')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.role')}</label>
              <div className="grid grid-cols-2 gap-3">
                {(['customer', 'restaurant'] as const).map((r) => {
                  const RoleIcon = ROLE_ICONS[r];
                  return (
                    <label key={r} className="relative">
                      <input {...register('role')} type="radio" value={r} className="sr-only peer" />
                      <div className="border-2 border-gray-200 rounded-xl p-3 text-center cursor-pointer peer-checked:border-primary peer-checked:bg-primary-light transition-colors">
                        <RoleIcon size={24} className="mx-auto mb-1 text-gray-500" />
                        <div className="text-sm font-medium text-gray-700">{t(`auth.role_${r}`)}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
            >
              {loading ? t('common.loading') : t('auth.register')}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            {t('auth.has_account')}{' '}
            <Link to="/auth/login" className="text-primary font-medium hover:underline">{t('auth.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
