import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 py-4 px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Dynamic App Brand Link */}
        <Link to="/" className="text-xl font-bold font-heading text-indigo-600 tracking-tight block">
          STORE.ET
        </Link>
        
        {/* Navigation Core */}
        <nav className="flex gap-6 text-sm font-medium items-center">
          <Link to="/" className="text-slate-600 hover:text-indigo-600 transition-colors">
            Home
          </Link>
          
          <Link to="/" className="text-slate-600 hover:text-indigo-600 transition-colors">
            Catalog
          </Link>
          
          {/* Cart Trigger Button with Dynamic Tracking Badge Counter */}
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
        </nav>

      </div>
    </header>
  );
};

export default Navbar;

