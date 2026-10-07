import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, IndianRupee } from 'lucide-react';

const DEFAULT_TYPES = [
  { id: 1, title: 'Type 1: Sole Operator', desc: '1 Owner • 1 Shop • No employee management needed' },
  { id: 2, title: 'Type 2: Single Branch + Staff', desc: '1 Owner • 1 Shop • Includes staff attendance & leaves' },
  { id: 3, title: 'Type 3: Multi-Branch Enterprise', desc: '1 Owner • Multiple Branches • Full employee management' },
  { id: 4, title: 'Type 4: Multi-Business Conglomerate', desc: '1 Owner • Multiple Businesses • Multiple Branches • Full employee management' }
];

const PricingManage = () => {
  const [dbPlans, setDbPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, customerType: '', amount: 0, description: '' });

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pricing`);
      if (res.ok) {
        const data = await res.json();
        setDbPlans(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!formData.id;
    const url = isEdit 
      ? `${import.meta.env.VITE_API_URL}/api/pricing/${formData.id}` 
      : `${import.meta.env.VITE_API_URL}/api/pricing`;
    
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerType: formData.customerType,
          amount: formData.amount,
          description: formData.description
        })
      });
      if (res.ok) {
        setShowModal(false);
        fetchPlans();
      } else {
        alert('Error saving pricing plan');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (defaultType) => {
    // Check if this type already exists in DB
    const existingPlan = dbPlans.find(p => p.customerType === defaultType.title);
    
    if (existingPlan) {
      setFormData({ id: existingPlan._id, customerType: existingPlan.customerType, amount: existingPlan.amount, description: existingPlan.description });
    } else {
      setFormData({ id: null, customerType: defaultType.title, amount: 0, description: defaultType.desc });
    }
    setShowModal(true);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--text-title)' }}>Manage Pricing Plans</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Set the monthly pricing for the 4 default business archetypes.</p>
      </div>

      {loading ? (
        <p>Loading plans...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {DEFAULT_TYPES.map(type => {
            const plan = dbPlans.find(p => p.customerType === type.title);
            const amount = plan ? plan.amount : 0;
            const desc = plan ? plan.description : type.desc;

            return (
              <div key={type.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color, #E2E8F0)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-title)' }}>{type.title}</h3>
                  <button onClick={() => openModal(type)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}>
                    <Edit2 size={16} />
                  </button>
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                  <IndianRupee size={28} />{amount} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: '4px' }}>/ mo</span>
                </div>
                <p style={{ color: 'var(--text-muted, #64748B)', margin: 0, fontSize: '14px' }}>{desc}</p>
              </div>
            );
          })}
        </div>
      )}

      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Set Pricing Amount</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Customer Type</label>
                <input 
                  type="text" 
                  value={formData.customerType} 
                  disabled
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F1F5F9', color: '#64748B' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Monthly Amount (₹)</label>
                <input 
                  type="number" 
                  value={formData.amount} 
                  onChange={e => setFormData({...formData, amount: e.target.value})} 
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minHeight: '80px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', background: 'var(--primary-blue, #2563EB)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Save Amount</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PricingManage;
