import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductDetails } from '../hooks/useProductDetails';
import { useAddToCart } from '../hooks/useAddToCart';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=700&auto=format&fit=crop&q=60';

/**
 * Resolves the best available URL for a ProductImage object.
 * The backend serializer returns `image_url` (absolute) built by
 * ProductImageSerializer.get_image_url(). We also handle the edge case
 * where only a relative `/media/...` path is present.
 */
const resolveImageUrl = (imageObj) => {
  if (!imageObj) return FALLBACK_IMAGE;
  const url = imageObj.image_url || imageObj.image || '';
  if (!url) return FALLBACK_IMAGE;
  // Convert a bare relative path to an absolute dev URL
  if (url.startsWith('/media/')) return `http://127.0.0.1:8000${url}`;
  return url;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProductDetails(id);
  const { addItem, isAdding } = useAddToCart();

  // ── Image gallery state ──────────────────────────────────────────────────
  // Initialised to null; set properly once the product data arrives so we
  // always track the real backend URL, not a stale closure value.
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    if (product?.images?.length > 0) {
      // Find the feature image first; fall back to first image in the array
      const feature = product.images.find((img) => img.is_feature) ?? product.images[0];
      setActiveImage(resolveImageUrl(feature));
    } else if (product) {
      // Product loaded but has no images at all
      setActiveImage(FALLBACK_IMAGE);
    }
  }, [product]);

  // ── Quantity selector state ──────────────────────────────────────────────
  const [quantity, setQuantity] = useState(1);

  const decrementQty = () => setQuantity((q) => Math.max(1, q - 1));
  const incrementQty = () =>
    setQuantity((q) => Math.min(product?.stock ?? 9999, q + 1));

  // ─────────────────────────────────────────────────────────────────────────
  // Loading skeleton
  // ─────────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-4 w-48 bg-slate-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image skeleton */}
          <div className="aspect-square bg-slate-200 rounded-2xl animate-pulse" />
          {/* Info skeleton */}
          <div className="space-y-4 py-2">
            <div className="h-5 w-24 bg-slate-200 rounded-full animate-pulse" />
            <div className="h-9 w-3/4 bg-slate-200 rounded animate-pulse" />
            <div className="h-8 w-1/3 bg-slate-200 rounded animate-pulse mt-6" />
            <div className="space-y-2 mt-6">
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Error state
  // ─────────────────────────────────────────────────────────────────────────
  if (isError || !product) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <Card className="p-6 border-red-100 bg-red-50/50">
          <h3 className="font-bold text-red-800 text-lg">Product Information Unavailable</h3>
          <p className="text-slate-600 text-sm mt-1">
            The item may have been unlisted or removed from inventory.
          </p>
          <Button variant="primary" className="mt-4 w-full" onClick={() => navigate('/')}>
            Return to Marketplace
          </Button>
        </Card>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Derived display values
  // ─────────────────────────────────────────────────────────────────────────
  const categoryName = product.category_detail?.name || 'General';
  const displayPrice = product.discount_price
    ? parseFloat(product.discount_price)
    : parseFloat(product.price);
  const hasDiscount =
    product.discount_price &&
    parseFloat(product.discount_price) < parseFloat(product.price);
  const inStock = product.stock > 0 && product.is_available !== false;

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-slate-500 font-medium flex items-center gap-1">
        <Link to="/" className="hover:text-indigo-600 transition-colors">
          Marketplace
        </Link>
        <span className="text-slate-300 mx-1">/</span>
        <span
          className="text-indigo-500 hover:text-indigo-700 cursor-pointer transition-colors"
          onClick={() => navigate(-1)}
        >
          {categoryName}
        </span>
        <span className="text-slate-300 mx-1">/</span>
        <span className="text-slate-800 font-semibold truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

        {/* ── LEFT: Image gallery ── */}
        <div className="flex flex-col gap-4">

          {/* Main image viewer */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden aspect-square flex items-center justify-center">
            <img
              key={activeImage} // forces a clean re-render when the src changes
              src={activeImage || FALLBACK_IMAGE}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-300"
              onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
            />
          </div>

          {/* Thumbnail strip — only rendered when there are 2+ images */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img) => {
                const thumbUrl = resolveImageUrl(img);
                const isActive = activeImage === thumbUrl;
                return (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(thumbUrl)}
                    className={`
                      flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-150
                      ${isActive
                        ? 'border-indigo-500 shadow-md scale-105'
                        : 'border-slate-200 hover:border-indigo-300 opacity-70 hover:opacity-100'}
                    `}
                    aria-label={img.alt_text || `View image ${img.id}`}
                  >
                    <img
                      src={thumbUrl}
                      alt={img.alt_text || product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: Product info & actions ── */}
        <div className="flex flex-col gap-6 py-2">

          {/* Category chip + brand */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase rounded-full tracking-wider">
              {categoryName}
            </span>
            {product.brand && (
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                {product.brand}
              </span>
            )}
          </div>

          {/* Product name */}
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {product.name}
          </h1>

          {/* Price block */}
          <div className="flex items-baseline gap-3 border-b border-slate-100 pb-5">
            <span className="text-3xl font-black text-slate-900">
              {displayPrice.toLocaleString()}{' '}
              <span className="text-lg font-bold text-slate-500">ETB</span>
            </span>
            {hasDiscount && (
              <span className="text-lg font-semibold text-slate-400 line-through">
                {parseFloat(product.price).toLocaleString()} ETB
              </span>
            )}
            {hasDiscount && (
              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                Sale
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">
              Description
            </h4>
            <p className="text-slate-600 text-base leading-relaxed">
              {product.description ||
                'Detailed specification overview not yet drafted for this item.'}
            </p>
          </div>

          {/* Stock indicator */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                inStock ? 'bg-emerald-500' : 'bg-red-400'
              }`}
            />
            <span
              className={`text-sm font-semibold ${
                inStock ? 'text-emerald-700' : 'text-red-600'
              }`}
            >
              {inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* ── Add to Cart panel ── */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col gap-4">

            {/* Quantity selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-700">Quantity</span>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <button
                  onClick={decrementQty}
                  disabled={quantity <= 1 || isAdding}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold transition-colors disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-4 py-2 text-sm font-bold text-slate-900 min-w-[2.5rem] text-center select-none">
                  {quantity}
                </span>
                <button
                  onClick={incrementQty}
                  disabled={quantity >= (product.stock ?? 9999) || isAdding}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold transition-colors disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to cart button */}
            <Button
              variant="primary"
              className="w-full py-3 text-base font-bold tracking-wide shadow-sm"
              disabled={!inStock || isAdding}
              onClick={() => addItem(product, quantity)}
            >
              {isAdding
                ? 'Adding to Cart…'
                : inStock
                ? 'Add This Item to Cart'
                : 'Out of Stock'}
            </Button>

            {!inStock && (
              <p className="text-xs text-center text-red-500 font-medium">
                This item is currently unavailable. Check back soon.
              </p>
            )}
          </div>

          {/* Meta row */}
          {(product.rating > 0 || product.num_reviews > 0) && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="text-amber-400 font-bold">★</span>
              <span className="font-semibold text-slate-700">{product.rating}</span>
              <span>({product.num_reviews} reviews)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
