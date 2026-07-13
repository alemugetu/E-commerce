import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { DataTable, StatusBadge } from '../../components/shared';
import toast from 'react-hot-toast';

/**
 * SellerOrders — Order management for /seller/orders
 * 
 * Shows all orders with ability to update status.
 * API: /api/orders/admin/orders/ (seller inherits this capability)
 */
const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ hasNext: false, hasPrev: false, total: 0 });
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = useCallback(async (targetPage) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/admin/orders/?page=${targetPage}`);
      setOrders(data.results ?? []);
      setMeta({
        hasNext: !!data.next,
        hasPrev: !!data.previous,
        total: data.count ?? 0,
      });
    } catch {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(page);
  }, [page, loadOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/orders/${orderId}/status/`, { status: newStatus });
      toast.success('Order status updated.');
      await loadOrders(page);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusOptions = ['Pending', 'Processing', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];

  const columns = [
    {
      key: 'id',
      label: 'Order #',
      render: (val) => <span className="font-mono text-slate-900 dark:text-slate-200">#{val}</span>,
    },
    {
      key: 'user',
      label: 'Customer',
      render: (val) => (
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">
            {val?.first_name || val?.last_name
              ? `${val.first_name || ''} ${val.last_name || ''}`.trim()
              : 'Customer'}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-500">{val?.email}</p>
        </div>
      ),
    },
    {
      key: 'total_amount',
      label: 'Total',
      render: (val) => (
        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
          {Number(val).toLocaleString()} ETB
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={val} />
          {updatingId === row.id && (
            <div className="w-3 h-3 border border-slate-600 dark:border-slate-600 border-t-emerald-500 rounded-full animate-spin" />
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: 'id',
      label: 'Actions',
      align: 'right',
      render: (id, row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(id, e.target.value)}
          disabled={updatingId === id}
          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-900 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {statusOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Order Management</p>
        <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">Orders</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          View and manage all customer orders. Update status to keep customers informed.
        </p>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Orders', value: meta.total, color: 'border-indigo-600' },
          { label: 'Pending', value: orders.filter(o => o.status === 'Pending').length, color: 'border-amber-600' },
          { label: 'Processing', value: orders.filter(o => o.status === 'Processing').length, color: 'border-indigo-600' },
          { label: 'Paid', value: orders.filter(o => o.status === 'Paid').length, color: 'border-emerald-600' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl border-l-4 ${stat.color} bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4`}>
            <p className="text-xs text-slate-600 dark:text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Orders Table ── */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">All Orders</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Customer purchase history.</p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          emptyMessage="No orders yet."
        />

        {/* ── Pagination ── */}
        {(meta.hasNext || meta.hasPrev) && (
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={!meta.hasPrev || loading}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              ← Previous
            </button>
            <span className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              Page {page}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!meta.hasNext || loading}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Next →
            </button>
          </div>
        )}
      </section>

    </div>
  );
};

export default SellerOrders;
