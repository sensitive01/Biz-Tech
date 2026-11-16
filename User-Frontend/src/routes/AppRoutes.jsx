import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import TenantLayout from '../layouts/TenantLayout';

// Domain-grouped pages from @/pages
import {
  // Public & Auth
  Landing,
  Login,
  Register,
  Impersonate,
  NotFound,

  // Onboarding
  SelectType,
  SelectModules,
  Onboarding,

  // Dashboard & Profile
  TenantDashboard,
  Profile,

  // Staff / HR
  Employees,
  Attendance,
  LeaveRequests,

  // Operations
  Products,
  Inventory,
  Purchases,
  Sales,

  // Organization
  Businesses,
  Branches,
  Investors,

  // Finance
  Billing,
  Expenses,
  Customers,
  Documents,
  Reminders,
} from '../pages';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* ======================================================== */}
      {/* PUBLIC & AUTH ROUTES                                     */}
      {/* ======================================================== */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/impersonate" element={<Impersonate />} />

      {/* ======================================================== */}
      {/* ONBOARDING & SETUP FLOW                                  */}
      {/* ======================================================== */}
      <Route path="/select-type" element={<SelectType />} />
      <Route path="/select-modules" element={<SelectModules />} />
      <Route path="/onboarding" element={<Onboarding />} />

      {/* ======================================================== */}
      {/* AUTHENTICATED TENANT PORTAL                              */}
      {/* ======================================================== */}
      <Route
        path="/tenant"
        element={
          <ProtectedRoute>
            <TenantLayout />
          </ProtectedRoute>
        }
      >
        {/* Core & Overview */}
        <Route path="dashboard" element={<TenantDashboard />} />
        <Route path="profile" element={<Profile />} />

        {/* Human Resources / Staffing */}
        <Route path="employees" element={<Employees />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="leaves" element={<LeaveRequests />} />

        {/* Inventory & Operations */}
        <Route path="products" element={<Products />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="sales" element={<Sales />} />

        {/* Organization & Multi-Branch */}
        <Route path="businesses" element={<Businesses />} />
        <Route path="branches" element={<Branches />} />
        <Route path="investors" element={<Investors />} />

        {/* Finance & Records */}
        <Route path="billing" element={<Billing />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="customers" element={<Customers />} />
        <Route path="documents" element={<Documents />} />
        <Route path="reminders" element={<Reminders />} />

        {/* Tenant Route Defaults */}
        <Route path="" element={<Navigate to="/tenant/dashboard" replace />} />
        <Route path="*" element={<NotFound isNested={true} />} />
      </Route>

      {/* ======================================================== */}
      {/* GLOBAL 404 CATCH-ALL                                     */}
      {/* ======================================================== */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

