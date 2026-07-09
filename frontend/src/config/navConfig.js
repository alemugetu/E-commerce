/**
 * Navigation Configuration — Role-based sidebar menus
 * 
 * Each array defines the navigation structure for a specific dashboard.
 * Consumed by DashboardShell to render dynamic sidebars without duplication.
 * 
 * Structure:
 *   path   — React Router path (exact match)
 *   label  — Display text in sidebar 
 *   icon   — Emoji or icon character
 *   badge  — Optional badge count (e.g., for notifications)
 */

/**
 * Customer Dashboard Navigation
 */
export const CUSTOMER_NAV = [
  { path: '/dashboard', label: 'My Profile', icon: '👤' },
  { path: '/dashboard/orders', label: 'Order History', icon: '📦' },
  { path: '/dashboard/address', label: 'Shipping Address', icon: '📍' },
  { path: '/dashboard/wishlist', label: 'Wishlist', icon: '❤️' },
];

/**
 * Seller Dashboard Navigation
 */
export const SELLER_NAV = [
  { path: '/seller', label: 'Dashboard', icon: '📊' },
  { path: '/seller/products', label: 'Products', icon: '🏷️', requiredPermissions: ['view_product'] },
  { path: '/seller/inventory', label: 'Inventory', icon: '📦', requiredPermissions: ['view_inventory'] },
  { path: '/seller/orders', label: 'Orders', icon: '🛒', requiredPermissions: ['view_order'] },
  { path: '/seller/customers', label: 'Customers', icon: '👥', requiredPermissions: ['view_customuser'] },
];

/**
 * Superuser Dashboard Navigation
 */
export const SUPERUSER_NAV = [
  { path: '/admin', label: 'Overview', icon: '📈' },
  { path: '/admin/users', label: 'User Management', icon: '👤', requiredPermissions: ['add_customuser'] },
  { path: '/admin/categories', label: 'Categories', icon: '📂', requiredPermissions: ['view_category'] },
  { path: '/admin/settings', label: 'Store Settings', icon: '⚙️', requiredPermissions: ['change_storesettings'] },
  { path: '/admin/reports', label: 'Reports', icon: '📊', requiredPermissions: ['view_reports'] },
  { path: '/admin/audit', label: 'Audit Log', icon: '🔍', requiredPermissions: ['view_auditlog'] },
];

/**
 * Helper function to get nav config by role
 * Usage: const navItems = getNavByRole(user);
 */
export const getNavByRole = (user) => {
  if (!user) return [];

  if (user.is_superuser) return SUPERUSER_NAV;
  if (user.is_staff) return SELLER_NAV;
  return CUSTOMER_NAV;
};

/**
 * Helper function to determine default redirect path after login
 */
export const getDefaultDashboardPath = (user) => {
  if (!user) return '/';

  if (user.is_superuser) return '/admin';
  if (user.is_staff) return '/seller';
  return '/dashboard';
};
