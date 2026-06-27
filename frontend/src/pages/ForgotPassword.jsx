import React, { useState } from 'react';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/forgot-password/', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit recovery request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-20 p-6 bg-white border border-slate-100 shadow-sm rounded-xl">
      <h2 className="text-xl font-black text-slate-900 mb-2">Recover Your Password</h2>
      <p className="text-xs text-slate-500 mb-6">Enter your registered email below, and we'll send you a secure link to reset your credentials.</p>
      
      {error && <div className="p-3 mb-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg">&#9888; {error}</div>}
      {message && <div className="p-3 mb-4 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg">&#10024; {message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-indigo-600" required />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-lg hover:bg-indigo-700 transition">
          {loading ? "Processing Link..." : "Send Recovery Link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;

