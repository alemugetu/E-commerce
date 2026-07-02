import React, { useEffect, useState, useCallback } from 'react';
import { fetchOrderHistory } from '../services/paymentService';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ─── Skeleton row ────────────────────────────────────────────────────────────
const OrderSkeleton = () => (
  <div className="border border-slate-100 rounded-xl overflow-hidden animate-pulse">
    <div className="bg-slate-50 px-5 py-4 flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-3 w-28 bg-slate-200 rounded" />
        <div className="h-3 w-40 bg-slate-200 rounded" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-6 w-16 bg-slate-200 rounded-full" />
        <div className="h-5 w-24 bg-slate-200 rounded" />
      </div>
    </div>
    <div className="px-5 py-4 space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-200 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 bg-slate-200 rounded" />
            <div className="h-3 w-1/3 bg-slate-200 rounded" />
          </div>
          <div className="h-4 w-16 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Status badge helper ─────────────────────────────────────────────────────
const statusStyle = (status) => {
  switch (status) {
    case 'Paid':        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Pending':     return 'bg-amber-50  text-amber-700  border-amber-200';
    case 'Processing':  return 'bg-blue-50   text-blue-700   border-blue-200';
    case 'Shipped':     return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Delivered':   return 'bg-teal-50   text-teal-700   border-teal-200';
    case 'Cancelled':   return 'bg-rose-50   text-rose-700   border-rose-200';
    default:            return 'bg-slate-50  text-slate-600  border-slate-200';
  }
};

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=120&auto=format&fit=crop&q=60';

// ─── Component ───────────────────────────────────────────────────────────────
const DashboardOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ hasNext: false, hasPrev: false, total: 0 });
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async (targetPage) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrderHistory(targetPage);
      setOrders(data.results ?? []);
      setMeta({
        hasNext: !!data.next,
        hasPrev: !!data.previous,
        total:   data.count ?? 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/orders/${orderId}/status/`, { status: newStatus });
      await load(page);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">Order History</h2>
            <p className="text-xs text-slate-400 mt-0.5">Your past purchases and fulfillment statuses.</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <OrderSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">⚠️</p>
        <h3 className="text-lg font-bold text-slate-900">Failed to Load Orders</h3>
        <p className="text-sm text-slate-500 mt-1 mb-5">{error}</p>
        <button
          onClick={() => load(page)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">📦</p>
        <h3 className="text-xl font-bold text-slate-900">No Orders Yet</h3>
        <p className="text-sm text-slate-500 mt-2">
          Once you complete a purchase, your order history will appear here.
        </p>
      </div>
    );
  }

  // ── Orders list ──────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">Order History</h2>
          <p className="text-xs text-slate-400 mt-0.5">Your past purchases and fulfillment statuses.</p>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-full border border-slate-200">
          {meta.total} order{meta.total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Order cards */}
      <div className="space-y-5">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-slate-100 rounded-xl overflow-hidden shadow-sm"
          >
            {/* Card header */}
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-100 flex flex-wrap gap-3 justify-between items-center">
              <div className="flex gap-5 text-xs text-slate-500">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Date</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{order.formatted_date}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Ref #</p>
                  <p className="font-mono text-slate-700 mt-0.5 select-all">
                    {order.tx_ref || `ORD-${order.id}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {user?.is_staff || user?.is_superuser ? (
                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Paid">Paid</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                ) : (
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusStyle(order.status)}`}
                  >
                    {order.status}
                  </span>
                )}
                {/* is_paid badge */}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    order.is_paid
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {order.is_paid ? 'Paid' : 'Unpaid'}
                </span>
                <span className="text-base font-black text-slate-900">
                  {parseFloat(order.total_amount).toLocaleString()} ETB
                </span>
              </div>
            </div>

            {/* Line items */}
            <div className="divide-y divide-slate-100 px-5">
              {order.items?.map((item) => (
                <div key={item.id} className="py-4 flex items-center gap-4">
                  {/* Product thumbnail */}
                  <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.product_image || FALLBACK_IMG}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                    />
                  </div>

                  {/* Name + qty */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{item.product_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Qty: <span className="font-semibold text-slate-700">{item.quantity}</span>
                      {' · '}
                      <span className="text-slate-500">
                        {parseFloat(item.price_at_purchase).toLocaleString()} ETB each
                      </span>
                    </p>
                  </div>

                  {/* Subtotal */}
                  <p className="text-sm font-black text-slate-800 flex-shrink-0">
                    {parseFloat(item.subtotal).toLocaleString()} ETB
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {(meta.hasNext || meta.hasPrev) && (
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
          <button
            disabled={!meta.hasPrev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="text-xs font-bold px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← Previous
          </button>
          <span className="text-xs font-bold text-slate-500">Page {page}</span>
          <button
            disabled={!meta.hasNext}
            onClick={() => setPage((p) => p + 1)}
            className="text-xs font-bold px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardOrders;
