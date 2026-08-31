import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Check, RefreshCw, Wand2, AlertCircle } from 'lucide-react';
import { aiService } from '../services/ai';
import { restaurantService } from '../services/restaurant';
import toast from 'react-hot-toast';

export default function AIAssistant() {
  const [aiStatus, setAiStatus] = useState(null);
  const [restaurant, setRestaurant] = useState(null);

  // Description generator
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [description, setDescription] = useState('');
  const [descLoading, setDescLoading] = useState(false);

  // Tagline generator
  const [cuisine, setCuisine] = useState('');
  const [style, setStyle] = useState('');
  const [taglines, setTaglines] = useState([]);
  const [tagLoading, setTagLoading] = useState(false);

  useEffect(() => {
    aiService.getStatus().then(setAiStatus).catch(() => setAiStatus({ available: false }));
    restaurantService.get().then(setRestaurant).catch(() => {});
  }, []);

  const generateDescription = async () => {
    if (!itemName) { toast.error('Enter an item name'); return; }
    setDescLoading(true);
    try {
      const result = await aiService.generateDescription({
        item_name: itemName, category, is_veg: isVeg,
      });
      if (result.success) {
        setDescription(result.content);
        toast.success('Description generated!');
      } else {
        toast.error(result.message || 'AI unavailable');
      }
    } catch { toast.error('AI assistant is unavailable'); }
    setDescLoading(false);
  };

  const generateTaglines = async () => {
    if (!restaurant?.name) { toast.error('Restaurant name required'); return; }
    setTagLoading(true);
    try {
      const result = await aiService.generateTagline({
        restaurant_name: restaurant.name,
        cuisine, style,
        description: restaurant.description,
      });
      if (result.success) {
        setTaglines(result.suggestions);
        toast.success('Taglines generated!');
      } else {
        toast.error(result.message || 'AI unavailable');
      }
    } catch { toast.error('AI assistant is unavailable'); }
    setTagLoading(false);
  };

  const selectTagline = async (tagline) => {
    try {
      await restaurantService.update({ tagline });
      toast.success('Tagline saved!');
    } catch { toast.error('Failed to save'); }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-500" /> AI Assistant
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          AI-powered tools to help create compelling menu content
        </p>
      </div>

      {/* AI Status */}
      <div className={`glass-card p-4 flex items-center gap-3 ${
        aiStatus?.available ? 'border-green-200 dark:border-green-800' : 'border-amber-200 dark:border-amber-800'
      }`}>
        <div className={`w-3 h-3 rounded-full ${aiStatus?.available ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {aiStatus?.available ? 'AI Assistant is Ready' : 'AI Assistant Unavailable'}
          </p>
          <p className="text-xs text-gray-500">
            {aiStatus?.available
              ? `Connected to ${aiStatus.model} at ${aiStatus.base_url}`
              : 'Install Ollama and run a model to enable AI features. You can still enter content manually.'}
          </p>
        </div>
        {!aiStatus?.available && <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />}
      </div>

      {/* Description Generator */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu Item Description Generator</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Enter a food item name and AI will generate an appetizing description.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="input-label">Item Name *</label>
            <input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="input-field"
              placeholder="e.g., Paneer Tikka"
            />
          </div>
          <div>
            <label className="input-label">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
              placeholder="e.g., Starters"
            />
          </div>
          <div>
            <label className="input-label">Type</label>
            <select
              value={isVeg}
              onChange={(e) => setIsVeg(e.target.value === 'true')}
              className="input-field"
            >
              <option value="true">🟢 Vegetarian</option>
              <option value="false">🔴 Non-Vegetarian</option>
            </select>
          </div>
        </div>

        <button onClick={generateDescription} disabled={descLoading} className="btn-primary mb-4">
          {descLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Description
        </button>

        {description && (
          <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800">
            <p className="text-gray-800 dark:text-gray-200 italic">"{description}"</p>
            <div className="flex items-center gap-2 mt-3">
              <button onClick={generateDescription} className="btn-ghost text-xs">
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(description); toast.success('Copied!'); }}
                className="btn-ghost text-xs"
              >
                <Check className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tagline Generator */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Restaurant Tagline Generator</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Generate catchy taglines for your restaurant. Current: "{restaurant?.tagline || 'None set'}"
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="input-label">Cuisine Type</label>
            <input
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="input-field"
              placeholder="e.g., Indian, Italian"
            />
          </div>
          <div>
            <label className="input-label">Style</label>
            <input
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="input-field"
              placeholder="e.g., Modern, Traditional"
            />
          </div>
        </div>

        <button onClick={generateTaglines} disabled={tagLoading} className="btn-primary mb-4">
          {tagLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Taglines
        </button>

        {taglines.length > 0 && (
          <div className="space-y-2">
            {taglines.map((tagline, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-colors group"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{tagline}"</p>
                <button
                  onClick={() => selectTagline(tagline)}
                  className="btn-ghost text-xs opacity-0 group-hover:opacity-100 transition-opacity text-primary-600"
                >
                  <Check className="w-3.5 h-3.5" /> Use This
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
