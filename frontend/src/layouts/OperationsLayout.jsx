import React from 'react';
import { DashboardShell } from '../components/shared';
import { OPERATIONS_NAV } from '../config/navConfig';

/**
 * OperationsLayout — Layout wrapper for all /operations routes
 * 
 * Shared dashboard for operational roles (Warehouse Manager, Finance Manager,
 * Marketing Manager, Customer Support, Delivery Manager, Content Manager).
 * 
 * Seller has its own standalone dashboard at /seller.
 * 
 * Uses DashboardShell with permission-based navigation that dynamically
 * shows/hides modules based on the user's Django permissions.
 * 
 * This eliminates the need for separate dashboards per operational role
 * and enables scalable, permission-driven UI.
 */
const OperationsLayout = () => {
  return (
    <DashboardShell
      navConfig={OPERATIONS_NAV}
      dashboardTitle="Operations Dashboard"
      dashboardType="operations"
      showExitToStore={true}
    />
  );
};

export default OperationsLayout;
