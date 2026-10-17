import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Users, Map, Package, ArrowRight, ArrowLeft, CheckCircle2, Building2, ShoppingCart, TrendingUp, Briefcase, Menu, X, Trash2, Edit2, Plus } from 'lucide-react';

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

const Onboarding = () => {
  const navigate = useNavigate();
  const [tenantType, setTenantType] = useState(() => Number(localStorage.getItem('tenantType')) || 1);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  // State for Type 2 Single Branch editing
  const [isEditingBranch, setIsEditingBranch] = useState(false);

  // State for the new selections
  const [selections, setSelections] = useState({
    offering: [],
    operation: []
  });

  // State for Single Business (Type 1, 2, 3)
  const [singleBusiness, setSingleBusiness] = useState({ name: '', regNo: '', phone: '', address: '' });

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
  const [newEmployee, setNewEmployee] = useState({ name: '', designation: '', customDesignation: '', role: '', email: '', phone: '', shiftFrom: '', shiftTo: '', salary: '', branch: 'Main Branch', business: '' });

  // Fetch prefilled data on mount (strictly scoped to the authenticated tenant)
  useEffect(() => {
    const fetchPrefilledData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/onboarding-data`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const { user, branches: existingBranches, employees: existingEmployees } = data;

          if (user) {
            const savedType = Number(localStorage.getItem('tenantType'));
            if (savedType) {
              setTenantType(savedType);
            } else if (user.businessType) {
              const typeNum = Number(user.businessType);
              localStorage.setItem('tenantType', typeNum.toString());
              setTenantType(typeNum);
            }

            setSingleBusiness({
              name: user.businessName || '',
              regNo: user.regNo || '',
              phone: user.businessPhone || user.phone || '',
              address: user.address || ''
            });

            setNewBusiness(prev => ({
              ...prev,
              phone: user.businessPhone || user.phone || ''
            }));

            if (user.businesses && Array.isArray(user.businesses) && user.businesses.length > 0) {
              setBusinesses(user.businesses);
              setShowBusinessForm(false);
            } else {
              setBusinesses([]);
              setShowBusinessForm(true);
            }

            if (user.modules && Array.isArray(user.modules) && user.modules.length > 0) {
              const off = new Set();
              const op = new Set();
              if (user.modules.includes('products_services') || user.modules.includes('inventory')) {
                off.add('product');
              }
              if (user.modules.includes('purchases')) op.add('purchase');
              if (user.modules.includes('sales')) op.add('sale');
              setSelections({
                offering: Array.from(off),
                operation: Array.from(op)
              });
            }
          }

          if (existingBranches && Array.isArray(existingBranches)) {
            const mappedBranches = existingBranches.map(b => ({
              name: b.name,
              location: b.location || '',
              manager: b.manager || '',
              phone: b.contactNumber || b.phone || '',
              type: b.type || 'Store',
              business: b.businessName || ''
            }));
            setBranches(mappedBranches);
            if (mappedBranches.length > 0) {
              setShowBranchForm(false);
            }
          }

          if (existingEmployees && Array.isArray(existingEmployees)) {
            const mappedEmployees = existingEmployees.map(e => ({
              name: e.name,
              role: e.position || e.role || '',
              email: e.email,
              phone: e.contactNumber || e.phone || '',
              shiftFrom: e.shiftFrom || '',
              shiftTo: e.shiftTo || '',
              salary: e.salary ? (typeof e.salary === 'number' ? `₹${e.salary.toLocaleString()}` : e.salary) : '',
              branch: e.branchName || 'Main Office',
              business: e.businessName || ''
            }));
            setEmployees(mappedEmployees);
          }
        }
      } catch (err) {
        console.error("Error loading prefilled onboarding data:", err);
      }
    };

    fetchPrefilledData();
  }, []);

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

  // Define active steps dynamically based on tenantType archetype
  const activeSteps = useMemo(() => {
    const steps = [];

    // Step 1: Business (Type 4: multiple businesses, Types 1-3: single business)
    if (tenantType === 4) {
      steps.push({ id: 'business', title: 'Register Businesses', desc: 'Conglomerate entities', icon: <Building2 size={24} /> });
    } else {
      steps.push({ id: 'business', title: 'Register Business', desc: 'Basic info and location', icon: <Store size={24} /> });
    }

    // Step 2: Branches (Type 1 has NO branch step!)
    if (tenantType === 2) {
      steps.push({ id: 'branches', title: 'Register Branch', desc: 'Single branch location', icon: <Map size={24} /> });
    } else if (tenantType === 3 || tenantType === 4) {
      steps.push({ id: 'branches', title: 'Register Branches', desc: 'Add multiple locations', icon: <Map size={24} /> });
    }

    // Steps 3 & 4: Offerings & Operations (All types)
    steps.push({ id: 'offering', title: 'Products & Services', desc: 'What do you offer?', icon: <Package size={24} /> });
    steps.push({ id: 'operation', title: 'Operations Type', desc: 'Purchase or Sale', icon: <TrendingUp size={24} /> });

    // Step 5: Employees (Type 1 has NO employee step!)
    if (tenantType === 2) {
      steps.push({ id: 'employees', title: 'Register Employees', desc: 'Invite your branch staff', icon: <Users size={24} /> });
    } else if (tenantType === 3) {
      steps.push({ id: 'employees', title: 'Register Employees', desc: 'Assign staff to branches', icon: <Users size={24} /> });
    } else if (tenantType === 4) {
      steps.push({ id: 'employees', title: 'Register Employees', desc: 'Staff across businesses', icon: <Users size={24} /> });
    }

    return steps;
  }, [tenantType]);

  // Keep currentStep within range if activeSteps changes
  useEffect(() => {
    if (currentStep >= activeSteps.length) {
      setCurrentStep(Math.max(0, activeSteps.length - 1));
    }
  }, [activeSteps.length, currentStep]);

  const saveProgress = async (customPayload = {}) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let modules = ['expenses'];
    if (selections.offering.includes('product')) modules.push('products_services', 'inventory');
    if (selections.offering.includes('service')) {
      if (!modules.includes('products_services')) modules.push('products_services');
    }
    if (selections.operation.includes('purchase')) modules.push('purchases');
    if (selections.operation.includes('sale')) modules.push('sales');
    modules = [...new Set(modules)];

    let payloadBranches = branches;
    let payloadEmployees = employees;
    let payloadBusinesses = tenantType === 4 ? businesses : [];

    if (tenantType === 1) {
      // Type 1: Sole Operator has no branches and no employees
      payloadBranches = [];
      payloadEmployees = [];
    } else if (tenantType === 2) {
      // Type 2: Single branch only, staff assigned to this single branch
      payloadBranches = branches.slice(0, 1);
      const defaultBranch = payloadBranches[0]?.name || 'Main Branch';
      payloadEmployees = employees.map(emp => ({
        ...emp,
        branch: defaultBranch
      }));
    }

    const payload = {
      singleBusiness,
      businesses: payloadBusinesses,
      branches: payloadBranches,
      employees: payloadEmployees,
      modules,
      ...customPayload
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          if (data.user.modules) {
            localStorage.setItem('modules', JSON.stringify(data.user.modules));
          }
        }
      }
    } catch (err) {
      console.error("Error saving onboarding data:", err);
    }
  };

  const handleNext = async () => {
    await saveProgress();
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate('/tenant/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSkip = async () => {
    await saveProgress();
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
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)', width: '60px' }}>S.No</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Business Name</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Contact</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Reg No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.map((b, idx) => (
                      <tr key={idx} style={{ borderTop: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>{idx + 1}</td>
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
                    <input type="text" className="input-field" placeholder="Enter business name" value={newBusiness.name} onChange={e => setNewBusiness({...newBusiness, name: e.target.value})} />
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
              <input 
                type="text" 
                className="input-field" 
                placeholder="Enter business name" 
                value={singleBusiness.name} 
                onChange={e => setSingleBusiness({...singleBusiness, name: e.target.value})} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Registration Number (Optional)</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="GSTIN / VAT / Registration No" 
                value={singleBusiness.regNo} 
                onChange={e => setSingleBusiness({...singleBusiness, regNo: e.target.value})} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Contact Phone</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="+91 9876543210" 
                value={singleBusiness.phone} 
                onChange={e => setSingleBusiness({...singleBusiness, phone: e.target.value})} 
              />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / span 2' }}>
              <label className="input-label">Primary Address</label>
              <textarea 
                className="input-field" 
                rows="3" 
                placeholder="Street address, City, State, Zip..." 
                value={singleBusiness.address} 
                onChange={e => setSingleBusiness({...singleBusiness, address: e.target.value})}
              ></textarea>
            </div>
          </div>
        </div>
      );
    }

    if (stepId === 'branches') {
      // Type 2: Single Branch ONLY (No multiple branch creation allowed)
      if (tenantType === 2) {
        return (
          <div className="animate-fade-in" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Register Branch</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
              Set up the single branch location for your business operations.
            </p>

            {branches.length > 0 && !isEditingBranch ? (
              <div style={{ background: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-title)' }}>
                        {branches[0].name}
                      </h3>
                      <span style={{ fontSize: '12px', background: '#EFF6FF', color: 'var(--primary-blue)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                        {branches[0].type || 'Retail Store'}
                      </span>
                      <span style={{ fontSize: '11px', background: '#E2E8F0', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: '500' }}>
                        Single Branch Only
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {branches[0].location || 'No location address specified'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setNewBranch({ ...branches[0] });
                        setIsEditingBranch(true);
                      }}
                      className="btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Edit2 size={14} /> Edit Branch
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBranches([]);
                        setNewBranch({ name: '', location: '', manager: '', phone: '', type: 'Store', business: '' });
                        saveProgress({ branches: [] });
                      }}
                      style={{ background: 'transparent', border: '1px solid #FCA5A5', color: '#EF4444', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Remove Branch"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Branch Manager</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-title)' }}>{branches[0].manager || 'Not Assigned'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Contact Phone</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-title)' }}>{branches[0].phone || 'Not Provided'}</span>
                  </div>
                </div>

                <div style={{ marginTop: '20px', padding: '12px 16px', background: '#EFF6FF', borderRadius: '8px', border: '1px solid #DBEAFE', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} color="var(--primary-blue)" />
                  <span style={{ fontSize: '13px', color: '#1E40AF' }}>
                    Single branch configured. All employees will be assigned to this branch.
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: 'var(--text-title)' }}>
                  {isEditingBranch ? 'Edit Branch' : 'Enter Branch Details'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="input-group">
                    <label className="input-label">Branch Name *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Main Branch"
                      value={newBranch.name}
                      onChange={e => setNewBranch({ ...newBranch, name: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Branch Type</label>
                    <select
                      className="input-field"
                      value={newBranch.type || 'Store'}
                      onChange={e => setNewBranch({ ...newBranch, type: e.target.value })}
                    >
                      <option value="Store">Retail Store</option>
                      <option value="Warehouse">Warehouse</option>
                      <option value="Office">Corporate Office</option>
                    </select>
                  </div>
                  <div className="input-group" style={{ gridColumn: '1 / span 2' }}>
                    <label className="input-label">Location / Address</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Complete address of this branch"
                      value={newBranch.location}
                      onChange={e => setNewBranch({ ...newBranch, location: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Branch Manager</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter manager name"
                      value={newBranch.manager}
                      onChange={e => setNewBranch({ ...newBranch, manager: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Contact Phone</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="+91 9876543210"
                      value={newBranch.phone}
                      onChange={e => setNewBranch({ ...newBranch, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  {isEditingBranch && (
                    <button
                      type="button"
                      onClick={() => setIsEditingBranch(false)}
                      className="btn-secondary"
                      style={{ padding: '8px 16px' }}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (newBranch.name.trim()) {
                        const branchData = { ...newBranch, name: newBranch.name.trim() };
                        setBranches([branchData]);
                        setIsEditingBranch(false);
                        saveProgress({ branches: [branchData] });
                      }
                    }}
                    className="btn-primary"
                    style={{ padding: '8px 16px' }}
                    disabled={!newBranch.name.trim()}
                  >
                    Save Branch
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }

      // Types 3 & 4: Multiple Branch Creation Allowed
      return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Register Branches</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            {tenantType === 4 ? 'Set up branches and assign them across your businesses.' : 'Set up multiple locations or warehouses for your business.'}
          </p>
          
          {branches.length > 0 && !showBranchForm && (
            <div style={{ marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <thead style={{ background: '#F8FAFC' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)', width: '60px' }}>S.No</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Branch Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Type</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Location</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Contact</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', width: '60px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((b, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>{idx + 1}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '500' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{b.name}</span>
                          {tenantType === 4 && b.business && (
                            <span style={{ fontSize: '12px', color: 'var(--primary-blue)' }}>{b.business}</span>
                          )}
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
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = branches.filter((_, i) => i !== idx);
                            setBranches(updated);
                            saveProgress({ branches: updated });
                          }}
                          style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Remove Branch"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                onClick={() => setShowBranchForm(true)}
                style={{ marginTop: '16px', padding: '8px 16px', background: 'white', border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Add Another Branch
              </button>
            </div>
          )}

          {showBranchForm ? (
            <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="input-group">
                  <label className="input-label">Branch Name *</label>
                  <input type="text" className="input-field" placeholder="Enter branch name" value={newBranch.name} onChange={e => setNewBranch({...newBranch, name: e.target.value})} />
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
                    <label className="input-label">Assign to Business *</label>
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
                  <input type="text" className="input-field" placeholder="Enter manager name" value={newBranch.manager} onChange={e => setNewBranch({...newBranch, manager: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Contact Phone</label>
                  <input type="text" className="input-field" placeholder="+91 9876543210" value={newBranch.phone} onChange={e => setNewBranch({...newBranch, phone: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowBranchForm(false)} className="btn-secondary" style={{ padding: '8px 16px' }}>Cancel</button>
                <button onClick={() => {
                  if(newBranch.name.trim()) {
                    const branchData = { ...newBranch, name: newBranch.name.trim() };
                    const updated = [...branches, branchData];
                    setBranches(updated);
                    setNewBranch({ name: '', location: '', manager: '', phone: '', type: 'Store', business: '' });
                    setShowBranchForm(false);
                    saveProgress({ branches: updated });
                  }
                }} className="btn-primary" style={{ padding: '8px 16px' }} disabled={!newBranch.name.trim()}>Save Branch</button>
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
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            {tenantType === 2 
              ? 'Add staff members to your branch location.' 
              : tenantType === 3 
                ? 'Add staff members and assign them to specific branches.' 
                : 'Add staff members across your businesses and branches.'}
          </p>
          
          {employees.length > 0 && !showEmployeeForm && (
            <div style={{ marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <thead style={{ background: '#F8FAFC' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)', width: '60px' }}>S.No</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Role & Branch</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Contact</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Shift</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Salary</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', width: '60px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>{idx + 1}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '500' }}>{emp.name}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-title)' }}>{emp.designation || emp.role || 'Staff'}</span>
                          {emp.role && emp.designation && emp.role !== emp.designation && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Role: {emp.role}</span>
                          )}
                          <span style={{ fontSize: '12px', color: 'var(--primary-blue)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Map size={12} /> {emp.branch || 'Main Branch'} {tenantType === 4 && emp.business ? `(${emp.business})` : ''}
                          </span>
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
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = employees.filter((_, i) => i !== idx);
                            setEmployees(updated);
                            saveProgress({ employees: updated });
                          }}
                          style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Remove Employee"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                onClick={() => {
                  setNewEmployee({
                    name: '',
                    designation: '',
                    customDesignation: '',
                    role: '',
                    email: '',
                    phone: '',
                    shiftFrom: '',
                    shiftTo: '',
                    salary: '',
                    branch: branches[0]?.name || 'Main Branch',
                    business: (tenantType === 4 && businesses.length > 0) ? businesses[0].name : ''
                  });
                  setShowEmployeeForm(true);
                }}
                style={{ marginTop: '16px', padding: '8px 16px', background: 'white', border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Add Another Employee
              </button>
            </div>
          )}

          {showEmployeeForm ? (
            <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="input-group">
                  <label className="input-label">Full Name *</label>
                  <input type="text" className="input-field" placeholder="Enter employee name" value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Designation *</label>
                  <select 
                    className="input-field"
                    value={newEmployee.designation} 
                    onChange={e => {
                      const val = e.target.value;
                      setNewEmployee(prev => ({
                        ...prev,
                        designation: val,
                        role: prev.role || (val !== 'Other' ? val : '')
                      }));
                    }}
                  >
                    <option value="">-- Select Designation --</option>
                    {DESIGNATION_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {newEmployee.designation === 'Other' && (
                    <input 
                      type="text" 
                      className="input-field" 
                      style={{ marginTop: '6px' }}
                      placeholder="Enter custom designation" 
                      value={newEmployee.customDesignation} 
                      onChange={e => setNewEmployee({...newEmployee, customDesignation: e.target.value})} 
                    />
                  )}
                </div>
                <div className="input-group">
                  <label className="input-label">Position / Role</label>
                  <input type="text" className="input-field" placeholder="e.g. Lead Cashier, Senior Associate" value={newEmployee.role} onChange={e => setNewEmployee({...newEmployee, role: e.target.value})} />
                </div>

                {/* Branch / Business assignment tailored per tenantType */}
                {tenantType === 2 && (
                  <div className="input-group" style={{ gridColumn: '1 / span 2' }}>
                    <label className="input-label">Assigned Branch</label>
                    <div style={{ padding: '10px 14px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Map size={16} color="var(--primary-blue)" />
                      <span>{branches[0]?.name || 'Main Branch'}</span>
                      <span style={{ fontSize: '11px', background: '#F1F5F9', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px', marginLeft: 'auto' }}>
                        Single Branch Only
                      </span>
                    </div>
                  </div>
                )}

                {tenantType === 3 && (
                  <div className="input-group" style={{ gridColumn: '1 / span 2' }}>
                    <label className="input-label">Assigned Branch *</label>
                    <select 
                      className="input-field" 
                      value={newEmployee.branch} 
                      onChange={e => setNewEmployee({ ...newEmployee, branch: e.target.value })}
                    >
                      {branches.length === 0 ? (
                        <option value="Main Branch">Main Branch (Default)</option>
                      ) : (
                        branches.map((b, idx) => (
                          <option key={idx} value={b.name}>{b.name} ({b.type || 'Branch'})</option>
                        ))
                      )}
                    </select>
                    {branches.length === 0 && (
                      <span style={{ fontSize: '12px', color: '#CA8A04', marginTop: '4px', display: 'block' }}>
                        No custom branches were registered in the previous step. Main Branch will be assigned.
                      </span>
                    )}
                  </div>
                )}

                {tenantType === 4 && (
                  <div className="input-group" style={{ gridColumn: '1 / span 2', display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label className="input-label">Assigned Business *</label>
                      <select 
                        className="input-field" 
                        value={newEmployee.business} 
                        onChange={e => {
                          const biz = e.target.value;
                          const filteredBranches = branches.filter(b => b.business === biz);
                          setNewEmployee({
                            ...newEmployee,
                            business: biz,
                            branch: filteredBranches[0]?.name || branches[0]?.name || 'Main Branch'
                          });
                        }}
                      >
                        <option value="">Select Business</option>
                        {businesses.map((b, idx) => <option key={idx} value={b.name}>{b.name}</option>)}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="input-label">Assigned Branch *</label>
                      <select 
                        className="input-field" 
                        value={newEmployee.branch} 
                        onChange={e => setNewEmployee({ ...newEmployee, branch: e.target.value })}
                      >
                        <option value="">Select Branch</option>
                        {branches
                          .filter(b => newEmployee.business ? b.business === newEmployee.business : true)
                          .map((b, idx) => (
                            <option key={idx} value={b.name}>{b.name} ({b.type || 'Branch'})</option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input type="email" className="input-field" placeholder="Enter employee email" value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} />
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
                  if (newEmployee.name.trim()) {
                    const assignedBranch = tenantType === 2
                      ? (branches[0]?.name || 'Main Branch')
                      : (newEmployee.branch || branches[0]?.name || 'Main Branch');

                    const finalDesignation = newEmployee.designation === 'Other'
                      ? (newEmployee.customDesignation?.trim() || 'Other')
                      : (newEmployee.designation?.trim() || newEmployee.role?.trim() || 'Staff');
                    const finalRole = newEmployee.role?.trim() || finalDesignation;

                    const empData = {
                      ...newEmployee,
                      name: newEmployee.name.trim(),
                      designation: finalDesignation,
                      role: finalRole,
                      branch: assignedBranch,
                      business: tenantType === 4 ? newEmployee.business : ''
                    };
                    delete empData.customDesignation;

                    const updated = [...employees, empData];
                    setEmployees(updated);
                    setNewEmployee({
                      name: '',
                      designation: '',
                      customDesignation: '',
                      role: '',
                      email: '',
                      phone: '',
                      shiftFrom: '',
                      shiftTo: '',
                      salary: '',
                      branch: branches[0]?.name || 'Main Branch',
                      business: (tenantType === 4 && businesses.length > 0) ? businesses[0].name : ''
                    });
                    setShowEmployeeForm(false);
                    saveProgress({ employees: updated });
                  }
                }} className="btn-primary" style={{ padding: '8px 16px' }} disabled={!newEmployee.name.trim()}>Save Employee</button>
              </div>
            </div>
          ) : employees.length === 0 && (
            <div 
              onClick={() => {
                setNewEmployee({
                  name: '',
                  designation: '',
                  customDesignation: '',
                  role: '',
                  email: '',
                  phone: '',
                  shiftFrom: '',
                  shiftTo: '',
                  salary: '',
                  branch: branches[0]?.name || 'Main Branch',
                  business: (tenantType === 4 && businesses.length > 0) ? businesses[0].name : ''
                });
                setShowEmployeeForm(true);
              }} 
              style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '32px', textAlign: 'center', background: '#F8FAFC', cursor: 'pointer', transition: 'border 0.2s' }} 
              onMouseOver={(e)=>e.currentTarget.style.borderColor='var(--primary-blue)'} 
              onMouseOut={(e)=>e.currentTarget.style.borderColor='var(--border-color)'}
            >
              <div style={{ width: '48px', height: '48px', background: '#EFF6FF', borderRadius: '50%', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <Users size={24} />
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--text-title)' }}>Invite an Employee</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                {tenantType === 2 
                  ? 'Add staff members to your branch.' 
                  : tenantType === 3 
                    ? 'Add staff members and assign them to specific branches.' 
                    : 'Assign roles, businesses, and branches.'}
              </p>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'flex' }}>
      
      {/* Backdrop for mobile */}
      <div 
        className={`sidebar-backdrop ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Left Sidebar Progress */}
      <div className={`onboarding-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden' }}>
              <img src="/logo.jpg" alt="BizTech Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-title)', fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.5px' }}>BizTech</span>
          </div>
          <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
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
              <div 
                key={step.id} 
                style={{ display: 'flex', gap: '16px', zIndex: 1, cursor: 'pointer' }}
                onClick={() => {
                  setCurrentStep(idx);
                  if (window.innerWidth <= 768) setIsSidebarOpen(false);
                }}
              >
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
      <div className="onboarding-main">
        
        {/* Header */}
        <div className={`onboarding-header ${isSidebarOpen ? 'hide-on-desktop' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden' }}>
              <img src="/logo.jpg" alt="BizTech Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-title)', fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.5px' }}>BizTech</span>
          </div>
          <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '700px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            {renderStepContent()}
          </div>
        </div>

        {/* Bottom Bar - Always 3 Buttons */}
        <div className="onboarding-footer">
          
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
