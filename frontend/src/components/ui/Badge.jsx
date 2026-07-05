import React from 'react';

const Badge = ({ 
  children, 
  variant = "info" 
}) => {
  // Define strict Tailwind v4 style mappings for each status token
  const variants = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    info: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        px-2.5
        py-0.5
        text-xs
        font-semibold
        rounded-full
        border
        transition-colors
        duration-150
        ${variants[variant] || variants.info}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;

