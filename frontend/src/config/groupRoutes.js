/**
 * Dashboard Routing Configuration
 * 
 * Centralized configuration for permission-driven dashboard routing.
 * Supports the four-dashboard architecture:
 * - Customer Dashboard: For regular customers (no groups)
 * - Seller Dashboard: Standalone dashboard for Seller role
 * - Operations Dashboard: Shared dashboard for operational roles (excluding Seller)
 * - Superuser Dashboard: Complete administrative interface
 */

// Operational groups that should use the shared Operations Dashboard
// Seller is excluded - has its own standalone dashboard
const OPERATIONAL_GROUPS = [
  'Warehouse Manager',
  'Finance Manager',
  'Marketing Manager',
  'Customer Support',
  'Delivery Manager',
  'Content Manager',
];

/**
 * Get the dashboard route for a user based on their groups and superuser status
 * @param {Array} groups - User's Django group names
 * @param {boolean} is_superuser - Whether user is a superuser
 * @returns {string} - Dashboard route
 */
export const getDashboardRouteForGroups = (groups, is_superuser = false) => {
  // Priority 1: Superuser always goes to admin dashboard
  if (is_superuser) {
    return '/admin';
  }

  // Priority 2: Seller goes to standalone Seller dashboard
  if (isInGroup(groups, 'Seller')) {
    return '/seller';
  }

  // Priority 3: Customer (no groups) goes to customer dashboard
  if (!groups || groups.length === 0) {
    return '/dashboard';
  }

  // Priority 4: Any operational group goes to shared Operations Dashboard
  const hasOperationalGroup = groups.some(group => 
    OPERATIONAL_GROUPS.map(x => x.toLowerCase()).includes(String(group).toLowerCase())
  );
  if (hasOperationalGroup) {
    return '/operations';
  }

  // Priority 5: Unknown groups - default to customer dashboard for now
  // This could be changed to Access Denied if needed
  return '/dashboard';
};

/**
 * Get the dashboard type for a user (used for backend API compatibility)
 * @param {Array} groups - User's Django group names
 * @param {boolean} is_superuser - Whether user is a superuser
 * @returns {string} - Dashboard type: 'customer' | 'seller' | 'operations' | 'superuser' | 'unauthorized'
 */
export const getDashboardType = (groups, is_superuser = false) => {
  if (is_superuser) {
    return 'superuser';
  }

  if (isInGroup(groups, 'Seller')) {
    return 'seller';
  }

  if (!groups || groups.length === 0) {
    return 'customer';
  }

  const hasOperationalGroup = groups.some(group => 
    OPERATIONAL_GROUPS.map(x => x.toLowerCase()).includes(String(group).toLowerCase())
  );
  if (hasOperationalGroup) {
    return 'operations';
  }

  return 'unauthorized';
};

/**
 * Check if a user belongs to a specific group
 * @param {Array} groups - User's Django group names
 * @param {string} groupName - Group name to check
 * @returns {boolean}
 */
export const isInGroup = (groups, groupName) => {
  return groups && groups.includes(groupName);
};

/**
 * Check if user has any of the specified groups
 * @param {Array} groups - User's Django group names
 * @param {Array} groupNames - Group names to check
 * @returns {boolean}
 */
export const hasAnyGroup = (groups, groupNames) => {
  if (!groups || !groupNames) return false;
  return groupNames.some(groupName => groups.includes(groupName));
};

/**
 * Check if user belongs to any operational group
 * @param {Array} groups - User's Django group names
 * @returns {boolean}
 */
export const isOperationalUser = (groups) => {
  if (!groups || groups.length === 0) return false;
  return groups.some(group => 
    OPERATIONAL_GROUPS.map(x => x.toLowerCase()).includes(String(group).toLowerCase())
  );
};

/**
 * Check if user should access the Operations Dashboard
 * @param {Array} groups - User's Django group names
 * @param {boolean} is_superuser - Whether user is a superuser
 * @returns {boolean}
 */
export const canAccessOperationsDashboard = (groups, is_superuser = false) => {
  // Superusers have their own dashboard
  if (is_superuser) return false;
  
  // Only operational users can access Operations Dashboard
  return isOperationalUser(groups);
};
