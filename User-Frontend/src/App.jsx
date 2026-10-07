import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TenantLayout from './layouts/TenantLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import SelectType from './pages/SelectType';
import TenantDashboard from './pages/TenantDashboard';
import Branches from './pages/Branches';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import LeaveRequests from './pages/LeaveRequests';

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
          <Route path="branches" element={<Branches />} />
          <Route path="employees" element={<Employees />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leaves" element={<LeaveRequests />} />
          
          <Route path="" element={<Navigate to="/tenant/dashboard" replace />} />
          <Route path="*" element={<div style={{ padding: '32px' }}>Feature in development...</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
