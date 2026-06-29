import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/getInitials';
import { AdminTabContext } from '../context/AdminTabContext';

// Re-export so AdminDashboard can import from the layout path if preferred
export { AdminTabContext, useAdminTab } from '../context/AdminTabContext';

const NAV_ITEMS = [
  { tab: 'overview',    label: 'Dashboard Overview', icon: '▣' },
  { tab: 'products',    label: 'Products',            icon: '⬡' },
  { tab: 'admin-users', label: 'Admin Users',         icon: '⊕' },
];

const AdminLayout = () => {
  const { user, logout }            = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab]   = useState('overview');

  // Avatar: show initials when user is loaded, pulse ring when still loading
  const initials    = getInitials(user);
  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name}`.trim()
    : user?.email ?? '';
  const emailLine   = user?.email ?? '';

  const closeMobile = () => setMobileOpen(false);

  return (
    <AdminTabContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="min-h-screen bg-slate-950 font-body text-slate-100">
        <div className="flex min-h-screen">

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside className={`
            fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-slate-900
            transition-transform duration-200 ease-in-out
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:static lg:translate-x-0
          `}>

            {/* Brand */}
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5">
              <span className="text-base font-black tracking-tight text-indigo-400">ADMIN CONSOLE</span>
              <span className="rounded border border-indigo-800 bg-indigo-950 px-1.5 py-0.5 text-[9px] font-mono text-indigo-300">v2.0</span>
            </div>

            {/* Identity card */}
            <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-4">
              {/* Avatar — always renders; shows '?' while user is null */}
              <div className={`
                flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full
                text-sm font-bold text-white select-none ring-2
                ${user ? 'bg-indigo-600 ring-indigo-500/30' : 'bg-slate-700 ring-slate-600/30 animate-pulse'}
              `}>
                {initials}
              </div>
              <div className="min-w-0">
                {user ? (
                  <>
                    <p className="truncate text-sm font-semibold text-slate-100 leading-tight">
                      {displayName || emailLine}
                    </p>
                    <p className="truncate text-[11px] text-slate-400 mt-0.5">{emailLine}</p>
                    <span className="mt-1 inline-block rounded-full border border-indigo-700 bg-indigo-950 px-2 py-0.5 text-[9px] font-bold text-indigo-300">
                      {user.is_superuser ? 'Superuser' : 'Staff'}
                    </span>
                  </>
                ) : (
                  <div className="space-y-1.5 animate-pulse">
                    <div className="h-3 w-28 rounded bg-slate-700" />
                    <div className="h-2.5 w-20 rounded bg-slate-700/60" />
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.25em] text-slate-600">Navigation</p>
              {NAV_ITEMS.map((item) => {
                const active = activeTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => { setActiveTab(item.tab); closeMobile(); }}
                    className={`
                      w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-left
                      transition-all duration-150 border
                      ${active
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-600/30'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 border-transparent'}
                    `}
                  >
                    <span className="text-base opacity-70">{item.icon}</span>
                    {item.label}
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />}
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="border-t border-slate-800 p-4 space-y-2">
              <Link
                to="/"
                onClick={closeMobile}
                className="flex w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
              >
                ← Exit to Store
              </Link>
              <button
                onClick={logout}
                className="flex w-full items-center justify-center rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-900/50 hover:text-red-300"
              >
                Sign Out
              </button>
            </div>
          </aside>

          {/* Mobile overlay */}
          {mobileOpen && (
            <button
              aria-label="Close navigation"
              className="fixed inset-0 z-30 bg-slate-950/80 lg:hidden"
              onClick={closeMobile}
            />
          )}

          {/* ── Main area ───────────────────────────────────────────────── */}
          <div className="flex min-w-0 flex-1 flex-col">

            {/* Top header */}
            <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 sm:px-6 backdrop-blur">
              {/* Hamburger — mobile only */}
              <button
                className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:bg-slate-800 lg:hidden"
                onClick={() => setMobileOpen(p => !p)}
                aria-label="Open navigation"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Breadcrumb label */}
              <p className="text-sm font-semibold text-slate-300 hidden lg:block">
                {NAV_ITEMS.find(i => i.tab === activeTab)?.label ?? 'Dashboard'}
              </p>

              {/* Status */}
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-xs text-slate-500 hidden sm:block">System Node:</span>
                <span className="font-mono text-xs font-bold text-emerald-400">Online</span>
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              </div>
            </header>

            {/* Scrollable page content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div className="mx-auto max-w-7xl">
                <Outlet />
              </div>
            </main>
          </div>

        </div>
      </div>
    </AdminTabContext.Provider>
  );
};

export default AdminLayout;
