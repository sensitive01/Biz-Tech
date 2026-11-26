import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  Sparkles,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  ArrowRight
} from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeToggle from '@/components/ThemeToggle';

const Register = () => {
  const navigate = useNavigate();

  // Three registration tabs: 'business' | 'career' | 'pro'
  // Initially 'pro' (Pro Business Registration) is selected by default
  const [activeTab, setActiveTab] = useState('pro');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Form Fields (Only Name, Email, Phone, Password)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenantType');
    localStorage.removeItem('modules');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = (formData.name || '').trim();
    if (!cleanName) {
      setError(activeTab === 'career' ? 'Please enter your full name.' : 'Please enter your business name.');
      return;
    }

    const cleanEmail = (formData.email || '').trim();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    const cleanPhone = (formData.phone || '').trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setLoading(true);

    try {
      const accountType = activeTab === 'business'
        ? 'free_business'
        : (activeTab === 'career' ? 'free_career' : 'pro_business');

      const payload = {
        fullName: cleanName,
        businessName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: formData.password,
        accountType,
        businessType: 1
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed');
        setLoading(false);
        return;
      }

      // Store authentication tokens
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('tenantType', '1');
      localStorage.setItem('modules', JSON.stringify(data.user?.modules || ['expenses', 'sales']));

      // Navigation based on selected tab:
      // - Pro Business -> Opens Onboarding page
      // - Business Registration -> Opens Business Setup page
      // - Career Registration -> Opens Career Setup page
      if (activeTab === 'pro') {
        navigate('/onboarding', { replace: true });
      } else if (activeTab === 'business') {
        navigate('/business/setup', { replace: true });
      } else if (activeTab === 'career') {
        navigate('/career/setup', { replace: true });
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Server error, please try again later');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', background: '#F8FAFC' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: 'white', borderBottom: '1px solid #E2E8F0', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', overflow: 'hidden' }}>
            <img src="/logo.jpg" alt="BizTech Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.5px' }}>BizTech</span>
            <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: '700', marginLeft: '6px', textTransform: 'uppercase', background: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>Platform</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </div>

      {/* Main Registration Container */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 16px' }}>
        
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '560px', background: 'white', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0', padding: '36px' }}>
          
          {/* Card Header */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', marginBottom: '10px' }}>
              <ShieldCheck size={14} /> Quick Account Registration
            </div>
            <h1 style={{ fontSize: '25px', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
              Create Your BizTech Account
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
              Select your registration type below to get started.
            </p>
          </div>

          {/* ============================================================== */}
          {/* THREE TABS AT THE TOP OF THE REGISTRATION PAGE                 */}
          {/* ============================================================== */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: '#F1F5F9', borderRadius: '12px', padding: '4px', gap: '4px', marginBottom: '22px' }}>
            
            {/* Tab 1: Business Registration */}
            <button
              type="button"
              onClick={() => { setActiveTab('business'); setError(''); }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 4px',
                borderRadius: '9px',
                border: 'none',
                background: activeTab === 'business' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'business' ? '#2563EB' : '#64748B',
                cursor: 'pointer',
                boxShadow: activeTab === 'business' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700', fontSize: '12.5px' }}>
                <Building2 size={15} />
                <span>Business</span>
              </div>
              <span style={{ fontSize: '10.5px', marginTop: '2px', color: activeTab === 'business' ? '#16A34A' : '#94A3B8', fontWeight: '600' }}>
                Free Profile
              </span>
            </button>

            {/* Tab 2: Career Registration */}
            <button
              type="button"
              onClick={() => { setActiveTab('career'); setError(''); }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 4px',
                borderRadius: '9px',
                border: 'none',
                background: activeTab === 'career' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'career' ? '#2563EB' : '#64748B',
                cursor: 'pointer',
                boxShadow: activeTab === 'career' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700', fontSize: '12.5px' }}>
                <Briefcase size={15} />
                <span>Career</span>
              </div>
              <span style={{ fontSize: '10.5px', marginTop: '2px', color: activeTab === 'career' ? '#16A34A' : '#94A3B8', fontWeight: '600' }}>
                Free Profile
              </span>
            </button>

            {/* Tab 3: Pro Business Registration (Selected Initially by default) */}
            <button
              type="button"
              onClick={() => { setActiveTab('pro'); setError(''); }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 4px',
                borderRadius: '9px',
                border: 'none',
                background: activeTab === 'pro' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'pro' ? '#2563EB' : '#64748B',
                cursor: 'pointer',
                boxShadow: activeTab === 'pro' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700', fontSize: '12.5px' }}>
                <Sparkles size={15} />
                <span>Pro Business</span>
              </div>
              <span style={{ fontSize: '10.5px', marginTop: '2px', color: activeTab === 'pro' ? '#2563EB' : '#94A3B8', fontWeight: '600' }}>
                ERP Suite
              </span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ color: '#EF4444', fontSize: '13.5px', marginBottom: '18px', textAlign: 'center', background: '#FEF2F2', padding: '12px', borderRadius: '10px', border: '1px solid #FECACA' }}>
              {error}
            </div>
          )}

          {/* ============================================================== */}
          {/* ONLY 4 FIELDS: NAME, EMAIL, PHONE, PASSWORD                    */}
          {/* ============================================================== */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Field 1: Name (Business Name for Pro/Business, Full Name for Career) */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                {activeTab === 'career' ? 'Full Name *' : 'Business Name *'}
              </label>
              <div style={{ position: 'relative' }}>
                {activeTab === 'career' ? (
                  <User size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                ) : (
                  <Building2 size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                )}
                <input
                  type="text"
                  placeholder={activeTab === 'career' ? 'Enter your full name' : 'Enter your business name'}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', height: '44px', padding: '0 14px 0 42px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Field 2: Email Address */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                {activeTab === 'career' ? 'Email Address *' : 'Business Email Address *'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{ width: '100%', height: '44px', padding: '0 14px 0 42px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Field 3: Mobile Number (10 digits) */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Mobile Number (10 digits) *
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter 10-digit number"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  required
                  style={{ width: '100%', height: '44px', padding: '0 14px 0 42px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Field 4: Password */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Create Password (min. 6 characters) *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                  style={{ width: '100%', height: '44px', padding: '0 42px 0 42px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '13px', cursor: 'pointer', color: '#94A3B8' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '2px' }}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                required
                style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#2563EB', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.4' }}>
                I agree to the <a href="#" style={{ color: '#2563EB', textDecoration: 'none' }}>Terms of Service</a> and <a href="#" style={{ color: '#2563EB', textDecoration: 'none' }}>Privacy Policy</a>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                marginTop: '4px'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account &rarr;</span>
                </>
              )}
            </button>

          </form>

          {/* Already registered footer */}
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748B' }}>
            Already registered? <Link to="/login" style={{ color: '#2563EB', fontWeight: '700', textDecoration: 'none' }}>Sign in instead &rarr;</Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Register;
