import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOrderHistory } from '../services/paymentService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({ hasNext: false, hasPrev: false, totalCount: 0 });

  useEffect(() => {
    const getOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchOrderHistory(currentPage);
        setOrders(data.results || []);
        setPaginationMeta({
          hasNext: !!data.next,
          hasPrev: !!data.previous,
          totalCount: data.count || 0
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, [currentPage]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Cancelled':
      case 'Failed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="animate-spin inline-block w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-slate-500 font-medium">Syncing your order ledger history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="text-4xl mb-4">&#9888;</div>
        <h2 className="text-xl font-bold text-slate-900">Failed to Load Orders</h2>
        <p className="text-slate-500 text-sm mt-1">{error}</p>
        <Button variant="primary" className="mt-6" onClick={() => setCurrentPage(1)}>
          Retry Synchronization
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4">&#128230;</div>
        <h2 className="text-2xl font-bold text-slate-900">No Orders Yet</h2>
        <p className="text-slate-500 text-sm mt-2">When you place an order, it will show up here along with fulfillment statuses.</p>
        <Button variant="primary" className="mt-6 w-full" onClick={() => navigate('/')}>
          Explore Storefront
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order History</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track your recent procurement invoices.</p>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-full border border-slate-200">
          Total: {paginationMeta.totalCount} Orders
        </span>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden border border-slate-100 shadow-sm">
            {/* Header block for meta tags */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center">
              <div className="flex gap-6 text-xs text-slate-500 font-medium">
                <div>
                  <p className="uppercase tracking-wider text-[10px] text-slate-400">Date Placed</p>
                  <p className="text-slate-800 font-semibold mt-0.5">{order.formatted_date}</p>
                </div>
                <div>
                  <p className="uppercase tracking-wider text-[10px] text-slate-400">Transaction Ref</p>
                  <p className="text-slate-700 font-mono mt-0.5 select-all">{order.tx_ref || `ORD-#${order.id}`}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusStyle(order.status)}`}>
                  {order.status}
                </span>
                <span className="text-base font-black text-slate-900">
                  {parseFloat(order.total_amount).toLocaleString()} ETB
                </span>
              </div>
            </div>

            {/* Inner row list snapshots */}
            <div className="divide-y divide-slate-100 px-6">
              {order.items?.map((item) => (
                <div key={item.id} className="py-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{item.product_name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Quantity: <span className="font-semibold text-slate-700">{item.quantity}</span></p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-slate-800">{parseFloat(item.subtotal).toLocaleString()} ETB</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{parseFloat(item.price_at_purchase).toLocaleString()} ea</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination Action Drivers */}
      {(paginationMeta.hasNext || paginationMeta.hasPrev) && (
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
          <Button
            variant="secondary"
            disabled={!paginationMeta.hasPrev}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-4 py-2 text-xs font-bold"
          >
            ← Previous Page
          </Button>
          <span className="text-xs font-bold text-slate-500">
            Page {currentPage}
          </span>
          <Button
            variant="secondary"
            disabled={!paginationMeta.hasNext}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2 text-xs font-bold"
          >
            Next Page →
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;

