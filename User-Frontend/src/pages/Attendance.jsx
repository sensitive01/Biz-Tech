import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock, Plus, X, Trash2, LogOut } from 'lucide-react';

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [deleteRecordId, setDeleteRecordId] = useState(null);
  const [formData, setFormData] = useState({ employeeId: '', date: new Date().toISOString().split('T')[0], status: 'Present', checkIn: '09:00' });

  const fetchData = async () => {
    try {
      const [attRes, empRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/attendance`),
        fetch(`${import.meta.env.VITE_API_URL}/api/employees`)
      ]);
      if (attRes.ok) setRecords(await attRes.json());
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
      } else {
        alert('Failed to mark attendance');
      }
    } catch (err) { console.error(err); }
  };

  const confirmDelete = async () => {
    if (!deleteRecordId) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/attendance/${deleteRecordId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteRecordId(null);
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const confirmCheckOut = async (e) => {
    e.preventDefault();
    if (!checkoutData) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/attendance/${checkoutData.id}/checkout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkOut: checkoutData.time })
      });
      if (res.ok) {
        setCheckoutData(null);
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Clock size={28} color="#2563EB" /> Attendance Log
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>Track daily employee attendance and work hours.</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}>
          <Plus size={18} /> Mark Attendance
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '60px' }}>S.No</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Employee</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Check In</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Check Out</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '64px 32px', textAlign: 'center', color: '#64748B' }}>No attendance records found.</td></tr>
            ) : records.map((record, index) => (
              <tr key={record._id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '16px 24px', fontSize: '15px', color: '#475569', fontWeight: '500' }}>{index + 1}</td>
                <td style={{ padding: '16px 24px', color: '#0F172A', fontWeight: '500' }}>{new Date(record.date).toLocaleDateString()}</td>
                <td style={{ padding: '16px 24px', color: '#0F172A', fontWeight: '500' }}>{record.employeeId?.name || 'Unknown'}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: record.status === 'Present' ? '#DCFCE7' : record.status === 'Absent' ? '#FEE2E2' : record.status === 'Late' ? '#FFEDD5' : '#FEF9C3', color: record.status === 'Present' ? '#166534' : record.status === 'Absent' ? '#991B1B' : record.status === 'Late' ? '#9A3412' : '#854D0E' }}>
                    {record.status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', color: '#64748B' }}>{record.checkIn || '-'}</td>
                <td style={{ padding: '16px 24px', color: '#64748B' }}>{record.checkOut || '-'}</td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  {!record.checkOut && (
                    <button onClick={() => setCheckoutData({ id: record._id, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) })} title="Check Out" style={{ background: '#EFF6FF', color: '#2563EB', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px' }}><LogOut size={16} /></button>
                  )}
                  <button onClick={() => setDeleteRecordId(record._id)} title="Delete" style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={16} /></button>
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
              <h2 style={{ fontSize: '22px', margin: 0 }}>Mark Attendance</h2>
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
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Date</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Half Day">Half Day</option>
                    <option value="Late">Late</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Check In</label>
                  <input type="time" value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                </div>
              </div>
              <button type="submit" style={{ width: '100%', padding: '14px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', marginTop: '16px', cursor: 'pointer' }}>Save Record</button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {checkoutData && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '20px', margin: '0 0 16px 0' }}>Confirm Check Out</h2>
            <form onSubmit={confirmCheckOut}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Check Out Time</label>
              <input type="time" required value={checkoutData.time} onChange={e => setCheckoutData({...checkoutData, time: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', marginBottom: '24px' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setCheckoutData(null)} style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Confirm</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {deleteRecordId && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <Trash2 size={24} color="#EF4444" />
            </div>
            <h2 style={{ fontSize: '20px', margin: '0 0 8px 0' }}>Delete Record</h2>
            <p style={{ color: '#64748B', fontSize: '14px', margin: '0 0 24px 0' }}>Are you sure you want to delete this attendance record? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteRecordId(null)} style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
export default Attendance;
