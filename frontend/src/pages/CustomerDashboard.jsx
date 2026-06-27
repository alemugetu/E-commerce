import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CustomerDashboard = () => {
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    addresse: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch user data records immediately on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/auth/profile/');
        setProfile({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          phone_number: response.data.phone_number || '',
          addresse: response.data.addresse || '',
          email: response.data.email || ''
        });
      } catch (err) {
        setError("Failed to synchronize account metrics with backend nodes.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Commit modifications back down to postgreSQL
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg("");
    setIsSubmitting(true);

    try {
      const response = await api.put('/auth/profile/', {
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number,
        addresse: profile.addresse
      });
      
      setSuccessMsg("Account profile details updated successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to commit information revisions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mb-2"></div>
        <p className="text-xs">Fetching personal profile metadata...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Account Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Configure your shipping coordinates and primary identity vectors.</p>
      </div>

      {error && <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-600 font-medium">⚠️ {error}</div>}
      {successMsg && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-600 font-medium">✨ {successMsg}</div>}

      <form onSubmit={handleUpdateProfile} className="bg-white p-6 border border-slate-100 rounded-xl shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">First Name</label>
            <input type="text" name="first_name" value={profile.first_name} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-indigo-500" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Last Name</label>
            <input type="text" name="last_name" value={profile.last_name} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-indigo-500" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address (Primary Login)</label>
          <input type="email" value={profile.email} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400 cursor-not-allowed" />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
          <input type="text" name="phone_number" value={profile.phone_number} onChange={handleInputChange} placeholder="+251..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-indigo-500" />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Physical Address / Shipping Destination</label>
          <input type="text" name="addresse" value={profile.addresse} onChange={handleInputChange} placeholder="Addis Ababa, Sub City, Woreda..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-indigo-500" />
        </div>

        <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg transition shadow-sm">
          {isSubmitting ? "Saving Revisions..." : "Save Profile Revisions"}
        </button>
      </form>
    </div>
  );
};

export default CustomerDashboard;