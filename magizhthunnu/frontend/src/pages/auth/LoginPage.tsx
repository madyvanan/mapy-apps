import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    setLoading(true);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
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
          <h2 className="text-xl font-semibold text-gray-800 mt-4">{t('auth.login_title')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('auth.login_subtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-5">
            {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{t('errors.invalid_email')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('password')}
                  type="password"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{t('errors.required')}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
            >
              {loading ? t('common.loading') : t('auth.login')}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            {t('auth.no_account')}{' '}
            <Link to="/auth/register" className="text-primary font-medium hover:underline">{t('auth.register')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
