import { User, Package, MapPin, Heart, BarChart3, Tag, ShoppingCart, Users, TrendingUp, Folder, Settings, Search, DollarSign, Megaphone, Headphones, Truck, FileText } from 'lucide-react';

/**
 * Navigation Configuration — Permission-based sidebar menus
 * 
 * Each array defines the navigation structure for a specific dashboard.
 * Consumed by DashboardShell to render dynamic sidebars without duplication.
 * 
 * Structure:
 *   path   — React Router path (exact match)
 *   label  — Display text in sidebar 
 *   icon   — Lucide React icon component
 *   badge  — Optional badge count (e.g., for notifications)
 *   requiredPermissions — Array of permission codenames required to see this item
 */

/**
 * Customer Dashboard Navigation
 */
export const CUSTOMER_NAV = [
  { path: '/dashboard', label: 'My Profile', icon: User },
  { path: '/dashboard/orders', label: 'Order History', icon: Package },
  { path: '/dashboard/address', label: 'Shipping Address', icon: MapPin },
  { path: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
];

/**
 * Seller Dashboard Navigation — Standalone dashboard for Seller role
 * 
 * Seller has its own dedicated dashboard at /seller, separate from the
 * shared Operations Dashboard used by other operational roles.
 */
export const SELLER_NAV = [
  { path: '/seller', label: 'Dashboard', icon: BarChart3 },
  { path: '/seller/products', label: 'Products', icon: Tag, requiredPermissions: ['view_product'] },
  { path: '/seller/inventory', label: 'Inventory', icon: Package, requiredPermissions: ['view_inventory'] },
  { path: '/seller/orders', label: 'Orders', icon: ShoppingCart, requiredPermissions: ['view_order'] },
  { path: '/seller/customers', label: 'Customers', icon: Users, requiredPermissions: ['view_customuser'] },
];

/**
 * Operations Dashboard Navigation — Permission-based for operational roles
 * 
 * This navigation is shared by Warehouse Manager, Finance Manager,
 * Marketing Manager, Customer Support, Delivery Manager, and Content Manager.
 * 
 * Seller has its own standalone dashboard at /seller and uses SELLER_NAV.
 * 
 * Navigation items are dynamically shown/hidden based on the user's Django permissions.
 */
export const OPERATIONS_NAV = [
  { path: '/operations', label: 'Overview', icon: BarChart3 },
  { path: '/operations/products', label: 'Products', icon: Tag, requiredPermissions: ['view_product'] },
  { path: '/operations/inventory', label: 'Inventory', icon: Package, requiredPermissions: ['view_inventory'] },
  { path: '/operations/orders', label: 'Orders', icon: ShoppingCart, requiredPermissions: ['view_order'] },
  { path: '/operations/customers', label: 'Customers', icon: Users, requiredPermissions: ['view_customuser'] },
  { path: '/operations/finance', label: 'Finance', icon: DollarSign, requiredPermissions: ['view_reports'] },
  { path: '/operations/marketing', label: 'Marketing', icon: Megaphone, requiredPermissions: ['view_category'] },
  { path: '/operations/support', label: 'Customer Support', icon: Headphones, requiredPermissions: ['change_customuser'] },
  { path: '/operations/delivery', label: 'Delivery', icon: Truck, requiredPermissions: ['change_order'] },
  { path: '/operations/content', label: 'Content', icon: FileText, requiredPermissions: ['add_category'] },
];

/**
 * Superuser Dashboard Navigation
 */
export const SUPERUSER_NAV = [
  { path: '/admin', label: 'Overview', icon: TrendingUp },
  { path: '/admin/users', label: 'User Management', icon: User, requiredPermissions: ['add_customuser'] },
  { path: '/admin/categories', label: 'Categories', icon: Folder, requiredPermissions: ['view_category'] },
  { path: '/admin/settings', label: 'Store Settings', icon: Settings, requiredPermissions: ['change_storesettings'] },
  { path: '/admin/reports', label: 'Reports', icon: BarChart3, requiredPermissions: ['view_reports'] },
  { path: '/admin/audit', label: 'Audit Log', icon: Search, requiredPermissions: ['view_auditlog'] },
];

/**
 * Helper function to get nav config by dashboard type
 * Usage: const navItems = getNavByDashboardType('operations');
 */
export const getNavByDashboardType = (dashboardType) => {
  switch (dashboardType) {
    case 'customer':
      return CUSTOMER_NAV;
    case 'seller':
      return SELLER_NAV;
    case 'operations':
      return OPERATIONS_NAV;
    case 'superuser':
      return SUPERUSER_NAV;
      
    default:
      return [];
  }
};

/**
 * Helper function to get nav config by user (legacy compatibility)
 * Usage: const navItems = getNavByRole(user);
 * 
 * @deprecated Use getNavByDashboardType with getDashboardType from groupRoutes.js instead
 */
export const getNavByRole = (user) => {
  if (!user) return [];

  if (user.is_superuser) return SUPERUSER_NAV;
  
  // Check if user is in Seller group
  if (user.groups && user.groups.includes('Seller')) return SELLER_NAV;
  
  // Check if user is in any operational group
  const operationalGroups = ['Warehouse Manager', 'Finance Manager', 'Marketing Manager', 'Customer Support', 'Delivery Manager', 'Content Manager'];
  if (user.groups && user.groups.some(g => operationalGroups.includes(g))) return OPERATIONS_NAV;
  
  return CUSTOMER_NAV;
};

/**
 * Helper function to determine default redirect path after login
 * @deprecated Use getDashboardRouteForGroups from groupRoutes.js instead
 */
export const getDefaultDashboardPath = (user) => {
  if (!user) return '/';

  if (user.is_superuser) return '/admin';
  
  // Check if user is in Seller group
  if (user.groups && user.groups.includes('Seller')) return '/seller';
  
  // Check if user is in any operational group
  const operationalGroups = ['Warehouse Manager', 'Finance Manager', 'Marketing Manager', 'Customer Support', 'Delivery Manager', 'Content Manager'];
  if (user.groups && user.groups.some(g => operationalGroups.includes(g))) return '/operations';
  
  return '/dashboard';
};
