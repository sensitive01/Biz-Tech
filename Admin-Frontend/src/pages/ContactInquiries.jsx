import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Mail, Phone, Building2, Calendar, Eye, Trash2, 
  RefreshCw, Download, X, AlertTriangle, CheckCircle2, 
  Clock, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink,
  MessageSquare, User, Filter, Save, Loader2, Sparkles,
  ChevronRight
} from 'lucide-react';
import TablePagination from '../components/TablePagination';
import { exportToCSV } from '../utils/exportToCSV';

const ContactInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, inProgress: 0, contacted: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [filterDays, setFilterDays] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Modals & Actions
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const fetchInquiries = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/contact-inquiries`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch contact inquiries');
      }

      const data = await res.json();
      setInquiries(data.inquiries || []);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Fetch inquiries error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Update Status
  const handleUpdateStatus = async (id, newStatus, currentNotes) => {
    setIsUpdatingStatus(true);
    try {
      const token = localStorage.getItem('adminToken');
      const body = { status: newStatus };
      if (currentNotes !== undefined) {
        body.notes = currentNotes;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/contact-inquiries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Failed to update status');
      const data = await res.json();

      // Update in-memory state
      setInquiries(prev => prev.map(item => item._id === id ? { ...item, status: newStatus, notes: currentNotes ?? item.notes } : item));
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry(prev => ({ ...prev, status: newStatus, notes: currentNotes ?? prev.notes }));
      }

      // Recompute stats
      updateLocalStats();
      showToast(`Status updated to "${newStatus}"`);
    } catch (err) {
      alert(err.message || 'Error updating inquiry status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setSavingNotes(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/contact-inquiries/${selectedInquiry._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes: adminNotes })
      });

      if (!res.ok) throw new Error('Failed to save notes');

      setInquiries(prev => prev.map(item => item._id === selectedInquiry._id ? { ...item, notes: adminNotes } : item));
      setSelectedInquiry(prev => ({ ...prev, notes: adminNotes }));
      showToast('Admin notes saved successfully!');
    } catch (err) {
      alert(err.message || 'Error saving notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDeleteInquiry = async () => {
    if (!deleteConfirm) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/contact-inquiries/${deleteConfirm._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to delete inquiry');

      setInquiries(prev => prev.filter(i => i._id !== deleteConfirm._id));
      if (selectedInquiry && selectedInquiry._id === deleteConfirm._id) {
        setSelectedInquiry(null);
      }
      setDeleteConfirm(null);
      updateLocalStats();
      showToast('Inquiry deleted successfully');
    } catch (err) {
      alert(err.message || 'Error deleting inquiry');
    }
  };

  const updateLocalStats = () => {
    // Refresh stats from backend on next turn or compute locally
    fetchInquiries(false);
  };

  const openViewModal = (item) => {
    setSelectedInquiry(item);
    setAdminNotes(item.notes || '');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'New':
        return { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE', label: 'New / Unread' };
      case 'In Progress':
        return { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A', label: 'In Progress' };
      case 'Contacted':
        return { bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE', label: 'Contacted' };
      case 'Closed':
        return { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0', label: 'Closed' };
      default:
        return { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1', label: status || 'Unknown' };
    }
  };

  // Filtered List
  const filteredInquiries = useMemo(() => {
    let result = [...inquiries];

    // Status filter
    if (selectedStatus && selectedStatus !== 'all') {
      result = result.filter(i => i.status === selectedStatus);
    }

    // Date filter
    if (filterDays !== 'all') {
      const now = new Date();
      if (filterDays === 'today') {
        const todayStr = now.toISOString().split('T')[0];
        result = result.filter(i => (i.createdAt || '').startsWith(todayStr));
      } else if (filterDays === '7') {
        const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        result = result.filter(i => new Date(i.createdAt) >= past);
      } else if (filterDays === '30') {
        const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        result = result.filter(i => new Date(i.createdAt) >= past);
      } else if (filterDays === 'thisMonth') {
        const month = now.getMonth();
        const year = now.getFullYear();
        result = result.filter(i => {
          const d = new Date(i.createdAt);
          return d.getMonth() === month && d.getFullYear() === year;
        });
      } else if (filterDays === 'custom') {
        if (customStartDate) {
          result = result.filter(i => new Date(i.createdAt) >= new Date(customStartDate));
        }
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          result = result.filter(i => new Date(i.createdAt) <= end);
        }
      }
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(i => 
        (i.name && i.name.toLowerCase().includes(q)) ||
        (i.email && i.email.toLowerCase().includes(q)) ||
        (i.phone && i.phone.toLowerCase().includes(q)) ||
        (i.company && i.company.toLowerCase().includes(q)) ||
        (i.subject && i.subject.toLowerCase().includes(q)) ||
        (i.message && i.message.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';

        if (sortConfig.key === 'createdAt') {
          const aTime = new Date(aVal).getTime() || 0;
          const bTime = new Date(bVal).getTime() || 0;
          return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime;
        }

        if (typeof aVal === 'string') {
          return sortConfig.direction === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    return result;
  }, [inquiries, selectedStatus, filterDays, customStartDate, customEndDate, searchTerm, sortConfig]);

  // Paginated List
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInquiries = filteredInquiries.slice(startIndex, startIndex + itemsPerPage);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={13} style={{ marginLeft: '4px', opacity: 0.4 }} />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={13} style={{ marginLeft: '4px', color: '#2563EB' }} /> 
      : <ArrowDown size={13} style={{ marginLeft: '4px', color: '#2563EB' }} />;
  };

  const handleExportCSV = () => {
    const dataToExport = filteredInquiries.map((item, idx) => ({
      'S.No': idx + 1,
      'Name': item.name,
      'Email': item.email,
      'Phone': item.phone || '-',
      'Company': item.company || '-',
      'Subject': item.subject || 'General Inquiry',
      'Message': item.message,
      'Status': item.status || 'New',
      'Admin Notes': item.notes || '',
      'Date': formatDate(item.createdAt)
    }));

    exportToCSV(dataToExport, 'Contact_Inquiries');
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: '#0F172A',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: '500',
          border: '1px solid #334155',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle2 size={18} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #DBEAFE' }}>
              <Mail size={22} />
            </div>
            Contact Inquiries & Leads
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
            Real-time messages submitted by visitors and prospective clients from the website contact form.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => fetchInquiries(true)} 
            disabled={refreshing}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '10px 16px', 
              borderRadius: '8px', 
              border: '1px solid #E2E8F0', 
              background: 'white', 
              color: '#334155', 
              fontSize: '13px', 
              fontWeight: '600', 
              cursor: refreshing ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button 
            onClick={handleExportCSV}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '10px 16px', 
              borderRadius: '8px', 
              border: '1px solid #E2E8F0', 
              background: 'white', 
              color: '#334155', 
              fontSize: '13px', 
              fontWeight: '600', 
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        
        {/* Total Inquiries */}
        <div 
          onClick={() => { setSelectedStatus('all'); setCurrentPage(1); }}
          style={{ 
            background: 'white', 
            borderRadius: '16px', 
            border: selectedStatus === 'all' ? '2px solid #2563EB' : '1px solid #E2E8F0', 
            padding: '18px 20px', 
            cursor: 'pointer',
            boxShadow: selectedStatus === 'all' ? '0 4px 12px rgba(37,99,235,0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.15s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>All Inquiries</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>{stats.total}</div>
        </div>

        {/* New / Unread */}
        <div 
          onClick={() => { setSelectedStatus('New'); setCurrentPage(1); }}
          style={{ 
            background: 'white', 
            borderRadius: '16px', 
            border: selectedStatus === 'New' ? '2px solid #2563EB' : '1px solid #E2E8F0', 
            padding: '18px 20px', 
            cursor: 'pointer',
            boxShadow: selectedStatus === 'New' ? '0 4px 12px rgba(37,99,235,0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.15s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#2563EB', fontWeight: '600' }}>New & Unread</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#2563EB' }}>{stats.new}</div>
        </div>

        {/* In Progress */}
        <div 
          onClick={() => { setSelectedStatus('In Progress'); setCurrentPage(1); }}
          style={{ 
            background: 'white', 
            borderRadius: '16px', 
            border: selectedStatus === 'In Progress' ? '2px solid #D97706' : '1px solid #E2E8F0', 
            padding: '18px 20px', 
            cursor: 'pointer',
            boxShadow: selectedStatus === 'In Progress' ? '0 4px 12px rgba(217,119,6,0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.15s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#D97706', fontWeight: '600' }}>In Progress</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#D97706' }}>{stats.inProgress}</div>
        </div>

        {/* Contacted */}
        <div 
          onClick={() => { setSelectedStatus('Contacted'); setCurrentPage(1); }}
          style={{ 
            background: 'white', 
            borderRadius: '16px', 
            border: selectedStatus === 'Contacted' ? '2px solid #7C3AED' : '1px solid #E2E8F0', 
            padding: '18px 20px', 
            cursor: 'pointer',
            boxShadow: selectedStatus === 'Contacted' ? '0 4px 12px rgba(124,58,237,0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.15s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#7C3AED', fontWeight: '600' }}>Contacted</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Phone size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#7C3AED' }}>{stats.contacted}</div>
        </div>

        {/* Closed */}
        <div 
          onClick={() => { setSelectedStatus('Closed'); setCurrentPage(1); }}
          style={{ 
            background: 'white', 
            borderRadius: '16px', 
            border: selectedStatus === 'Closed' ? '2px solid #059669' : '1px solid #E2E8F0', 
            padding: '18px 20px', 
            cursor: 'pointer',
            boxShadow: selectedStatus === 'Closed' ? '0 4px 12px rgba(5,150,105,0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.15s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#059669', fontWeight: '600' }}>Closed / Resolved</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#059669' }}>{stats.closed}</div>
        </div>

      </div>

      {/* Main Table Container */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        
        {/* Controls: Search, Filters */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Search Box */}
          <div style={{ flex: '1 1 320px', maxWidth: '440px', position: 'relative' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by name, email, phone, company, message..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ width: '100%', padding: '11px 16px 11px 44px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box' }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '13px', color: '#334155', fontWeight: '500', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">Status: All Statuses</option>
              <option value="New">Status: New</option>
              <option value="In Progress">Status: In Progress</option>
              <option value="Contacted">Status: Contacted</option>
              <option value="Closed">Status: Closed</option>
            </select>

            {/* Date Filter */}
            <select 
              value={filterDays} 
              onChange={(e) => { setFilterDays(e.target.value); setCurrentPage(1); }}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '13px', color: '#334155', fontWeight: '500', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">Filter: All Time</option>
              <option value="today">Today</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="custom">Custom Date Range</option>
            </select>

            {filterDays === 'custom' && (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none' }} />
                <span style={{ color: '#94A3B8', fontSize: '12px' }}>to</span>
                <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none' }} />
              </div>
            )}

            {(selectedStatus !== 'all' || filterDays !== 'all' || searchTerm) && (
              <button
                onClick={() => { setSelectedStatus('all'); setFilterDays('all'); setSearchTerm(''); setCustomStartDate(''); setCustomEndDate(''); setCurrentPage(1); }}
                style={{ padding: '9px 12px', borderRadius: '8px', background: '#F1F5F9', border: 'none', color: '#64748B', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Inquiries Table */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '50px' }}>S.No</th>
                <th onClick={() => requestSort('name')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Contact / Visitor {renderSortIcon('name')}</div>
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Subject / Topic</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', minWidth: '220px' }}>Message Preview</th>
                <th onClick={() => requestSort('createdAt')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Date & Time {renderSortIcon('createdAt')}</div>
                </th>
                <th onClick={() => requestSort('status')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', width: '160px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Status {renderSortIcon('status')}</div>
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right', width: '110px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '48px 20px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <Loader2 size={30} color="#2563EB" style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: '14px' }}>Loading inquiries...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '56px 20px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Mail size={36} color="#CBD5E1" />
                      <p style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: '600', color: '#334155' }}>No inquiries found</p>
                      <span style={{ fontSize: '13px', color: '#94A3B8' }}>Try adjusting your search terms or filters.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedInquiries.map((item, idx) => {
                  const badge = getStatusBadgeStyle(item.status);
                  const initials = (item.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                  return (
                    <tr 
                      key={item._id || idx} 
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                      {/* S.No */}
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748B', fontWeight: '500' }}>
                        {startIndex + idx + 1}
                      </td>

                      {/* Contact Info */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: '700', color: '#0F172A', fontSize: '14px' }}>{item.name}</span>
                              {item.company && (
                                <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontWeight: '500' }}>
                                  {item.company}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: '#64748B' }}>
                              <a href={`mailto:${item.email}`} style={{ color: '#2563EB', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Mail size={12} /> {item.email}
                              </a>
                              {item.phone && (
                                <a href={`tel:${item.phone}`} style={{ color: '#475569', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Phone size={12} /> {item.phone}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', background: '#F1F5F9', color: '#334155', fontWeight: '600', display: 'inline-block' }}>
                          {item.subject || 'General Inquiry'}
                        </span>
                      </td>

                      {/* Message Preview */}
                      <td style={{ padding: '14px 20px', maxWidth: '280px' }}>
                        <p 
                          onClick={() => openViewModal(item)}
                          title="Click to view full message"
                          style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', cursor: 'pointer' }}
                        >
                          {item.message}
                        </p>
                      </td>

                      {/* Date & Time */}
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: '600', color: '#0F172A' }}>
                            {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748B' }}>
                            {new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        </div>
                      </td>

                      {/* Status Dropdown (Instant Update Feature) */}
                      <td style={{ padding: '14px 20px' }}>
                        <select
                          value={item.status || 'New'}
                          onChange={(e) => handleUpdateStatus(item._id, e.target.value)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '8px',
                            border: `1px solid ${badge.border}`,
                            background: badge.bg,
                            color: badge.color,
                            fontSize: '12px',
                            fontWeight: '700',
                            outline: 'none',
                            cursor: 'pointer',
                            width: '130px',
                            boxSizing: 'border-box'
                          }}
                        >
                          <option value="New">New</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button 
                            onClick={() => openViewModal(item)}
                            title="View Full Inquiry"
                            style={{ padding: '7px', borderRadius: '6px', background: '#EFF6FF', border: '1px solid #DBEAFE', color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Eye size={15} />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(item)}
                            title="Delete Inquiry"
                            style={{ padding: '7px', borderRadius: '6px', background: '#FEE2E2', border: '1px solid #FECACA', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <TablePagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalItems={filteredInquiries.length}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          itemName="inquiries"
        />

      </div>

      {/* ============================================================ */}
      {/* VIEW INQUIRY MODAL */}
      {/* ============================================================ */}
      {selectedInquiry && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', maxWidth: '640px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 26px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>Inquiry Details</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>Submitted on {formatDate(selectedInquiry.createdAt)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedInquiry(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 26px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Sender Details Card */}
              <div style={{ background: '#F8FAFC', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', marginBottom: '2px' }}>Full Name</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>{selectedInquiry.name}</div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', marginBottom: '2px' }}>Work Email</div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>
                    <a href={`mailto:${selectedInquiry.email}`} style={{ color: '#2563EB', textDecoration: 'none' }}>{selectedInquiry.email}</a>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', marginBottom: '2px' }}>Phone Number</div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>
                    {selectedInquiry.phone ? (
                      <a href={`tel:${selectedInquiry.phone}`} style={{ color: '#0F172A', textDecoration: 'none' }}>{selectedInquiry.phone}</a>
                    ) : (
                      <span style={{ color: '#94A3B8' }}>Not provided</span>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', marginBottom: '2px' }}>Company / Organization</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>{selectedInquiry.company || 'Not provided'}</div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>Topic / Subject</label>
                <div style={{ padding: '10px 14px', background: '#F1F5F9', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>
                  {selectedInquiry.subject || 'General Inquiry'}
                </div>
              </div>

              {/* Full Message */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>Message</label>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap', maxHeight: '180px', overflowY: 'auto' }}>
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Status Update Control */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Inquiry Status
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['New', 'In Progress', 'Contacted', 'Closed'].map(st => {
                    const isSelected = selectedInquiry.status === st;
                    const bStyle = getStatusBadgeStyle(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateStatus(selectedInquiry._id, st, adminNotes)}
                        disabled={isUpdatingStatus}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '700',
                          border: `1.5px solid ${isSelected ? bStyle.border : '#E2E8F0'}`,
                          background: isSelected ? bStyle.bg : 'white',
                          color: isSelected ? bStyle.color : '#64748B',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s'
                        }}
                      >
                        {isSelected && <CheckCircle2 size={14} />}
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Internal Admin Notes</label>
                  <button 
                    type="button" 
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Save size={13} /> {savingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
                <textarea
                  rows="3"
                  placeholder="Add internal notes about phone conversations, follow-up schedule, or solution provided..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box', resize: 'vertical' }}
                ></textarea>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 26px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject || 'Your Inquiry to BizTech')}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#2563EB', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}
                >
                  <Mail size={15} /> Reply via Email
                </a>
                {selectedInquiry.phone && (
                  <a
                    href={`tel:${selectedInquiry.phone}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'white', border: '1px solid #CBD5E1', color: '#334155', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}
                  >
                    <Phone size={15} /> Call Client
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                style={{ padding: '9px 18px', background: '#E2E8F0', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', maxWidth: '440px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', textAlign: 'center', padding: '28px 24px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>
              Delete Contact Inquiry?
            </h3>
            
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748B', lineHeight: '1.5' }}>
              Are you sure you want to delete inquiry from <strong>{deleteConfirm.name}</strong> ({deleteConfirm.email})? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button 
                onClick={() => setDeleteConfirm(null)} 
                style={{ padding: '9px 18px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteInquiry} 
                style={{ padding: '9px 20px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ContactInquiries;