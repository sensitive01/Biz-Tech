import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Archive, ShoppingCart, TrendingUp, Receipt, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

const SelectModules = () => {
  const navigate = useNavigate();
  const [selectedModules, setSelectedModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MODULES = [
    { id: 'products_services', title: 'Products & Services', desc: 'Manage your catalog, pricing, and service offerings', icon: <Package size={24} /> },
    { id: 'inventory', title: 'Stock / Inventory', desc: 'Track physical goods, warehouses, and low-stock alerts', icon: <Archive size={24} /> },
    { id: 'sales', title: 'Sales & Invoicing', desc: 'Record customer orders, invoicing, and POS transactions', icon: <TrendingUp size={24} /> },
    { id: 'purchases', title: 'Purchases', desc: 'Manage supplier orders and incoming stock shipments', icon: <ShoppingCart size={24} /> },
    { id: 'expenses', title: 'Expenses', desc: 'Log company spending, bills, and operational costs', icon: <Receipt size={24} /> }
  ];

  const toggleModule = (id) => {
    setSelectedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/update-modules`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ modules: selectedModules }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('modules', JSON.stringify(data.user.modules));
        navigate('/tenant/dashboard');
      } else {
        setError(data.message || 'Failed to save modules');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg-color)' }}>
      <div className="card animate-fade-in auth-card" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', textAlign: 'center' }}>Tailor Your Workspace</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '32px', textAlign: 'center', maxWidth: '600px', margin: '0 auto 32px auto' }}>
          Select the core modules you need for your business. You can always change these later in your settings.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {MODULES.map(m => {
            const isSelected = selectedModules.includes(m.id);
            return (
              <div 
                key={m.id}
                onClick={() => toggleModule(m.id)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', borderRadius: '16px', cursor: 'pointer',
                  border: `2px solid ${isSelected ? 'var(--primary-blue)' : 'var(--border-color)'}`,
                  background: isSelected ? '#EFF6FF' : 'white',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                <div style={{ color: isSelected ? 'var(--primary-blue)' : 'var(--text-muted)' }}>
                  {m.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', margin: '0 0 8px 0', color: isSelected ? 'var(--primary-blue)' : 'var(--text-title)' }}>{m.title}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{m.desc}</p>
                </div>
                {isSelected && (
                  <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                    <CheckCircle2 color="var(--primary-blue)" size={20} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {error && <div style={{ color: '#EF4444', fontSize: '14px', marginBottom: '24px', textAlign: 'center', background: '#FEF2F2', padding: '12px', borderRadius: '8px' }}>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={handleComplete} 
            disabled={loading || selectedModules.length === 0} 
            className="btn-primary" 
            style={{ padding: '14px 32px', fontSize: '16px', minWidth: '240px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: (loading || selectedModules.length === 0) ? 0.7 : 1 }}
          >
            {loading ? <><Loader2 size={18} className="spin" /> Saving...</> : <>Go to Dashboard <ArrowRight size={18} /></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectModules;
