import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiAdjustmentsHorizontal } from 'react-icons/hi2';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import ProductCard from '../components/products/ProductCard';
import ProductFilterSidebar from '../components/products/ProductFilterSidebar';
import Card from '../components/ui/Card';
import { normalizeListResponse } from '../utils/productUtils';
import { api } from '../services/api';

const DEFAULT_FILTERS = {
  search: '',
  category: '',
  brand: '',
  is_available: '',
  price_min: '',
  price_max: '',
  min_rating: '',
  page: 1,
};

const ProductSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="animate-pulse p-4 h-[420px]">
        <div className="bg-slate-200 h-48 w-full rounded-lg mb-4" />
        <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
        <div className="h-10 bg-slate-200 rounded w-full mt-auto" />
      </Card>
    ))}
  </div>
);

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
  }));
  const [brands, setBrands] = useState([]);
  const [searchDebounce, setSearchDebounce] = useState(filters.search);

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(filters.search);
      setFilters((prev) => ({ ...prev, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const queryParams = useMemo(() => {
    const params = {
      page: filters.page,
      search: searchDebounce || undefined,
      category__slug: filters.category || undefined,
      brand: filters.brand || undefined,
      is_available: filters.is_available || undefined,
      price_min: filters.price_min || undefined,
      price_max: filters.price_max || undefined,
      min_rating: filters.min_rating || undefined,
    };
    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value != null)
    );
  }, [filters, searchDebounce]);

  const { data, isLoading, isError, error } = useProducts(queryParams);
  const { results: products, count, next, previous } = normalizeListResponse(data);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const { data: brandData } = await api.get('/products/', { params: { page_size: 100 } });
        const items = normalizeListResponse(brandData).results;
        const uniqueBrands = [...new Set(items.map((item) => item.brand).filter(Boolean))].sort();
        setBrands(uniqueBrands);
      } catch {
        setBrands([]);
      }
    };
    loadBrands();
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

    if (key === 'category') {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);
        if (value) nextParams.set('category', value);
        else nextParams.delete('category');
        return nextParams;
      });
    }
  }, [setSearchParams]);

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchParams({});
  };

  const totalPages = Math.max(1, Math.ceil((count || 0) / 12));

  return (
    <div className="pb-12">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Shop Products
        </h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">
          Browse our full catalog with filters tailored to what you need.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden mb-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
      >
        <HiAdjustmentsHorizontal className="w-5 h-5" />
        Filters
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        <div
          className={`${
            sidebarOpen ? 'fixed inset-0 z-40 lg:static lg:inset-auto' : 'hidden lg:block'
          } lg:w-72 shrink-0`}
        >
          {sidebarOpen && (
            <button
              type="button"
              className="fixed inset-0 bg-slate-900/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close filter overlay"
            />
          )}
          <div className={`${sidebarOpen ? 'fixed inset-y-0 left-0 z-50 w-[min(100%,20rem)] overflow-y-auto p-4 lg:p-0 lg:static lg:w-full lg:overflow-visible' : ''}`}>
            {!categoriesLoading && (
              <ProductFilterSidebar
                categories={categories}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                brands={brands}
                onClose={() => setSidebarOpen(false)}
                isMobile={sidebarOpen}
              />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm text-slate-500">
              {isLoading ? 'Loading products…' : `${count || 0} product${count === 1 ? '' : 's'} found`}
            </p>
          </div>

          {isLoading && <ProductSkeleton />}

          {isError && (
            <div className="py-12 text-center max-w-md mx-auto">
              <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                <h3 className="font-bold text-lg mb-2">Failed to Load Products</h3>
                <p className="text-sm opacity-90">
                  {error?.message || 'Please check your network connection.'}
                </p>
              </div>
            </div>
          )}

          {!isLoading && !isError && products.length === 0 && (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
              <h3 className="font-bold text-xl text-slate-800 mb-2">No Products Found</h3>
              <p className="text-sm text-slate-500 mb-4">
                Try adjusting your filters or search terms.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Clear all filters
              </button>
            </div>
          )}

          {!isLoading && !isError && products.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={!previous}
                    onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-500">
                    Page {filters.page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={!next}
                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
