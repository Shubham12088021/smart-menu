import { formatPrice, formatDate, ORDER_STATUSES } from '../utils/constants';
import { Clock, User, Hash, ChevronRight } from 'lucide-react';

export default function OrderCard({ order, onUpdateStatus }) {
  const statusConfig = ORDER_STATUSES.find(s => s.id === order.status) || ORDER_STATUSES[0];
  const nextStatus = ORDER_STATUSES.find(s => s.id === statusConfig.next);

  return (
    <div className="glass-card p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
              #{String(order.id).padStart(4, '0')}
            </span>
            <span className={`badge status-${order.status}`}>
              {statusConfig.name}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <User className="w-3.5 h-3.5" /> {order.customer_name}
            </span>
            {order.table_number && (
              <span className="flex items-center gap-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                <Hash className="w-3.5 h-3.5 text-primary-500" /> Table {order.table_number}
              </span>
            )}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              order.payment_status === 'paid'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25'
            }`}>
              {order.payment_status === 'paid' ? '💳 Paid Online' : '💵 Pay Cash'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatPrice(order.total)}
          </p>
          <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            <Clock className="w-3 h-3" /> {formatDate(order.created_at)}
          </p>
        </div>
      </div>

      {order.notes && (
        <div className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 p-2 rounded-xl mb-3 border border-amber-500/20">
          📝 <strong>Note:</strong> {order.notes}
        </div>
      )}

      {/* Items */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mb-3">
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm py-1">
            <span className="text-gray-700 dark:text-gray-300">
              {item.quantity}× {item.item_name}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      {nextStatus && (
        <button
          onClick={() => onUpdateStatus(order.id, nextStatus.id)}
          className="w-full btn-primary text-sm justify-center"
        >
          Mark as {nextStatus.name}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
      {order.status !== 'cancelled' && order.status !== 'completed' && (
        <button
          onClick={() => onUpdateStatus(order.id, 'cancelled')}
          className="w-full mt-2 btn-ghost text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 justify-center"
        >
          Cancel Order
        </button>
      )}
    </div>
  );
}
