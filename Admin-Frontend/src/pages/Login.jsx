import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hexagon, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('admin@biztech.com');
  const [password, setPassword] = useState('admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin/dashboard');
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Decor */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.03) 0%, rgba(248,249,255,0) 70%)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.03) 0%, rgba(248,249,255,0) 70%)', zIndex: 0 }}></div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', zIndex: 1 }}>
        <div className="card animate-fade-in auth-card" style={{ maxWidth: '440px', alignItems: 'center' }}>
        
        {/* Logo & Header */}
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 8px 16px -4px rgba(37,99,235,0.2)' }}>
          <img src="/logo.jpg" alt="BizTech Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ color: 'var(--primary-blue)', fontWeight: '700', letterSpacing: '1px', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>
          BizTech
        </div>
        <h1 style={{ fontSize: '24px', marginBottom: '12px', textAlign: 'center' }}>Admin Login</h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '14px', marginBottom: '32px', lineHeight: '1.5' }}>
          Sign in to manage customers and business workspaces
        </p>

        {error && <div style={{ color: '#EF4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center', background: '#FEF2F2', padding: '8px', borderRadius: '6px', width: '100%' }}>{error}</div>}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          
          <div className="input-group">
            <label className="input-label">Work Email</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                className="input-field" 
                placeholder="admin@biztech.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0 32px 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--primary-blue)', cursor: 'pointer' }} />
              Remember me
            </label>
            <a href="#" style={{ fontSize: '14px', fontWeight: '500' }}>Forgot password?</a>
          </div>

          <button type="submit" disabled={loading} className="btn-primary btn-full" style={{ padding: '12px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Authenticating...' : 'Sign In \u2192'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '32px', color: 'var(--text-muted)', fontSize: '12px' }}>
          <ShieldCheck size={14} />
          <span>BizTech Enterprise Single Sign-On Ready</span>
        </div>
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 1 }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', gap: '16px' }}>
          <span>&copy; 2025 BizTech Inc.</span>
          <span>&bull;</span>
          <a href="#" style={{ color: 'var(--text-muted)' }}>Privacy</a>
          <span>&bull;</span>
          <a href="#" style={{ color: 'var(--text-muted)' }}>Terms</a>
          <span>&bull;</span>
          <a href="#" style={{ color: 'var(--text-muted)' }}>Support</a>
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
          Designed and developed by <a href="https://sensitive.co.in/" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-blue)', fontWeight: '500' }}>sensitive technologies</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
