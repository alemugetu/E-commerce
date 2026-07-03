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
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(INITIAL_PRODUCT_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formBusy, setFormBusy] = useState(false);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const { data } = await api.get('/products/');
      setProducts(data.results ?? data ?? []);
    } catch (err) {
      console.error('Load products error:', err.response);
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to load product inventory.';
      toast.error(errorMsg);
    }
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
    if (!user?.is_superuser) {
      toast.error('Only superusers can create products.');
      return;
    }
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

  const handleDelete = async (id, name, isActive) => {
    if (!user?.is_superuser) {
      toast.error('Only superusers can delete products.');
      return;
    }
    const action = isActive ? 'deactivate' : 'activate';
    const message = isActive
      ? `Deactivate "${name}"? It will be hidden from the store but preserved in order history.`
      : `Reactivate "${name}"? It will be visible in the store again.`;
    if (!window.confirm(message)) return;
    try {
      if (isActive) {
        await api.delete(`/products/${id}/`);
        toast.success(`"${name}" deactivated.`);
      } else {
        await api.patch(`/products/${id}/`, { is_active: true });
        toast.success(`"${name}" reactivated.`);
      }
      loadProducts();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Operation failed.';
      console.error('Product toggle error:', err.response);
      toast.error(errorMsg);
    }
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
        {user?.is_superuser ? (
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
        ) : (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
            <div className="text-center py-12">
              <p className="text-4xl mb-4">🔒</p>
              <h3 className="text-lg font-bold text-slate-100">Superuser Access Required</h3>
              <p className="text-sm text-slate-400 mt-2">Only superusers can create new products.</p>
            </div>
          </section>
        )}
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
                  <th className="py-2.5 pr-4 pl-1">Name</th><th className="py-2.5 pr-4">Price</th><th className="py-2.5 pr-4">Stock</th><th className="py-2.5 pr-4">Status</th><th className="py-2.5 pr-4">Active</th><th className="py-2.5 pl-1 text-right">Action</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-800/60">
                  {products.map(p => (
                    <tr key={p.id} className={`hover:bg-slate-800/30 transition-colors ${!p.is_active ? 'opacity-50' : ''}`}>
                      <td className="py-3 pr-4 pl-1 font-semibold text-slate-100 max-w-[160px] truncate">{p.name}</td>
                      <td className="py-3 pr-4 text-slate-300">{Number(p.price).toLocaleString()} ETB</td>
                      <td className="py-3 pr-4"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.stock > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{p.stock}</span></td>
                      <td className="py-3 pr-4"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.is_available ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-700 text-slate-500'}`}>{p.is_available ? 'Live' : 'Hidden'}</span></td>
                      <td className="py-3 pr-4"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{p.is_active ? 'Yes' : 'No'}</span></td>
                      <td className="py-3 pl-1 text-right">
                        {user?.is_superuser ? (
                          <button
                            onClick={() => handleDelete(p.id, p.name, p.is_active)}
                            className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                              p.is_active
                                ? 'border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                          >
                            {p.is_active ? 'Deactivate' : 'Reactivate'}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">Superuser only</span>
                        )}
                      </td>
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
  const [admins, setAdmins] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  const loadAdminUsers = useCallback(async () => {
    if (!user?.is_superuser) return;
    setLoadingAdmins(true);
    try {
      const { data } = await api.get('/custom-admin/users/manage/');
      setAdmins(data.results ?? []);
      setSummary(data.summary ?? null);
    } catch {
      toast.error('Unable to load admin-user roster.');
    } finally {
      setLoadingAdmins(false);
    }
  }, [user?.is_superuser]);

  useEffect(() => {
    loadAdminUsers();
  }, [loadAdminUsers]);

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
      loadAdminUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.detail || 'Failed to create admin account.');
    } finally { setBusy(false); }
  };

  const handleToggleActive = async (admin) => {
    try {
      await api.patch(`/custom-admin/users/${admin.id}/`, { is_active: !admin.is_active });
      toast.success(`${admin.email} ${admin.is_active ? 'blocked' : 'reactivated'}.`);
      loadAdminUsers();
    } catch {
      toast.error('Unable to update this admin account.');
    }
  };

  const handleDelete = async (admin) => {
    if (!window.confirm(`Remove ${admin.email} from admin access?`)) return;
    try {
      await api.delete(`/custom-admin/users/${admin.id}/`);
      toast.success(`${admin.email} removed from admin access.`);
      loadAdminUsers();
    } catch {
      toast.error('Unable to remove this admin account.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">Access Control</p>
        <h2 className="mt-1 text-2xl font-black text-slate-100">Admin User Provisioning</h2>
        <p className="mt-1 text-sm text-slate-400">Superusers can manage admin accounts, block access, and remove staff or superuser accounts.</p>
      </div>

      {!user?.is_superuser ? (
        <div className="rounded-2xl border border-amber-800/40 bg-amber-900/20 p-6 text-sm text-amber-300">
          <p className="font-bold mb-1">⚠ Superuser Access Required</p>
          <p className="text-amber-400/80">Only a superuser can manage admin accounts.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Total Admins</p>
              <p className="mt-2 text-2xl font-black text-slate-100">{summary?.total_admins ?? admins.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Staff Users</p>
              <p className="mt-2 text-2xl font-black text-slate-100">{summary?.staff_users ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Superusers</p>
              <p className="mt-2 text-2xl font-black text-slate-100">{summary?.superusers ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Inactive Admins</p>
              <p className="mt-2 text-2xl font-black text-slate-100">{summary?.inactive_admins ?? 0}</p>
            </div>
          </div>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
            <h3 className="text-base font-bold text-slate-100 mb-1">Create Admin Account</h3>
            <p className="text-xs text-slate-400 mb-5">Complete the form to create a new administrator with the selected permissions.</p>
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

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-100">Current Admin Accounts</h3>
                <p className="text-xs text-slate-400 mt-0.5">Block access or remove staff/superuser accounts from the system.</p>
              </div>
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400">{loadingAdmins ? 'Loading…' : `${admins.length} admins`}</span>
            </div>
            {loadingAdmins ? (
              <div className="space-y-2">{[1, 2, 3].map(i => <RowSkeleton key={i} />)}</div>
            ) : admins.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">No admin accounts found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      <th className="py-2.5 pr-4">Email</th>
                      <th className="py-2.5 pr-4">Role</th>
                      <th className="py-2.5 pr-4">Status</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {admins.map(admin => (
                      <tr key={admin.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 pr-4 font-semibold text-slate-100">{admin.email}</td>
                        <td className="py-3 pr-4 text-slate-300">{admin.is_superuser ? 'Superuser' : 'Staff'}</td>
                        <td className="py-3 pr-4">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${admin.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {admin.is_active ? 'Active' : 'Blocked'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleToggleActive(admin)} className="rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700">
                              {admin.is_active ? 'Block' : 'Reactivate'}
                            </button>
                            <button onClick={() => handleDelete(admin)} className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20">
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — Orders (admin order management)
// ══════════════════════════════════════════════════════════════════════════════
const OrdersTab = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ hasNext: false, hasPrev: false, total: 0 });
  const [updatingId, setUpdatingId] = useState(null);

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

  const loadOrders = useCallback(async (targetPage) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/admin/orders/?page=${targetPage}`);
      setOrders(data.results ?? []);
      setMeta({
        hasNext: !!data.next,
        hasPrev: !!data.previous,
        total:   data.count ?? 0,
      });
    } catch {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(page); }, [page, loadOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/orders/${orderId}/status/`, { status: newStatus });
      await loadOrders(page);
      toast.success('Order status updated.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">Order Management</p>
        <h2 className="mt-1 text-2xl font-black text-slate-100">All Orders</h2>
        <p className="mt-1 text-sm text-slate-400">View and manage all customer orders.</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-100">Order List</h3>
            <p className="text-xs text-slate-400 mt-0.5">All orders in the system.</p>
          </div>
          <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400">{loading ? 'Loading…' : `${meta.total} orders`}</span>
        </div>

        {loading ? (
          <div className="space-y-2">{[1, 2, 3].map(i => <RowSkeleton key={i} />)}</div>
        ) : orders.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  <th className="py-2.5 pr-4">Order ID</th>
                  <th className="py-2.5 pr-4">Customer</th>
                  <th className="py-2.5 pr-4">Contact</th>
                  <th className="py-2.5 pr-4">Date</th>
                  <th className="py-2.5 pr-4">Total</th>
                  <th className="py-2.5 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs text-slate-300">#{order.id}</td>
                    <td className="py-3 pr-4">
                      <div className="text-slate-100 font-medium text-sm">{order.customer_name || 'Unknown'}</div>
                      <div className="text-xs text-slate-400">{order.customer_email}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="text-xs text-slate-300">{order.customer_phone || 'N/A'}</div>
                      <div className="text-xs text-slate-400 truncate max-w-[150px]">{order.customer_address || 'N/A'}</div>
                    </td>
                    <td className="py-3 pr-4 text-slate-300">{order.formatted_date}</td>
                    <td className="py-3 pr-4 font-semibold text-slate-100">{Number(order.total_amount).toLocaleString()} ETB</td>
                    <td className="py-3 pr-4">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${statusStyle(order.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Paid">Paid</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(meta.hasNext || meta.hasPrev) && (
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-800">
            <button
              disabled={!meta.hasPrev}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="text-xs font-bold px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← Previous
            </button>
            <span className="text-xs font-bold text-slate-500">Page {page}</span>
            <button
              disabled={!meta.hasNext}
              onClick={() => setPage(p => p + 1)}
              className="text-xs font-bold px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// TAB 5 — Customers (approval workflow)
// ══════════════════════════════════════════════════════════════════════════════
const CustomersTab = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadCustomers = useCallback(async () => {
    if (!user?.is_staff && !user?.is_superuser) return;
    setLoading(true);
    try {
      const { data } = await api.get('/auth/customers/');
      setCustomers(data.results ?? []);
      setSummary(data.summary ?? null);
    } catch {
      toast.error('Unable to load customer approvals.');
    } finally {
      setLoading(false);
    }
  }, [user?.is_staff, user?.is_superuser]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const handleApprove = async (customer) => {
    try {
      await api.patch(`/auth/customers/${customer.id}/`, { approval_status: 'approved' });
      toast.success(`${customer.email} approved.`);
      loadCustomers();
    } catch {
      toast.error('Unable to update approval status.');
    }
  };

  const handleReject = async (customer) => {
    try {
      await api.patch(`/auth/customers/${customer.id}/`, { approval_status: 'rejected' });
      toast.success(`${customer.email} rejected.`);
      loadCustomers();
    } catch {
      toast.error('Unable to update approval status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">Customer Access</p>
        <h2 className="mt-1 text-2xl font-black text-slate-100">Approval Workflow</h2>
        <p className="mt-1 text-sm text-slate-400">Staff can review new customer signups and approve or reject access.</p>
      </div>

      {!user?.is_staff && !user?.is_superuser ? (
        <div className="rounded-2xl border border-amber-800/40 bg-amber-900/20 p-6 text-sm text-amber-300">
          <p className="font-bold mb-1">⚠ Staff Access Required</p>
          <p className="text-amber-400/80">Only staff or superusers can review customer approvals.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Total Customers</p>
              <p className="mt-2 text-2xl font-black text-slate-100">{summary?.total ?? customers.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Pending</p>
              <p className="mt-2 text-2xl font-black text-slate-100">{summary?.pending ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Approved</p>
              <p className="mt-2 text-2xl font-black text-slate-100">{summary?.approved ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Rejected</p>
              <p className="mt-2 text-2xl font-black text-slate-100">{summary?.rejected ?? 0}</p>
            </div>
          </div>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-100">Customer Requests</h3>
                <p className="text-xs text-slate-400 mt-0.5">Approve or reject new customer accounts.</p>
              </div>
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400">{loading ? 'Loading…' : `${customers.length} accounts`}</span>
            </div>
            {loading ? (
              <div className="space-y-2">{[1, 2, 3].map(i => <RowSkeleton key={i} />)}</div>
            ) : customers.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">No customer accounts pending review.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      <th className="py-2.5 pr-4">Email</th>
                      <th className="py-2.5 pr-4">Name</th>
                      <th className="py-2.5 pr-4">Status</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {customers.map(customer => (
                      <tr key={customer.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 pr-4 font-semibold text-slate-100">{customer.email}</td>
                        <td className="py-3 pr-4 text-slate-300">{[customer.first_name, customer.last_name].filter(Boolean).join(' ') || '—'}</td>
                        <td className="py-3 pr-4">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${customer.approval_status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : customer.approval_status === 'rejected' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {customer.approval_status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleApprove(customer)} className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20">
                              Approve
                            </button>
                            <button onClick={() => handleReject(customer)} className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20">
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
      {activeTab === 'orders' && <OrdersTab />}
      {activeTab === 'customers' && <CustomersTab />}
      {activeTab === 'admin-users' && <AdminUsersTab />}
    </div>
  );
};

export default AdminDashboard;
