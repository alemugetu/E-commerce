import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useAddToCart } from '../hooks/useAddToCart';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Home = () => {
  const { data: products, isLoading, isError, error } = useProducts();
  const { addItem, isAdding } = useAddToCart();

  if (isLoading) {
    return (
      <div className="py-24 max-w-7xl mx-auto px-4 text-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse p-4">
              <div className="bg-slate-200 h-48 w-full rounded-lg mb-4" />
              <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700">
          <h3 className="font-bold text-lg mb-2">Failed to Load Products</h3>
          <p className="text-sm opacity-90">{error?.message || "Please check your network connection."}</p>
        </div>
      </div>
    );
  }

  const productList = Array.isArray(products)
    ? products
    : products?.results || products?.data || [];

  if (productList.length === 0) {
    return (
      <div className="py-24 text-center text-slate-500 max-w-md mx-auto px-4">
        <h3 className="font-bold text-xl text-slate-800 mb-2">No Products Found</h3>
        <p className="text-sm">Our catalog is currently undergoing an update. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Our Collection</h1>
        <p className="text-slate-500 mt-2 text-sm">Premium curated hardware and tools delivered right to your door.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productList.map((product) => {
          let imageSrc = product.images?.[0]?.image_url 
            || product.images?.[0]?.image 
            || "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
          if (imageSrc && typeof imageSrc === 'string' && imageSrc.startsWith('/media/')) {
            imageSrc = `http://127.0.0.1:8000${imageSrc}`;
          }

          const categoryLabel = product.category_detail?.name || "General";

          return (
            <Card key={product.id} className="flex flex-col justify-between overflow-hidden h-full group">
              
              <Link to={`/product/${product.id}`} className="block focus:outline-none cursor-pointer flex-1">
                <div className="bg-slate-100 aspect-video w-full rounded-lg overflow-hidden relative mb-4">
                  <img 
                    src={imageSrc} 
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="px-1">
                  <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
                    {categoryLabel}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1 line-clamp-2 min-h-[40px]">
                    {product.description || "No description provided."}
                  </p>
                </div>
              </Link>

              {/* Action Footer */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between px-1">
                <span className="text-lg font-extrabold text-slate-900">
                  {product.price} <span className="text-sm font-medium text-slate-500">ETB</span>
                </span>
                
                {/* 3. WIRE UP THE ONCLICK EVENT HERE */}
                <Button 
                  variant="primary" 
                  size="sm"
                  disabled={isAdding}
                  onClick={(e) => {
                    // Prevent the click from bubbling up into the <Link> wrapper
                    e.preventDefault();
                    e.stopPropagation();
                    addItem(product, 1);
                  }}
                >
                  {isAdding ? 'Adding…' : 'Add to Cart'}
                </Button>
              </div>

            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Home;

