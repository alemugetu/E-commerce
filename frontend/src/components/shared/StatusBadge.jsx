import React from 'react';

/**
 * StatusBadge — Reusable colored badge for statuses
 * 
 * Props:
 *   status — the status value (string)
 *   variant — 'success' | 'warning' | 'danger' | 'info' | 'neutral' (auto-detected if not provided)
 *   size — 'sm' | 'md' | 'lg' (default: 'sm')
 */

const StatusBadge = ({ status, variant, size = 'sm' }) => {
  // Auto-detect variant from common status values if not explicitly provided
  const getVariant = () => {
    if (variant) return variant;
    
    const statusLower = String(status).toLowerCase();
    
    // Success states
    if (['active', 'approved', 'paid', 'delivered', 'available', 'yes', 'true', 'live'].includes(statusLower)) {
      return 'success';
    }
    
    // Warning states
    if (['pending', 'processing', 'reviewing', 'hidden'].includes(statusLower)) {
      return 'warning';
    }
    
    // Danger/error states
    if (['rejected', 'cancelled', 'failed', 'blocked', 'no', 'false', 'inactive'].includes(statusLower)) {
      return 'danger';
    }
    
    // Info states
    if (['shipped', 'in transit'].includes(statusLower)) {
      return 'info';
    }
    
    return 'neutral';
  };

  const variantClasses = {
    success: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30',
    warning: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30',
    danger: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30',
    info: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/20 dark:border-indigo-500/30',
    neutral: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-600',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const computedVariant = getVariant();

  return (
    <span
      className={`
        inline-block rounded-full font-bold uppercase tracking-wider border
        ${variantClasses[computedVariant]}
        ${sizeClasses[size]}
      `}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
