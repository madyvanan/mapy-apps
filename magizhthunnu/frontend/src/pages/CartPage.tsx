import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { t } = useTranslation();
  const { items, totalAmount, removeItem, updateQty, clearCart } = useCart();
  const navigate = useNavigate();

  const deliveryFee = 30;
  const taxes = Math.round(totalAmount * 0.05 * 100) / 100;
  const grandTotal = totalAmount + deliveryFee + taxes;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingCart size={56} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('cart.empty')}</h2>
        <p className="text-gray-500 mb-6">{t('cart.empty_subtitle')}</p>
        <Link to="/restaurants" className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark">
          {t('cart.browse')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('cart.title')}</h1>
        <button onClick={clearCart} className="flex items-center gap-1 text-sm text-red-500 hover:underline">
          <Trash2 size={14} /> {t('common.delete')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.menuItemId} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{item.name}</p>
                <p className="text-primary font-medium text-sm">{t('common.currency')}{item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(item.menuItemId, item.quantity - 1)}
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQty(item.menuItemId, item.quantity + 1)}
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{t('common.currency')}{item.subtotal}</p>
                <button
                  onClick={() => removeItem(item.menuItemId)}
                  className="text-xs text-red-400 hover:text-red-600 mt-1"
                >
                  {t('cart.remove')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20">
            <h2 className="font-bold text-gray-900 mb-4">{t('checkout.order_summary')}</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between"><span>{t('cart.subtotal')}</span><span>{t('common.currency')}{totalAmount}</span></div>
              <div className="flex justify-between"><span>{t('cart.delivery_fee')}</span><span>{t('common.currency')}{deliveryFee}</span></div>
              <div className="flex justify-between"><span>{t('cart.taxes')}</span><span>{t('common.currency')}{taxes}</span></div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-3 border-t mt-3">
                <span>{t('cart.total')}</span><span>{t('common.currency')}{grandTotal}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full mt-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors"
            >
              {t('cart.checkout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
