import { useState, useEffect } from 'react';
import { X, Upload, Sparkles, Loader2 } from 'lucide-react';
import { aiService } from '../services/ai';
import Image3D from './Image3D';
import toast from 'react-hot-toast';

export default function MenuItemForm({ isOpen, onClose, onSubmit, item, categories }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_veg: true,
    is_spicy: false,
    is_bestseller: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        category_id: item.category_id || '',
        is_veg: item.is_veg ?? true,
        is_spicy: item.is_spicy ?? false,
        is_bestseller: item.is_bestseller ?? false,
      });
      setImagePreview(item.image || '');
    } else {
      setForm({
        name: '', description: '', price: '',
        category_id: categories?.[0]?.id || '',
        is_veg: true, is_spicy: false, is_bestseller: false,
      });
      setImagePreview('');
    }
    setImageFile(null);
  }, [item, isOpen, categories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAIDescription = async () => {
    if (!form.name) {
      toast.error('Enter item name first');
      return;
    }
    setAiLoading(true);
    try {
      const category = categories.find(c => c.id === Number(form.category_id));
      const result = await aiService.generateDescription({
        item_name: form.name,
        category: category?.name || '',
        is_veg: form.is_veg,
      });
      if (result.success) {
        setForm(prev => ({ ...prev, description: result.content }));
        toast.success('AI description generated!');
      } else {
        toast.error(result.message || 'AI unavailable');
      }
    } catch {
      toast.error('AI assistant is unavailable. Enter description manually.');
    }
    setAiLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category_id) {
      toast.error('Please fill required fields');
      return;
    }
    onSubmit({
      ...form,
      price: parseFloat(form.price),
      category_id: parseInt(form.category_id),
    }, imageFile);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[5vh] overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative glass-card p-6 max-w-lg w-full animate-slide-up mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {item ? 'Edit Menu Item' : 'Add Menu Item'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="input-label">Item Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Paneer Tikka"
              required
            />
          </div>

          {/* Description with AI */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <button
                type="button"
                onClick={handleAIDescription}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
              >
                {aiLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Generate with AI
              </button>
            </div>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="input-field min-h-[80px] resize-none"
              placeholder="Describe this dish..."
              rows={3}
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Price (₹) *</label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                className="input-field"
                placeholder="0"
                min="0"
                step="1"
                required
              />
            </div>
            <div>
              <label className="input-label">Category *</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select...</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_veg"
                checked={form.is_veg}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">🟢 Vegetarian</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_spicy"
                checked={form.is_spicy}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">🌶️ Spicy</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_bestseller"
                checked={form.is_bestseller}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">⭐ Bestseller</span>
            </label>
          </div>

          {/* Image Upload */}
          <div>
            <label className="input-label">Food Image</label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="w-20 h-20 rounded-xl border border-gray-200 dark:border-gray-700 overflow-visible">
                  <Image3D
                    src={imagePreview}
                    alt="Preview"
                    className="rounded-xl"
                    maxTilt={20}
                    scale={1.1}
                    speed={300}
                    perspective={500}
                    zoomable={false}
                  />
                </div>
              )}
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-primary-400 transition-colors">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">Upload image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {item ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
