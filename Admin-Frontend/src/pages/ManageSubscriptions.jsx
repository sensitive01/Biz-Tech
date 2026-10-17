import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  Receipt, Search, Filter, Download, Plus, 
  Store, Users, Map, Building2, Calendar, 
  CheckCircle2, Clock, AlertTriangle, ArrowUpDown, 
  ArrowUp, ArrowDown, Edit2, LogIn, ExternalLink, 
  IndianRupee, TrendingUp, CreditCard, X, Save, 
  Loader2, Check, RefreshCw 
} from 'lucide-react';
import { exportToCSV } from '../utils/exportToCSV';

const ManageSubscriptions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({
    totalActive: 0,
    totalTenants: 0,
    totalMrr: 0,
    expiringSoonCount: 0,
    typeDistribution: {}
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Modal State for Editing Subscription
  const [editingSub, setEditingSub] = useState(null);
  const [editForm, setEditForm] = useState({
    status: 'Active',
    businessType: 1,
    billingCycle: 'Monthly',
    customAmount: 0,
    renewalDate: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [impersonatingId, setImpersonatingId] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
        setStats(data.stats || {
          totalActive: 0,
          totalTenants: 0,
          totalMrr: 0,
          expiringSoonCount: 0,
          typeDistribution: {}
        });
      }
    } catch (err) {
      console.error('Failed to fetch subscriptions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleEditClick = (sub) => {
    setEditingSub(sub);
    setEditForm({
      status: sub.status || 'Active',
      businessType: sub.type || 1,
      billingCycle: sub.billingCycle || 'Monthly',
      customAmount: sub.amount || 0,
      renewalDate: sub.renewalDate ? new Date(sub.renewalDate).toISOString().split('T')[0] : ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingSub) return;
    setSavingEdit(true);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/subscriptions/${editingSub._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: editForm.status,
          businessType: editForm.businessType,
          billingCycle: editForm.billingCycle,
          customAmount: editForm.customAmount,
          renewalDate: editForm.renewalDate
        })
      });

      if (res.ok) {
        setEditingSub(null);
        fetchSubscriptions();
      } else {
        alert('Failed to update subscription');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating subscription');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleManageUser = async (customer) => {
    try {
      setImpersonatingId(customer._id);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/impersonate/${customer._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        alert('Failed to initialize user session');
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Filtered & Sorted Subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const matchesSearch = 
        sub.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'All' || sub.status === selectedStatus;
      const matchesType = selectedType === 'All' || String(sub.type) === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [subscriptions, searchQuery, selectedStatus, selectedType]);

  const sortedSubscriptions = useMemo(() => {
    let items = [...filteredSubscriptions];
    if (sortConfig.key) {
      items.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [filteredSubscriptions, sortConfig]);

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

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Active':
        return { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' };
      case 'Trial':
        return { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' };
      case 'Pending Renewal':
        return { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' };
      case 'Expired':
        return { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' };
      case 'Cancelled':
        return { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
      default:
        return { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Receipt size={14} /> REVENUE & BILLING
          </div>
          <h1 style={{ fontSize: '28px', margin: '0 0 6px 0', color: 'var(--text-title)' }}>Manage Subscriptions</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            Monitor and configure tenant subscriptions, monthly billing tiers, and recurring revenue.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => navigate('/admin/pricing')}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white' }}
          >
            <CreditCard size={16} /> Pricing Tier Settings
          </button>
          <button 
            onClick={() => exportToCSV(filteredSubscriptions, 'Tenant_Subscriptions')}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white' }}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
        
        <div className="card" style={{ padding: '20px', background: 'white', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Subscriptions</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>
              {stats.totalActive} <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '500' }}>/ {stats.totalTenants} total</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', background: 'white', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly Recurring (MRR)</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>
              ₹{stats.totalMrr.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', background: 'white', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: stats.expiringSoonCount > 0 ? '#FFFBEB' : '#F8FAFC', color: stats.expiringSoonCount > 0 ? '#D97706' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Renewing in &le; 7 Days</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: stats.expiringSoonCount > 0 ? '#B45309' : '#0F172A', marginTop: '2px' }}>
              {stats.expiringSoonCount}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', background: 'white', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Revenue / Tenant</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>
              ₹{stats.totalActive ? Math.round(stats.totalMrr / stats.totalActive).toLocaleString() : 0}
            </div>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by business, contact, or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', outline: 'none', background: 'white', fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>Status:</span>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'white', fontSize: '13px', outline: 'none' }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Trial">Trial</option>
              <option value="Pending Renewal">Pending Renewal</option>
              <option value="Expired">Expired</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>Archetype:</span>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'white', fontSize: '13px', outline: 'none' }}
            >
              <option value="All">All Types</option>
              <option value="1">Type 1: Sole Operator</option>
              <option value="2">Type 2: Single Branch + Staff</option>
              <option value="3">Type 3: Multi-Branch Enterprise</option>
              <option value="4">Type 4: Conglomerate</option>
            </select>
          </div>

          <button 
            onClick={fetchSubscriptions}
            className="btn-secondary"
            title="Refresh subscriptions"
            style={{ padding: '8px 12px', background: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Subscription Table */}
      <div className="card" style={{ padding: '0', overflowX: 'auto', background: 'white', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '16px 20px', fontWeight: '600', width: '50px' }}>S.NO</th>
              <th onClick={() => requestSort('businessName')} style={{ padding: '16px 20px', fontWeight: '600', cursor: 'pointer', userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>Business / Client</span> {renderSortIcon('businessName')}</div>
              </th>
              <th onClick={() => requestSort('type')} style={{ padding: '16px 20px', fontWeight: '600', cursor: 'pointer', userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>Plan Tier</span> {renderSortIcon('type')}</div>
              </th>
              <th onClick={() => requestSort('billingCycle')} style={{ padding: '16px 20px', fontWeight: '600', cursor: 'pointer', userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>Billing Cycle</span> {renderSortIcon('billingCycle')}</div>
              </th>
              <th onClick={() => requestSort('amount')} style={{ padding: '16px 20px', fontWeight: '600', cursor: 'pointer', userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>Price (₹)</span> {renderSortIcon('amount')}</div>
              </th>
              <th onClick={() => requestSort('status')} style={{ padding: '16px 20px', fontWeight: '600', cursor: 'pointer', userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>Status</span> {renderSortIcon('status')}</div>
              </th>
              <th onClick={() => requestSort('renewalDate')} style={{ padding: '16px 20px', fontWeight: '600', cursor: 'pointer', userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>Next Renewal</span> {renderSortIcon('renewalDate')}</div>
              </th>
              <th style={{ padding: '16px 20px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px auto' }} />
                  <div>Loading subscription accounts...</div>
                </td>
              </tr>
            ) : sortedSubscriptions.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                  No subscriptions match the selected criteria.
                </td>
              </tr>
            ) : (
              sortedSubscriptions.map((sub, idx) => {
                const badgeStyle = getStatusBadgeStyle(sub.status);
                return (
                  <tr key={sub._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '500' }}>{idx + 1}</td>
                    
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div 
                          onClick={() => handleManageUser(sub)}
                          style={{ width: '38px', height: '38px', borderRadius: '8px', background: `var(--badge-type${sub.type}-bg)`, color: sub.type === 1 ? 'var(--primary-blue)' : `var(--badge-type${sub.type}-text)`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          title="Manage User Workspace"
                        >
                          {sub.type === 1 && <Store size={18} />}
                          {sub.type === 2 && <Users size={18} />}
                          {sub.type === 3 && <Map size={18} />}
                          {sub.type === 4 && <Building2 size={18} />}
                        </div>
                        <div>
                          <div 
                            onClick={() => handleManageUser(sub)}
                            style={{ fontWeight: '600', color: 'var(--primary-blue)', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Manage Workspace"
                          >
                            {sub.businessName}
                            <ExternalLink size={12} style={{ opacity: 0.7 }} />
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub.contactEmail} &bull; {sub.userId}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <span className="badge" style={{ background: `var(--badge-type${sub.type}-bg)`, color: sub.type === 1 ? 'var(--primary-blue)' : `var(--badge-type${sub.type}-text)` }}>
                        Type {sub.type}
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-title)' }}>
                      {sub.billingCycle}
                    </td>

                    <td style={{ padding: '16px 20px', fontWeight: '700', fontSize: '14px', color: 'var(--text-title)' }}>
                      ₹{Number(sub.amount).toLocaleString()}
                      <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '400' }}>/mo</span>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ 
                        background: badgeStyle.bg, 
                        color: badgeStyle.color, 
                        border: `1px solid ${badgeStyle.border}`, 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: badgeStyle.color }}></div>
                        {sub.status}
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{formatDate(sub.renewalDate)}</div>
                      {sub.daysUntilRenewal <= 7 && sub.status === 'Active' && (
                        <div style={{ fontSize: '11px', color: '#D97706', fontWeight: '600', marginTop: '2px' }}>
                          Due in {sub.daysUntilRenewal} days
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          type="button" 
                          onClick={() => handleEditClick(sub)}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'white' }}
                          title="Edit Subscription & Plan"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleManageUser(sub)}
                          disabled={impersonatingId === sub._id}
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          title="Open Tenant Workspace"
                        >
                          {impersonatingId === sub._id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <LogIn size={13} />}
                          Manage
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

      {/* Edit Subscription Modal */}
      {editingSub && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '18px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', margin: '0 0 4px 0' }}>
                  Edit Subscription
                </h2>
                <div style={{ fontSize: '13px', color: '#64748B' }}>
                  {editingSub.businessName} ({editingSub.contactEmail})
                </div>
              </div>
              <button onClick={() => setEditingSub(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontWeight: '600', fontSize: '13px' }}>Plan Archetype</label>
                <select 
                  className="input-field"
                  value={editForm.businessType}
                  onChange={(e) => setEditForm({ ...editForm, businessType: Number(e.target.value) })}
                >
                  <option value={1}>Type 1: Sole Operator (1 Owner • 1 Shop)</option>
                  <option value={2}>Type 2: Single Branch + Staff</option>
                  <option value={3}>Type 3: Multi-Branch Enterprise</option>
                  <option value={4}>Type 4: Multi-Business Conglomerate</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontWeight: '600', fontSize: '13px' }}>Subscription Status</label>
                  <select 
                    className="input-field"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Trial">Trial</option>
                    <option value="Pending Renewal">Pending Renewal</option>
                    <option value="Expired">Expired</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontWeight: '600', fontSize: '13px' }}>Billing Cycle</label>
                  <select 
                    className="input-field"
                    value={editForm.billingCycle}
                    onChange={(e) => setEditForm({ ...editForm, billingCycle: e.target.value })}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontWeight: '600', fontSize: '13px' }}>Monthly Amount (₹)</label>
                  <input 
                    type="number" 
                    className="input-field"
                    required
                    value={editForm.customAmount}
                    onChange={(e) => setEditForm({ ...editForm, customAmount: Number(e.target.value) })}
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontWeight: '600', fontSize: '13px' }}>Next Renewal Date</label>
                  <input 
                    type="date" 
                    className="input-field"
                    value={editForm.renewalDate}
                    onChange={(e) => setEditForm({ ...editForm, renewalDate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingSub(null)}
                  className="btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '14px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={savingEdit}
                  className="btn-primary"
                  style={{ padding: '10px 22px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {savingEdit ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                  Save Subscription
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default ManageSubscriptions;
