import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || 'Error checking email');
      } else {
        navigate('/select-type', { state: { ...formData } });
      }
    } catch (err) {
      setError('Server error, please try again later');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Header */}
      <div className="auth-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden' }}>
            <img src="/logo.jpg" alt="BizTech Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-title)', fontFamily: 'Plus Jakarta Sans' }}>BizTech</span>
        </div>
        <LanguageSelector />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="card animate-fade-in auth-card" style={{ maxWidth: '520px', zIndex: 1 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '6px', overflow: 'hidden' }}>
            <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ color: 'var(--primary-blue)', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>BizTech Access</span>
        </div>

        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Create Your BizTech Account</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
          Step into seamless operations. Free 14-day trial, no credit card required.
        </p>

        {error && <div style={{ color: '#EF4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center', background: '#FEF2F2', padding: '12px', borderRadius: '8px', border: '1px solid #FECACA' }}>{error}</div>}

        <form onSubmit={handleRegister} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Full Name</label>
            <div className="input-with-icon">
              <User className="input-icon" size={18} />
              <input type="text" className="input-field" placeholder="Enter your full name" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
            </div>
          </div>

          <div className="auth-form-row">
            <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
              <label className="input-label">Business Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input type="email" className="input-field" placeholder="Enter your email address" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
              <label className="input-label">Phone Number</label>
              <div className="input-with-icon">
                <Phone className="input-icon" size={18} />
                <input type="tel" className="input-field" placeholder="Enter your Phone number" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Create Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input type={showPassword ? "text" : "password"} className="input-field" placeholder="••••••••••••" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              <div className="input-action-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', margin: '8px 0 16px 0' }}>
            <input type="checkbox" required style={{ marginTop: '4px', width: '16px', height: '16px', accentColor: 'var(--primary-blue)', cursor: 'pointer' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </span>
          </div>

          <button type="submit" disabled={loading} className="btn-primary btn-full" style={{ padding: '14px', fontSize: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
            {loading ? <><Loader2 size={18} className="spin" /> Verifying...</> : <>Create Account & Continue &rarr;</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Already registered? <Link to="/login" style={{ fontWeight: '600' }}>Sign in instead &rarr;</Link>
        </div>
        </div>
      </div>
      
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '12px', color: 'var(--text-muted)' }}>
        <a href="#" style={{ color: 'var(--text-muted)' }}>Terms</a>
        <span>&bull;</span>
        <a href="#" style={{ color: 'var(--text-muted)' }}>Privacy</a>
        <span>&bull;</span>
        <a href="#" style={{ color: 'var(--text-muted)' }}>Support</a>
      </div>
    </div>
  );
};

export default Register;
