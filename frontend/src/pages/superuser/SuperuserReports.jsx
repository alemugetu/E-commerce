import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { MetricCard, LoadingSkeleton } from '../../components/shared';
import { DollarSign, Clock, Users, Tag, BarChart3 } from 'lucide-react';

/**
 * SuperuserReports — Platform analytics and reports for /admin/reports
 * 
 * Aggregates platform-wide stats from the existing metrics endpoint.
 * Designed to grow — charts can be added in a future phase.
 */
const SuperuserReports = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/superuser/metrics/');
      setMetrics(data);
    } catch {
      setError('Failed to load report data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMetrics(); }, [loadMetrics]);

  const revenueCards = [
    {
      label: 'Total Revenue',
      value: metrics ? `ETB ${Number(metrics.total_sales).toLocaleString()}` : '—',
      subtitle: `${metrics?.paid_orders ?? 0} completed transactions`,
      tone: 'from-emerald-500 to-teal-600',
      icon: DollarSign,
    },
    {
      label: 'Pending Revenue',
      value: metrics ? `${metrics.pending_orders ?? 0} orders` : '—',
      subtitle: 'Awaiting payment confirmation',
      tone: 'from-amber-500 to-orange-500',
      icon: Clock,
    },
    {
      label: 'Total Customers',
      value: metrics?.total_customers ?? '—',
      subtitle: `${metrics?.pending_customers ?? 0} pending approval`,
      tone: 'from-indigo-500 to-indigo-700',
      icon: Users,
    },
    {
      label: 'Catalog Size',
      value: metrics?.total_products ?? '—',
      subtitle: `${metrics?.out_of_stock_products ?? 0} out of stock`,
      tone: 'from-purple-500 to-purple-700',
      icon: Tag,
    },
  ];

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400">Analytics</p>
          <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">Reports</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Platform-wide performance data.
          </p>
        </div>
        <button
          onClick={loadMetrics}
          disabled={loading}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition"
        >
          {loading ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-xl border border-rose-500/20 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-400">
          {error}
          <button onClick={loadMetrics} className="ml-3 underline">Retry</button>
        </div>
      )}

      {/* ── Revenue Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? [1, 2, 3, 4].map(i => <MetricCard key={i} loading />)
          : revenueCards.map(card => (
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

      {/* ── Detailed Breakdown ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Order Breakdown */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-6">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-5">Order Status Breakdown</p>
          {loading ? (
            <LoadingSkeleton count={4} className="h-6 mb-3" />
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Paid',       value: metrics?.paid_orders ?? 0,        color: 'bg-emerald-500' },
                { label: 'Pending',    value: metrics?.pending_orders ?? 0,     color: 'bg-amber-500' },
                { label: 'Processing', value: metrics?.processing_orders ?? 0,  color: 'bg-indigo-500' },
              ].map(item => {
                const total = (metrics?.paid_orders ?? 0)
                  + (metrics?.pending_orders ?? 0)
                  + (metrics?.processing_orders ?? 0);
                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                      <span>{item.label}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">{item.value} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Inventory Breakdown */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-6">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-5">Catalog Health</p>
          {loading ? (
            <LoadingSkeleton count={3} className="h-6 mb-3" />
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Available',    value: metrics?.available_products ?? 0,    color: 'bg-emerald-500' },
                { label: 'Out of Stock', value: metrics?.out_of_stock_products ?? 0, color: 'bg-rose-500' },
                { label: 'Total SKUs',   value: metrics?.total_products ?? 0,         color: 'bg-purple-500' },
              ].map(item => {
                const total = metrics?.total_products ?? 1;
                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                      <span>{item.label}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">{item.value}</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-700`}
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

      {/* ── Future Note ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed bg-slate-50 dark:bg-slate-900/30 p-6 text-center">
        <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-60" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Advanced charts and date-range filtering will be added in Phase 5
        </p>
        <p className="text-xs text-slate-700 dark:text-slate-600 mt-1">
          Revenue over time · Top products · Customer acquisition · Retention rate
        </p>
      </div>

    </div>
  );
};

export default SuperuserReports;
