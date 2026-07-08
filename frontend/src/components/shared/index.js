/**
 * Shared Components — Central export point
 * 
 * Import shared dashboard components like this:
 *   import { DashboardShell, MetricCard, DataTable } from '@/components/shared';
 */

export { default as DashboardShell } from './DashboardShell';
export { default as MetricCard } from './MetricCard';
export { default as DataTable } from './DataTable';
export { default as LoadingSkeleton, MetricCardSkeleton, TableRowSkeleton } from './LoadingSkeleton';
export { default as StatusBadge } from './StatusBadge';
export { default as ConfirmModal } from './ConfirmModal';
