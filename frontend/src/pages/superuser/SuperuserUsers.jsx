import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DataTable, StatusBadge, ConfirmModal, MetricCard } from '../../components/shared';
import toast from 'react-hot-toast';

/**
 * SuperuserUsers — Seller & Superuser account management for /admin/users
 * 
 * Features:
 *   - Provision new seller or superuser accounts
 *   - View all privileged accounts with roles
 *   - Block / reactivate accounts
 *   - Permanently remove accounts (with ConfirmModal)
 * 
 * APIs:
 *   POST   /api/superuser/users/         → create seller/superuser
 *   GET    /api/superuser/users/manage/  → list all privileged users
 *   PATCH  /api/superuser/users/<id>/    → update role/status
 *   DELETE /api/superuser/users/<id>/    → remove account
 */

const ROLES = [
  { value: 'Seller', label: 'Seller', is_staff: true, is_superuser: false, desc: 'Seller (store management)' },
  { value: 'Superuser', label: 'Superuser', is_staff: true, is_superuser: true, desc: 'Superuser (full platform access)' },
  { value: 'Warehouse Manager', label: 'Warehouse Manager', is_staff: true, is_superuser: false, desc: 'Warehouse Manager (inventory & warehouse management)' },
  { value: 'Finance Manager', label: 'Finance Manager', is_staff: true, is_superuser: false, desc: 'Finance Manager (billing, payments & sales reports)' },
  { value: 'Marketing Manager', label: 'Marketing Manager', is_staff: true, is_superuser: false, desc: 'Marketing Manager (promotions, products & campaign tracking)' },
  { value: 'Customer Support', label: 'Customer Support', is_staff: true, is_superuser: false, desc: 'Customer Support (ticket tracking & customer accounts)' },
  { value: 'Delivery Manager', label: 'Delivery Manager', is_staff: true, is_superuser: false, desc: 'Delivery Manager (order fulfillment & shipping)' },
  { value: 'Content Manager', label: 'Content Manager', is_staff: true, is_superuser: false, desc: 'Content Manager (catalog content, categories & blogs)' },
];

const EMPTY_FORM = {
  email: '', password: '', first_name: '', last_name: '',
  is_staff: true, is_superuser: false, role_group: 'Seller',
};

const inputCls = 'w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition';
const labelCls = 'mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400';

const SuperuserUsers = () => {
  const { user: currentUser } = useAuth();

  // ── State ────────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formBusy, setFormBusy] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false, userId: null, userEmail: '', isLoading: false,
  });

  // ── Data Loading ─────────────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get('/superuser/users/manage/');
      setUsers(data.results ?? []);
      setSummary(data.summary ?? null);
    } catch {
      toast.error('Failed to load team members.');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // ── Form Handlers ────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      // Superuser must always have is_staff
      if (name === 'is_superuser' && checked) updated.is_staff = true;
      return updated;
    });
  };

  const handleRoleChange = (e) => {
    const val = e.target.value;
    const roleDef = ROLES.find(r => r.value === val) || ROLES[0];
    setForm(prev => ({
      ...prev,
      role_group: val,
      is_staff: roleDef.is_staff,
      is_superuser: roleDef.is_superuser,
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormBusy(true);
    try {
      const { data } = await api.post('/superuser/users/', form);
      toast.success(`${data.role} account created for ${data.email}`);
      setForm(EMPTY_FORM);
      loadUsers();
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Failed to create account.'
      );
    } finally {
      setFormBusy(false);
    }
  };

  // ── Toggle Active ─────────────────────────────────────────────────────────
  const handleToggleActive = async (targetUser) => {
    try {
      await api.patch(`/superuser/users/${targetUser.id}/`, {
        is_active: !targetUser.is_active,
      });
      toast.success(
        targetUser.is_active
          ? `${targetUser.email} blocked.`
          : `${targetUser.email} reactivated.`
      );
      loadUsers();
    } catch {
      toast.error('Failed to update account status.');
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const openDeleteModal = (targetUser) => {
    setDeleteModal({ open: true, userId: targetUser.id, userEmail: targetUser.email, isLoading: false });
  };

  const handleConfirmDelete = async () => {
    setDeleteModal(prev => ({ ...prev, isLoading: true }));
    try {
      await api.delete(`/superuser/users/${deleteModal.userId}/`);
      toast.success(`${deleteModal.userEmail} has been removed.`);
      loadUsers();
    } catch {
      toast.error('Failed to remove account.');
    } finally {
      setDeleteModal({ open: false, userId: null, userEmail: '', isLoading: false });
    }
  };

  // ── Table Columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'email',
      label: 'Account',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-slate-100">
            {row.first_name || row.last_name
              ? `${row.first_name || ''} ${row.last_name || ''}`.trim()
              : 'No Name'}
          </p>
          <p className="text-xs text-slate-500">{val}</p>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (val) => (
        <StatusBadge
          status={val}
          variant={val === 'Superuser' ? 'danger' : 'info'}
        />
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (val) => <StatusBadge status={val ? 'Active' : 'Blocked'} />,
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
    },
    {
      key: 'id',
      label: 'Actions',
      align: 'right',
      render: (id, row) => {
        // Prevent self-modification
        if (id === currentUser?.id) {
          return <span className="text-xs text-slate-500 italic">Current user</span>;
        }
        return (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => handleToggleActive(row)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
            >
              {row.is_active ? 'Block' : 'Reactivate'}
            </button>
            <button
              onClick={() => openDeleteModal(row)}
              className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition"
            >
              Remove
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-purple-400">Team Management</p>
        <h1 className="mt-1 text-2xl font-black text-slate-100">User Management</h1>
        <p className="mt-1 text-sm text-slate-400">
          Provision seller and superuser accounts. Manage roles and access status.
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Members', value: summary?.total ?? 0,      tone: 'from-purple-500 to-purple-700', icon: '👥' },
          { label: 'Sellers',       value: summary?.sellers ?? 0,    tone: 'from-emerald-500 to-teal-600',  icon: '🏪' },
          { label: 'Superusers',    value: summary?.superusers ?? 0, tone: 'from-indigo-500 to-indigo-700', icon: '🔑' },
          { label: 'Blocked',       value: summary?.inactive ?? 0,   tone: 'from-rose-500 to-rose-700',     icon: '🚫' },
        ].map(card => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            tone={card.tone}
            icon={card.icon}
            loading={loadingUsers && !summary}
          />
        ))}
      </div>

      {/* ── Create Account Form ── */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <h2 className="text-base font-bold text-slate-100 mb-1">Create Account</h2>
        <p className="text-xs text-slate-400 mb-5">
          Provision a new seller or superuser account. Accounts are approved automatically.
        </p>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Email *</label>
              <input type="email" name="email" value={form.email}
                onChange={handleChange} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Password *</label>
              <input type="password" name="password" value={form.password}
                onChange={handleChange} className={inputCls} required minLength={8}
                placeholder="Min. 8 characters" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>First Name</label>
              <input type="text" name="first_name" value={form.first_name}
                onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Last Name</label>
              <input type="text" name="last_name" value={form.last_name}
                onChange={handleChange} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={labelCls}>Role / Group *</label>
              <select
                name="role_group"
                value={form.role_group}
                onChange={handleRoleChange}
                className={inputCls}
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value} className="bg-slate-950 text-slate-100">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-xs text-slate-400">
            Role preview: <span className="font-bold text-slate-200">
              {ROLES.find(r => r.value === form.role_group)?.desc || 'Seller (store management)'}
            </span>
          </div>

          <button
            type="submit" disabled={formBusy}
            className="w-full rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {formBusy ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>
      </section>

      {/* ── Team Members Table ── */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-100">Team Members</h2>
            <p className="text-xs text-slate-400 mt-0.5">All sellers and superusers on the platform.</p>
          </div>
          <button
            onClick={loadUsers}
            disabled={loadingUsers}
            className="text-xs text-slate-400 hover:text-slate-200 transition"
          >
            {loadingUsers ? 'Loading…' : '↻ Refresh'}
          </button>
        </div>

        <DataTable
          columns={columns}
          data={users}
          loading={loadingUsers}
          emptyMessage="No team members found."
        />
      </section>

      {/* ── Delete Confirm Modal ── */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal(prev => ({ ...prev, open: false }))}
        onConfirm={handleConfirmDelete}
        isLoading={deleteModal.isLoading}
        variant="danger"
        title="Remove Account"
        message={`Permanently remove ${deleteModal.userEmail}? This action cannot be undone.`}
        confirmText="Yes, Remove"
      />

    </div>
  );
};

export default SuperuserUsers;
