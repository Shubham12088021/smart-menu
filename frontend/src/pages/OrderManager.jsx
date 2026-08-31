import { useState, useEffect } from 'react';
import { ClipboardList, Filter } from 'lucide-react';
import { orderService } from '../services/orders';
import OrderCard from '../components/OrderCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { ORDER_STATUSES } from '../utils/constants';
import toast from 'react-hot-toast';

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const loadOrders = async () => {
    try {
      const data = await orderService.getOrders(filterStatus || null);
      setOrders(data);
    } catch {
      toast.error('Failed to load orders');
    }
    setLoading(false);
  };

  useEffect(() => { loadOrders(); }, [filterStatus]);

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await orderService.updateStatus(orderId, status);
      toast.success(`Order updated to ${status}`);
      loadOrders();
    } catch {
      toast.error('Failed to update order');
    }
  };

  if (loading) return <LoadingSpinner text="Loading orders..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {orders.length} order{orders.length !== 1 && 's'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field py-2 text-sm w-40"
          >
            <option value="">All Orders</option>
            {ORDER_STATUSES.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders yet"
          description={filterStatus ? "No orders match this filter." : "Orders will appear here when customers place them."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
