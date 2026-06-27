import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-950 font-body">
      
      {/* 1. Shared Public Header Profile Context */}
      <header className="w-full bg-white border-b border-slate-200 py-4 px-6 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold font-heading text-indigo-600 tracking-tight">
            STORE.ET
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Marketplace</Link>
            <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
              CU
            </span>
          </div>
        </div>
      </header>

      {/* 2. Split Workspace Layout Split Panel */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          
          {/* Left Side: Account Navigation Panel Links */}
          <aside className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
            <div className="px-4 py-3 border-b border-slate-100 mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Settings</p>
            </div>
            <Link 
              to="/dashboard" 
              className="block px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo-50 text-indigo-700 transition-colors"
            >
              My Profile
            </Link>
            <span className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 cursor-not-allowed transition-colors">
              Order History
            </span>
            <span className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 cursor-not-allowed transition-colors">
              Shipping Addresses
            </span>
          </aside>

          {/* Right Side: Dynamic Target View panel slot */}
          <main className="md:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm min-h-[400px]">
            <Outlet />
          </main>

        </div>
      </div>

    </div>
  );
};

export default DashboardLayout;
