import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import CustomerDirectory from './pages/CustomerDirectory';
import DirectoryRegistrations from './pages/DirectoryRegistrations';
import AddCustomer from './pages/AddCustomer';
// Customer details and management view
import CustomerDetails from './pages/CustomerDetails';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import PricingManage from './pages/PricingManage';
import AdminProfile from './pages/AdminProfile';
import ManageSubscriptions from './pages/ManageSubscriptions';
import ContactInquiries from './pages/ContactInquiries';
import PaymentApprovals from './pages/PaymentApprovals';
import NotFound from './pages/NotFound';
import AlertModal from './components/AlertModal';

function App() {
  return (
    <Router>
      <AlertModal />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Standalone customer details view (no admin sidebar or header) */}
        <Route path="/admin/customers/:id" element={<CustomerDetails />} />
        
        {/* Standalone customer onboarding wizard view (configured within admin portal on port 5173) */}
        <Route path="/admin/customers/:id/onboarding" element={<Onboarding />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<CustomerDirectory />} />
          <Route path="directory-registrations" element={<DirectoryRegistrations />} />
          <Route path="registrations" element={<DirectoryRegistrations />} />
          <Route path="customers/new" element={<AddCustomer />} />
          <Route path="inquiries" element={<ContactInquiries />} />
          <Route path="payment-approvals" element={<PaymentApprovals />} />
          <Route path="subscriptions" element={<ManageSubscriptions />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="pricing" element={<PricingManage />} />
          <Route path="settings" element={<Settings />} />
          <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<NotFound isNested={true} />} />
        </Route>

        {/* Global 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
