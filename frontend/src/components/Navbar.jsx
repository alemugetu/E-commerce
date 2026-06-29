import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/getInitials';

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Controls the user-menu dropdown visibility
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  const initials = getInitials(user);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 py-4 px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* Brand */}
        <Link to="/" className="text-xl font-bold font-heading text-indigo-600 tracking-tight">
          STORE.ET
        </Link>

        {/* Navigation + User Section */}
        <nav className="flex gap-6 text-sm font-medium items-center">
          <Link to="/" className="text-slate-600 hover:text-indigo-600 transition-colors">
            Home
          </Link>

          <Link to="/" className="text-slate-600 hover:text-indigo-600 transition-colors">
            Catalog
          </Link>

          {/* Cart badge */}
          <Link
            to="/cart"
            className="relative text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
          >
            <span>Cart</span>
            <span className="text-base">&#128722;</span>
            {cartCount > 0 && (
              <span className="bg-indigo-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {/* ── Authenticated user section ── */}
          {user ? (
            <div className="relative" ref={menuRef}>
              {/* Avatar button — shows dynamic initials */}
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center border-2 border-indigo-200 hover:bg-indigo-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                aria-label="Open user menu"
                aria-expanded={menuOpen}
              >
                {initials}
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* User identity header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {user.first_name
                        ? `${user.first_name} ${user.last_name}`.trim()
                        : user.email}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
                    {/* Role badge */}
                    {(user.is_staff || user.is_superuser) && (
                      <span className="inline-block mt-1.5 text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded-full">
                        {user.is_superuser ? 'Superuser' : 'Staff'}
                      </span>
                    )}
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/order-history"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      Order History
                    </Link>

                    {/* Admin console link — only visible to staff */}
                    {(user.is_staff || user.is_superuser) && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors"
                      >
                        ⚙ Admin Console
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Guest links ── */
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-slate-600 hover:text-indigo-600 transition-colors text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
