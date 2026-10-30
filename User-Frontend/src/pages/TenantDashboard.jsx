import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, Users, Store, Activity, Calendar, FileText, Settings, ArrowUpRight, ArrowDownRight, CreditCard, Clock, CheckCircle2, MapPin, UserCheck, Phone, Package, Archive, ShoppingCart, TrendingUp, ShieldCheck } from 'lucide-react';

const TenantDashboard = () => {
  const navigate = useNavigate();
  const tenantType = Number(localStorage.getItem('tenantType')) || 1;
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  });
  const modules = currentUser?.modules || [];
  const [pricingPlan, setPricingPlan] = useState(null);
  const [singleBranch, setSingleBranch] = useState(null);
  const [employeeCount, setEmployeeCount] = useState(0);

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

  useEffect(() => {
    const fetchDashboardBranchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const headers = { 'Authorization': `Bearer ${token}` };

        if (tenantType === 2) {
          const [branchRes, empRes] = await Promise.all([
            fetch(`${import.meta.env.VITE_API_URL}/api/branches`, { headers }),
            fetch(`${import.meta.env.VITE_API_URL}/api/employees`, { headers })
          ]);
          if (branchRes.ok) {
            const branchData = await branchRes.json();
            if (Array.isArray(branchData) && branchData.length > 0) {
              setSingleBranch(branchData[0]);
            }
          }
          if (empRes.ok) {
            const empData = await empRes.json();
            if (Array.isArray(empData)) {
              setEmployeeCount(empData.length);
            }
          }
        }
      } catch (e) {
        console.error('Error fetching dashboard branch data:', e);
      }
    };

    fetchDashboardBranchData();
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
      { title: 'Branch Location', value: singleBranch?.location || singleBranch?.name || 'Main Store', trend: singleBranch?.type || 'Store', up: true, icon: <Store size={20} />, color: '#2563EB', bg: '#EFF6FF' },
      { title: 'Branch Workforce', value: `${employeeCount} Active Staff`, trend: 'Assigned', up: true, icon: <Users size={20} />, color: '#10B981', bg: '#D1FAE5' },
      { title: 'Branch Manager', value: singleBranch?.manager || 'Assigned', trend: 'Supervisor', up: true, icon: <UserCheck size={20} />, color: '#8B5CF6', bg: '#EDE9FE' },
      { title: 'Contact Phone', value: singleBranch?.contactNumber || 'Available', trend: 'Verified', up: true, icon: <Phone size={20} />, color: '#F59E0B', bg: '#FEF3C7' },
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
            {currentUser?.role === 'employee' 
              ? `Welcome back, ${currentUser?.fullName || 'Employee'}!` 
              : tenantType === 1 
              ? 'My Business Overview' 
              : tenantType === 2 
              ? 'Branch Dashboard' 
              : 'Enterprise Command Center'}
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
            {currentUser?.role === 'employee' 
              ? `Employee Portal • ${currentUser?.designation || 'Staff'} • ${currentUser?.branchName || 'Workspace'}` 
              : "Here's what's happening in your workspace today."}
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

      {/* Single Branch Card for Type 2 */}
      {tenantType === 2 && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '24px 28px',
          marginBottom: '28px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '54px', height: '54px', borderRadius: '14px',
              background: '#EFF6FF', color: '#2563EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <Store size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                  {singleBranch?.name || 'Main Branch'}
                </h2>
                <span style={{
                  fontSize: '12px', fontWeight: '600',
                  background: '#DBEAFE', color: '#1D4ED8',
                  padding: '2px 10px', borderRadius: '12px'
                }}>
                  {singleBranch?.type || 'Retail Store'} • Single Branch Archetype
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '14px', color: '#64748B' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} color="#2563EB" /> {singleBranch?.location || 'Address not specified'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={15} color="#16A34A" /> Manager: <strong>{singleBranch?.manager || 'Not Assigned'}</strong>
                </span>
                {singleBranch?.contactNumber && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={15} color="#F59E0B" /> {singleBranch.contactNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/tenant/branches')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', background: '#F8FAFC',
              border: '1px solid #CBD5E1', borderRadius: '8px',
              color: '#1E293B', fontWeight: '600', fontSize: '13px',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#93C5FD'; e.currentTarget.style.color = '#2563EB'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#1E293B'; }}
          >
            Manage Branch &rarr;
          </button>
        </div>
      )}

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
        <div style={{ gridColumn: '1 / -1', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Recent Activity</h2>
            <button style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>View All</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', width: '60px' }}>S.No</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>Action</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>Type</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>Time</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act, idx) => (
                  <tr key={act.id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748B', fontWeight: '500' }}>{idx + 1}</td>
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
      
      {/* Permitted Sections for Employee OR Plan Details for Owners */}
      {currentUser?.role === 'employee' ? (
        <div style={{ marginTop: '24px', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px 32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>My Workspace Access</h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748B' }}>Quick shortcuts to your permitted operational modules</p>
              </div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB', background: '#EFF6FF', padding: '4px 12px', borderRadius: '20px', border: '1px solid #BFDBFE' }}>
              {modules.length} Authorized Sections
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {modules.includes('products_services') && (
              <div 
                onClick={() => navigate('/tenant/products')} 
                style={{ padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '14px' }} 
                onMouseOver={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#BFDBFE'; }} 
                onMouseOut={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Package size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>Product & Service</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Catalog, items & pricing</div>
                </div>
              </div>
            )}

            {modules.includes('inventory') && (
              <div 
                onClick={() => navigate('/tenant/inventory')} 
                style={{ padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '14px' }} 
                onMouseOver={e => { e.currentTarget.style.background = '#ECFEFF'; e.currentTarget.style.borderColor = '#A5F3FC'; }} 
                onMouseOut={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#CFFAFE', color: '#0891B2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Archive size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>Stock / Inventory</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Stock records & adjustments</div>
                </div>
              </div>
            )}

            {modules.includes('purchases') && (
              <div 
                onClick={() => navigate('/tenant/purchases')} 
                style={{ padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '14px' }} 
                onMouseOver={e => { e.currentTarget.style.background = '#F5F3FF'; e.currentTarget.style.borderColor = '#DDD6FE'; }} 
                onMouseOut={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>Purchases</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Vendor purchase logs</div>
                </div>
              </div>
            )}

            {modules.includes('sales') && (
              <div 
                onClick={() => navigate('/tenant/sales')} 
                style={{ padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '14px' }} 
                onMouseOver={e => { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.borderColor = '#A7F3D0'; }} 
                onMouseOut={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>Billing & Sales</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Customer billing counter</div>
                </div>
              </div>
            )}

            {modules.includes('attendance') && (
              <div 
                onClick={() => navigate('/tenant/attendance')} 
                style={{ padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '14px' }} 
                onMouseOver={e => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.borderColor = '#C7D2FE'; }} 
                onMouseOut={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E0E7FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>Attendance</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Check in & shift logs</div>
                </div>
              </div>
            )}

            {modules.includes('leaves') && (
              <div 
                onClick={() => navigate('/tenant/leaves')} 
                style={{ padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '14px' }} 
                onMouseOver={e => { e.currentTarget.style.background = '#FFF7ED'; e.currentTarget.style.borderColor = '#FFEDD5'; }} 
                onMouseOut={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FFEDD5', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>Leave Requests</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Apply & manage leaves</div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
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
      )}

    </div>
  );
};

export default TenantDashboard;
