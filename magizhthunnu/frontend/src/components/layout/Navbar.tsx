import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import LanguageSwitcher from '../ui/LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-gray-900">
              Magizh<span className="text-primary">thunnu</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/restaurants" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              {t('nav.restaurants')}
            </Link>
            {isAuthenticated && (
              <Link to="/orders" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                {t('nav.orders')}
              </Link>
            )}
            {user?.role === 'restaurant' && (
              <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                {t('nav.dashboard')}
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                {t('nav.admin')}
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {isAuthenticated && (
              <Link
                to="/cart"
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-light text-primary font-medium text-sm hover:bg-orange-100 transition-colors"
              >
                <ShoppingCart size={16} /> {t('nav.cart')}
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold"
                  title={user?.name}
                >
                  {user?.name[0]?.toUpperCase()}
                </Link>
                <button
                  onClick={() => void handleLogout()}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  <LogOut size={14} /> {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
