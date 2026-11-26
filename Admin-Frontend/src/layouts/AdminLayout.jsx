import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { LayoutGrid, Building2, Settings, Bell, User, ChevronDown, Hexagon, ShieldAlert, LogOut, Receipt, ShieldCheck, Mail } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const AdminLayout = () => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const stored = localStorage.getItem('adminUser');
      return stored ? JSON.parse(stored) : { name: 'Admin User', role: 'Superadmin', email: 'admin@biztech.com' };
    } catch (e) {
      return { name: 'Admin User', role: 'Superadmin', email: 'admin@biztech.com' };
    }
  });
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      fetch(`${import.meta.env.VITE_API_URL}/api/admin/payment-approvals/counts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.counts) {
            setPendingApprovalsCount(data.counts.pending || 0);
          }
        })
        .catch(() => {});
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    // Fetch latest admin profile
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.name) {
          setAdminUser(data);
          localStorage.setItem('adminUser', JSON.stringify(data));
        }
      })
      .catch(() => {});

    const handleProfileUpdate = () => {
      try {
        const stored = localStorage.getItem('adminUser');
        if (stored) setAdminUser(JSON.parse(stored));
      } catch (e) {}
    };

    window.addEventListener('adminProfileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('adminProfileUpdated', handleProfileUpdate);
  }, [navigate]);

  // Handle Back-Forward Cache (bfcache) and token loss on browser back arrow
  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted || !localStorage.getItem('adminToken')) {
        window.location.replace('/login');
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.replace('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'AU';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="admin-layout">
      {/* Top Header */}
      <header className="top-header" style={{ padding: 0 }}>
        {/* Logo Area (Left) */}
        <div style={{ width: '240px', height: '100%', display: 'flex', alignItems: 'center', padding: '0 20px', flexShrink: 0, boxSizing: 'border-box' }}>
          <img src="/biztech_logo.png" alt="BizTech" className="admin-logo-light" style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
          <img src="/biztech_logo_dark.png" alt="BizTech" className="admin-logo-dark" style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
        </div>

        {/* Header Right Content */}
        <div style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <ThemeToggle />
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} color="var(--text-secondary)" />
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%', border: '2px solid white' }}></div>
            </div>
            
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', background: showProfileMenu ? '#F1F5F9' : 'transparent', transition: 'background 0.2s' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px' }}>
                  {getInitials(adminUser?.name)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-title)' }}>{adminUser?.name || 'Admin User'}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{adminUser?.role || 'Superadmin'}</span>
                </div>
                <ChevronDown size={16} color="var(--text-muted)" style={{ marginLeft: '4px', transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </div>

              {showProfileMenu && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setShowProfileMenu(false)}></div>
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', borderRadius: '10px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', width: '220px', zIndex: 10, overflow: 'hidden' }}>
                    
                    {/* Header info */}
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-color)', background: '#F8FAFC' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-title)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {adminUser?.name || 'Admin User'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {adminUser?.email || 'admin@biztech.com'}
                      </div>
                    </div>

                    <div style={{ padding: '6px' }}>
                      <button 
                        onClick={() => { setShowProfileMenu(false); navigate('/admin/profile'); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: 'transparent', border: 'none', color: 'var(--text-title)', fontSize: '13px', fontWeight: '500', cursor: 'pointer', borderRadius: '6px', textAlign: 'left', transition: 'background 0.15s' }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <User size={16} color="var(--primary-blue)" /> Profile
                      </button>

                      <button 
                        onClick={() => { setShowProfileMenu(false); navigate('/admin/subscriptions'); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: 'transparent', border: 'none', color: 'var(--text-title)', fontSize: '13px', fontWeight: '500', cursor: 'pointer', borderRadius: '6px', textAlign: 'left', transition: 'background 0.15s' }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Receipt size={16} color="var(--primary-blue)" /> Manage Subscriptions
                      </button>

                      <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}></div>

                      <button 
                        onClick={handleLogout}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: 'transparent', border: 'none', color: '#EF4444', fontSize: '13px', fontWeight: '500', cursor: 'pointer', borderRadius: '6px', textAlign: 'left', transition: 'background 0.15s' }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#FEF2F2'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '24px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', paddingLeft: '12px' }}>
            Navigation
          </div>
          
          <NavLink 
            to="/admin/dashboard" 
            style={({isActive}) => ({
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-lg)',
              color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
              background: isActive ? '#EFF4FF' : 'transparent',
              fontWeight: isActive ? '600' : '500',
              fontSize: '14px',
              textDecoration: 'none'
            })}
          >
            <LayoutGrid size={18} />
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/admin/customers" 
            style={({isActive}) => {
              const isCustActive = isActive || window.location.pathname.includes('/admin/directory-registrations') || window.location.pathname.includes('/admin/registrations');
              return {
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-lg)',
                color: isCustActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
                background: isCustActive ? '#EFF4FF' : 'transparent',
                fontWeight: isCustActive ? '600' : '500',
                fontSize: '14px',
                textDecoration: 'none'
              };
            }}
          >
            <Building2 size={18} />
            Customer Directory
          </NavLink>

          <NavLink 
            to="/admin/inquiries" 
            style={({isActive}) => ({
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-lg)',
              color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
              background: isActive ? '#EFF4FF' : 'transparent',
              fontWeight: isActive ? '600' : '500',
              fontSize: '14px',
              textDecoration: 'none'
            })}
          >
            <Mail size={18} />
            Contact Inquiries
          </NavLink>

          <NavLink 
            to="/admin/payment-approvals" 
            style={({isActive}) => ({
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--radius-lg)',
              color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
              background: isActive ? '#EFF4FF' : 'transparent',
              fontWeight: isActive ? '600' : '500',
              fontSize: '14px',
              textDecoration: 'none'
            })}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={18} />
              Payment Approvals
            </div>
            {pendingApprovalsCount > 0 && (
              <span style={{
                background: '#EF4444',
                color: 'white',
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 7px',
                borderRadius: '10px',
                minWidth: '18px',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
              }}>
                {pendingApprovalsCount}
              </span>
            )}
          </NavLink>

          <NavLink 
            to="/admin/subscriptions" 
            style={({isActive}) => ({
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-lg)',
              color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
              background: isActive ? '#EFF4FF' : 'transparent',
              fontWeight: isActive ? '600' : '500',
              fontSize: '14px',
              textDecoration: 'none'
            })}
          >
            <Receipt size={18} />
            Manage Subscriptions
          </NavLink>
          
          <NavLink 
            to="/admin/pricing" 
            style={({isActive}) => ({
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-lg)',
              color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
              background: isActive ? '#EFF4FF' : 'transparent',
              fontWeight: isActive ? '600' : '500',
              fontSize: '14px',
              textDecoration: 'none'
            })}
          >
            <Hexagon size={18} />
            Pricing Plans
          </NavLink>
          
          <NavLink 
            to="/admin/settings" 
            style={({isActive}) => ({
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-lg)',
              color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
              background: isActive ? '#EFF4FF' : 'transparent',
              fontWeight: isActive ? '600' : '500',
              fontSize: '14px',
              textDecoration: 'none'
            })}
          >
            <Settings size={18} />
            Settings
          </NavLink>
        </div>
        
        {/* Sidebar Footer */}
        <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-blue)', marginBottom: '4px' }}>
             <ShieldAlert size={16} />
             <span style={{ fontSize: '13px', fontWeight: '600' }}>Admin Console</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            BizTech Platform
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-canvas animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;