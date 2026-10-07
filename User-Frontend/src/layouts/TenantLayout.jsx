import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, Users, Map, Calendar, LogOut, Bell, ChevronDown, Clock, Package, Archive, TrendingUp, ShoppingCart, Receipt, Building2, UserCheck, FileText, BellRing } from 'lucide-react';

const TenantLayout = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const tenantType = Number(localStorage.getItem('tenantType')) || 1;
  const [modules, setModules] = useState([]);

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
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tenantType');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  return (
    <div className="admin-layout">
      {/* Top Header */}
      <header className="top-header" style={{ padding: 0 }}>
        {/* Logo Area (Left) */}
        <div style={{ width: '240px', height: '100%', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '10px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden' }}>
            <img src="/logo.jpg" alt="BizTech Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-title)', fontFamily: 'Plus Jakarta Sans' }}>My Workspace</span>
        </div>

        {/* Header Right Content */}
        <div style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} color="var(--text-secondary)" />
            </div>
            
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', background: showProfileMenu ? '#F1F5F9' : 'transparent', transition: 'background 0.2s' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px' }}>
                  JD
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-title)' }}>Business Owner</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tenant Account</span>
                </div>
                <ChevronDown size={16} color="var(--text-muted)" style={{ marginLeft: '4px', transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </div>

              {showProfileMenu && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setShowProfileMenu(false)}></div>
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid var(--border-color)', width: '200px', zIndex: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '8px' }}>
                      <button 
                        onClick={() => { setShowProfileMenu(false); navigate('/tenant/profile'); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'transparent', border: 'none', color: 'var(--text-title)', fontSize: '14px', fontWeight: '500', cursor: 'pointer', borderRadius: '6px', textAlign: 'left' }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <UserCheck size={16} /> My Profile
                      </button>

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
                              onClick={() => { setShowProfileMenu(false); navigate('/tenant/billing'); }}
                              style={{ width: '100%', display: 'block', padding: '8px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }}
                              onMouseOver={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = 'var(--primary-blue)'; }}
                              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                            >
                              MY Plan &rarr; Upgrade Plan
                            </button>
                            <button 
                              onClick={() => { setShowProfileMenu(false); navigate('/tenant/billing'); }}
                              style={{ width: '100%', display: 'block', padding: '8px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }}
                              onMouseOver={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = 'var(--primary-blue)'; }}
                              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                            >
                              Plan Subscriptions (Monthly Paid list)
                            </button>
                          </div>
                        )}
                      </div>

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
        <div className="sidebar-scrollable" style={{ padding: '24px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', paddingLeft: '12px' }}>
            Menu
          </div>
          
          <NavLink 
            to="/tenant/dashboard" 
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

          {/* 2. Businesses */}
          {tenantType >= 4 && (
            <NavLink 
              to="/tenant/businesses" 
              style={({isActive}) => ({
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-lg)',
                color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
                background: isActive ? '#EFF4FF' : 'transparent',
                fontWeight: isActive ? '600' : '500',
                fontSize: '14px',
                textDecoration: 'none'
              })}
            >
              <Building2 size={18} />
              Businesses
            </NavLink>
          )}

          {/* 3. Branches */}
          {tenantType >= 3 && (
            <NavLink 
              to="/tenant/branches" 
              style={({isActive}) => ({
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-lg)',
                color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
                background: isActive ? '#EFF4FF' : 'transparent',
                fontWeight: isActive ? '600' : '500',
                fontSize: '14px',
                textDecoration: 'none'
              })}
            >
              <Map size={18} />
              Branches
            </NavLink>
          )}

          {/* 4. Product / Service */}
          {modules.includes('products_services') && (
            <NavLink to="/tenant/products" style={({isActive}) => ({ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-lg)', color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)', background: isActive ? '#EFF4FF' : 'transparent', fontWeight: isActive ? '600' : '500', fontSize: '14px', textDecoration: 'none' })}>
              <Package size={18} />
              Products & Services
            </NavLink>
          )}

          {/* 5. Stock / Inventory */}
          {modules.includes('inventory') && (
            <NavLink to="/tenant/inventory" style={({isActive}) => ({ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-lg)', color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)', background: isActive ? '#EFF4FF' : 'transparent', fontWeight: isActive ? '600' : '500', fontSize: '14px', textDecoration: 'none' })}>
              <Archive size={18} />
              Stock / Inventory
            </NavLink>
          )}

          {/* 6. Customers */}
          <NavLink 
            to="/tenant/customers" 
            style={({isActive}) => ({
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-lg)',
              color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
              background: isActive ? '#EFF4FF' : 'transparent',
              fontWeight: isActive ? '600' : '500',
              fontSize: '14px',
              textDecoration: 'none'
            })}
          >
            <UserCheck size={18} />
            Customers
          </NavLink>

          {/* 7. Expenses */}
          {modules.includes('expenses') && (
            <NavLink to="/tenant/expenses" style={({isActive}) => ({ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-lg)', color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)', background: isActive ? '#EFF4FF' : 'transparent', fontWeight: isActive ? '600' : '500', fontSize: '14px', textDecoration: 'none' })}>
              <Receipt size={18} />
              Expenses
            </NavLink>
          )}

          {/* 8. Purchases */}
          {modules.includes('purchases') && (
            <NavLink to="/tenant/purchases" style={({isActive}) => ({ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-lg)', color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)', background: isActive ? '#EFF4FF' : 'transparent', fontWeight: isActive ? '600' : '500', fontSize: '14px', textDecoration: 'none' })}>
              <ShoppingCart size={18} />
              Purchases
            </NavLink>
          )}

          {/* 9. Sales */}
          {modules.includes('sales') && (
            <NavLink to="/tenant/sales" style={({isActive}) => ({ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-lg)', color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)', background: isActive ? '#EFF4FF' : 'transparent', fontWeight: isActive ? '600' : '500', fontSize: '14px', textDecoration: 'none' })}>
              <TrendingUp size={18} />
              Sales
            </NavLink>
          )}

          {/* 10. Documents */}
          <NavLink 
            to="/tenant/documents" 
            style={({isActive}) => ({
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-lg)',
              color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
              background: isActive ? '#EFF4FF' : 'transparent',
              fontWeight: isActive ? '600' : '500',
              fontSize: '14px',
              textDecoration: 'none'
            })}
          >
            <FileText size={18} />
            Documents
          </NavLink>

          {/* 11. Reminders */}
          <NavLink 
            to="/tenant/reminders" 
            style={({isActive}) => ({
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-lg)',
              color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
              background: isActive ? '#EFF4FF' : 'transparent',
              fontWeight: isActive ? '600' : '500',
              fontSize: '14px',
              textDecoration: 'none'
            })}
          >
            <BellRing size={18} />
            Reminders
          </NavLink>

          {/* 12, 13, 14. Employees, Attendance, Leaves */}
          {tenantType >= 2 && (
            <>
              <NavLink 
                to="/tenant/employees" 
                style={({isActive}) => ({
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-lg)',
                  color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
                  background: isActive ? '#EFF4FF' : 'transparent',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '14px',
                  textDecoration: 'none'
                })}
              >
                <Users size={18} />
                Employees
              </NavLink>

              <NavLink 
                to="/tenant/attendance" 
                style={({isActive}) => ({
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-lg)',
                  color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
                  background: isActive ? '#EFF4FF' : 'transparent',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '14px',
                  textDecoration: 'none'
                })}
              >
                <Clock size={18} />
                Attendance
              </NavLink>

              <NavLink 
                to="/tenant/leaves" 
                style={({isActive}) => ({
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-lg)',
                  color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
                  background: isActive ? '#EFF4FF' : 'transparent',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '14px',
                  textDecoration: 'none'
                })}
              >
                <Calendar size={18} />
                Leave Requests
              </NavLink>
            </>
          )}
        </div>
        
        {/* Sidebar Footer */}
        <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontWeight: '600', fontSize: '14px', width: '100%', padding: '10px', borderRadius: '8px', transition: 'background 0.2s', border: 'none', cursor: 'pointer', background: 'transparent' }} onMouseOver={(e) => e.currentTarget.style.background = '#FEF2F2'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
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
