import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { DataTable, StatusBadge } from '../../components/shared';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

/**
 * SellerInventory — Stock management for /seller/inventory
 * 
 * Shows all products with stock levels, and provides inline stock update.
 * API: /api/products/ (read) + /api/seller/products/<id>/ (update)
 */
const SellerInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [editStock, setEditStock] = useState({});

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products/');
      const items = data.results ?? data ?? [];
      setProducts(items);
      // Pre-populate editable stock values
      const stockMap = {};
      items.forEach(p => { stockMap[p.id] = p.stock; });
      setEditStock(stockMap);
    } catch {
      toast.error('Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleStockUpdate = async (productId, productName) => {
    const newStock = parseInt(editStock[productId], 10);
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Stock must be a non-negative number.');
      return;
    }

    setUpdatingId(productId);
    try {
      await api.put(`/seller/products/${productId}/`, { stock: newStock });
      toast.success(`Stock for "${productName}" updated to ${newStock}.`);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update stock.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Compute health indicators
  const outOfStock = products.filter(p => p.stock <= 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const inStock = products.filter(p => p.stock > 5).length;
  const totalUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);

  const columns = [
    {
      key: 'name',
      label: 'Product',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-slate-100 truncate max-w-[200px]">{val}</p>
          <p className="text-[11px] text-slate-500">{row.brand} · {row.category_detail?.name || '—'}</p>
        </div>
      ),
    },
    {
      key: 'stock',
      label: 'Current Stock',
      render: (val) => {
        if (val <= 0) return <StatusBadge status="Out of Stock" variant="danger" />;
        if (val <= 5) return <StatusBadge status={`${val} units — Low`} variant="warning" />;
        return <StatusBadge status={`${val} units`} variant="success" />;
      },
    },
    {
      key: 'is_available',
      label: 'Visibility',
      render: (val) => <StatusBadge status={val ? 'Live' : 'Hidden'} />,
    },
    {
      key: 'price',
      label: 'Price',
      render: (val) => `${Number(val).toLocaleString()} ETB`,
    },
    {
      key: 'id',
      label: 'Update Stock',
      align: 'right',
      render: (id, row) => (
        <div className="flex items-center justify-end gap-2">
          <input
            type="number"
            min="0"
            value={editStock[id] ?? row.stock}
            onChange={(e) =>
              setEditStock(prev => ({ ...prev, [id]: e.target.value }))
            }
            disabled={updatingId === id}
            className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100 text-center outline-none focus:border-emerald-500 disabled:opacity-50"
          />
          <button
            onClick={() => handleStockUpdate(id, row.name)}
            disabled={updatingId === id}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {updatingId === id ? '…' : 'Save'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">Stock Control</p>
        <h1 className="mt-1 text-2xl font-black text-slate-100">Inventory</h1>
        <p className="mt-1 text-sm text-slate-400">
          Monitor and update product stock levels. Low-stock items are highlighted.
        </p>
      </div>

      {/* ── Inventory Health Cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'In Stock',     value: inStock,     color: 'border-l-emerald-500', text: 'text-emerald-400' },
          { label: 'Low Stock',    value: lowStock,    color: 'border-l-amber-500',   text: 'text-amber-400' },
          { label: 'Out of Stock', value: outOfStock,  color: 'border-l-rose-500',    text: 'text-rose-400' },
          { label: 'Total Units',  value: totalUnits.toLocaleString(), color: 'border-l-indigo-500', text: 'text-indigo-400' },
        ].map(card => (
          <div key={card.label} className={`rounded-xl border-l-4 ${card.color} bg-slate-900/60 border border-slate-800 p-4`}>
            <p className="text-xs text-slate-500 uppercase tracking-wider">{card.label}</p>
            <p className={`text-2xl font-black mt-1 ${card.text}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* ── Out of Stock Alert ── */}
      {outOfStock > 0 && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-rose-300">
              {outOfStock} product{outOfStock !== 1 ? 's' : ''} out of stock
            </p>
            <p className="text-[10px] text-rose-400/80 mt-1">
              Update stock levels below to prevent lost sales.
            </p>
          </div>
        </div>
      )}

      {/* ── Inventory Table ── */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100">All Products</h2>
          <button
            onClick={loadProducts}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-slate-200 transition"
          >
            {loading ? 'Loading…' : '↻ Refresh'}
          </button>
        </div>

        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          emptyMessage="No products in inventory yet."
        />
      </section>

    </div>
  );
};

export default SellerInventory;
