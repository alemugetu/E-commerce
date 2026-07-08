import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DataTable, StatusBadge, ConfirmModal } from '../../components/shared';
import toast from 'react-hot-toast';

// ─── Constants ──────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '', slug: '', description: '', price: '',
  discount_price: '', stock: '', category: '', brand: '', is_available: true,
};

const buildSlug = (n) =>
  n.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const inputCls =
  'w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition';
const labelCls =
  'mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400';

/**
 * SellerProducts — Full product management for /seller/products
 * 
 * Features:
 *   - Create new products with optional image upload
 *   - Inline edit existing products
 *   - Soft-delete (deactivate) with ConfirmModal
 *   - Reactivate deactivated products
 *   - Real-time inventory table
 */
const SellerProducts = () => {
  const { user } = useAuth();

  // ── State ────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [formBusy, setFormBusy] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // ConfirmModal state
  const [confirmModal, setConfirmModal] = useState({
    open: false, productId: null, productName: '', isActive: false, isLoading: false,
  });

  // ── Data Loading ─────────────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const { data } = await api.get('/products/');
      setProducts(data.results ?? data ?? []);
    } catch {
      toast.error('Failed to load products.');
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    api.get('/products/categories/')
      .then(({ data }) => setCategories(data.results ?? data ?? []))
      .catch(() => {});
  }, [loadProducts]);

  // ── Form Handlers ────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      price: product.price || '',
      discount_price: product.discount_price || '',
      stock: product.stock ?? '',
      category: product.category || '',
      brand: product.brand || '',
      is_available: product.is_available ?? true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setSelectedFile(null);
  };

  // ── Submit (Create or Update) ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormBusy(true);

    // Resolve or create the category
    let categoryId = formData.category;
    const existingCat = categories.find(
      c => c.name.toLowerCase() === String(formData.category).toLowerCase()
        || c.id.toString() === String(formData.category)
    );
    if (existingCat) {
      categoryId = existingCat.id;
    } else if (formData.category) {
      try {
        const { data: newCat } = await api.post('/products/categories/', { name: formData.category });
        categoryId = newCat.id;
        setCategories(prev => [...prev, newCat]);
      } catch {
        toast.error('Failed to create category.');
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
      if (editingId) {
        // ── Update existing product ──
        await api.put(`/seller/products/${editingId}/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(`"${formData.name}" updated successfully.`);
      } else {
        // ── Create new product ──
        const { data } = await api.post('/products/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(`"${data.name}" added to the catalog.`);
      }

      setFormData(EMPTY_FORM);
      setSelectedFile(null);
      setEditingId(null);
      const el = document.getElementById('product-image-input');
      if (el) el.value = '';
      loadProducts();
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(' ')
        : 'Operation failed. Please try again.';
      toast.error(msg);
    } finally {
      setFormBusy(false);
    }
  };

  // ── Confirm Deactivate / Reactivate ─────────────────────────────────────
  const openConfirm = (product) => {
    setConfirmModal({
      open: true,
      productId: product.id,
      productName: product.name,
      isActive: product.is_active,
      isLoading: false,
    });
  };

  const handleConfirmToggle = async () => {
    setConfirmModal(prev => ({ ...prev, isLoading: true }));
    try {
      await api.delete(`/seller/products/${confirmModal.productId}/`);
      toast.success(
        confirmModal.isActive
          ? `"${confirmModal.productName}" deactivated.`
          : `"${confirmModal.productName}" reactivated.`
      );
      loadProducts();
    } catch {
      toast.error('Failed to update product status.');
    } finally {
      setConfirmModal({ open: false, productId: null, productName: '', isActive: false, isLoading: false });
    }
  };

  // ── Table Column Definition ──────────────────────────────────────────────
  const columns = [
    {
      key: 'name',
      label: 'Product',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-slate-100 truncate max-w-[160px]">{val}</p>
          <p className="text-[11px] text-slate-500 truncate max-w-[160px]">{row.brand}</p>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (val, row) => (
        <div>
          <p className="text-slate-200">{Number(val).toLocaleString()} ETB</p>
          {row.discount_price && (
            <p className="text-[11px] text-emerald-400">
              {Number(row.discount_price).toLocaleString()} ETB sale
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (val) => (
        <StatusBadge
          status={val > 0 ? `${val} units` : 'Out of Stock'}
          variant={val > 0 ? 'success' : 'danger'}
        />
      ),
    },
    {
      key: 'is_available',
      label: 'Visibility',
      render: (val) => <StatusBadge status={val ? 'Live' : 'Hidden'} />,
    },
    {
      key: 'is_active',
      label: 'Active',
      render: (val) => <StatusBadge status={val ? 'Active' : 'Inactive'} />,
    },
    {
      key: 'id',
      label: 'Actions',
      align: 'right',
      render: (id, row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleEditClick(row)}
            className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20 transition"
          >
            Edit
          </button>
          <button
            onClick={() => openConfirm(row)}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
              row.is_active
                ? 'border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            {row.is_active ? 'Deactivate' : 'Reactivate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">Catalog</p>
        <h1 className="mt-1 text-2xl font-black text-slate-100">Products Management</h1>
        <p className="mt-1 text-sm text-slate-400">
          {editingId ? 'Editing an existing product.' : 'Create new products and manage existing inventory.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1.5fr]">

        {/* ── Create / Edit Form ── */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 h-fit">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {editingId ? '✏️ Edit Product' : '➕ New Product'}
              </h2>
              {editingId && (
                <p className="text-xs text-emerald-400 mt-0.5">ID #{editingId}</p>
              )}
            </div>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="text-xs text-slate-400 hover:text-slate-200 transition"
              >
                ✕ Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Product Name *</label>
                <input type="text" name="name" value={formData.name}
                  onChange={handleChange} className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>
                  Slug <span className="normal-case font-normal text-slate-500">(auto if blank)</span>
                </label>
                <input type="text" name="slug" value={formData.slug}
                  onChange={handleChange}
                  placeholder={formData.name ? buildSlug(formData.name) : 'auto-generated'}
                  className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Description *</label>
              <textarea name="description" value={formData.description}
                onChange={handleChange} rows={3}
                className={`${inputCls} resize-none`} required />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Price (ETB) *</label>
                <input type="number" min="0.01" step="0.01" name="price"
                  value={formData.price} onChange={handleChange} className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Discount Price</label>
                <input type="number" min="0" step="0.01" name="discount_price"
                  value={formData.discount_price} onChange={handleChange}
                  placeholder="Optional" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Stock *</label>
                <input type="number" min="0" name="stock" value={formData.stock}
                  onChange={handleChange} className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Brand *</label>
                <input type="text" name="brand" value={formData.brand}
                  onChange={handleChange} className={inputCls} required />
              </div>
            </div>

            <div>
              <label className={labelCls}>Category *</label>
              <input
                type="text" name="category" value={formData.category}
                onChange={handleChange} list="category-options"
                className={inputCls} placeholder="Select or type new category" required
              />
              <datalist id="category-options">
                {categories.map(c => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input type="checkbox" name="is_available" checked={formData.is_available}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-950 accent-emerald-500" />
                Available for sale
              </label>
              <div className="flex-1 sm:max-w-xs">
                <label className={labelCls}>Product Image</label>
                <input
                  id="product-image-input" type="file" accept="image/*"
                  onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-xs text-slate-400 file:mr-3 file:rounded-full file:border-0 file:bg-emerald-600/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-300 hover:file:bg-emerald-600/30 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit" disabled={formBusy}
              className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {formBusy
                ? (editingId ? 'Saving Changes…' : 'Creating…')
                : (editingId ? 'Save Changes' : 'Create Product')
              }
            </button>
          </form>
        </section>

        {/* ── Live Inventory Table ── */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-100">Live Inventory</h2>
              <p className="text-xs text-slate-400 mt-0.5">All products in the catalog.</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
              loadingProducts
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {loadingProducts ? 'Syncing…' : `${products.length} items`}
            </span>
          </div>

          <DataTable
            columns={columns}
            data={products}
            loading={loadingProducts}
            emptyMessage="No products yet — use the form to add the first one."
          />
        </section>
      </div>

      {/* ── Confirm Modal ── */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
        onConfirm={handleConfirmToggle}
        isLoading={confirmModal.isLoading}
        variant={confirmModal.isActive ? 'danger' : 'info'}
        title={confirmModal.isActive ? 'Deactivate Product' : 'Reactivate Product'}
        message={
          confirmModal.isActive
            ? `"${confirmModal.productName}" will be hidden from the store. Order history is preserved.`
            : `"${confirmModal.productName}" will become visible in the store again.`
        }
        confirmText={confirmModal.isActive ? 'Yes, Deactivate' : 'Yes, Reactivate'}
      />

    </div>
  );
};

export default SellerProducts;
