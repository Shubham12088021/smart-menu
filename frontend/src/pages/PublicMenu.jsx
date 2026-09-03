import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight,
  Utensils
} from 'lucide-react';
import { menuService } from '../services/menu';
import { formatPrice } from '../utils/constants';
import CustomerMenuItem from '../components/CustomerMenuItem';
import SearchFilter from '../components/SearchFilter';
import CartDrawer from '../components/CartDrawer';
import LoadingSpinner from '../components/LoadingSpinner';
import { useDarkMode } from '../hooks/useDarkMode';
import DarkModeToggle from '../components/DarkModeToggle';
import Image3D from '../components/Image3D';

// Category icon map for visual flair
const getCategoryIcon = (name = '') => {
  const lower = name.toLowerCase();
  if (lower.includes('starter') || lower.includes('appetizer')) return '🥗';
  if (lower.includes('main') || lower.includes('curry') || lower.includes('gravy')) return '🍲';
  if (lower.includes('bread') || lower.includes('roti') || lower.includes('naan') || lower.includes('rice')) return '🫓';
  if (lower.includes('dessert') || lower.includes('sweet') || lower.includes('ice')) return '🍨';
  if (lower.includes('beverage') || lower.includes('drink') || lower.includes('chai') || lower.includes('coffee')) return '🍹';
  if (lower.includes('pizza') || lower.includes('burger') || lower.includes('fast')) return '🍕';
  return '🍽️';
};

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
    if (!menuData?.categories) return [];
    return menuData.categories.map(cat => ({
      ...cat,
      items: (cat.items || []).filter(item => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (!item.name.toLowerCase().includes(q) && !item.description?.toLowerCase().includes(q)) {
            return false;
          }
        }
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
  const cartTotalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
      <LoadingSpinner text="Loading delicious menu..." />
    </div>
  );

  if (error || !menuData) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="glass-card max-w-sm w-full p-8 text-center animate-scale-in">
        <p className="text-6xl mb-4">🍽️</p>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Menu Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">This restaurant menu does not exist or may have been updated.</p>
        <a href="/" className="btn-primary inline-flex">Go Home</a>
      </div>
    </div>
  );

  const { restaurant } = menuData;
  const templateClass = `template-${restaurant.template || 'modern'}`;

  return (
    <div
      className={`min-h-screen bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white ${templateClass}`}
      style={{ fontFamily: `'${restaurant.font_family || 'Inter'}', sans-serif` }}
    >
      {/* ── Top Navigation Bar ──────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl border-b border-gray-200/60 dark:border-gray-800/60 transition-colors">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {restaurant.logo ? (
              <div className="w-10 h-10 rounded-2xl flex-shrink-0 overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                <Image3D
                  src={restaurant.logo}
                  alt=""
                  className="rounded-2xl"
                  maxTilt={25}
                  scale={1.1}
                  speed={250}
                  perspective={500}
                  zoomable={false}
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-amber-600 flex items-center justify-center text-white font-black shadow-md shadow-primary-500/20">
                {restaurant.name?.charAt(0) || '🍽️'}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-gray-900 dark:text-white text-base truncate">
                  {restaurant.name}
                </h1>
                <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/20 flex-shrink-0" />
              </div>
              {restaurant.tagline && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  {restaurant.tagline}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DarkModeToggle isDark={isDark} toggle={toggle} />
            
            {/* Cart Trigger */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800/80 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 dark:hover:text-white text-gray-700 dark:text-gray-300 flex items-center justify-center transition-all shadow-xs"
              title="Open cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-white text-[11px] font-black flex items-center justify-center shadow-md animate-scale-in">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Cover & Info Card ──────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-2">
        <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-white via-white/95 to-orange-50/40 dark:from-gray-900 dark:via-gray-900/95 dark:to-orange-950/20 border border-gray-200/80 dark:border-gray-800/80 shadow-md">
          {/* Ambient light glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Restaurant Status & Rating Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Open Now • Dine-in & QR Order
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
              <Star className="w-3.5 h-3.5 fill-current" /> 4.9 (120+ reviews)
            </span>
          </div>

          {/* Description */}
          {restaurant.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              {restaurant.description}
            </p>
          )}

          {/* Location / Phone / Hours Chips */}
          <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800/80">
            {restaurant.address && (
              <span className="inline-flex items-center gap-1.5 bg-gray-100/80 dark:bg-gray-800/80 px-2.5 py-1 rounded-xl">
                <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" /> {restaurant.address}
              </span>
            )}
            {restaurant.phone && (
              <span className="inline-flex items-center gap-1.5 bg-gray-100/80 dark:bg-gray-800/80 px-2.5 py-1 rounded-xl">
                <Phone className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" /> {restaurant.phone}
              </span>
            )}
            {restaurant.opening_hours && (
              <span className="inline-flex items-center gap-1.5 bg-gray-100/80 dark:bg-gray-800/80 px-2.5 py-1 rounded-xl">
                <Clock className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" /> {restaurant.opening_hours}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Search & Filters Bar ────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 my-4">
        <SearchFilter
          onSearch={setSearchQuery}
          onFilter={handleFilter}
          activeFilters={filters}
        />
      </div>

      {/* ── Sticky Category Navigation Tabs ─────────────────── */}
      <div className="sticky top-[61px] z-30 bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur-xl border-y border-gray-200/50 dark:border-gray-800/50 py-2.5 shadow-xs transition-colors">
        <div className="max-w-2xl mx-auto px-4 overflow-x-auto hide-scrollbar flex items-center gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              !activeCategory
                ? 'bg-gradient-to-r from-primary-500 to-amber-600 text-white shadow-md shadow-primary-500/25 scale-[1.02]'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-primary-500/40'
            }`}
          >
            <span>✨</span>
            <span>All Items</span>
          </button>
          
          {menuData.categories.map(cat => {
            const isSelected = activeCategory === cat.id;
            const icon = getCategoryIcon(cat.name);
            const itemCount = cat.items?.length || 0;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-primary-500 to-amber-600 text-white shadow-md shadow-primary-500/25 scale-[1.02]'
                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-primary-500/40'
                }`}
              >
                <span>{icon}</span>
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>
                  {itemCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Category & Menu Items Grid ──────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 pt-4 pb-28">
        {filteredCategories
          .filter(cat => !activeCategory || cat.id === activeCategory)
          .map(cat => (
          <section key={cat.id} className="mb-8">
            {/* Category Header */}
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="text-xl p-2 rounded-2xl bg-primary-500/10 border border-primary-500/20">
                {getCategoryIcon(cat.name)}
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {cat.name}
                </h2>
                {cat.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {cat.description}
                  </p>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3.5">
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
          </section>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-16 glass-card p-8 rounded-3xl">
            <p className="text-5xl mb-3">🔍</p>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No items found</h3>
            <p className="text-xs text-gray-500">Try changing your search query or clear the filters.</p>
          </div>
        )}
      </main>

      {/* ── Floating Grand Cart Checkout Bar ────────────────── */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40 animate-slide-up">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-primary-500 via-primary-600 to-amber-600 text-white font-extrabold shadow-2xl shadow-primary-500/40 flex items-center justify-between hover:opacity-95 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-sm font-black">
                {cartItemCount}
              </span>
              <span className="text-sm tracking-wide">
                View Order
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base font-black">
                {formatPrice(cartTotalPrice)}
              </span>
              <ChevronRight className="w-4 h-4 text-white/80" />
            </div>
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
