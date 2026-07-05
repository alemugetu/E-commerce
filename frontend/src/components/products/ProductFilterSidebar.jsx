import React, { useMemo, useState } from 'react';
import { HiMagnifyingGlass, HiChevronDown, HiXMark } from 'react-icons/hi2';
import { FaStar } from 'react-icons/fa';

const AccordionSection = ({ title, isOpen, onToggle, children }) => (
  <div className="border-b border-slate-100 last:border-b-0">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between py-3 text-sm font-semibold text-slate-800 hover:text-emerald-600 transition-colors"
      aria-expanded={isOpen}
    >
      {title}
      <HiChevronDown
        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        aria-hidden="true"
      />
    </button>
    {isOpen && <div className="pb-4">{children}</div>}
  </div>
);

const ProductFilterSidebar = ({
  categories,
  filters,
  onFilterChange,
  onClearFilters,
  brands,
  onClose,
  isMobile,
}) => {
  const [openSections, setOpenSections] = useState({
    price: true,
    rating: false,
    availability: false,
    brand: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const flatCategories = useMemo(() => {
    const flatten = (items, depth = 0) =>
      items.flatMap((category) => [
        { ...category, depth },
        ...(category.children?.length ? flatten(category.children, depth + 1) : []),
      ]);
    return flatten(categories);
  }, [categories]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-fit lg:sticky lg:top-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900">Filters</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Clear all
          </button>
          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Close filters"
            >
              <HiXMark className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="relative mb-5">
        <HiMagnifyingGlass
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition"
        />
      </div>

      <div className="mb-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Categories</h3>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => onFilterChange('category', '')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !filters.category
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {flatCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onFilterChange('category', category.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.category === category.slug
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              style={{ paddingLeft: `${12 + category.depth * 12}px` }}
            >
              {category.name}
              {category.product_count != null && (
                <span className="text-slate-400 ml-1">({category.product_count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <AccordionSection
        title="Price Range"
        isOpen={openSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            value={filters.price_min}
            onChange={(e) => onFilterChange('price_min', e.target.value)}
            placeholder="Min"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
          <input
            type="number"
            min="0"
            value={filters.price_max}
            onChange={(e) => onFilterChange('price_max', e.target.value)}
            placeholder="Max"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </div>
      </AccordionSection>

      <AccordionSection
        title="Rating"
        isOpen={openSections.rating}
        onToggle={() => toggleSection('rating')}
      >
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900"
            >
              <input
                type="radio"
                name="min_rating"
                checked={String(filters.min_rating) === String(rating)}
                onChange={() => onFilterChange('min_rating', String(rating))}
                className="accent-emerald-600"
              />
              <span className="inline-flex items-center gap-1">
                {rating}+ <FaStar className="w-3 h-3 text-amber-400" />
              </span>
            </label>
          ))}
          <button
            type="button"
            onClick={() => onFilterChange('min_rating', '')}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Any rating
          </button>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Availability"
        isOpen={openSections.availability}
        onToggle={() => toggleSection('availability')}
      >
        <div className="space-y-2">
          {[
            { value: '', label: 'All products' },
            { value: 'true', label: 'In stock' },
            { value: 'false', label: 'Out of stock' },
          ].map((option) => (
            <label
              key={option.label}
              className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900"
            >
              <input
                type="radio"
                name="availability"
                checked={String(filters.is_available) === option.value}
                onChange={() => onFilterChange('is_available', option.value)}
                className="accent-emerald-600"
              />
              {option.label}
            </label>
          ))}
        </div>
      </AccordionSection>

      <AccordionSection
        title="Brand"
        isOpen={openSections.brand}
        onToggle={() => toggleSection('brand')}
      >
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {brands.length === 0 ? (
            <p className="text-xs text-slate-500">No brands available</p>
          ) : (
            brands.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900"
              >
                <input
                  type="radio"
                  name="brand"
                  checked={filters.brand === brand}
                  onChange={() => onFilterChange('brand', brand)}
                  className="accent-emerald-600"
                />
                {brand}
              </label>
            ))
          )}
          {filters.brand && (
            <button
              type="button"
              onClick={() => onFilterChange('brand', '')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Any brand
            </button>
          )}
        </div>
      </AccordionSection>
    </div>
  );
};

export default ProductFilterSidebar;
