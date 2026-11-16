import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  X, 
  Trash2, 
  Check, 
  XCircle, 
  Search, 
  Download, 
  ArrowUp, 
  ArrowDown, 
  ArrowUpDown, 
  Pencil, 
  Clock, 
  CheckCircle2, 
  Store,
  Timer,
  AlertCircle,
  MessageSquare,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { exportToCSV } from '../utils/exportToCSV';
import { formatDate } from '../utils/formatDate';
import TablePagination from '../components/TablePagination';

const LEAVE_TYPES = [
  'Annual Leave',
  'Casual Leave',
  'Sick / Medical Leave',
  'Unpaid Leave',
  'Maternity / Paternity Leave',
  'Bereavement Leave',
  'Compensatory Off',
  'Other'
];

const PERMISSION_TYPES = [
  'Personal Permission',
  'Official / On-Duty Work',
  'Late Arrival',
  'Early Departure',
  'Doctor / Medical Checkup',
  'Emergency / Family',
  'Bank / Official Errand',
  'Other'
];

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDays, setFilterDays] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    category: 'Leave', // 'Leave' | 'Permission'
    type: 'Annual Leave',
    customType: '',
    startDate: '',
    endDate: '',
    timeFrom: '10:00',
    timeTo: '12:00',
    durationHours: '2 hrs',
    reason: ''
  });

  // Formal Review Modal state (for Type 2, 3, 4 owners/managers)
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    leave: null,
    action: 'Approved', // 'Approved' | 'Rejected'
    note: ''
  });

  // Delete Confirmation Modal state
  const [deleteConfirmLeave, setDeleteConfirmLeave] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Business archetype & role identity
  const tenantType = Number(localStorage.getItem('tenantType')) || 1;
  const currentUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  })();
  const isEmployee = currentUser?.role === 'employee';
  const isSoleOperator = tenantType === 1;
  // Type 1 has no approval flow (direct record). Types 2, 3, 4 have formal review/approval workflow.
  const hasApprovalWorkflow = !isSoleOperator;
  const canReview = hasApprovalWorkflow && !isEmployee;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCategory, filterStatus, filterDays, customStartDate, customEndDate, itemsPerPage]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const [leaveRes, empRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/leaves`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/employees`, { headers })
      ]);
      if (leaveRes.ok) setLeaves(await leaveRes.json());
      if (empRes.ok) setEmployees(await empRes.json());
    } catch (err) {
      console.error('Error fetching leaves/employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateHours = (from, to) => {
    if (!from || !to) return '';
    const [h1, m1] = from.split(':').map(Number);
    const [h2, m2] = to.split(':').map(Number);
    let diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diffMinutes < 0) diffMinutes += 24 * 60;
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    if (hours === 0 && mins === 0) return '0 hrs';
    if (mins === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
    if (hours === 0) return `${mins} mins`;
    return `${hours} hr ${mins} mins`;
  };

  const handleTimeChange = (field, val) => {
    const updated = { ...formData, [field]: val };
    const from = field === 'timeFrom' ? val : formData.timeFrom;
    const to = field === 'timeTo' ? val : formData.timeTo;
    const computedDuration = calculateHours(from, to);
    if (computedDuration) updated.durationHours = computedDuration;
    setFormData(updated);
  };

  const handleOpenAdd = () => {
    setEditingLeave(null);
    const today = new Date().toISOString().split('T')[0];
    
    // Auto-select logged-in employee if employee role
    let initialEmpId = '';
    if (isEmployee && currentUser?.employeeId) {
      initialEmpId = currentUser.employeeId;
    } else if (employees.length > 0) {
      initialEmpId = employees[0]._id;
    }

    setFormData({
      employeeId: initialEmpId,
      category: 'Leave',
      type: 'Annual Leave',
      customType: '',
      startDate: today,
      endDate: today,
      timeFrom: '10:00',
      timeTo: '12:00',
      durationHours: '2 hrs',
      reason: ''
    });
    setShowModal(true);
  };

  const handleEdit = (leave) => {
    setEditingLeave(leave);
    const startStr = leave.startDate ? new Date(leave.startDate).toISOString().split('T')[0] : '';
    const endStr = leave.endDate ? new Date(leave.endDate).toISOString().split('T')[0] : startStr;

    const isStandardLeave = LEAVE_TYPES.includes(leave.type);
    const isStandardPermission = PERMISSION_TYPES.includes(leave.type);
    const isKnown = leave.category === 'Permission' ? isStandardPermission : isStandardLeave;

    let selectedType = leave.type || (leave.category === 'Permission' ? 'Personal Permission' : 'Annual Leave');
    let customVal = '';

    if (!isKnown && leave.type) {
      selectedType = 'Other';
      customVal = leave.type;
    } else if (leave.type === 'Other' || leave.type === 'Other Leave' || leave.type === 'Other Permission') {
      selectedType = 'Other';
    }

    setFormData({
      employeeId: leave.employeeId?._id || leave.employeeId || '',
      category: leave.category || 'Leave',
      type: selectedType,
      customType: customVal,
      startDate: startStr,
      endDate: endStr,
      timeFrom: leave.timeFrom || '10:00',
      timeTo: leave.timeTo || '12:00',
      durationHours: leave.durationHours || '2 hrs',
      reason: leave.reason || ''
    });
    setShowModal(true);
  };

  const handleDeleteClick = (leave) => {
    setDeleteConfirmLeave(leave);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmLeave) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leaves/${deleteConfirmLeave._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteConfirmLeave(null);
        fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to delete record');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting leave record');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingLeave
        ? `${import.meta.env.VITE_API_URL}/api/leaves/${editingLeave._id}`
        : `${import.meta.env.VITE_API_URL}/api/leaves`;
      const method = editingLeave ? 'PUT' : 'POST';

      const payload = { ...formData };
      if (payload.type === 'Other' || payload.type === 'Other Leave' || payload.type === 'Other Permission') {
        if (!payload.customType || !payload.customType.trim()) {
          alert(`Please mention what kind of other ${payload.category === 'Permission' ? 'permission' : 'leave'} it is.`);
          return;
        }
        payload.type = payload.customType.trim();
      }
      delete payload.customType;

      if (payload.category === 'Permission') {
        payload.endDate = payload.startDate;
      }

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        setEditingLeave(null);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || `Failed to ${editingLeave ? 'update' : 'create'} request`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenReview = (leave, action) => {
    setReviewModal({
      isOpen: true,
      leave,
      action,
      note: ''
    });
  };

  const handleConfirmReview = async () => {
    if (!reviewModal.leave) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leaves/${reviewModal.leave._id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: reviewModal.action,
          reviewNote: reviewModal.note
        })
      });
      if (res.ok) {
        setReviewModal({ isOpen: false, leave: null, action: 'Approved', note: '' });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update review status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} style={{ opacity: 0.3, marginLeft: '4px' }} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} style={{ color: 'var(--primary-blue)', marginLeft: '4px' }} /> : <ArrowDown size={14} style={{ color: 'var(--primary-blue)', marginLeft: '4px' }} />;
  };

  const filteredLeaves = leaves
    .filter(i => {
      // Category filter
      if (filterCategory === 'Leave' && i.category === 'Permission') return false;
      if (filterCategory === 'Permission' && i.category !== 'Permission') return false;

      // Status filter
      if (filterStatus !== 'all' && i.status !== filterStatus) return false;

      // Days range filter
      if (filterDays !== 'all') {
        const itemDate = new Date(i.startDate || i.createdAt || new Date());
        const diffTime = Math.abs(new Date() - itemDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (filterDays === '7' && diffDays > 7) return false;
        if (filterDays === '30' && diffDays > 30) return false;
        if (filterDays === 'custom') {
          if (customStartDate && new Date(itemDate) < new Date(customStartDate)) return false;
          if (customEndDate && new Date(itemDate) > new Date(customEndDate)) return false;
        }
      }

      // Search filter
      const empName = (i.employeeId?.name || '').toLowerCase();
      const empCode = (i.employeeId?.employeeId || '').toLowerCase();
      const reasonText = (i.reason || '').toLowerCase();
      const typeText = (i.type || '').toLowerCase();
      const s = search.toLowerCase();

      return empName.includes(s) || empCode.includes(s) || reasonText.includes(s) || typeText.includes(s);
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      let aVal = sortConfig.key === 'employee' ? a.employeeId?.name : a[sortConfig.key];
      let bVal = sortConfig.key === 'employee' ? b.employeeId?.name : b[sortConfig.key];
      
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      if (sortConfig.key === 'startDate' || sortConfig.key === 'endDate') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else {
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeaves = filteredLeaves.slice(startIndex, startIndex + itemsPerPage);

  // Statistics calculation
  const totalLeavesCount = leaves.filter(l => l.category !== 'Permission').length;
  const totalPermissionsCount = leaves.filter(l => l.category === 'Permission').length;
  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  const approvedCount = leaves.filter(l => l.status === 'Approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'Rejected').length;

  const currentEmployeeInfo = isEmployee 
    ? employees.find(e => e._id === currentUser?.employeeId) || { name: currentUser?.fullName || currentUser?.name || 'Logged-in Employee', employeeId: currentUser?.userId || 'Current' }
    : null;

  return (
    <div style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarIcon size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                {isSoleOperator ? 'Leaves & Permissions' : hasApprovalWorkflow ? 'Leave & Permission Approvals' : 'Leaves & Permissions'}
              </h1>
              <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                {isSoleOperator
                  ? 'Record and track employee leaves and short permissions (Sole Operator - Direct Record).'
                  : isEmployee 
                  ? 'Apply for leave or short permission. Requests are routed for owner/manager approval.' 
                  : 'Review, approve, and track employee leave requests and short hourly permissions.'}
              </p>
            </div>
          </div>
        </div>

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
          <Plus size={18} /> 
          {isSoleOperator ? 'Add Leaves / Permission' : isEmployee ? 'Apply Leave / Permission' : 'Add Leaves / Permission'}
        </button>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
        {/* If Type 2,3,4: show Formal Approval Queue Cards */}
        {hasApprovalWorkflow ? (
          <>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Pending Review</p>
                  {pendingCount > 0 && (
                    <span style={{ fontSize: '11px', background: '#FEF3C7', color: '#92400E', fontWeight: '700', padding: '2px 7px', borderRadius: '10px' }}>
                      Requires Action
                    </span>
                  )}
                </div>
                <h3 style={{ margin: 0, fontSize: '26px', color: '#0F172A', fontWeight: '800' }}>{pendingCount}</h3>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Approved</p>
                <h3 style={{ margin: 0, fontSize: '26px', color: '#0F172A', fontWeight: '800' }}>{approvedCount}</h3>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <XCircle size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Rejected</p>
                <h3 style={{ margin: 0, fontSize: '26px', color: '#0F172A', fontWeight: '800' }}>{rejectedCount}</h3>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CalendarIcon size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Requests</p>
                <h3 style={{ margin: 0, fontSize: '26px', color: '#0F172A', fontWeight: '800' }}>{leaves.length}</h3>
              </div>
            </div>
          </>
        ) : (
          /* Type 1 Sole Operator: Direct Records Cards */
          <>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CalendarIcon size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Leaves Recorded</p>
                <h3 style={{ margin: 0, fontSize: '26px', color: '#0F172A', fontWeight: '800' }}>{totalLeavesCount}</h3>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Timer size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Permissions Granted</p>
                <h3 style={{ margin: 0, fontSize: '26px', color: '#0F172A', fontWeight: '800' }}>{totalPermissionsCount}</h3>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <UserCheck size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Direct Recorded</p>
                <h3 style={{ margin: 0, fontSize: '26px', color: '#0F172A', fontWeight: '800' }}>{leaves.length}</h3>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Store size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Staff Enrolled</p>
                <h3 style={{ margin: 0, fontSize: '26px', color: '#0F172A', fontWeight: '800' }}>{employees.length}</h3>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter and Control Bar */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ width: '280px', position: 'relative' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search staff, ID, or reason..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} 
            />
          </div>

          {/* Status Filter (if Approval Workflow exists) */}
          {hasApprovalWorkflow && (
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)} 
              style={{ padding: '10px 14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#334155', fontWeight: '500', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">Status: All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          )}
        </div>

        {/* Right Controls: Category, Date, Custom Range & Export */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Category Toggle Filter */}
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)} 
            style={{ padding: '10px 14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#334155', fontWeight: '500', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="all">Category: All</option>
            <option value="Leave">Leaves Only</option>
            <option value="Permission">Permissions Only</option>
          </select>

          {/* Time Filter */}
          <select 
            value={filterDays} 
            onChange={(e) => setFilterDays(e.target.value)} 
            style={{ padding: '10px 14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#334155', fontWeight: '500', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="all">Date: All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>

          {filterDays === 'custom' && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }} />
              <span style={{ fontSize: '13px', color: '#64748B' }}>to</span>
              <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }} />
            </div>
          )}

          <button 
            onClick={() => exportToCSV(filteredLeaves.map(l => ({
              'Employee Name': l.employeeId?.name || 'N/A',
              'Employee ID': l.employeeId?.employeeId || '',
              'Category': l.category || 'Leave',
              'Type': l.type,
              'Start Date': formatDate(l.startDate),
              'End Date': l.category === 'Permission' ? formatDate(l.startDate) : formatDate(l.endDate),
              'Time From': l.timeFrom || '',
              'Time To': l.timeTo || '',
              'Duration': l.durationHours || '',
              'Reason': l.reason || '',
              'Status': l.status,
              'Reviewed By': l.reviewedBy || '',
              'Review Remarks': l.reviewNote || ''
            })), 'Leaves_and_Permissions')} 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
          >
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '50px' }}>S.No</th>
                <th onClick={() => requestSort('employee')} style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Employee {renderSortIcon('employee')}</div>
                </th>
                <th onClick={() => requestSort('category')} style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Category & Type {renderSortIcon('category')}</div>
                </th>
                <th onClick={() => requestSort('startDate')} style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Dates & Schedule {renderSortIcon('startDate')}</div>
                </th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                  Reason & Review Remarks
                </th>
                <th onClick={() => requestSort('status')} style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Status {renderSortIcon('status')}</div>
                </th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>Loading requests...</td></tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '64px 32px', textAlign: 'center', color: '#64748B' }}>
                    <CalendarIcon size={36} color="#CBD5E1" style={{ marginBottom: '12px', display: 'inline-block' }} />
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '16px', color: '#334155' }}>No leaves or permissions found.</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Click "{isSoleOperator ? 'Record Time-Off' : 'Apply Leave / Permission'}" to create a new entry.</p>
                  </td>
                </tr>
              ) : paginatedLeaves.map((leave, index) => {
                const isPermission = leave.category === 'Permission';
                const canModify = !isEmployee || leave.status === 'Pending';

                return (
                  <tr key={leave._id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
                      {startIndex + index + 1}
                    </td>

                    {/* Employee column */}
                    <td style={{ padding: '16px 20px', color: '#0F172A' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px' }}>{leave.employeeId?.name || 'Unknown Staff'}</span>
                        {leave.employeeId?.employeeId && (
                          <span style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '11px', fontWeight: '700', padding: '1px 6px', borderRadius: '4px', border: '1px solid #BFDBFE' }}>
                            {leave.employeeId.employeeId}
                          </span>
                        )}
                      </div>
                      {(leave.employeeId?.branchName || leave.employeeId?.branchId?.name) && (
                        <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                          <Store size={12} color="#94A3B8" /> {leave.employeeId?.branchName || leave.employeeId?.branchId?.name}
                        </div>
                      )}
                    </td>

                    {/* Category & Type */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        {isPermission ? (
                          <span style={{ background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Timer size={12} /> PERMISSION
                          </span>
                        ) : (
                          <span style={{ background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CalendarIcon size={12} /> LEAVE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                        {leave.type}
                      </div>
                    </td>

                    {/* Schedule / Dates */}
                    <td style={{ padding: '16px 20px' }}>
                      {isPermission ? (
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '13px', color: '#0F172A' }}>
                            {formatDate(leave.startDate)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#7C3AED', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Clock size={12} /> {leave.timeFrom || '--'} - {leave.timeTo || '--'} 
                            {leave.durationHours ? ` (${leave.durationHours})` : ''}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '13px', color: '#0F172A' }}>
                            {formatDate(leave.startDate)} <span style={{ color: '#94A3B8', fontWeight: '400' }}>to</span> {formatDate(leave.endDate)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                            {leave.startDate && leave.endDate && Math.max(1, Math.round((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1)} Day(s)
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Reason & Review Note */}
                    <td style={{ padding: '16px 20px', maxWidth: '240px' }}>
                      <div style={{ fontSize: '13px', color: '#334155', fontWeight: '500', wordBreak: 'break-word' }}>
                        {leave.reason || <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>No reason stated</span>}
                      </div>
                      {leave.reviewNote && (
                        <div style={{ marginTop: '6px', padding: '6px 10px', background: leave.status === 'Approved' ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${leave.status === 'Approved' ? '#DCFCE7' : '#FEE2E2'}`, borderRadius: '6px', fontSize: '12px', color: leave.status === 'Approved' ? '#166534' : '#991B1B' }}>
                          <span style={{ fontWeight: '700' }}>Review note:</span> "{leave.reviewNote}"
                          {leave.reviewedBy && <span style={{ display: 'block', fontSize: '11px', opacity: 0.85, marginTop: '2px' }}>— {leave.reviewedBy}</span>}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 20px' }}>
                      {isSoleOperator ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', background: '#DCFCE7', color: '#166534' }}>
                          <CheckCircle2 size={13} /> Recorded
                        </span>
                      ) : (
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '5px', 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          fontSize: '12px', 
                          fontWeight: '700', 
                          background: leave.status === 'Approved' ? '#DCFCE7' : leave.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7', 
                          color: leave.status === 'Approved' ? '#166534' : leave.status === 'Rejected' ? '#991B1B' : '#92400E' 
                        }}>
                          {leave.status === 'Approved' && <CheckCircle2 size={13} />}
                          {leave.status === 'Rejected' && <XCircle size={13} />}
                          {leave.status === 'Pending' && <Clock size={13} />}
                          {leave.status}
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', alignItems: 'center' }}>
                        {/* Owner / Manager Review Actions (Type 2, 3, 4 only) */}
                        {canReview && leave.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => handleOpenReview(leave, 'Approved')} 
                              title="Approve Request"
                              style={{ background: '#DCFCE7', color: '#166534', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button 
                              onClick={() => handleOpenReview(leave, 'Rejected')} 
                              title="Reject Request"
                              style={{ background: '#FEE2E2', color: '#991B1B', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </>
                        )}

                        {/* Edit Button */}
                        {canModify ? (
                          <button 
                            title="Edit" 
                            onClick={() => handleEdit(leave)} 
                            style={{ background: '#EFF6FF', border: 'none', color: '#2563EB', cursor: 'pointer', padding: '7px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Pencil size={15} />
                          </button>
                        ) : (
                          <span title="Reviewed - edits locked" style={{ padding: '7px', color: '#94A3B8', display: 'inline-flex' }}>
                            <Pencil size={15} style={{ opacity: 0.3 }} />
                          </span>
                        )}

                        {/* Delete Button */}
                        {canModify ? (
                          <button 
                            title="Delete" 
                            onClick={() => handleDeleteClick(leave)} 
                            style={{ background: '#FEE2E2', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '7px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        ) : (
                          <span title="Reviewed - deletion locked" style={{ padding: '7px', color: '#94A3B8', display: 'inline-flex' }}>
                            <Trash2 size={15} style={{ opacity: 0.3 }} />
                          </span>
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
          totalItems={filteredLeaves.length}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          itemName="records"
        />
      </div>

      {/* MODAL 1: ADD / EDIT LEAVE OR PERMISSION */}
      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '20px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)', maxHeight: '92vh', overflowY: 'auto' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
                  {editingLeave 
                    ? `Edit ${formData.category}` 
                    : isSoleOperator 
                    ? `Record Employee Time-Off` 
                    : isEmployee 
                    ? `Apply for ${formData.category}` 
                    : `Log Employee ${formData.category}`}
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  {formData.category === 'Leave' 
                    ? 'Full day or multi-day time off request.' 
                    : 'Short hourly permission during business hours.'}
                </p>
              </div>
              <button 
                onClick={() => { setShowModal(false); setEditingLeave(null); }} 
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Category Segmented Control Toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '4px', background: '#F1F5F9', borderRadius: '12px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, category: 'Leave', type: LEAVE_TYPES[0], customType: '' })}
                style={{
                  padding: '10px 14px',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                  background: formData.category === 'Leave' ? 'white' : 'transparent',
                  color: formData.category === 'Leave' ? '#2563EB' : '#64748B',
                  boxShadow: formData.category === 'Leave' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                <CalendarIcon size={16} /> Leave (Days Off)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, category: 'Permission', type: PERMISSION_TYPES[0], customType: '' })}
                style={{
                  padding: '10px 14px',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                  background: formData.category === 'Permission' ? 'white' : 'transparent',
                  color: formData.category === 'Permission' ? '#7C3AED' : '#64748B',
                  boxShadow: formData.category === 'Permission' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                <Timer size={16} /> Permission (Hourly)
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Employee Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Employee
                </label>
                {isEmployee ? (
                  /* Readonly identity for logged-in employee */
                  <div style={{ padding: '10px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '700', color: '#0F172A', fontSize: '14px' }}>
                      {currentEmployeeInfo?.name || 'Current Employee'}
                    </span>
                    <span style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px' }}>
                      Logged-in Identity
                    </span>
                  </div>
                ) : (
                  /* Dropdown for Owner / Manager */
                  <select 
                    required 
                    value={formData.employeeId} 
                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })} 
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                  >
                    <option value="">Select Employee...</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} {emp.employeeId ? `[${emp.employeeId}]` : ''} {emp.branchName ? `(${emp.branchName})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Type Dropdown (Leave Types vs Permission Types) */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  {formData.category === 'Leave' ? 'Leave Type' : 'Permission Type'} *
                </label>
                <select 
                  value={formData.type} 
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      type: val,
                      customType: (val !== 'Other' && val !== 'Other Leave' && val !== 'Other Permission') ? '' : prev.customType
                    }));
                  }} 
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', background: 'white' }}
                >
                  {formData.category === 'Leave' ? (
                    LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)
                  ) : (
                    PERMISSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)
                  )}
                </select>

                {/* If Type is "Other", provide input to mention what it is */}
                {(formData.type === 'Other' || formData.type === 'Other Leave' || formData.type === 'Other Permission') && (
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2563EB', marginBottom: '5px' }}>
                      Specify {formData.category === 'Leave' ? 'Leave' : 'Permission'} Type *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={formData.category === 'Leave' ? "Please mention what leave it is (e.g. Marriage Leave, Exam Leave)" : "Please mention what permission it is (e.g. Passport Office, Bank Visit)"}
                      value={formData.customType}
                      onChange={e => setFormData({ ...formData, customType: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #2563EB',
                        background: '#EFF6FF',
                        fontSize: '14px',
                        color: '#0F172A',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Conditional Date / Time Fields */}
              {formData.category === 'Leave' ? (
                /* LEAVE: Start Date to End Date */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Start Date</label>
                    <input 
                      type="date" 
                      required 
                      value={formData.startDate} 
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })} 
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>End Date</label>
                    <input 
                      type="date" 
                      required 
                      value={formData.endDate} 
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })} 
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>
              ) : (
                /* PERMISSION: Single Date + From / To Time */
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Permission Date</label>
                    <input 
                      type="date" 
                      required 
                      value={formData.startDate} 
                      onChange={e => setFormData({ ...formData, startDate: e.target.value, endDate: e.target.value })} 
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Time From</label>
                      <input 
                        type="time" 
                        required 
                        value={formData.timeFrom} 
                        onChange={e => handleTimeChange('timeFrom', e.target.value)} 
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Time To</label>
                      <input 
                        type="time" 
                        required 
                        value={formData.timeTo} 
                        onChange={e => handleTimeChange('timeTo', e.target.value)} 
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} 
                      />
                    </div>
                  </div>

                  {/* Quick Duration Badges */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155', margin: 0 }}>Duration</label>
                      <span style={{ fontSize: '12px', color: '#7C3AED', fontWeight: '700' }}>
                        {formData.durationHours ? `Estimated: ${formData.durationHours}` : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {['1 hr', '2 hrs', '3 hrs', 'Half Day (4 hrs)'].map(dur => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setFormData({ ...formData, durationHours: dur })}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: formData.durationHours === dur ? '1px solid #7C3AED' : '1px solid #E2E8F0',
                            background: formData.durationHours === dur ? '#F5F3FF' : '#F8FAFC',
                            color: formData.durationHours === dur ? '#7C3AED' : '#64748B',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          {dur}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Reason Field */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Reason / Purpose</label>
                <textarea 
                  placeholder={formData.category === 'Leave' ? "Reason for taking time off..." : "Purpose of short permission (e.g. medical appointment, bank visit)..."} 
                  rows="3" 
                  value={formData.reason} 
                  onChange={e => setFormData({ ...formData, reason: e.target.value })} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} 
                />
              </div>

              {/* Workflow notice banner */}
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: isSoleOperator ? '#F0FDF4' : isEmployee ? '#EFF6FF' : '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} color={isSoleOperator ? '#16A34A' : '#2563EB'} style={{ flexShrink: 0 }} />
                <span>
                  {isSoleOperator 
                    ? 'Type 1 Sole Operator: Directly recorded as Approved without requiring a secondary review.' 
                    : isEmployee 
                    ? 'Your request will be submitted with "Pending" status and forwarded to your manager/owner for review.'
                    : 'As owner/manager, requests you log are recorded as Approved directly.'}
                </span>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                style={{ 
                  width: '100%', 
                  padding: '13px', 
                  background: formData.category === 'Permission' ? '#7C3AED' : '#2563EB', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '10px', 
                  fontWeight: '700', 
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              >
                {editingLeave 
                  ? 'Update Record' 
                  : isSoleOperator 
                  ? `Record ${formData.category}` 
                  : isEmployee 
                  ? `Submit ${formData.category} Request` 
                  : `Save & Approve ${formData.category}`}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: FORMAL REVIEW MODAL (FOR TYPE 2, 3, 4 OWNERS/MANAGERS) */}
      {reviewModal.isOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '20px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: '10px', 
                background: reviewModal.action === 'Approved' ? '#DCFCE7' : '#FEE2E2', 
                color: reviewModal.action === 'Approved' ? '#166534' : '#991B1B', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0 
              }}>
                {reviewModal.action === 'Approved' ? <CheckCircle2 size={24} /> : <ShieldAlert size={24} />}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
                  {reviewModal.action === 'Approved' ? 'Approve Request' : 'Reject Request'}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  {reviewModal.leave?.employeeId?.name || 'Staff'} • {reviewModal.leave?.category || 'Leave'} ({reviewModal.leave?.type})
                </p>
              </div>
            </div>

            {/* Request Summary */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748B' }}>Schedule:</span>
                <span style={{ fontWeight: '600', color: '#0F172A' }}>
                  {reviewModal.leave?.category === 'Permission'
                    ? `${formatDate(reviewModal.leave?.startDate)} (${reviewModal.leave?.timeFrom || ''} - ${reviewModal.leave?.timeTo || ''})`
                    : `${formatDate(reviewModal.leave?.startDate)} to ${formatDate(reviewModal.leave?.endDate)}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Reason:</span>
                <span style={{ fontWeight: '600', color: '#334155', textAlign: 'right', maxWidth: '240px' }}>
                  {reviewModal.leave?.reason || 'No reason provided'}
                </span>
              </div>
            </div>

            {/* Review Remarks Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Review Remarks / Manager Notes <span style={{ fontWeight: '400', color: '#94A3B8' }}>(Optional)</span>
              </label>
              <textarea 
                rows="3" 
                placeholder={reviewModal.action === 'Approved' ? "e.g. Approved. Please ensure tasks are handed over..." : "e.g. Rejected due to critical shift coverage..."}
                value={reviewModal.note} 
                onChange={e => setReviewModal({ ...reviewModal, note: e.target.value })} 
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setReviewModal({ isOpen: false, leave: null, action: 'Approved', note: '' })} 
                style={{ flex: 1, padding: '11px', background: '#F1F5F9', border: 'none', borderRadius: '10px', color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleConfirmReview} 
                style={{ 
                  flex: 1, 
                  padding: '11px', 
                  background: reviewModal.action === 'Approved' ? '#16A34A' : '#DC2626', 
                  border: 'none', 
                  borderRadius: '10px', 
                  color: 'white', 
                  fontWeight: '700', 
                  cursor: 'pointer', 
                  fontSize: '14px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              >
                Confirm {reviewModal.action}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: DELETE CONFIRMATION MODAL */}
      {deleteConfirmLeave && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px 28px', borderRadius: '20px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out', textAlign: 'center', boxSizing: 'border-box' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px auto' }}>
              <Trash2 size={26} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', margin: '0 0 10px 0' }}>Delete Request</h2>
            <p style={{ color: '#64748B', margin: '0 0 24px 0', fontSize: '14px', lineHeight: '1.5' }}>
              Are you sure you want to delete this {deleteConfirmLeave.category || 'leave'} request for <strong>{deleteConfirmLeave.employeeId?.name || 'Staff'}</strong>? This action cannot be undone.
            </p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                onClick={() => setDeleteConfirmLeave(null)} 
                style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} 
                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleConfirmDelete} 
                style={{ flex: 1, padding: '12px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 6px -1px rgba(220,38,38,0.25)' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#B91C1C'} 
                onMouseOut={(e) => e.currentTarget.style.background = '#DC2626'}
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

export default LeaveRequests;
