import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Download, 
  ArrowUp, 
  ArrowDown, 
  ArrowUpDown, 
  Pencil, 
  Trash2, 
  Eye, 
  X, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  PieChart, 
  Building2, 
  Map, 
  Mail, 
  Phone, 
  DollarSign, 
  Calendar, 
  Lock, 
  EyeOff, 
  AlertCircle,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { exportToCSV } from '@/utils/exportToCSV';
import { formatDate } from '@/utils/formatDate';
import TablePagination from '@/components/TablePagination';

const Investors = () => {
  const [investors, setInvestors] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAllocation, setFilterAllocation] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState(null);
  const [viewingInvestor, setViewingInvestor] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [deleteInvestorId, setDeleteInvestorId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    investmentAmount: '',
    investmentDate: new Date().toISOString().split('T')[0],
    ownershipPercentage: '',
    associatedBusiness: 'All Businesses',
    associatedBranch: 'All Branches',
    status: 'Active',
    isLoginEnabled: true,
    notes: ''
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Identity & role
  const tenantType = Number(localStorage.getItem('tenantType')) || 1;
  const currentUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  })();
  const isInvestor = currentUser?.role === 'investor';
  const isOwner = !isInvestor && currentUser?.role !== 'employee' && currentUser?.role !== 'branch';

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterAllocation, itemsPerPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const fetchList = [fetch(`${import.meta.env.VITE_API_URL}/api/investors`, { headers })];
      if (tenantType === 4) {
        fetchList.push(fetch(`${import.meta.env.VITE_API_URL}/api/businesses`, { headers }));
      }
      if (tenantType === 3 || tenantType === 4) {
        fetchList.push(fetch(`${import.meta.env.VITE_API_URL}/api/branches`, { headers }));
      }

      const responses = await Promise.all(fetchList);
      const invRes = responses[0];
      if (invRes.ok) {
        const invData = await invRes.json();
        setInvestors(Array.isArray(invData) ? invData : []);
      }

      if (tenantType === 4 && responses[1]?.ok) {
        const bizData = await responses[1].json();
        setBusinesses(Array.isArray(bizData) ? bizData : []);
      }

      const branchRes = tenantType === 4 ? responses[2] : responses[1];
      if (branchRes?.ok) {
        const branchData = await branchRes.json();
        setBranches(Array.isArray(branchData) ? branchData : []);
      }
    } catch (err) {
      console.error('Error fetching investors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantType]);

  const handleOpenAdd = () => {
    setEditingInvestor(null);
    setErrorMsg('');
    setShowPassword(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      investmentAmount: '',
      investmentDate: new Date().toISOString().split('T')[0],
      ownershipPercentage: '',
      associatedBusiness: 'All Businesses',
      associatedBranch: 'All Branches',
      status: 'Active',
      isLoginEnabled: true,
      notes: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (inv) => {
    setEditingInvestor(inv);
    setErrorMsg('');
    setShowPassword(false);
    setFormData({
      name: inv.name || '',
      email: inv.email || '',
      password: '', // Blank unless resetting
      phone: inv.phone || '',
      investmentAmount: inv.investmentAmount || '',
      investmentDate: inv.investmentDate ? new Date(inv.investmentDate).toISOString().split('T')[0] : '',
      ownershipPercentage: inv.ownershipPercentage || '',
      associatedBusiness: inv.associatedBusiness || 'All Businesses',
      associatedBranch: inv.associatedBranch || 'All Branches',
      status: inv.status || 'Active',
      isLoginEnabled: inv.isLoginEnabled !== undefined ? inv.isLoginEnabled : true,
      notes: inv.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingInvestor 
        ? `${import.meta.env.VITE_API_URL}/api/investors/${editingInvestor._id}`
        : `${import.meta.env.VITE_API_URL}/api/investors`;
      const method = editingInvestor ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        setEditingInvestor(null);
        fetchData();
      } else {
        setErrorMsg(data.error || 'Failed to save investor profile');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteInvestorId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/investors/${deleteInvestorId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteInvestorId(null);
        setDeleteError('');
        fetchData();
      } else {
        const data = await res.json();
        setDeleteError(data.error || 'Failed to delete investor');
      }
    } catch (err) {
      console.error(err);
      setDeleteError('Network error while deleting investor');
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} style={{ opacity: 0.3, marginLeft: '4px' }} />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} style={{ color: 'var(--primary-blue)', marginLeft: '4px' }} /> 
      : <ArrowDown size={14} style={{ color: 'var(--primary-blue)', marginLeft: '4px' }} />;
  };

  // Calculations for stats
  const totalCapital = investors.reduce((sum, inv) => sum + (Number(inv.investmentAmount) || 0), 0);
  const totalEquity = investors.reduce((sum, inv) => sum + (Number(inv.ownershipPercentage) || 0), 0);
  const activeCount = investors.filter(inv => inv.status === 'Active').length;
  const loginEnabledCount = investors.filter(inv => inv.isLoginEnabled && inv.status === 'Active').length;

  // Filtered & Sorted Investors
  const filteredInvestors = investors
    .filter(inv => {
      if (filterStatus !== 'all' && inv.status !== filterStatus) return false;
      if (filterAllocation !== 'all') {
        const alloc = tenantType === 4 ? inv.associatedBusiness : inv.associatedBranch;
        if (alloc !== filterAllocation) return false;
      }
      const s = search.toLowerCase();
      const name = (inv.name || '').toLowerCase();
      const email = (inv.email || '').toLowerCase();
      const phone = (inv.phone || '').toLowerCase();
      const code = (inv.investorId || '').toLowerCase();
      return name.includes(s) || email.includes(s) || phone.includes(s) || code.includes(s);
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      if (sortConfig.key === 'investmentAmount' || sortConfig.key === 'ownershipPercentage') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else if (sortConfig.key === 'investmentDate') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else {
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvestors = filteredInvestors.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(val) || 0);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isInvestor ? 'Investor Portfolio & Stakeholder Overview' : 'Investor Management'}
                <span style={{ fontSize: '12px', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>
                  {tenantType === 4 ? 'Type 4 Conglomerate' : 'Type 3 Enterprise'}
                </span>
              </h1>
              <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                {isInvestor 
                  ? 'Transparent read-only financial performance, capital investments, and organizational oversight.'
                  : 'Register equity stakeholders and grant secure view-only portal logins (Owner Administration).'}
              </p>
            </div>
          </div>
        </div>

        {/* Add Investor Button (Owner Only) */}
        {isOwner && (
          <button 
            onClick={handleOpenAdd} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '12px 22px', 
              background: '#2563EB', 
              border: 'none', 
              borderRadius: '10px', 
              color: 'white', 
              fontWeight: '600', 
              fontSize: '14px', 
              cursor: 'pointer', 
              boxShadow: '0 4px 10px rgba(37,99,235,0.25)',
              transition: 'transform 0.15s'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Plus size={18} /> Add Investor
          </button>
        )}
      </div>

      {/* Notice Banner for Investors */}
      {isInvestor && (
        <div style={{
          background: 'linear-gradient(90deg, #EFF6FF 0%, #F5F3FF 100%)',
          border: '1px solid #BFDBFE',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#DBEAFE', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#1E3A8A' }}>
                Investor Read-Only Mode Active
              </div>
              <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                Logged in as <strong>{currentUser?.fullName}</strong> ({currentUser?.email}). You have transparent view access to authorized business reports and performance metrics.
              </div>
            </div>
          </div>
          <span style={{ background: '#1E40AF', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            View-Only Access
          </span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
        
        {/* Total Capital */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
              {isInvestor ? 'My Capital Investment' : 'Total Capital Invested'}
            </p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>
              {isInvestor 
                ? formatCurrency(currentUser?.investmentAmount || (investors[0]?.investmentAmount || 0))
                : formatCurrency(totalCapital)}
            </h3>
          </div>
        </div>

        {/* Equity Share */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <PieChart size={24} />
          </div>
          <div>
            <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
              {isInvestor ? 'My Equity Stake' : 'Total Equity Allocated'}
            </p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>
              {isInvestor 
                ? `${currentUser?.ownershipPercentage || (investors[0]?.ownershipPercentage || 0)}%`
                : `${totalEquity.toFixed(1)}%`}
            </h3>
          </div>
        </div>

        {/* Active Investors Count */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Briefcase size={24} />
          </div>
          <div>
            <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
              {isInvestor ? 'Stakeholder Status' : 'Active Investors'}
            </p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>
              {isInvestor ? 'Active Partner' : activeCount}
            </h3>
          </div>
        </div>

        {/* Portal Logins */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <KeyRound size={24} />
          </div>
          <div>
            <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
              {isInvestor ? 'Portal Privileges' : 'Logins Enabled'}
            </p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>
              {isInvestor ? 'View-Only' : loginEnabledCount}
            </h3>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Left: Search Input */}
        <div style={{ width: '280px', position: 'relative' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search investors..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} 
          />
        </div>

        {/* Right End: Status & Branch Filters + Export */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Status Filter */}
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)} 
            style={{ padding: '10px 14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#334155', fontWeight: '500', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="all">Status: All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Business / Branch Filter */}
          {tenantType === 4 && (
            <select 
              value={filterAllocation} 
              onChange={(e) => setFilterAllocation(e.target.value)} 
              style={{ padding: '10px 14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#334155', fontWeight: '500', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">Allocation: All Businesses</option>
              {businesses.map(b => (
                <option key={b._id} value={b.name}>{b.name}</option>
              ))}
            </select>
          )}

          {tenantType === 3 && (
            <select 
              value={filterAllocation} 
              onChange={(e) => setFilterAllocation(e.target.value)} 
              style={{ padding: '10px 14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#334155', fontWeight: '500', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">Allocation: All Branches</option>
              {branches.map(br => (
                <option key={br._id} value={br.name}>{br.name}</option>
              ))}
            </select>
          )}

          {/* CSV Export Button */}
          <button 
            type="button"
            onClick={() => setShowExportModal(true)} 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'}
            onMouseOut={e => e.currentTarget.style.background = 'white'}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Main Investors Table */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '50px' }}>S.No</th>
                <th onClick={() => requestSort('name')} style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Investor {renderSortIcon('name')}</div>
                </th>
                <th onClick={() => requestSort('investmentAmount')} style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Investment (₹) {renderSortIcon('investmentAmount')}</div>
                </th>
                <th onClick={() => requestSort('ownershipPercentage')} style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Equity Share {renderSortIcon('ownershipPercentage')}</div>
                </th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                  Allocation Scope
                </th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                  Portal Login
                </th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>Loading investors...</td></tr>
              ) : filteredInvestors.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px 20px', color: '#94A3B8' }}>
                    <Briefcase size={40} style={{ opacity: 0.3, marginBottom: '10px', display: 'inline-block' }} />
                    <h4 style={{ margin: '0 0 6px 0', color: '#334155', fontSize: '16px', fontWeight: '700' }}>No Investors Found</h4>
                    <p style={{ margin: 0, fontSize: '13.5px' }}>Register capital partners and shareholders to share executive performance reports.</p>
                  </td>
                </tr>
              ) : paginatedInvestors.map((inv, index) => {
                const allocationText = tenantType === 4 
                  ? (inv.associatedBusiness || 'All Businesses')
                  : (inv.associatedBranch || 'All Branches');

                return (
                  <tr key={inv._id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
                      {startIndex + index + 1}
                    </td>

                    {/* Investor Info */}
                    <td style={{ padding: '16px 20px', color: '#0F172A' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px' }}>{inv.name}</span>
                        <span style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '11px', fontWeight: '700', padding: '1px 6px', borderRadius: '4px', border: '1px solid #BFDBFE' }}>
                          {inv.investorId || 'INV'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                        <Mail size={12} color="#94A3B8" /> {inv.email}
                        {inv.phone && (
                          <>
                            <span>•</span>
                            <Phone size={12} color="#94A3B8" /> {inv.phone}
                          </>
                        )}
                      </div>
                    </td>

                    {/* Capital Investment */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                        {formatCurrency(inv.investmentAmount)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                        Joined: {formatDate(inv.investmentDate)}
                      </div>
                    </td>

                    {/* Equity Share */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '800', fontSize: '14px', color: '#7C3AED' }}>
                          {inv.ownershipPercentage || 0}%
                        </span>
                        <div style={{ width: '60px', height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, (inv.ownershipPercentage || 0))}%`, height: '100%', background: '#7C3AED' }} />
                        </div>
                      </div>
                    </td>

                    {/* Allocation */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ background: '#F8FAFC', color: '#334155', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        {tenantType === 4 ? <Building2 size={12} /> : <Map size={12} />}
                        {allocationText}
                      </span>
                    </td>

                    {/* Portal Login Status */}
                    <td style={{ padding: '16px 20px' }}>
                      {inv.isLoginEnabled && inv.status === 'Active' ? (
                        <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> View-Only Access
                        </span>
                      ) : (
                        <span style={{ background: '#FEE2E2', color: '#991B1B', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <XCircle size={12} /> Login Disabled
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', alignItems: 'center' }}>
                        
                        {/* View Button */}
                        <button 
                          title="View Details" 
                          onClick={() => setViewingInvestor(inv)} 
                          style={{ background: '#F1F5F9', border: 'none', color: '#475569', cursor: 'pointer', padding: '7px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Eye size={15} />
                        </button>

                        {/* Edit Button (Owner Only) */}
                        {isOwner && (
                          <button 
                            title="Edit Investor" 
                            onClick={() => handleOpenEdit(inv)} 
                            style={{ background: '#EFF6FF', border: 'none', color: '#2563EB', cursor: 'pointer', padding: '7px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Pencil size={15} />
                          </button>
                        )}

                        {/* Delete Button (Owner Only) */}
                        {isOwner && (
                          <button 
                            title="Remove Investor" 
                            onClick={() => { setDeleteError(''); setDeleteInvestorId(inv._id); }} 
                            style={{ background: '#FEE2E2', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '7px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalItems={filteredInvestors.length}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          itemName="investors"
        />
      </div>

      {/* MODAL 1: ADD / EDIT INVESTOR (OWNER ONLY) */}
      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '20px', width: '100%', maxWidth: '540px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)', maxHeight: '92vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
                  {editingInvestor ? 'Edit Investor Profile' : 'Register New Investor'}
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Enables equity stake records and creates a dedicated view-only login.
                </p>
              </div>
              <button 
                onClick={() => { setShowModal(false); setEditingInvestor(null); }} 
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Full Name & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Investor Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Alex Morgan"
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Contact Phone</label>
                  <input 
                    type="text" 
                    placeholder="+91 98765 43210"
                    value={formData.phone} 
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} 
                  />
                </div>
              </div>

              {/* Email & Password (Login Credentials) */}
              <div style={{ padding: '12px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#1E40AF', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <KeyRound size={14} /> Portal Login Credentials (View-Only)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Login Email *</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="investor@domain.com"
                      value={formData.email} 
                      onChange={e => setFormData({ ...formData, email: e.target.value })} 
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                      {editingInvestor ? 'Reset Password (optional)' : 'Login Password *'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        required={!editingInvestor}
                        placeholder={editingInvestor ? 'Leave blank to keep' : 'Minimum 6 chars'}
                        value={formData.password} 
                        onChange={e => setFormData({ ...formData, password: e.target.value })} 
                        style={{ width: '100%', padding: '9px 36px 9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="enableLoginCheck"
                    checked={formData.isLoginEnabled} 
                    onChange={e => setFormData({ ...formData, isLoginEnabled: e.target.checked })} 
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="enableLoginCheck" style={{ fontSize: '12px', color: '#475569', cursor: 'pointer', fontWeight: '500' }}>
                    Allow investor to log in with view-only oversight rights
                  </label>
                </div>
              </div>

              {/* Capital & Equity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Investment Amount (₹) *</label>
                  <input 
                    type="number" 
                    min="0"
                    step="any"
                    required
                    placeholder="e.g. 500000"
                    value={formData.investmentAmount} 
                    onChange={e => setFormData({ ...formData, investmentAmount: e.target.value })} 
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Equity / Ownership (%) *</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    step="0.01"
                    required
                    placeholder="e.g. 10"
                    value={formData.ownershipPercentage} 
                    onChange={e => setFormData({ ...formData, ownershipPercentage: e.target.value })} 
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} 
                  />
                </div>
              </div>

              {/* Investment Date & Allocation Scope */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Investment Date</label>
                  <input 
                    type="date" 
                    value={formData.investmentDate} 
                    onChange={e => setFormData({ ...formData, investmentDate: e.target.value })} 
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    {tenantType === 4 ? 'Business Allocation' : 'Branch Allocation'}
                  </label>
                  {tenantType === 4 ? (
                    <select 
                      value={formData.associatedBusiness} 
                      onChange={e => setFormData({ ...formData, associatedBusiness: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                    >
                      <option value="All Businesses">All Businesses (Conglomerate)</option>
                      {businesses.map(b => (
                        <option key={b._id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  ) : (
                    <select 
                      value={formData.associatedBranch} 
                      onChange={e => setFormData({ ...formData, associatedBranch: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                    >
                      <option value="All Branches">All Branches (Enterprise)</option>
                      {branches.map(br => (
                        <option key={br._id} value={br.name}>{br.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Status - Displayed only in Edit section */}
              {editingInvestor && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Account Status</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({ ...formData, status: e.target.value })} 
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Investment Terms / Notes</label>
                <textarea 
                  rows="2"
                  placeholder="e.g. Seed round investor, quarterly report rights..."
                  value={formData.notes} 
                  onChange={e => setFormData({ ...formData, notes: e.target.value })} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              {/* Submit */}
              <button 
                type="submit" 
                disabled={saving}
                style={{ 
                  width: '100%', 
                  padding: '13px', 
                  background: '#2563EB', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '10px', 
                  fontWeight: '700', 
                  fontSize: '14px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  marginTop: '8px',
                  boxShadow: '0 4px 10px rgba(37,99,235,0.2)'
                }}
              >
                {saving ? 'Saving...' : editingInvestor ? 'Update Investor Profile' : 'Save & Grant Login Access'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: VIEW INVESTOR DETAILS */}
      {viewingInvestor && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '20px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>{viewingInvestor.name}</h3>
                  <span style={{ fontSize: '12px', color: '#2563EB', fontWeight: '700' }}>{viewingInvestor.investorId}</span>
                </div>
              </div>
              <button 
                onClick={() => setViewingInvestor(null)} 
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px' }}>
                <span style={{ color: '#64748B' }}>Contact Email:</span>
                <span style={{ fontWeight: '600', color: '#0F172A' }}>{viewingInvestor.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px' }}>
                <span style={{ color: '#64748B' }}>Phone:</span>
                <span style={{ fontWeight: '600', color: '#0F172A' }}>{viewingInvestor.phone || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px' }}>
                <span style={{ color: '#64748B' }}>Capital Investment:</span>
                <span style={{ fontWeight: '800', color: '#16A34A', fontSize: '14px' }}>{formatCurrency(viewingInvestor.investmentAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px' }}>
                <span style={{ color: '#64748B' }}>Equity Stake:</span>
                <span style={{ fontWeight: '800', color: '#7C3AED', fontSize: '14px' }}>{viewingInvestor.ownershipPercentage || 0}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px' }}>
                <span style={{ color: '#64748B' }}>Investment Date:</span>
                <span style={{ fontWeight: '600', color: '#0F172A' }}>{formatDate(viewingInvestor.investmentDate)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px' }}>
                <span style={{ color: '#64748B' }}>Allocation Scope:</span>
                <span style={{ fontWeight: '600', color: '#0F172A' }}>
                  {tenantType === 4 ? (viewingInvestor.associatedBusiness || 'All Businesses') : (viewingInvestor.associatedBranch || 'All Branches')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px' }}>
                <span style={{ color: '#64748B' }}>Portal Access:</span>
                <span style={{ fontWeight: '700', color: viewingInvestor.isLoginEnabled ? '#16A34A' : '#EF4444' }}>
                  {viewingInvestor.isLoginEnabled ? 'Active (View-Only)' : 'Disabled'}
                </span>
              </div>
              {viewingInvestor.notes && (
                <div style={{ padding: '10px 12px', background: '#FFFBEB', borderRadius: '8px', border: '1px solid #FEF3C7' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#92400E', textTransform: 'uppercase', marginBottom: '2px' }}>Agreement Notes</div>
                  <div style={{ color: '#78350F' }}>{viewingInvestor.notes}</div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setViewingInvestor(null)} 
              style={{ width: '100%', marginTop: '18px', padding: '11px', background: '#F1F5F9', border: 'none', borderRadius: '10px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: EXPORT DATA MODAL POPUP */}
      {showExportModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '20px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', textAlign: 'center', animation: 'fadeIn 0.2s ease-out' }}>
            
            {filteredInvestors.length === 0 ? (
              <>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <AlertCircle size={30} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0' }}>
                  No Records to Export
                </h2>
                <p style={{ color: '#64748B', fontSize: '14px', lineHeight: '1.5', margin: '0 0 18px 0' }}>
                  There are currently no investor records matching your active filters. Add investors or adjust your search criteria before exporting.
                </p>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 16px', marginBottom: '22px', fontSize: '13px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Search Query:</span>
                    <span style={{ fontWeight: '600', color: '#0F172A' }}>{search ? `"${search}"` : 'None'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Status Filter:</span>
                    <span style={{ fontWeight: '600', color: '#0F172A' }}>{filterStatus}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Allocation:</span>
                    <span style={{ fontWeight: '600', color: '#0F172A' }}>{filterAllocation}</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowExportModal(false)}
                  style={{ width: '100%', padding: '12px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = '#1D4ED8'}
                  onMouseOut={e => e.currentTarget.style.background = '#2563EB'}
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <Download size={30} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0' }}>
                  Export Investor Records
                </h2>
                <p style={{ color: '#64748B', fontSize: '14px', margin: '0 0 18px 0', lineHeight: '1.5' }}>
                  Export filtered stakeholder records, equity contributions, and contact details as a CSV spreadsheet.
                </p>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px 16px', marginBottom: '22px', fontSize: '13px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Stakeholders:</span>
                    <span style={{ fontWeight: '700', color: '#0F172A' }}>{filteredInvestors.length} records</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Total Capital:</span>
                    <span style={{ fontWeight: '700', color: '#16A34A' }}>{formatCurrency(totalCapital)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>File Name:</span>
                    <span style={{ fontWeight: '600', color: '#2563EB' }}>Investor_Stakeholders.csv</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Format:</span>
                    <span style={{ fontWeight: '600', color: '#0F172A' }}>CSV (Excel Compatible)</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowExportModal(false)}
                    style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      exportToCSV(filteredInvestors.map(inv => ({
                        'Investor ID': inv.investorId,
                        'Name': inv.name,
                        'Email': inv.email,
                        'Phone': inv.phone || 'N/A',
                        'Capital Invested (INR)': inv.investmentAmount,
                        'Equity Stake (%)': `${inv.ownershipPercentage}%`,
                        'Investment Date': formatDate(inv.investmentDate),
                        'Allocation': tenantType === 4 ? inv.associatedBusiness : inv.associatedBranch,
                        'Login Access': inv.isLoginEnabled ? 'Enabled' : 'Disabled',
                        'Status': inv.status,
                        'Notes': inv.notes || ''
                      })), 'Investor_Stakeholders');
                      setShowExportModal(false);
                    }}
                    style={{ flex: 1.4, padding: '12px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 10px rgba(37,99,235,0.25)' }}
                  >
                    <Download size={16} /> Confirm & Download
                  </button>
                </div>
              </>
            )}

          </div>
        </div>,
        document.body
      )}

      {/* MODAL 4: DELETE INVESTOR CONFIRMATION MODAL */}
      {deleteInvestorId && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', textAlign: 'center', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <AlertTriangle size={30} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0' }}>
              Remove Investor Profile
            </h2>
            <p style={{ color: '#64748B', fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              Are you sure you want to remove this investor profile? Portal login access will also be revoked.
            </p>

            {deleteError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', textAlign: 'left' }}>
                {deleteError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                onClick={() => { setDeleteInvestorId(null); setDeleteError(''); }}
                style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmDelete}
                style={{ flex: 1, padding: '12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(239,68,68,0.25)' }}
              >
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

export default Investors;

