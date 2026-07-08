import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Order } from '../../types';
import Spinner from '../../components/ui/Spinner';
import * as orderService from '../../services/order.service';

const OrderManagement = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restaurant orders — endpoint requires restaurantId query param
    setLoading(false);
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    await orderService.updateOrderStatus(orderId, status);
    setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: status as Order['status'] } : o));
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('dashboard.today_orders')}</h1>
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          {t('order.no_orders')}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-sm text-gray-500">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="font-bold text-gray-900 mt-1">₹{order.totalAmount}</p>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => void updateStatus(order._id, e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
                >
                  {['confirmed', 'preparing', 'out_for_delivery', 'delivered'].map((s) => (
                    <option key={s} value={s}>{t(`order.status_${s}` as never)}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
