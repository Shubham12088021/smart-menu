import { useState, useEffect } from 'react';
import { Save, Loader2, Eye } from 'lucide-react';
import { restaurantService } from '../services/restaurant';
import { menuService } from '../services/menu';
import TemplateSelector from '../components/TemplateSelector';
import LoadingSpinner from '../components/LoadingSpinner';
import { FONTS, LAYOUTS, formatPrice } from '../utils/constants';
import toast from 'react-hot-toast';

export default function DesignCustomizer() {
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([restaurantService.get(), menuService.getCategories()])
      .then(([r, c]) => { setRestaurant(r); setCategories(c); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, value) => {
    setRestaurant(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await restaurantService.update({
        template: restaurant.template,
        primary_color: restaurant.primary_color,
        accent_color: restaurant.accent_color,
        font_family: restaurant.font_family,
        layout_style: restaurant.layout_style,
      });
      toast.success('Design saved!');
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner text="Loading design..." />;
  if (!restaurant) return null;

  const templateClass = `template-${restaurant.template}`;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Design Customizer</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Customize your menu's appearance</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Design
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          {/* Template */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Template</h2>
            <TemplateSelector selected={restaurant.template} onSelect={(t) => handleChange('template', t)} />
          </div>

          {/* Typography */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Typography</h2>
            <div className="grid grid-cols-2 gap-3">
              {FONTS.map((font) => (
                <button
                  key={font.id}
                  onClick={() => handleChange('font_family', font.id)}
                  className={`p-3 rounded-xl text-left border-2 transition-all ${
                    restaurant.font_family === font.id
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900 dark:text-white text-sm" style={{ fontFamily: font.id }}>
                    {font.name}
                  </p>
                  <p className="text-xs text-gray-500">{font.style}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Layout</h2>
            <div className="space-y-2">
              {LAYOUTS.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => handleChange('layout_style', layout.id)}
                  className={`w-full p-3 rounded-xl text-left border-2 transition-all ${
                    restaurant.layout_style === layout.id
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{layout.name}</p>
                  <p className="text-xs text-gray-500">{layout.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Colors</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={restaurant.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                  />
                  <input
                    value={restaurant.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="input-label">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={restaurant.accent_color}
                    onChange={(e) => handleChange('accent_color', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                  />
                  <input
                    value={restaurant.accent_color}
                    onChange={(e) => handleChange('accent_color', e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="glass-card p-1 sticky top-24 self-start">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <Eye className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-500">Live Preview</span>
          </div>
          <div
            className={`p-6 max-h-[70vh] overflow-y-auto rounded-b-xl ${templateClass}`}
            style={{ fontFamily: restaurant.font_family }}
          >
            {/* Restaurant Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold" style={{ color: restaurant.primary_color }}>
                {restaurant.name}
              </h2>
              {restaurant.tagline && (
                <p className="text-sm text-gray-500 mt-1">{restaurant.tagline}</p>
              )}
            </div>

            {/* Menu Categories */}
            {categories.map((cat) => (
              <div key={cat.id} className="mb-6">
                <h3 className="menu-category-title" style={{ borderColor: restaurant.primary_color }}>
                  {cat.name}
                </h3>
                <div className={`space-y-${restaurant.layout_style === 'compact' ? '2' : '3'}`}>
                  {cat.menu_items?.slice(0, 3).map((item) => (
                    <div key={item.id} className="menu-item-card p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className={item.is_veg ? 'veg-dot' : 'nonveg-dot'} style={{ transform: 'scale(0.8)' }} />
                            <span className="font-semibold text-sm">{item.name}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                        </div>
                        <span className="font-bold text-sm" style={{ color: restaurant.primary_color }}>
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
