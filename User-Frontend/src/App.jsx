import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TenantLayout from './layouts/TenantLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import SelectType from './pages/SelectType';
import SelectModules from './pages/SelectModules';
import Onboarding from './pages/Onboarding';
import TenantDashboard from './pages/TenantDashboard';
import Branches from './pages/Branches';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import LeaveRequests from './pages/LeaveRequests';
import Products from './pages/Products';
import Businesses from './pages/Businesses';
import Customers from './pages/Customers';
import Documents from './pages/Documents';
import Reminders from './pages/Reminders';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Expenses from './pages/Expenses';
import Profile from './pages/Profile';
import Billing from './pages/Billing';
import Investors from './pages/Investors';
import Impersonate from './pages/Impersonate';
import NotFound from './pages/NotFound';
import AlertModal from './components/AlertModal';

const ProtectedTenantRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <AlertModal />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/impersonate" element={<Impersonate />} />
        <Route path="/select-type" element={<SelectType />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/select-modules" element={<SelectModules />} />
        
        {/* Tenant Routes */}
        <Route path="/tenant" element={<ProtectedTenantRoute><TenantLayout /></ProtectedTenantRoute>}>
          <Route path="dashboard" element={<TenantDashboard />} />
          <Route path="businesses" element={<Businesses />} />
          <Route path="branches" element={<Branches />} />
          <Route path="products" element={<Products />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="customers" element={<Customers />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="sales" element={<Sales />} />
          <Route path="documents" element={<Documents />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="employees" element={<Employees />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leaves" element={<LeaveRequests />} />
          <Route path="investors" element={<Investors />} />
          <Route path="profile" element={<Profile />} />
          <Route path="billing" element={<Billing />} />
          
          <Route path="" element={<Navigate to="/tenant/dashboard" replace />} />
          <Route path="*" element={<NotFound isNested={true} />} />
        </Route>

        {/* Global 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
