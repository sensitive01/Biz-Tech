import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowUp, 
  ArrowDown, 
  MapPin, 
  Plus, 
  Store, 
  Users, 
  Phone, 
  X, 
  Eye, 
  Pencil, 
  Trash2, 
  AlertTriangle, 
  Search, 
  ArrowUpDown, 
  Download, 
  Filter, 
  KeyRound, 
  EyeOff, 
  Lock, 
  Mail, 
  CheckCircle2, 
  ShieldCheck, 
  Building2,
  UserCheck
} from 'lucide-react';
import { exportToCSV } from '../utils/exportToCSV';
import TablePagination from '../components/TablePagination';

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [viewBranch, setViewBranch] = useState(null);
  const [deleteBranchId, setDeleteBranchId] = useState(null);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const tenantType = Number(localStorage.getItem('tenantType')) || 1;
  const [userBusinesses, setUserBusinesses] = useState([]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} style={{ opacity: 0.3, marginLeft: '4px' }} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} style={{ color: 'var(--primary-blue)', marginLeft: '4px' }} /> : <ArrowDown size={14} style={{ color: 'var(--primary-blue)', marginLeft: '4px' }} />;
  };
  const [filterDays, setFilterDays] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    manager: '',
    contactNumber: '',
    businessName: ''
  });

  // Branch Login Modal State
  const [loginModalBranch, setLoginModalBranch] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoginEnabled, setIsLoginEnabled] = useState(true);
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [credentialsError, setCredentialsError] = useState('');
  const [credentialsSuccess, setCredentialsSuccess] = useState('');

  const handleOpenLoginModal = (branch) => {
    setLoginModalBranch(branch);
    setLoginEmail(branch.email || '');
    setLoginPassword('');
    setShowLoginPassword(false);
    setIsLoginEnabled(branch.isLoginEnabled !== false);
    setCredentialsError('');
    setCredentialsSuccess('');
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setCredentialsError('Please enter a valid email address');
      return;
    }
    if (!loginModalBranch?.email && !loginPassword) {
      setCredentialsError('Please enter a password for the branch login (min 6 characters)');
      return;
    }
    if (loginPassword && loginPassword.length < 6) {
      setCredentialsError('Password must be at least 6 characters long');
      return;
    }

    setSavingCredentials(true);
    setCredentialsError('');
    setCredentialsSuccess('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/branches/${loginModalBranch._id}/credentials`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword || undefined,
          isLoginEnabled
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setCredentialsError(data.error || 'Failed to update credentials');
        setSavingCredentials(false);
        return;
      }

      setCredentialsSuccess('Branch login credentials saved successfully!');
      fetchBranches();
      setTimeout(() => {
        setLoginModalBranch(null);
        setSavingCredentials(false);
      }, 900);
    } catch (err) {
      setCredentialsError('Connection error. Please try again.');
      setSavingCredentials(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setFormData({ 
      name: '', 
      location: '', 
      manager: '', 
      contactNumber: '',
      businessName: userBusinesses.length > 0 ? userBusinesses[0].name : '' 
    });
    setShowModal(true);
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name || '',
      location: branch.location || '',
      manager: branch.manager || '',
      contactNumber: branch.contactNumber || '',
      businessName: branch.businessName || ''
    });
    setShowModal(true);
  };

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/branches`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBranches(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/businesses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUserBusinesses(data || []);
      }
    } catch (e) {
      console.error('Error fetching businesses:', e);
    }
  };

  useEffect(() => {
    fetchBranches();
    if (tenantType >= 4) {
      fetchBusinesses();
    }
  }, [tenantType]);

  const filteredBranches = branches
    .filter(i => {
      if (filterDays === 'all') return true;
      const itemDate = new Date(i.createdAt || i.date || new Date());
      const diffTime = Math.abs(new Date() - itemDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (filterDays === '7') return diffDays <= 7;
      if (filterDays === '30') return diffDays <= 30;
      if (filterDays === 'custom') {
        if (customStartDate && new Date(itemDate) < new Date(customStartDate)) return false;
        if (customEndDate && new Date(itemDate) > new Date(customEndDate)) return false;
        return true;
      }
      return true;
    })
    .filter(i => Object.values(i).some(val => String(val).toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // Handle missing values
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      // Check if it's a date or number to sort accordingly
      if (sortConfig.key === 'date' || sortConfig.key === 'createdAt' || sortConfig.key === 'expiryDate') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (!isNaN(Number(aVal)) && !isNaN(Number(bVal)) && aVal !== '' && bVal !== '') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterDays, customStartDate, customEndDate, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBranches = filteredBranches.slice(startIndex, startIndex + itemsPerPage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.contactNumber || formData.contactNumber.length !== 10) {
      alert('Contact number must be exactly 10 digits.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const url = editingBranch
        ? `${import.meta.env.VITE_API_URL}/api/branches/${editingBranch._id}`
        : `${import.meta.env.VITE_API_URL}/api/branches`;
      const method = editingBranch ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        setEditingBranch(null);
        setFormData({ name: '', location: '', manager: '', contactNumber: '', businessName: '' });
        fetchBranches();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || (editingBranch ? 'Failed to update branch' : 'Failed to add branch'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteBranchId) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/branches/${deleteBranchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setDeleteBranchId(null);
        fetchBranches();
      } else {
        alert('Failed to delete branch');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting the branch');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Store size={28} color="#2563EB" /> Branches Management
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
            Manage your store locations, assign managers, and track branch contact details.
          </p>
        </div>
        <button 
          onClick={handleOpenAdd} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}
        >
          <Plus size={18} /> Add New Branch
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Store size={24} /></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Branches</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{branches.length}</h3>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCheck size={24} /></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Assigned Managers</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{branches.filter(b => b.managerId || b.manager).length}</h3>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={24} /></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Linked Businesses</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{new Set(branches.map(b => b.businessId?._id || b.businessId).filter(Boolean)).size || (branches.length > 0 ? 1 : 0)}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ flex: '0 1 300px', minWidth: '250px', position: 'relative' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" placeholder="Search branches..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <select value={filterDays} onChange={(e) => setFilterDays(e.target.value)} style={{ padding: '10px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#475569', fontWeight: '500', fontSize: '14px', outline: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <option value="all">Filter: All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
          {filterDays === 'custom' && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', outline: 'none', fontSize: '13px', color: '#475569' }} />
              <span style={{ fontSize: '13px', color: '#64748B' }}>to</span>
              <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', outline: 'none', fontSize: '13px', color: '#475569' }} />
            </div>
          )}
          
          <button onClick={() => exportToCSV(filteredBranches, 'Branches')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#475569', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}><Download size={16} /> Export</button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '60px' }}>S.No</th>
                <th onClick={() => requestSort('name')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Branch Name {renderSortIcon('name')}</div>
                </th>
                {tenantType >= 4 && (
                  <th onClick={() => requestSort('businessName')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Business {renderSortIcon('businessName')}</div>
                  </th>
                )}
                <th onClick={() => requestSort('location')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Location {renderSortIcon('location')}</div>
                </th>
                <th onClick={() => requestSort('manager')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Manager {renderSortIcon('manager')}</div>
                </th>
                <th onClick={() => requestSort('contactNumber')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Contact {renderSortIcon('contactNumber')}</div>
                </th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Login Access</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={tenantType >= 4 ? "8" : "7"} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>Loading branches...</td>
                </tr>
              ) : filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={tenantType >= 4 ? "8" : "7"} style={{ padding: '64px 32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <Store size={32} color="#3B82F6" />
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>No branches found</h3>
                      <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
                        You haven't added any branches to your workspace yet. Click the button above to add your first branch location.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedBranches.map((branch, index) => (
                  <tr key={branch._id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '16px 24px', fontSize: '15px', color: '#475569', fontWeight: '500' }}>
                      {startIndex + index + 1}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Store size={20} color="#475569" />
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>{branch.name}</span>
                      </div>
                    </td>
                    {tenantType >= 4 && (
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '14px' }}>
                          <Building2 size={15} color="#94A3B8" />
                          <span>{branch.businessName || <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Default</span>}</span>
                        </div>
                      </td>
                    )}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '14px' }}>
                        <MapPin size={16} color="#94A3B8" /> {branch.location}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '14px' }}>
                        <Users size={16} color="#94A3B8" /> {branch.manager}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '14px' }}>
                        <Phone size={16} color="#94A3B8" /> {branch.contactNumber}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {branch.email ? (
                        <div 
                          onClick={() => handleOpenLoginModal(branch)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 12px',
                            borderRadius: '20px',
                            background: branch.isLoginEnabled !== false ? '#EFF6FF' : '#FEF2F2',
                            border: `1px solid ${branch.isLoginEnabled !== false ? '#BFDBFE' : '#FECACA'}`,
                            color: branch.isLoginEnabled !== false ? '#1E40AF' : '#991B1B',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          title="Click to manage login credentials"
                        >
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: branch.isLoginEnabled !== false ? '#10B981' : '#EF4444',
                            display: 'inline-block'
                          }}></span>
                          <KeyRound size={12} />
                          <span>{branch.email}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenLoginModal(branch)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 12px',
                            borderRadius: '6px',
                            background: '#F8FAFC',
                            border: '1px dashed #CBD5E1',
                            color: '#475569',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = '#2563EB';
                            e.currentTarget.style.color = '#2563EB';
                            e.currentTarget.style.background = '#EFF6FF';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = '#CBD5E1';
                            e.currentTarget.style.color = '#475569';
                            e.currentTarget.style.background = '#F8FAFC';
                          }}
                        >
                          <KeyRound size={15} />
                          <span>Setup Login</span>
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        {/* <button 
                          onClick={() => handleOpenLoginModal(branch)}
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: branch.email ? '#EFF6FF' : '#F1F5F9', color: branch.email ? '#2563EB' : '#64748B', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }}
                          title={branch.email ? "Manage Branch Login" : "Setup Branch Login"}
                          onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'} 
                          onMouseOut={(e) => e.currentTarget.style.background = branch.email ? '#EFF6FF' : '#F1F5F9'}
                        >
                          <KeyRound size={15} />
                        </button> */}
                        <button 
                          onClick={() => setViewBranch(branch)}
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#EFF6FF', color: '#3B82F6', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }}
                          title="View Branch"
                          onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'} 
                          onMouseOut={(e) => e.currentTarget.style.background = '#EFF6FF'}
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEdit(branch)}
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }}
                          title="Edit Branch"
                          onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'} 
                          onMouseOut={(e) => e.currentTarget.style.background = '#EFF6FF'}
                        >
                          <Pencil size={15} />
                        </button>
                        <button 
                          onClick={() => setDeleteBranchId(branch._id)}
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }}
                          title="Delete Branch"
                          onMouseOver={(e) => e.currentTarget.style.background = '#FEE2E2'} 
                          onMouseOut={(e) => e.currentTarget.style.background = '#FEF2F2'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalItems={filteredBranches.length}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          itemName="branches"
        />
      </div>

      {/* Add / Edit Branch Modal */}
      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', padding: '24px 28px', borderRadius: '18px', width: '100%', maxWidth: '560px', maxHeight: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <Store size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                    {editingBranch ? 'Edit Branch' : 'Add New Branch'}
                  </h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                    {editingBranch ? 'Update branch information' : 'Create a new branch location'}
                  </p>
                </div>
              </div>
              <button onClick={() => { setShowModal(false); setEditingBranch(null); }} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: tenantType >= 4 ? '1fr 1fr' : '1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>Branch Name *</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="Enter branch name"
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }}
                  />
                </div>

                {tenantType >= 4 && (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                      Associated Business
                    </label>
                    {userBusinesses.length > 0 ? (
                      <select
                        value={formData.businessName}
                        onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box', background: 'white' }}
                      >
                        <option value="">-- No Specific (All) --</option>
                        {userBusinesses.map((b, idx) => (
                          <option key={b._id || idx} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder="e.g. Acme Corp"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }}
                      />
                    )}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>Location / Address *</label>
                <input 
                  type="text" 
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})} 
                  placeholder="Enter complete address"
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>Branch Manager *</label>
                  <input 
                    type="text" 
                    value={formData.manager} 
                    onChange={e => setFormData({...formData, manager: e.target.value})} 
                    placeholder="Enter manager name"
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>Contact Number *</label>
                  <input  
                    type="tel" 
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={formData.contactNumber} 
                    onChange={e => {
                      const numericVal = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({...formData, contactNumber: numericVal});
                    }} 
                    placeholder="Enter 10-digit number"
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }}
                  />
                  {formData.contactNumber && formData.contactNumber.length > 0 && formData.contactNumber.length < 10 && (
                    <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                      Please enter a full 10-digit number
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #F1F5F9' }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingBranch(null); }} style={{ padding: '9px 18px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '9px 24px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }} onMouseOver={(e) => e.currentTarget.style.background = '#1D4ED8'} onMouseOut={(e) => e.currentTarget.style.background = '#2563EB'}>
                  {editingBranch ? 'Update Branch' : 'Save Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* View Branch Modal */}
      {viewBranch && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', padding: '24px 28px', borderRadius: '18px', width: '100%', maxWidth: '580px', maxHeight: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out', boxSizing: 'border-box' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <Store size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Branch Details</h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748B' }}>Overview and configuration</p>
                </div>
              </div>
              <button 
                onClick={() => setViewBranch(null)} 
                style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#E2E8F0'}
                onMouseOut={(e) => e.currentTarget.style.background = '#F1F5F9'}
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Content Grid */}
            <div style={{ overflowY: 'auto', paddingRight: '2px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', flex: 1 }}>
              {/* Branch Name */}
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Branch Name</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#0F172A', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{viewBranch.name}</p>
              </div>

              {/* Associated Business */}
              {tenantType >= 4 ? (
                <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Associated Business</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0, fontSize: '15px', color: '#0F172A', fontWeight: '600' }}>
                    <Building2 size={16} color="#2563EB" /> 
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{viewBranch.businessName || 'Default (All)'}</span>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Branch Type</p>
                  <p style={{ margin: 0, fontSize: '15px', color: '#0F172A', fontWeight: '600' }}>{viewBranch.type || 'Retail Store'}</p>
                </div>
              )}

              {/* Location (Full width 2 cols) */}
              <div style={{ gridColumn: '1 / span 2', padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location / Address</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: '500' }}>
                  <MapPin size={16} color="#64748B" style={{ flexShrink: 0 }} /> 
                  <span>{viewBranch.location || 'No address provided'}</span>
                </div>
              </div>

              {/* Branch Manager */}
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Branch Manager</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: '500' }}>
                  <Users size={16} color="#64748B" style={{ flexShrink: 0 }} /> 
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{viewBranch.manager || 'Not assigned'}</span>
                </div>
              </div>

              {/* Contact Number */}
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Number</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: '500' }}>
                  <Phone size={16} color="#64748B" style={{ flexShrink: 0 }} /> 
                  <span>{viewBranch.contactNumber || 'N/A'}</span>
                </div>
              </div>

              {/* Login Access (Full width 2 cols) */}
              <div style={{ gridColumn: '1 / span 2', padding: '12px 14px', background: viewBranch.email ? '#EFF6FF' : '#F8FAFC', borderRadius: '10px', border: viewBranch.email ? '1px solid #BFDBFE' : '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <p style={{ margin: '0 0 3px 0', fontSize: '11px', color: viewBranch.email ? '#1E40AF' : '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Branch Login Access
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: viewBranch.email ? '#1E293B' : '#64748B', fontWeight: viewBranch.email ? '600' : '500' }}>
                      <KeyRound size={15} color={viewBranch.email ? "#2563EB" : "#94A3B8"} />
                      <span>{viewBranch.email ? viewBranch.email : 'No branch login configured'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const target = viewBranch;
                      setViewBranch(null);
                      handleOpenLoginModal(target);
                    }}
                    style={{
                      background: viewBranch.email ? '#2563EB' : 'white',
                      border: viewBranch.email ? 'none' : '1px solid #CBD5E1',
                      color: viewBranch.email ? 'white' : '#475569',
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0
                    }}
                  >
                    <KeyRound size={13} />
                    <span>{viewBranch.email ? 'Manage Login' : 'Setup Login'}</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #F1F5F9', flexShrink: 0 }}>
              <button 
                type="button" 
                onClick={() => {
                  const target = viewBranch;
                  setViewBranch(null);
                  handleEdit(target);
                }}
                style={{ padding: '8px 16px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#334155', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
              >
                <Pencil size={14} /> Edit
              </button>
              <button 
                type="button" 
                onClick={() => setViewBranch(null)} 
                style={{ padding: '8px 22px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s' }} 
                onMouseOver={(e) => e.currentTarget.style.background = '#1D4ED8'} 
                onMouseOut={(e) => e.currentTarget.style.background = '#2563EB'}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Branch Login Setup / Manage Modal */}
      {loginModalBranch && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', padding: '24px 28px', borderRadius: '18px', width: '100%', maxWidth: '480px', maxHeight: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <KeyRound size={20} color="#2563EB" />
                </div>
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Branch Login Access</h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>Configure credentials for this branch</p>
                </div>
              </div>
              <button 
                onClick={() => setLoginModalBranch(null)} 
                style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Branch Summary Banner */}
            <div style={{ padding: '12px 16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{loginModalBranch.name}</div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Location: {loginModalBranch.location} &bull; Manager: {loginModalBranch.manager}
              </div>
            </div>

            {credentialsError && (
              <div style={{ color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                {credentialsError}
              </div>
            )}

            {credentialsSuccess && (
              <div style={{ color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} />
                <span>{credentialsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                  Branch Login Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="email" 
                    value={loginEmail} 
                    onChange={e => setLoginEmail(e.target.value)} 
                    placeholder="e.g. downtown.branch@biztech.com"
                    required
                    style={{ width: '100%', padding: '11px 14px 11px 40px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                  {loginModalBranch.email ? 'New Password (leave blank to keep current)' : 'Set Password'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type={showLoginPassword ? "text" : "password"} 
                    value={loginPassword} 
                    onChange={e => setLoginPassword(e.target.value)} 
                    placeholder={loginModalBranch.email ? "••••••••••••" : "Minimum 6 characters"}
                    required={!loginModalBranch.email}
                    style={{ width: '100%', padding: '11px 40px 11px 40px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }}
                  />
                  <div 
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#94A3B8' }}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                </div>
              </div>

              {loginModalBranch.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <input
                    type="checkbox"
                    id="enableBranchLogin"
                    checked={isLoginEnabled}
                    onChange={(e) => setIsLoginEnabled(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#2563EB', cursor: 'pointer' }}
                  />
                  <label htmlFor="enableBranchLogin" style={{ fontSize: '13px', fontWeight: '500', color: '#334155', cursor: 'pointer' }}>
                    Login Access Active
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setLoginModalBranch(null)} 
                  style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={savingCredentials}
                  style={{ flex: 1, padding: '12px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', opacity: savingCredentials ? 0.7 : 1 }}
                >
                  {savingCredentials ? 'Saving...' : 'Save Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deleteBranchId && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <AlertTriangle size={32} color="#EF4444" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: '0 0 12px 0' }}>Delete Branch</h2>
            <p style={{ color: '#64748B', margin: '0 0 24px 0', lineHeight: '1.5' }}>Are you sure you want to delete this branch? This action cannot be undone.</p>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <button type="button" onClick={() => setDeleteBranchId(null)} style={{ flex: 1, padding: '14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
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

export default Branches;
