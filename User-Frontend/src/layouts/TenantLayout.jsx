import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, Users, Map, Calendar, LogOut, Bell, ChevronDown, Clock, Package, Archive, TrendingUp, ShoppingCart, Receipt, Building2, UserCheck, FileText, BellRing, Store } from 'lucide-react';

const TenantLayout = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const tenantType = Number(localStorage.getItem('tenantType')) || 1;
  const [currentBranch, setCurrentBranch] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUser();

    const handleProfileUpdate = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) setCurrentUser(JSON.parse(userStr));
      } catch (e) { }
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate);
  }, []);

  useEffect(() => {
    const fetchActiveAlerts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reminders/active-notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setActiveAlerts(data);
        }
      } catch (err) {
        console.error('Error fetching active alerts:', err);
      }
    };

    fetchActiveAlerts();

    const handleRemindersUpdate = () => fetchActiveAlerts();
    window.addEventListener('remindersUpdated', handleRemindersUpdate);
    return () => window.removeEventListener('remindersUpdated', handleRemindersUpdate);
  }, []);

  useEffect(() => {
    try {
      let userModules = [];
      const userStr = localStorage.getItem('user');

      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj && Array.isArray(userObj.modules)) {
          userModules = userObj.modules;
        }
      }

      // Fallback
      if (userModules.length === 0) {
        userModules = JSON.parse(localStorage.getItem('modules')) || [];
      }

      setModules(userModules);
    } catch (err) {
      setModules([]);
    }
  }, []);

  useEffect(() => {
    const fetchSingleBranch = async () => {
      if (tenantType !== 2) return;
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/branches`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCurrentBranch(data[0]);
          }
        }
      } catch (e) {
        console.error('Error fetching single branch in layout:', e);
      }
    };

    fetchSingleBranch();
    const handleBranchUpdate = () => fetchSingleBranch();
    window.addEventListener('branchDataUpdated', handleBranchUpdate);
    return () => window.removeEventListener('branchDataUpdated', handleBranchUpdate);
  }, [tenantType]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const isImpersonated = localStorage.getItem('impersonatedByAdmin') === 'true';
  const isEmbedded = localStorage.getItem('isEmbedded') === 'true';
  const adminReturnUrl = localStorage.getItem('adminReturnUrl') || 'http://localhost:5173/admin/customers';

  const handleExitImpersonation = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tenantType');
    localStorage.removeItem('user');
    localStorage.removeItem('modules');
    localStorage.removeItem('impersonatedByAdmin');
    localStorage.removeItem('adminReturnUrl');
    localStorage.removeItem('isEmbedded');
    if (window.top && window.top !== window) {
      window.top.location.href = adminReturnUrl;
    } else {
      window.location.href = adminReturnUrl;
    }
  };

  const handleLogout = () => {
    if (isImpersonated) {
      handleExitImpersonation();
      return;
    }
    localStorage.removeItem('token');
    localStorage.removeItem('tenantType');
    localStorage.removeItem('user');
    localStorage.removeItem('modules');
    localStorage.removeItem('isEmbedded');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('onb_')) localStorage.removeItem(key);
    });
    navigate('/', { replace: true });
  };

  return (
    <div className="admin-layout" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Admin Impersonation Top Banner */}
      {isImpersonated && !isEmbedded && (
        <div style={{
          background: 'linear-gradient(90deg, #0F172A 0%, #1E293B 100%)',
          borderBottom: '1px solid #334155',
          color: '#F8FAFC',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10001,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          fontSize: '13px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ 
              background: '#2563EB', 
              color: 'white', 
              padding: '3px 10px', 
              borderRadius: '20px', 
              fontSize: '11px', 
              fontWeight: '700', 
              letterSpacing: '0.6px',
              textTransform: 'uppercase' 
            }}>
              Admin Impersonation Mode
            </span>
            <span>
              Managing User: <strong style={{ color: '#60A5FA' }}>{currentUser?.businessName || currentUser?.name || 'Customer'}</strong> ({currentUser?.email || 'Active Client'})
            </span>
          </div>
          <button 
            onClick={handleExitImpersonation}
            style={{
              background: '#EF4444',
              color: 'white',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#DC2626'}
            onMouseOut={(e) => e.currentTarget.style.background = '#EF4444'}
          >
            <LogOut size={14} /> Exit to Admin Portal
          </button>
        </div>
      )}

      {/* Top Header */}
      <header className="top-header" style={{ padding: 0 }}>
        {/* Logo Area (Left) */}
        <div style={{ width: '240px', height: '100%', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '10px', flexShrink: 0, borderRight: '1px solid var(--border-color)', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0', flexShrink: 0 }}>
            <img src="/logo.jpg" alt="BizTech Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-title)', fontFamily: 'Plus Jakarta Sans' }}>My Workspace</span>
        </div>

        {/* Header Right Content */}
        <div style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          {currentUser?.role === 'branch' ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#1D4ED8',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              <Store size={15} />
              <span>Branch: <strong>{currentUser?.branchName}</strong></span>
              {currentUser?.branchLocation && (
                <span style={{ color: '#64748B', fontSize: '12px', fontWeight: '400' }}>• {currentUser?.branchLocation}</span>
              )}
            </div>
          ) : tenantType === 2 && currentBranch ? (
            <div 
              onClick={() => navigate('/tenant/branches')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '20px',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1D4ED8',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Manage your single branch location"
              onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'}
              onMouseOut={(e) => e.currentTarget.style.background = '#EFF6FF'}
            >
              <Store size={15} />
              <span>Branch: <strong>{currentBranch.name}</strong></span>
              {currentBranch.location && (
                <span style={{ color: '#64748B', fontSize: '12px', fontWeight: '400' }}>• {currentBranch.location}</span>
              )}
            </div>
          ) : <div />}

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Notification Bell with Badge & Dropdown */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => {
                  setShowAlertMenu(!showAlertMenu);
                  setShowProfileMenu(false);
                }}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  width: '38px', height: '38px',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: showAlertMenu ? '#F1F5F9' : '#F8FAFC',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.15s ease',
                  color: activeAlerts.length > 0 ? 'var(--primary-blue)' : 'var(--text-secondary)'
                }}
                title="Reminders & Notifications"
                onMouseOver={(e) => { if (!showAlertMenu) e.currentTarget.style.background = '#F1F5F9'; }}
                onMouseOut={(e) => { if (!showAlertMenu) e.currentTarget.style.background = '#F8FAFC'; }}
              >
                <Bell size={18} />
                {activeAlerts.length > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    background: '#EF4444', color: 'white',
                    fontSize: '10px', fontWeight: '700',
                    minWidth: '18px', height: '18px',
                    padding: '0 4px',
                    borderRadius: '9999px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)',
                    lineHeight: '1'
                  }}>
                    {activeAlerts.length}
                  </span>
                )}
              </div>

              {showAlertMenu && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setShowAlertMenu(false)}></div>
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', width: '320px', zIndex: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-title)' }}>Reminder Alerts</span>
                      <span style={{ fontSize: '11px', fontWeight: '700', background: '#EFF6FF', color: 'var(--primary-blue)', padding: '2px 8px', borderRadius: '10px' }}>
                        {activeAlerts.length} Active
                      </span>
                    </div>

                    <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '8px' }}>
                      {activeAlerts.length === 0 ? (
                        <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                          No upcoming alerts for today or advance window.
                        </div>
                      ) : (
                        activeAlerts.map(alert => (
                          <div
                            key={alert._id}
                            onClick={() => { setShowAlertMenu(false); navigate('/tenant/reminders'); }}
                            style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', borderBottom: '1px solid #F1F5F9' }}
                            onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '700', color: alert.isDueToday ? '#DC2626' : '#D97706' }}>
                                {alert.isDueToday ? 'DUE TODAY' : `IN ${alert.daysRemaining} DAYS`}
                              </span>
                              {alert.repeatMonthly && (
                                <span style={{ fontSize: '10px', color: '#7C3AED', background: '#F5F3FF', padding: '1px 5px', borderRadius: '4px' }}>Monthly</span>
                              )}
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'var(--text-title)' }}>{alert.title}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div style={{ padding: '8px', borderTop: '1px solid var(--border-color)', textAlign: 'center', background: '#F8FAFC' }}>
                      <button
                        onClick={() => { setShowAlertMenu(false); navigate('/tenant/reminders'); }}
                        style={{ width: '100%', padding: '6px', fontSize: '12px', fontWeight: '600', color: 'var(--primary-blue)', border: 'none', background: 'transparent', cursor: 'pointer' }}
                      >
                        View Calendar & Reminders &rarr;
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <div
                onClick={() => {
                  if (showProfileMenu) {
                    setShowProfileMenu(false);
                    setShowSubMenu(false);
                  } else {
                    setShowProfileMenu(true);
                    setShowAlertMenu(false);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '5px 10px 5px 6px',
                  borderRadius: '8px',
                  background: showProfileMenu ? '#F1F5F9' : '#F8FAFC',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => { if (!showProfileMenu) e.currentTarget.style.background = '#F1F5F9'; }}
                onMouseOut={(e) => { if (!showProfileMenu) e.currentTarget.style.background = '#F8FAFC'; }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '13px',
                  boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                  flexShrink: 0
                }}>
                  {getInitials(currentUser?.fullName)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-title)', lineHeight: '1.2' }}>
                    {currentUser?.fullName || 'Business Owner'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      color: '#2563EB',
                      background: '#EFF6FF',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      lineHeight: '1.2'
                    }}>
                      {currentUser?.userId || 'BT-TENANT'}
                    </span>
                  </div>
                </div>
                <ChevronDown size={14} color="var(--text-muted)" style={{ marginLeft: '2px', transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </div>

              {showProfileMenu && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => { setShowProfileMenu(false); setShowSubMenu(false); }}></div>
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid var(--border-color)', width: '220px', zIndex: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-color)', background: '#F8FAFC' }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'var(--text-title)' }}>
                        {currentUser?.fullName || 'Business Owner'}
                      </p>
                      <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: 'var(--primary-blue)', fontFamily: 'monospace', fontWeight: '700' }}>
                        UID: {currentUser?.userId || 'BT-TENANT'}
                      </p>
                    </div>
                    <div style={{ padding: '8px' }}>
                      <button
                        onClick={() => { setShowProfileMenu(false); setShowSubMenu(false); navigate('/tenant/profile'); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'transparent', border: 'none', color: 'var(--text-title)', fontSize: '14px', fontWeight: '500', cursor: 'pointer', borderRadius: '6px', textAlign: 'left' }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <UserCheck size={16} /> My Profile
                      </button>

                      {currentUser?.role !== 'branch' && (
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowSubMenu(!showSubMenu); }}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: showSubMenu ? '#F1F5F9' : 'transparent', border: 'none', color: 'var(--text-title)', fontSize: '14px', fontWeight: '500', cursor: 'pointer', borderRadius: '6px', textAlign: 'left' }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
                            onMouseOut={(e) => e.currentTarget.style.background = showSubMenu ? '#F1F5F9' : 'transparent'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Receipt size={16} /> My Subscription
                            </div>
                            <ChevronDown size={14} style={{ transform: showSubMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                          </button>

                          {showSubMenu && (
                            <div style={{ padding: '4px 0 4px 32px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <button
                                onClick={() => { setShowProfileMenu(false); setShowSubMenu(false); navigate('/tenant/billing?tab=plan'); }}
                                style={{ width: '100%', display: 'block', padding: '8px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }}
                                onMouseOver={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = 'var(--primary-blue)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                              >
                                MY Plan &rarr; Upgrade Plan
                              </button>
                              <button
                                onClick={() => { setShowProfileMenu(false); setShowSubMenu(false); navigate('/tenant/billing?tab=subscriptions'); }}
                                style={{ width: '100%', display: 'block', padding: '8px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }}
                                onMouseOver={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = 'var(--primary-blue)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                              >
                                Plan Subscriptions (Monthly Paid list)
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}></div>

                      <button
                        onClick={handleLogout}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'transparent', border: 'none', color: '#EF4444', fontSize: '14px', fontWeight: '500', cursor: 'pointer', borderRadius: '6px', textAlign: 'left' }}
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
        <div className="sidebar-scrollable" style={{ padding: '20px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {/* <div style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', paddingLeft: '12px' }}>
            Menu
          </div> */}

          <NavLink to="/tenant/dashboard" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
            <LayoutGrid size={18} />
            <span>Dashboard</span>
          </NavLink>

          {/* 2. Businesses - Owner Only */}
          {tenantType >= 4 && currentUser?.role !== 'branch' && (
            <NavLink to="/tenant/businesses" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
              <Building2 size={18} />
              <span>Businesses</span>
            </NavLink>
          )}

          {/* 3. Branches - Type 2 (Single Branch) and Type 3 & 4 (Multi Branch) */}
          {tenantType >= 2 && currentUser?.role !== 'branch' && (
            <NavLink to="/tenant/branches" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
              <Map size={18} />
              <span>{tenantType === 2 ? 'Branch' : 'Branches'}</span>
            </NavLink>
          )}

          {/* 4. Product / Service */}
          {modules.includes('products_services') && (
            <NavLink to="/tenant/products" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
              <Package size={18} />
              <span>Products & Services</span>
            </NavLink>
          )}

          {/* 5. Stock / Inventory */}
          {modules.includes('inventory') && (
            <NavLink to="/tenant/inventory" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
              <Archive size={18} />
              <span>Stock / Inventory</span>
            </NavLink>
          )}

          {/* 6. Customers */}
          <NavLink to="/tenant/customers" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
            <UserCheck size={18} />
            <span>Customers</span>
          </NavLink>

          {/* 7. Expenses - Visible to all businesses */}
          <NavLink to="/tenant/expenses" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
            <Receipt size={18} />
            <span>Expenses</span>
          </NavLink>

          {/* 8. Purchases */}
          {modules.includes('purchases') && (
            <NavLink to="/tenant/purchases" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
              <ShoppingCart size={18} />
              <span>Purchases</span>
            </NavLink>
          )}

          {/* 9. Sales */}
          {modules.includes('sales') && (
            <NavLink to="/tenant/sales" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
              <TrendingUp size={18} />
              <span>Billing</span>
            </NavLink>
          )}

          {/* 10. Documents */}
          <NavLink to="/tenant/documents" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
            <FileText size={18} />
            <span>Documents</span>
          </NavLink>

          {/* 11. Reminders */}
          <NavLink to="/tenant/reminders" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
            <BellRing size={18} />
            <span>Reminders</span>
          </NavLink>

          {/* 12, 13, 14. Employees, Attendance, Leaves */}
          {tenantType >= 2 && (
            <>
              <NavLink to="/tenant/employees" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
                <Users size={18} />
                <span>Employees</span>
              </NavLink>

              <NavLink to="/tenant/attendance" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
                <Clock size={18} />
                <span>Attendance</span>
              </NavLink>

              <NavLink to="/tenant/leaves" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
                <Calendar size={18} />
                <span>Leave Requests</span>
              </NavLink>
            </>
          )}
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: '16px 14px', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontWeight: '600', fontSize: '13px', width: '100%', padding: '9px 12px', borderRadius: '8px', transition: 'background 0.15s ease', border: 'none', cursor: 'pointer', background: 'transparent' }} onMouseOver={(e) => e.currentTarget.style.background = '#FEF2F2'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-canvas animate-fade-in" style={{ flex: '1 0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TenantLayout;
