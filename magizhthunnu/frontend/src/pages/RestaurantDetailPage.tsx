import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Clock, Heart, ShoppingBag, Star } from 'lucide-react';
import type { Restaurant, MenuItem } from '../types';
import { useCart } from '../context/CartContext';
import Spinner from '../components/ui/Spinner';
import MenuItemCard from '../components/restaurant/MenuItemCard';
import * as restaurantService from '../services/restaurant.service';

const RestaurantDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { restaurantId: cartRestaurantId, itemCount, totalAmount } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<Record<string, MenuItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!id) return;
    restaurantService.getRestaurantById(id)
      .then((res) => {
        if (res.data.data) {
          setRestaurant(res.data.data.restaurant);
          setMenu(res.data.data.menu);
          const cats = Object.keys(res.data.data.menu);
          if (cats[0]) setActiveCategory(cats[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!restaurant) return <div className="text-center py-24 text-gray-500">{t('common.error')}</div>;

  const categories = Object.keys(menu);
  const cartBelongsHere = cartRestaurantId === restaurant._id && itemCount > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden h-56 mb-6 bg-gray-200">
        {restaurant.coverImage && <img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover" />}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-gray-800 hover:bg-white transition-colors"
          aria-label={t('common.back')}
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={() => setIsFavorite((v) => !v)}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-primary hover:bg-white transition-colors"
          aria-label="favorite"
        >
          <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
        </button>
        <div className="absolute inset-0 bg-black/40 flex items-end p-6">
          <div className="text-white">
            <h1 className="text-3xl font-extrabold">{restaurant.name}</h1>
            <p className="text-gray-300 text-sm mt-1">{restaurant.cuisineTypes.join(', ')}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1">
                <Star size={14} className="fill-current" /> {restaurant.rating.toFixed(1)} ({restaurant.totalRatings} {t('restaurant.ratings')})
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} /> {restaurant.avgDeliveryTime} {t('restaurant.delivery_time')}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {restaurant.isOpen ? t('restaurant.open') : t('restaurant.closed')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category tabs (mobile: horizontal scroll, desktop: sidebar) */}
      <div className="md:hidden sticky top-16 z-30 -mx-4 px-4 py-2 bg-gray-50/95 backdrop-blur border-b border-gray-100 flex gap-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex gap-8 mt-6 md:mt-0">
        {/* Category sidebar */}
        <div className="hidden md:block w-44 shrink-0">
          <div className="sticky top-20 space-y-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === cat ? 'bg-primary-light text-primary' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu items */}
        <div className="flex-1 space-y-8">
          {categories.map((cat) => (
            <section key={cat} id={`cat-${cat}`}>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">{cat}</h2>
              <div className="space-y-3">
                {menu[cat]?.map((item) => (
                  <MenuItemCard key={item._id} item={item} restaurantId={restaurant._id} restaurantIsOpen={restaurant.isOpen} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Sticky view-cart bar */}
      {cartBelongsHere && (
        <button
          onClick={() => navigate('/cart')}
          className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md flex items-center justify-between gap-3 px-5 py-3.5 bg-primary text-white rounded-2xl shadow-lg hover:bg-primary-dark transition-colors z-40"
        >
          <span className="flex items-center gap-2 font-semibold text-sm">
            <ShoppingBag size={18} /> {itemCount} {t('cart.title')}
          </span>
          <span className="font-bold">{t('common.currency')}{totalAmount}</span>
        </button>
      )}
    </div>
  );
};

export default RestaurantDetailPage;