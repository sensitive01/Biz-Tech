import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import CustomerDirectory from './pages/CustomerDirectory';
import AddCustomer from './pages/AddCustomer';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import PricingManage from './pages/PricingManage';
import AdminProfile from './pages/AdminProfile';
import ManageSubscriptions from './pages/ManageSubscriptions';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<CustomerDirectory />} />
          <Route path="customers/new" element={<AddCustomer />} />
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
