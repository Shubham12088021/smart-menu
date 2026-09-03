import { Edit2, Trash2, Copy, GripVertical, Star, Flame } from 'lucide-react';
import { formatPrice } from '../utils/constants';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image3D from './Image3D';

export default function MenuItemCard({ item, onEdit, onDelete, onDuplicate, dragEnabled = true }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !dragEnabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass-card p-4 flex items-center gap-4 hover:shadow-lg transition-shadow duration-200 animate-fade-in"
    >
      {/* Drag Handle */}
      {dragEnabled && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
        >
          <GripVertical className="w-5 h-5" />
        </button>
      )}

      {/* Image */}
      <div className="w-16 h-16 rounded-xl overflow-visible flex-shrink-0 bg-gray-100 dark:bg-gray-800">
        <Image3D
          src={item.image}
          alt={item.name}
          item={item}
          className="rounded-xl"
          maxTilt={20}
          scale={1.08}
          speed={300}
          perspective={600}
          itemName={item.name}
          fallback={
            <div className="w-full h-full flex items-center justify-center text-2xl rounded-xl bg-gray-100 dark:bg-gray-800">
              🍽️
            </div>
          }
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className={item.is_veg ? 'veg-dot' : 'nonveg-dot'} />
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
          {item.is_bestseller && <Star className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" />}
          {item.is_spicy && <Flame className="w-4 h-4 text-red-500 flex-shrink-0" />}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
          {item.description || 'No description'}
        </p>
        <p className="text-sm font-bold text-primary-600 mt-1">{formatPrice(item.price)}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onEdit(item)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-primary-600 transition-colors"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDuplicate(item.id)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-blue-600 transition-colors"
          title="Duplicate"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
