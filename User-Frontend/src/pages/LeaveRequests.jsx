import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, Plus, X, Trash2, Check, XCircle } from 'lucide-react';

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ employeeId: '', type: 'Annual Leave', startDate: '', endDate: '', reason: '' });

  const fetchData = async () => {
    try {
      const [leaveRes, empRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/leaves`),
        fetch(`${import.meta.env.VITE_API_URL}/api/employees`)
      ]);
      if (leaveRes.ok) setLeaves(await leaveRes.json());
      if (empRes.ok) setEmployees(await empRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
      } else {
        alert('Failed to log leave request');
      }
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leaves/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CalendarIcon size={28} color="#2563EB" /> Leave Requests
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>Review and manage employee time off.</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}>
          <Plus size={18} /> New Request
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '60px' }}>S.No</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Employee</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Type & Dates</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Reason</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>Loading...</td></tr>
            ) : leaves.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '64px 32px', textAlign: 'center', color: '#64748B' }}>No leave requests found.</td></tr>
            ) : leaves.map((leave, index) => (
              <tr key={leave._id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '16px 24px', fontSize: '15px', color: '#475569', fontWeight: '500' }}>{index + 1}</td>
                <td style={{ padding: '16px 24px', color: '#0F172A', fontWeight: '600' }}>{leave.employeeId?.name || 'Unknown'}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: '500', color: '#0F172A' }}>{leave.type}</div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}</div>
                </td>
                <td style={{ padding: '16px 24px', color: '#64748B', fontSize: '14px', maxWidth: '200px' }}>{leave.reason || 'No reason provided'}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: leave.status === 'Approved' ? '#DCFCE7' : leave.status === 'Rejected' ? '#FEE2E2' : '#F1F5F9', color: leave.status === 'Approved' ? '#166534' : leave.status === 'Rejected' ? '#991B1B' : '#475569' }}>
                    {leave.status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  {leave.status === 'Pending' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => updateStatus(leave._id, 'Approved')} style={{ background: '#DCFCE7', color: '#166534', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}><Check size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Approve</button>
                      <button onClick={() => updateStatus(leave._id, 'Rejected')} style={{ background: '#FEE2E2', color: '#991B1B', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}><XCircle size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', margin: 0 }}>Log Leave Request</h2>
              <button onClick={() => setShowModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Employee</label>
                <select required value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                  <option value="">Select Employee</option>
                  {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Leave Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Start Date</label>
                  <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>End Date</label>
                  <input type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Reason</label>
                <textarea placeholder="Enter reason" rows="3" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} placeholder="Why is the leave requested?"></textarea>
              </div>
              <button type="submit" style={{ width: '100%', padding: '14px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', marginTop: '16px', cursor: 'pointer' }}>Submit Request</button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
export default LeaveRequests;
