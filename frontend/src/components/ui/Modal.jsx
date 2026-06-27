import React from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}) => {
  // If the visibility flag evaluates to false, stop execution and render nothing
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      {/* 1. Backdrop Background Blur Overlay Overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* 2. Modal Content Window Block */}
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-10 transition-all duration-300 transform scale-100"
      >
        {/* Header Segment */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body Segment */}
        <div className="px-6 py-4 text-sm text-slate-600">
          {children}
        </div>
      </div>

    </div>
  );
};

export default Modal;

