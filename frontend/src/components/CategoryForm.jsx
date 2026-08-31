import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { aiService } from '../services/ai';
import toast from 'react-hot-toast';

export default function CategoryForm({ isOpen, onClose, onSubmit, category }) {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIDescription = async () => {
    if (!name) {
      toast.error('Enter category name first');
      return;
    }
    setAiLoading(true);
    try {
      const result = await aiService.generateCategoryDescription({ category_name: name });
      if (result.success) {
        setDescription(result.content);
        toast.success('AI description generated!');
      } else {
        toast.error(result.message || 'AI unavailable');
      }
    } catch {
      toast.error('AI assistant is unavailable');
    }
    setAiLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }
    onSubmit({ name: name.trim(), description: description.trim() });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card p-6 max-w-md w-full animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {category ? 'Edit Category' : 'Add Category'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Category Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="e.g., Starters"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <button
                type="button"
                onClick={handleAIDescription}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Generate with AI
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field min-h-[60px] resize-none"
              placeholder="Describe this category..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              {category ? 'Update' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
