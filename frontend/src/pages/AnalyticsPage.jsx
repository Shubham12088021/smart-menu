import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyticsService } from '../services/analytics';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatPrice } from '../utils/constants';
import { UtensilsCrossed, FolderOpen, Eye, QrCode, ClipboardList, DollarSign } from 'lucide-react';

const CHART_COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.get()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading analytics..." />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary-500" /> Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track your restaurant's performance</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Trend */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" /> Order Trend (Last 7 Days)
          </h2>
          {data?.order_trend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.order_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937', border: '1px solid #374151',
                    borderRadius: '12px', color: '#f3f4f6',
                  }}
                />
                <Bar dataKey="orders" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">No data yet</p>
          )}
        </div>

        {/* Top Ordered Items */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🏆 Top Ordered Items
          </h2>
          {data?.top_ordered?.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={data.top_ordered}
                    dataKey="orders"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                  >
                    {data.top_ordered.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {data.top_ordered.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{item.name}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.orders}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
