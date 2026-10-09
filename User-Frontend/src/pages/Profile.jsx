import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, MapPin, Briefcase } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data. Please try again.');
        
        // Fallback to local storage if API fails
        const userStr = localStorage.getItem('user');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div style={{ padding: '32px' }}>Loading profile...</div>;
  }

  if (error && !user) {
    return <div style={{ padding: '32px', color: '#EF4444' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-title)' }}>My Profile</h2>
      
      <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-title)', margin: 0 }}>{user.fullName || 'User Name'}</h3>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '14px' }}>Tenant Account</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ padding: '10px', background: '#F1F5F9', borderRadius: '8px', color: 'var(--text-secondary)' }}>
              <Mail size={20} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Email Address</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '15px', color: 'var(--text-title)', fontWeight: '500' }}>{user.email || 'Not provided'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ padding: '10px', background: '#F1F5F9', borderRadius: '8px', color: 'var(--text-secondary)' }}>
              <Phone size={20} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Phone Number</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '15px', color: 'var(--text-title)', fontWeight: '500' }}>{user.phone || 'Not provided'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ padding: '10px', background: '#F1F5F9', borderRadius: '8px', color: 'var(--text-secondary)' }}>
              <Building size={20} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Business Name</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '15px', color: 'var(--text-title)', fontWeight: '500' }}>{user.businessName || 'Not provided'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ padding: '10px', background: '#F1F5F9', borderRadius: '8px', color: 'var(--text-secondary)' }}>
              <Briefcase size={20} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Industry</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '15px', color: 'var(--text-title)', fontWeight: '500' }}>{user.industry || 'Not provided'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', gridColumn: '1 / -1' }}>
            <div style={{ padding: '10px', background: '#F1F5F9', borderRadius: '8px', color: 'var(--text-secondary)' }}>
              <MapPin size={20} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Address</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '15px', color: 'var(--text-title)', fontWeight: '500' }}>{user.address || 'Not provided'}</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
          <button style={{ padding: '10px 20px', background: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            Edit Profile
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)', marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-title)', margin: '0 0 8px 0' }}>Business Setup Configuration</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px', maxWidth: '500px' }}>
              Did you skip the initial setup? You can resume the onboarding wizard to configure your business structure, branches, products, and employees.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/onboarding'}
            style={{ padding: '12px 24px', background: 'white', color: 'var(--primary-blue)', border: '1px solid var(--primary-blue)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Briefcase size={18} /> Resume Setup
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
