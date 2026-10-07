import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MapPin, Wand2, UserPlus, Eye, ChevronDown } from 'lucide-react';

const AddCustomer = () => {
  const navigate = useNavigate();
  const [selectedStructure, setSelectedStructure] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [address, setAddress] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!selectedStructure || !fullName || !email || !phone || !password) {
      setError('Please fill all required fields and select an operational structure.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          businessType: selectedStructure,
          businessName,
          industry,
          address
        })
      });

      const data = await response.json();
      if (response.ok) {
        navigate('/admin/customers');
      } else {
        setError(data.message || 'Failed to create customer');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  const structures = [
    {
      id: 1,
      title: '1 Owner — 1 Shop — Owner as Employee',
      badge: 'Solo Operator',
      desc: 'For solo business owners. Inside customer portal: No attendance or leave management needed since there are no other employees.',
    },
    {
      id: 2,
      title: '1 Owner — 1 Shop — Multiple Employees',
      badge: 'Single Store',
      desc: 'Single store with staff team. Inside customer portal: Includes Employee Attendance & Leave Management.',
    },
    {
      id: 3,
      title: '1 Owner — Multiple Branches — Multiple Employees',
      badge: 'Multi-Location',
      desc: 'Multi-location chain. Inside customer portal: Includes Branch Switcher to view branches, plus Employee Attendance & Leave Management per branch.',
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Breadcrumb & Header */}
      <div>
        <button 
          onClick={() => navigate('/admin/customers')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px', fontWeight: '500' }}
        >
          <ArrowLeft size={16} />
          Back to Customers / Onboarding
        </button>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Add New Customer</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Configure customer business details and select their operational structure
        </p>
      </div>

      <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* Section 1: Operational Structure */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E2E8F0', color: 'var(--text-title)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>1</div>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0 }}>Operational Structure</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>Choose the configuration that matches how this client runs their business.</p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{ background: '#EEF2FF', color: 'var(--primary-blue)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Core Setting</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0, position: 'relative' }}>
              <select 
                className="input-field" 
                style={{ appearance: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '500', padding: '12px 16px', width: '100%' }}
                value={selectedStructure}
                onChange={(e) => setSelectedStructure(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="" disabled>Select operational structure</option>
                {structures.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
              <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
            
            {/* Show details for selected structure */}
            {selectedStructure !== '' && (
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-title)' }}>Selected Configuration</span>
                  <span style={{ background: '#F1F5F9', color: '#475569', fontSize: '12px', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: '500', border: '1px solid #CBD5E1' }}>
                    {structures.find(s => s.id === selectedStructure)?.badge}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                  {structures.find(s => s.id === selectedStructure)?.desc}
                </p>
              </div>
            )}
          </div>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

        {error && <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '12px 16px', borderRadius: '8px', border: '1px solid #FCA5A5', fontSize: '14px', fontWeight: '500' }}>{error}</div>}

        {/* Section 2: Business Information */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E2E8F0', color: 'var(--text-title)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>2</div>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0 }}>Business Information</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>Basic profile and primary physical operating address.</p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Business Name</label>
              <input type="text" className="input-field" placeholder="e.g. Blue Star Bakery" value={businessName} onChange={e => setBusinessName(e.target.value)} />
            </div>
            <div className="input-group" style={{ marginBottom: 0, position: 'relative' }}>
              <label className="input-label">Industry / Category</label>
              <div style={{ position: 'relative' }}>
                <select className="input-field" style={{ appearance: 'none', cursor: 'pointer', width: '100%' }} value={industry} onChange={e => setIndustry(e.target.value)}>
                  <option value="">Select category...</option>
                  <option value="retail">Retail & Food</option>
                  <option value="auto">Automotive</option>
                  <option value="fashion">Fashion</option>
                </select>
                <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Primary Branch / Location Address</label>
            <div className="input-with-icon">
              <MapPin className="input-icon" size={18} />
              <input type="text" className="input-field" placeholder="e.g. 123 Main St, New York, NY 10001" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
          </div>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

        {/* Section 3: Owner Account Details */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E2E8F0', color: 'var(--text-title)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>3</div>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0 }}>Owner Account Details</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>Credentials and contact details for the customer's primary login account.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Owner Full Name <span style={{ color: '#EF4444' }}>*</span></label>
              <input type="text" className="input-field" placeholder="e.g. Sarah Jenkins" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Owner Email Address <span style={{ color: '#EF4444' }}>*</span></label>
              <input type="email" className="input-field" placeholder="sarah@bluestarbakery.com" value={email} onChange={e => setEmail(e.target.value)} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>This email will serve as their portal login identifier.</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Phone Number <span style={{ color: '#EF4444' }}>*</span></label>
              <input type="tel" className="input-field" placeholder="e.g. +1 (555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label">Account Password <span style={{ color: '#EF4444' }}>*</span></label>
                <button onClick={() => setPassword(Math.random().toString(36).slice(-8))} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-blue)', fontSize: '13px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Wand2 size={14} /> Generate Secure Password
                </button>
              </div>
              <input type="text" className="input-field" style={{ fontFamily: 'monospace' }} placeholder="Create temporary or permanent password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer', marginTop: '16px' }}>
            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--primary-blue)', cursor: 'pointer' }} />
            Send welcome email with login link and temporary credentials
          </label>
        </section>

        {/* Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <button className="btn-secondary" style={{ background: '#F1F5F9', border: 'none' }} onClick={() => navigate('/admin/customers')}>
            Cancel
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" onClick={handleCreate} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              <UserPlus size={18} /> {loading ? 'Creating...' : 'Create Customer Account'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddCustomer;
