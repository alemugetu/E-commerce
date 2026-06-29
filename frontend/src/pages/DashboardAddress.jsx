import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

// ─── Skeleton ────────────────────────────────────────────────────────────────
const FieldSkeleton = () => (
  <div className="space-y-1.5 animate-pulse">
    <div className="h-3 w-24 bg-slate-200 rounded" />
    <div className="h-9 w-full bg-slate-100 rounded-lg" />
  </div>
);

// ─── Component ───────────────────────────────────────────────────────────────
/**
 * Shipping Address section.
 *
 * The backend does not have a separate /addresses/ table — the user's
 * delivery address is stored on the CustomUser model as the `addresse`
 * field, exposed via GET/PUT /api/auth/profile/.
 *
 * This component:
 *   - GETs the profile on mount to populate the address fields.
 *   - PUTs only the address-related fields back on save.
 *   - Shows proper skeleton, error, and success states.
 */
const DashboardAddress = () => {
  const [form, setForm] = useState({ addresse: '', phone_number: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // ── Load current address from profile ──────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const { data } = await api.get('/auth/profile/');
        setForm({
          addresse: data.addresse || '',
          phone_number: data.phone_number || '',
        });
      } catch {
        setFetchError('Failed to load address details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ── Save changes via profile PUT ────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/profile/', {
        addresse: form.addresse,
        phone_number: form.phone_number,
      });
      toast.success('Shipping address updated successfully!');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Failed to save address. Please try again.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Fetch error state ───────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="text-center py-16">
        <p className="text-3xl mb-3">&#9888;</p>
        <h3 className="text-lg font-bold text-slate-900">Could Not Load Address</h3>
        <p className="text-sm text-slate-500 mt-1 mb-5">{fetchError}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────────
  return (
    <div>
      {/* Section header */}
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-900">Shipping Address</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          This address is used as the default delivery destination for your orders.
        </p>
      </div>

      {loading ? (
        /* Skeleton */
        <div className="space-y-5">
          <FieldSkeleton />
          <FieldSkeleton />
          <div className="h-9 w-36 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-5">

          {/* Phone number */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="+251 911 000 000"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>

          {/* Delivery address */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Delivery Address
            </label>
            <textarea
              name="addresse"
              value={form.addresse}
              onChange={handleChange}
              rows={3}
              placeholder="Sub-city, Woreda, House Number, Landmark..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition resize-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Include as much detail as possible to ensure accurate delivery.
            </p>
          </div>

          {/* Info callout */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 text-xs text-indigo-700 flex items-start gap-2">
            <span className="mt-0.5">&#8505;</span>
            <span>
              This address is linked to your account profile. Future orders will use
              this information unless you update it before checkout.
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs py-2.5 px-5 rounded-lg transition shadow-sm"
          >
            {saving ? 'Saving…' : 'Save Address'}
          </button>
        </form>
      )}
    </div>
  );
};

export default DashboardAddress;
