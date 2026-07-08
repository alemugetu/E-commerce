import React from 'react';

/**
 * LoadingSkeleton — Reusable animated placeholder for loading states
 * 
 * Props:
 *   className — additional Tailwind classes (controls height, width, etc.)
 *   count     — how many skeleton rows to render (default: 1)
 */

const LoadingSkeleton = ({ className = 'h-4 w-full', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded bg-slate-800/60 ${className}`}
        />
      ))}
    </>
  );
};

/**
 * Pre-composed skeleton for a metric card grid
 */
export const MetricCardSkeleton = () => (
  <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5 animate-pulse">
    <div className="h-3 w-28 rounded bg-slate-700 mb-4" />
    <div className="h-7 w-20 rounded bg-slate-700" />
    <div className="h-3 w-16 rounded bg-slate-700/60 mt-2" />
  </div>
);

/**
 * Pre-composed skeleton for a table row
 */
export const TableRowSkeleton = ({ cols = 4 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-3 pr-4 pl-1">
        <div className="h-4 w-full rounded bg-slate-800/60 animate-pulse" />
      </td>
    ))}
  </tr>
);

export default LoadingSkeleton;
