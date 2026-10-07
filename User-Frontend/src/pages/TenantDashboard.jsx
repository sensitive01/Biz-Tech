import React, { useState, useEffect } from 'react';
import { IndianRupee, Users, Store, Activity, Calendar, FileText, Settings, ArrowUpRight, ArrowDownRight, CreditCard, Clock, CheckCircle2 } from 'lucide-react';

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

  // Mock data tailored for each archetype
  const getStats = () => {
    if (tenantType === 1) return [
      { title: 'Today\'s Sales', value: '₹12,450', trend: '+14%', up: true, icon: <IndianRupee size={20} />, color: '#10B981', bg: '#D1FAE5' },
      { title: 'Active Inventory', value: '842', trend: '+3%', up: true, icon: <Store size={20} />, color: '#3B82F6', bg: '#DBEAFE' },
      { title: 'Pending Orders', value: '12', trend: '-2%', up: false, icon: <Clock size={20} />, color: '#F59E0B', bg: '#FEF3C7' },
      { title: 'Monthly Revenue', value: '₹2.4L', trend: '+8%', up: true, icon: <Activity size={20} />, color: '#8B5CF6', bg: '#EDE9FE' },
    ];
    if (tenantType === 2) return [
      { title: 'Total Employees', value: '18', trend: 'Stable', up: true, icon: <Users size={20} />, color: '#3B82F6', bg: '#DBEAFE' },
      { title: 'Active Shifts', value: '6', trend: 'Current', up: true, icon: <Clock size={20} />, color: '#10B981', bg: '#D1FAE5' },
      { title: 'Pending Leaves', value: '3', trend: 'Requires Action', up: false, icon: <Calendar size={20} />, color: '#F59E0B', bg: '#FEF3C7' },
      { title: 'Weekly Payroll', value: '₹45,200', trend: '-1.5%', up: true, icon: <IndianRupee size={20} />, color: '#8B5CF6', bg: '#EDE9FE' },
    ];
    return [
      { title: 'Active Branches', value: '12', trend: '+2 this year', up: true, icon: <Store size={20} />, color: '#3B82F6', bg: '#DBEAFE' },
      { title: 'Total Workforce', value: '342', trend: '+12%', up: true, icon: <Users size={20} />, color: '#10B981', bg: '#D1FAE5' },
      { title: 'Cross-Branch Rev', value: '₹4.2Cr', trend: '+24%', up: true, icon: <Activity size={20} />, color: '#8B5CF6', bg: '#EDE9FE' },
      { title: 'System Alerts', value: '2', trend: 'Needs Review', up: false, icon: <Settings size={20} />, color: '#EF4444', bg: '#FEE2E2' },
    ];
  };

  const getRecentActivity = () => {
    if (tenantType === 1) return [
      { id: 1, action: 'Order #8924 fulfilled', time: '10 mins ago', status: 'Completed', type: 'Sales' },
      { id: 2, action: 'Inventory restock: Coffee Beans', time: '1 hour ago', status: 'Pending', type: 'Inventory' },
      { id: 3, action: 'Daily settlement generated', time: '3 hours ago', status: 'Completed', type: 'Finance' },
    ];
    if (tenantType === 2) return [
      { id: 1, action: 'Sarah Jenkins clocked in', time: '15 mins ago', status: 'Active', type: 'Attendance' },
      { id: 2, action: 'Leave request: Michael (Sick)', time: '2 hours ago', status: 'Pending', type: 'HR' },
      { id: 3, action: 'Weekly roster published', time: '4 hours ago', status: 'Completed', type: 'Management' },
    ];
    return [
      { id: 1, action: 'Branch #04 (Downtown) opened', time: '30 mins ago', status: 'Active', type: 'Operations' },
      { id: 2, action: 'Manager approval required: Payroll', time: '1 hour ago', status: 'Pending', type: 'Finance' },
      { id: 3, action: 'Global policy update distributed', time: '5 hours ago', status: 'Completed', type: 'Compliance' },
    ];
  };

  const stats = getStats();
  const activities = getRecentActivity();

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            {tenantType === 1 ? 'My Business Overview' : tenantType === 2 ? 'Branch Dashboard' : 'Enterprise Command Center'}
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
            Here's what's happening in your workspace today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', fontWeight: '500', fontSize: '14px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Calendar size={16} /> Filter Date
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '500', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}>
            <FileText size={16} /> Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600', color: stat.up ? '#10B981' : '#F59E0B', background: stat.up ? '#D1FAE5' : '#FEF3C7', padding: '4px 8px', borderRadius: '20px' }}>
                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {stat.trend}
              </div>
            </div>
            <h3 style={{ fontSize: '15px', color: '#64748B', fontWeight: '500', marginBottom: '8px' }}>{stat.title}</h3>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Recent Activity Table */}
        <div style={{ gridColumn: '1 / -1', '@media (min-width: 1024px)': { gridColumn: 'span 2' }, background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Recent Activity</h2>
            <button style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>View All</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>Action</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>Type</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>Time</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act) => (
                  <tr key={act.id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>{act.action}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748B', fontWeight: '500' }}>{act.type}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748B' }}>{act.time}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: act.status === 'Completed' || act.status === 'Active' ? '#ECFDF5' : '#FEF3C7', color: act.status === 'Completed' || act.status === 'Active' ? '#059669' : '#D97706' }}>
                        {act.status === 'Completed' || act.status === 'Active' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      
      {/* Plan Details Widget - Placed below the table to handle responsive grid naturally */}
      <div style={{ marginTop: '24px', background: '#0F172A', borderRadius: '16px', padding: '32px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }}>
        {/* Decorative background circle */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.2)', filter: 'blur(30px)' }}></div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={20} color="#60A5FA" />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Active Subscription</h2>
        </div>

        {pricingPlan ? (
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div>
              <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '4px' }}>Current Plan</p>
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{pricingPlan.customerType}</h3>
              <p style={{ color: '#CBD5E1', fontSize: '14px', maxWidth: '400px', margin: 0 }}>
                {pricingPlan.description || 'You are on the standard plan structure with full access to permitted features.'}
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '48px', fontWeight: '800', letterSpacing: '-2px' }}>₹{pricingPlan.amount}</span>
                <span style={{ color: '#94A3B8', fontSize: '16px', fontWeight: '500' }}>/ mo</span>
              </div>
              <button style={{ padding: '14px 28px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap' }} onMouseOver={(e) => e.currentTarget.style.background = '#1D4ED8'} onMouseOut={(e) => e.currentTarget.style.background = '#2563EB'}>
                Manage Billing
              </button>
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '24px 0' }}>
            <Activity size={32} color="#60A5FA" style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ color: '#94A3B8', fontSize: '14px' }}>Fetching plan details...</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default TenantDashboard;
