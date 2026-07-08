import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CreditCard, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import * as orderService from '../services/order.service';
import * as paymentService from '../services/payment.service';

const CheckoutPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState(user?.addresses.find((a) => a.isDefault)?._id ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const deliveryFee = 30;
  const taxes = Math.round(totalAmount * 0.05 * 100) / 100;
  const grandTotal = totalAmount + deliveryFee + taxes;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { setError('Please select a delivery address'); return; }
    setLoading(true);
    setError('');
    try {
      const idempotencyKey = `${user?.id ?? ''}-${Date.now()}`;
      const orderRes = await orderService.placeOrder({ deliveryAddressId: selectedAddress, idempotencyKey });
      const orderId = orderRes.data.data?._id;
      if (!orderId) throw new Error('Order creation failed');

      const payRes = await paymentService.initiatePayment({ orderId, idempotencyKey: `pay-${idempotencyKey}` });
      const { txnToken } = payRes.data.data ?? {};

      // In production: load Paytm JS Checkout script with txnToken here
      // For now navigate to tracking after order creation
      void txnToken;
      clearCart();
      navigate(`/orders/${orderId}/track`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(msg ?? t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('checkout.title')}</h1>
      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

      <div className="space-y-6">
        {/* Address */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
            <MapPin size={18} className="text-primary" /> {t('checkout.select_address')}
          </h2>
          {user?.addresses.length === 0 ? (
            <p className="text-gray-500 text-sm">{t('checkout.add_address')}</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {user?.addresses.map((addr) => (
                <label key={addr._id} className="relative">
                  <input
                    type="radio"
                    name="address"
                    value={addr._id}
                    checked={selectedAddress === addr._id}
                    onChange={() => setSelectedAddress(addr._id)}
                    className="sr-only peer"
                  />
                  <div className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer peer-checked:border-primary peer-checked:bg-primary-light transition-colors h-full">
                    <p className="font-medium text-gray-900">{addr.label}</p>
                    <p className="text-sm text-gray-500 mt-1">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
            <CreditCard size={18} className="text-primary" /> {t('checkout.order_summary')}
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            {items.map((item) => (
              <div key={item.menuItemId} className="flex justify-between">
                <span>{item.name} × {item.quantity}</span>
                <span>{t('common.currency')}{item.subtotal}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 space-y-1">
              <div className="flex justify-between"><span>{t('cart.delivery_fee')}</span><span>{t('common.currency')}{deliveryFee}</span></div>
              <div className="flex justify-between"><span>{t('cart.taxes')}</span><span>{t('common.currency')}{taxes}</span></div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t">
                <span>{t('cart.total')}</span><span>{t('common.currency')}{grandTotal}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => void handlePlaceOrder()}
          disabled={loading}
          className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold text-lg rounded-xl transition-colors disabled:opacity-60"
        >
          {loading ? t('common.loading') : `${t('checkout.pay_now')} ${t('common.currency')}${grandTotal}`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
