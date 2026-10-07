import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Users, Mail, Briefcase, Store, X, Eye, Trash2, AlertTriangle, UserPlus, Phone, DollarSign, Calendar, Activity } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState(null);
  
  const tenantType = Number(localStorage.getItem('tenantType')) || 1;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    contactNumber: '',
    salary: '',
    dateOfJoining: '',
    status: 'Active',
    branchId: ''
  });

  const fetchData = async () => {
    try {
      const [empRes, branchRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/employees`),
        tenantType === 3 ? fetch(`${import.meta.env.VITE_API_URL}/api/branches`) : Promise.resolve(null)
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
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', email: '', position: '', contactNumber: '', salary: '', dateOfJoining: '', status: 'Active', branchId: '' });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add employee');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteEmployeeId) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/employees/${deleteEmployeeId}`, {
        method: 'DELETE',
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

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={28} color="#2563EB" /> Employees Management
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
            Manage your staff, assign roles, and track employee details.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}
        >
          <Plus size={18} /> Add New Employee
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '60px' }}>S.No</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Position</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                {tenantType === 3 && (
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Branch</th>
                )}
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={tenantType === 3 ? "6" : "5"} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>Loading employees...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={tenantType === 3 ? "6" : "5"} style={{ padding: '64px 32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <UserPlus size={32} color="#3B82F6" />
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>No employees found</h3>
                      <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
                        You haven't added any employees yet. Click the button above to add your first employee.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((employee, index) => (
                  <tr key={employee._id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '16px 24px', fontSize: '15px', color: '#475569', fontWeight: '500' }}>
                      {index + 1}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '14px' }}>
                        <Briefcase size={16} color="#94A3B8" /> {employee.position}
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
                    {tenantType === 3 && (
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
      </div>

      {/* Add Employee Modal */}
      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Add New Employee</h2>
              <button onClick={() => setShowModal(false)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Full Name</label>
                  <input placeholder="Enter name" 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="Enter Employee Name"
                    required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Email Address</label>
                  <input placeholder="Enter email" 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    placeholder="Enter Email Address"
                    required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Position / Role</label>
                  <input placeholder="Enter position" 
                    type="text" 
                    value={formData.position} 
                    onChange={e => setFormData({...formData, position: e.target.value})} 
                    placeholder="Enter employee role"
                    required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Contact Number</label>
                  <input placeholder="Enter contact number" 
                    type="text" 
                    value={formData.contactNumber} 
                    onChange={e => setFormData({...formData, contactNumber: e.target.value})} 
                    placeholder="Enter Contact Number"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Salary ($)</label>
                  <input placeholder="Enter salary" 
                    type="number" 
                    value={formData.salary} 
                    onChange={e => setFormData({...formData, salary: e.target.value})} 
                    placeholder="e.g. 50000"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Date of Joining</label>
                  <input 
                    type="date" 
                    value={formData.dateOfJoining} 
                    onChange={e => setFormData({...formData, dateOfJoining: e.target.value})} 
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Status</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})} 
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box', background: 'white' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
                {tenantType === 3 && (
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Assign to Branch</label>
                    <select 
                      value={formData.branchId} 
                      onChange={e => setFormData({...formData, branchId: e.target.value})} 
                      required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box', background: 'white' }}
                    >
                      <option value="">-- Select a Branch --</option>
                      {branches.map(branch => (
                        <option key={branch._id} value={branch._id}>{branch.name} - {branch.location}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 1, padding: '14px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }} onMouseOver={(e) => e.currentTarget.style.background = '#1D4ED8'} onMouseOut={(e) => e.currentTarget.style.background = '#2563EB'}>
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* View Employee Modal */}
      {viewEmployee && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}><Users size={24} color="#2563EB" /> Employee Details</h2>
              <button onClick={() => setViewEmployee(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Full Name</p>
                  <p style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '600' }}>{viewEmployee.name}</p>
                </div>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Email Address</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '500' }}>
                    <Mail size={16} color="#64748B" /> {viewEmployee.email}
                  </div>
                </div>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Position</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '500' }}>
                    <Briefcase size={16} color="#64748B" /> {viewEmployee.position}
                  </div>
                </div>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Contact Number</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '500' }}>
                    <Phone size={16} color="#64748B" /> {viewEmployee.contactNumber || 'N/A'}
                  </div>
                </div>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Salary</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '500' }}>
                    <DollarSign size={16} color="#64748B" /> {viewEmployee.salary ? `$${viewEmployee.salary}` : 'N/A'}
                  </div>
                </div>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Date of Joining</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '500' }}>
                    <Calendar size={16} color="#64748B" /> {viewEmployee.dateOfJoining ? new Date(viewEmployee.dateOfJoining).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Status</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '500' }}>
                    <Activity size={16} color="#64748B" /> {viewEmployee.status || 'Active'}
                  </div>
                </div>
                {tenantType === 3 && (
                  <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Assigned Branch</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '500' }}>
                      <Store size={16} color="#64748B" /> {viewEmployee.branchId ? viewEmployee.branchId.name : 'Unassigned'}
                    </div>
                  </div>
                )}
              </div>
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button type="button" onClick={() => setViewEmployee(null)} style={{ flex: 1, padding: '14px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }} onMouseOver={(e) => e.currentTarget.style.background = '#1D4ED8'} onMouseOut={(e) => e.currentTarget.style.background = '#2563EB'}>
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
