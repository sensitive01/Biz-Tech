import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle2, XCircle, RotateCcw, Eye, Search, 
  Copy, Check, Filter, ExternalLink, Download, AlertCircle, 
  Clock, RefreshCw, X, Building2, User, CreditCard, FileText, ArrowRight
} from 'lucide-react';

const PaymentApprovals = () => {
  const [approvals, setApprovals] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Feedback Banner
  const [alert, setAlert] = useState(null);

  // Modals
  const [previewModal, setPreviewModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [undoModal, setUndoModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedUtr, setCopiedUtr] = useState(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'All') queryParams.append('status', statusFilter);
      if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/payment-approvals?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setApprovals(data.approvals || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApprovals();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleCopyUtr = (utr, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  // 1. Approve Payment Action
  const handleApprove = async (item) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/payment-approvals/${item._id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showAlert('success', `Payment for "${item.businessName}" approved! Tenant workspace unlocked.`);
        fetchApprovals();
      } else {
        showAlert('error', data.message || 'Failed to approve payment');
      }
    } catch (err) {
      showAlert('error', err.message || 'Server error approving payment');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Reject Payment Action
  const confirmReject = async () => {
    if (!rejectModal) return;
    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/payment-approvals/${rejectModal._id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: rejectReason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showAlert('success', `Payment request for "${rejectModal.businessName}" rejected.`);
        setRejectModal(null);
        setRejectReason('');
        fetchApprovals();
      } else {
        showAlert('error', data.message || 'Failed to reject payment');
      }
    } catch (err) {
      showAlert('error', err.message || 'Server error rejecting payment');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Undo Payment Decision Action
  const confirmUndo = async () => {
    if (!undoModal) return;
    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/payment-approvals/${undoModal._id}/undo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showAlert('success', `Decision undone. Payment for "${undoModal.businessName}" reverted to Pending.`);
        setUndoModal(null);
        fetchApprovals();
      } else {
        showAlert('error', data.message || 'Failed to undo decision');
      }
    } catch (err) {
      showAlert('error', err.message || 'Server error undoing decision');
    } finally {
      setActionLoading(false);
    }
  };

  const getFullProofUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${import.meta.env.VITE_API_URL}${url}`;
  };

  const isPdf = (url) => {
    return url?.toLowerCase().endsWith('.pdf');
  };

  return (
    <div style={{ padding: '24px 32px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', color: 'var(--primary-blue)', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
            <ShieldCheck size={14} /> Subscription & Access Control
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-title)', margin: '0 0 6px 0' }}>
            Payment Approvals & Verifications
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
            Verify tenant UPI QR payment receipts, inspect UTR reference numbers, approve workspace access, or undo decisions.
          </p>
        </div>

        <button
          onClick={fetchApprovals}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'var(--card-bg, white)',
            color: 'var(--text-title)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh List
        </button>
      </div>

      {/* Alert Notification */}
      {alert && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: alert.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${alert.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
          color: alert.type === 'success' ? '#065F46' : '#991B1B',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* Total Requests */}
        <div style={{ background: 'var(--card-bg, white)', borderRadius: '14px', padding: '18px 20px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Total Submissions</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-title)' }}>{counts.all}</div>
          </div>
        </div>

        {/* Pending Verification */}
        <div style={{ background: 'var(--card-bg, white)', borderRadius: '14px', padding: '18px 20px', border: counts.pending > 0 ? '1.5px solid #F59E0B' : '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: counts.pending > 0 ? '0 4px 14px rgba(245,158,11,0.1)' : 'none' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#D97706', fontWeight: '700', textTransform: 'uppercase' }}>Pending Approvals</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#B45309' }}>{counts.pending}</div>
          </div>
        </div>

        {/* Approved */}
        <div style={{ background: 'var(--card-bg, white)', borderRadius: '14px', padding: '18px 20px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#059669', fontWeight: '700', textTransform: 'uppercase' }}>Approved Workspaces</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#047857' }}>{counts.approved}</div>
          </div>
        </div>

        {/* Rejected */}
        <div style={{ background: 'var(--card-bg, white)', borderRadius: '14px', padding: '18px 20px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#DC2626', fontWeight: '700', textTransform: 'uppercase' }}>Rejected</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#B91C1C' }}>{counts.rejected}</div>
          </div>
        </div>

      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ background: 'var(--card-bg, white)', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'All', label: 'All Requests', count: counts.all },
            { id: 'Pending', label: 'Pending Verification', count: counts.pending, color: '#D97706' },
            { id: 'Approved', label: 'Approved', count: counts.approved, color: '#059669' },
            { id: 'Rejected', label: 'Rejected', count: counts.rejected, color: '#DC2626' }
          ].map(tab => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: isActive ? '1.5px solid var(--primary-blue)' : '1px solid var(--border-color)',
                  background: isActive ? '#EFF6FF' : 'transparent',
                  color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '11px',
                  padding: '2px 7px',
                  borderRadius: '12px',
                  background: isActive ? 'var(--primary-blue)' : '#F1F5F9',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  fontWeight: '700'
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Field */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search business, owner, email, UTR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '13px',
              outline: 'none',
              background: 'var(--bg-color, white)',
              color: 'var(--text-title)',
              boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Approvals Table */}
      <div style={{ background: 'var(--card-bg, white)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--primary-blue)' }} />
            <div>Loading payment approval requests...</div>
          </div>
        ) : approvals.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#94A3B8' }}>
            <ShieldCheck size={40} style={{ opacity: 0.3, marginBottom: '10px', display: 'inline-block' }} />
            <h4 style={{ margin: '0 0 6px 0', color: '#334155', fontSize: '16px', fontWeight: '700' }}>
              No Payment Requests Found
            </h4>
            <p style={{ fontSize: '13.5px', color: '#94A3B8', margin: 0 }}>
              {statusFilter === 'All' 
                ? 'When new tenants complete UPI QR onboarding, their requests will appear here for verification.' 
                : `There are currently no requests with "${statusFilter}" status.`}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '12px' }}>
                  <th style={{ padding: '14px 20px' }}>S.no</th>
                  <th style={{ padding: '14px 20px' }}>Business / Legal Identity</th>
                  <th style={{ padding: '14px 16px' }}>Owner & Contact</th>
                  <th style={{ padding: '14px 16px' }}>Plan & Fee</th>
                  <th style={{ padding: '14px 16px' }}>UTR / Reference</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>Proof Document</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((item, idx) => {
                  const proofSrc = getFullProofUrl(item.proofUrl);
                  const isPending = item.status === 'Pending';
                  const isApproved = item.status === 'Approved';
                  const isRejected = item.status === 'Rejected';

                  return (
                    <tr 
                      key={item._id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '500' }}>{idx + 1}</td>
                      {/* 1. Business Legal Identity */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-title)', fontSize: '14px' }}>
                          {item.businessName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                            Type {item.businessType || 1}
                          </span>
                          {item.panNumber && (
                            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B', fontWeight: '700' }}>
                              PAN: {item.panNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Owner & Contact */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--text-title)' }}>
                          {item.ownerName || 'Business Owner'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {item.email}
                        </div>
                        {item.phone && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {item.phone}
                          </div>
                        )}
                      </td>

                      {/* 3. Plan & Fee */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ fontWeight: '700', color: '#2563EB', fontSize: '14px' }}>
                          ₹{(item.amount || 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-title)', fontWeight: '600' }}>
                          {item.planName}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {item.billingCycle || 'Monthly'} Billing
                        </div>
                      </td>

                      {/* 4. UTR / Reference */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#0F172A', fontSize: '13px' }}>
                            {item.utrNumber}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyUtr(item.utrNumber, e)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedUtr === item.utrNumber ? '#10B981' : '#64748B', display: 'flex', alignItems: 'center' }}
                            title="Copy UTR"
                          >
                            {copiedUtr === item.utrNumber ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* 5. Proof Document */}
                      <td style={{ padding: '16px 16px', textAlign: 'center' }}>
                        {item.proofUrl ? (
                          <div 
                            onClick={() => setPreviewModal(item)}
                            style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', group: 'proof' }}
                          >
                            {isPdf(item.proofUrl) ? (
                              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #BFDBFE' }}>
                                <FileText size={22} />
                              </div>
                            ) : (
                              <img 
                                src={proofSrc} 
                                alt="Proof" 
                                style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #CBD5E1', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}
                              />
                            )}
                            <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: '700', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Eye size={12} /> Inspect
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No receipt</span>
                        )}
                      </td>

                      {/* 6. Status */}
                      <td style={{ padding: '16px 16px' }}>
                        {isPending && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '14px', background: '#FEF3C7', color: '#B45309', fontSize: '12px', fontWeight: '700' }}>
                            <Clock size={13} /> Pending Review
                          </span>
                        )}
                        {isApproved && (
                          <div>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '14px', background: '#ECFDF5', color: '#047857', fontSize: '12px', fontWeight: '700' }}>
                              <CheckCircle2 size={13} /> Approved
                            </span>
                            {item.reviewedBy && (
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                                by {item.reviewedBy}
                              </div>
                            )}
                          </div>
                        )}
                        {isRejected && (
                          <div>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '14px', background: '#FEF2F2', color: '#B91C1C', fontSize: '12px', fontWeight: '700' }}>
                              <XCircle size={13} /> Rejected
                            </span>
                            {item.rejectionReason && (
                              <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '3px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.rejectionReason}>
                                {item.rejectionReason}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 7. Action Controls */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          
                          {/* When PENDING: Show Approve & Reject */}
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(item)}
                                disabled={actionLoading}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '7px 12px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: '#10B981',
                                  color: 'white',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 6px rgba(16,185,129,0.2)'
                                }}
                              >
                                <CheckCircle2 size={14} /> Approve
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setRejectModal(item);
                                  setRejectReason('');
                                }}
                                disabled={actionLoading}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '7px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid #FECACA',
                                  background: '#FEF2F2',
                                  color: '#DC2626',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                              >
                                <XCircle size={14} /> Reject
                              </button>
                            </>
                          )}

                          {/* When APPROVED: Show Undo Approval button */}
                          {isApproved && (
                            <button
                              type="button"
                              onClick={() => setUndoModal(item)}
                              disabled={actionLoading}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '7px 12px',
                                borderRadius: '8px',
                                border: '1px solid #FCD34D',
                                background: '#FFFBEB',
                                color: '#B45309',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                              title="Revert decision back to Pending (Locks workspace access)"
                            >
                              <RotateCcw size={14} /> Undo Approval
                            </button>
                          )}

                          {/* When REJECTED: Show Undo Rejection and Approve */}
                          {isRejected && (
                            <>
                              <button
                                type="button"
                                onClick={() => setUndoModal(item)}
                                disabled={actionLoading}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '7px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid #BFDBFE',
                                  background: '#EFF6FF',
                                  color: '#2563EB',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                                title="Revert decision back to Pending"
                              >
                                <RotateCcw size={14} /> Undo Rejection
                              </button>

                              <button
                                type="button"
                                onClick={() => handleApprove(item)}
                                disabled={actionLoading}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '7px 12px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: '#10B981',
                                  color: 'white',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                              >
                                <CheckCircle2 size={14} /> Approve
                              </button>
                            </>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: RECEIPT LIGHTBOX MODAL                                           */}
      {/* ========================================================================= */}
      {previewModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                  Payment Receipt • {previewModal.businessName}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  UTR: <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0F172A' }}>{previewModal.utrNumber}</span> • Amount: <strong style={{ color: '#2563EB' }}>₹{(previewModal.amount || 0).toLocaleString()}</strong>
                </div>
              </div>
              <button
                onClick={() => setPreviewModal(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body Preview */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', textAlign: 'center', background: '#F8FAFC' }}>
              {isPdf(previewModal.proofUrl) ? (
                <div style={{ padding: '40px 20px' }}>
                  <FileText size={54} color="#2563EB" style={{ margin: '0 auto 12px auto' }} />
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>PDF Document Receipt</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '18px' }}>{previewModal.originalFileName || 'payment_proof.pdf'}</div>
                  <a
                    href={getFullProofUrl(previewModal.proofUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#2563EB',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      textDecoration: 'none'
                    }}
                  >
                    <ExternalLink size={15} /> Open PDF in New Tab
                  </a>
                </div>
              ) : (
                <img
                  src={getFullProofUrl(previewModal.proofUrl)}
                  alt="Proof Screenshot"
                  style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '8px', border: '1px solid #CBD5E1', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}
                />
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
              <a
                href={getFullProofUrl(previewModal.proofUrl)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '12px', color: '#2563EB', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}
              >
                <Download size={14} /> Open Original Full Size
              </a>

              <div style={{ display: 'flex', gap: '8px' }}>
                {previewModal.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => {
                        const item = previewModal;
                        setPreviewModal(null);
                        setRejectModal(item);
                        setRejectReason('');
                      }}
                      style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        const item = previewModal;
                        setPreviewModal(null);
                        handleApprove(item);
                      }}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#10B981', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Approve & Unlock
                    </button>
                  </>
                )}
                <button
                  onClick={() => setPreviewModal(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F1F5F9', color: '#475569', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REJECT REASON MODAL                                              */}
      {/* ========================================================================= */}
      {rejectModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#DC2626', marginBottom: '12px' }}>
              <XCircle size={24} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
                Reject Payment Submission
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              You are rejecting the payment verification for <strong>{rejectModal.businessName}</strong> (UTR: {rejectModal.utrNumber}). The user will not be able to log in until a valid payment is confirmed.
            </p>

            {/* Quick Reason Presets */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Quick Reasons:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  'UTR number not received in bank account',
                  'Amount paid does not match plan price',
                  'Payment screenshot is blurry / unreadable',
                  'Invalid or duplicate transaction receipt'
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectReason(preset)}
                    style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      background: rejectReason === preset ? '#EFF6FF' : '#F8FAFC',
                      color: rejectReason === preset ? '#2563EB' : '#475569',
                      cursor: 'pointer',
                      fontWeight: rejectReason === preset ? '700' : '500'
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Textarea */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Detailed Rejection Note (Shown to Tenant on Login):
              </label>
              <textarea
                rows={3}
                placeholder="Enter specific reason for rejecting this payment proof..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: '#F1F5F9',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReject}
                disabled={actionLoading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#DC2626',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: actionLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: UNDO DECISION CONFIRMATION MODAL                                  */}
      {/* ========================================================================= */}
      {undoModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#D97706', marginBottom: '12px' }}>
              <RotateCcw size={24} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
                Undo Payment Decision
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6', margin: '0 0 20px 0' }}>
              Are you sure you want to revert the payment status for <strong>{undoModal.businessName}</strong> back to <strong>Pending Verification</strong>?
              {undoModal.status === 'Approved' && (
                <span style={{ display: 'block', marginTop: '8px', color: '#B45309', fontWeight: '600' }}>
                  ⚠️ Notice: This will lock the tenant workspace access again until approved.
                </span>
              )}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setUndoModal(null)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: '#F1F5F9',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmUndo}
                disabled={actionLoading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#D97706',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: actionLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {actionLoading ? 'Reverting...' : 'Confirm Undo'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentApprovals;
