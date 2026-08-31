import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, FolderOpen, QrCode, ClipboardList, DollarSign, Eye, Plus, Palette, ArrowRight } from 'lucide-react';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { analyticsService } from '../services/analytics';
import { formatPrice, formatDate } from '../utils/constants';

export default function DashboardHome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.get()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's your restaurant overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={UtensilsCrossed} label="Menu Items" value={data?.total_items || 0} color="primary" />
        <StatCard icon={FolderOpen} label="Categories" value={data?.total_categories || 0} color="blue" />
        <StatCard icon={Eye} label="Menu Views" value={data?.total_views || 0} color="green" />
        <StatCard icon={QrCode} label="QR Scans" value={data?.total_qr_scans || 0} color="purple" />
        <StatCard icon={ClipboardList} label="Orders" value={data?.total_orders || 0} color="amber" />
        <StatCard icon={DollarSign} label="Revenue" value={formatPrice(data?.total_revenue || 0)} color="rose" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: '/dashboard/menu', icon: Plus, label: 'Add Menu Item', color: 'from-primary-500 to-primary-600' },
            { to: '/dashboard/design', icon: Palette, label: 'Design Menu', color: 'from-blue-500 to-blue-600' },
            { to: '/dashboard/qr', icon: QrCode, label: 'Generate QR', color: 'from-purple-500 to-purple-600' },
            { to: '/dashboard/orders', icon: ClipboardList, label: 'View Orders', color: 'from-emerald-500 to-emerald-600' },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="glass-card p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform duration-200 group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white text-sm">{action.label}</span>
              <ArrowRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders & Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            <Link to="/dashboard/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all
            </Link>
          </div>
          {data?.recent_orders?.length > 0 ? (
            <div className="space-y-3">
              {data.recent_orders.map((order, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      #{String(order.id).padStart(4, '0')} — {order.customer_name}
                    </p>
                    <p className="text-xs text-gray-500">{order.item_count} items • {formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(order.total)}</p>
                    <span className={`badge text-[10px] status-${order.status}`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No orders yet</p>
          )}
        </div>

        {/* Top Ordered Items */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Ordered Items</h2>
          {data?.top_ordered?.length > 0 ? (
            <div className="space-y-3">
              {data.top_ordered.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{item.orders} orders</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
