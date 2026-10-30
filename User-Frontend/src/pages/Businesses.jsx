import { exportToCSV } from '../utils/exportToCSV';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowUp, ArrowDown, Building2, Plus, Phone, X, Eye, Pencil, Trash2, 
  AlertTriangle, Search, Filter, ArrowUpDown, Download, FileText, ShieldCheck,
  KeyRound, Mail, Lock, EyeOff, CheckCircle2, User, Tag, MapPin, Briefcase,
  Package, Wrench, Boxes, TrendingUp, ShoppingCart, Repeat
} from 'lucide-react';
import TablePagination from '../components/TablePagination';

const BUSINESS_CATEGORIES = [
  'Retail Store',
  'Supermarket & Grocery',
  'Wholesale & Distribution',
  'Pharmacy & Healthcare',
  'Restaurant & Cafe',
  'Electronics & Hardware',
  'Fashion & Apparel',
  'Automobile & Spare Parts',
  'Manufacturing & Factory',
  'IT & Tech Services',
  'Professional Services',
  'Logistics & Transport',
  'Other'
];

const Businesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [viewBusiness, setViewBusiness] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Business Login Credentials State
  const [loginModalBusiness, setLoginModalBusiness] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoginEnabled, setIsLoginEnabled] = useState(true);
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [credentialsError, setCredentialsError] = useState('');
  const [credentialsSuccess, setCredentialsSuccess] = useState('');

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
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    category: '', 
    contactPerson: '', 
    phone: '', 
    email: '', 
    taxNumber: '', 
    city: '', 
    address: '',
    offeringType: 'both',
    operationsType: 'both'
  });

  const handleOpenAdd = () => {
    setEditingBusiness(null);
    setIsCustomCategory(false);
    setFormData({ 
      name: '', 
      category: '', 
      contactPerson: '', 
      phone: '', 
      email: '', 
      taxNumber: '', 
      city: '', 
      address: '',
      offeringType: 'both',
      operationsType: 'both'
    });
    setShowModal(true);
  };

  const handleEdit = (b) => {
    setEditingBusiness(b);
    const standardCategories = BUSINESS_CATEGORIES.filter(c => c !== 'Other');
    const isOther = b.category && !standardCategories.includes(b.category);
    setIsCustomCategory(Boolean(isOther));
    setFormData({
      name: b.name || '',
      category: b.category || '',
      contactPerson: b.contactPerson || '',
      phone: b.phone || '',
      email: b.email || '',
      taxNumber: b.taxNumber || '',
      city: b.city || '',
      address: b.address || '',
      offeringType: b.offeringType || 'both',
      operationsType: b.operationsType || 'both'
    });
    setShowModal(true);
  };

  const handleOpenLoginModal = (business) => {
    setLoginModalBusiness(business);
    setLoginEmail(business.email || '');
    setLoginPassword('');
    setShowLoginPassword(false);
    setIsLoginEnabled(business.isLoginEnabled !== false);
    setCredentialsError('');
    setCredentialsSuccess('');
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setCredentialsError('Please enter a valid business email address');
      return;
    }
    if (!loginModalBusiness?.email && !loginPassword) {
      setCredentialsError('Please enter a password for this business login (min 6 characters)');
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/businesses/${loginModalBusiness._id}/credentials`, {
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
        setCredentialsError(data.error || data.message || 'Failed to update credentials');
        setSavingCredentials(false);
        return;
      }

      setCredentialsSuccess('Business login credentials saved successfully!');
      fetchBusinesses();
      setTimeout(() => {
        setLoginModalBusiness(null);
        setSavingCredentials(false);
      }, 900);
    } catch (err) {
      setCredentialsError('Connection error. Please try again.');
      setSavingCredentials(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/businesses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a business name.');
      return;
    }
    if (!formData.phone || formData.phone.length !== 10) {
      alert('Contact phone must be exactly 10 digits.');
      return;
    }
    if (isCustomCategory && !formData.category.trim()) {
      alert('Please specify the category name.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const url = editingBusiness
        ? `${import.meta.env.VITE_API_URL}/api/businesses/${editingBusiness._id}`
        : `${import.meta.env.VITE_API_URL}/api/businesses`;
      const method = editingBusiness ? 'PUT' : 'POST';

      const payload = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        contactPerson: formData.contactPerson.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        taxNumber: formData.taxNumber.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        offeringType: formData.offeringType || 'both',
        operationsType: formData.operationsType || 'both'
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        setEditingBusiness(null);
        setIsCustomCategory(false);
        setFormData({ 
          name: '', 
          category: '', 
          contactPerson: '', 
          phone: '', 
          email: '', 
          taxNumber: '', 
          city: '', 
          address: '',
          offeringType: 'both',
          operationsType: 'both'
        });
        fetchBusinesses();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || (editingBusiness ? 'Failed to update business' : 'Failed to add business'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/businesses/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteId(null);
        fetchBusinesses();
      } else {
        alert('Failed to delete business');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBusinesses = businesses
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
    .filter(b => {
      const q = search.toLowerCase();
      return (
        (b.name && b.name.toLowerCase().includes(q)) ||
        (b.category && b.category.toLowerCase().includes(q)) ||
        (b.contactPerson && b.contactPerson.toLowerCase().includes(q)) ||
        (b.city && b.city.toLowerCase().includes(q)) ||
        (b.taxNumber && b.taxNumber.toLowerCase().includes(q)) ||
        (b.email && b.email.toLowerCase().includes(q)) ||
        (b.phone && b.phone.includes(q))
      );
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

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

  const handleExport = () => {
    const exportData = filteredBusinesses.map((b, idx) => ({
      'S.No': idx + 1,
      'Business Name': b.name || '',
      'Category': b.category || 'General',
      'Contact Person': b.contactPerson || '-',
      'Phone': b.phone || '-',
      'Email': b.email || '-',
      'GSTIN / Tax ID': b.taxNumber || '-',
      'City': b.city || '-',
      'Address': b.address || '-',
      'Login Access': b.email ? (b.isLoginEnabled !== false ? 'Active' : 'Disabled') : 'Not Configured',
      'Created At': b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ''
    }));
    exportToCSV(exportData, 'Businesses');
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBusinesses = filteredBusinesses.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div style={{ padding: '24px', width: '100%', boxSizing: 'border-box', animation: 'fadeIn 0.3s ease-out' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Building2 size={28} color="var(--primary-blue)" /> Businesses Management
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
            Manage conglomerate businesses, branches, categories, key contacts, and dedicated access.
          </p>
        </div>
        <button 
          onClick={handleOpenAdd} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'var(--primary-blue)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}
        >
          <Plus size={18} /> Add New Business
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={24} /></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Businesses</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{businesses.length}</h3>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><KeyRound size={24} /></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Login Enabled</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{businesses.filter(b => b.email && b.isLoginEnabled !== false).length}</h3>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={24} /></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Active Categories</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{new Set(businesses.map(b => b.category).filter(Boolean)).size || (businesses.length > 0 ? 1 : 0)}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ flex: '0 1 340px', minWidth: '260px', position: 'relative' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by name, category, contact, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
          />
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
          
          <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#475569', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}><Download size={16} /> Export</button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '980px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '14px 10px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '56px', textAlign: 'center', verticalAlign: 'middle' }}>
                  S.No
                </th>
                <th onClick={() => requestSort('name')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '180px', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Business Name {renderSortIcon('name')}</div>
                </th>
                <th onClick={() => requestSort('category')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 12px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '115px', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Category {renderSortIcon('category')}</div>
                </th>
                <th style={{ padding: '14px 12px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '145px', verticalAlign: 'middle' }}>
                  Model & Operations
                </th>
                <th onClick={() => requestSort('contactPerson')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 12px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '135px', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Contact Person {renderSortIcon('contactPerson')}</div>
                </th>
                <th onClick={() => requestSort('phone')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 12px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '150px', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Contact Info {renderSortIcon('phone')}</div>
                </th>
                <th onClick={() => requestSort('city')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 12px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '135px', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Location & Tax {renderSortIcon('city')}</div>
                </th>
                <th style={{ padding: '14px 12px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '155px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                  Login Access
                </th>
                <th style={{ padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '115px', textAlign: 'center', verticalAlign: 'middle' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>Loading businesses...</td>
                </tr>
              ) : filteredBusinesses.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '64px 32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <Building2 size={32} color="#3B82F6" />
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>No businesses found</h3>
                      <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
                        You haven't added any businesses yet. Click the button above to add one.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedBusinesses.map((b, index) => (
                  <tr key={b._id || index} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '14px 10px', fontSize: '13px', color: '#64748B', fontWeight: '600', textAlign: 'center', verticalAlign: 'middle' }}>
                      {startIndex + index + 1}
                    </td>
                    <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0, border: '1px solid #DBEAFE' }}>
                          <Building2 size={18} />
                        </div>
                        <div>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', display: 'block', lineHeight: '1.3' }}>{b.name}</span>
                          <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace', fontWeight: '500' }}>
                            ID: BZ-{b.name ? b.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() : '0000'}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td style={{ padding: '14px 12px', verticalAlign: 'middle' }}>
                      {b.category ? (
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '5px', 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          padding: '3px 8px', 
                          borderRadius: '8px', 
                          background: '#F1F5F9', 
                          color: '#334155',
                          border: '1px solid #E2E8F0'
                        }}>
                          <Tag size={11} color="#64748B" />
                          {b.category}
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '13px' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 12px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px', 
                          fontSize: '11px', 
                          fontWeight: '600', 
                          padding: '2px 8px', 
                          borderRadius: '6px', 
                          background: b.offeringType === 'service' ? '#F3E8FF' : b.offeringType === 'product' ? '#EFF6FF' : '#F0FDF4', 
                          color: b.offeringType === 'service' ? '#7E22CE' : b.offeringType === 'product' ? '#1D4ED8' : '#15803D',
                          width: 'fit-content',
                          border: `1px solid ${b.offeringType === 'service' ? '#E9D5FF' : b.offeringType === 'product' ? '#BFDBFE' : '#BBF7D0'}`
                        }}>
                          {b.offeringType === 'service' ? '🛠️ Services' : b.offeringType === 'product' ? '📦 Products' : '🔄 Product & Service'}
                        </span>
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px', 
                          fontSize: '11px', 
                          fontWeight: '600', 
                          padding: '2px 8px', 
                          borderRadius: '6px', 
                          background: b.operationsType === 'sales' ? '#EFF6FF' : b.operationsType === 'purchases' ? '#FEF3C7' : '#F8FAFC', 
                          color: b.operationsType === 'sales' ? '#1D4ED8' : b.operationsType === 'purchases' ? '#B45309' : '#475569',
                          width: 'fit-content',
                          border: `1px solid ${b.operationsType === 'sales' ? '#BFDBFE' : b.operationsType === 'purchases' ? '#FDE68A' : '#E2E8F0'}`
                        }}>
                          {b.operationsType === 'sales' ? '📈 Sales Only' : b.operationsType === 'purchases' ? '🛒 Purchases' : '🔁 Sales & Purchases'}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 12px', verticalAlign: 'middle' }}>
                      {b.contactPerson ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', fontSize: '13px', fontWeight: '500' }}>
                          <User size={14} color="#64748B" />
                          <span>{b.contactPerson}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '13px' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 12px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {b.phone ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F172A', fontSize: '13px', fontWeight: '600' }}>
                            <Phone size={13} color="#64748B" /> <span>{b.phone}</span>
                          </div>
                        ) : <span style={{ color: '#94A3B8', fontSize: '13px' }}>—</span>}
                        {b.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748B', fontSize: '12px' }}>
                            <Mail size={12} color="#94A3B8" />
                            <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={b.email}>{b.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '14px 12px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {b.city ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#334155', fontSize: '13px', fontWeight: '500' }}>
                            <MapPin size={13} color="#64748B" />
                            <span>{b.city}</span>
                          </div>
                        ) : (!b.taxNumber && <span style={{ color: '#94A3B8', fontSize: '13px' }}>—</span>)}
                        {b.taxNumber && (
                          <span style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '1px 6px', borderRadius: '4px', width: 'fit-content' }}>
                            GST: {b.taxNumber}
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '14px 12px', textAlign: 'center', verticalAlign: 'middle' }}>
                      {b.email ? (
                        <button
                          onClick={() => handleOpenLoginModal(b)}
                          className="notranslate"
                          translate="no"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '7px',
                            background: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            color: '#1D4ED8',
                            padding: '7px 14px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 1px 2px rgba(37, 99, 235, 0.05)'
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.background = '#DBEAFE'; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = '#EFF6FF'; }}
                        >
                          <KeyRound size={15} />
                          <span>Manage Login</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenLoginModal(b)}
                          className="notranslate"
                          translate="no"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '7px',
                            background: '#F8FAFC',
                            border: '1px dashed #93C5FD',
                            color: '#2563EB',
                            padding: '7px 14px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseOver={(e) => { 
                            e.currentTarget.style.background = '#EFF6FF'; 
                            e.currentTarget.style.borderColor = '#2563EB'; 
                          }}
                          onMouseOut={(e) => { 
                            e.currentTarget.style.background = '#F8FAFC'; 
                            e.currentTarget.style.borderColor = '#93C5FD'; 
                          }}
                        >
                          <KeyRound size={15} />
                          <span>Set Login</span>
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '14px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        {/* View Business */}
                        <button 
                          onClick={() => setViewBusiness(b)}
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#EFF6FF', color: '#3B82F6', border: '1px solid #DBEAFE', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s' }}
                          title="View Details"
                          onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'}
                          onMouseOut={(e) => e.currentTarget.style.background = '#EFF6FF'}
                        >
                          <Eye size={15} />
                        </button>

                        {/* Edit Business */}
                        <button 
                          onClick={() => handleEdit(b)}
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s' }}
                          title="Edit Business"
                          onMouseOver={(e) => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#0F172A'; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#475569'; }}
                        >
                          <Pencil size={14} />
                        </button>

                        {/* Delete Business */}
                        <button 
                          onClick={() => setDeleteId(b._id)}
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s' }}
                          title="Delete Business"
                          onMouseOver={(e) => e.currentTarget.style.background = '#FEE2E2'}
                          onMouseOut={(e) => e.currentTarget.style.background = '#FEF2F2'}
                        >
                          <Trash2 size={14} />
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
          totalItems={filteredBusinesses.length}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          itemName="businesses"
        />
      </div>

      {/* Main Add/Edit Business Modal */}
      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', padding: '28px 32px', borderRadius: '20px', width: '100%', maxWidth: '640px', maxHeight: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <Building2 size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                    {editingBusiness ? 'Edit Business' : 'Add New Business'}
                  </h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                    {editingBusiness ? 'Update business information and entity details' : 'Configure details for the new business entity'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setShowModal(false); setEditingBusiness(null); }} 
                style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Business Name - Full Width */}
                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                    Business Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    placeholder="e.g. Apex Supermarket & Grocery" 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }} 
                  />
                </div>

                {/* Business Category / Industry */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                      Industry / Category {isCustomCategory && <span style={{ color: '#EF4444' }}>*</span>}
                    </label>
                    {isCustomCategory && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(false);
                          setFormData({ ...formData, category: '' });
                        }}
                        style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '12px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                      >
                        Choose from list
                      </button>
                    )}
                  </div>

                  {!isCustomCategory ? (
                    <select
                      value={formData.category}
                      onChange={e => {
                        if (e.target.value === 'Other') {
                          setIsCustomCategory(true);
                          setFormData({ ...formData, category: '' });
                        } else {
                          setFormData({ ...formData, category: e.target.value });
                        }
                      }}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box', background: 'white' }}
                    >
                      <option value="">Select Category</option>
                      {BUSINESS_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <input 
                        placeholder="Type category name (Mandatory) *" 
                        type="text" 
                        value={formData.category} 
                        onChange={e => setFormData({ ...formData, category: e.target.value })} 
                        required 
                        autoFocus
                        style={{ width: '100%', padding: '11px 36px 11px 14px', borderRadius: '8px', border: '1px solid #2563EB', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }} 
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(false);
                          setFormData({ ...formData, category: '' });
                        }}
                        title="Back to category dropdown"
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: '#E2E8F0',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#475569'
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Contact Person / Manager */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                    Contact Person / Manager
                  </label>
                  <input 
                    placeholder="e.g. Rajesh Kumar" 
                    type="text" 
                    value={formData.contactPerson} 
                    onChange={e => setFormData({...formData, contactPerson: e.target.value})} 
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }} 
                  />
                </div>

                {/* Offering & Operations Configuration - Full Width */}
                <div style={{ gridColumn: '1 / span 2', padding: '14px 16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Offering / Catalog Type */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Package size={15} color="#2563EB" />
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                          Offering Model <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, offeringType: 'product' })}
                          style={{
                            padding: '10px 6px',
                            borderRadius: '8px',
                            border: formData.offeringType === 'product' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                            background: formData.offeringType === 'product' ? '#EFF6FF' : '#FFFFFF',
                            color: formData.offeringType === 'product' ? '#1D4ED8' : '#475569',
                            fontWeight: formData.offeringType === 'product' ? '600' : '500',
                            fontSize: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Package size={16} />
                          <span>Products</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, offeringType: 'service' })}
                          style={{
                            padding: '10px 6px',
                            borderRadius: '8px',
                            border: formData.offeringType === 'service' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                            background: formData.offeringType === 'service' ? '#EFF6FF' : '#FFFFFF',
                            color: formData.offeringType === 'service' ? '#1D4ED8' : '#475569',
                            fontWeight: formData.offeringType === 'service' ? '600' : '500',
                            fontSize: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Wrench size={16} />
                          <span>Services</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, offeringType: 'both' })}
                          style={{
                            padding: '10px 6px',
                            borderRadius: '8px',
                            border: (formData.offeringType === 'both' || !formData.offeringType) ? '2px solid #2563EB' : '1px solid #CBD5E1',
                            background: (formData.offeringType === 'both' || !formData.offeringType) ? '#EFF6FF' : '#FFFFFF',
                            color: (formData.offeringType === 'both' || !formData.offeringType) ? '#1D4ED8' : '#475569',
                            fontWeight: (formData.offeringType === 'both' || !formData.offeringType) ? '600' : '500',
                            fontSize: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Boxes size={16} />
                          <span>Both</span>
                        </button>
                      </div>
                    </div>

                    {/* Operations Flow */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Repeat size={15} color="#2563EB" />
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                          Trade Operations <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, operationsType: 'sales' })}
                          style={{
                            padding: '10px 6px',
                            borderRadius: '8px',
                            border: formData.operationsType === 'sales' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                            background: formData.operationsType === 'sales' ? '#EFF6FF' : '#FFFFFF',
                            color: formData.operationsType === 'sales' ? '#1D4ED8' : '#475569',
                            fontWeight: formData.operationsType === 'sales' ? '600' : '500',
                            fontSize: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <TrendingUp size={16} />
                          <span>Sales</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, operationsType: 'purchases' })}
                          style={{
                            padding: '10px 6px',
                            borderRadius: '8px',
                            border: formData.operationsType === 'purchases' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                            background: formData.operationsType === 'purchases' ? '#EFF6FF' : '#FFFFFF',
                            color: formData.operationsType === 'purchases' ? '#1D4ED8' : '#475569',
                            fontWeight: formData.operationsType === 'purchases' ? '600' : '500',
                            fontSize: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <ShoppingCart size={16} />
                          <span>Purchases</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, operationsType: 'both' })}
                          style={{
                            padding: '10px 6px',
                            borderRadius: '8px',
                            border: (formData.operationsType === 'both' || !formData.operationsType) ? '2px solid #2563EB' : '1px solid #CBD5E1',
                            background: (formData.operationsType === 'both' || !formData.operationsType) ? '#EFF6FF' : '#FFFFFF',
                            color: (formData.operationsType === 'both' || !formData.operationsType) ? '#1D4ED8' : '#475569',
                            fontWeight: (formData.operationsType === 'both' || !formData.operationsType) ? '600' : '500',
                            fontSize: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Repeat size={16} />
                          <span>Both</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                    Contact Phone <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="tel" 
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number" 
                    value={formData.phone} 
                    onChange={e => {
                      const numericVal = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({...formData, phone: numericVal});
                    }} 
                    required 
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }} 
                  />
                  {formData.phone && formData.phone.length > 0 && formData.phone.length < 10 && (
                    <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                      Please enter a full 10-digit number
                    </span>
                  )}
                </div>

                {/* Official Business Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                    Official Email
                  </label>
                  <input 
                    type="email"
                    placeholder="e.g. contact@apexretail.com" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }} 
                  />
                </div>

                {/* Tax ID / GSTIN */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                    GSTIN / Tax ID
                  </label>
                  <input 
                    placeholder="e.g. 29ABCDE1234F1Z5" 
                    type="text" 
                    value={formData.taxNumber} 
                    onChange={e => setFormData({...formData, taxNumber: e.target.value})} 
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }} 
                  />
                </div>

                {/* City / State */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                    City / State
                  </label>
                  <input 
                    placeholder="e.g. Bangalore, Karnataka" 
                    type="text" 
                    value={formData.city} 
                    onChange={e => setFormData({...formData, city: e.target.value})} 
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }} 
                  />
                </div>

                {/* Full Address - Full Width */}
                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                    Address
                  </label>
                  <textarea 
                    placeholder="Street address, building, landmark, pincode" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box', resize: 'vertical' }} 
                    rows="2"
                  ></textarea>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '14px', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setEditingBusiness(null); }} 
                  style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: '12px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}
                >
                  {editingBusiness ? 'Update Business' : 'Save Business'}
                </button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

      {/* Business Login Setup / Manage Modal */}
      {loginModalBusiness && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', padding: '24px 28px', borderRadius: '18px', width: '100%', maxWidth: '480px', maxHeight: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <KeyRound size={20} color="#2563EB" />
                </div>
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Business Login Access</h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>Configure credentials for this business entity</p>
                </div>
              </div>
              <button 
                onClick={() => setLoginModalBusiness(null)} 
                style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Business Summary Banner */}
            <div style={{ padding: '12px 16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{loginModalBusiness.name}</div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Category: {loginModalBusiness.category || 'General'} &bull; Phone: {loginModalBusiness.phone || 'N/A'}
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
                  Business Login Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="email" 
                    value={loginEmail} 
                    onChange={e => setLoginEmail(e.target.value)} 
                    placeholder="e.g. acme.business@biztech.com"
                    required
                    style={{ width: '100%', padding: '11px 14px 11px 40px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                  {loginModalBusiness.email ? 'New Password (leave blank to keep current)' : 'Set Password'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type={showLoginPassword ? "text" : "password"} 
                    value={loginPassword} 
                    onChange={e => setLoginPassword(e.target.value)} 
                    placeholder={loginModalBusiness.email ? "••••••••••••" : "Minimum 6 characters"}
                    required={!loginModalBusiness.email}
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

              {loginModalBusiness.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <input
                    type="checkbox"
                    id="enableBusinessLogin"
                    checked={isLoginEnabled}
                    onChange={(e) => setIsLoginEnabled(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#2563EB', cursor: 'pointer' }}
                  />
                  <label htmlFor="enableBusinessLogin" style={{ fontSize: '13px', fontWeight: '500', color: '#334155', cursor: 'pointer' }}>
                    Login Access Active
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setLoginModalBusiness(null)} 
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

      {/* View Business Modal */}
      {viewBusiness && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', padding: '24px 28px', borderRadius: '18px', width: '100%', maxWidth: '560px', maxHeight: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Business Details</h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>Comprehensive entity information</p>
                </div>
              </div>
              <button onClick={() => setViewBusiness(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}><X size={18} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Business Name</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#0F172A', fontWeight: '600' }}>{viewBusiness.name}</p>
              </div>
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: '500' }}>{viewBusiness.category || 'General'}</p>
              </div>
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Offering Model</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: '600' }}>
                  {viewBusiness.offeringType === 'service' ? '🛠️ Services Only' : viewBusiness.offeringType === 'product' ? '📦 Products Only' : '🔄 Products & Services'}
                </p>
              </div>
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trade Operations</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: '600' }}>
                  {viewBusiness.operationsType === 'sales' ? '📈 Sales Only' : viewBusiness.operationsType === 'purchases' ? '🛒 Purchases Only' : '🔁 Sales & Purchases'}
                </p>
              </div>
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Person</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: '500' }}>{viewBusiness.contactPerson || '-'}</p>
              </div>
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Phone</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: '500' }}>
                  <Phone size={14} color="#64748B" />
                  <span>{viewBusiness.phone || 'N/A'}</span>
                </div>
              </div>
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>GSTIN / Tax ID</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: '500' }}>{viewBusiness.taxNumber || 'N/A'}</p>
              </div>
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>City / Location</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: '500' }}>{viewBusiness.city || 'N/A'}</p>
              </div>
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Login Email</p>
                <p style={{ margin: 0, fontSize: '14px', color: viewBusiness.email ? '#2563EB' : '#94A3B8', fontWeight: '500' }}>{viewBusiness.email || 'Not configured'}</p>
              </div>
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Login Status</p>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  fontSize: '11px', 
                  fontWeight: '700', 
                  padding: '2px 8px', 
                  borderRadius: '12px',
                  background: !viewBusiness.email ? '#F1F5F9' : viewBusiness.isLoginEnabled !== false ? '#DCFCE7' : '#FEE2E2',
                  color: !viewBusiness.email ? '#64748B' : viewBusiness.isLoginEnabled !== false ? '#15803D' : '#B91C1C'
                }}>
                  {!viewBusiness.email ? 'Not Configured' : viewBusiness.isLoginEnabled !== false ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div style={{ gridColumn: '1 / span 2', padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: '500' }}>{viewBusiness.address || 'No address provided'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #F1F5F9', flexShrink: 0 }}>
              <button 
                type="button" 
                onClick={() => {
                  const target = viewBusiness;
                  setViewBusiness(null);
                  handleOpenLoginModal(target);
                }}
                style={{ padding: '8px 16px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', color: '#2563EB', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <KeyRound size={14} /> Login Settings
              </button>
              <button 
                type="button" 
                onClick={() => {
                  const target = viewBusiness;
                  setViewBusiness(null);
                  handleEdit(target);
                }}
                style={{ padding: '8px 16px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#334155', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Pencil size={14} /> Edit
              </button>
              <button 
                type="button" 
                onClick={() => setViewBusiness(null)} 
                style={{ padding: '8px 22px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}><AlertTriangle size={32} color="#EF4444" /></div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: '0 0 12px 0' }}>Delete Business</h2>
            <p style={{ color: '#64748B', margin: '0 0 24px 0' }}>Are you sure you want to delete this business?</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button type="button" onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={confirmDelete} style={{ flex: 1, padding: '14px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  );
};

export default Businesses;
