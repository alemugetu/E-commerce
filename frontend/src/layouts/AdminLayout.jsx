import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex bg-slate-950 font-body text-slate-100">
      
      {/* 1. Left-Side Sticky Sidebar Panel Container */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col sticky top-0 h-screen z-30">
        {/* Brand System Section */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <span className="text-lg font-bold font-heading text-indigo-400 tracking-tight">
            ADMIN CONSOLE
          </span>
          <span className="bg-indigo-950 text-indigo-300 text-[10px] font-mono px-2 py-0.5 rounded border border-indigo-800">
            v2.0
          </span>
        </div>

        {/* Sidebar Administrative Navigation Menu Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <Link 
            to="/admin" 
            className="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-800 text-white transition-colors"
          >
            Dashboard Overview
          </Link>
          <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider pt-4">
            Management
          </div>
          <span className="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 cursor-not-allowed transition-colors">
            Products Grid
          </span>
          <span className="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 cursor-not-allowed transition-colors">
            Orders Matrix
          </span>
        </nav>

        {/* Sidebar Footer Zone linking back to public marketplace */}
        <div className="p-4 border-t border-slate-800">
          <Link 
            to="/" 
            className="flex items-center justify-center w-full px-4 py-2 text-xs font-semibold rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            Exit to Live Store
          </Link>
        </div>
      </aside>

      {/* 2. Main Right-Hand View Area Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        
        {/* Top Control Header Panel bar */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="text-sm text-slate-400 font-medium">
            System Node: <span className="text-emerald-400 font-mono font-bold">Online</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-slate-400">Webhook Monitor</span>
          </div>
        </header>

        {/* Dynamic Admin Inner Page Render Zone wrapper */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;