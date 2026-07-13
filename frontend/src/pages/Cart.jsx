import React, { useState } from 'react'; // 1. Add useState Hook
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { initiateChapaCheckout } from '../services/paymentService'; // 2. Import service function
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { ShoppingCart, AlertTriangle } from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();
  
  // 3. Setup local asynchronous interactive UI state machinery
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const handleCheckoutHandshake = async () => {
    setIsProcessing(true);
    setCheckoutError(null);
    
    try {
      // Trigger the backend pipeline transaction
      const data = await initiateChapaCheckout(cartItems);
      
      if (data?.checkout_url) {
        // Safe programmatic redirection straight to Chapa's official banking/wallet portal screen
        window.location.href = data.checkout_url;
      } else {
        throw new Error("Invalid checkout response signature payload metadata.");
      }
    } catch (err) {
      setCheckoutError(err.message || "An unexpected error occurred during transaction processing.");
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <ShoppingCart className="w-20 h-20 mx-auto mb-4 text-indigo-500" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Your Cart is Empty</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Looks like you haven't added any hardware to your order yet.</p>
        <Button variant="primary" className="mt-6 w-full" onClick={() => navigate('/')}>
          Return to Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-8">Shopping Cart ({cartCount} items)</h1>

      {checkoutError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {checkoutError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Items List Table/Stack */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            let imageSrc = item.images?.[0]?.image_url 
              || item.images?.[0]?.image 
              || "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

            if (imageSrc && typeof imageSrc === 'string' && imageSrc.startsWith('/media/')) {
              imageSrc = `http://127.0.0.1:8000${imageSrc}`;
            }

            return (
              <Card key={item.id} className="p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                  <img src={imageSrc} alt={item.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">{item.category_detail?.name || "General"}</p>
                  <p className="text-sm font-black text-slate-900 dark:text-slate-100 mt-2">{item.price} ETB</p>
                </div>

                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={isProcessing}
                    className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold transition-colors disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[24px] text-center">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={isProcessing}
                    className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold transition-colors disabled:opacity-50"
                  >
                    +
                  </button>
                </div>

                <button 
                  onClick={() => removeFromCart(item.id)}
                  disabled={isProcessing}
                  className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-2 transition-colors text-sm font-medium sm:ml-2 disabled:opacity-50"
                >
                  Remove
                </button>
              </Card>
            );
          })}
        </div>

        {/* Right Side: Order Summary Panel */}
        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Order Summary</h2>
          
          <div className="space-y-3 pb-4 border-b border-slate-200 dark:border-slate-800 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{cartTotal.toFixed(2)} ETB</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Shipping / Delivery</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Calculated next</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 mb-6">
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">Total Balance</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{cartTotal.toFixed(2)} ETB</span>
          </div>

          {/* 4. ATTACH THE MUTATION FUNCTION AND DISABLE DRIVERS WHILE RUNNING */}
          <Button 
            variant="primary" 
            className="w-full py-3 text-base font-bold tracking-wide shadow-md"
            onClick={handleCheckoutHandshake}
            disabled={isProcessing}
          >
            {isProcessing ? "Connecting to Chapa Gateway..." : "Proceed to Checkout"}
          </Button>

          <Link to="/" className="block text-center text-xs text-indigo-600 hover:text-indigo-800 font-medium mt-4 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;

