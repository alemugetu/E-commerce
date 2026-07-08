import React from 'react';
import { DashboardShell } from '../components/shared';
import { SUPERUSER_NAV } from '../config/navConfig';

/**
 * SuperuserLayout — Layout wrapper for all /admin routes
 * 
 * Uses DashboardShell with superuser-specific nav config and theme.
 * All superuser pages are rendered through <Outlet /> inside DashboardShell.
 * 
 * Phase 3: This replaces AdminLayout which used AdminTabContext (state-based tabs).
 * We now use proper URL-based routing with React Router.
 */
const SuperuserLayout = () => {
  return (
    <DashboardShell
      navConfig={SUPERUSER_NAV}
      dashboardTitle="Superuser Panel"
      dashboardType="superuser"
      showExitToStore={true}
    />
  );
};

export default SuperuserLayout;
