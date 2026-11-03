import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, IndianRupee, Users, Map, Building2 } from 'lucide-react';

const DEFAULT_TYPES = [
  { id: 1, title: 'Type 1: Sole Operator', desc: '1 Owner • 1 Shop • Owner-managed staff, attendance & leaves', defaultLimit: 10, defaultBranchLimit: null, defaultBusinessLimit: null },
  { id: 2, title: 'Type 2: Single Branch + Staff', desc: '1 Owner • 1 Shop • Multi-login with staff attendance & leaves', defaultLimit: 10, defaultBranchLimit: null, defaultBusinessLimit: null },
  { id: 3, title: 'Type 3: Multi-Branch Enterprise', desc: '1 Owner • Multiple Branches • Full employee management', defaultLimit: 10, defaultBranchLimit: 5, defaultBusinessLimit: null },
  { id: 4, title: 'Type 4: Multi-Business Conglomerate', desc: '1 Owner • Multiple Businesses • Multiple Branches • Full employee management', defaultLimit: null, defaultBranchLimit: 10, defaultBusinessLimit: 3 }
];

const PricingManage = () => {
  const [dbPlans, setDbPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null, 
    customerType: '', 
    amount: 0, 
    description: '', 
    employeeLimit: '', 
    branchLimit: '', 
    businessLimit: '' 
  });

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
          description: formData.description,
          employeeLimit: formData.employeeLimit === '' ? null : Number(formData.employeeLimit),
          branchLimit: formData.branchLimit === '' ? null : Number(formData.branchLimit),
          businessLimit: formData.businessLimit === '' ? null : Number(formData.businessLimit)
        })
      });
      if (res.ok) {
        setShowModal(false);
        fetchPlans();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || 'Error saving pricing plan');
      }
    } catch (err) {
      console.error(err);
      alert('Network error saving pricing plan');
    }
  };

  const openModal = (defaultType) => {
    const existingPlan = dbPlans.find(p => p.customerType === defaultType.title);
    
    if (existingPlan) {
      setFormData({ 
        id: existingPlan._id, 
        customerType: existingPlan.customerType, 
        amount: existingPlan.amount, 
        description: existingPlan.description,
        employeeLimit: existingPlan.employeeLimit != null ? existingPlan.employeeLimit : (defaultType.defaultLimit != null ? defaultType.defaultLimit : ''),
        branchLimit: existingPlan.branchLimit != null ? existingPlan.branchLimit : (defaultType.defaultBranchLimit != null ? defaultType.defaultBranchLimit : ''),
        businessLimit: existingPlan.businessLimit != null ? existingPlan.businessLimit : (defaultType.defaultBusinessLimit != null ? defaultType.defaultBusinessLimit : '')
      });
    } else {
      setFormData({ 
        id: null, 
        customerType: defaultType.title, 
        amount: 0, 
        description: defaultType.desc,
        employeeLimit: defaultType.defaultLimit != null ? defaultType.defaultLimit : '',
        branchLimit: defaultType.defaultBranchLimit != null ? defaultType.defaultBranchLimit : '',
        businessLimit: defaultType.defaultBusinessLimit != null ? defaultType.defaultBusinessLimit : ''
      });
    }
    setShowModal(true);
  };

  const isType3or4 = formData.customerType.includes('Type 3') || formData.customerType.includes('Type 4');
  const isType4 = formData.customerType.includes('Type 4');

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--text-title)' }}>Manage Pricing Plans</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          Set monthly pricing, preset employee limits, branch limits (Type 3 & 4), and business limits (Type 4).
        </p>
      </div>

      {loading ? (
        <p>Loading plans...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {DEFAULT_TYPES.map(type => {
            const plan = dbPlans.find(p => p.customerType === type.title);
            const amount = plan ? plan.amount : 0;
            const desc = plan ? plan.description : type.desc;
            const effectiveLimit = plan && plan.employeeLimit !== undefined ? plan.employeeLimit : type.defaultLimit;
            const effectiveBranchLimit = plan && plan.branchLimit !== undefined ? plan.branchLimit : type.defaultBranchLimit;
            const effectiveBusinessLimit = plan && plan.businessLimit !== undefined ? plan.businessLimit : type.defaultBusinessLimit;

            return (
              <div key={type.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color, #E2E8F0)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-title)' }}>{type.title}</h3>
                  <button onClick={() => openModal(type)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }} title="Edit Pricing & Limits">
                    <Edit2 size={16} />
                  </button>
                </div>
                
                <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                  <IndianRupee size={28} />{amount} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: '4px' }}>/ mo</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    background: '#EFF6FF', 
                    color: '#1D4ED8', 
                    padding: '4px 10px', 
                    borderRadius: '8px', 
                    fontSize: '12px', 
                    fontWeight: '600',
                    width: 'fit-content'
                  }}>
                    <Users size={14} />
                    Staff Limit: {effectiveLimit != null ? `${effectiveLimit} Staff` : 'Unlimited'}
                  </span>

                  {(type.id === 3 || type.id === 4) && (
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      background: '#F0FDF4', 
                      color: '#166534', 
                      padding: '4px 10px', 
                      borderRadius: '8px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      width: 'fit-content'
                    }}>
                      <Map size={14} />
                      Branch Limit: {effectiveBranchLimit != null ? `${effectiveBranchLimit} Branches` : 'Unlimited'}
                    </span>
                  )}

                  {type.id === 4 && (
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      background: '#FAF5FF', 
                      color: '#6B21A8', 
                      padding: '4px 10px', 
                      borderRadius: '8px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      width: 'fit-content'
                    }}>
                      <Building2 size={14} />
                      Business Limit: {effectiveBusinessLimit != null ? `${effectiveBusinessLimit} Businesses` : 'Unlimited'}
                    </span>
                  )}
                </div>

                <p style={{ color: 'var(--text-muted, #64748B)', margin: 0, fontSize: '14px' }}>{desc}</p>
              </div>
            );
          })}
        </div>
      )}

      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>Configure Plan Tier</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>Customer Type</label>
                <input 
                  type="text" 
                  value={formData.customerType} 
                  disabled
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F1F5F9', color: '#64748B', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>Monthly Amount (₹)</label>
                <input 
                  placeholder="Enter the monthly amount" 
                  type="number" 
                  value={formData.amount} 
                  onChange={e => setFormData({ ...formData, amount: e.target.value })} 
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                  Preset Employee Limit
                </label>
                <input 
                  placeholder="e.g. 10 (Leave blank for Unlimited)" 
                  type="number" 
                  min="0"
                  value={formData.employeeLimit} 
                  onWheel={(e) => e.target.blur()}
                  onChange={e => setFormData({ ...formData, employeeLimit: e.target.value })} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                  Default employee creation quota. Blank or 0 = Unlimited.
                </span>
              </div>

              {isType3or4 && (
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                    Preset Branch Limit (Type 3 & 4)
                  </label>
                  <input 
                    placeholder="e.g. 5 (Leave blank for Unlimited)" 
                    type="number" 
                    min="0"
                    value={formData.branchLimit} 
                    onWheel={(e) => e.target.blur()}
                    onChange={e => setFormData({ ...formData, branchLimit: e.target.value })} 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                    Maximum number of branches allowed. Blank or 0 = Unlimited.
                  </span>
                </div>
              )}

              {isType4 && (
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                    Preset Business Limit (Type 4)
                  </label>
                  <input 
                    placeholder="e.g. 3 (Leave blank for Unlimited)" 
                    type="number" 
                    min="0"
                    value={formData.businessLimit} 
                    onWheel={(e) => e.target.blur()}
                    onChange={e => setFormData({ ...formData, businessLimit: e.target.value })} 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                    Maximum number of businesses allowed. Blank or 0 = Unlimited.
                  </span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>Description</label>
                <textarea 
                  placeholder="Enter the description" 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minHeight: '80px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', color: '#475569' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', background: 'var(--primary-blue, #2563EB)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Save Changes</button>
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
