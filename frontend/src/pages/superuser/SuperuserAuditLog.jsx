import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { DataTable, StatusBadge, LoadingSkeleton } from '../../components/shared';

/**
 * SuperuserAuditLog — Platform audit trail for /admin/audit
 * 
 * Phase 4: Now populated with real data from /api/superuser/audit/
 * 
 * Features:
 *   - Paginated, newest-first audit log
 *   - Filter by action type
 *   - Filter by actor email (search)
 *   - Date range filter
 *   - Action badge with auto-colored variants
 */

const ACTION_VARIANT_MAP = {
  user_created:        'success',
  user_deleted:        'danger',
  user_blocked:        'danger',
  user_unblocked:      'success',
  role_changed:        'warning',
  password_reset:      'warning',
  customer_approved:   'success',
  customer_rejected:   'danger',
  product_created:     'success',
  product_updated:     'info',
  product_deactivated: 'danger',
  product_reactivated: 'success',
  category_created:    'success',
  category_updated:    'info',
  category_deleted:    'danger',
  settings_updated:    'info',
  order_status_changed:'info',
  login:               'neutral',
  logout:              'neutral',
};

const SuperuserAuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({
    count: 0, page: 1, totalPages: 1, hasNext: false, hasPrev: false,
  });
  const [actionChoices, setActionChoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Filters ────────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    action: '', actor_email: '', date_from: '', date_to: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [page, setPage] = useState(1);

  // ── Load Logs ─────────────────────────────────────────────────────────────
  const loadLogs = useCallback(async (targetPage = 1, activeFilters = appliedFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: targetPage, page_size: 25 });
      if (activeFilters.action)      params.append('action',      activeFilters.action);
      if (activeFilters.actor_email) params.append('actor_email', activeFilters.actor_email);
      if (activeFilters.date_from)   params.append('date_from',   activeFilters.date_from);
      if (activeFilters.date_to)     params.append('date_to',     activeFilters.date_to);

      const { data } = await api.get(`/superuser/audit/?${params}`);
      setLogs(data.results ?? []);
      setMeta({
        count:      data.count,
        page:       data.page,
        totalPages: data.total_pages,
        hasNext:    data.has_next,
        hasPrev:    data.has_prev,
      });
      if (data.action_choices?.length) {
        setActionChoices(data.action_choices);
      }
    } catch (err) {
      setError('Failed to load audit log. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    loadLogs(page, appliedFilters);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial load
  useEffect(() => {
    loadLogs(1, filters);
    setAppliedFilters(filters);
    setPage(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setAppliedFilters(filters);
    setPage(1);
    loadLogs(1, filters);
  };

  const handleClearFilters = () => {
    const cleared = { action: '', actor_email: '', date_from: '', date_to: '' };
    setFilters(cleared);
    setAppliedFilters(cleared);
    setPage(1);
    loadLogs(1, cleared);
  };

  const hasActiveFilters = Object.values(appliedFilters).some(Boolean);

  // ── Table Columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'timestamp',
      label: 'When',
      render: (_, row) => (
        <span className="text-xs text-slate-400 whitespace-nowrap">
          {row.formatted_timestamp}
        </span>
      ),
    },
    {
      key: 'actor_email',
      label: 'Actor',
      render: (val) => (
        <span className="text-sm font-medium text-slate-200">{val}</span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (val, row) => (
        <StatusBadge
          status={row.action_label}
          variant={ACTION_VARIANT_MAP[val] ?? 'neutral'}
          size="sm"
        />
      ),
    },
    {
      key: 'target',
      label: 'Target',
      render: (val) => (
        <span className="text-sm text-slate-300 font-mono text-xs">{val || '—'}</span>
      ),
    },
    {
      key: 'details',
      label: 'Details',
      render: (val) => {
        if (!val || Object.keys(val).length === 0) return <span className="text-slate-600 text-xs">—</span>;
        // Show the most relevant detail field
        const relevantKey = ['role', 'new_role', 'new_status', 'changed_fields', 'old_status'].find(k => k in val);
        if (relevantKey) {
          const v = val[relevantKey];
          return (
            <span className="text-xs text-slate-400">
              {relevantKey.replace(/_/g, ' ')}: <span className="text-slate-200 font-medium">
                {Array.isArray(v) ? v.join(', ') : String(v)}
              </span>
            </span>
          );
        }
        return <span className="text-xs text-slate-500 italic">See details</span>;
      },
    },
    {
      key: 'ip_address',
      label: 'IP',
      render: (val) => (
        <span className="text-xs font-mono text-slate-500">{val || '—'}</span>
      ),
    },
  ];

  // ── Input Styles ──────────────────────────────────────────────────────────
  const inputCls = 'w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition';
  const labelCls = 'mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400';

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-purple-400">System Monitoring</p>
          <h1 className="mt-1 text-2xl font-black text-slate-100">Audit Log</h1>
          <p className="mt-1 text-sm text-slate-400">
            Immutable record of all privileged actions across the platform.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Total entries</p>
          <p className="text-2xl font-black text-slate-200">
            {loading && !meta.count ? '—' : meta.count.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {error}
          <button onClick={() => loadLogs(page)} className="ml-3 underline">Retry</button>
        </div>
      )}

      {/* ── Filter Panel ── */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-200">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-rose-400 hover:text-rose-300 transition"
            >
              ✕ Clear filters
            </button>
          )}
        </div>
        <form onSubmit={handleApplyFilters}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelCls}>Action Type</label>
              <select
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
                className={inputCls}
              >
                <option value="">All actions</option>
                {actionChoices.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Actor Email</label>
              <input
                type="text"
                name="actor_email"
                value={filters.actor_email}
                onChange={handleFilterChange}
                placeholder="search@example.com"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Date From</label>
              <input
                type="date"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Date To</label>
              <input
                type="date"
                name="date_to"
                value={filters.date_to}
                onChange={handleFilterChange}
                className={inputCls}
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-xl bg-purple-600 px-5 py-2 text-sm font-bold text-white hover:bg-purple-500 transition"
          >
            Apply Filters
          </button>
        </form>
      </section>

      {/* ── Audit Table ── */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-100">Event Log</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {loading ? 'Loading…' : `${meta.count} entries · Page ${meta.page} of ${meta.totalPages}`}
            </p>
          </div>
          <button
            onClick={() => loadLogs(page)}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-slate-200 transition"
          >
            {loading ? '…' : '↻ Refresh'}
          </button>
        </div>

        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          emptyMessage={
            hasActiveFilters
              ? 'No log entries match the current filters.'
              : 'No audit events recorded yet. Actions by privileged users will appear here.'
          }
        />

        {/* ── Pagination ── */}
        {(meta.hasNext || meta.hasPrev) && (
          <div className="mt-5 flex justify-between items-center pt-4 border-t border-slate-800">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={!meta.hasPrev || loading}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition"
            >
              ← Previous
            </button>
            <span className="text-xs text-slate-500 font-medium">
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!meta.hasNext || loading}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition"
            >
              Next →
            </button>
          </div>
        )}
      </section>

      {/* ── Legend ── */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tracked Actions</p>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4">
          {[
            { label: 'User Created/Deleted', variant: 'success' },
            { label: 'User Blocked', variant: 'danger' },
            { label: 'Role Changed', variant: 'warning' },
            { label: 'Customer Approved', variant: 'success' },
            { label: 'Customer Rejected', variant: 'danger' },
            { label: 'Product Changes', variant: 'info' },
            { label: 'Category Changes', variant: 'info' },
            { label: 'Settings Updated', variant: 'info' },
            { label: 'Order Status Changed', variant: 'info' },
            { label: 'Login / Logout', variant: 'neutral' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 py-1">
              <StatusBadge status="●" variant={item.variant} size="sm" />
              <span className="text-xs text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default SuperuserAuditLog;
