import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, LogIn, ShoppingCart, User, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs font-medium transition-colors ${
    isActive ? 'text-primary' : 'text-gray-500'
  }`;

const MobileBottomNav = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 flex items-stretch shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <NavLink to="/" end className={linkClasses}>
        <Home size={20} />
        {t('nav.home')}
      </NavLink>
      <NavLink to="/restaurants" className={linkClasses}>
        <UtensilsCrossed size={20} />
        {t('nav.restaurants')}
      </NavLink>
      {isAuthenticated && (
        <NavLink to="/cart" className={linkClasses}>
          <span className="relative">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </span>
          {t('nav.cart')}
        </NavLink>
      )}
      <NavLink to={isAuthenticated ? '/profile' : '/auth/login'} className={linkClasses}>
        {isAuthenticated ? <User size={20} /> : <LogIn size={20} />}
        {isAuthenticated ? t('nav.profile') : t('nav.login')}
      </NavLink>
    </nav>
  );
};

export default MobileBottomNav;