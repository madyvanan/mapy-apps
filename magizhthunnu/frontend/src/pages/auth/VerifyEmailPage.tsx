import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Mail, XCircle } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import * as authService from '../../services/auth.service';

const VerifyEmailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { magicParam } = useParams<{ magicParam: string }>();

  const [status, setStatus] = useState<'loading' | 'success' | 'fail'>('loading');

  const token = magicParam?.startsWith('isValid=') ? magicParam.slice('isValid='.length) : null;

  useEffect(() => {
    if (!token) return;
    authService
      .verifyEmail(token)
      .then((res) => {
        setStatus(res.data.data?.verified ? 'success' : 'fail');
      })
      .catch(() => setStatus('fail'));
  }, [token]);

  useEffect(() => {
    if (status !== 'success') return;
    const timer = setTimeout(() => navigate('/auth/login'), 3000);
    return () => clearTimeout(timer);
  }, [status, navigate]);

  if (!token) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <Mail size={36} className="mx-auto mb-4 text-primary" />

          {status === 'loading' && (
            <div className="py-4">
              <Spinner size="md" />
            </div>
          )}

          {status !== 'loading' && (
            <label className="relative block mb-2">
              <input type="checkbox" checked={status === 'success'} readOnly className="sr-only peer" />
              <div
                className={`border-2 rounded-xl p-4 flex items-center justify-center gap-2 font-medium ${
                  status === 'success'
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-red-200 bg-red-50 text-red-600'
                }`}
              >
                {status === 'success' ? (
                  <>
                    <CheckCircle2 size={18} /> {t('auth.email_verified')}
                  </>
                ) : (
                  <>
                    <XCircle size={18} /> {t('auth.email_verify_failed')}
                  </>
                )}
              </div>
            </label>
          )}

          {status === 'success' && <p className="text-gray-400 text-xs">{t('auth.redirecting')}</p>}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;