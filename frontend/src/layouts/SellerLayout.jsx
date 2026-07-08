import React from 'react';
import { DashboardShell } from '../components/shared';
import { SELLER_NAV } from '../config/navConfig';

/**
 * SellerLayout — Layout wrapper for all /seller routes
 * 
 * Uses DashboardShell with seller-specific nav config and theme.
 * All seller pages are rendered through <Outlet /> inside DashboardShell.
 */
const SellerLayout = () => {
  return (
    <DashboardShell
      navConfig={SELLER_NAV}
      dashboardTitle="Seller Dashboard"
      dashboardType="seller"
      showExitToStore={true}
    />
  );
};

export default SellerLayout;
