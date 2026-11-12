import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, MapPin, Wand2, UserPlus, Eye, ChevronDown, 
  Package, Briefcase, RefreshCw, ShoppingCart, Receipt, ShieldCheck 
} from 'lucide-react';

const AddCustomer = () => {
  const navigate = useNavigate();
  const [selectedStructure, setSelectedStructure] = useState('');
  const [offeringType, setOfferingType] = useState('both'); // 'product', 'service', 'both'
  const [operationsType, setOperationsType] = useState('purchases'); // 'purchases', 'billing_only'
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
    if (phone.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    setLoading(true);
    setError('');

    // Billing ('sales') is permanent and mandatory across all user accounts
    const initialModules = [
      'sales',
      'products_services',
      'expenses',
      ...(offeringType !== 'service' ? ['inventory'] : []),
      ...(operationsType !== 'billing_only' ? ['purchases'] : [])
    ];

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
          address,
          offeringType,
          businessOfferingType: offeringType,
          operationsType,
          businessOperationsType: operationsType,
          modules: initialModules
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
      desc: 'For solo business owners. Inside customer portal: Single store without staff management overhead.',
    },
    {
      id: 2,
      title: '1 Owner — 1 Shop — Multiple Employees',
      badge: 'Single Store',
      desc: 'Single store with staff team. Inside customer portal: Includes Employee Attendance & Leave Management without branch switching clutter.',
    },
    {
      id: 3,
      title: '1 Owner — Multiple Branches — Multiple Employees',
      badge: 'Multi-Location',
      desc: 'Multi-location chain. Inside customer portal: Includes Branch Switcher, per-branch Staff Management, and Investor Equity Management.',
    },
    {
      id: 4,
      title: '1 Owner — Multiple Businesses — Multiple Branches',
      badge: 'Multi-Business Conglomerate',
      desc: 'Conglomerate enterprise managing multiple distinct business entities, branches, staff teams, and Investor equity stakeholders.',
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Breadcrumb & Header */}
      <div>
        <button 
          onClick={() => navigate('/admin/customers')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} />
          Back to Customers / Onboarding
        </button>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: '700', color: 'var(--text-title)' }}>Add New Customer</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
          Configure customer business details, operational structure, offerings, and credentials
        </p>
      </div>

      <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '36px' }}>
        
        {/* Section 1: Operational Structure */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E2E8F0', color: 'var(--text-title)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>1</div>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '700', color: 'var(--text-title)' }}>Operational Structure</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>Choose the tier configuration that matches how this client runs their business.</p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{ background: '#EEF2FF', color: 'var(--primary-blue)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Core Tier</span>
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
                  <span style={{ background: '#EFF6FF', color: '#2563EB', fontSize: '12px', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: '600', border: '1px solid #BFDBFE' }}>
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

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

        {/* Section 2: What do you offer? (Business Offering Type) */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E2E8F0', color: 'var(--text-title)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>2</div>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '700', color: 'var(--text-title)' }}>What does this business offer?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>Select Product, Service, or Both to tailor workspace modules and Barcode features.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {/* Products Only */}
            <div 
              onClick={() => setOfferingType('product')}
              style={{
                border: `2px solid ${offeringType === 'product' ? 'var(--primary-blue, #2563EB)' : '#E2E8F0'}`,
                background: offeringType === 'product' ? '#F0F7FF' : 'white',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <Package size={22} />
                </div>
                {offeringType === 'product' && <CheckCircle2 size={20} color="#2563EB" />}
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>Physical Products</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.4' }}>
                Tangible items requiring inventory and stock replenishment tracking.
              </p>
            </div>

            {/* Services Only */}
            <div 
              onClick={() => setOfferingType('service')}
              style={{
                border: `2px solid ${offeringType === 'service' ? 'var(--primary-blue, #2563EB)' : '#E2E8F0'}`,
                background: offeringType === 'service' ? '#F0F7FF' : 'white',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                  <Briefcase size={22} />
                </div>
                {offeringType === 'service' && <CheckCircle2 size={20} color="#2563EB" />}
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>Services Only</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.4' }}>
                Consulting, repairs, labor, or billable hourly services (omits stock warehouse).
              </p>
            </div>

            {/* Both Products & Services */}
            <div 
              onClick={() => setOfferingType('both')}
              style={{
                border: `2px solid ${offeringType === 'both' ? 'var(--primary-blue, #2563EB)' : '#E2E8F0'}`,
                background: offeringType === 'both' ? '#F0F7FF' : 'white',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                  <RefreshCw size={22} />
                </div>
                {offeringType === 'both' && <CheckCircle2 size={20} color="#2563EB" />}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>Product & Service (Both)</h3>
                <span style={{ fontSize: '11px', background: '#DCFCE7', color: '#15803D', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>Barcode Enabled</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.4' }}>
                Hybrid model with physical stock and services. Unlocks the Barcode tab in Billing.
              </p>
            </div>
          </div>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

        {/* Section 3: Purchasing & Procurement Operations */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E2E8F0', color: 'var(--text-title)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>3</div>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '700', color: 'var(--text-title)' }}>Purchasing & Procurement Operations</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>Does this tenant purchase goods, stock, or raw materials from external vendors?</p>
            </div>
          </div>

          <div style={{ maxWidth: '440px' }}>
            {/* Purchases & Procurement Toggle Card */}
            <div 
              onClick={() => setOperationsType(prev => prev === 'purchases' ? 'billing_only' : 'purchases')}
              style={{
                border: `2px solid ${operationsType === 'purchases' ? 'var(--primary-blue, #2563EB)' : '#E2E8F0'}`,
                background: operationsType === 'purchases' ? '#F0F7FF' : 'white',
                borderRadius: '12px',
                padding: '22px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              {operationsType === 'purchases' && (
                <CheckCircle2 size={20} color="#2563EB" style={{ position: 'absolute', top: '16px', right: '16px' }} />
              )}
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: operationsType === 'purchases' ? 'white' : '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: operationsType === 'purchases' ? '#2563EB' : '#64748B', marginBottom: '14px', border: '1px solid #E2E8F0' }}>
                <ShoppingCart size={22} />
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>Purchases & Procurement</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.4' }}>
                Enable vendor purchase orders, supplier bills, and procurement stock management.
              </p>
            </div>
          </div>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

        {error && <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '12px 16px', borderRadius: '8px', border: '1px solid #FCA5A5', fontSize: '14px', fontWeight: '500' }}>{error}</div>}

        {/* Section 4: Business Information */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E2E8F0', color: 'var(--text-title)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>4</div>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '700', color: 'var(--text-title)' }}>Business Information</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>Basic profile and primary physical operating address.</p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Business Name</label>
              <input type="text" className="input-field" placeholder="Enter business name" value={businessName} onChange={e => setBusinessName(e.target.value)} />
            </div>
            <div className="input-group" style={{ marginBottom: 0, position: 'relative' }}>
              <label className="input-label">Industry / Category</label>
              <div style={{ position: 'relative' }}>
                <select className="input-field" style={{ appearance: 'none', cursor: 'pointer', width: '100%' }} value={industry} onChange={e => setIndustry(e.target.value)}>
                  <option value="">Select category...</option>
                  <option value="retail">Retail & Food</option>
                  <option value="auto">Automotive</option>
                  <option value="fashion">Fashion & Lifestyle</option>
                  <option value="electronics">Electronics & Tech</option>
                  <option value="services">Professional Services</option>
                </select>
                <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>
          
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Primary Branch / Location Address</label>
            <div className="input-with-icon">
              <MapPin className="input-icon" size={18} />
              <input type="text" className="input-field" placeholder="Enter complete address" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
          </div>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

        {/* Section 5: Owner Account Details */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E2E8F0', color: 'var(--text-title)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>5</div>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '700', color: 'var(--text-title)' }}>Owner Account Details</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>Credentials and contact details for the customer's primary login account.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Owner Full Name <span style={{ color: '#EF4444' }}>*</span></label>
              <input type="text" className="input-field" placeholder="Enter owner name" value={fullName} onChange={e => setFullName(e.target.value)} />
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
              <input 
                type="tel" 
                inputMode="numeric"
                maxLength={10}
                pattern="[0-9]{10}"
                className="input-field" 
                placeholder="Enter 10-digit number" 
                value={phone} 
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                style={{ marginTop: '4px' }}
              />
              {phone && phone.length > 0 && phone.length < 10 && (
                <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '2px', display: 'block' }}>
                  Please enter a full 10-digit number
                </span>
              )}
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label">Account Password <span style={{ color: '#EF4444' }}>*</span></label>
                <button type="button" onClick={() => setPassword(Math.random().toString(36).slice(-8))} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-blue)', fontSize: '13px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Wand2 size={14} /> Generate Secure Password
                </button>
              </div>
              <input type="text" className="input-field" style={{ fontFamily: 'monospace' }} placeholder="Create temporary or permanent password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>
        </section>

        {/* Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <button className="btn-secondary" style={{ background: '#F1F5F9', border: 'none' }} onClick={() => navigate('/admin/customers')}>
            Cancel
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" onClick={handleCreate} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              <UserPlus size={18} /> {loading ? 'Creating Customer...' : 'Create Customer Account'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddCustomer;
