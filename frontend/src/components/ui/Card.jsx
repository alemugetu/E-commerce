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
        bg-white
        border border-slate-200
        rounded-xl
        shadow-sm
        overflow-hidden
        transition-all
        duration-200
        ${isClickable ? "cursor-pointer hover:shadow-md hover:border-slate-300" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
