import React from 'react';

const Card = ({ 
  children, 
  className = "", 
  onClick 
}) => {
  // Determine if the card should exhibit interactive behavior
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-800
        rounded-xl
        shadow-sm
        overflow-hidden
        transition-all
        duration-200
        ${isClickable ? "cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
