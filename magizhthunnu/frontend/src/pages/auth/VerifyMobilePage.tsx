import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import * as authService from '../../services/auth.service';

const VerifyMobilePage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const userId = (location.state as { userId?: string } | null)?.userId;

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  if (!userId) return <Navigate to="/auth/register" replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.verifyMobileOtp(userId, otp);
      setVerified(true);
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <ShieldCheck size={36} className="mx-auto mb-4 text-primary" />
          <h1 className="text-xl font-semibold text-gray-800 mb-2">{t('auth.verify_mobile_title')}</h1>
          <p className="text-gray-500 text-sm mb-6">{t('auth.verify_mobile_subtitle')}</p>

          {verified ? (
            <>
              <label className="relative block mb-6">
                <input type="checkbox" checked readOnly className="sr-only peer" />
                <div className="border-2 border-primary bg-primary-light rounded-xl p-4 flex items-center justify-center gap-2 text-primary font-medium">
                  <CheckCircle2 size={18} /> {t('auth.mobile_verified')}
                </div>
              </label>
              <Link to="/auth/login" className="text-primary font-medium hover:underline text-sm">
                {t('auth.login')}
              </Link>
            </>
          ) : (
            <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
              {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder={t('auth.otp_placeholder')}
                className="w-full text-center tracking-[0.5em] text-lg py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
              >
                {loading ? t('common.loading') : t('auth.verify_otp')}
              </button>
              <p className="text-xs text-gray-400">{t('auth.email_link_note')}</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyMobilePage;