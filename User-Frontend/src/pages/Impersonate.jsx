import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Impersonate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (!token) {
      setError('Missing authentication token for impersonation.');
      return;
    }

    try {
      let user = null;
      if (userParam) {
        user = JSON.parse(decodeURIComponent(userParam));
      }

      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('tenantType', String(user.businessType || 1));
        localStorage.setItem('modules', JSON.stringify(user.modules || []));
      }
      localStorage.setItem('impersonatedByAdmin', 'true');
      const isEmbedded = searchParams.get('embedded') === 'true';
      if (isEmbedded) {
        localStorage.setItem('isEmbedded', 'true');
      } else {
        localStorage.removeItem('isEmbedded');
      }

      // Notify any listeners
      window.dispatchEvent(new Event('userProfileUpdated'));

      // If user details need refresh, fetch /api/auth/me
      if (!user) {
        fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(userData => {
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('tenantType', String(userData.businessType || 1));
            localStorage.setItem('modules', JSON.stringify(userData.modules || []));
            window.dispatchEvent(new Event('userProfileUpdated'));
            navigate('/tenant/dashboard', { replace: true });
          })
          .catch(() => {
            navigate('/tenant/dashboard', { replace: true });
          });
      } else {
        navigate('/tenant/dashboard', { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to setup impersonation session.');
    }
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '24px', fontFamily: 'sans-serif' }}>
        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ color: '#EF4444', margin: '0 0 12px 0', fontSize: '20px' }}>Session Error</h2>
          <p style={{ color: '#64748B', margin: '0 0 20px 0', fontSize: '14px' }}>{error}</p>
          <Link to="/login" style={{ display: 'inline-block', padding: '10px 20px', background: '#2563EB', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', gap: '16px', fontFamily: 'sans-serif' }}>
      <Loader2 size={36} color="#2563EB" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <div style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A' }}>Entering User Workspace...</div>
      <div style={{ fontSize: '13px', color: '#64748B' }}>Preparing tenant dashboard and modules</div>
    </div>
  );
};

export default Impersonate;