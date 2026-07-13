import React from 'react';
import { MetricCard } from '../../components/shared';

const OperationsDashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">Operations</p>
        <h1 className="mt-1 text-2xl font-black text-slate-100">
          Operations Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Unified dashboard for all operational roles
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Products" value="—" tone="from-purple-500 to-purple-700" />
        <MetricCard label="Total Orders" value="—" tone="from-emerald-500 to-teal-600" />
        <MetricCard label="Pending Tasks" value="—" tone="from-amber-500 to-orange-500" />
        <MetricCard label="Active Users" value="—" tone="from-indigo-500 to-indigo-700" />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <p className="text-sm font-bold text-slate-200 mb-4">Operations Overview</p>
        <p className="text-slate-400 text-sm">
          This dashboard provides a unified interface for all operational roles. 
          Navigation items are dynamically displayed based on your Django permissions.
        </p>
      </div>
    </div>
  );
};

export default OperationsDashboard;
