import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ResetPasswordConfirm = () => {
  const { uid, token } = useParams(); // Automatically extract parameters from layout URL paths
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password-confirm/', {
        uid,
        token: token?.replace(/\/+$/, ''), // Remove trailing slash if React Router captured it
        new_password: newPassword
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 4000); // Redirect to login page after brief window
    } catch (err) {
      setError(err.response?.data?.error || "This recovery link is invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-20 p-6 bg-white border border-slate-100 shadow-sm rounded-xl">
      <h2 className="text-xl font-black text-slate-900 mb-2">Set New Password</h2>
      <p className="text-xs text-slate-500 mb-6">Enter your new secure account credentials below.</p>

      {error && <div className="p-3 mb-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg">&#9888; {error}</div>}
      {success && (
        <div className="p-3 mb-4 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg">
          &#10024; Password updated successfully! Routing you back to the login page...
        </div>
      )}

      <form onSubmit={handleResetSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">New Password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-indigo-600" required />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Confirm New Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-indigo-600" required />
        </div>
        <button type="submit" disabled={loading || success} className="w-full bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-lg hover:bg-indigo-700 transition">
          {loading ? "Updating Account Records..." : "Save Secure Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordConfirm;

