import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LayoutGrid, Users, Map, Calendar, LogOut, Bell, ChevronDown, Clock, Package, Archive, TrendingUp, ShoppingCart, Receipt, Building2, UserCheck, FileText, BellRing, Store, Lock, Briefcase, Eye, Wrench, Check, Layers, Plus } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import ThemeToggle from '../components/ThemeToggle';

const TenantLayout = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const tenantType = Number(localStorage.getItem('tenantType')) || 1;
  const [currentBranch, setCurrentBranch] = useState(null);
  const [branchesList, setBranchesList] = useState([]);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const branchDropdownRef = useRef(null);
  const [selectedBranchFilterId, setSelectedBranchFilterId] = useState(() => {
    return localStorage.getItem('selectedBranchFilterId') || 'all';
  });

  const [businessesList, setBusinessesList] = useState([]);
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const businessDropdownRef = useRef(null);
  const [selectedBusinessFilterId, setSelectedBusinessFilterId] = useState(() => {
    return localStorage.getItem('selectedBusinessFilterId') || 'all';
  });
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
          if (data.workspaceTemplate) {
            localStorage.setItem('workspace_sidebar_template', data.workspaceTemplate);
            document.documentElement.setAttribute('data-sidebar-template', data.workspaceTemplate);
          }
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
    const applyTemplate = () => {
      const template = localStorage.getItem('workspace_sidebar_template') || 'none';
      document.documentElement.setAttribute('data-sidebar-template', template);
    };
    applyTemplate();
    window.addEventListener('themeTemplateChanged', applyTemplate);
    return () => window.removeEventListener('themeTemplateChanged', applyTemplate);
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
        if (userObj && userObj.role === 'employee') {
          userModules = Array.from(new Set([...userModules, 'customers', 'expenses', 'documents', 'reminders']));
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
    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/branches`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setBranchesList(data);
            if (data.length > 0) {
              setCurrentBranch(data[0]);
            }
          }
        }
      } catch (e) {
        console.error('Error fetching branches in layout:', e);
      }
    };

    fetchBranches();
    const handleBranchUpdate = () => fetchBranches();
    window.addEventListener('branchDataUpdated', handleBranchUpdate);
    return () => window.removeEventListener('branchDataUpdated', handleBranchUpdate);
  }, [tenantType]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/businesses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setBusinessesList(data);
          }
        }
      } catch (e) {
        console.error('Error fetching businesses in layout:', e);
      }
    };

    fetchBusinesses();
    const handleBusinessUpdate = () => fetchBusinesses();
    window.addEventListener('businessDataUpdated', handleBusinessUpdate);
    return () => window.removeEventListener('businessDataUpdated', handleBusinessUpdate);
  }, [tenantType]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target)) {
        setShowBranchDropdown(false);
      }
      if (businessDropdownRef.current && !businessDropdownRef.current.contains(event.target)) {
        setShowBusinessDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectBranch = (branchId, branchName) => {
    setSelectedBranchFilterId(branchId);
    localStorage.setItem('selectedBranchFilterId', branchId);
    localStorage.setItem('selectedBranchFilterName', branchName);
    setShowBranchDropdown(false);
    window.dispatchEvent(new CustomEvent('branchFilterChanged', { detail: { branchId, branchName } }));
  };

  const handleSelectBusiness = (businessId, businessName) => {
    setSelectedBusinessFilterId(businessId);
    localStorage.setItem('selectedBusinessFilterId', businessId);
    localStorage.setItem('selectedBusinessFilterName', businessName);
    setShowBusinessDropdown(false);
    window.dispatchEvent(new CustomEvent('businessFilterChanged', { detail: { businessId, businessName } }));

    // Reset branch selection to 'all' so branches align cleanly with the newly active business
    setSelectedBranchFilterId('all');
    localStorage.setItem('selectedBranchFilterId', 'all');
    localStorage.setItem('selectedBranchFilterName', 'All Branches');
    window.dispatchEvent(new CustomEvent('branchFilterChanged', { detail: { branchId: 'all', branchName: 'All Branches' } }));
  };

  // Handle Back-Forward Cache (bfcache) and token loss on browser back arrow
  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted || !localStorage.getItem('token')) {
        window.location.replace('/login');
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const isInsideIframe = typeof window !== 'undefined' && window.top !== window;
  const isImpersonated = localStorage.getItem('impersonatedByAdmin') === 'true';
  const isEmbedded = localStorage.getItem('isEmbedded') === 'true' || isInsideIframe;

  const handleExitImpersonation = () => {
    const adminReturnUrl = localStorage.getItem('adminReturnUrl');
    localStorage.removeItem('token');
    localStorage.removeItem('tenantType');
    localStorage.removeItem('user');
    localStorage.removeItem('modules');
    localStorage.removeItem('impersonatedByAdmin');
    localStorage.removeItem('adminReturnUrl');
    localStorage.removeItem('isEmbedded');
    localStorage.removeItem('activeBusiness');
    localStorage.removeItem('selectedBusinessFilterId');
    localStorage.removeItem('selectedBusinessFilterName');
    localStorage.removeItem('selectedBranchFilterId');
    localStorage.removeItem('selectedBranchFilterName');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('onb_')) localStorage.removeItem(key);
    });
    if (adminReturnUrl) {
      window.location.href = adminReturnUrl;
    } else {
      window.location.replace('/login');
    }
  };

  const handleLogout = () => {
    // Clear all session & impersonation keys so user frontend returns cleanly to user login
    localStorage.removeItem('token');
    localStorage.removeItem('tenantType');
    localStorage.removeItem('user');
    localStorage.removeItem('modules');
    localStorage.removeItem('impersonatedByAdmin');
    localStorage.removeItem('adminReturnUrl');
    localStorage.removeItem('isEmbedded');
    localStorage.removeItem('activeBusiness');
    localStorage.removeItem('selectedBusinessFilterId');
    localStorage.removeItem('selectedBusinessFilterName');
    localStorage.removeItem('selectedBranchFilterId');
    localStorage.removeItem('selectedBranchFilterName');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('onb_')) localStorage.removeItem(key);
    });
    window.location.replace('/login');
  };

  const location = useLocation();

  // Route permission validation for employees and investors
  const isEmployeeRestricted = () => {
    const path = location.pathname.toLowerCase();

    // Type 1 & Type 2 restriction: Branch management section is omitted (single-location accounts)
    if (tenantType <= 2 && path.includes('/tenant/branches')) {
      return true;
    }

    // Investor role restriction (View-only for business operations; restricted from HR & Billing management)
    if (currentUser?.role === 'investor') {
      if (path.includes('/tenant/employees') ||
        path.includes('/tenant/attendance') ||
        path.includes('/tenant/leaves') ||
        path.includes('/tenant/reminders') ||
        path.includes('/tenant/billing')) {
        return true;
      }
      return false;
    }

    if (currentUser?.role !== 'employee') return false;

    // Admin-only management routes
    if (path.includes('/tenant/businesses') ||
      path.includes('/tenant/branches') ||
      path.includes('/tenant/employees') ||
      path.includes('/tenant/billing') ||
      path.includes('/tenant/investors')) {
      return true;
    }

    // Selectable operational module permission checks (Product, Inventory, Purchases, Attendance, Leaves)
    const isServiceOnly = currentUser?.offeringType === 'service' || currentUser?.businessOfferingType === 'service';
    const isProductOnly = currentUser?.offeringType === 'product' || currentUser?.businessOfferingType === 'product';
    if (path.includes('/tenant/purchases') && isServiceOnly) return true;
    if (path.includes('/tenant/products') && isServiceOnly) return true;
    if (path.includes('/tenant/inventory') && isServiceOnly) return true;
    if (path.includes('/tenant/services') && isProductOnly) return true;
    if (path.includes('/tenant/attendance') && !modules.includes('attendance')) return true;
    if (path.includes('/tenant/leaves') && !modules.includes('leaves')) return true;
    // Billing (/tenant/sales) is mandatory for all logins

    // Remaining sections (customers, expenses, documents, reminders)
    // are default for all employees and are never restricted!

    return false;
  };

  const resolvedTenantType = Number(currentUser?.businessType || currentUser?.type || localStorage.getItem('tenantType')) || tenantType;
  const isType3User = resolvedTenantType === 3 || tenantType === 3 || currentUser?.businessType === 3 || currentUser?.businessType === '3';
  const isType4User = resolvedTenantType === 4 || tenantType === 4 || currentUser?.businessType === 4 || currentUser?.businessType === '4';

  // Businesses list preparation for Type 4
  const hasRealBusinesses = businessesList && businessesList.length > 0;
  const sampleBusinesses = [
    { _id: 'sample-biz-1', name: 'Apex Retail Group', category: 'Retail & Supermarkets', city: 'Bangalore' },
    { _id: 'sample-biz-2', name: 'Nexus Logistics & Supply', category: 'Wholesale & Logistics', city: 'Mumbai' },
    { _id: 'sample-biz-3', name: 'Zenith Tech Solutions', category: 'IT & Support Services', city: 'Hyderabad' }
  ];
  const displayBusinesses = hasRealBusinesses ? businessesList : sampleBusinesses;

  const activeBusinessObj = selectedBusinessFilterId === 'all'
    ? null
    : displayBusinesses.find(b => b._id === selectedBusinessFilterId);
  const activeBusinessLabel = selectedBusinessFilterId === 'all'
    ? 'All Businesses'
    : (activeBusinessObj?.name || localStorage.getItem('selectedBusinessFilterName') || 'All Businesses');

  // Branches list preparation (scoped by business in Type 4 if a business is selected)
  const hasRealBranches = branchesList && branchesList.length > 0;
  const sampleBranches = [
    { _id: 'sample-1', name: 'Main Branch (HQ)', location: 'Indiranagar, Bangalore', isHeadquarters: true, businessName: 'Apex Retail Group' },
    { _id: 'sample-2', name: 'North Branch', location: 'Malleshwaram, Bangalore', businessName: 'Apex Retail Group' },
    { _id: 'sample-3', name: 'South Branch', location: 'Koramangala, Bangalore', businessName: 'Nexus Logistics & Supply' }
  ];

  const scopedBranches = isType4User && selectedBusinessFilterId !== 'all'
    ? (hasRealBranches
      ? branchesList.filter(b => !b.businessName || b.businessName.toLowerCase() === activeBusinessLabel.toLowerCase())
      : sampleBranches.filter(b => !b.businessName || b.businessName === activeBusinessLabel))
    : (hasRealBranches ? branchesList : sampleBranches);

  const displayBranches = scopedBranches.length > 0
    ? scopedBranches
    : (hasRealBranches ? branchesList : sampleBranches);

  const activeBranchObj = selectedBranchFilterId === 'all'
    ? null
    : displayBranches.find(b => b._id === selectedBranchFilterId);
  const activeBranchLabel = selectedBranchFilterId === 'all'
    ? 'All Branches'
    : (activeBranchObj?.name || localStorage.getItem('selectedBranchFilterName') || 'All Branches');

  const renderBusinessFilterDropdown = () => (
    <div ref={businessDropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="header-filter-btn"
        onClick={() => {
          setShowBusinessDropdown(!showBusinessDropdown);
          setShowBranchDropdown(false);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          padding: '6px 14px',
          borderRadius: '24px',
          background: showBusinessDropdown ? '#F5F3FF' : '#F8FAFC',
          border: showBusinessDropdown ? '1.5px solid #7C3AED' : '1px solid #CBD5E1',
          cursor: 'pointer',
          boxShadow: showBusinessDropdown ? '0 0 0 3px rgba(124,58,237,0.1)' : '0 1px 2px rgba(0,0,0,0.03)',
          transition: 'all 0.15s ease'
        }}
        title="Filter active business view"
        onMouseOver={(e) => {
          if (!showBusinessDropdown) {
            e.currentTarget.style.background = '#F1F5F9';
            e.currentTarget.style.borderColor = '#94A3B8';
          }
        }}
        onMouseOut={(e) => {
          if (!showBusinessDropdown) {
            e.currentTarget.style.background = '#F8FAFC';
            e.currentTarget.style.borderColor = '#CBD5E1';
          }
        }}
      >
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '7px',
          background: '#F5F3FF',
          color: '#7C3AED',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Building2 size={14} />
        </div>

        <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeBusinessLabel}
        </span>

        <ChevronDown size={14} color="#64748B" style={{ transform: showBusinessDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>

      {showBusinessDropdown && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          width: '280px',
          background: 'white',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 16px 36px -4px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 23, 42, 0.05)',
          zIndex: 1100,
          overflow: 'hidden'
        }}>
          <div style={{ padding: '6px' }}>
            <button
              type="button"
              onClick={() => handleSelectBusiness('all', 'All Businesses')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '8px',
                border: 'none',
                background: selectedBusinessFilterId === 'all' ? '#F5F3FF' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s ease'
              }}
              onMouseOver={(e) => {
                if (selectedBusinessFilterId !== 'all') e.currentTarget.style.background = '#F8FAFC';
              }}
              onMouseOut={(e) => {
                if (selectedBusinessFilterId !== 'all') e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: selectedBusinessFilterId === 'all' ? '#EDE9FE' : '#F1F5F9',
                  color: selectedBusinessFilterId === 'all' ? '#7C3AED' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Layers size={15} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: selectedBusinessFilterId === 'all' ? '#6D28D9' : '#0F172A' }}>
                  All Businesses
                </span>
              </div>
              {selectedBusinessFilterId === 'all' && (
                <Check size={16} color="#7C3AED" style={{ flexShrink: 0 }} />
              )}
            </button>

            <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 8px' }} />

            <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
              {displayBusinesses.map((biz) => {
                const isSelected = selectedBusinessFilterId === biz._id;
                return (
                  <button
                    key={biz._id}
                    type="button"
                    onClick={() => handleSelectBusiness(biz._id, biz.name)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isSelected ? '#F5F3FF' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#F8FAFC';
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: isSelected ? '#EDE9FE' : '#F8FAFC',
                        color: isSelected ? '#7C3AED' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Building2 size={15} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: isSelected ? '#6D28D9' : '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {biz.name}
                      </span>
                    </div>
                    {isSelected && (
                      <Check size={16} color="#7C3AED" style={{ flexShrink: 0, marginLeft: '8px' }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{
            padding: '10px 14px',
            background: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center'
          }}>
            <button
              type="button"
              onClick={() => {
                setShowBusinessDropdown(false);
                navigate('/tenant/businesses');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#7C3AED',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: 0
              }}
            >
              <Plus size={13} />
              <span>Manage or Add Businesses</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderBranchFilterDropdown = () => (
    <div ref={branchDropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="header-filter-btn"
        onClick={() => {
          setShowBranchDropdown(!showBranchDropdown);
          setShowBusinessDropdown(false);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          padding: '6px 14px',
          borderRadius: '24px',
          background: showBranchDropdown ? '#EFF6FF' : '#F8FAFC',
          border: showBranchDropdown ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
          cursor: 'pointer',
          boxShadow: showBranchDropdown ? '0 0 0 3px rgba(37,99,235,0.1)' : '0 1px 2px rgba(0,0,0,0.03)',
          transition: 'all 0.15s ease'
        }}
        title="Filter active branch view"
        onMouseOver={(e) => {
          if (!showBranchDropdown) {
            e.currentTarget.style.background = '#F1F5F9';
            e.currentTarget.style.borderColor = '#94A3B8';
          }
        }}
        onMouseOut={(e) => {
          if (!showBranchDropdown) {
            e.currentTarget.style.background = '#F8FAFC';
            e.currentTarget.style.borderColor = '#CBD5E1';
          }
        }}
      >
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '7px',
          background: '#EFF6FF',
          color: '#2563EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Store size={14} />
        </div>

        <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeBranchLabel}
        </span>

        <ChevronDown size={14} color="#64748B" style={{ transform: showBranchDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>

      {showBranchDropdown && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          width: '280px',
          background: 'white',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 16px 36px -4px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 23, 42, 0.05)',
          zIndex: 1100,
          overflow: 'hidden'
        }}>
          <div style={{ padding: '6px' }}>
            <button
              type="button"
              onClick={() => handleSelectBranch('all', 'All Branches')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '8px',
                border: 'none',
                background: selectedBranchFilterId === 'all' ? '#EFF6FF' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s ease'
              }}
              onMouseOver={(e) => {
                if (selectedBranchFilterId !== 'all') e.currentTarget.style.background = '#F8FAFC';
              }}
              onMouseOut={(e) => {
                if (selectedBranchFilterId !== 'all') e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: selectedBranchFilterId === 'all' ? '#DBEAFE' : '#F1F5F9',
                  color: selectedBranchFilterId === 'all' ? '#1D4ED8' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Layers size={15} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: selectedBranchFilterId === 'all' ? '#1D4ED8' : '#0F172A' }}>
                  All Branches
                </span>
              </div>
              {selectedBranchFilterId === 'all' && (
                <Check size={16} color="#2563EB" style={{ flexShrink: 0 }} />
              )}
            </button>

            <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 8px' }} />

            <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
              {displayBranches.map((branch) => {
                const isSelected = selectedBranchFilterId === branch._id;
                return (
                  <button
                    key={branch._id}
                    type="button"
                    onClick={() => handleSelectBranch(branch._id, branch.name)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isSelected ? '#EFF6FF' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#F8FAFC';
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: isSelected ? '#DBEAFE' : '#F8FAFC',
                        color: isSelected ? '#1D4ED8' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Store size={15} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: isSelected ? '#1D4ED8' : '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {branch.name}
                      </span>
                    </div>
                    {isSelected && (
                      <Check size={16} color="#2563EB" style={{ flexShrink: 0, marginLeft: '8px' }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{
            padding: '10px 14px',
            background: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center'
          }}>
            <button
              type="button"
              onClick={() => {
                setShowBranchDropdown(false);
                navigate('/tenant/branches');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563EB',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: 0
              }}
            >
              <Plus size={13} />
              <span>Manage or Add Branches</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`admin-layout ${currentUser?.role === 'investor' ? 'role-investor' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
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
            <LogOut size={14} /> Exit Impersonation
          </button>
        </div>
      )}

      {/* Top Header */}
      <header className="top-header" style={{ padding: 0 }}>
        {/* Logo Area (Left) */}
        <div style={{ width: '240px', height: '100%', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '10px', flexShrink: 0, borderRight: '1px solid var(--border-color)', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0', flexShrink: 0, background: 'white' }}>
            <img 
              src={currentUser?.businessLogo || "/logo.jpg"} 
              alt="Workspace Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              onError={(e) => { e.currentTarget.src = '/logo.jpg'; }}
            />
          </div>
          <span 
            className="header-brand-title" 
            style={{ 
              fontSize: '17px', 
              fontWeight: '700', 
              color: 'var(--text-title)', 
              fontFamily: 'Plus Jakarta Sans',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={currentUser?.businessName || "My Workspace"}
          >
            {currentUser?.businessName || "My Workspace"}
          </span>
        </div>

        {/* Header Right Content */}
        <div style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          {currentUser?.role === 'employee' ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              <UserCheck size={15} color="#059669" />
              <span>Employee: <strong>{currentUser?.fullName}</strong></span>
              {currentUser?.designation && (
                <span style={{ color: '#047857', fontSize: '12px', fontWeight: '500' }}>({currentUser?.designation})</span>
              )}
              {currentUser?.branchName && (
                <span style={{ color: '#64748B', fontSize: '12px', fontWeight: '400' }}>• {currentUser?.branchName}</span>
              )}
            </div>
          ) : currentUser?.role === 'business' ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: '#F5F3FF',
              border: '1px solid #DDD6FE',
              color: '#6D28D9',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              <Building2 size={15} color="#7C3AED" />
              <span>Business: <strong>{currentUser?.businessName}</strong></span>
              {currentUser?.businessAddress && (
                <span style={{ color: '#64748B', fontSize: '12px', fontWeight: '400' }}>• {currentUser?.businessAddress}</span>
              )}
            </div>
          ) : currentUser?.role === 'branch' ? (
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
          ) : isType4User ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
              {renderBusinessFilterDropdown()}
              <div style={{ width: '1px', height: '22px', background: '#E2E8F0', flexShrink: 0 }} />
              {renderBranchFilterDropdown()}
            </div>
          ) : isType3User ? (
            renderBranchFilterDropdown()
          ) : tenantType === 2 && currentBranch ? (
            <div
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
                fontWeight: '600'
              }}
              title="Single Store Location"
            >
              <Store size={15} />
              <span>Location: <strong>{currentBranch.name}</strong></span>
              {currentBranch.location && (
                <span style={{ color: '#64748B', fontSize: '12px', fontWeight: '400' }}>• {currentBranch.location}</span>
              )}
            </div>
          ) : <div />}

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {currentUser?.role === 'investor' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#EFF6FF',
                color: '#1D4ED8',
                border: '1px solid #BFDBFE',
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                <Eye size={14} />
                <span>Investor View (Read-Only)</span>
              </div>
            )}
            <ThemeToggle />
            <LanguageSelector />
            {/* Notification Bell with Badge & Dropdown */}
            <div style={{ position: 'relative' }}>
              <div
                className="header-profile-btn"
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
                className="header-profile-btn"
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
                  <span className="header-user-name" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-title)', lineHeight: '1.2' }}>
                    {currentUser?.fullName || 'Business Owner'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <span className="header-user-badge" style={{
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

                      {currentUser?.role !== 'branch' && currentUser?.role !== 'business' && currentUser?.role !== 'employee' && (
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
          {tenantType >= 4 && currentUser?.role !== 'branch' && currentUser?.role !== 'business' && currentUser?.role !== 'employee' && (
            <NavLink to="/tenant/businesses" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
              <Building2 size={18} />
              <span>Businesses</span>
            </NavLink>
          )}

          {/* 3. Branches - Type 3 & 4 (Multi Branch Enterprise) */}
          {tenantType >= 3 && currentUser?.role !== 'branch' && currentUser?.role !== 'employee' && (
            <NavLink to="/tenant/branches" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
              <Map size={18} />
              <span>Branches</span>
            </NavLink>
          )}

          {/* 4. Investors - Type 3 and Type 4 (Owner Administration & Investor View-Only) */}
          {(tenantType === 3 || tenantType === 4) && currentUser?.role !== 'employee' && currentUser?.role !== 'branch' && (
            <NavLink to="/tenant/investors" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
              <Briefcase size={18} />
              <span>Investors</span>
            </NavLink>
          )}

          {/* 4a. Purchases (Procurement: shown if Product is selected, placed above Products) */}
          {(currentUser?.offeringType === 'product' || currentUser?.offeringType === 'both' || currentUser?.businessOfferingType === 'product' || currentUser?.businessOfferingType === 'both' || (!currentUser?.offeringType && !currentUser?.businessOfferingType)) && (
            <NavLink to="/tenant/purchases" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
              <ShoppingCart size={18} />
              <span>Purchases</span>
            </NavLink>
          )}

          {/* 4b. Products (shown if offering is product or both) */}
          {(currentUser?.offeringType === 'product' || currentUser?.offeringType === 'both' || currentUser?.businessOfferingType === 'product' || currentUser?.businessOfferingType === 'both' || (!currentUser?.offeringType && !currentUser?.businessOfferingType)) && (
            <NavLink to="/tenant/products" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
              <Package size={18} />
              <span>Products</span>
            </NavLink>
          )}

          {/* 4c. Services (shown if offering is service, both, or institution) */}
          {(currentUser?.offeringType === 'service' || currentUser?.offeringType === 'both' || currentUser?.offeringType === 'institution' || currentUser?.businessOfferingType === 'service' || currentUser?.businessOfferingType === 'both' || currentUser?.businessOfferingType === 'institution') && (
            <NavLink to="/tenant/services" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
              <Wrench size={18} />
              <span>Services</span>
            </NavLink>
          )}

          {/* 5. Stock / Inventory (hidden for pure service businesses) */}
          {currentUser?.offeringType !== 'service' && currentUser?.businessOfferingType !== 'service' && (
            <NavLink to="/tenant/inventory" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
              <Archive size={18} />
              <span>Stock / Inventory</span>
            </NavLink>
          )}

          {/* 6. Customers */}
          {(currentUser?.role === 'employee' || modules.includes('customers') || currentUser?.role !== 'employee') && (
            <NavLink to="/tenant/customers" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
              <UserCheck size={18} />
              <span>Customers</span>
            </NavLink>
          )}

          {/* 7. Expenses */}
          {(currentUser?.role === 'employee' || modules.includes('expenses') || currentUser?.role !== 'employee') && (
            <NavLink to="/tenant/expenses" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
              <Receipt size={18} />
              <span>Expenses</span>
            </NavLink>
          )}

          {/* 9. Sales / Billing (Mandatory core feature across all user logins) */}
          <NavLink to="/tenant/sales" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
            <TrendingUp size={18} />
            <span>Billing</span>
          </NavLink>

          {/* 10. Documents */}
          {(currentUser?.role === 'employee' || modules.includes('documents') || currentUser?.role !== 'employee') && (
            <NavLink to="/tenant/documents" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
              <FileText size={18} />
              <span>Documents</span>
            </NavLink>
          )}

          {/* 11. Reminders */}
          {currentUser?.role !== 'investor' && (currentUser?.role === 'employee' || modules.includes('reminders') || currentUser?.role !== 'employee') && (
            <NavLink to="/tenant/reminders" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
              <BellRing size={18} />
              <span>Reminders</span>
            </NavLink>
          )}

          {/* 12. Employees */}
          {tenantType >= 1 && currentUser?.role !== 'employee' && currentUser?.role !== 'investor' && (
            <NavLink to="/tenant/employees" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
              <Users size={18} />
              <span>Employees</span>
            </NavLink>
          )}

          {/* 13, 14. Attendance & Leaves - Available to Employees and Admins */}
          {tenantType >= 1 && currentUser?.role !== 'investor' && (
            <>
              {(currentUser?.role !== 'employee' || modules.includes('attendance')) && (
                <NavLink to="/tenant/attendance" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
                  <Clock size={18} />
                  <span>Attendance</span>
                </NavLink>
              )}

              {(currentUser?.role !== 'employee' || modules.includes('leaves')) && (
                <NavLink to="/tenant/leaves" className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}>
                  <Calendar size={18} />
                  <span>Leaves & Permissions</span>
                </NavLink>
              )}
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
          {isEmployeeRestricted() ? (
            <div style={{
              maxWidth: '540px',
              margin: '60px auto',
              background: 'white',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              padding: '40px 32px',
              textAlign: 'center',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#FEF2F2',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                border: '1px solid #FECACA'
              }}>
                <Lock size={30} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                Access Restricted
              </h2>
              <p style={{ color: '#64748B', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
                You do not have permission to view or manage this section. Your workspace owner or branch manager must enable this section in your employee login credentials.
              </p>
              <button
                onClick={() => navigate('/tenant/dashboard')}
                style={{
                  padding: '11px 24px',
                  background: '#2563EB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  );
};

export default TenantLayout;
