import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Up one directory to src/, then into components

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-950 font-body">
      
      {/* Global Announcement Bar */}
      <div className="bg-indigo-600 text-white text-xs font-medium py-2 px-4 text-center">
        Free shipping on all orders over 1,000 Birr!
      </div>

      {/* Production Navigation Bar Component */}
      <Navbar />

      {/* Main Dynamic View Content Zone */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Outlet />
      </main>

      {/* Footer Zone */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-center text-sm text-slate-500">
        <div className="max-w-7xl mx-auto">
          &copy; {new Date().getFullYear()} STORE.ET. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default PublicLayout;

