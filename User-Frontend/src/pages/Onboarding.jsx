import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Users, Map, Package, ArrowRight, ArrowLeft, CheckCircle2, Building2, LayoutGrid, ShoppingCart, TrendingUp, Briefcase } from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();
  const tenantType = Number(localStorage.getItem('tenantType')) || 1;
  const [currentStep, setCurrentStep] = useState(0);

  // State for the new selections
  const [selections, setSelections] = useState({
    offering: [], // 'product', 'service'
    operation: [] // 'purchase', 'sale'
  });

  // State for Businesses (Type 4)
  const [businesses, setBusinesses] = useState([]);
  const [showBusinessForm, setShowBusinessForm] = useState(true);
  const [newBusiness, setNewBusiness] = useState({ name: '', regNo: '', phone: '', address: '' });

  // State for Branches
  const [branches, setBranches] = useState([]);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', location: '', manager: '', phone: '', type: 'Store', business: '' });

  // State for Employees
  const [employees, setEmployees] = useState([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', role: '', email: '', phone: '', shiftFrom: '', shiftTo: '', salary: '', branch: 'Main Office', business: '' });

  const toggleSelection = (category, value) => {
    setSelections(prev => {
      const current = prev[category];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  // Define the master list of steps based on the new flow
  const allSteps = [
    { id: 'business', title: 'Register Business', desc: 'Basic info and location', icon: <Store size={24} /> },
    { id: 'branches', title: 'Register Branches', desc: 'Add additional locations', icon: <Map size={24} /> },
    { id: 'offering', title: 'Products & Services', desc: 'What do you offer?', icon: <Package size={24} /> },
    { id: 'operation', title: 'Operations Type', desc: 'Purchase or Sale', icon: <TrendingUp size={24} /> },
    { id: 'employees', title: 'Register Employees', desc: 'Invite your staff', icon: <Users size={24} /> }
  ];

  // Dynamically build the flow based on Archetype
  let activeSteps = [];
  if (tenantType === 1) {
    // Sole Operator: No Branches, No Employees
    activeSteps = [allSteps[0], allSteps[2], allSteps[3]];
  } else if (tenantType === 2) {
    // Single Branch + Staff: No Branches
    activeSteps = [allSteps[0], allSteps[2], allSteps[3], allSteps[4]];
  } else {
    // Enterprise / Conglomerate: Everything
    activeSteps = allSteps; 
  }

  const handleNext = async () => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step -> save to backend
      const token = localStorage.getItem('token');
      
      // Determine final modules from selections
      let modules = [];
      if (selections.offering.includes('product')) modules.push('products_services', 'inventory');
      if (selections.offering.includes('service')) {
        if (!modules.includes('products_services')) modules.push('products_services');
      }
      if (selections.operation.includes('purchase')) modules.push('purchases', 'expenses');
      if (selections.operation.includes('sale')) modules.push('sales');
      
      // Filter out duplicate modules just in case
      modules = [...new Set(modules)];

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/onboarding`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            businesses: tenantType === 4 ? businesses : [],
            branches,
            employees,
            modules
          })
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.error("Error saving onboarding data:", err);
      }
      
      navigate('/tenant/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSkip = () => {
    navigate('/tenant/dashboard');
  };

  const renderStepContent = () => {
    const stepId = activeSteps[currentStep].id;

    if (stepId === 'business') {
      if (tenantType === 4) {
        return (
          <div className="animate-fade-in" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Register Businesses</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Add all primary business entities in your conglomerate.</p>
            
            {businesses.length > 0 && !showBusinessForm && (
              <div style={{ marginBottom: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  <thead style={{ background: '#F8FAFC' }}>
                    <tr>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Business Name</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Contact</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Reg No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.map((b, idx) => (
                      <tr key={idx} style={{ borderTop: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>{b.name}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{b.phone}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{b.regNo || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button 
                  onClick={() => setShowBusinessForm(true)}
                  style={{ marginTop: '16px', padding: '8px 16px', background: 'white', border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                >
                  + Add Another Business
                </button>
              </div>
            )}

            {showBusinessForm && (
              <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div className="input-group" style={{ gridColumn: '1 / span 2' }}>
                    <label className="input-label">Shop / Business Name</label>
                    <input type="text" className="input-field" placeholder="E.g. Apex Retail Store" value={newBusiness.name} onChange={e => setNewBusiness({...newBusiness, name: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Registration Number (Optional)</label>
                    <input type="text" className="input-field" placeholder="GSTIN / VAT / Registration No" value={newBusiness.regNo} onChange={e => setNewBusiness({...newBusiness, regNo: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Contact Phone</label>
                    <input type="text" className="input-field" placeholder="+91 9876543210" value={newBusiness.phone} onChange={e => setNewBusiness({...newBusiness, phone: e.target.value})} />
                  </div>
                  <div className="input-group" style={{ gridColumn: '1 / span 2' }}>
                    <label className="input-label">Primary Address</label>
                    <textarea className="input-field" rows="3" placeholder="Street address, City, State, Zip..." value={newBusiness.address} onChange={e => setNewBusiness({...newBusiness, address: e.target.value})}></textarea>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  {businesses.length > 0 && <button onClick={() => setShowBusinessForm(false)} className="btn-secondary" style={{ padding: '8px 16px' }}>Cancel</button>}
                  <button onClick={() => {
                    if(newBusiness.name) {
                      setBusinesses([...businesses, newBusiness]);
                      setNewBusiness({ name: '', regNo: '', phone: '', address: '' });
                      setShowBusinessForm(false);
                    }
                  }} className="btn-primary" style={{ padding: '8px 16px' }}>Save Business</button>
                </div>
              </div>
            )}
          </div>
        );
      }

      return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Register Business</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Enter the primary details for your operation.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="input-group" style={{ gridColumn: '1 / span 2' }}>
              <label className="input-label">Shop / Business Name</label>
              <input type="text" className="input-field" placeholder="E.g. Apex Retail Store" />
            </div>
            <div className="input-group">
              <label className="input-label">Registration Number (Optional)</label>
              <input type="text" className="input-field" placeholder="GSTIN / VAT / Registration No" />
            </div>
            <div className="input-group">
              <label className="input-label">Contact Phone</label>
              <input type="text" className="input-field" placeholder="+91 9876543210" />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / span 2' }}>
              <label className="input-label">Primary Address</label>
              <textarea className="input-field" rows="3" placeholder="Street address, City, State, Zip..."></textarea>
            </div>
          </div>
        </div>
      );
    }

    if (stepId === 'branches') {
      return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Register Branches</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Set up additional locations or warehouses for your business.</p>
          
          {branches.length > 0 && !showBranchForm && (
            <div style={{ marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <thead style={{ background: '#F8FAFC' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Branch Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Type</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Location</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((b, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '500' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{b.name}</span>
                          {tenantType === 4 && <span style={{ fontSize: '12px', color: 'var(--primary-blue)' }}>{b.business}</span>}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}><span style={{ fontSize: '12px', background: '#F1F5F9', padding: '4px 8px', borderRadius: '4px', fontWeight: '500' }}>{b.type}</span></td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{b.location}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '13px' }}>{b.manager || 'No manager'}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.phone}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                onClick={() => setShowBranchForm(true)}
                style={{ marginTop: '16px', padding: '8px 16px', background: 'white', border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
              >
                + Add Another Branch
              </button>
            </div>
          )}

          {showBranchForm ? (
            <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="input-group">
                  <label className="input-label">Branch Name</label>
                  <input type="text" className="input-field" placeholder="e.g. Downtown Store" value={newBranch.name} onChange={e => setNewBranch({...newBranch, name: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Branch Type</label>
                  <select className="input-field" value={newBranch.type} onChange={e => setNewBranch({...newBranch, type: e.target.value})}>
                    <option value="Store">Retail Store</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Office">Corporate Office</option>
                  </select>
                </div>
                {tenantType === 4 && (
                  <div className="input-group" style={{ gridColumn: '1 / span 2' }}>
                    <label className="input-label">Assign to Business</label>
                    <select className="input-field" value={newBranch.business} onChange={e => setNewBranch({...newBranch, business: e.target.value})}>
                      <option value="">Select a Business</option>
                      {businesses.map((biz, idx) => (
                        <option key={idx} value={biz.name}>{biz.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="input-group" style={{ gridColumn: '1 / span 2' }}>
                  <label className="input-label">Location / Address</label>
                  <input type="text" className="input-field" placeholder="Complete address" value={newBranch.location} onChange={e => setNewBranch({...newBranch, location: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Branch Manager</label>
                  <input type="text" className="input-field" placeholder="e.g. Jane Smith" value={newBranch.manager} onChange={e => setNewBranch({...newBranch, manager: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Contact Phone</label>
                  <input type="text" className="input-field" placeholder="+91 9876543210" value={newBranch.phone} onChange={e => setNewBranch({...newBranch, phone: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowBranchForm(false)} className="btn-secondary" style={{ padding: '8px 16px' }}>Cancel</button>
                <button onClick={() => {
                  if(newBranch.name) {
                    setBranches([...branches, newBranch]);
                    setNewBranch({ name: '', location: '', manager: '', phone: '', type: 'Store', business: '' });
                    setShowBranchForm(false);
                  }
                }} className="btn-primary" style={{ padding: '8px 16px' }}>Save Branch</button>
              </div>
            </div>
          ) : branches.length === 0 && (
            <div onClick={() => setShowBranchForm(true)} style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '32px', textAlign: 'center', background: '#F8FAFC', cursor: 'pointer', transition: 'border 0.2s' }} onMouseOver={(e)=>e.currentTarget.style.borderColor='var(--primary-blue)'} onMouseOut={(e)=>e.currentTarget.style.borderColor='var(--border-color)'}>
              <div style={{ width: '48px', height: '48px', background: '#EFF6FF', borderRadius: '50%', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <Map size={24} />
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--text-title)' }}>Add a New Branch</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Click here to define secondary locations.</p>
            </div>
          )}
        </div>
      );
    }

    if (stepId === 'offering') {
      const isProduct = selections.offering.includes('product');
      const isService = selections.offering.includes('service');

      return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>What do you offer?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Select Product, Service, or Both to tailor your modules.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div 
              onClick={() => toggleSelection('offering', 'product')}
              style={{ 
                padding: '24px', border: `2px solid ${isProduct ? 'var(--primary-blue)' : 'var(--border-color)'}`, 
                borderRadius: '12px', cursor: 'pointer', background: isProduct ? '#EFF6FF' : 'white', transition: 'all 0.2s', position: 'relative'
              }}
            >
              {isProduct && <CheckCircle2 size={20} color="var(--primary-blue)" style={{ position: 'absolute', top: '16px', right: '16px' }} />}
              <div style={{ width: '48px', height: '48px', background: isProduct ? 'white' : '#F8FAFC', borderRadius: '12px', color: isProduct ? '#2563EB' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Package size={24} />
              </div>
              <h4 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-title)' }}>Physical Products</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>Physical items requiring stock and inventory tracking.</p>
            </div>
            
            <div 
              onClick={() => toggleSelection('offering', 'service')}
              style={{ 
                padding: '24px', border: `2px solid ${isService ? 'var(--primary-blue)' : 'var(--border-color)'}`, 
                borderRadius: '12px', cursor: 'pointer', background: isService ? '#EFF6FF' : 'white', transition: 'all 0.2s', position: 'relative'
              }}
            >
              {isService && <CheckCircle2 size={20} color="var(--primary-blue)" style={{ position: 'absolute', top: '16px', right: '16px' }} />}
              <div style={{ width: '48px', height: '48px', background: isService ? 'white' : '#F8FAFC', borderRadius: '12px', color: isService ? '#2563EB' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Briefcase size={24} />
              </div>
              <h4 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-title)' }}>Services</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>On-demand services, consulting, or time-based billing.</p>
            </div>
          </div>
        </div>
      );
    }

    if (stepId === 'operation') {
      const isPurchase = selections.operation.includes('purchase');
      const isSale = selections.operation.includes('sale');

      return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>What type of operations?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Select Purchase, Sale, or Both to enable respective accounting modules.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div 
              onClick={() => toggleSelection('operation', 'purchase')}
              style={{ 
                padding: '24px', border: `2px solid ${isPurchase ? 'var(--primary-blue)' : 'var(--border-color)'}`, 
                borderRadius: '12px', cursor: 'pointer', background: isPurchase ? '#EFF6FF' : 'white', transition: 'all 0.2s', position: 'relative'
              }}
            >
              {isPurchase && <CheckCircle2 size={20} color="var(--primary-blue)" style={{ position: 'absolute', top: '16px', right: '16px' }} />}
              <div style={{ width: '48px', height: '48px', background: isPurchase ? 'white' : '#F8FAFC', borderRadius: '12px', color: isPurchase ? '#2563EB' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <ShoppingCart size={24} />
              </div>
              <h4 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-title)' }}>Purchases</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>You buy items from vendors or suppliers.</p>
            </div>
            
            <div 
              onClick={() => toggleSelection('operation', 'sale')}
              style={{ 
                padding: '24px', border: `2px solid ${isSale ? 'var(--primary-blue)' : 'var(--border-color)'}`, 
                borderRadius: '12px', cursor: 'pointer', background: isSale ? '#EFF6FF' : 'white', transition: 'all 0.2s', position: 'relative'
              }}
            >
              {isSale && <CheckCircle2 size={20} color="var(--primary-blue)" style={{ position: 'absolute', top: '16px', right: '16px' }} />}
              <div style={{ width: '48px', height: '48px', background: isSale ? 'white' : '#F8FAFC', borderRadius: '12px', color: isSale ? '#2563EB' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <TrendingUp size={24} />
              </div>
              <h4 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-title)' }}>Sales</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>You sell goods or services to customers.</p>
            </div>
          </div>
        </div>
      );
    }

    if (stepId === 'employees') {
      return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Register Employees</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Add staff members to help manage your operations.</p>
          
          {employees.length > 0 && !showEmployeeForm && (
            <div style={{ marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <thead style={{ background: '#F8FAFC' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Role & Branch</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Contact</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Shift</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '500' }}>{emp.name}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-title)' }}>{emp.role}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{emp.branch} {tenantType === 4 && emp.business ? `(${emp.business})` : ''}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '13px' }}>{emp.email}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{emp.phone}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{emp.shiftFrom && emp.shiftTo ? `${emp.shiftFrom} - ${emp.shiftTo}` : '—'}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{emp.salary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                onClick={() => setShowEmployeeForm(true)}
                style={{ marginTop: '16px', padding: '8px 16px', background: 'white', border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
              >
                + Add Another Employee
              </button>
            </div>
          )}

          {showEmployeeForm ? (
            <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input type="text" className="input-field" placeholder="e.g. John Doe" value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Role</label>
                  <input type="text" className="input-field" placeholder="e.g. Manager" value={newEmployee.role} onChange={e => setNewEmployee({...newEmployee, role: e.target.value})} />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / span 2', display: 'flex', gap: '16px' }}>
                  {tenantType === 4 && (
                    <div style={{ flex: 1 }}>
                      <label className="input-label">Assigned Business</label>
                      <select className="input-field" value={newEmployee.business} onChange={e => setNewEmployee({...newEmployee, business: e.target.value})}>
                        <option value="">Select Business</option>
                        {businesses.map((b, idx) => <option key={idx} value={b.name}>{b.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <label className="input-label">Assigned Branch</label>
                    <select className="input-field" value={newEmployee.branch} onChange={e => setNewEmployee({...newEmployee, branch: e.target.value})}>
                      <option value="Main Office">Main Office</option>
                      {branches
                        .filter(b => tenantType === 4 ? (newEmployee.business ? b.business === newEmployee.business : true) : true)
                        .map((b, idx) => (
                        <option key={idx} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input type="email" className="input-field" placeholder="john@example.com" value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input type="text" className="input-field" placeholder="+91 9876543210" value={newEmployee.phone} onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Shift Timing</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="time" className="input-field" style={{ flex: 1 }} value={newEmployee.shiftFrom} onChange={e => setNewEmployee({...newEmployee, shiftFrom: e.target.value})} />
                    <span style={{ color: 'var(--text-muted)' }}>to</span>
                    <input type="time" className="input-field" style={{ flex: 1 }} value={newEmployee.shiftTo} onChange={e => setNewEmployee({...newEmployee, shiftTo: e.target.value})} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Monthly Salary</label>
                  <input type="text" className="input-field" placeholder="₹25,000" value={newEmployee.salary} onChange={e => setNewEmployee({...newEmployee, salary: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowEmployeeForm(false)} className="btn-secondary" style={{ padding: '8px 16px' }}>Cancel</button>
                <button onClick={() => {
                  if(newEmployee.name) {
                    setEmployees([...employees, newEmployee]);
                    setNewEmployee({ name: '', role: '', email: '', phone: '', shiftFrom: '', shiftTo: '', salary: '', branch: 'Main Office', business: '' });
                    setShowEmployeeForm(false);
                  }
                }} className="btn-primary" style={{ padding: '8px 16px' }}>Save Employee</button>
              </div>
            </div>
          ) : employees.length === 0 && (
            <div onClick={() => setShowEmployeeForm(true)} style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '32px', textAlign: 'center', background: '#F8FAFC', cursor: 'pointer', transition: 'border 0.2s' }} onMouseOver={(e)=>e.currentTarget.style.borderColor='var(--primary-blue)'} onMouseOut={(e)=>e.currentTarget.style.borderColor='var(--border-color)'}>
              <div style={{ width: '48px', height: '48px', background: '#EFF6FF', borderRadius: '50%', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <Users size={24} />
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--text-title)' }}>Invite an Employee</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Assign roles, branches, and shifts.</p>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'flex' }}>
      
      {/* Left Sidebar Progress */}
      <div style={{ width: '320px', background: 'white', borderRight: '1px solid var(--border-color)', padding: '40px 32px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden' }}>
            <img src="/logo.jpg" alt="BizTech Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-title)', fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.5px' }}>BizTech</span>
        </div>

        <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '32px' }}>Setup Progress</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
          {/* Vertical Line */}
          <div style={{ position: 'absolute', left: '15px', top: '20px', bottom: '20px', width: '2px', background: '#F1F5F9', zIndex: 0 }}></div>
          
          {activeSteps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            const color = isCompleted ? '#10B981' : isActive ? 'var(--primary-blue)' : '#CBD5E1';
            
            return (
              <div key={step.id} style={{ display: 'flex', gap: '16px', zIndex: 1 }}>
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  background: isCompleted ? '#10B981' : isActive ? 'var(--primary-blue)' : 'white', 
                  border: `2px solid ${color}`,
                  color: isCompleted || isActive ? 'white' : '#CBD5E1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'all 0.3s'
                }}>
                  {isCompleted ? <CheckCircle2 size={16} /> : <span style={{ fontSize: '13px', fontWeight: '600' }}>{idx + 1}</span>}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: isActive || isCompleted ? 'var(--text-title)' : 'var(--text-muted)', fontWeight: isActive ? '700' : '500' }}>{step.title}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '700px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            {renderStepContent()}
          </div>
        </div>

        {/* Bottom Bar - Always 3 Buttons */}
        <div style={{ padding: '24px 48px', background: 'white', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <button 
            onClick={handleBack} 
            disabled={currentStep === 0}
            style={{ padding: '12px 24px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-title)', fontWeight: '600', fontSize: '15px', cursor: currentStep === 0 ? 'not-allowed' : 'pointer', opacity: currentStep === 0 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={18} /> Back
          </button>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={handleSkip} 
              style={{ padding: '12px 24px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseOver={(e)=>e.currentTarget.style.color='var(--text-title)'}
              onMouseOut={(e)=>e.currentTarget.style.color='var(--text-secondary)'}
            >
              Skip to dashboard
            </button>
            
            <button 
              onClick={handleNext} 
              className="btn-primary"
              style={{ padding: '12px 32px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Proceed <ArrowRight size={18} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Onboarding;
