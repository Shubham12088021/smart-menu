import DarkModeToggle from './DarkModeToggle';
import { Bell, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { restaurantService } from '../services/restaurant';

export default function Navbar({ isDark, toggleDark }) {
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    restaurantService.get().then(setRestaurant).catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="flex items-center justify-between px-4 lg:px-8 py-3">
        <div className="lg:hidden w-10" /> {/* spacer for mobile menu button */}

        <div className="hidden lg:block">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {restaurant?.name || 'My Restaurant'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {restaurant?.slug && (
            <Link
              to={`/menu/${restaurant.slug}`}
              target="_blank"
              className="btn-ghost text-sm hidden sm:inline-flex"
            >
              <ExternalLink className="w-4 h-4" />
              View Menu
            </Link>
          )}
          <button className="relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <DarkModeToggle isDark={isDark} toggle={toggleDark} />
        </div>
      </div>
    </header>
  );
}
