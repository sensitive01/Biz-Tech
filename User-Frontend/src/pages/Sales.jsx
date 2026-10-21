import { exportToCSV } from '../utils/exportToCSV';
import { formatDate } from '../utils/formatDate';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { ArrowUp, ArrowDown, TrendingUp, Plus, X, Eye, Pencil, Trash2, AlertTriangle, Search, Filter, ArrowUpDown, Download, IndianRupee, ShoppingCart, Receipt } from 'lucide-react';
import TablePagination from '../components/TablePagination';

const Sales = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [type, setType] = useState(tabParam === 'purchase' ? 'Purchase' : 'Sales');

  const [salesItems, setSalesItems] = useState([]);
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterDays, setFilterDays] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [formData, setFormData] = useState({ number: '', partyName: '', date: '', amount: '', status: '' });

  const handleTabChange = (newType) => {
    setType(newType);
    setSearchParams({ tab: newType.toLowerCase() });
    setCurrentPage(1);
    setSearch('');
  };

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

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      number: '',
      partyName: '',
      date: new Date().toISOString().substring(0, 10),
      amount: '',
      status: type === 'Purchase' ? 'Pending' : 'Paid'
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      number: item.invoiceNo || item.poNumber || '',
      partyName: item.customerName || item.supplierName || '',
      date: item.date ? (typeof item.date === 'string' ? item.date.substring(0, 10) : new Date(item.date).toISOString().substring(0, 10)) : '',
      amount: item.amount || '',
      status: item.status || (type === 'Purchase' ? 'Pending' : 'Paid')
    });
    setShowModal(true);
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const [salesRes, purchaseRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/sales`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/purchases`, { headers })
      ]);
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setSalesItems(salesData);
      }
      if (purchaseRes.ok) {
        const purchaseData = await purchaseRes.json();
        setPurchaseItems(purchaseData);
      }
    } catch (err) {
      console.error('Error fetching billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const isPurchase = type === 'Purchase';
      const endpoint = isPurchase ? 'purchases' : 'sales';
      const url = editingItem
        ? `${import.meta.env.VITE_API_URL}/api/${endpoint}/${editingItem._id}`
        : `${import.meta.env.VITE_API_URL}/api/${endpoint}`;
      const method = editingItem ? 'PUT' : 'POST';

      const payload = isPurchase
        ? {
            poNumber: formData.number,
            supplierName: formData.partyName,
            date: formData.date,
            amount: Number(formData.amount),
            status: formData.status || 'Pending'
          }
        : {
            invoiceNo: formData.number,
            customerName: formData.partyName,
            date: formData.date,
            amount: Number(formData.amount),
            status: formData.status || 'Paid'
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        setEditingItem(null);
        fetchItems();
      } else {
        alert(editingItem ? 'Failed to update record' : 'Failed to add record');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'Purchase' ? 'purchases' : 'sales';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/${endpoint}/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteId(null);
        fetchItems();
      } else {
        alert('Failed to delete record');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeItems = type === 'Purchase' ? purchaseItems : salesItems;

  const filteredItems = activeItems
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
      
      if (sortConfig.key === 'number') {
        aVal = a.poNumber || a.invoiceNo || '';
        bVal = b.poNumber || b.invoiceNo || '';
      }
      if (sortConfig.key === 'party') {
        aVal = a.supplierName || a.customerName || '';
        bVal = b.supplierName || b.customerName || '';
      }

      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      if (sortConfig.key === 'date' || sortConfig.key === 'createdAt') {
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
  }, [search, filterDays, customStartDate, customEndDate, type, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <TrendingUp size={28} color="var(--primary-blue)" /> Billing
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>Manage your billing efficiently.</p>
          
          {/* Purchase & Sales Tabs */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#F1F5F9',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            marginTop: '14px',
            gap: '4px'
          }}>
            <button
              type="button"
              onClick={() => handleTabChange('Purchase')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                background: type === 'Purchase' ? 'white' : 'transparent',
                color: type === 'Purchase' ? 'var(--primary-blue, #2563EB)' : '#64748B',
                border: 'none',
                boxShadow: type === 'Purchase' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <ShoppingCart size={16} />
              <span>Purchase</span>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '99px',
                background: type === 'Purchase' ? '#EFF6FF' : '#E2E8F0',
                color: type === 'Purchase' ? 'var(--primary-blue, #2563EB)' : '#64748B',
                fontWeight: '700'
              }}>
                {purchaseItems.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('Sales')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                background: type === 'Sales' ? 'white' : 'transparent',
                color: type === 'Sales' ? 'var(--primary-blue, #2563EB)' : '#64748B',
                border: 'none',
                boxShadow: type === 'Sales' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <TrendingUp size={16} />
              <span>Sales</span>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '99px',
                background: type === 'Sales' ? '#EFF6FF' : '#E2E8F0',
                color: type === 'Sales' ? 'var(--primary-blue, #2563EB)' : '#64748B',
                fontWeight: '700'
              }}>
                {salesItems.length}
              </span>
            </button>
          </div>
        </div>

        <button onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'var(--primary-blue)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
          <Plus size={18} /> Add New {type === 'Purchase' ? 'Purchase' : 'Billing'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {type === 'Purchase' ? <ShoppingCart size={24} /> : <Receipt size={24} />}
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
              {type === 'Purchase' ? 'Total Purchases' : 'Total Invoices'}
            </p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{activeItems.length}</h3>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IndianRupee size={24} /></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
              {type === 'Purchase' ? 'Total Spent' : 'Total Value'}
            </p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>
              ₹{activeItems.reduce((acc, i) => acc + (Number(i.amount || 0)), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={24} /></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Sales Invoices</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{salesItems.length}</h3>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingCart size={24} /></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Purchases</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{purchaseItems.length}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ flex: '0 1 300px', minWidth: '250px', position: 'relative' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder={`Search ${type === 'Purchase' ? 'purchases' : 'sales'}...`}
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
          
          <button onClick={() => exportToCSV(filteredItems.map(item => ({ ...item, date: formatDate(item.date) })), type === 'Purchase' ? 'Purchases_Billing' : 'Sales_Billing')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#475569', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}><Download size={16} /> Export</button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '60px' }}>S.No</th>
                <th onClick={() => requestSort('number')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {type === 'Purchase' ? 'PO Number' : 'InvoiceNo'} {renderSortIcon('number')}
                  </div>
                </th>
                <th onClick={() => requestSort('party')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {type === 'Purchase' ? 'Supplier Name' : 'CustomerName'} {renderSortIcon('party')}
                  </div>
                </th>
                <th onClick={() => requestSort('date')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Date {renderSortIcon('date')}</div>
                </th>
                <th onClick={() => requestSort('amount')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Amount (₹) {renderSortIcon('amount')}</div>
                </th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>Loading...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '64px 32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        {type === 'Purchase' ? <ShoppingCart size={32} color="#3B82F6" /> : <TrendingUp size={32} color="#3B82F6" />}
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>
                        No {type === 'Purchase' ? 'purchase records' : 'sales records'} found
                      </h3>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, index) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '16px 24px', fontSize: '15px', color: '#475569', fontWeight: '500' }}>{startIndex + index + 1}</td>
                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: '14px', fontWeight: '600' }}>{item.invoiceNo || item.poNumber}</td>
                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: '14px' }}>{item.customerName || item.supplierName}</td>
                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: '14px', whiteSpace: 'nowrap' }}>{formatDate(item.date)}</td>
                    <td style={{ padding: '16px 24px', color: '#0F172A', fontSize: '14px', fontWeight: '600' }}>₹{item.amount}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
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
          itemName="records"
        />
      </div>

      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                {editingItem ? 'Edit' : 'Add New'} {type === 'Purchase' ? 'Purchase Order' : 'Billing Record'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingItem(null); }} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>
                  {type === 'Purchase' ? 'PO Number' : 'InvoiceNo'}
                </label>
                <input
                  placeholder={type === 'Purchase' ? 'Enter PO number (e.g. PO-1001)' : 'Enter invoice no (e.g. INV-1001)'}
                  type="text"
                  value={formData.number}
                  onChange={e => setFormData({ ...formData, number: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>
                  {type === 'Purchase' ? 'Supplier Name' : 'CustomerName'}
                </label>
                <input
                  placeholder={type === 'Purchase' ? 'Enter supplier name' : 'Enter customer name'}
                  type="text"
                  value={formData.partyName}
                  onChange={e => setFormData({ ...formData, partyName: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Amount (₹)</label>
                <input
                  placeholder="Enter the amount (₹)"
                  type="number"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Status</label>
                {type === 'Purchase' ? (
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box', background: 'white' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Ordered">Ordered</option>
                    <option value="Received">Received</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                ) : (
                  <input
                    placeholder="e.g. Paid, Pending, Overdue"
                    type="text"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box' }}
                  />
                )}
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
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                {type === 'Purchase' ? 'Purchase Order Details' : 'Billing Invoice Details'}
              </h2>
              <button onClick={() => setViewItem(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
                  {type === 'Purchase' ? 'PO Number' : 'InvoiceNo'}
                </p>
                <p style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '600' }}>{viewItem.invoiceNo || viewItem.poNumber}</p>
              </div>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
                  {type === 'Purchase' ? 'Supplier Name' : 'CustomerName'}
                </p>
                <p style={{ margin: 0, fontSize: '16px', color: '#0F172A' }}>{viewItem.customerName || viewItem.supplierName}</p>
              </div>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Date</p>
                <p style={{ margin: 0, fontSize: '16px', color: '#0F172A' }}>{formatDate(viewItem.date)}</p>
              </div>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Amount</p>
                <p style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '700' }}>₹{viewItem.amount}</p>
              </div>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Status</p>
                <p style={{ margin: 0, fontSize: '16px', color: '#0F172A' }}>{viewItem.status || (type === 'Purchase' ? 'Pending' : 'Paid')}</p>
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

export default Sales;
