// AUTH
export { default as Login } from './auth/Login';
export { default as Register } from './auth/Register';
export { default as Impersonate } from './auth/Impersonate';
export * as authPages from './auth';

// ONBOARDING
export { default as SelectType } from './onboarding/SelectType';
export { default as SelectModules } from './onboarding/SelectModules';
export { default as Onboarding } from './onboarding/Onboarding';
export * as onboardingPages from './onboarding/index';

// DASHBOARD
export { default as TenantDashboard } from './dashboard/TenantDashboard';
export * as dashboardPages from './dashboard';

// STAFF
export { default as Employees } from './staff/Employees';
export { default as Attendance } from './staff/Attendance';
export { default as LeaveRequests } from './staff/LeaveRequests';
export * as staffPages from './staff';

// OPERATIONS
export { default as Products } from './operations/Products';
export { default as Inventory } from './operations/Inventory';
export { default as Purchases } from './operations/Purchases';
export { default as Sales } from './operations/Sales';
export { default as LocalDirectory } from './operations/LocalDirectory';
export * as operationsPages from './operations';

// ORGANIZATION
export { default as Businesses } from './organization/Businesses';
export { default as Branches } from './organization/Branches';
export { default as Investors } from './organization/Investors';
export * as organizationPages from './organization';

// FINANCE
export { default as Billing } from './finance/Billing';
export { default as Expenses } from './finance/Expenses';
export { default as Customers } from './finance/Customers';
export { default as Documents } from './finance/Documents';
export { default as Reminders } from './finance/Reminders';
export * as financePages from './finance';

// PROFILE
export { default as Profile } from './profile/Profile';
export * as profilePages from './profile/index';

// PUBLIC
export { default as Landing } from './public/Landing';
export { default as NotFound } from './public/NotFound';
export { default as BusinessProfileView } from './public/BusinessProfileView';
export { default as CareerProfileView } from './public/CareerProfileView';
export { default as BusinessSetup } from './public/BusinessSetup';
export { default as CareerSetup } from './public/CareerSetup';
export * as publicPages from './public';