import React from 'react';

const Select = ({
  label,
  options = [],
  error,
  value,
  onChange,
  disabled = false,
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {/* Label Layer */}
      {label && (
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      {/* Select HTML Wrapper Container */}
      <div className="relative w-full">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full
            px-3.5
            py-2.5
            text-sm
            bg-white dark:bg-slate-900
            border
            rounded-lg
            outline-none
            appearance-none
            transition-all
            duration-150
            disabled:bg-slate-50 dark:disabled:bg-slate-800
            disabled:text-slate-400
            disabled:cursor-not-allowed
            ${error 
              ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/20" 
              : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/20"}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom Custom Dropdown SVG Arrow Indicator */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-500 dark:text-slate-400">
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Error Message Section */}
      {error && (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
