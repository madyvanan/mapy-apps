import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Search } from 'lucide-react';
import type { Restaurant } from '../types';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import Spinner from '../components/ui/Spinner';
import * as restaurantService from '../services/restaurant.service';
import { CUISINES } from '../constants/cuisines';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restaurantService.listRestaurants({ isOpen: 'true' })
      .then((res) => setRestaurants(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/restaurants?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold leading-tight mb-4">
            {t('home.hero_title')}{' '}
            <span className="text-primary">{t('home.hero_title_2')}</span>
          </h1>
          <p className="text-lg text-gray-300 mb-8">{t('home.hero_subtitle')}</p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('home.search_placeholder')}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors"
            >
              {t('home.search_button')}
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('home.categories_title')}</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 md:grid-cols-7">
          {CUISINES.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => navigate(`/restaurants?cuisine=${encodeURIComponent(label)}`)}
              className="flex flex-col items-center gap-2 shrink-0 w-20 sm:w-auto group"
            >
              <span className="w-16 h-16 rounded-2xl bg-primary-light text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Icon size={26} />
              </span>
              <span className="text-xs font-medium text-gray-700 text-center">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured restaurants */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('home.featured_title')}</h2>
          <button
            onClick={() => navigate('/restaurants')}
            className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
          >
            {t('home.see_all')} <ArrowRight size={14} />
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {restaurants.slice(0, 8).map((r) => <RestaurantCard key={r._id} restaurant={r} />)}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
