import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

// ─── Skeleton ────────────────────────────────────────────────────────────────
const FieldSkeleton = () => (
  <div className="space-y-1.5 animate-pulse">
    <div className="h-3 w-24 bg-slate-200 rounded" />
    <div className="h-9 w-full bg-slate-100 rounded-lg" />
  </div>
);

// ─── Component ───────────────────────────────────────────────────────────────
const CustomerDashboard = () => {
  const [profile, setProfile] = useState({
    first_name:   '',
    last_name:    '',
    phone_number: '',
    addresse:     '',
    email:        '',
  });
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [saving, setSaving]         = useState(false);

  // ── Fetch profile on mount ────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const { data } = await api.get('/auth/profile/');
        setProfile({
          first_name:   data.first_name   || '',
          last_name:    data.last_name    || '',
          phone_number: data.phone_number || '',
          addresse:     data.addresse     || '',
          email:        data.email        || '',
        });
      } catch {
        setFetchError('Failed to load profile data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile(); 
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // ── Save profile changes ─────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/profile/', {
        first_name:   profile.first_name,
        last_name:    profile.last_name,
        phone_number: profile.phone_number,
        addresse:     profile.addresse,
      });
      toast.success('Profile updated successfully!');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Failed to save changes. Please try again.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Fetch error state ────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-amber-500" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Could Not Load Profile</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">{fetchError}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Main form ────────────────────────────────────────────────────────
  return (
    <div>
      {/* Section header */}
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">My Profile</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          Update your personal information and account details.
        </p>
      </div>

      {loading ? (
        /* Skeleton grid */
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FieldSkeleton /><FieldSkeleton />
          </div>
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
          <div className="h-9 w-36 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-5">

          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={profile.first_name}
                onChange={handleChange}
                placeholder="Abebe"
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={profile.last_name}
                onChange={handleChange}
                placeholder="Kebede"
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 transition"
              />
            </div>
          </div>

          {/* Email — read-only */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Email Address <span className="normal-case font-normal">(cannot be changed)</span>
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone_number"
              value={profile.phone_number}
              onChange={handleChange}
              placeholder="+251 911 000 000"
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 transition"
            />
          </div>

          {/* Address preview (editable here too for convenience) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Delivery Address
            </label>
            <input
              type="text"
              name="addresse"
              value={profile.addresse}
              onChange={handleChange}
              placeholder="Sub-city, Woreda, House No..."
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 transition"
            />
          </div>

          {/* Save */}
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs py-2.5 px-5 rounded-lg transition shadow-sm"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  );
};

export default CustomerDashboard;
