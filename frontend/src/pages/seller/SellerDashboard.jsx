import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MetricCard, LoadingSkeleton } from '../../components/shared';
import { Tag, Package, DollarSign, ShoppingCart, Plus, ClipboardList, Users } from 'lucide-react';

/**
 * SellerDashboard — Overview page for /seller
 * 
 * Shows key business metrics and a quick-action panel.
 * API: /api/seller/metrics/
 */

const SellerDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/seller/metrics/');
      setMetrics(data);
    } catch (err) {
      setError('Failed to load dashboard metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name}`.trim()
    : user?.email ?? 'Seller';

  const metricCards = [
    {
      label: 'Total Products',
      value: metrics?.total_products ?? '—',
      subtitle: `${metrics?.available_products ?? 0} live in store`,
      tone: 'from-emerald-500 to-teal-600',
      icon: Tag,
    },
    {
      label: 'Out of Stock',
      value: metrics?.out_of_stock_products ?? '—',
      subtitle: `${metrics?.total_inventory_units ?? 0} total units`,
      tone: 'from-amber-500 to-orange-500',
      icon: Package,
    },
    {
      label: 'Total Revenue',
      value: metrics
        ? `ETB ${Number(metrics.total_sales).toLocaleString()}`
        : '—',
      subtitle: `${metrics?.paid_orders ?? 0} paid orders`,
      tone: 'from-indigo-500 to-indigo-700',
      icon: DollarSign,
    },
    {
      label: 'Pending Orders',
      value: metrics?.pending_orders ?? '—',
      subtitle: `${metrics?.processing_orders ?? 0} processing`,
      tone: 'from-slate-600 to-slate-800',
      icon: ShoppingCart,
    },
  ];

  const quickActions = [
    { label: 'Add New Product',    to: '/seller/products',  color: 'bg-emerald-600 hover:bg-emerald-500', icon: Plus },
    { label: 'Manage Orders',      to: '/seller/orders',    color: 'bg-indigo-600  hover:bg-indigo-500',  icon: ClipboardList },
    { label: 'Check Inventory',    to: '/seller/inventory', color: 'bg-amber-600   hover:bg-amber-500',   icon: Package },
    { label: 'Review Customers',   to: '/seller/customers', color: 'bg-slate-700   hover:bg-slate-600',   icon: Users },
  ];

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">Seller Panel</p>
        <h1 className="mt-1 text-2xl font-black text-slate-100">
          Welcome back, {displayName.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Here's an overview of your store performance.
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

      {/* ── Status Summary ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Order Status Breakdown */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <p className="text-sm font-bold text-slate-200 mb-4">Order Summary</p>
          {loading ? (
            <LoadingSkeleton count={3} className="h-6 mb-3" />
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Paid',        value: metrics?.paid_orders ?? 0,        color: 'bg-emerald-500' },
                { label: 'Pending',     value: metrics?.pending_orders ?? 0,     color: 'bg-amber-500' },
                { label: 'Processing',  value: metrics?.processing_orders ?? 0,  color: 'bg-indigo-500' },
              ].map(item => {
                const total = (metrics?.paid_orders ?? 0) + (metrics?.pending_orders ?? 0) + (metrics?.processing_orders ?? 0);
                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{item.label}</span>
                      <span>{item.value} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Inventory Health */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <p className="text-sm font-bold text-slate-200 mb-4">Inventory Health</p>
          {loading ? (
            <LoadingSkeleton count={3} className="h-6 mb-3" />
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Available Products', value: metrics?.available_products ?? 0, color: 'bg-emerald-500' },
                { label: 'Out of Stock',        value: metrics?.out_of_stock_products ?? 0, color: 'bg-rose-500' },
                {
                  label: 'Total SKUs',
                  value: metrics?.total_products ?? 0,
                  color: 'bg-indigo-500',
                },
              ].map(item => {
                const total = metrics?.total_products ?? 1;
                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default SellerDashboard;
