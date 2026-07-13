import React from 'react';

/**
 * MetricCard — Reusable metric display component
 * 
 * Props:
 *   label      — main label (e.g., "Total Products")
 *   value      — primary value to display (e.g., "1,234")
 *   subtitle   — optional secondary info (e.g., "12 out of stock")
 *   tone       — gradient class (e.g., "from-indigo-500 to-indigo-700")
 *   icon       — optional Lucide icon component or emoji
 *   loading    — show skeleton when true
 */

const MetricCard = ({
  label,
  value,
  subtitle,
  tone = 'from-indigo-500 to-indigo-700',
  icon: Icon,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5 animate-pulse">
        <div className="h-3 w-28 rounded bg-slate-700 mb-4" />
        <div className="h-7 w-20 rounded bg-slate-700" />
        <div className="h-3 w-16 rounded bg-slate-700/60 mt-2" />
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${tone} p-5 text-white shadow-lg`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-white/75">{label}</p>
        {Icon && (
          typeof Icon === 'function' || (typeof Icon === 'object' && Icon.$$typeof) ? (
            <Icon className="w-6 h-6 opacity-60" />
          ) : (
            <span className="text-2xl opacity-60">{Icon}</span>
          )
        )}
      </div>
      <p className="mt-3 text-2xl font-black">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-white/60">{subtitle}</p>}
    </div>
  );
};

export default MetricCard;
