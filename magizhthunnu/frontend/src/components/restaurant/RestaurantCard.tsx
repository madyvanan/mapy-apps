import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bike, Clock, Star, UtensilsCrossed } from 'lucide-react';
import type { Restaurant } from '../../types';

const RestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => {
  const { t } = useTranslation();

  return (
    <Link
      to={`/restaurants/${restaurant._id}`}
      className="group block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="relative h-44 bg-gray-100">
        {restaurant.coverImage ? (
          <img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <UtensilsCrossed size={40} />
          </div>
        )}
        <span
          className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold ${
            restaurant.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {restaurant.isOpen ? t('restaurant.open') : t('restaurant.closed')}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
              {restaurant.name}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{restaurant.cuisineTypes.join(', ')}</p>
          </div>
          <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded text-sm font-semibold shrink-0">
            <Star size={14} className="fill-current" /> {restaurant.rating.toFixed(1)}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock size={14} /> {restaurant.avgDeliveryTime} {t('restaurant.delivery_time')}
          </span>
          <span className="flex items-center gap-1">
            <Bike size={14} />
            {restaurant.deliveryFee === 0
              ? t('restaurant.free_delivery')
              : `${t('common.currency')}${restaurant.deliveryFee} ${t('restaurant.delivery_fee')}`}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">{t('restaurant.min_order')}: {t('common.currency')}{restaurant.minOrder}</p>
      </div>
    </Link>
  );
};

export default RestaurantCard;