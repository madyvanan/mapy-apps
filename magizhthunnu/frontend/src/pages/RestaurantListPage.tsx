import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SearchX } from 'lucide-react';
import type { Restaurant } from '../types';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import Spinner from '../components/ui/Spinner';
import * as restaurantService from '../services/restaurant.service';
import { CUISINES } from '../constants/cuisines';

const RestaurantListPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [cuisine, setCuisine] = useState(searchParams.get('cuisine') ?? '');
  const [openOnly, setOpenOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    const q = searchParams.get('q');
    const fetch = q
      ? restaurantService.searchRestaurants(q)
      : restaurantService.listRestaurants({
          ...(cuisine && { cuisine }),
          ...(openOnly && { isOpen: 'true' }),
        });

    fetch
      .then((res) => setRestaurants(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams, cuisine, openOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('nav.restaurants')}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => setOpenOnly(!openOnly)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            openOnly ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary'
          }`}
        >
          {t('restaurant.open')}
        </button>
        {CUISINES.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => setCuisine(cuisine === label ? '' : label)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              cuisine === label ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : restaurants.length === 0 ? (
        <div className="flex flex-col items-center gap-3 text-gray-500 py-20">
          <SearchX size={40} className="text-gray-300" />
          <p>{t('common.no_results')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {restaurants.map((r) => <RestaurantCard key={r._id} restaurant={r} />)}
        </div>
      )}
    </div>
  );
};

export default RestaurantListPage;
