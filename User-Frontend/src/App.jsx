import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TenantLayout from './layouts/TenantLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import SelectType from './pages/SelectType';
import TenantDashboard from './pages/TenantDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/select-type" element={<SelectType />} />
        
        {/* Tenant Routes */}
        <Route path="/tenant" element={<TenantLayout />}>
          <Route path="dashboard" element={<TenantDashboard />} />
          {/* Mock routes to prevent 404s when clicking sidebar links */}
          <Route path="branches" element={<div style={{ padding: '32px' }}><h1 style={{ fontSize: '24px' }}>Branches Management</h1><p>Feature in development.</p></div>} />
          <Route path="employees" element={<div style={{ padding: '32px' }}><h1 style={{ fontSize: '24px' }}>Employee Directory</h1><p>Feature in development.</p></div>} />
          <Route path="attendance" element={<div style={{ padding: '32px' }}><h1 style={{ fontSize: '24px' }}>Attendance Log</h1><p>Feature in development.</p></div>} />
          <Route path="leaves" element={<div style={{ padding: '32px' }}><h1 style={{ fontSize: '24px' }}>Leave Requests</h1><p>Feature in development.</p></div>} />
          
          <Route path="" element={<Navigate to="/tenant/dashboard" replace />} />
          <Route path="*" element={<div style={{ padding: '32px' }}>Feature in development...</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
