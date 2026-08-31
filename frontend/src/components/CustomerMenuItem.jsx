import { Plus, Minus, Star, Flame } from 'lucide-react';
import { formatPrice } from '../utils/constants';

export default function CustomerMenuItem({ item, quantity = 0, onAdd, onRemove, layout = 'comfortable' }) {
  return (
    <div className={`menu-item-card flex gap-3 ${
      layout === 'image-focused' ? 'flex-col' : ''
    }`}>
      {/* Image */}
      {(item.image || layout === 'image-focused') && (
        <div className={`flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 ${
          layout === 'image-focused' ? 'w-full h-40' : 'w-20 h-20'
        }`}>
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              🍽️
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className={`flex-shrink-0 ${item.is_veg ? 'veg-dot' : 'nonveg-dot'}`} />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                {item.name}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {item.is_bestseller && (
                <span className="badge badge-bestseller text-[10px] gap-0.5">
                  <Star className="w-2.5 h-2.5" fill="currentColor" /> Best
                </span>
              )}
              {item.is_spicy && (
                <span className="badge badge-spicy text-[10px] gap-0.5">
                  <Flame className="w-2.5 h-2.5" /> Spicy
                </span>
              )}
            </div>
          </div>
          <p className="font-bold text-primary-600 dark:text-primary-400 whitespace-nowrap text-sm">
            {formatPrice(item.price)}
          </p>
        </div>

        {item.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Add to Cart */}
        <div className="flex justify-end mt-2">
          {quantity > 0 ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRemove(item)}
                className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-semibold text-sm text-gray-900 dark:text-white">
                {quantity}
              </span>
              <button
                onClick={() => onAdd(item)}
                className="w-7 h-7 rounded-lg bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd(item)}
              className="px-4 py-1.5 text-xs font-semibold border-2 border-primary-500 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-500 hover:text-white transition-all"
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
