import React, { useState, useEffect } from 'react';

const TenantDashboard = () => {
  const tenantType = Number(localStorage.getItem('tenantType')) || 1;
  const [pricingPlan, setPricingPlan] = useState(null);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pricing`);
        if (res.ok) {
          const data = await res.json();
          const targetTitle = `Type ${tenantType}`;
          const plan = data.find(p => p.customerType.includes(targetTitle) || targetTitle.includes(p.customerType));
          if (plan) setPricingPlan(plan);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPricing();
  }, [tenantType]);

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Dashboard Overview</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '32px' }}>
        Welcome back to your workspace. Here is a summary of your operations.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
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

        <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <h2 style={{ fontSize: '20px', color: 'var(--primary-blue)', marginBottom: '16px' }}>
            Current Pricing Plan
          </h2>
          {pricingPlan ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--text-title)', marginBottom: '8px' }}>
                ₹{pricingPlan.amount}/mo
              </div>
              <div style={{ fontSize: '18px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {pricingPlan.customerType}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                {pricingPlan.description || 'Your current active subscription plan.'}
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>Fetching your active plan...</p>
              <p style={{ fontSize: '12px' }}>If no plan is shown, please contact admin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;
