import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bike, CheckCircle2, ChefHat, Clock, Package, XCircle, type LucideIcon } from 'lucide-react';
import type { Order, OrderStatus } from '../types';
import Spinner from '../components/ui/Spinner';
import * as orderService from '../services/order.service';

const statusIcons: Record<OrderStatus, LucideIcon> = {
  pending: Clock,
  confirmed: CheckCircle2,
  preparing: ChefHat,
  out_for_delivery: Bike,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

const OrderHistoryPage = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getMyOrders()
      .then((res) => setOrders(res.data.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Package size={56} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('order.no_orders')}</h2>
        <p className="text-gray-500 mb-6">{t('order.no_orders_subtitle')}</p>
        <Link to="/restaurants" className="px-6 py-3 bg-primary text-white rounded-xl font-medium">
          {t('cart.browse')}
        </Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    preparing: 'bg-orange-100 text-orange-700',
    out_for_delivery: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('order.title')}</h1>
      <div className="space-y-4">
        {orders.map((order) => {
          const StatusIcon = statusIcons[order.status];
          return (
          <div key={order._id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-mono text-gray-500">#{order._id.slice(-8).toUpperCase()}</span>
              <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status] ?? ''}`}>
                <StatusIcon size={12} /> {t(`order.status_${order.status}` as never)}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-3">
              {order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900">₹{order.totalAmount}</span>
              <div className="flex gap-2">
                {['confirmed', 'preparing', 'out_for_delivery'].includes(order.status) && (
                  <Link
                    to={`/orders/${order._id}/track`}
                    className="px-3 py-1.5 text-xs bg-primary-light text-primary rounded-lg font-medium"
                  >
                    {t('order.track')}
                  </Link>
                )}
                <span className="text-xs text-gray-400 self-center">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
