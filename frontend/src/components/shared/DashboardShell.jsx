import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeSelector from '../common/ThemeSelector';

const DashboardShell = ({
  navConfig = [],
  dashboardTitle = 'Dashboard',
  dashboardType = 'customer',
  showExitToStore = true,
  children
}) => {
  const { user, logout, permissions = [] } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = (() => {
    if (!user) return "";
    const first = user.first_name?.trim() ?? "";
    const last = user.last_name?.trim() ?? "";
    return `${first} ${last}`.trim() || user.email;
  })();

  const emailLine = user?.email ?? "";

  const initials = (() => {
    if (!user) return "";
    const first = user.first_name?.trim();
    const last = user.last_name?.trim();
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (first) return first[0].toUpperCase();
    if (last) return last[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return "";
  })();

  const avatarColors = [
    'bg-indigo-600', 'bg-violet-600', 'bg-emerald-600',
    'bg-amber-600', 'bg-rose-600', 'bg-sky-600',
    'bg-teal-600', 'bg-orange-600',
  ];
  const avatarBg = initials
    ? avatarColors[initials.charCodeAt(0) % avatarColors.length]
    : 'bg-slate-700';

  const themeConfig = {
    customer: {
      sidebarBg: 'bg-slate-50 dark:bg-slate-900',
      brandColor: 'text-indigo-600 dark:text-indigo-400',
      activeBg: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/30',
      hoverBg: 'hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100',
      borderColor: 'border-slate-200 dark:border-slate-800',
    },
    seller: {
      sidebarBg: 'bg-slate-50 dark:bg-slate-900',
      brandColor: 'text-emerald-600 dark:text-emerald-400',
      activeBg: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/30',
      hoverBg: 'hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100',
      borderColor: 'border-slate-200 dark:border-slate-800',
    },
    operations: {
      sidebarBg: 'bg-slate-50 dark:bg-slate-900',
      brandColor: 'text-amber-600 dark:text-amber-400',
      activeBg: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/30',
      hoverBg: 'hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100',
      borderColor: 'border-slate-200 dark:border-slate-800',
    },
    superuser: {
      sidebarBg: 'bg-slate-50 dark:bg-slate-900',
      brandColor: 'text-purple-600 dark:text-purple-400',
      activeBg: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/30',
      hoverBg: 'hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100',
      borderColor: 'border-slate-200 dark:border-slate-800',
    },
  };

  const theme = themeConfig[dashboardType] || themeConfig.customer;

  const closeMobile = () => setMobileOpen(false);

  const isActive = (itemPath) => {
    if (itemPath === location.pathname) return true;
    if (itemPath !== '/' && location.pathname.startsWith(itemPath + '/')) return true;
    return false;
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-body text-slate-900 dark:text-slate-100">
      <div className="flex h-full">
        <aside className={`
          fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r ${theme.borderColor} ${theme.sidebarBg} flex-shrink-0 h-screen overflow-hidden 
          transition-transform duration-200 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0
        `}>
          <div className={`flex items-center justify-between border-b ${theme.borderColor} px-5 py-5`}>
            <span className={`text-base font-black tracking-tight ${theme.brandColor}`}>
              {dashboardTitle.toUpperCase()}
            </span>
            <div className="flex items-center gap-2">
              <ThemeSelector />
              <span className={`rounded border border-opacity-50 px-1.5 py-0.5 text-[9px] font-mono ${theme.brandColor}`}>
                v2.0
              </span>
            </div>
          </div>

          <div className={`flex items-center gap-3 border-b ${theme.borderColor} px-5 py-4`}>
            <div className={`
              flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full
              text-sm font-bold text-white select-none ring-2
              ${user ? `${avatarBg} ring-white/20` : 'bg-slate-200 dark:bg-slate-700 ring-slate-300/50 dark:ring-slate-600/30 animate-pulse'}
            `}>
              {user ? initials : (
                <svg className="h-4 w-4 text-slate-400 dark:text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 a3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              {user ? (
                <>
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                    {displayName}
                  </p>
                  {displayName !== emailLine && emailLine && (
                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{emailLine}</p>
                  )}
                  <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[9px] font-bold ${theme.brandColor} border-opacity-50`}>
                    {dashboardType === 'superuser' ? 'Superuser' : 
                     dashboardType === 'seller' ? 'Seller' :
                     dashboardType === 'operations' ? 'Operations' : 'Customer'}
                  </span>
                </>
              ) : (
                <div className="space-y-1.5 animate-pulse">
                  <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-2.5 w-20 rounded bg-slate-100 dark:bg-slate-700/60" />
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-600">
              Navigation
            </p>
            {navConfig.filter(item => {
              if (user?.is_superuser) return true;
              if (item.requiredPermissions && item.requiredPermissions.length > 0) {
                return item.requiredPermissions.every(p => permissions.includes(p));
              }
              return true;
            }).map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobile}
                  className={`
                    w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium
                    transition-all duration-150 border
                    ${active ? theme.activeBg : `text-slate-600 dark:text-slate-400 ${theme.hoverBg} border-transparent`}
                  `}
                >
                  {item.icon && <item.icon className="w-5 h-5 opacity-70" />}
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                </Link>
              );
            })}
          </nav>

          <div className={`border-t ${theme.borderColor} p-4 space-y-2`}>
            {showExitToStore && (
              <Link
                to="/"
                onClick={closeMobile}
                className={`flex w-full items-center justify-center rounded-xl border ${theme.borderColor} bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-700`}
              >
                &#8592; Exit to Store
              </Link>
            )}
            <button
              onClick={() => { logout(); closeMobile(); }}
              className="flex w-full items-center justify-center rounded-xl border border-red-600 dark:border-red-700 bg-red-50 dark:bg-red-950 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-300 transition hover:bg-red-100 dark:hover:bg-red-900"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {mobileOpen && (
          <button
            aria-label="Close navigation"
            className="fixed inset-0 z-30 bg-slate-900/50 dark:bg-slate-950/80 lg:hidden"
            onClick={closeMobile}
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className={`sticky top-0 z-20 flex h-14 items-center justify-between border-b ${theme.borderColor} bg-white/95 dark:bg-slate-900/95 px-4 sm:px-6 backdrop-blur`}>
            <button
              className={`rounded-lg border ${theme.borderColor} p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden`}
              onClick={() => setMobileOpen(p => !p)}
              aria-label="Open navigation"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 hidden lg:block">
              {navConfig.find(i => isActive(i.path))?.label ?? dashboardTitle}
            </p>

            <div className="flex items-center gap-3 ml-auto">
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Status:</span>
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">Online</span>
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardShell;
