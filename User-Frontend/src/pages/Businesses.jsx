import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Building2, Plus, Phone, X, Eye, Trash2, AlertTriangle, Search, Filter, ArrowUpDown, Download } from 'lucide-react';

const Businesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewBusiness, setViewBusiness] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({ name: '', regNo: '', phone: '', address: '' });

  const fetchBusinesses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/businesses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/businesses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', regNo: '', phone: '', address: '' });
        fetchBusinesses();
      } else {
        alert('Failed to add business');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/businesses/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteId(null);
        fetchBusinesses();
      } else {
        alert('Failed to delete business');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBusinesses = businesses.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Building2 size={28} color="var(--primary-blue)" /> Businesses Management
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
            Manage your multiple business entities, registration numbers, and core contact details.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'var(--primary-blue)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}
        >
          <Plus size={18} /> Add New Business
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder={`Search businesses...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#475569', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}>
          <Filter size={16} /> Filter
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#475569', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}>
          <ArrowUpDown size={16} /> Sort
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#475569', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}>
          <Download size={16} /> Export
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '60px' }}>S.No</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Business Name</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reg. Number</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>Loading businesses...</td>
                </tr>
              ) : filteredBusinesses.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '64px 32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <Building2 size={32} color="#3B82F6" />
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>No businesses found</h3>
                      <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
                        You haven't added any businesses yet. Click the button above to add one.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBusinesses.map((b, index) => (
                  <tr key={b._id || index} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '16px 24px', fontSize: '15px', color: '#475569', fontWeight: '500' }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Building2 size={20} color="#475569" />
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>{b.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: '14px' }}>
                      {b.regNo || '-'}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '14px' }}>
                        <Phone size={16} color="#94A3B8" /> {b.phone}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          onClick={() => setViewBusiness(b)}
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#EFF6FF', color: '#3B82F6', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteId(b._id)}
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }}
                          title="Delete Business"
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

      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Add New Business</h2>
              <button onClick={() => setShowModal(false)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Business Name</label>
                <input placeholder="Enter name" type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Registration Number</label>
                <input placeholder="Enter registration number" type="text" value={formData.regNo} onChange={e => setFormData({...formData, regNo: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Contact Phone</label>
                <input placeholder="Enter phone" type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Address</label>
                <textarea placeholder="Enter address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box' }} rows="3"></textarea>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '14px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>Save</button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

      {viewBusiness && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Business Details</h2>
              <button onClick={() => setViewBusiness(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Name</p>
                <p style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '600' }}>{viewBusiness.name}</p>
              </div>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Registration No</p>
                <p style={{ margin: 0, fontSize: '16px', color: '#0F172A' }}>{viewBusiness.regNo || 'N/A'}</p>
              </div>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Phone</p>
                <p style={{ margin: 0, fontSize: '16px', color: '#0F172A' }}>{viewBusiness.phone}</p>
              </div>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Address</p>
                <p style={{ margin: 0, fontSize: '16px', color: '#0F172A' }}>{viewBusiness.address}</p>
              </div>
            </div>
          </div>
        </div>, document.body
      )}

      {deleteId && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}><AlertTriangle size={32} color="#EF4444" /></div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: '0 0 12px 0' }}>Delete Business</h2>
            <p style={{ color: '#64748B', margin: '0 0 24px 0' }}>Are you sure you want to delete this business?</p>
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

export default Businesses;
