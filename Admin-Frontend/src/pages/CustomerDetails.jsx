import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, RefreshCw, Loader2, AlertCircle, Store, Users, Map, Building2, 
  User, Mail, Phone, MapPin, Briefcase, Calendar, ShieldCheck, CheckCircle2, 
  ExternalLink, Layers, CreditCard, Package, ShoppingCart, FileText, 
  Clock, TrendingUp, Receipt, Maximize2, Minimize2, Check, X
} from 'lucide-react';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);

  const userFrontendUrl = import.meta.env.VITE_USER_FRONTEND_URL;
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchCustomerDetails = () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    fetch(`${apiUrl}/api/admin/users/${id}/details`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load customer workspace session');
        return res.json();
      })
      .then(data => {
        setDetails(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching customer details:', err);
        setError(err.message || 'Unable to load customer workspace');
        setLoading(false);
      });
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    fetchCustomerDetails();
  }, [id, navigate]);

  const customer = details?.user || {};
  const branches = details?.branches || [];
  const employees = details?.employees || [];
  const businesses = details?.businesses || (customer.businesses || []);
  const counts = details?.counts || {
    branches: branches.length,
    employees: employees.length,
    businesses: businesses.length || 1,
    customers: 0,
    inventory: 0,
    sales: 0
  };

  const businessType = Number(customer.businessType || 1);
  const typeLabel = `Type ${businessType}: ${
    businessType === 1 ? 'Sole Operator' : 
    businessType === 2 ? 'Single Branch + Staff' : 
    businessType === 3 ? 'Multi-Branch Enterprise' : 
    'Multi-Business Conglomerate'
  }`;

  const adminReturnUrl = window.location.origin + '/admin/customers';
  const impersonationUrl = details?.impersonationToken 
    ? `${userFrontendUrl}/impersonate?token=${encodeURIComponent(details.impersonationToken)}&user=${encodeURIComponent(JSON.stringify(details.user))}&embedded=true`
    : null;

  // Detect if browser is on HTTPS but trying to load a local HTTP iframe (Vercel Private Network Access restriction)
  const isMixedContent = typeof window !== 'undefined' && 
    window.location.protocol === 'https:' && 
    (userFrontendUrl.startsWith('http://localhost') || userFrontendUrl.startsWith('http://127.0.0.1'));

  const handleOpenWorkspaceNewTab = () => {
    if (impersonationUrl) {
      window.open(impersonationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading && !details) {
    return (
      <div style={{ height: '100vh', width: '100vw', background: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', fontFamily: 'sans-serif' }}>
        <Loader2 size={40} color="#2563EB" style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ color: '#0F172A', fontSize: '16px', fontWeight: '600' }}>Loading Customer Workspace...</div>
        <div style={{ color: '#64748B', fontSize: '13px' }}>Fetching live data, branches, and roster</div>
      </div>
    );
  }

  if (error && !details) {
    return (
      <div style={{ height: '100vh', width: '100vw', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'sans-serif' }}>
        <div style={{ padding: '36px', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', textAlign: 'center', maxWidth: '480px', width: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <AlertCircle size={44} color="#EF4444" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#0F172A', fontSize: '18px' }}>Failed to Load Customer Data</h3>
          <p style={{ color: '#64748B', fontSize: '14px', margin: '0 0 24px 0' }}>{error}</p>
          <button onClick={() => navigate('/admin/customers')} className="btn-primary" style={{ padding: '10px 20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} /> Back to Customer Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F8FAFC' }}>
      
      {/* Top Header Bar */}
      <header style={{
        height: '56px',
        background: '#0F172A',
        color: '#F8FAFC',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #1E293B',
        flexShrink: 0,
        zIndex: 10
      }}>
        {/* Left: Back to Customer Directory */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => navigate('/admin/customers')}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: '#1E293B', 
              border: '1px solid #334155', 
              borderRadius: '6px', 
              padding: '6px 14px', 
              color: '#F8FAFC', 
              fontSize: '13px', 
              fontWeight: '600', 
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#334155'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#1E293B'; }}
            title="Return to Customer Directory"
          >
            <ArrowLeft size={15} />
            Back to Directory
          </button>

          <div style={{ height: '20px', width: '1px', background: '#334155' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#2563EB',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {businessType === 1 && <Store size={15} />}
              {businessType === 2 && <Users size={15} />}
              {businessType === 3 && <Map size={15} />}
              {businessType === 4 && <Building2 size={15} />}
            </div>
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#F8FAFC' }}>
              {customer.businessName || `${customer.fullName}'s Business`}
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#93C5FD',
              background: 'rgba(37, 99, 235, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              padding: '2px 8px',
              borderRadius: '12px'
            }}>
              {typeLabel}
            </span>
            {customer.fullName && (
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                Owner: <strong style={{ color: '#E2E8F0' }}>{customer.fullName}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {impersonationUrl && (
            <button 
              onClick={handleOpenWorkspaceNewTab}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: '#2563EB', 
                border: 'none', 
                borderRadius: '6px', 
                padding: '6px 14px', 
                color: 'white', 
                fontSize: '12px', 
                fontWeight: '600', 
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#1D4ED8'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#2563EB'; }}
              title="Launch Tenant Workspace in New Tab"
            >
              <ExternalLink size={13} />
              Open Live Portal
            </button>
          )}

          <button 
            onClick={fetchCustomerDetails}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: '#1E293B', 
              border: '1px solid #334155', 
              borderRadius: '6px', 
              padding: '6px 12px', 
              color: '#94A3B8', 
              fontSize: '12px', 
              fontWeight: '600', 
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#F8FAFC'; e.currentTarget.style.background = '#334155'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = '#1E293B'; }}
            title="Reload Customer Data"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </header>

      {/* Quick KPI Metric Highlights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '14px',
        padding: '16px 24px',
        background: 'white',
        borderBottom: '1px solid #E2E8F0',
        flexShrink: 0
      }}>
        <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={18} /></div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Businesses</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>{counts.businesses}</div>
          </div>
        </div>

        <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Store size={18} /></div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Branches</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>{counts.branches}</div>
          </div>
        </div>

        <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={18} /></div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Staff / Team</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>{counts.employees}</div>
          </div>
        </div>

        <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={18} /></div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Client Customers</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>{counts.customers}</div>
          </div>
        </div>

        <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FDF2F8', color: '#DB2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={18} /></div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Inventory Items</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>{counts.inventory}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        padding: '0 24px',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        gap: '24px',
        background: 'white',
        flexShrink: 0
      }}>
        {[
          { id: 'overview', label: 'Profile & Overview', icon: User },
          { id: 'branches', label: `Branches (${counts.branches})`, icon: Store },
          { id: 'employees', label: `Staff & Team (${counts.employees})`, icon: Users },
          ...(businessType === 4 || businesses.length > 1 ? [{ id: 'businesses', label: `Businesses (${counts.businesses})`, icon: Building2 }] : []),
          { id: 'workspace', label: 'Live Tenant Workspace', icon: Layers }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 4px',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid #2563EB' : '2px solid transparent',
                color: isActive ? '#2563EB' : '#64748B',
                fontWeight: isActive ? '600' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#F8FAFC' }}>
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* Primary Contact Details */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '700', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} color="#2563EB" /> Primary Account Details
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Account Owner</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>{customer.fullName || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Email Address</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#2563EB' }}>{customer.email || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Contact Phone</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>{customer.phone || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Account ID</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{customer.userId || customer.id || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Registered Date</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>
                      {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Business Organization Info */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '700', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={16} color="#8B5CF6" /> Business Information
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Business Name</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>{customer.businessName || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Industry</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>{customer.industry || 'General Commerce'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Registration / GSTIN</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>{customer.regNo || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Business Phone</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>{customer.businessPhone || customer.phone || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Headquarters Address</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A', maxWidth: '200px', textAlign: 'right' }}>{customer.address || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Subscription & Tier */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '700', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={16} color="#16A34A" /> Subscription & Plan
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Account Status</span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: customer.subscriptionStatus === 'Inactive' ? '#EF4444' : '#16A34A',
                      background: customer.subscriptionStatus === 'Inactive' ? '#FEE2E2' : '#DCFCE7',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                      {customer.subscriptionStatus || 'Active'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Billing Cycle</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>{customer.subscriptionBillingCycle || 'Monthly'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Renewal Date</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>
                      {customer.subscriptionRenewalDate ? new Date(customer.subscriptionRenewalDate).toLocaleDateString() : 'Active Renewal'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Tier Architecture</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#2563EB' }}>{typeLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enabled Operational Modules */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="#2563EB" /> Activated Operational Modules ({customer.modules?.length || 0})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                {[
                  { key: 'products_services', label: 'Products & Services', icon: Package },
                  { key: 'inventory', label: 'Inventory Management', icon: Package },
                  { key: 'purchases', label: 'Purchases & Vendors', icon: ShoppingCart },
                  { key: 'sales', label: 'Sales & POS Billing', icon: Receipt },
                  { key: 'customers', label: 'Client CRM', icon: Users },
                  { key: 'expenses', label: 'Expenses Tracking', icon: TrendingUp },
                  { key: 'documents', label: 'Documents & Vault', icon: FileText },
                  { key: 'reminders', label: 'Task Reminders', icon: Clock },
                  { key: 'employees', label: 'Staff Management', icon: Users },
                  { key: 'attendance', label: 'Attendance Tracking', icon: Clock },
                  { key: 'leaves', label: 'Leave Approvals', icon: Calendar }
                ].map(mod => {
                  const Icon = mod.icon;
                  const isEnabled = (customer.modules || []).includes(mod.key);
                  return (
                    <div 
                      key={mod.key}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: isEnabled ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                        background: isEnabled ? '#EFF6FF' : '#F8FAFC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={16} color={isEnabled ? '#2563EB' : '#94A3B8'} />
                        <span style={{ fontSize: '13px', fontWeight: isEnabled ? '600' : '400', color: isEnabled ? '#1E293B' : '#94A3B8' }}>
                          {mod.label}
                        </span>
                      </div>
                      {isEnabled ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#16A34A', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                          <Check size={12} /> Active
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>Off</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: BRANCHES */}
        {activeTab === 'branches' && (
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '700' }}>
                  Branch Locations ({branches.length})
                </h3>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                  All physical shops and branch outlets registered under this tenant
                </div>
              </div>
            </div>

            {branches.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748B' }}>
                <Store size={36} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>No Separate Branches Registered</div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>This business operates as a single store or headquarter.</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '14px 24px', fontWeight: '600' }}>Branch Details</th>
                      <th style={{ padding: '14px 24px', fontWeight: '600' }}>Location / Address</th>
                      <th style={{ padding: '14px 24px', fontWeight: '600' }}>Contact</th>
                      <th style={{ padding: '14px 24px', fontWeight: '600' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map((b) => (
                      <tr key={b._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '14px' }}>{b.name || b.branchName}</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>ID: {b.branchId || b._id?.substring(b._id.length - 6).toUpperCase()}</div>
                        </td>
                        <td style={{ padding: '16px 24px', color: '#334155', fontSize: '13px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} color="#64748B" />
                            <span>{b.location || b.address || 'Address on file'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', color: '#334155', fontSize: '13px' }}>
                          <div>{b.phone || b.contactNumber || 'N/A'}</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>{b.email || 'N/A'}</div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: b.status === 'Active' ? '#DCFCE7' : '#F1F5F9',
                            color: b.status === 'Active' ? '#16A34A' : '#64748B',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                            {b.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STAFF & TEAM */}
        {activeTab === 'employees' && (
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '700' }}>
                  Staff & Roster List ({employees.length})
                </h3>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                  All employees and staff registered under this account
                </div>
              </div>
            </div>

            {employees.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748B' }}>
                <Users size={36} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>No Staff Members Found</div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>This business currently operates without separate staff logins.</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '14px 24px', fontWeight: '600' }}>Employee</th>
                      <th style={{ padding: '14px 24px', fontWeight: '600' }}>Role / Position</th>
                      <th style={{ padding: '14px 24px', fontWeight: '600' }}>Assigned Branch</th>
                      <th style={{ padding: '14px 24px', fontWeight: '600' }}>Contact</th>
                      <th style={{ padding: '14px 24px', fontWeight: '600' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ fontWeight: '600', color: '#0F172A' }}>{emp.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>{emp.email}</div>
                        </td>
                        <td style={{ padding: '16px 24px', color: '#0F172A', fontSize: '13px' }}>
                          <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                            {emp.position || emp.designation || 'Staff'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', color: '#475569', fontSize: '13px' }}>{emp.branchName || 'Main Store'}</td>
                        <td style={{ padding: '16px 24px', color: '#475569', fontSize: '13px' }}>{emp.contactNumber || emp.phone || 'N/A'}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                            background: emp.status === 'Active' ? '#DCFCE7' : '#F1F5F9',
                            color: emp.status === 'Active' ? '#16A34A' : '#64748B',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {emp.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CONGLOMERATE BUSINESSES */}
        {(businessType === 4 || businesses.length > 1) && activeTab === 'businesses' && (
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '700' }}>
                Conglomerate Businesses ({businesses.length})
              </h3>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                Multi-brand parent corporate entities registered under this tenant
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px 24px', fontWeight: '600' }}>Business Name</th>
                    <th style={{ padding: '14px 24px', fontWeight: '600' }}>Registration</th>
                    <th style={{ padding: '14px 24px', fontWeight: '600' }}>Phone</th>
                    <th style={{ padding: '14px 24px', fontWeight: '600' }}>Location Address</th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.map((biz, idx) => (
                    <tr key={biz._id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '16px 24px', fontWeight: '600', color: '#0F172A' }}>{biz.name}</td>
                      <td style={{ padding: '16px 24px', color: '#64748B', fontSize: '13px' }}>{biz.regNo || 'N/A'}</td>
                      <td style={{ padding: '16px 24px', color: '#64748B', fontSize: '13px' }}>{biz.phone || 'N/A'}</td>
                      <td style={{ padding: '16px 24px', color: '#64748B', fontSize: '13px' }}>{biz.address || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: LIVE WORKSPACE */}
        {activeTab === 'workspace' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Control & Link Banner */}
            <div style={{
              padding: '16px 20px',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1D4ED8', fontSize: '14px', fontWeight: '700' }}>
                  <Layers size={17} />
                  <span>Live Tenant Workspace Viewer</span>
                </div>
                <div style={{ fontSize: '12px', color: '#3B82F6', marginTop: '3px' }}>
                  User Portal Target: <code style={{ background: 'rgba(255,255,255,0.7)', padding: '2px 6px', borderRadius: '4px' }}>{userFrontendUrl}</code>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {impersonationUrl && (
                  <button
                    onClick={handleOpenWorkspaceNewTab}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: '#2563EB',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    <ExternalLink size={14} /> Open in New Tab
                  </button>
                )}

                <button
                  onClick={() => setIframeKey(k => k + 1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: 'white',
                    border: '1px solid #BFDBFE',
                    borderRadius: '8px',
                    color: '#2563EB',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={14} /> Reload View
                </button>
              </div>
            </div>

            {/* Warning if running on HTTPS public domain with localhost User URL */}
            {isMixedContent ? (
              <div style={{
                padding: '24px',
                background: '#FFFBEB',
                border: '1px solid #FCD34D',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <AlertCircle size={36} color="#D97706" style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ margin: '0 0 8px 0', color: '#92400E', fontSize: '16px' }}>
                  Browser Security Restriction: Local Network URL on Vercel
                </h4>
                <p style={{ margin: '0 0 16px 0', color: '#78350F', fontSize: '13px', maxWidth: '640px', lineHeight: '1.5', display: 'inline-block' }}>
                  Because this Admin portal is deployed on Vercel (<strong>https://biz-tech-topaz.vercel.app</strong>), modern browsers block embedded iframes pointing to private local network addresses (<strong>{userFrontendUrl}</strong>).
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleOpenWorkspaceNewTab}
                    style={{
                      padding: '10px 20px',
                      background: '#2563EB',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <ExternalLink size={14} /> Open Workspace Directly in New Tab
                  </button>
                </div>
                <div style={{ marginTop: '16px', fontSize: '12px', color: '#B45309' }}>
                  <strong>To enable live preview inside this page:</strong> Set <code style={{ background: '#FEF3C7', padding: '2px 5px', borderRadius: '4px' }}>VITE_USER_FRONTEND_URL</code> in your Vercel Project Settings to your deployed User Frontend Vercel URL.
                </div>
              </div>
            ) : impersonationUrl ? (
              <div style={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                height: '620px',
                background: 'white'
              }}>
                <iframe
                  key={iframeKey}
                  src={impersonationUrl}
                  title="Live Client Workspace"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block'
                  }}
                />
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B', background: 'white', borderRadius: '12px' }}>
                <Loader2 size={28} color="#2563EB" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }} />
                <div>Setting up live tenant workspace...</div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default CustomerDetails;
