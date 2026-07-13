import React from 'react';
import LoadingSkeleton from './LoadingSkeleton';

/**
 * DataTable — Reusable table component for all dashboards
 * 
 * Props:
 *   columns  — array of { key, label, render?, align? }
 *   data     — array of row objects
 *   loading  — show skeleton rows when true
 *   emptyMessage — text shown when data is empty
 *   keyField — the field to use as unique row key (default: 'id')
 */

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found.',
  keyField = 'id',
}) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <LoadingSkeleton key={i} className="h-10 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
        <thead>
          <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-500">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-2.5 pr-4 pl-1 ${col.align === 'right' ? 'text-right' : ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
          {data.map((row) => (
            <tr
              key={row[keyField]}
              className="hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`py-3 pr-4 pl-1 ${col.align === 'right' ? 'text-right' : ''}`}
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : <span className="text-slate-900 dark:text-slate-300">{row[col.key]}</span>
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
