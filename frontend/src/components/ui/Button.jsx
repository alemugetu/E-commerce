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
      "bg-indigo-500 hover:bg-indigo-600 text-white",

    secondary:
      "bg-emerald-500 hover:bg-emerald-600 text-white",

    danger:
      "bg-red-500 hover:bg-red-600 text-white",

    outline:
      "border border-slate-300 bg-white hover:bg-slate-100 text-slate-900",
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