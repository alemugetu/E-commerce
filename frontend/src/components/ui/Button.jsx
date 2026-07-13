const Button = ({
  children,
  type = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  onClick,
}) => {
  const variants = {
    primary:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20",

    secondary:
      "border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",

    danger:
      "bg-red-500 hover:bg-red-600 text-white",

    outline:
      "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        px-5 py-3
        rounded-lg
        font-medium
        transition-all
        duration-200
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant]}
      `}
    >
      {loading? "Loading...": children}
    </button>
  );
};

export default Button;