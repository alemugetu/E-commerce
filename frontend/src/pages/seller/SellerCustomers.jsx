import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { DataTable, StatusBadge, ConfirmModal } from '../../components/shared';
import toast from 'react-hot-toast';

/**
 * SellerCustomers — Customer approval management for /seller/customers
 * 
 * Shows all registered customers with their approval status.
 * Allows sellers to approve/reject customer accounts.
 * API: /api/auth/customers/
 */
const SellerCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState({
    open: false, customerId: null, customerEmail: '', action: '', isLoading: false,
  });

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/customers/');
      setCustomers(data.results ?? []);
      setSummary(data.summary ?? null);
    } catch {
      toast.error('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const openActionModal = (customer, action) => {
    setActionModal({
      open: true,
      customerId: customer.id,
      customerEmail: customer.email,
      action,
      isLoading: false,
    });
  };

  const handleConfirmAction = async () => {
    setActionModal(prev => ({ ...prev, isLoading: true }));
    try {
      await api.patch(`/auth/customers/${actionModal.customerId}/`, {
        approval_status: actionModal.action,
      });
      toast.success(
        actionModal.action === 'approved'
          ? `${actionModal.customerEmail} approved.`
          : `${actionModal.customerEmail} rejected.`
      );
      loadCustomers();
    } catch {
      toast.error('Failed to update customer status.');
    } finally {
      setActionModal({ open: false, customerId: null, customerEmail: '', action: '', isLoading: false });
    }
  };

  const columns = [
    {
      key: 'email',
      label: 'Customer',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            {row.first_name || row.last_name
              ? `${row.first_name || ''} ${row.last_name || ''}`.trim()
              : 'No Name'}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-500">{val}</p>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Registered',
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: 'approval_status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'is_active',
      label: 'Active',
      render: (val) => <StatusBadge status={val ? 'Yes' : 'No'} />,
    },
    {
      key: 'id',
      label: 'Actions',
      align: 'right',
      render: (id, row) => {
        if (row.approval_status === 'pending') {
          return (
            <div className="flex justify-end gap-2">
              <button
                onClick={() => openActionModal(row, 'approved')}
                className="rounded-lg border border-emerald-500/20 dark:border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/20 transition"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => openActionModal(row, 'rejected')}
                className="rounded-lg border border-rose-500/20 dark:border-rose-500/20 bg-rose-500/10 dark:bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 dark:hover:bg-rose-500/20 transition"
              >
                ✕ Reject
              </button>
            </div>
          );
        }
        return <span className="text-xs text-slate-600 dark:text-slate-500 italic">No action needed</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Access Control</p>
        <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">Customers</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Review and approve customer account registrations. Only approved customers can place orders.
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Customers', value: summary?.total ?? 0,    color: 'border-l-indigo-500',  text: 'text-indigo-400' },
          { label: 'Pending',         value: summary?.pending ?? 0,  color: 'border-l-amber-500',   text: 'text-amber-400' },
          { label: 'Approved',        value: summary?.approved ?? 0, color: 'border-l-emerald-500', text: 'text-emerald-400' },
          { label: 'Rejected',        value: summary?.rejected ?? 0, color: 'border-l-rose-500',    text: 'text-rose-400' },
        ].map(card => (
          <div key={card.label} className={`rounded-xl border-l-4 ${card.color} bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4`}>
            <p className="text-xs text-slate-600 dark:text-slate-500 uppercase tracking-wider">{card.label}</p>
            <p className={`text-2xl font-black mt-1 text-slate-900 dark:text-slate-100 ${card.text}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* ── Pending Alert ── */}
      {summary && summary.pending > 0 && (
        <div className="rounded-xl border border-amber-500/20 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 flex items-start gap-3">
          <span className="text-amber-600 dark:text-amber-400 text-lg mt-0.5">⏳</span>
          <div>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
              {summary.pending} customer{summary.pending !== 1 ? 's' : ''} pending approval
            </p>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5">
              Review new registrations to enable purchasing.
            </p>
          </div>
        </div>
      )}

      {/* ── Customers Table ── */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/70 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">All Customers</h2>
          <button
            onClick={loadCustomers}
            disabled={loading}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition"
          >
            {loading ? 'Loading…' : '↻ Refresh'}
          </button>
        </div>

        <DataTable
          columns={columns}
          data={customers}
          loading={loading}
          emptyMessage="No customer registrations yet."
        />
      </section>

      {/* ── Confirm Modal ── */}
      <ConfirmModal
        isOpen={actionModal.open}
        onClose={() => setActionModal(prev => ({ ...prev, open: false }))}
        onConfirm={handleConfirmAction}
        isLoading={actionModal.isLoading}
        variant={actionModal.action === 'approved' ? 'info' : 'warning'}
        title={actionModal.action === 'approved' ? 'Approve Customer' : 'Reject Customer'}
        message={`${actionModal.action === 'approved' ? 'Approve' : 'Reject'} ${actionModal.customerEmail}? ${
          actionModal.action === 'approved'
            ? 'They will gain full access to place orders.'
            : 'They will be unable to log in or place orders.'
        }`}
        confirmText={actionModal.action === 'approved' ? 'Yes, Approve' : 'Yes, Reject'}
      />

    </div>
  );
};

export default SellerCustomers;
