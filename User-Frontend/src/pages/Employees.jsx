import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Users, Mail, Briefcase, Store, X, Eye, Pencil, Trash2, AlertTriangle, UserPlus, Phone, IndianRupee, Calendar, Activity, Search, Download, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { exportToCSV } from '../utils/exportToCSV';
import TablePagination from '../components/TablePagination';

const DESIGNATION_OPTIONS = [
  'Store Manager',
  'Branch Manager',
  'Assistant Manager',
  'Shift Supervisor',
  'Sales Executive',
  'Cashier',
  'Accountant',
  'Inventory Specialist',
  'Customer Support',
  'Technician',
  'Delivery Executive',
  'Security Guard',
  'General Staff',
  'Other'
];

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDays, setFilterDays] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState(null);

  const tenantType = Number(localStorage.getItem('tenantType')) || 1;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: '',
    customDesignation: '',
    position: '',
    contactNumber: '',
    salary: '',
    dateOfJoining: '',
    status: 'Active',
    branchId: ''
  });

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      email: '',
      designation: '',
      customDesignation: '',
      position: '',
      contactNumber: '',
      salary: '',
      dateOfJoining: '',
      status: 'Active',
      branchId: ''
    });
    setShowModal(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    const hasStandardDesignation = DESIGNATION_OPTIONS.includes(employee.designation);
    const isOther = employee.designation && !hasStandardDesignation;
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      designation: isOther ? 'Other' : (employee.designation || employee.position || ''),
      customDesignation: isOther ? employee.designation : '',
      position: employee.position || employee.designation || '',
      contactNumber: employee.contactNumber || '',
      salary: employee.salary !== undefined ? employee.salary : '',
      dateOfJoining: employee.dateOfJoining ? employee.dateOfJoining.substring(0, 10) : '',
      status: employee.status || 'Active',
      branchId: employee.branchId?._id || employee.branchId || ''
    });
    setShowModal(true);
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const [empRes, branchRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/employees`, { headers }),
        (tenantType === 3 || tenantType === 4) ? fetch(`${import.meta.env.VITE_API_URL}/api/branches`, { headers }) : Promise.resolve(null)
      ]);

      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData);
      }

      if (branchRes && branchRes.ok) {
        const branchData = await branchRes.json();
        setBranches(branchData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.contactNumber && formData.contactNumber.length !== 10) {
      alert('Contact number must be exactly 10 digits.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const url = editingEmployee
        ? `${import.meta.env.VITE_API_URL}/api/employees/${editingEmployee._id}`
        : `${import.meta.env.VITE_API_URL}/api/employees`;
      const method = editingEmployee ? 'PUT' : 'POST';

      const finalDesignation = formData.designation === 'Other'
        ? (formData.customDesignation?.trim() || 'Other')
        : (formData.designation?.trim() || formData.position?.trim() || '');

      const finalPosition = formData.position?.trim() || finalDesignation || 'Staff';

      const payload = {
        ...formData,
        status: editingEmployee ? (formData.status || 'Active') : 'Active',
        designation: finalDesignation,
        position: finalPosition
      };
      delete payload.customDesignation;

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
        setEditingEmployee(null);
        setFormData({
          name: '',
          email: '',
          designation: '',
          customDesignation: '',
          position: '',
          contactNumber: '',
          salary: '',
          dateOfJoining: '',
          status: 'Active',
          branchId: ''
        });
        fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || (editingEmployee ? 'Failed to update employee' : 'Failed to add employee'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteEmployeeId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/employees/${deleteEmployeeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setDeleteEmployeeId(null);
        fetchData();
      } else {
        alert('Failed to delete employee');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting the employee');
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

  const filteredEmployees = employees
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
    .filter(i =>
      (i.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.designation || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.position || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      let aVal = a[sortConfig.key] || '';
      let bVal = b[sortConfig.key] || '';

      if (sortConfig.key === 'designation') {
        aVal = a.designation || a.position || '';
        bVal = b.designation || b.position || '';
      }

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterDays, customStartDate, customEndDate, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={28} color="#2563EB" /> Employees Management
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
            Manage your staff, assign designations, and track employee details.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}
        >
          <Plus size={18} /> Add New Employee
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={24} /></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Employees</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{employees.length}</h3>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Store size={24} /></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Assigned Branches</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{new Set(employees.map(e => e.branchId?._id || e.branchId).filter(Boolean)).size}</h3>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={24} /></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Designations</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{new Set(employees.map(e => e.designation).filter(Boolean)).size}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ flex: '0 1 300px', minWidth: '250px', position: 'relative' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" placeholder="Search by name, designation, email..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} />
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
          <button onClick={() => exportToCSV(filteredEmployees, 'Employees')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#475569', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}><Download size={16} /> Export</button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '60px' }}>S.No</th>
                <th onClick={() => requestSort('name')} style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}><div style={{ display: 'flex', alignItems: 'center' }}>Name {renderSortIcon('name')}</div></th>
                <th onClick={() => requestSort('designation')} style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}><div style={{ display: 'flex', alignItems: 'center' }}>Designation {renderSortIcon('designation')}</div></th>
                <th onClick={() => requestSort('status')} style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}><div style={{ display: 'flex', alignItems: 'center' }}>Status {renderSortIcon('status')}</div></th>
                {(tenantType === 3 || tenantType === 4) && (
                  <th onClick={() => requestSort('branch')} style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}><div style={{ display: 'flex', alignItems: 'center' }}>Branch {renderSortIcon('branch')}</div></th>
                )}
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={(tenantType === 3 || tenantType === 4) ? "6" : "5"} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>Loading employees...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={(tenantType === 3 || tenantType === 4) ? "6" : "5"} style={{ padding: '64px 32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <Users size={32} color="#3B82F6" />
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>No employees found</h3>
                      <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
                        No employees match your filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((employee, index) => (
                  <tr key={employee._id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '16px 24px', fontSize: '15px', color: '#475569', fontWeight: '500' }}>
                      {startIndex + index + 1}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>{employee.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B', fontSize: '13px' }}>
                          <Mail size={14} /> {employee.email}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontSize: '14px', fontWeight: '600' }}>
                          <Briefcase size={15} color="#2563EB" />
                          <span>{employee.designation || employee.position || 'Staff'}</span>
                        </div>
                        {employee.position && employee.designation && employee.position !== employee.designation && (
                          <span style={{ fontSize: '12px', color: '#64748B', paddingLeft: '23px' }}>Role: {employee.position}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                        background: employee.status === 'Active' ? '#DCFCE7' : employee.status === 'On Leave' ? '#FEF9C3' : '#FEE2E2',
                        color: employee.status === 'Active' ? '#166534' : employee.status === 'On Leave' ? '#854D0E' : '#991B1B'
                      }}>
                        {employee.status || 'Active'}
                      </span>
                    </td>
                    {(tenantType === 3 || tenantType === 4) && (
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '14px' }}>
                          <Store size={16} color="#94A3B8" /> {employee.branchId ? employee.branchId.name : 'Unassigned'}
                        </div>
                      </td>
                    )}
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => setViewEmployee(employee)}
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#EFF6FF', color: '#3B82F6', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }}
                          title="View Employee"
                          onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'}
                          onMouseOut={(e) => e.currentTarget.style.background = '#EFF6FF'}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(employee)}
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }}
                          title="Edit Employee"
                          onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'}
                          onMouseOut={(e) => e.currentTarget.style.background = '#EFF6FF'}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteEmployeeId(employee._id)}
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }}
                          title="Delete Employee"
                          onMouseOver={(e) => e.currentTarget.style.background = '#FECACA'}
                          onMouseOut={(e) => e.currentTarget.style.background = '#FEE2E2'}
                        >
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

        <TablePagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalItems={filteredEmployees.length}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          itemName="employees"
        />
      </div>

      {/* Add / Edit Employee Modal */}
      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', padding: '24px 28px', borderRadius: '18px', width: '100%', maxWidth: '620px', maxHeight: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <Users size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: '700', color: '#0F172A', margin: 0 }}>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                    {editingEmployee ? 'Update employee designation and profile' : 'Register employee profile and designation'}
                  </p>
                </div>
              </div>
              <button onClick={() => { setShowModal(false); setEditingEmployee(null); }} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter Employee Name"
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter Email Address"
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>Designation *</label>
                  <select
                    value={formData.designation}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        designation: val,
                        position: prev.position || (val !== 'Other' ? val : '')
                      }));
                    }}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box', background: 'white' }}
                  >
                    <option value="">-- Select Designation --</option>
                    {DESIGNATION_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {formData.designation === 'Other' && (
                    <input
                      type="text"
                      placeholder="Enter custom designation"
                      value={formData.customDesignation}
                      onChange={e => setFormData({ ...formData, customDesignation: e.target.value })}
                      required
                      style={{ width: '100%', padding: '9px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', color: '#0F172A', boxSizing: 'border-box', marginTop: '6px' }}
                    />
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>Position / Role</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g. Lead Cashier / Sales"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>Contact Number</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={formData.contactNumber}
                    onChange={e => {
                      const numericVal = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, contactNumber: numericVal });
                    }}
                    placeholder="Enter 10-digit number"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }}
                  />
                  {formData.contactNumber && formData.contactNumber.length > 0 && formData.contactNumber.length < 10 && (
                    <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                      Please enter a full 10-digit number
                    </span>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={e => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="e.g. 50000"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>Date of Joining</label>
                  <input
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={e => setFormData({ ...formData, dateOfJoining: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' }}
                  />
                </div>
                {editingEmployee && (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box', background: 'white' }}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                )}
                {(tenantType === 3 || tenantType === 4) && (
                  <div style={{ gridColumn: editingEmployee ? '1 / span 2' : 'auto' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>Assign to Branch *</label>
                    <select
                      value={formData.branchId}
                      onChange={e => setFormData({ ...formData, branchId: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box', background: 'white' }}
                    >
                      <option value="">-- Select a Branch --</option>
                      {branches.map(branch => (
                        <option key={branch._id} value={branch._id}>{branch.name} - {branch.location}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #F1F5F9' }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingEmployee(null); }} style={{ padding: '9px 18px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '9px 24px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }} onMouseOver={(e) => e.currentTarget.style.background = '#1D4ED8'} onMouseOut={(e) => e.currentTarget.style.background = '#2563EB'}>
                  {editingEmployee ? 'Update Employee' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* View Employee Modal */}
      {viewEmployee && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', padding: '24px 28px', borderRadius: '18px', width: '100%', maxWidth: '580px', maxHeight: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <Users size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Employee Details</h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>Profile & assignment information</p>
                </div>
              </div>
              <button onClick={() => setViewEmployee(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#0F172A', fontWeight: '600' }}>{viewEmployee.name}</p>
              </div>
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: '500' }}>
                  <Mail size={15} color="#64748B" /> {viewEmployee.email}
                </div>
              </div>
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Designation</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0, fontSize: '15px', color: '#0F172A', fontWeight: '600' }}>
                  <Briefcase size={15} color="#2563EB" /> {viewEmployee.designation || viewEmployee.position || 'Staff'}
                </div>
              </div>
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Position / Role</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: '500' }}>{viewEmployee.position || viewEmployee.designation || 'N/A'}</p>
              </div>
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Number</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: '500' }}>
                  <Phone size={15} color="#64748B" /> {viewEmployee.contactNumber || 'N/A'}
                </div>
              </div>
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Salary</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: '500' }}>
                  <IndianRupee size={15} color="#64748B" /> {viewEmployee.salary ? `₹${Number(viewEmployee.salary).toLocaleString()}` : 'N/A'}
                </div>
              </div>
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date of Joining</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: '500' }}>
                  <Calendar size={15} color="#64748B" /> {viewEmployee.dateOfJoining ? new Date(viewEmployee.dateOfJoining).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: '500' }}>
                  <Activity size={15} color="#64748B" /> {viewEmployee.status || 'Active'}
                </div>
              </div>
              {(tenantType === 3 || tenantType === 4) && (
                <div style={{ gridColumn: '1 / span 2', padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Branch</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: '500' }}>
                    <Store size={15} color="#2563EB" /> {viewEmployee.branchId ? (viewEmployee.branchId.name || viewEmployee.branchId) : 'Unassigned'}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #F1F5F9', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => {
                  const target = viewEmployee;
                  setViewEmployee(null);
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
                onClick={() => setViewEmployee(null)}
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
      {deleteEmployeeId && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <AlertTriangle size={32} color="#EF4444" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: '0 0 12px 0' }}>Delete Employee</h2>
            <p style={{ color: '#64748B', margin: '0 0 24px 0', lineHeight: '1.5' }}>Are you sure you want to delete this employee? This action cannot be undone.</p>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button type="button" onClick={() => setDeleteEmployeeId(null)} style={{ flex: 1, padding: '14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
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

export default Employees;