import React from 'react';
import { Link } from 'react-router-dom';
import { HiShoppingBag, HiArrowRight, HiArrowTopRightOnSquare } from 'react-icons/hi2';
import { useCategories } from '../hooks/useCategories';
import { getCategoryIcon } from '../utils/categoryIcons';
import Card from '../components/ui/Card';

const CategorySkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="animate-pulse p-6 h-52">
        <div className="bg-slate-200 w-12 h-12 rounded-xl mb-4" />
        <div className="h-5 bg-slate-200 rounded w-2/3 mb-2" />
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-6" />
        <div className="h-9 bg-slate-200 rounded w-full" />
      </Card>
    ))}
  </div>
);

const Home = () => {
  const { data: categories = [], isLoading, isError, error } = useCategories();

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <section
        aria-labelledby="hero-heading"
        className="-mx-4 sm:-mx-6 lg:-mx-8 mb-14 sm:mb-16"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-white border border-emerald-100/70 shadow-sm px-6 py-16 sm:py-20 lg:py-24 text-center">
          <div
            className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-100/40 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-50/60 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative max-w-3xl mx-auto">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-emerald-600 mb-4">
              Welcome to
            </p>
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight"
            >
              STORE.ET
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Ethiopia&apos;s trusted marketplace for quality products — curated selection,
              fair prices, and delivery you can rely on.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <HiShoppingBag className="w-5 h-5" aria-hidden="true" />
                Shop Now
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                Start Free / Register
                <HiArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="scroll-mt-24">
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Shop by Category
          </h2>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            Discover products organized by what matters to you.
          </p>
        </div>

        {isLoading && <CategorySkeleton />}

        {isError && (
          <div className="py-12 text-center max-w-md mx-auto">
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700">
              <h3 className="font-bold text-lg mb-2">Failed to Load Categories</h3>
              <p className="text-sm opacity-90">
                {error?.message || 'Please check your network connection.'}
              </p>
            </div>
          </div>
        )}

        {!isLoading && !isError && categories.length === 0 && (
          <div className="py-12 text-center text-slate-500 max-w-md mx-auto">
            <h3 className="font-bold text-xl text-slate-800 mb-2">No Categories Yet</h3>
            <p className="text-sm">Categories will appear here once they are added.</p>
          </div>
        )}

        {!isLoading && !isError && categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.name, category.slug);

              return (
                <Card
                  key={category.id}
                  className="group flex flex-col h-full p-6 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{category.name}</h3>

                  <Link
                    to={`/products?category=${category.slug}`}
                    className="mt-auto pt-6 inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 border border-emerald-200 bg-white hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-200"
                  >
                    Explore
                    <HiArrowTopRightOnSquare className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
