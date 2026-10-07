import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '' });

  const handleRegister = (e) => {
    e.preventDefault();
    navigate('/select-type', { state: { ...formData } });
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

      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '520px', padding: '40px', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
        
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

        <form onSubmit={handleRegister} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Full Name</label>
            <div className="input-with-icon">
              <User className="input-icon" size={18} />
              <input type="text" className="input-field" placeholder="Enter your full name" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
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

          <button type="submit" className="btn-primary btn-full" style={{ padding: '14px', fontSize: '15px' }}>
            Create Account & Continue &rarr;
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Already registered? <Link to="/login" style={{ fontWeight: '600' }}>Sign in instead &rarr;</Link>
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

export default Register;
