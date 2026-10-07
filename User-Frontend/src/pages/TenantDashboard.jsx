import React from 'react';

const TenantDashboard = () => {
  const tenantType = Number(localStorage.getItem('tenantType')) || 1;

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Dashboard Overview</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '32px' }}>
        Welcome back to your workspace. Here is a summary of your operations.
      </p>

      <div className="card" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <h2 style={{ fontSize: '20px', color: 'var(--primary-blue)', marginBottom: '16px' }}>
          Configured for Type {tenantType}
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '600px' }}>
          {tenantType === 1 && "As a Sole Operator, your dashboard is streamlined. You don't need to worry about employee shifts or branch management. Focus on your day-to-day operations seamlessly."}
          {tenantType === 2 && "Your workspace is ready. You have access to Employee Management, Attendance Tracking, and Leave Requests. Your single branch operations are fully supported."}
          {tenantType === 3 && "Your Multi-Branch Enterprise is set up. You can now manage Multiple Branches alongside all your Employees and their Attendance across the entire organization."}
        </p>
      </div>
    </div>
  );
};

export default TenantDashboard;
