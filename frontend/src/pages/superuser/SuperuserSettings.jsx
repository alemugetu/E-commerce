import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

/**
 * SuperuserSettings — Store configuration for /admin/settings
 * 
 * Migrated from StoreSettingsTab in AdminDashboard.jsx with:
 *   - Proper URL-based routing (no AdminTabContext)
 *   - Purple superuser theme
 *   - Tabbed sections within the page
 *   - No inline permission checks (SuperuserProtectedRoute handles it)
 * 
 * API: /api/site_settings/store/settings/
 */

const INITIAL_FORM = {
  company_name: '', company_description: '', company_email: '',
  company_phone: '', company_address: '',
  facebook_url: '', instagram_url: '', linkedin_url: '', tiktok_url: '',
  telegram_url: '', whatsapp_url: '', youtube_url: '', x_url: '',
  footer_description: '', copyright_text: '', meta_title: '', meta_description: '',
};

const inputCls = 'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950/80 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none focus:border-purple-500 dark:focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition';
const labelCls = 'mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400';

const SECTION_TABS = [
  { id: 'company',  label: 'Company Info' },
  { id: 'branding', label: 'Branding' },
  { id: 'social',   label: 'Social Media' },
  { id: 'seo',      label: 'Footer & SEO' },
];

const SuperuserSettings = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState(null);
  const [currentFaviconUrl, setCurrentFaviconUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('company');

  // ── Load Settings ─────────────────────────────────────────────────────────
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/site_settings/store/settings/');
      const normalized = Object.fromEntries(
        Object.entries(INITIAL_FORM).map(([k]) => [k, data[k] ?? ''])
      );
      setForm(normalized);
      if (data.company_logo) setCurrentLogoUrl(data.company_logo);
      if (data.favicon) setCurrentFaviconUrl(data.favicon);
    } catch {
      toast.error('Failed to load store settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      // Track which text fields actually have values for audit log
      const changedFields = [];
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '') {
          fd.append(k, v);
          changedFields.push(k);
        }
      });
      if (logoFile)    { fd.append('company_logo', logoFile);    changedFields.push('company_logo'); }
      if (faviconFile) { fd.append('favicon', faviconFile);      changedFields.push('favicon'); }

      await api.patch('/site_settings/store/settings/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // ── Fire audit log (non-blocking) ────────────────────────────────────
      try {
        await api.post('/superuser/settings/audit/', { changed_fields: changedFields });
      } catch {
        // Audit failure must never block the primary save operation
      }

      toast.success('Store settings saved.');
      setLogoFile(null);
      setFaviconFile(null);
      await loadSettings();
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(' ')
        : 'Failed to save settings.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400">Configuration</p>
          <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">Store Settings</h1>
        </div>
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 rounded-xl bg-slate-200 dark:bg-slate-800/60" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-purple-400">Configuration</p>
        <h1 className="mt-1 text-2xl font-black text-slate-100">Store Settings</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage company information, social media, branding, and SEO. Changes reflect across the public site immediately.
        </p>
      </div>

      {/* ── Section Tabs ── */}
      <div className="flex gap-1 rounded-xl border border-slate-800 bg-slate-900/50 p-1 overflow-x-auto">
        {SECTION_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex-shrink-0 rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeSection === tab.id
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Company Info ─────────────────────────────────────────────── */}
        {activeSection === 'company' && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Company Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Company Name</label>
                <input type="text" name="company_name" value={form.company_name}
                  onChange={handleChange} className={inputCls} placeholder="Your company name" />
              </div>
              <div>
                <label className={labelCls}>Company Email</label>
                <input type="email" name="company_email" value={form.company_email}
                  onChange={handleChange} className={inputCls} placeholder="contact@example.com" />
              </div>
              <div>
                <label className={labelCls}>Phone Number</label>
                <input type="text" name="company_phone" value={form.company_phone}
                  onChange={handleChange} className={inputCls} placeholder="+251 900 000 000" />
              </div>
              <div>
                <label className={labelCls}>Address</label>
                <input type="text" name="company_address" value={form.company_address}
                  onChange={handleChange} className={inputCls} placeholder="City, Country" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Company Description</label>
              <textarea name="company_description" value={form.company_description}
                onChange={handleChange} rows={3} className={`${inputCls} resize-none`}
                placeholder="Short description shown in the hero section" />
            </div>
          </section>
        )}

        {/* ── Branding ─────────────────────────────────────────────────── */}
        {activeSection === 'branding' && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Branding</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Company Logo</label>
                {currentLogoUrl && (
                  <img src={currentLogoUrl} alt="Current logo"
                    className="mb-2 h-12 w-auto object-contain rounded bg-slate-200 dark:bg-slate-800 p-1" />
                )}
                <input type="file" accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:rounded-full file:border-0 file:bg-purple-600/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-purple-700 dark:file:text-purple-300 hover:file:bg-purple-600/30 cursor-pointer" />
                <p className="mt-1 text-[10px] text-slate-600 dark:text-slate-500">Leave blank to keep the current logo.</p>
              </div>
              <div>
                <label className={labelCls}>Favicon</label>
                {currentFaviconUrl && (
                  <img src={currentFaviconUrl} alt="Current favicon"
                    className="mb-2 h-8 w-8 object-contain rounded bg-slate-800 p-1" />
                )}
                <input type="file" accept="image/*"
                  onChange={(e) => setFaviconFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:rounded-full file:border-0 file:bg-purple-600/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-purple-700 dark:file:text-purple-300 hover:file:bg-purple-600/30 cursor-pointer" />
                <p className="mt-1 text-[10px] text-slate-600 dark:text-slate-500">Leave blank to keep the current favicon.</p>
              </div>
            </div>
          </section>
        )}

        {/* ── Social Media ──────────────────────────────────────────────── */}
        {activeSection === 'social' && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Social Media</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Enter the full URL. Leave blank to hide that icon on the public site.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { name: 'facebook_url',  label: 'Facebook',    placeholder: 'https://facebook.com/yourpage' },
                { name: 'instagram_url', label: 'Instagram',   placeholder: 'https://instagram.com/yourhandle' },
                { name: 'linkedin_url',  label: 'LinkedIn',    placeholder: 'https://linkedin.com/company/...' },
                { name: 'tiktok_url',    label: 'TikTok',      placeholder: 'https://tiktok.com/@yourhandle' },
                { name: 'telegram_url',  label: 'Telegram',    placeholder: 'https://t.me/yourchannel' },
                { name: 'whatsapp_url',  label: 'WhatsApp',    placeholder: 'https://wa.me/2519XXXXXXXX' },
                { name: 'youtube_url',   label: 'YouTube',     placeholder: 'https://youtube.com/@yourchannel' },
                { name: 'x_url',         label: 'X (Twitter)', placeholder: 'https://x.com/yourhandle' },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className={labelCls}>{label}</label>
                  <input type="url" name={name} value={form[name]}
                    onChange={handleChange} className={inputCls} placeholder={placeholder} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Footer & SEO ──────────────────────────────────────────────── */}
        {activeSection === 'seo' && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Footer & SEO</h2>
            <div>
              <label className={labelCls}>Footer Description</label>
              <textarea name="footer_description" value={form.footer_description}
                onChange={handleChange} rows={2} className={`${inputCls} resize-none`}
                placeholder="Short tagline shown in the footer" />
            </div>
            <div>
              <label className={labelCls}>Copyright Text</label>
              <input type="text" name="copyright_text" value={form.copyright_text}
                onChange={handleChange} className={inputCls}
                placeholder="© 2025 STORE.ET. All rights reserved." />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Meta Title (SEO)</label>
                <input type="text" name="meta_title" value={form.meta_title}
                  onChange={handleChange} className={inputCls}
                  placeholder="Page title for search engines" />
              </div>
              <div>
                <label className={labelCls}>Meta Description (SEO)</label>
                <input type="text" name="meta_description" value={form.meta_description}
                  onChange={handleChange} className={inputCls}
                  placeholder="Short summary for search results" />
              </div>
            </div>
          </section>
        )}

        {/* ── Save Button ── */}
        <button
          type="submit" disabled={saving}
          className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? '⏳ Saving Settings…' : '💾 Save Store Settings'}
        </button>
      </form>

    </div>
  );
};

export default SuperuserSettings;
