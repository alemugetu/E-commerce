import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/getInitials';

const NAV_LINKS = [
  { to: '/dashboard',          label: 'My Profile',        exact: true  },
  { to: '/dashboard/orders',   label: 'Order History',     exact: false },
  { to: '/dashboard/address',  label: 'Shipping Address',  exact: false },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const initials    = getInitials(user);
  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name}`.trim()
    : user?.email ?? 'Account';

  const isActive = (link) =>
    link.exact
      ? location.pathname === link.to
      : location.pathname.startsWith(link.to);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-100 font-body">

      {/* ── Top header — no logout button here ── */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-6 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold font-heading text-indigo-600 dark:text-indigo-400 tracking-tight">
            STORE.ET
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Marketplace
            </Link>
            {/* Avatar only — logout lives in the sidebar */}
            <div
              title={displayName}
              className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs border border-indigo-200 dark:border-indigo-800 select-none"
            >
              {initials}
            </div>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">

          {/* ── Sidebar ── */}
          <aside className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">

            {/* Identity block */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-2 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{displayName}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>

            <p className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider pb-1">
              Account
            </p>

            {/* Nav links */}
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link)
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Sign out — single logout location */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </aside>

          {/* ── Main content slot ── */}
          <main className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm min-h-[400px]">
            <Outlet />
          </main>

        </div>
      </div>

    </div>
  );
};

export default DashboardLayout;
