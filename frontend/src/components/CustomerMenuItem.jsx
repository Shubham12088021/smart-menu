import { Plus, Minus, Star, Flame, Sparkles } from 'lucide-react';
import { formatPrice } from '../utils/constants';
import Image3D from './Image3D';

export default function CustomerMenuItem({ item, quantity = 0, onAdd, onRemove, layout = 'comfortable' }) {
  return (
    <div className={`group relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-gray-100/80 dark:border-gray-800/80 shadow-sm hover:shadow-xl hover:border-primary-500/30 dark:hover:border-primary-500/30 transition-all duration-300 flex gap-3.5 sm:gap-4 ${
      layout === 'image-focused' ? 'flex-col' : 'items-center'
    }`}>
      {/* 3D Food Image Thumbnail */}
      {(item.image || layout === 'image-focused') && (
        <div className={`relative flex-shrink-0 rounded-2xl overflow-visible ${
          layout === 'image-focused' ? 'w-full h-48' : 'w-24 h-24 sm:w-28 sm:h-28'
        }`}>
          <Image3D
            src={item.image}
            alt={item.name}
            item={item}
            onAddToCart={onAdd}
            className="rounded-2xl shadow-md group-hover:shadow-lg transition-shadow"
            imgClassName="rounded-2xl"
            maxTilt={layout === 'image-focused' ? 12 : 18}
            scale={layout === 'image-focused' ? 1.03 : 1.06}
            speed={350}
            perspective={layout === 'image-focused' ? 1000 : 600}
            itemName={item.name}
            fallback={
              <div className="w-full h-full flex flex-col items-center justify-center text-3xl bg-gradient-to-br from-orange-50 to-amber-100/50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-orange-100 dark:border-gray-800 text-gray-400">
                <span>🍽️</span>
                <span className="text-[10px] font-semibold text-gray-400 mt-1">Special</span>
              </div>
            }
          />
        </div>
      )}

      {/* Content Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
        <div>
          {/* Top Title & Badges */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className={`flex-shrink-0 ${item.is_veg ? 'veg-dot' : 'nonveg-dot'}`} />
                <h3 className="font-bold text-gray-900 dark:text-white text-base tracking-tight truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {item.name}
                </h3>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {item.is_bestseller && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                    <Star className="w-2.5 h-2.5 fill-current" /> Bestseller
                  </span>
                )}
                {item.is_spicy && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25">
                    <Flame className="w-2.5 h-2.5 fill-current" /> Spicy
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Bottom Bar: Price & Add to Cart */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-gray-100/60 dark:border-gray-800/60">
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
              {formatPrice(item.price)}
            </span>
          </div>

          {/* Add / Stepper Button */}
          <div>
            {quantity > 0 ? (
              <div className="flex items-center gap-1.5 bg-primary-50 dark:bg-primary-950/40 p-1 rounded-xl border border-primary-500/30 shadow-sm">
                <button
                  onClick={() => onRemove(item)}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 dark:hover:text-white transition-all shadow-xs"
                  title="Remove one"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-bold text-sm text-primary-700 dark:text-primary-300">
                  {quantity}
                </span>
                <button
                  onClick={() => onAdd(item)}
                  className="w-7 h-7 rounded-lg bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 active:scale-95 transition-all shadow-sm"
                  title="Add one more"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAdd(item)}
                className="px-4 py-1.5 text-xs font-bold bg-primary-500/10 hover:bg-primary-500 text-primary-600 dark:text-primary-400 hover:text-white border border-primary-500/30 rounded-xl shadow-xs hover:shadow-md hover:shadow-primary-500/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> ADD
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
