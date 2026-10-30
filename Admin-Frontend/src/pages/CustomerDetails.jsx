import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, RefreshCw, Loader2, AlertCircle, Store, Users, Map, Building2, 
  ExternalLink, Globe, Check, Edit2 
} from 'lucide-react';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const [iframeKey, setIframeKey] = useState(1);

  // User Frontend URL configuration (localStorage > env > localhost fallback)
  const getInitialUserUrl = () => {
    const saved = localStorage.getItem('userFrontendUrl');
    if (saved && saved.trim()) return saved.trim();
    return import.meta.env.VITE_USER_FRONTEND_URL || 'http://localhost:5174';
  };

  const [userFrontendUrl, setUserFrontendUrl] = useState(getInitialUserUrl);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [inputUrl, setInputUrl] = useState(userFrontendUrl);

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

  const impersonationUrl = details?.impersonationToken 
    ? `${userFrontendUrl.replace(/\/+$/, '')}/impersonate?token=${encodeURIComponent(details.impersonationToken)}&user=${encodeURIComponent(JSON.stringify(details.user))}&embedded=true`
    : null;

  // Detect if on public HTTPS domain (e.g. Vercel) while userFrontendUrl is still pointing to private localhost
  const isLocalOnHttps = typeof window !== 'undefined' && 
    window.location.protocol === 'https:' && 
    (userFrontendUrl.startsWith('http://localhost') || userFrontendUrl.startsWith('http://127.0.0.1'));

  const handleSaveUrl = (e) => {
    if (e) e.preventDefault();
    let formatted = inputUrl.trim();
    if (!formatted) return;
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'https://' + formatted;
    }
    formatted = formatted.replace(/\/+$/, '');
    localStorage.setItem('userFrontendUrl', formatted);
    setUserFrontendUrl(formatted);
    setShowUrlModal(false);
    setIframeKey(k => k + 1);
  };

  if (loading && !details) {
    return (
      <div style={{ height: '100vh', width: '100vw', background: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', fontFamily: 'sans-serif' }}>
        <Loader2 size={40} color="#2563EB" style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ color: '#0F172A', fontSize: '16px', fontWeight: '600' }}>Opening Tenant Workspace...</div>
        <div style={{ color: '#64748B', fontSize: '13px' }}>Loading live dashboard and customer data</div>
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
        {/* Left: Back to Customer Directory & Info */}
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
          {/* User App Domain Config Button */}
          <button
            onClick={() => { setInputUrl(userFrontendUrl); setShowUrlModal(true); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '6px 12px',
              color: isLocalOnHttps ? '#FBBF24' : '#94A3B8',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#F8FAFC'; e.currentTarget.style.background = '#334155'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = isLocalOnHttps ? '#FBBF24' : '#94A3B8'; e.currentTarget.style.background = '#1E293B'; }}
            title="Configure User Frontend URL"
          >
            <Globe size={13} />
            <span>{isLocalOnHttps ? 'Connect User Vercel App' : 'User App URL'}</span>
            <Edit2 size={11} style={{ opacity: 0.7 }} />
          </button>

          {/* Open in New Window */}
          {impersonationUrl && (
            <button
              onClick={() => window.open(impersonationUrl, '_blank', 'noopener,noreferrer')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#2563EB',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#1D4ED8'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#2563EB'; }}
              title="Open Workspace in New Window"
            >
              <ExternalLink size={13} />
              Open in New Window
            </button>
          )}

          {/* Reload Workspace */}
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

      {/* Main Workspace View Container */}
      <div style={{ flex: 1, width: '100%', height: 'calc(100vh - 48px)', background: '#F8FAFC', position: 'relative' }}>
        
        {/* If on Vercel HTTPS but userFrontendUrl is still pointing to private localhost */}
        {isLocalOnHttps ? (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}>
            <div style={{
              background: 'white',
              padding: '36px',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              maxWidth: '540px',
              width: '100%',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <Globe size={44} color="#2563EB" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ margin: '0 0 8px 0', color: '#0F172A', fontSize: '18px', fontWeight: '700' }}>
                Connect User Frontend on Vercel
              </h3>
              <p style={{ color: '#64748B', fontSize: '13px', lineHeight: '1.5', margin: '0 0 20px 0' }}>
                Because this Admin portal is running on <strong>https://biz-tech-topaz.vercel.app</strong>, modern browsers block private local network iframes (<code>{userFrontendUrl}</code>).
                <br /><br />
                Enter your deployed <strong>User Frontend Vercel URL</strong> below to load the live workspace directly:
              </p>

              <form onSubmit={handleSaveUrl} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="https://your-user-app.vercel.app"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    background: '#2563EB',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Connect
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                {impersonationUrl && (
                  <button
                    onClick={() => window.open(impersonationUrl, '_blank', 'noopener,noreferrer')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563EB',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'underline'
                    }}
                  >
                    <ExternalLink size={13} /> Or open directly in a new window
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : impersonationUrl ? (
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

      {/* URL Config Modal (Accessible via Header button) */}
      {showUrlModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '28px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>
              User Frontend Portal URL
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>
              Specify the target URL of your deployed User Frontend web app (on Vercel or locally) to embed the live workspace.
            </p>

            <form onSubmit={handleSaveUrl}>
              <input
                type="text"
                placeholder="https://your-user-app.vercel.app"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                  marginBottom: '20px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowUrlModal(false)}
                  style={{
                    padding: '8px 16px',
                    background: '#F1F5F9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    background: '#2563EB',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerDetails;
