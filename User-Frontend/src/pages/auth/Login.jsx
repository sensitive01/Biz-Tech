import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Clock, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeToggle from '@/components/ThemeToggle';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingApprovalInfo, setPendingApprovalInfo] = useState(null);
  const [rejectionInfo, setRejectionInfo] = useState(null);

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
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('onb_')) localStorage.removeItem(key);
        });
        localStorage.removeItem('impersonatedByAdmin');
        localStorage.removeItem('adminReturnUrl');
        localStorage.removeItem('isEmbedded');

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('tenantType', (data.user.businessType || 1).toString());
        localStorage.setItem('modules', JSON.stringify(data.user.modules || []));

        if (data.user.role === 'business') {
          localStorage.setItem('activeBusiness', data.user.businessName);
        } else {
          localStorage.removeItem('activeBusiness');
        }

        // Check if onboarding is completed
        if (data.requiresOnboarding || data.user?.isOnboardingCompleted === false) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/tenant/dashboard', { replace: true });
        }
      } else {
        if (data.isPendingApproval) {
          setPendingApprovalInfo({
            message: data.message,
            approvalDetails: data.approvalDetails
          });
          setRejectionInfo(null);
          setError('');
        } else if (data.isRejected) {
          setRejectionInfo({
            message: data.message,
            rejectionReason: data.rejectionReason
          });
          setPendingApprovalInfo(null);
          setError('');
        } else {
          setError(data.message || 'Login failed');
          setPendingApprovalInfo(null);
          setRejectionInfo(null);
        }
      }
    } catch (err) {
      setError('Server error. Please try again later.');
      setPendingApprovalInfo(null);
      setRejectionInfo(null);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="card animate-fade-in auth-card" style={{ maxWidth: '440px', zIndex: 1, alignItems: 'center', width: '100%' }}>
        
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

          {/* Pending Approval Notice */}
          {pendingApprovalInfo && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '12px', padding: '16px', marginBottom: '18px', width: '100%', textAlign: 'left', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B45309', fontWeight: '700', fontSize: '14px', marginBottom: '6px' }}>
                <Clock size={18} /> Payment Verification Pending
              </div>
              <p style={{ fontSize: '13px', color: '#92400E', margin: '0 0 10px 0', lineHeight: '1.5' }}>
                {pendingApprovalInfo.message || 'Your payment proof has been submitted and is currently being verified by the platform admin. Once approved, you will be able to log in to your workspace.'}
              </p>
              {pendingApprovalInfo.approvalDetails && (
                <div style={{ background: 'white', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', border: '1px solid #FDE68A', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {pendingApprovalInfo.approvalDetails.planName && (
                    <div><strong style={{ color: '#475569' }}>Plan:</strong> <span style={{ color: '#0F172A', fontWeight: '600' }}>{pendingApprovalInfo.approvalDetails.planName} ({pendingApprovalInfo.approvalDetails.billingCycle || 'Monthly'})</span></div>
                  )}
                  {pendingApprovalInfo.approvalDetails.amount > 0 && (
                    <div><strong style={{ color: '#475569' }}>Total Amount:</strong> <span style={{ color: '#2563EB', fontWeight: '700' }}>₹{pendingApprovalInfo.approvalDetails.amount.toLocaleString()}</span></div>
                  )}
                  {pendingApprovalInfo.approvalDetails.utrNumber && (
                    <div><strong style={{ color: '#475569' }}>Submitted UTR:</strong> <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0F172A', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>{pendingApprovalInfo.approvalDetails.utrNumber}</span></div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Rejection Notice */}
          {rejectionInfo && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '16px', marginBottom: '18px', width: '100%', textAlign: 'left', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontWeight: '700', fontSize: '14px', marginBottom: '6px' }}>
                <AlertTriangle size={18} /> Payment Verification Rejected
              </div>
              <p style={{ fontSize: '13px', color: '#B91C1C', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                {rejectionInfo.message || 'Your payment proof could not be verified by the admin.'}
              </p>
              {rejectionInfo.rejectionReason && (
                <div style={{ background: 'white', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', border: '1px solid #FECACA', color: '#991B1B' }}>
                  <strong>Admin Reason:</strong> {rejectionInfo.rejectionReason}
                </div>
              )}
            </div>
          )}

          {error && !pendingApprovalInfo && !rejectionInfo && (
            <div style={{ color: '#EF4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center', background: '#FEF2F2', padding: '10px', borderRadius: '8px', width: '100%', boxSizing: 'border-box', border: '1px solid #FCA5A5' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="Enter your email ID"
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
                Remember me
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

export default Login;