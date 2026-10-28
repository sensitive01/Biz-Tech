import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Store, Users, Map, CheckCircle2, Loader2, Building2 } from 'lucide-react';

const SelectType = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedType, setSelectedType] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [pricingPlans, setPricingPlans] = useState([]);
  
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pricing`);
        if (res.ok) {
          const data = await res.json();
          setPricingPlans(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPricing();
  }, []);

  useEffect(() => {
    // If user is already authenticated and has no pending registration form, redirect to landing
    const token = localStorage.getItem('token');
    if (token && !location.state) {
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  const types = [
    { id: 1, title: 'Type 1: Sole Operator', desc: '1 Owner • 1 Shop • No employee management needed', icon: <Store size={24} /> },
    { id: 2, title: 'Type 2: Single Branch + Staff', desc: '1 Owner • 1 Shop • Includes staff attendance & leaves', icon: <Users size={24} /> },
    { id: 3, title: 'Type 3: Multi-Branch Enterprise', desc: '1 Owner • Multiple Branches • Full employee management', icon: <Map size={24} /> },
    { id: 4, title: 'Type 4: Multi-Business Conglomerate', desc: '1 Owner • Multiple Businesses • Multiple Branches • Full employee management', icon: <Building2 size={24} /> }
  ];

  const getAmountForType = (title) => {
    const plan = pricingPlans.find(p => p.customerType === title || title.includes(p.customerType));
    return plan ? plan.amount : null;
  };

  const handleFinish = async () => {
    // If not coming directly from registration form, allow direct access for testing or existing users
    if (!location.state) {
      setLoading(true);
      setError('');
      localStorage.setItem('tenantType', selectedType.toString());

      try {
        const storedUser = JSON.parse(localStorage.getItem('user')) || {};
        storedUser.businessType = selectedType;
        localStorage.setItem('user', JSON.stringify(storedUser));
      } catch (e) {}

      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetch(`${import.meta.env.VITE_API_URL}/api/auth/onboarding`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ businessType: selectedType })
          });
        } catch (e) {
          console.warn("Could not sync businessType to server in test mode:", e);
        }
      } else {
        // Fallback test session for instant testing access without prior registration
        localStorage.setItem('token', 'dev_test_token');
        localStorage.setItem('user', JSON.stringify({
          fullName: 'Test User',
          email: 'test@biztech.com',
          phone: '+91 9876543210',
          businessType: selectedType,
          modules: ['expenses']
        }));
      }

      setLoading(false);
      navigate('/onboarding', { replace: true });
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...location.state,
          businessType: selectedType
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('onb_')) localStorage.removeItem(key);
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('tenantType', selectedType.toString());
        localStorage.setItem('modules', JSON.stringify(data.user.modules || []));
        navigate('/onboarding', { replace: true });
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', background: 'var(--bg-color)' }}>
      {/* Header */}
      <div className="auth-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, padding: '24px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden' }}>
            <img src="/logo.jpg" alt="BizTech Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-title)', fontFamily: 'Plus Jakarta Sans' }}>BizTech</span>
        </div>
        <button 
          onClick={() => navigate('/')}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          &larr; Back to Home
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="card animate-fade-in auth-card" style={{ maxWidth: '600px', width: '100%' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '8px', textAlign: 'center' }}>Select Your Business Archetype</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px', textAlign: 'center' }}>
            Choose the structure that best fits your business to customize your dashboard.
          </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {types.map(t => {
            const amount = getAmountForType(t.title);
            return (
            <div 
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              style={{
                display: 'flex', gap: '16px', padding: '20px', borderRadius: '12px', cursor: 'pointer',
                border: `2px solid ${selectedType === t.id ? 'var(--primary-blue)' : 'var(--border-color)'}`,
                background: selectedType === t.id ? '#EFF6FF' : 'white',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ color: selectedType === t.id ? 'var(--primary-blue)' : 'var(--text-muted)' }}>
                {t.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div className="type-header-row">
                  <h3 style={{ fontSize: '16px', margin: '0 0 4px 0', color: selectedType === t.id ? 'var(--primary-blue)' : 'var(--text-title)' }}>{t.title}</h3>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary-blue)', background: '#DBEAFE', padding: '4px 12px', borderRadius: '20px' }}>Free Trial</span>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>{t.desc}</p>
              </div>
              {selectedType === t.id && (
                <CheckCircle2 color="var(--primary-blue)" />
              )}
            </div>
          )})}
        </div>

        {error && <div style={{ color: '#EF4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center', background: '#FEF2F2', padding: '8px', borderRadius: '6px' }}>{error}</div>}

        <button onClick={handleFinish} disabled={loading} className="btn-primary" style={{ padding: '14px', fontSize: '16px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
          {loading ? <><Loader2 size={18} className="spin" /> Processing...</> : location.state ? <>Complete Registration &rarr;</> : <>Continue to Onboarding &rarr;</>}
        </button>
      </div>
    </div>
  </div>
  );
};

export default SelectType;