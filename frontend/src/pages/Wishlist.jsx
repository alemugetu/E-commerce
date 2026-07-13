import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { wishlistItems, loading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Ensure wishlistItems is always an array
  const safeWishlistItems = Array.isArray(wishlistItems) ? wishlistItems : [];

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await toggleWishlist(productId);
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success('Added to cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">My Wishlist</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          {safeWishlistItems.length === 0
            ? 'Your wishlist is empty'
            : `${safeWishlistItems.length} item${safeWishlistItems.length !== 1 ? 's' : ''} saved`}
        </p>
      </div>

      {/* Wishlist Items */}
      {safeWishlistItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Heart className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Your wishlist is empty</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Save items you love to view them later</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {safeWishlistItems.map((item) => {
            const product = item.product;
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-slate-100 dark:bg-slate-800">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].image_url || product.images[0].image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                      No image
                    </div>
                  )}
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white dark:bg-slate-900 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <Link
                    to={`/product/${product.id}`}
                    className="block text-lg font-semibold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{product.brand}</p>

                  {/* Price */}
                  <div className="mt-3">
                    {product.discount_price && product.discount_price < product.price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {Number(product.discount_price).toLocaleString()} ETB
                        </span>
                        <span className="text-sm text-slate-400 dark:text-slate-500 line-through">
                          {Number(product.price).toLocaleString()} ETB
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-emerald-600">
                        {Number(product.price).toLocaleString()} ETB
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
