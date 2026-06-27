import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductDetails } from '../hooks/useProductDetails';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const ProductDetail = () => {
  const { id } = useParams(); // Read dynamic :id straight out of the URL string
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProductDetails(id);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <Card className="p-6 border-red-100 bg-red-50/50">
          <h3 className="font-bold text-red-800 text-lg">Product Information Unavailable</h3>
          <p className="text-slate-600 text-sm mt-1">The item may have been unlisted or removed from inventory.</p>
          <Button variant="primary" className="mt-4 w-full" onClick={() => navigate('/')}>
            Return to Marketplace
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb Navigation trail */}
      <nav className="mb-8 text-sm text-slate-500 font-medium">
        <Link to="/" className="hover:text-indigo-600 transition-colors">Marketplace</Link>
        <span className="mx-2 text-slate-300">/</span>
        <span className="text-slate-800 truncate max-w-[200px] inline-block align-bottom">{product.name}</span>
      </nav>

      {/* Two-Column split details layout layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Side: Product Image Display Panel */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex justify-center items-center aspect-square overflow-hidden">
          <img 
            src={product.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop&q=60"} 
            alt={product.name} 
            className="object-cover w-full h-full rounded-xl hover:scale-102 transition-transform duration-300"
          />
        </div>

        {/* Right Side: Specifications & Transaction Interactivity Box */}
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase rounded-full tracking-wider">
              {product.category || "General"}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-4">
              {product.name}
            </h1>
            
            <p className="text-3xl font-black text-slate-900 mt-6 border-b border-slate-100 pb-4">
              {product.price} <span className="text-lg font-bold text-slate-500">ETB</span>
            </p>

            <div className="mt-6">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Product Description</h4>
              <p className="text-slate-600 text-base leading-relaxed mt-2">
                {product.description || "Detailed specification overview not yet drafted for this asset record."}
              </p>
            </div>
          </div>

          <div className="mt-12 bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full">
              <Button variant="primary" className="w-full py-3 text-base shadow-sm font-semibold">
                Add This Item to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

