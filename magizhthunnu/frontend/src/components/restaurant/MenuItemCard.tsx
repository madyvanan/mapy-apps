import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { MenuItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface MenuItemCardProps {
  item: MenuItem;
  restaurantId: string;
  restaurantIsOpen: boolean;
}

const MenuItemCard = ({ item, restaurantId, restaurantIsOpen }: MenuItemCardProps) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { items, addItem, updateQty } = useCart();

  const cartItem = items.find((i) => i.menuItemId === item._id);

  const handleAdd = () => {
    addItem(
      { menuItemId: item._id, name: item.name, price: item.price, quantity: 1, customizations: [], subtotal: item.price },
      restaurantId,
    );
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
            <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
          </span>
          <span className="font-semibold text-gray-900">{item.name}</span>
        </div>
        {item.description && <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>}
        <p className="text-primary font-bold mt-1">{t('common.currency')}{item.price}</p>
      </div>
      {item.image && (
        <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
      )}
      {isAuthenticated && (
        cartItem ? (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => updateQty(item._id, cartItem.quantity - 1)}
              className="w-7 h-7 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary-light transition-colors"
              aria-label={t('cart.remove')}
            >
              <Minus size={14} />
            </button>
            <span className="w-5 text-center font-semibold text-sm">{cartItem.quantity}</span>
            <button
              onClick={handleAdd}
              className="w-7 h-7 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary-light transition-colors"
              aria-label={t('cart.update')}
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            disabled={!restaurantIsOpen}
            className="flex items-center gap-1 px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 shrink-0"
          >
            <Plus size={14} /> {t('restaurant.add_to_cart')}
          </button>
        )
      )}
    </div>
  );
};

export default MenuItemCard;