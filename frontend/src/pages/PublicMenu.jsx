import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBag, MapPin, Phone, Clock, Mail } from 'lucide-react';
import { menuService } from '../services/menu';
import CustomerMenuItem from '../components/CustomerMenuItem';
import SearchFilter from '../components/SearchFilter';
import CartDrawer from '../components/CartDrawer';
import LoadingSpinner from '../components/LoadingSpinner';
import { useDarkMode } from '../hooks/useDarkMode';
import DarkModeToggle from '../components/DarkModeToggle';

export default function PublicMenu() {
  const { slug } = useParams();
  const { isDark, toggle } = useDarkMode();
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    menuService.getPublicMenu(slug)
      .then(setMenuData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // Filter and search items
  const filteredCategories = useMemo(() => {
    if (!menuData) return [];
    return menuData.categories.map(cat => ({
      ...cat,
      items: cat.items.filter(item => {
        // Search
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (!item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
            return false;
          }
        }
        // Filters
        if (filters.is_veg === true && !item.is_veg) return false;
        if (filters.is_veg === false && item.is_veg) return false;
        if (filters.is_spicy && !item.is_spicy) return false;
        if (filters.is_bestseller && !item.is_bestseller) return false;
        return true;
      }),
    })).filter(cat => cat.items.length > 0);
  }, [menuData, searchQuery, filters]);

  // Cart operations
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== item.id);
    });
  };

  const getCartQuantity = (itemId) => {
    const item = cart.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleFilter = (key, value) => {
    if (key === 'clear') {
      setFilters({});
      return;
    }
    setFilters(prev => {
      if (prev[key] === value) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <LoadingSpinner text="Loading menu..." />
    </div>
  );

  if (error || !menuData) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <p className="text-6xl mb-4">🍽️</p>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Menu Not Found</h2>
        <p className="text-gray-500">This restaurant menu doesn't exist.</p>
      </div>
    </div>
  );

  const { restaurant } = menuData;
  const templateClass = `template-${restaurant.template || 'modern'}`;

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-gray-950 ${templateClass}`}
      style={{ fontFamily: `'${restaurant.font_family || 'Inter'}', sans-serif` }}
    >
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {restaurant.logo && (
              <img src={restaurant.logo} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
            )}
            <div className="min-w-0">
              <h1 className="font-bold text-gray-900 dark:text-white text-sm truncate">{restaurant.name}</h1>
              {restaurant.tagline && (
                <p className="text-[10px] text-gray-500 truncate">{restaurant.tagline}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <DarkModeToggle isDark={isDark} toggle={toggle} />
            <button
              onClick={() => setCartOpen(true)}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Restaurant Info */}
      <div className="max-w-lg mx-auto px-4 pt-4 pb-2">
        {restaurant.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{restaurant.description}</p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
          {restaurant.address && (
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {restaurant.address}</span>
          )}
          {restaurant.phone && (
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {restaurant.phone}</span>
          )}
          {restaurant.opening_hours && (
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {restaurant.opening_hours}</span>
          )}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="max-w-lg mx-auto px-4 mb-4">
        <SearchFilter
          onSearch={setSearchQuery}
          onFilter={handleFilter}
          activeFilters={filters}
        />
      </div>

      {/* Category Tabs */}
      <div className="max-w-lg mx-auto px-4 mb-4 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              !activeCategory
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            All
          </button>
          {menuData.categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-lg mx-auto px-4 pb-24">
        {filteredCategories
          .filter(cat => !activeCategory || cat.id === activeCategory)
          .map(cat => (
          <div key={cat.id} className="mb-6">
            <h2 className="menu-category-title">{cat.name}</h2>
            {cat.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 -mt-2">{cat.description}</p>
            )}
            <div className="space-y-3">
              {cat.items.map(item => (
                <CustomerMenuItem
                  key={item.id}
                  item={item}
                  quantity={getCartQuantity(item.id)}
                  onAdd={addToCart}
                  onRemove={removeFromCart}
                  layout={restaurant.layout_style || 'comfortable'}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500">No items match your search</p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-20">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full py-3.5 rounded-2xl bg-primary-500 text-white font-semibold shadow-xl shadow-primary-500/30 flex items-center justify-center gap-3 hover:bg-primary-600 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            View Cart ({cartItemCount} items)
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onClear={() => setCart([])}
        restaurantSlug={slug}
      />
    </div>
  );
}
