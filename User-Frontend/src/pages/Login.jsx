import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('tenantType', data.user.businessType.toString());
        localStorage.setItem('modules', JSON.stringify(data.user.modules || []));
        navigate('/tenant/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Top Logo */}
      <div style={{ position: 'absolute', top: 32, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden' }}>
          <img src="/logo.jpg" alt="BizTech Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-title)', fontFamily: 'Plus Jakarta Sans' }}>BizTech</span>
      </div>

      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '48px 40px', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', background: '#EFF6FF', padding: '6px 12px', borderRadius: '16px' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '4px', overflow: 'hidden' }}>
            <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ color: 'var(--primary-blue)', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>BizTech Cloud Suite</span>
        </div>
        
        <h1 style={{ fontSize: '24px', marginBottom: '12px', textAlign: 'center' }}>Sign In to Your Workspace</h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '14px', marginBottom: '32px', lineHeight: '1.5' }}>
          Access your store dashboard, inventory, and business tools
        </p>

        {error && <div style={{ color: '#EF4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center', background: '#FEF2F2', padding: '8px', borderRadius: '6px', width: '100%' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Business Email</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                className="input-field" 
                placeholder="Enter your mail ID"
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                className="input-field" 
                placeholder="••••••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="input-action-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '-4px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--primary-blue)', cursor: 'pointer' }} />
              Remember this device
            </label>
            <a href="#" style={{ fontSize: '13px', fontWeight: '500' }}>Forgot password?</a>
          </div>

          <button type="submit" disabled={loading} className="btn-primary btn-full" style={{ padding: '14px', fontSize: '15px', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In to Portal \u2192'}
          </button>
        </form>

        <div style={{ width: '100%', textAlign: 'center', marginTop: '24px', padding: '16px', background: '#F8FAFC', borderRadius: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Don't have an account yet? <Link to="/register" style={{ fontWeight: '600' }}>Register here</Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
          <ShieldCheck size={14} />
          <span>Enterprise 256-bit SSL Encrypted • Fast & Secure</span>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '32px', display: 'flex', gap: '24px', fontSize: '12px', color: 'var(--text-muted)' }}>
        <a href="#" style={{ color: 'var(--text-muted)' }}>Terms</a>
        <span>&bull;</span>
        <a href="#" style={{ color: 'var(--text-muted)' }}>Privacy</a>
        <span>&bull;</span>
        <a href="#" style={{ color: 'var(--text-muted)' }}>Support</a>
      </div>
    </div>
  );
};

export default Login;
