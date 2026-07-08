import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bike, Check, ChefHat, Clock, type LucideIcon, PackageCheck, PartyPopper, XCircle } from 'lucide-react';
import type { Order, OrderStatus } from '../types';
import { useOrderSocket } from '../hooks/useSocket';
import * as orderService from '../services/order.service';
import Spinner from '../components/ui/Spinner';

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

const STEP_ICONS: Record<OrderStatus, LucideIcon> = {
  pending: Clock,
  confirmed: Check,
  preparing: ChefHat,
  out_for_delivery: Bike,
  delivered: PackageCheck,
  cancelled: XCircle,
};

const OrderTrackingPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    orderService.getOrderById(id)
      .then((res) => { if (res.data.data) setOrder(res.data.data); })
      .finally(() => setLoading(false));
  }, [id]);

  const onUpdate = useCallback((event: { orderId: string; status: OrderStatus }) => {
    setOrder((prev) => prev ? { ...prev, status: event.status } : prev);
  }, []);

  useOrderSocket(id ?? null, onUpdate);

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!order) return <div className="text-center py-24 text-gray-500">{t('common.error')}</div>;

  const currentStep = STATUS_STEPS.indexOf(order.status);

  const statusKey = {
    pending: 'order.status_pending',
    confirmed: 'order.status_confirmed',
    preparing: 'order.status_preparing',
    out_for_delivery: 'order.status_out_for_delivery',
    delivered: 'order.status_delivered',
    cancelled: 'order.status_cancelled',
  }[order.status] as string;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('order.track')}</h1>
      <p className="text-gray-500 text-sm mb-8">{t('order.order_id', { id: order._id.slice(-8).toUpperCase() })}</p>

      {/* Status stepper */}
      <div className="relative mb-10">
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 z-0" />
        <div className="flex justify-between relative z-10">
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStep;
            const StepIcon = idx < currentStep ? Check : STEP_ICONS[step];
            return (
              <div key={step} className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <StepIcon size={18} />
                </div>
                <span className={`text-xs font-medium text-center max-w-16 ${isCompleted ? 'text-primary' : 'text-gray-400'}`}>
                  {t(`order.status_${step}` as never)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="text-center py-4">
          <div className="flex justify-center mb-3 text-primary">
            {order.status === 'delivered' ? (
              <PartyPopper size={44} />
            ) : order.status === 'cancelled' ? (
              <XCircle size={44} className="text-red-500" />
            ) : (
              <ChefHat size={44} />
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t(statusKey)}</h2>
          {order.estimatedDelivery && order.status !== 'delivered' && (
            <p className="text-gray-500 text-sm mt-1">
              {t('order.estimated_delivery')}: {new Date(order.estimatedDelivery).toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="border-t pt-4 mt-4 text-sm text-gray-600">
          <div className="flex justify-between mb-1"><span>{t('cart.subtotal')}</span><span>₹{order.subtotal}</span></div>
          <div className="flex justify-between mb-1"><span>{t('cart.delivery_fee')}</span><span>₹{order.deliveryFee}</span></div>
          <div className="flex justify-between mb-1"><span>{t('cart.taxes')}</span><span>₹{order.taxes}</span></div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t mt-2">
            <span>{t('cart.total')}</span><span>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
