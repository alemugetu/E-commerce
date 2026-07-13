import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { DataTable, StatusBadge, ConfirmModal } from '../../components/shared';
import toast from 'react-hot-toast';
import { Edit, Plus, X } from 'lucide-react';

/**
 * SuperuserCategories — Product category management for /admin/categories
 * 
 * Features:
 *   - Create new top-level and sub-categories
 *   - Edit existing categories
 *   - Delete categories (with confirmation + impact warning)
 *   - View product count per category
 * 
 * APIs:
 *   GET    /api/products/categories/     → list
 *   POST   /api/products/categories/     → create
 *   PATCH  /api/products/categories/<id>/ → update
 *   DELETE /api/products/categories/<id>/ → delete
 */

const EMPTY_FORM = { name: '', parent: '' };

const inputCls = 'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950/80 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none focus:border-purple-500 dark:focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition';
const labelCls = 'mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400';

const SuperuserCategories = () => {
  const [categories, setCategories] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [formBusy, setFormBusy] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false, categoryId: null, categoryName: '', productCount: 0, isLoading: false,
  });

  // ── Flatten nested categories for parent selector ────────────────────────
  const flattenCategories = useCallback((cats, depth = 0) => {
    const result = [];
    cats.forEach(cat => {
      result.push({ ...cat, _depth: depth });
      if (cat.children?.length > 0) {
        result.push(...flattenCategories(cat.children, depth + 1));
      }
    });
    return result;
  }, []);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products/categories/');
      const cats = data.results ?? data ?? [];
      setCategories(cats);
      setFlatCategories(flattenCategories(cats));
    } catch {
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, [flattenCategories]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, parent: cat.parent ?? '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormBusy(true);
    const payload = { name: form.name };
    if (form.parent) payload.parent = form.parent;

    try {
      if (editingId) {
        await api.patch(`/products/categories/${editingId}/`, payload);
        toast.success(`Category "${form.name}" updated.`);
      } else {
        await api.post('/products/categories/', payload);
        toast.success(`Category "${form.name}" created.`);
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      loadCategories();
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(' ')
        : 'Operation failed.';
      toast.error(msg);
    } finally {
      setFormBusy(false);
    }
  };

  const openDeleteModal = (cat) => {
    setDeleteModal({
      open: true,
      categoryId: cat.id,
      categoryName: cat.name,
      productCount: cat.product_count ?? 0,
      isLoading: false,
    });
  };

  const handleConfirmDelete = async () => {
    setDeleteModal(prev => ({ ...prev, isLoading: true }));
    try {
      await api.delete(`/products/categories/${deleteModal.categoryId}/`);
      toast.success(`"${deleteModal.categoryName}" deleted.`);
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Cannot delete this category. It may have products assigned to it.');
    } finally {
      setDeleteModal({ open: false, categoryId: null, categoryName: '', productCount: 0, isLoading: false });
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'name',
      label: 'Category',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">{val}</p>
          <p className="text-xs font-mono text-slate-600 dark:text-slate-500">{row.slug}</p>
        </div>
      ),
    },
    {
      key: 'parent',
      label: 'Parent',
      render: (val) => {
        if (!val) return <span className="text-xs text-slate-600 dark:text-slate-500 italic">Root</span>;
        const parent = flatCategories.find(c => c.id === val);
        return <span className="text-xs text-slate-900 dark:text-slate-300">{parent?.name ?? `ID:${val}`}</span>;
      },
    },
    {
      key: 'product_count',
      label: 'Products',
      render: (val) => (
        <StatusBadge
          status={`${val ?? 0} products`}
          variant={val > 0 ? 'success' : 'neutral'}
        />
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      align: 'right',
      render: (id, row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleEditClick(row)}
            className="rounded-lg border border-indigo-500/20 dark:border-indigo-500/20 bg-indigo-500/10 dark:bg-indigo-500/10 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/20 dark:hover:bg-indigo-500/20 transition"
          >
            Edit
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="rounded-lg border border-rose-500/20 dark:border-rose-500/20 bg-rose-500/10 dark:bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 dark:hover:bg-rose-500/20 transition"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400">Catalog Structure</p>
        <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">Categories</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage the product taxonomy. Categories support nesting (parent → children).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">

        {/* ── Create / Edit Form ── */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {editingId ? (
                <>
                  <Edit className="w-4 h-4" />
                  Edit Category
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  New Category
                </>
              )}
            </h2>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Category Name *</label>
              <input
                type="text" name="name" value={form.name}
                onChange={handleChange} className={inputCls}
                placeholder="e.g., Electronics" required
              />
            </div>
            <div>
              <label className={labelCls}>Parent Category</label>
              <select
                name="parent" value={form.parent}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="">— Top level (no parent) —</option>
                {flatCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {'  '.repeat(cat._depth)}{cat._depth > 0 ? '└ ' : ''}{cat.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-slate-600 dark:text-slate-500">
                Leave blank to create a root-level category.
              </p>
            </div>
            <button
              type="submit" disabled={formBusy}
              className="w-full rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {formBusy
                ? (editingId ? 'Saving…' : 'Creating…')
                : (editingId ? 'Save Changes' : 'Create Category')
              }
            </button>
          </form>
        </section>

        {/* ── Categories Table ── */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">All Categories</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {loading ? 'Loading…' : `${flatCategories.length} categories total`}
              </p>
            </div>
            <button
              onClick={loadCategories}
              disabled={loading}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition"
            >
              {loading ? '…' : '↻ Refresh'}
            </button>
          </div>

          <DataTable
            columns={columns}
            data={flatCategories}
            loading={loading}
            emptyMessage="No categories yet. Create one to start organising your catalog."
          />
        </section>
      </div>

      {/* ── Delete Confirm Modal ── */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal(prev => ({ ...prev, open: false }))}
        onConfirm={handleConfirmDelete}
        isLoading={deleteModal.isLoading}
        variant="danger"
        title="Delete Category"
        message={
          deleteModal.productCount > 0
            ? `"${deleteModal.categoryName}" has ${deleteModal.productCount} product(s) assigned. You must reassign them before deleting this category.`
            : `Delete "${deleteModal.categoryName}"? This cannot be undone.`
        }
        confirmText={deleteModal.productCount > 0 ? 'Got It' : 'Yes, Delete'}
      />

    </div>
  );
};

export default SuperuserCategories;
