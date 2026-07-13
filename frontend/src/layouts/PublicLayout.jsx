import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-body">

      {/* Global Announcement Bar */}
      <div className="bg-emerald-600 text-white text-xs font-medium py-2 px-4 text-center">
        Free shipping on all orders over 5,000 Birr!
      </div>

      {/* Production Navigation Bar Component */}
      <Navbar />

      {/* Main Dynamic View Content Zone */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Outlet />
      </main>

      {/* New Professional Footer */}
      <Footer />

    </div>
  );
};

export default PublicLayout;

