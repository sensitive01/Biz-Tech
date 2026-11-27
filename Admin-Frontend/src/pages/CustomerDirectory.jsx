import { exportToCSV } from '../utils/exportToCSV';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Store, Users, Map, ChevronLeft, ChevronRight, Filter, ChevronDown, Download, ArrowUp, ArrowDown, ArrowUpDown, X, User, Mail, Phone, MapPin, Briefcase, Calendar, Eye, Trash2, AlertTriangle, Building2, LogIn, ExternalLink, Loader2, UserCheck, Layers, Sparkles } from 'lucide-react';

const extractCityOrArea = (address) => {
  if (!address || typeof address !== 'string' || address === 'Not specified') return '';
  const cleaned = address.trim().replace(/[.,;]+$/, '');
  const parts = cleaned.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) return '';
  for (let i = parts.length - 1; i >= 0; i--) {
    let part = parts[i];
    let withoutPin = part.replace(/(?:PIN\s*:?|-)?\s*\b\d{5,6}\b/gi, '').trim();
    if (withoutPin && !/^\d+$/.test(withoutPin)) {
      return withoutPin.replace(/[.,;]+$/, '').trim().slice(0, 25);
    }
  }
  return parts[parts.length - 1].slice(0, 25);
};

const CustomerDirectory = () => {
  const navigate = useNavigate();
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All Clients');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [customersData, setCustomersData] = useState([]);
  const [bizCount, setBizCount] = useState(0);
  const [careerCount, setCareerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteCustomerId, setDeleteCustomerId] = useState(null);
  const [impersonatingId, setImpersonatingId] = useState(null);

  const handleManageUser = async (customer) => {
    try {
      setImpersonatingId(customer._id);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/impersonate/${customer._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to initialize user session');
        return;
      }

      const data = await res.json();
      const userFrontendUrl = import.meta.env.VITE_USER_FRONTEND_URL || 'http://localhost:5174';
      const adminReturnUrl = window.location.href;
      
      const impersonateUrl = `${userFrontendUrl}/impersonate?token=${encodeURIComponent(data.token)}&user=${encodeURIComponent(JSON.stringify(data.user))}&adminReturnUrl=${encodeURIComponent(adminReturnUrl)}`;
      
      window.location.href = impersonateUrl;
    } catch (err) {
      console.error('Impersonation error:', err);
      alert('Error connecting to user workspace');
    } finally {
      setImpersonatingId(null);
    }
  };

  const fetchCustomers = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`)
      .then(res => res.json())
      .then(data => {
        const formattedData = data.map(user => {
          const bType = Number(user.businessType) || 1;
          const typeLabel = bType === 1 
            ? 'Type 1: Sole Operator' 
            : bType === 2 
            ? 'Type 2: Single Branch + Staff' 
            : bType === 3 
            ? 'Type 3: Multi-Branch Enterprise' 
            : 'Type 4: Multi-Business Conglomerate';

          // Branch count for Type 3:
          const brCount = Number(
            user.branchCount ?? 
            user.branchesCount ?? 
            (Array.isArray(user.branches) ? user.branches.length : undefined)
          ) || 0;

          // Business count for Type 4:
          const bizCount = (Array.isArray(user.businesses) && user.businesses.length > 0)
            ? user.businesses.length
            : (Number(user.businessCount ?? user.businessesCount) || 1);

          // Location display:
          let locationDisplay = '1 Shop';
          if (bType === 1 || bType === 2) {
            locationDisplay = '1 Shop';
          } else if (bType === 3) {
            locationDisplay = brCount === 1 ? '1 Branch' : `${brCount} Branches`;
          } else if (bType === 4) {
            locationDisplay = bizCount === 1 ? '1 Business' : `${bizCount} Businesses`;
          }

          return {
            _id: user._id,
            id: user._id.substring(user._id.length - 6).toUpperCase(),
            businessName: user.businessName || (user.fullName + "'s Business"),
            type: bType,
            typeLabel,
            contactName: user.fullName,
            contactEmail: user.email,
            contactPhone: user.phone || 'N/A',
            industry: user.industry || 'Not specified',
            fullAddress: user.address && user.address.trim() ? user.address.trim() : 'Not specified',
            city: extractCityOrArea(user.address),
            branchCount: brCount,
            branchesCount: brCount,
            businessCount: bizCount,
            businessesCount: bizCount,
            employeeCount: Number(user.employeeCount ?? user.employeesCount) || 0,
            employeesCount: Number(user.employeeCount ?? user.employeesCount) || 0,
            offeringType: user.businessOfferingType || user.offeringType || 'product',
            joinedAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
            createdAt: user.createdAt,
            locations: locationDisplay,
            staff: bType === 1 ? 'Owner Only' : 'Staff Enrolled',
            staffDesc: bType === 1 ? '0 Staff' : 'Uses Roster',
            status: user.status || user.subscriptionStatus || 'Active',
            modules: user.modules || []
          };
        });
        setCustomersData(formattedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch users", err);
        setLoading(false);
      });

    // Also fetch business and career counts for navigation parity
    fetch(`${import.meta.env.VITE_API_URL}/api/directory/businesses`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setBizCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {});

    fetch(`${import.meta.env.VITE_API_URL}/api/directory/careers`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setCareerCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {});
  };

  React.useEffect(() => {
    fetchCustomers();
  }, []);

  const confirmDelete = async () => {
    if (!deleteCustomerId) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${deleteCustomerId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDeleteCustomerId(null);
        fetchCustomers();
      } else {
        alert('Failed to delete customer');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting customer');
    }
  };

  const filteredCustomers = React.useMemo(() => {
    return customersData.filter(customer => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (customer.businessName && customer.businessName.toLowerCase().includes(q)) ||
        (customer.contactName && customer.contactName.toLowerCase().includes(q)) ||
        (customer.contactEmail && customer.contactEmail.toLowerCase().includes(q)) ||
        (customer.contactPhone && customer.contactPhone.toLowerCase().includes(q)) ||
        (customer.id && customer.id.toLowerCase().includes(q)) ||
        (customer.industry && customer.industry.toLowerCase().includes(q)) ||
        (customer.typeLabel && customer.typeLabel.toLowerCase().includes(q)) ||
        (customer.locations && customer.locations.toLowerCase().includes(q)) ||
        (customer.city && customer.city.toLowerCase().includes(q)) ||
        (customer.fullAddress && customer.fullAddress.toLowerCase().includes(q))
      );

      let matchesFilter = true;
      if (selectedFilter.startsWith('Type 1') || selectedFilter === 'Solo Operator') matchesFilter = customer.type === 1;
      else if (selectedFilter.startsWith('Type 2') || selectedFilter === 'Single Branch') matchesFilter = customer.type === 2;
      else if (selectedFilter.startsWith('Type 3') || selectedFilter === 'Multiple Branch') matchesFilter = customer.type === 3;
      else if (selectedFilter.startsWith('Type 4') || selectedFilter === 'Multiple Business') matchesFilter = customer.type === 4;

      return matchesSearch && matchesFilter;
    });
  }, [customersData, searchQuery, selectedFilter]);

  const sortedCustomers = React.useMemo(() => {
    let sortableItems = [...filteredCustomers];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key] || '';
        let valB = b[sortConfig.key] || '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [sortConfig, filteredCustomers]);

  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = sortedCustomers.slice(startIndex, startIndex + itemsPerPage);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} style={{ color: 'var(--primary-blue)' }} /> : <ArrowDown size={14} style={{ color: 'var(--primary-blue)' }} />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Customers</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            View and manage all registered business clients
          </p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => navigate('/admin/customers/new')}
        >
          <Plus size={18} />
          Add New Customer
        </button>
      </div>

      {/* DIRECTORY SECTION SWITCHER BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px',
        background: '#F1F5F9',
        borderRadius: '12px',
        width: 'fit-content'
      }}>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: 'white',
            color: '#2563EB',
            fontWeight: '700',
            fontSize: '13.5px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Building2 size={16} />
          Pro Business Clients ({customersData.length})
        </button>

        <button
          onClick={() => navigate('/admin/directory-registrations?tab=business')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: 'transparent',
            color: '#64748B',
            fontWeight: '600',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
          onMouseOver={e => e.currentTarget.style.color = '#0F172A'}
          onMouseOut={e => e.currentTarget.style.color = '#64748B'}
        >
          <Store size={16} />
          Business Registrations ({bizCount})
        </button>

        <button
          onClick={() => navigate('/admin/directory-registrations?tab=career')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: 'transparent',
            color: '#64748B',
            fontWeight: '600',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
          onMouseOver={e => e.currentTarget.style.color = '#0F172A'}
          onMouseOut={e => e.currentTarget.style.color = '#64748B'}
        >
          <Briefcase size={16} />
          Career Registrations ({careerCount})
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '8px' }}>
        {/* Card 1: Total Client */}
        <div 
          onClick={() => { setSelectedFilter('All Clients'); setCurrentPage(1); }}
          style={{ 
            background: 'white', 
            borderRadius: '16px', 
            border: selectedFilter === 'All Clients' ? '2px solid #2563EB' : '1px solid #E2E8F0', 
            padding: '18px 16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '14px', 
            boxShadow: selectedFilter === 'All Clients' ? '0 4px 12px rgba(37,99,235,0.12)' : '0 2px 4px rgba(0,0,0,0.02)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Click to view all clients"
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Users size={22} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600', whiteSpace: 'nowrap' }}>Total Client</p>
            <h3 style={{ margin: 0, fontSize: '22px', color: '#0F172A', fontWeight: '700' }}>{customersData.length}</h3>
          </div>
        </div>

        {/* Card 2: Solo Operator */}
        <div 
          onClick={() => { setSelectedFilter(selectedFilter.startsWith('Type 1') ? 'All Clients' : 'Type 1: Sole Operator'); setCurrentPage(1); }}
          style={{ 
            background: 'white', 
            borderRadius: '16px', 
            border: (selectedFilter.startsWith('Type 1') || selectedFilter === 'Solo Operator') ? '2px solid #8B5CF6' : '1px solid #E2E8F0', 
            padding: '18px 16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '14px', 
            boxShadow: (selectedFilter.startsWith('Type 1') || selectedFilter === 'Solo Operator') ? '0 4px 12px rgba(139,92,246,0.12)' : '0 2px 4px rgba(0,0,0,0.02)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Click to filter by Solo Operator (Type 1)"
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <UserCheck size={22} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600', whiteSpace: 'nowrap' }}>Solo Operator</p>
            <h3 style={{ margin: 0, fontSize: '22px', color: '#0F172A', fontWeight: '700' }}>
              {customersData.filter(c => c.type === 1).length}
            </h3>
          </div>
        </div>

        {/* Card 3: Single Branch */}
        <div 
          onClick={() => { setSelectedFilter(selectedFilter.startsWith('Type 2') ? 'All Clients' : 'Type 2: Single Branch + Staff'); setCurrentPage(1); }}
          style={{ 
            background: 'white', 
            borderRadius: '16px', 
            border: (selectedFilter.startsWith('Type 2') || selectedFilter === 'Single Branch') ? '2px solid #16A34A' : '1px solid #E2E8F0', 
            padding: '18px 16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '14px', 
            boxShadow: (selectedFilter.startsWith('Type 2') || selectedFilter === 'Single Branch') ? '0 4px 12px rgba(22,163,74,0.12)' : '0 2px 4px rgba(0,0,0,0.02)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Click to filter by Single Branch (Type 2)"
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Store size={22} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600', whiteSpace: 'nowrap' }}>Single Branch</p>
            <h3 style={{ margin: 0, fontSize: '22px', color: '#0F172A', fontWeight: '700' }}>
              {customersData.filter(c => c.type === 2).length}
            </h3>
          </div>
        </div>

        {/* Card 4: Multiple Branch */}
        <div 
          onClick={() => { setSelectedFilter(selectedFilter.startsWith('Type 3') ? 'All Clients' : 'Type 3: Multi-Branch Enterprise'); setCurrentPage(1); }}
          style={{ 
            background: 'white', 
            borderRadius: '16px', 
            border: (selectedFilter.startsWith('Type 3') || selectedFilter === 'Multiple Branch') ? '2px solid #D97706' : '1px solid #E2E8F0', 
            padding: '18px 16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '14px', 
            boxShadow: (selectedFilter.startsWith('Type 3') || selectedFilter === 'Multiple Branch') ? '0 4px 12px rgba(217,119,6,0.12)' : '0 2px 4px rgba(0,0,0,0.02)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Click to filter by Multiple Branch (Type 3)"
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapPin size={22} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600', whiteSpace: 'nowrap' }}>Multiple Branch</p>
            <h3 style={{ margin: 0, fontSize: '22px', color: '#0F172A', fontWeight: '700' }}>
              {customersData.filter(c => c.type === 3).length}
            </h3>
          </div>
        </div>

        {/* Card 5: Multiple Business */}
        <div 
          onClick={() => { setSelectedFilter(selectedFilter.startsWith('Type 4') ? 'All Clients' : 'Type 4: Multi-Business Conglomerate'); setCurrentPage(1); }}
          style={{ 
            background: 'white', 
            borderRadius: '16px', 
            border: (selectedFilter.startsWith('Type 4') || selectedFilter === 'Multiple Business') ? '2px solid #4F46E5' : '1px solid #E2E8F0', 
            padding: '18px 16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '14px', 
            boxShadow: (selectedFilter.startsWith('Type 4') || selectedFilter === 'Multiple Business') ? '0 4px 12px rgba(79,70,229,0.12)' : '0 2px 4px rgba(0,0,0,0.02)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Click to filter by Multiple Business (Type 4)"
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building2 size={22} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600', whiteSpace: 'nowrap' }}>Multiple Business</p>
            <h3 style={{ margin: 0, fontSize: '22px', color: '#0F172A', fontWeight: '700' }}>
              {customersData.filter(c => c.type === 4).length}
            </h3>
          </div>
        </div>
      </div>

      {/* Search & Filter Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by business name or owner..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: '100%', padding: '10px 36px 10px 38px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', outline: 'none', background: 'white' }}
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <button 
              className="btn-secondary" 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', background: 'white' }}
            >
              <Filter size={16} /> {selectedFilter} <ChevronDown size={16} />
            </button>
            {showFilterDropdown && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '280px', zIndex: 10, overflow: 'hidden' }}>
                {[
                  'All Clients', 
                  'Type 1: Sole Operator', 
                  'Type 2: Single Branch + Staff', 
                  'Type 3: Multi-Branch Enterprise', 
                  'Type 4: Multi-Business Conglomerate'
                ].map((filter, idx, arr) => (
                  <button 
                    key={filter}
                    onClick={() => { setSelectedFilter(filter); setShowFilterDropdown(false); setCurrentPage(1); }}
                    style={{ 
                      display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: '13px', 
                      color: filter === selectedFilter ? 'var(--primary-blue)' : 'var(--text-title)', 
                      background: filter === selectedFilter ? '#EFF4FF' : 'transparent', 
                      borderBottom: idx === arr.length - 1 ? 'none' : '1px solid var(--border-color)', 
                      fontWeight: '500', cursor: 'pointer' 
                    }}
                    onMouseOver={(e) => { if(filter !== selectedFilter) e.currentTarget.style.background = '#F8FAFC' }}
                    onMouseOut={(e) => { if(filter !== selectedFilter) e.currentTarget.style.background = 'transparent' }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button onClick={() => exportToCSV(sortedCustomers, 'CustomerDirectory')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#475569', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}><Download size={16} /> Export</button>
        </div>
      </div>

      {/* Data Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '16px 24px', fontWeight: '600', width: '60px' }}>S.NO</th>
              <th onClick={() => requestSort('businessName')} style={{ padding: '16px 24px', fontWeight: '600', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', width: '100px'  }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>Business Name</span> {renderSortIcon('businessName')}</div>
              </th>
              <th onClick={() => requestSort('type')} style={{ padding: '16px 24px', fontWeight: '600', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>Business Archetype</span> {renderSortIcon('type')}</div>
              </th>
              <th onClick={() => requestSort('contactName')} style={{ padding: '16px 24px', fontWeight: '600', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>Primary Contact</span> {renderSortIcon('contactName')}</div>
              </th>
              <th onClick={() => requestSort('locations')} style={{ padding: '16px 24px', fontWeight: '600', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>Locations</span> {renderSortIcon('locations')}</div>
              </th>
              <th onClick={() => requestSort('staff')} style={{ padding: '16px 24px', fontWeight: '600', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>Staffing Size</span> {renderSortIcon('staff')}</div>
              </th>
              <th onClick={() => requestSort('status')} style={{ padding: '16px 24px', fontWeight: '600', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>Status</span> {renderSortIcon('status')}</div>
              </th>
              <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '48px 20px', color: '#94A3B8' }}>
                  <Users size={40} style={{ opacity: 0.3, marginBottom: '10px', display: 'inline-block' }} />
                  <h4 style={{ margin: '0 0 6px 0', color: '#334155', fontSize: '16px', fontWeight: '700' }}>No Customers Found</h4>
                  <p style={{ margin: 0, fontSize: '13.5px' }}>No registered business clients match your current search or filter criteria.</p>
                </td>
              </tr>
            ) : (
              paginatedCustomers.map((customer, idx) => (
                <tr key={customer.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '500' }}>{startIndex + idx + 1}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div 
                        onClick={() => navigate(`/admin/customers/${customer._id}`)}
                        style={{ width: '40px', height: '40px', borderRadius: '8px', background: `var(--badge-type${customer.type}-bg)`, color: customer.type === 1 ? 'var(--primary-blue)' : `var(--badge-type${customer.type}-text)`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.15s' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        title="View Customer Page"
                      >
                        {customer.type === 1 && <Store size={20} />}
                        {customer.type === 2 && <Users size={20} />}
                        {customer.type === 3 && <Map size={20} />}
                        {customer.type === 4 && <Building2 size={20} />}
                      </div>
                      <div>
                        <div 
                          onClick={() => navigate(`/admin/customers/${customer._id}`)}
                          style={{ fontWeight: '600', color: 'var(--primary-blue)', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                          title="Click to view customer details page"
                          onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                          {customer.businessName}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ID: {customer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                    <span 
                      className="badge" 
                      style={{ 
                        background: `var(--badge-type${customer.type}-bg)`, 
                        color: customer.type === 1 ? 'var(--primary-blue)' : `var(--badge-type${customer.type}-text)`,
                        whiteSpace: 'nowrap',
                        fontWeight: '600',
                        fontSize: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px'
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
                      {customer.typeLabel}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '500', color: 'var(--text-title)', fontSize: '14px' }}>{customer.contactName}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{customer.contactEmail}</div>
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                    <span 
                      className="badge" 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '5px 12px', 
                        borderRadius: '6px', 
                        fontSize: '12px', 
                        fontWeight: '500', 
                        background: 'var(--badge-type1-bg)', 
                        color: 'var(--text-title)', 
                        border: '1px solid var(--border-color)', 
                        whiteSpace: 'nowrap' 
                      }}
                      title={customer.fullAddress !== 'Not specified' ? customer.fullAddress : undefined}
                    >
                      <MapPin size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <span>{customer.locations}</span>
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '500', color: 'var(--text-title)', fontSize: '14px' }}>{customer.staff}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{customer.staffDesc}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span className="badge" style={{ background: customer.status === 'Active' ? 'var(--badge-active-bg)' : 'var(--badge-pending-bg)', color: customer.status === 'Active' ? 'var(--badge-active-text)' : 'var(--badge-pending-text)' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                      {customer.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      {/* <button 
                        type="button" 
                        onClick={() => handleManageUser(customer)} 
                        disabled={impersonatingId === customer._id}
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '6px',
                          padding: '6px 12px', 
                          background: '#EFF6FF', 
                          color: 'var(--primary-blue)', 
                          border: '1px solid #BFDBFE', 
                          borderRadius: '6px', 
                          cursor: impersonatingId === customer._id ? 'wait' : 'pointer', 
                          fontSize: '13px',
                          fontWeight: '600',
                          transition: 'all 0.2s' 
                        }} 
                        title="Manage User Workspace (Access all sidebar modules and data)" 
                        onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'} 
                        onMouseOut={(e) => e.currentTarget.style.background = '#EFF6FF'}
                      >
                        {impersonatingId === customer._id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <LogIn size={14} />}
                        Manage
                      </button> */}
                      <button type="button" onClick={() => navigate(`/admin/customers/${customer._id}`)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#F8FAFC', color: '#64748B', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }} title="View Customer Page" onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'} onMouseOut={(e) => e.currentTarget.style.background = '#F8FAFC'}>
                        <Eye size={16} />
                      </button>
                      <button type="button" onClick={() => setDeleteCustomerId(customer._id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }} title="Delete Customer" onMouseOver={(e) => e.currentTarget.style.background = '#FECACA'} onMouseOut={(e) => e.currentTarget.style.background = '#FEE2E2'}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
        <div style={{ 
          padding: '16px 24px', 
          background: '#F8FAFC', 
          borderTop: '1px solid var(--border-color)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Left: Summary */}
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Showing{' '}
            <strong>{sortedCustomers.length === 0 ? 0 : startIndex + 1}</strong>
            {' '}-{' '}
            <strong>{Math.min(startIndex + itemsPerPage, sortedCustomers.length)}</strong>
            {' '}of{' '}
            <strong>{sortedCustomers.length}</strong> customers
          </div>

          {/* Right: Show section in front of Previous and Next buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* Section to adjust data count placed in front of Previous button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="customerPageSize" style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Show:
              </label>
              <select
                id="customerPageSize"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '6px 10px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  background: 'white',
                  color: 'var(--text-title)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>per page</span>
            </div>

            {/* Previous and Next Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                type="button"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  padding: '6px 12px', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '6px', 
                  background: 'white', 
                  color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-title)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  opacity: currentPage === 1 ? 0.6 : 1,
                  transition: 'all 0.15s'
                }}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <button 
                type="button"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages || sortedCustomers.length === 0}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  padding: '6px 12px', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '6px', 
                  background: 'white', 
                  color: (currentPage === totalPages || sortedCustomers.length === 0) ? 'var(--text-muted)' : 'var(--text-title)',
                  cursor: (currentPage === totalPages || sortedCustomers.length === 0) ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  opacity: (currentPage === totalPages || sortedCustomers.length === 0) ? 0.6 : 1,
                  transition: 'all 0.15s'
                }}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCustomerId && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <AlertTriangle size={32} color="#EF4444" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: '0 0 12px 0' }}>Delete Customer</h2>
            <p style={{ color: '#64748B', margin: '0 0 24px 0', lineHeight: '1.5' }}>Are you sure you want to delete this customer? This action cannot be undone.</p>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <button type="button" onClick={() => setDeleteCustomerId(null)} style={{ flex: 1, padding: '14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                Cancel
              </button>
              <button type="button" onClick={confirmDelete} style={{ flex: 1, padding: '14px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 6px -1px rgba(239,68,68,0.2)' }} onMouseOver={(e) => e.currentTarget.style.background = '#DC2626'} onMouseOut={(e) => e.currentTarget.style.background = '#EF4444'}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default CustomerDirectory;