import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiHeart, HiEye, HiShoppingCart } from 'react-icons/hi2';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useWishlist } from '../../context/WishlistContext';
import { useAddToCart } from '../../hooks/useAddToCart';
import { formatPrice, getProductImage } from '../../utils/productUtils';

const renderStars = (rating) => {
  const stars = [];
  const value = Number(rating) || 0;

  for (let i = 1; i <= 5; i += 1) {
    if (value >= i) {
      stars.push(<FaStar key={i} className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />);
    } else if (value >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />);
    } else {
      stars.push(<FaRegStar key={i} className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />);
    }
  }

  return stars;
};

const ProductCard = ({ product }) => {
  const { toggleWishlist, checkIsInWishlist } = useWishlist();
  const { addItem, isAdding } = useAddToCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const imageSrc = getProductImage(product);
  const categoryLabel = product.category_detail?.name || 'General';
  const inWishlist = checkIsInWishlist(product.id);
  const hasDiscount =
    product.discount_price && Number(product.discount_price) < Number(product.price);
  const displayPrice = hasDiscount ? product.discount_price : product.price;

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  return (
    <>
      <Card className="group flex flex-col h-full overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1">
        <div className="relative">
          <Link to={`/product/${product.id}`} className="block">
            <div className="aspect-square bg-slate-100 overflow-hidden">
              <img
                src={imageSrc}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>

          <button
            type="button"
            onClick={handleWishlist}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors ${
              inWishlist
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <HiHeart className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col flex-1 p-4">
          <span className="text-xs font-semibold tracking-wider text-emerald-600 uppercase">
            {categoryLabel}
          </span>

          <Link
            to={`/product/${product.id}`}
            className="mt-1 font-bold text-slate-900 line-clamp-2 hover:text-emerald-600 transition-colors"
          >
            {product.name}
          </Link>

          <div className="flex items-center gap-1 mt-2" aria-label={`Rating ${product.rating} out of 5`}>
            {renderStars(product.rating)}
            <span className="text-xs text-slate-500 ml-1">
              ({product.num_reviews || 0})
            </span>
          </div>

          <div className="mt-3 flex items-end gap-2">
            <span className="text-lg font-extrabold text-slate-900">
              {formatPrice(displayPrice)}{' '}
              <span className="text-sm font-medium text-slate-500">ETB</span>
            </span>
            {hasDiscount && (
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(product.price)} ETB
              </span>
            )}
          </div>

          <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
            <Button variant="primary" disabled={isAdding} onClick={handleAddToCart}>
              <span className="inline-flex items-center justify-center gap-1">
                <HiShoppingCart className="w-4 h-4" />
                {isAdding ? 'Adding…' : 'Add to Cart'}
              </span>
            </Button>
            <button
              type="button"
              onClick={() => setQuickViewOpen(true)}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-medium text-sm border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all duration-200"
            >
              <HiEye className="w-4 h-4" />
              Quick View
            </button>
          </div>
        </div>
      </Card>

      <Modal isOpen={quickViewOpen} onClose={() => setQuickViewOpen(false)} title={product.name}>
        <div className="space-y-4">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-48 object-cover rounded-xl bg-slate-100"
          />
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            {categoryLabel}
          </p>
          <div className="flex items-center gap-1">
            {renderStars(product.rating)}
            <span className="text-xs text-slate-500 ml-1">({product.num_reviews || 0} reviews)</span>
          </div>
          <p className="text-sm text-slate-600 line-clamp-4">
            {product.description || 'No description provided.'}
          </p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xl font-bold text-slate-900">
              {formatPrice(displayPrice)} ETB
            </span>
            <Link
              to={`/product/${product.id}`}
              onClick={() => setQuickViewOpen(false)}
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              View full details
            </Link>
          </div>
          <Button variant="primary" disabled={isAdding} onClick={handleAddToCart}>
            {isAdding ? 'Adding…' : 'Add to Cart'}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ProductCard;
