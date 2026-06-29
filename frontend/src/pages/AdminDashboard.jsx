import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAdminTab } from '../context/AdminTabContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────
const INITIAL_PRODUCT_FORM = {
  name: '', slug: '', description: '', price: '',
  discount_price: '', stock: '', category: '', brand: '', is_available: true,
};
const INITIAL_ADMIN_FORM = {
  email: '', password: '', first_name: '', last_name: '',
  is_staff: true, is_superuser: false,
};
const buildSlug = (n) => n.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const inputCls = 'w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition';
const labelCls = 'mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400';

// ─── Skeleton helpers ─────────────────────────────────────────────────────────
const MetricSkeleton = () => (
  <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5 animate-pulse">
    <div className="h-3 w-28 rounded bg-slate-700 mb-4" />
    <div className="h-7 w-20 rounded bg-slate-700" />
    <div className="h-3 w-16 rounded bg-slate-700/60 mt-2" />
  </div>
);
const RowSkeleton = () => (
  <div className="h-10 w-full animate-pulse rounded-lg bg-slate-800/60" />
);

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — Overview (metrics cards only)
// ══════════════════════════════════════════════════════════════════════════════
const OverviewTab = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/custom-admin/metrics/');
      setMetrics(data);
    } catch { setMetrics(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cards = [
    { label: 'Total Products', value: metrics?.total_products ?? '—', sub: `${metrics?.available_products ?? 0} available`, tone: 'from-indigo-500 to-indigo-700' },
    { label: 'Out of Stock', value: metrics?.out_of_stock_products ?? '—', sub: `${metrics?.total_inventory_units ?? 0} units total`, tone: 'from-amber-500 to-orange-600' },
    { label: 'Total Revenue', value: metrics ? `ETB ${Number(metrics.total_sales).toLocaleString()}` : '—', sub: `${metrics?.paid_orders ?? 0} paid orders`, tone: 'from-emerald-500 to-teal-600' },
    { label: 'Pending Orders', value: metrics?.pending_orders ?? '—', sub: `${metrics?.processing_orders ?? 0} processing`, tone: 'from-slate-600 to-slate-800' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">Overview</p>
        <h2 className="mt-1 text-2xl font-black text-slate-100">Dashboard Metrics</h2>
        <p className="mt-1 text-sm text-slate-400">Live aggregates pulled from the database.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? [1, 2, 3, 4].map(i => <MetricSkeleton key={i} />)
          : cards.map(c => (
            <div key={c.label} className={`rounded-2xl border border-white/10 bg-gradient-to-br ${c.tone} p-5 text-white shadow-lg`}>
              <p className="text-xs font-semibold text-white/75">{c.label}</p>
              <p className="mt-3 text-2xl font-black">{c.value}</p>
              <p className="mt-1 text-xs text-white/60">{c.sub}</p>
            </div>
          ))
        }
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <p className="text-sm font-semibold text-slate-300 mb-1">Quick Actions</p>
        <p className="text-xs text-slate-500">Use the sidebar to navigate to Products management or Admin User provisioning.</p>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Products (create form + inventory table)
// ══════════════════════════════════════════════════════════════════════════════
const ProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(INITIAL_PRODUCT_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formBusy, setFormBusy] = useState(false);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try { const { data } = await api.get('/products/'); setProducts(data.results ?? data ?? []); }
    catch { toast.error('Failed to load product inventory.'); }
    finally { setProductsLoading(false); }
  }, []);

  useEffect(() => {
    loadProducts();
    api.get('/products/categories/').then(({ data }) => setCategories(data.results ?? data ?? [])).catch(() => { });
  }, [loadProducts]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormBusy(true);

    let categoryId = formData.category;
    const existingCategory = categories.find(
      c => c.name.toLowerCase() === String(formData.category).toLowerCase() || c.id.toString() === String(formData.category)
    );

    if (existingCategory) {
      categoryId = existingCategory.id;
    } else if (formData.category) {
      try {
        const { data: newCat } = await api.post('/products/categories/', { name: formData.category });
        categoryId = newCat.id;
        setCategories(prev => [...prev, newCat]);
      } catch (err) {
        toast.error('Failed to create new category.');
        setFormBusy(false);
        return;
      }
    }

    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('slug', formData.slug ? buildSlug(formData.slug) : buildSlug(formData.name));
    fd.append('description', formData.description);
    fd.append('price', formData.price);
    fd.append('stock', formData.stock);
    fd.append('category', categoryId);
    fd.append('brand', formData.brand);
    fd.append('is_available', String(formData.is_available));
    if (formData.discount_price) fd.append('discount_price', formData.discount_price);
    if (selectedFile) fd.append('image', selectedFile);
    try {
      const { data } = await api.post('/products/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`"${data.name}" added to the catalog.`);
      setFormData(INITIAL_PRODUCT_FORM); setSelectedFile(null);
      const el = document.getElementById('product-image-input'); if (el) el.value = '';
      loadProducts();
    } catch (err) {
      const msg = err.response?.data ? Object.values(err.response.data).flat().join(' ') : 'Failed to create the product.';
      toast.error(msg);
    } finally { setFormBusy(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try { await api.delete(`/products/${id}/`); toast.success(`"${name}" removed.`); loadProducts(); }
    catch { toast.error('Delete failed — check permissions.'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">Catalog</p>
        <h2 className="mt-1 text-2xl font-black text-slate-100">Products Management</h2>
        <p className="mt-1 text-sm text-slate-400">Create new products and manage existing inventory.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.1fr]">
        {/* ── Create form ── */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
          <h3 className="text-base font-bold text-slate-100 mb-1">Record New Product</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><label className={labelCls}>Product Name *</label><input type="text" name="name" value={formData.name} onChange={handleChange} className={inputCls} required /></div>
              <div><label className={labelCls}>Slug <span className="normal-case font-normal text-slate-500">(auto if blank)</span></label><input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder={formData.name ? buildSlug(formData.name) : 'auto-generated'} className={inputCls} /></div>
            </div>
            <div><label className={labelCls}>Description *</label><textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputCls + ' resize-none'} required /></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><label className={labelCls}>Price (ETB) *</label><input type="number" min="0.01" step="0.01" name="price" value={formData.price} onChange={handleChange} className={inputCls} required /></div>
              <div><label className={labelCls}>Discount Price</label><input type="number" min="0" step="0.01" name="discount_price" value={formData.discount_price} onChange={handleChange} placeholder="Optional" className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><label className={labelCls}>Stock *</label><input type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} className={inputCls} required /></div>
              <div><label className={labelCls}>Brand *</label><input type="text" name="brand" value={formData.brand} onChange={handleChange} className={inputCls} required /></div>
            </div>
            <div>
              <label className={labelCls}>Category *</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                list="category-options"
                className={inputCls}
                placeholder="Select or type new category"
                required
              />
              <datalist id="category-options">
                {categories.map(c => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input type="checkbox" name="is_available" checked={formData.is_available} onChange={handleChange} className="h-4 w-4 rounded border-slate-600 bg-slate-950 accent-indigo-500" />
                Available for sale
              </label>
              <div className="flex-1 sm:max-w-xs">
                <label className={labelCls}>Product Image</label>
                <input id="product-image-input" type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] ?? null)} className="block w-full text-xs text-slate-400 file:mr-3 file:rounded-full file:border-0 file:bg-indigo-600/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-300 hover:file:bg-indigo-600/30 cursor-pointer" />
              </div>
            </div>
            <button type="submit" disabled={formBusy} className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">
              {formBusy ? 'Uploading…' : 'Create Product'}
            </button>
          </form>
        </section>
        {/* ── Inventory table ── */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div><h3 className="text-base font-bold text-slate-100">Live Inventory</h3><p className="text-xs text-slate-400 mt-0.5">All products in the database.</p></div>
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${productsLoading ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{productsLoading ? 'Syncing…' : `${products.length} items`}</span>
          </div>
          {productsLoading ? <div className="space-y-2">{[1, 2, 3, 4].map(i => <RowSkeleton key={i} />)}</div>
            : products.length === 0 ? <div className="py-16 text-center text-sm text-slate-500">No products yet — use the form to add the first one.</div>
              : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                <thead><tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  <th className="py-2.5 pr-4 pl-1">Name</th><th className="py-2.5 pr-4">Price</th><th className="py-2.5 pr-4">Stock</th><th className="py-2.5 pr-4">Status</th><th className="py-2.5 pl-1 text-right">Action</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-800/60">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 pr-4 pl-1 font-semibold text-slate-100 max-w-[160px] truncate">{p.name}</td>
                      <td className="py-3 pr-4 text-slate-300">{Number(p.price).toLocaleString()} ETB</td>
                      <td className="py-3 pr-4"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.stock > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{p.stock}</span></td>
                      <td className="py-3 pr-4"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.is_available ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-700 text-slate-500'}`}>{p.is_available ? 'Live' : 'Hidden'}</span></td>
                      <td className="py-3 pl-1 text-right"><button onClick={() => handleDelete(p.id, p.name)} className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20">Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table></div>}
        </section>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Admin Users (superuser-only provisioning form)
// ══════════════════════════════════════════════════════════════════════════════
const AdminUsersTab = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(INITIAL_ADMIN_FORM);
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/custom-admin/users/', form);
      toast.success(`Admin account created for ${data.email}.`);
      setForm(INITIAL_ADMIN_FORM);
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.detail || 'Failed to create admin account.');
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">Access Control</p>
        <h2 className="mt-1 text-2xl font-black text-slate-100">Admin User Provisioning</h2>
        <p className="mt-1 text-sm text-slate-400">Grant staff or superuser privileges to management accounts.</p>
      </div>

      {!user?.is_staff ? (
        <div className="rounded-2xl border border-amber-800/40 bg-amber-900/20 p-6 text-sm text-amber-300">
          <p className="font-bold mb-1">&#x26A0; Staff Access Required</p>
          <p className="text-amber-400/80">You need staff access to provision new admin accounts.</p>
        </div>
      ) : (
        <div className="max-w-lg">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
            <h3 className="text-base font-bold text-slate-100 mb-1">Create Admin Account</h3>
            <p className="text-xs text-slate-400 mb-5">New accounts are created via <code className="text-indigo-400">POST /api/custom-admin/users/</code></p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className={labelCls}>Email *</label><input type="email" name="email" value={form.email} onChange={handleChange} className={inputCls} required /></div>
                <div><label className={labelCls}>Password *</label><input type="password" name="password" value={form.password} onChange={handleChange} className={inputCls} required /></div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className={labelCls}>First Name</label><input type="text" name="first_name" value={form.first_name} onChange={handleChange} className={inputCls} /></div>
                <div><label className={labelCls}>Last Name</label><input type="text" name="last_name" value={form.last_name} onChange={handleChange} className={inputCls} /></div>
              </div>
              <div className="flex flex-wrap gap-5 pt-1">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" name="is_staff" checked={form.is_staff} onChange={handleChange} className="h-4 w-4 rounded border-slate-600 bg-slate-950 accent-indigo-500" />
                  Staff access
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" name="is_superuser" checked={form.is_superuser} onChange={handleChange} className="h-4 w-4 rounded border-slate-600 bg-slate-950 accent-indigo-500" />
                  Superuser access
                </label>
              </div>
              <button type="submit" disabled={busy} className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60">
                {busy ? 'Creating…' : 'Create Admin User'}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ROOT — reads activeTab from AdminLayout context and renders exactly one tab
// ══════════════════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const { activeTab } = useAdminTab();

  return (
    <div className="min-h-full">
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'products' && <ProductsTab />}
      {activeTab === 'admin-users' && <AdminUsersTab />}
    </div>
  );
};

export default AdminDashboard;
