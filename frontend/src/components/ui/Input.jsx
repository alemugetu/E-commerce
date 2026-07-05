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
        <label className="text-sm font-semibold text-slate-700">
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
          bg-white
          border
          rounded-lg
          outline-none
          transition-all
          duration-150
          placeholder:text-slate-400
          disabled:bg-slate-50
          disabled:text-slate-400
          disabled:cursor-not-allowed
          ${error 
            ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100" 
            : "border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"}
        `}
        {...props}
      />

      {/* Dynamic Error Messaging field */}
      {error && (
        <p className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;

