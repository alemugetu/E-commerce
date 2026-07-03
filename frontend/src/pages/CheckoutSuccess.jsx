import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/Button';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const txRef = searchParams.get('tx_ref');

  useEffect(() => {
    // Clean up persistent local storage states upon successful processing verification
    clearCart();
  }, [clearCart]);


  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 bg-slate-50">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm animate-bounce">
        &#10004;
      </div>

      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payment Secured!</h1>
      <p className="text-sm text-slate-500 text-center mt-2 max-w-md leading-relaxed">
        Thank you for your business. Your financial transaction context has been resolved successfully by our automated systems.
      </p>

      {/* Reference Code Container */}
      {txRef && (
        <div className="mt-6 p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 font-mono select-all">
          Reference Code: {txRef}
        </div>
      )}

      {/* 3. WIRE THE NAVIGATE ACTION ONCLICK TO HOME PATH '/' */}
      <Button 
        onClick={() => navigate('/')} 
        className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 px-8 rounded-xl shadow-md transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
      >
        Return to Storefront
      </Button>
    </div>
  );
};

export default CheckoutSuccess;

