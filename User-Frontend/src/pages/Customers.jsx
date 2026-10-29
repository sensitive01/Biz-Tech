import { exportToCSV } from '../utils/exportToCSV';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp, ArrowDown, UserCheck, Plus, X, Eye, Pencil, Trash2, AlertTriangle, Search, ArrowUpDown, Download, Users, Building2 } from 'lucide-react';
import TablePagination from '../components/TablePagination';

const Customers = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
  
  const [isCustomType, setIsCustomType] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    customerType: 'Retail',
    gstin: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsCustomType(false);
    setFormData({
      name: '',
      companyName: '',
      customerType: 'Retail',
      gstin: '',
      email: '',
      phone: '',
      address: ''
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    const standardTypes = ['Retail', 'Wholesale', 'Corporate', 'Individual'];
    const isOther = item.customerType && !standardTypes.includes(item.customerType);
    setIsCustomType(Boolean(isOther));
    setFormData({
      name: item.name || '',
      companyName: item.companyName || '',
      customerType: item.customerType || 'Retail',
      gstin: item.gstin || '',
      email: item.email || '',
      phone: item.phone || '',
      address: item.address || ''
    });
    setShowModal(true);
  };

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone || formData.phone.length !== 10) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }
    if (isCustomType && !formData.customerType.trim()) {
      alert('Please specify the customer type.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const url = editingItem
        ? `${import.meta.env.VITE_API_URL}/api/customers/${editingItem._id}`
        : `${import.meta.env.VITE_API_URL}/api/customers`;
      const method = editingItem ? 'PUT' : 'POST';

      const payload = {
        name: formData.name.trim(),
        companyName: formData.companyName.trim(),
        customerType: formData.customerType.trim() || 'Retail',
        gstin: formData.gstin.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim()
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        setEditingItem(null);
        setIsCustomType(false);
        setFormData({ name: '', companyName: '', customerType: 'Retail', gstin: '', email: '', phone: '', address: '' });
        fetchItems();
      } else {
        alert(editingItem ? 'Failed to update item' : 'Failed to add item');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/customers/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteId(null);
        fetchItems();
      } else {
        alert('Failed to delete');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items
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
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const renderCustomerTypeBadge = (type) => {
    switch (type) {
      case 'Wholesale':
        return <span style={{ fontSize: '12px', fontWeight: '600', color: '#5B21B6', background: '#F5F3FF', padding: '3px 8px', borderRadius: '6px' }}>Wholesale</span>;
      case 'Corporate':
        return <span style={{ fontSize: '12px', fontWeight: '600', color: '#065F46', background: '#ECFDF5', padding: '3px 8px', borderRadius: '6px' }}>Corporate</span>;
      case 'Individual':
        return <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569', background: '#F1F5F9', padding: '3px 8px', borderRadius: '6px' }}>Individual</span>;
      case 'Retail':
      default:
        return <span style={{ fontSize: '12px', fontWeight: '600', color: '#1E40AF', background: '#EFF6FF', padding: '3px 8px', borderRadius: '6px' }}>Retail</span>;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UserCheck size={28} color="var(--primary-blue)" /> Customers
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>Manage your customers directory and business details.</p>
        </div>
        <button onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'var(--primary-blue)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}>
          <Plus size={18} /> Add New Customer
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={24} /></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Customers</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{items.length}</h3>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={24} /></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Commercial / Wholesale</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{items.filter(c => c.customerType === 'Commercial' || c.customerType === 'Wholesale').length}</h3>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCheck size={24} /></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Retail / Individual</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{items.filter(c => c.customerType === 'Retail' || c.customerType === 'Individual' || !c.customerType).length}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ flex: '0 1 300px', minWidth: '250px', position: 'relative' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} />
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
        
        <button onClick={() => exportToCSV(filteredItems, 'Customers')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#475569', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}><Download size={16} /> Export</button>
      </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '50px' }}>S.No</th>
                <th onClick={() => requestSort('name')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Customer Name {renderSortIcon('name')}</div>
                </th>
                <th onClick={() => requestSort('companyName')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Company {renderSortIcon('companyName')}</div>
                </th>
                <th onClick={() => requestSort('customerType')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Type {renderSortIcon('customerType')}</div>
                </th>
                <th onClick={() => requestSort('gstin')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>GSTIN / Tax No {renderSortIcon('gstin')}</div>
                </th>
                <th onClick={() => requestSort('phone')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Phone {renderSortIcon('phone')}</div>
                </th>
                <th onClick={() => requestSort('email')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Email {renderSortIcon('email')}</div>
                </th>
                <th onClick={() => requestSort('address')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Address {renderSortIcon('address')}</div>
                </th>
                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>Loading...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '64px 32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}><UserCheck size={32} color="#3B82F6" /></div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>No records found</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, index) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#475569', fontWeight: '500' }}>{startIndex + index + 1}</td>
                    <td style={{ padding: '16px 20px', color: '#0F172A', fontSize: '14px', fontWeight: '600' }}>{item.name}</td>
                    <td style={{ padding: '16px 20px', color: '#475569', fontSize: '14px' }}>{item.companyName || '-'}</td>
                    <td style={{ padding: '16px 20px' }}>
                      {renderCustomerTypeBadge(item.customerType)}
                    </td>
                    <td style={{ padding: '16px 20px', color: item.gstin ? '#0F172A' : '#94A3B8', fontSize: '13px', fontFamily: 'monospace', fontWeight: item.gstin ? '600' : '400' }}>
                      {item.gstin || '-'}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#475569', fontSize: '14px' }}>{item.phone || '-'}</td>
                    <td style={{ padding: '16px 20px', color: '#475569', fontSize: '14px' }}>{item.email || '-'}</td>
                    <td style={{ padding: '16px 20px', color: '#475569', fontSize: '14px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.address}>{item.address || '-'}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => setViewItem(item)} title="View" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#EFF6FF', color: '#3B82F6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Eye size={16} /></button>
                        <button onClick={() => handleEdit(item)} title="Edit" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Pencil size={15} /></button>
                        <button onClick={() => setDeleteId(item._id)} title="Delete" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={16} /></button>
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
          totalItems={filteredItems.length}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          itemName="customers"
        />
      </div>

      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: 0 }}>{editingItem ? 'Edit Customer' : 'Add New Customer'}</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>Fill in the business and contact details below.</p>
              </div>
              <button onClick={() => { setShowModal(false); setEditingItem(null); }} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>Customer Name *</label>
                  <input placeholder="Enter contact/customer name" type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>Company / Business Name</label>
                  <input placeholder="e.g. Acme Corp / Retail Shop" type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                      Customer Type {isCustomType && <span style={{ color: '#EF4444' }}>*</span>}
                    </label>
                    {isCustomType && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomType(false);
                          setFormData({ ...formData, customerType: 'Retail' });
                        }}
                        style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '12px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                      >
                        Choose from list
                      </button>
                    )}
                  </div>

                  {!isCustomType ? (
                    <select 
                      value={formData.customerType} 
                      onChange={e => {
                        if (e.target.value === 'Other') {
                          setIsCustomType(true);
                          setFormData({ ...formData, customerType: '' });
                        } else {
                          setFormData({ ...formData, customerType: e.target.value });
                        }
                      }} 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box', background: 'white' }}
                    >
                      <option value="Retail">Retail</option>
                      <option value="Wholesale">Wholesale</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Individual">Individual</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <input 
                        placeholder="Type customer type (Mandatory) *" 
                        type="text" 
                        value={formData.customerType} 
                        onChange={e => setFormData({ ...formData, customerType: e.target.value })} 
                        required 
                        autoFocus
                        style={{ width: '100%', padding: '10px 36px 10px 14px', borderRadius: '8px', border: '1px solid #2563EB', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }} 
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomType(false);
                          setFormData({ ...formData, customerType: 'Retail' });
                        }}
                        title="Back to dropdown"
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
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>GSTIN / Tax No</label>
                  <input placeholder="e.g. 29ABCDE1234F1Z5" type="text" value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>Phone *</label>
                  <input 
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    placeholder="Enter 10-digit number" 
                    value={formData.phone} 
                    onChange={e => {
                      const numericVal = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({...formData, phone: numericVal});
                    }} 
                    required 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }} 
                  />
                  {formData.phone && formData.phone.length > 0 && formData.phone.length < 10 && (
                    <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                      Please enter a full 10-digit number
                    </span>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>Email</label>
                  <input placeholder="Enter email address" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>Address</label>
                  <input placeholder="Enter full address" type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingItem(null); }} style={{ flex: 1, padding: '14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '14px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>{editingItem ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

      {viewItem && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: '0 0 4px 0' }}>{viewItem.name}</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {renderCustomerTypeBadge(viewItem.customerType)}
                  {viewItem.companyName && (
                    <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>
                      {viewItem.companyName}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setViewItem(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Company Name</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#0F172A', fontWeight: '500' }}>{viewItem.companyName || '-'}</p>
              </div>
              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>GSTIN / Tax No</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#0F172A', fontFamily: 'monospace', fontWeight: '600' }}>{viewItem.gstin || '-'}</p>
              </div>
              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Customer Type</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#0F172A', fontWeight: '500' }}>{viewItem.customerType || 'Retail'}</p>
              </div>
              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Phone</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#0F172A', fontWeight: '500' }}>{viewItem.phone || '-'}</p>
              </div>
              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Email</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#0F172A', fontWeight: '500' }}>{viewItem.email || '-'}</p>
              </div>
              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', gridColumn: '1 / -1' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Address</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#0F172A' }}>{viewItem.address || '-'}</p>
              </div>
            </div>
          </div>
        </div>, document.body
      )}

      {deleteId && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}><AlertTriangle size={32} color="#EF4444" /></div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: '0 0 12px 0' }}>Delete Record</h2>
            <p style={{ color: '#64748B', margin: '0 0 24px 0' }}>Are you sure you want to delete this record?</p>
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

export default Customers;
