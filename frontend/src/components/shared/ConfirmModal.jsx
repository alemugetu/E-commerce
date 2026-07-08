import React from 'react';

/**
 * ConfirmModal — Professional confirmation dialog to replace window.confirm()
 * 
 * Props:
 *   isOpen      — boolean to control visibility
 *   onClose     — callback when modal is dismissed
 *   onConfirm   — callback when user confirms
 *   title       — modal title (default: "Confirm Action")
 *   message     — body text
 *   confirmText — confirm button label (default: "Confirm")
 *   cancelText  — cancel button label (default: "Cancel")
 *   variant     — 'danger' | 'warning' | 'info' (default: 'danger')
 *   isLoading   — show loading spinner on confirm button when true
 */

const ConfirmModal = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const variantClasses = {
    danger: 'bg-rose-600 hover:bg-rose-500 focus:ring-rose-500',
    warning: 'bg-amber-600 hover:bg-amber-500 focus:ring-amber-500',
    info: 'bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-500',
  };

  const buttonClass = variantClasses[variant] || variantClasses.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-message"
      >
        {/* Header */}
        <div className="mb-4">
          <h3
            id="modal-title"
            className="text-lg font-bold text-slate-100"
          >
            {title}
          </h3>
        </div>

        {/* Body */}
        {message && (
          <div className="mb-6">
            <p
              id="modal-message"
              className="text-sm text-slate-300 leading-relaxed"
            >
              {message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`
              px-4 py-2 rounded-xl text-sm font-bold text-white transition
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2
              ${buttonClass}
            `}
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
