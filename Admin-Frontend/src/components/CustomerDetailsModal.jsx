import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Store, Users, Map, Building2, User, Mail, Phone, MapPin, 
  Briefcase, Calendar, ShieldCheck, CheckCircle2, AlertCircle, 
  RefreshCw, Maximize2, Minimize2, ExternalLink, Layers, 
  CreditCard, IndianRupee, Package, ShoppingCart, Loader2 
} from 'lucide-react';

const CustomerDetailsModal = ({ customerId, initialCustomer, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);

  const userFrontendUrl = import.meta.env.VITE_USER_FRONTEND_URL || 'http://localhost:5174';
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    setError(null);

    fetch(`${apiUrl}/api/admin/users/${customerId}/details`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load customer details');
        return res.json();
      })
      .then(data => {
        setDetails(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching customer details:', err);
        setError(err.message || 'Unable to load customer records');
        setLoading(false);
      });
  }, [customerId, apiUrl]);

  const customer = details?.user || initialCustomer || {};
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

  const businessType = Number(customer.businessType || customer.type || 1);
  const typeLabel = `Type ${businessType}: ${
    businessType === 1 ? 'Sole Operator' : 
    businessType === 2 ? 'Single Branch + Staff' : 
    businessType === 3 ? 'Multi-Branch Enterprise' : 
    'Multi-Business Conglomerate'
  }`;

  const impersonationUrl = details?.impersonationToken 
    ? `${userFrontendUrl}/impersonate?token=${encodeURIComponent(details.impersonationToken)}&user=${encodeURIComponent(JSON.stringify(details.user))}&embedded=true`
    : null;

  return createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: isFullscreen ? '0' : '20px',
      transition: 'all 0.2s ease-in-out'
    }}>
      <div style={{
        background: 'white',
        borderRadius: isFullscreen ? '0' : '20px',
        width: isFullscreen ? '100vw' : '100%',
        maxWidth: isFullscreen ? '100vw' : '1100px',
        height: isFullscreen ? '100vh' : '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `var(--badge-type${businessType}-bg, #EFF6FF)`,
              color: businessType === 1 ? 'var(--primary-blue, #2563EB)' : `var(--badge-type${businessType}-text, #2563EB)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {businessType === 1 && <Store size={24} />}
              {businessType === 2 && <Users size={24} />}
              {businessType === 3 && <Map size={24} />}
              {businessType === 4 && <Building2 size={24} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0F172A' }}>
                  {customer.businessName || `${customer.fullName || 'Customer'}'s Business`}
                </h2>
                <span className="badge" style={{
                  background: `var(--badge-type${businessType}-bg, #EFF6FF)`,
                  color: businessType === 1 ? 'var(--primary-blue, #2563EB)' : `var(--badge-type${businessType}-text, #2563EB)`,
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {typeLabel}
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#16A34A',
                  background: '#DCFCE7',
                  padding: '3px 8px',
                  borderRadius: '20px'
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }}></div>
                  {customer.subscriptionStatus || 'Active'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '4px', fontSize: '13px', color: '#64748B' }}>
                <span>ID: <strong style={{ color: '#0F172A' }}>{customer.id || customer.userId || 'N/A'}</strong></span>
                <span>&bull;</span>
                <span>Contact: <strong style={{ color: '#0F172A' }}>{customer.fullName || customer.contactName || 'N/A'}</strong></span>
                <span>&bull;</span>
                <span>Email: <strong style={{ color: '#0F172A' }}>{customer.email || customer.contactEmail || 'N/A'}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s'
              }}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s'
              }}
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick KPI Metric Highlights */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '14px',
          padding: '16px 28px',
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          flexShrink: 0
        }}>
          <div style={{ background: 'white', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={20} /></div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Businesses</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>{counts.businesses}</div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Store size={20} /></div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Branches</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>{counts.branches}</div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} /></div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Staff / Roster</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>{counts.employees}</div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={20} /></div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Client Customers</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>{counts.customers}</div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FDF2F8', color: '#DB2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={20} /></div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Inventory Items</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>{counts.inventory}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          padding: '0 28px',
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', background: '#F8FAFC' }}>
          {loading && !details ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', gap: '12px' }}>
              <Loader2 size={32} color="#2563EB" style={{ animation: 'spin 1s linear infinite' }} />
              <div style={{ color: '#64748B', fontSize: '14px', fontWeight: '500' }}>Loading customer data...</div>
            </div>
          ) : error && !details ? (
            <div style={{ padding: '24px', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #F87171', color: '#991B1B', textAlign: 'center' }}>
              <AlertCircle size={28} style={{ margin: '0 auto 8px auto' }} />
              <h4 style={{ margin: '0 0 4px 0' }}>Error Loading Customer Records</h4>
              <p style={{ margin: 0, fontSize: '13px' }}>{error}</p>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                    {/* Primary Contact Person */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={15} color="#2563EB" /> Primary Contact Details
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                          <span style={{ fontSize: '13px', color: '#64748B' }}>Full Name</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{customer.fullName || customer.contactName || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                          <span style={{ fontSize: '13px', color: '#64748B' }}>Email Address</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#2563EB' }}>{customer.email || customer.contactEmail || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                          <span style={{ fontSize: '13px', color: '#64748B' }}>Contact Phone</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{customer.phone || customer.contactPhone || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', color: '#64748B' }}>Account Created</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>
                            {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Business Registration Info */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={15} color="#8B5CF6" /> Business Information
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                          <span style={{ fontSize: '13px', color: '#64748B' }}>Business Name</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{customer.businessName || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                          <span style={{ fontSize: '13px', color: '#64748B' }}>Industry</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{customer.industry || 'General Business'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                          <span style={{ fontSize: '13px', color: '#64748B' }}>Reg / Tax No.</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{customer.regNo || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', color: '#64748B' }}>Operating Address</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A', maxWidth: '200px', textAlign: 'right' }}>
                            {customer.address || customer.fullAddress || 'Not specified'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subscription & Active Modules */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CreditCard size={15} color="#16A34A" /> Subscription Plan Details
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                          <span style={{ fontSize: '13px', color: '#64748B' }}>Current Status</span>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#16A34A', background: '#DCFCE7', padding: '3px 10px', borderRadius: '12px' }}>
                            {customer.subscriptionStatus || 'Active'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                          <span style={{ fontSize: '13px', color: '#64748B' }}>Billing Cycle</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{customer.subscriptionBillingCycle || 'Monthly'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                          <span style={{ fontSize: '13px', color: '#64748B' }}>Renewal Date</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>
                            {customer.subscriptionRenewalDate ? new Date(customer.subscriptionRenewalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '30-Day Auto Renew'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', color: '#64748B' }}>Plan Amount</span>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                            ₹{customer.subscriptionCustomAmount || (businessType === 1 ? 499 : businessType === 2 ? 999 : businessType === 3 ? 1999 : 3499)} / mo
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Layers size={15} color="#D97706" /> Active Platform Modules
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {['products_services', 'inventory', 'purchases', 'sales', 'expenses'].map(modKey => {
                          const isEnabled = customer.modules?.includes(modKey) || customer.modules?.length === 0 || !customer.modules;
                          return (
                            <div
                              key={modKey}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 14px',
                                borderRadius: '10px',
                                background: isEnabled ? '#EFF6FF' : '#F1F5F9',
                                border: isEnabled ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                                color: isEnabled ? '#1D4ED8' : '#94A3B8',
                                fontSize: '13px',
                                fontWeight: '500'
                              }}
                            >
                              <CheckCircle2 size={15} color={isEnabled ? '#2563EB' : '#94A3B8'} />
                              <span style={{ textTransform: 'capitalize' }}>{modKey.replace('_', ' & ')}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ marginTop: '16px', fontSize: '12px', color: '#64748B' }}>
                        Client has full operational access to the selected modules above.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BRANCHES */}
              {activeTab === 'branches' && (
                <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '600' }}>
                      Branches Registered ({branches.length})
                    </h3>
                  </div>

                  {branches.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B' }}>
                      <Store size={36} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>No Branches Configured</div>
                      <div style={{ fontSize: '13px', marginTop: '4px' }}>This client operates as a single store or has not added extra branches yet.</div>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                        <thead>
                          <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>
                            <th style={{ padding: '12px 20px', fontWeight: '600' }}>Branch Name</th>
                            <th style={{ padding: '12px 20px', fontWeight: '600' }}>Type</th>
                            <th style={{ padding: '12px 20px', fontWeight: '600' }}>Location</th>
                            <th style={{ padding: '12px 20px', fontWeight: '600' }}>Manager</th>
                            <th style={{ padding: '12px 20px', fontWeight: '600' }}>Contact</th>
                            <th style={{ padding: '12px 20px', fontWeight: '600' }}>Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {branches.map(b => (
                            <tr key={b._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0F172A' }}>{b.name}</td>
                              <td style={{ padding: '14px 20px' }}>
                                <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>
                                  {b.type || 'Store'}
                                </span>
                              </td>
                              <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '13px' }}>{b.location}</td>
                              <td style={{ padding: '14px 20px', color: '#0F172A', fontSize: '13px', fontWeight: '500' }}>{b.manager}</td>
                              <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '13px' }}>{b.contactNumber}</td>
                              <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '13px' }}>
                                {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: STAFF & EMPLOYEES */}
              {activeTab === 'employees' && (
                <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '600' }}>
                      Enrolled Team & Staff ({employees.length})
                    </h3>
                  </div>

                  {employees.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B' }}>
                      <Users size={36} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>No Staff Members Enrolled</div>
                      <div style={{ fontSize: '13px', marginTop: '4px' }}>This client operates with owner-only access or hasn't enrolled staff yet.</div>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                        <thead>
                          <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>
                            <th style={{ padding: '12px 20px', fontWeight: '600' }}>Employee Name</th>
                            <th style={{ padding: '12px 20px', fontWeight: '600' }}>Role / Position</th>
                            <th style={{ padding: '12px 20px', fontWeight: '600' }}>Branch</th>
                            <th style={{ padding: '12px 20px', fontWeight: '600' }}>Contact</th>
                            <th style={{ padding: '12px 20px', fontWeight: '600' }}>Salary</th>
                            <th style={{ padding: '12px 20px', fontWeight: '600' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employees.map(emp => (
                            <tr key={emp._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '14px 20px' }}>
                                <div style={{ fontWeight: '600', color: '#0F172A' }}>{emp.name}</div>
                                <div style={{ fontSize: '12px', color: '#64748B' }}>{emp.email}</div>
                              </td>
                              <td style={{ padding: '14px 20px', color: '#0F172A', fontSize: '13px' }}>{emp.position || emp.designation || 'Staff'}</td>
                              <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '13px' }}>{emp.branchName || 'Main'}</td>
                              <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '13px' }}>{emp.contactNumber || 'N/A'}</td>
                              <td style={{ padding: '14px 20px', color: '#0F172A', fontSize: '13px', fontWeight: '600' }}>
                                ₹{emp.salary ? Number(emp.salary).toLocaleString() : '0'}
                              </td>
                              <td style={{ padding: '14px 20px' }}>
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

              {/* TAB 4: BUSINESSES */}
              {(businessType === 4 || businesses.length > 1) && activeTab === 'businesses' && (
                <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '600' }}>
                      Conglomerate Businesses ({businesses.length})
                    </h3>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                      <thead>
                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>
                          <th style={{ padding: '12px 20px', fontWeight: '600' }}>Business Name</th>
                          <th style={{ padding: '12px 20px', fontWeight: '600' }}>Reg No.</th>
                          <th style={{ padding: '12px 20px', fontWeight: '600' }}>Phone</th>
                          <th style={{ padding: '12px 20px', fontWeight: '600' }}>Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {businesses.map((biz, idx) => (
                          <tr key={biz._id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0F172A' }}>{biz.name}</td>
                            <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '13px' }}>{biz.regNo || 'N/A'}</td>
                            <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '13px' }}>{biz.phone || 'N/A'}</td>
                            <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '13px' }}>{biz.address || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: LIVE WORKSPACE (EMBEDDED IN SAME PORT) */}
              {activeTab === 'workspace' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
                  <div style={{
                    padding: '12px 16px',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1D4ED8', fontSize: '13px', fontWeight: '600' }}>
                      <Layers size={16} />
                      <span>Live Client Portal View (Active on this port)</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => setIframeKey(k => k + 1)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: 'white',
                          border: '1px solid #BFDBFE',
                          borderRadius: '6px',
                          color: '#2563EB',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        <RefreshCw size={13} /> Reload View
                      </button>

                      <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: 'white',
                          border: '1px solid #BFDBFE',
                          borderRadius: '6px',
                          color: '#2563EB',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                        {isFullscreen ? 'Exit Fullscreen' : 'Maximize Workspace'}
                      </button>
                    </div>
                  </div>

                  {impersonationUrl ? (
                    <div style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                      height: isFullscreen ? 'calc(100vh - 220px)' : '560px',
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
                      <div>Setting up secure session connection...</div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid #E2E8F0',
          background: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div></div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '9px 18px',
                background: '#F1F5F9',
                color: '#475569',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#E2E8F0'}
              onMouseOut={(e) => e.currentTarget.style.background = '#F1F5F9'}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CustomerDetailsModal;
