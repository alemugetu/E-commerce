import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MetricCard, LoadingSkeleton } from '../../components/shared';
import { Tag, DollarSign, User, Building, Users, Folder, Settings, BarChart3, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

/**
 * SuperuserDashboard — Overview page for /admin
 * 
 * Shows platform-wide metrics including customer and seller counts.
 * API: /api/superuser/metrics/
 */
const SuperuserDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/superuser/metrics/');
      setMetrics(data);
    } catch (err) {
      setError('Failed to load platform metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name}`.trim()
    : user?.email ?? 'Admin';

  const metricCards = [
    {
      label: 'Total Products',
      value: metrics?.total_products ?? '—',
      subtitle: `${metrics?.available_products ?? 0} available`,
      tone: 'from-purple-500 to-purple-700',
      icon: Tag,
    },
    {
      label: 'Total Revenue',
      value: metrics
        ? `ETB ${Number(metrics.total_sales).toLocaleString()}`
        : '—',
      subtitle: `${metrics?.paid_orders ?? 0} paid orders`,
      tone: 'from-emerald-500 to-teal-600',
      icon: DollarSign,
    },
    {
      label: 'Total Customers',
      value: metrics?.total_customers ?? '—',
      subtitle: `${metrics?.pending_customers ?? 0} pending approval`,
      tone: 'from-indigo-500 to-indigo-700',
      icon: User,
    },
    {
      label: 'Total Sellers',
      value: metrics?.total_sellers ?? '—',
      subtitle: `${metrics?.pending_orders ?? 0} pending orders`,
      tone: 'from-amber-500 to-orange-500',
      icon: Building,
    },
  ];

  const quickActions = [
    { label: 'User Management',  to: '/admin/users',      color: 'bg-purple-600 hover:bg-purple-500', icon: Users },
    { label: 'Categories',       to: '/admin/categories', color: 'bg-indigo-600 hover:bg-indigo-500', icon: Folder },
    { label: 'Store Settings',   to: '/admin/settings',   color: 'bg-emerald-600 hover:bg-emerald-500', icon: Settings },
    { label: 'Reports',          to: '/admin/reports',    color: 'bg-amber-600 hover:bg-amber-500',   icon: BarChart3 },
  ];

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-purple-400">System Admin</p>
        <h1 className="mt-1 text-2xl font-black text-slate-100">
          Welcome back, {displayName.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Platform-wide overview and system health monitoring.
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {error}
          <button
            onClick={loadMetrics}
            className="ml-3 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? [1, 2, 3, 4].map(i => <MetricCard key={i} loading />)
          : metricCards.map(card => (
            <MetricCard
              key={card.label}
              label={card.label}
              value={card.value}
              subtitle={card.subtitle}
              tone={card.tone}
              icon={card.icon}
            />
          ))
        }
      </div>

      {/* ── Quick Actions ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <p className="text-sm font-bold text-slate-200 mb-4">Quick Actions</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(action => (
            <Link
              key={action.to}
              to={action.to}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${action.color}`}
            >
              <action.icon className="w-5 h-5" />
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── System Health ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Platform Stats */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <p className="text-sm font-bold text-slate-200 mb-4">Platform Statistics</p>
          {loading ? (
            <LoadingSkeleton count={4} className="h-6 mb-3" />
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Registered Users',   value: (metrics?.total_customers ?? 0) + (metrics?.total_sellers ?? 0), color: 'bg-indigo-500' },
                { label: 'Active Products',    value: metrics?.available_products ?? 0,  color: 'bg-emerald-500' },
                { label: 'Total Orders',       value: (metrics?.paid_orders ?? 0) + (metrics?.pending_orders ?? 0), color: 'bg-purple-500' },
                { label: 'Platform Revenue',   value: `ETB ${Number(metrics?.total_sales ?? 0).toLocaleString()}`, color: 'bg-amber-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${item.color}`} />
                    <span className="text-sm font-bold text-slate-200">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Placeholder */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <p className="text-sm font-bold text-slate-200 mb-4">System Alerts</p>
          <div className="space-y-3">
            {metrics && metrics.pending_customers > 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-300">
                    {metrics.pending_customers} customer{metrics.pending_customers !== 1 ? 's' : ''} pending approval
                  </p>
                  <p className="text-[10px] text-amber-400/70 mt-1">
                    Sellers can approve customer registrations
                  </p>
                </div>
              </div>
            )}
            {metrics && metrics.out_of_stock_products > 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-rose-300">
                    {metrics.out_of_stock_products} product{metrics.out_of_stock_products !== 1 ? 's' : ''} out of stock
                  </p>
                  <p className="text-[10px] text-rose-400/70 mt-1">
                    Notify sellers to update inventory
                  </p>
                </div>
              </div>
            )}
            {(!metrics || (metrics.pending_customers === 0 && metrics.out_of_stock_products === 0)) && (
              <div className="py-8 text-center">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                <p className="text-xs text-slate-500">All systems operational</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default SuperuserDashboard;
