import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Loader2, AlertCircle, Store, Users, Map, Building2 } from 'lucide-react';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const [iframeKey, setIframeKey] = useState(1);

  const userFrontendUrl = import.meta.env.VITE_USER_FRONTEND_URL || 'http://localhost:5174';
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  const businessType = Number(customer.businessType || 1);
  const typeLabel = `Type ${businessType}: ${
    businessType === 1 ? 'Sole Operator' : 
    businessType === 2 ? 'Single Branch + Staff' : 
    businessType === 3 ? 'Multi-Branch Enterprise' : 
    'Multi-Business Conglomerate'
  }`;

  const adminReturnUrl = window.location.origin + '/admin/customers';
  const impersonationUrl = details?.impersonationToken 
    ? `${userFrontendUrl}/impersonate?token=${encodeURIComponent(details.impersonationToken)}&user=${encodeURIComponent(JSON.stringify(details.user))}&adminReturnUrl=${encodeURIComponent(adminReturnUrl)}&embedded=true`
    : null;

  if (loading && !details) {
    return (
      <div style={{ height: '100vh', width: '100vw', background: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', fontFamily: 'sans-serif' }}>
        <Loader2 size={40} color="#2563EB" style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ color: '#0F172A', fontSize: '16px', fontWeight: '600' }}>Opening Tenant Workspace...</div>
        <div style={{ color: '#64748B', fontSize: '13px' }}>Loading live dashboard and modules</div>
      </div>
    );
  }

  if (error && !details) {
    return (
      <div style={{ height: '100vh', width: '100vw', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'sans-serif' }}>
        <div style={{ padding: '36px', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', textAlign: 'center', maxWidth: '480px', width: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <AlertCircle size={44} color="#EF4444" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#0F172A', fontSize: '18px' }}>Failed to Load Customer Workspace</h3>
          <p style={{ color: '#64748B', fontSize: '14px', margin: '0 0 24px 0' }}>{error}</p>
          <button onClick={() => navigate('/admin/customers')} className="btn-primary" style={{ padding: '10px 20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} /> Back to Customer Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0F172A' }}>
      
      {/* Top Workspace Header Bar */}
      <header style={{
        height: '48px',
        background: '#0F172A',
        color: '#F8FAFC',
        padding: '0 20px',
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
              padding: '6px 12px', 
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
            Back to Customer Directory
          </button>

          <div style={{ height: '18px', width: '1px', background: '#334155' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: '#2563EB',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {businessType === 1 && <Store size={14} />}
              {businessType === 2 && <Users size={14} />}
              {businessType === 3 && <Map size={14} />}
              {businessType === 4 && <Building2 size={14} />}
            </div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#F8FAFC' }}>
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
          <button 
            onClick={() => setIframeKey(k => k + 1)}
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
            title="Reload Workspace View"
          >
            <RefreshCw size={13} />
            Reload Workspace
          </button>
        </div>
      </header>

      {/* Live Workspace Container */}
      <div style={{ flex: 1, width: '100%', height: 'calc(100vh - 48px)', background: '#F8FAFC', position: 'relative' }}>
        {impersonationUrl ? (
          <iframe
            key={iframeKey}
            src={impersonationUrl}
            title="Live Tenant Workspace"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block'
            }}
          />
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <Loader2 size={32} color="#2563EB" style={{ animation: 'spin 1s linear infinite' }} />
            <div style={{ color: '#64748B', fontSize: '14px' }}>Connecting to live tenant workspace...</div>
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomerDetails;
