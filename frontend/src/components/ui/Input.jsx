import React from 'react';

const Input = ({
  type = "text",
  label,
  error,
  placeholder,
  value,
  onChange,
  disabled = false,
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {/* Label Render block */}
      {label && (
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      {/* Input Element */}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
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
          transition-all
          duration-150
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          disabled:bg-slate-50 dark:disabled:bg-slate-800
          disabled:text-slate-400
          disabled:cursor-not-allowed
          ${error 
            ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/20" 
            : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/20"}
        `}
        {...props}
      />

      {/* Dynamic Error Messaging field */}
      {error && (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;

