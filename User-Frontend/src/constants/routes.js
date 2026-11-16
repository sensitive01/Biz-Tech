/**
 * Application Route Paths
 */
export const ROUTES = {
  // Public
  HOME: '/',
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  IMPERSONATE: '/impersonate',

  // Onboarding
  SELECT_TYPE: '/select-type',
  SELECT_MODULES: '/select-modules',
  ONBOARDING: '/onboarding',

  // Tenant Portal
  TENANT: {
    ROOT: '/tenant',
    DASHBOARD: '/tenant/dashboard',
    BUSINESSES: '/tenant/businesses',
    BRANCHES: '/tenant/branches',
    PRODUCTS: '/tenant/products',
    INVENTORY: '/tenant/inventory',
    CUSTOMERS: '/tenant/customers',
    EXPENSES: '/tenant/expenses',
    SALES: '/tenant/sales',
    PURCHASES: '/tenant/purchases',
    REMINDERS: '/tenant/reminders',
    DOCUMENTS: '/tenant/documents',
    EMPLOYEES: '/tenant/employees',
    ATTENDANCE: '/tenant/attendance',
    LEAVES: '/tenant/leaves',
    INVESTORS: '/tenant/investors',
    PROFILE: '/tenant/profile',
    BILLING: '/tenant/billing',
  },

  // Fallback
  NOT_FOUND: '*',
};

export default ROUTES;

