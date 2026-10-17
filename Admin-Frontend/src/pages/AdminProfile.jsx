import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, ShieldCheck, Briefcase, 
  Building, Lock, Eye, EyeOff, Save, CheckCircle2, 
  AlertCircle, Edit2, Key, Calendar, Shield, Loader2, X 
} from 'lucide-react';

const AdminProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile data
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@biztech.com',
    phone: '+91 98765 43210',
    role: 'Superadmin',
    designation: 'Platform Administrator',
    department: 'Operations & Security',
    createdAt: new Date().toISOString()
  });

  const [formData, setFormData] = useState({ ...profile });

  // Password data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData(data);
        localStorage.setItem('adminUser', JSON.stringify(data));
        window.dispatchEvent(new Event('adminProfileUpdated'));
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          designation: formData.designation,
          department: formData.department
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setFormData(updated);
        setIsEditing(false);
        setSuccessMsg('Profile information updated successfully!');
        localStorage.setItem('adminUser', JSON.stringify(updated));
        window.dispatchEvent(new Event('adminProfileUpdated'));
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error while updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setPasswordLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordSuccess('Password has been changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordSuccess(''), 4000);
      } else {
        setPasswordError(data.message || 'Failed to update password.');
      }
    } catch (err) {
      console.error(err);
      setPasswordError('Network error while changing password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'AU';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '12px', color: '#64748B' }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '15px', fontWeight: '500' }}>Loading Administrator Profile...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      
      {/* Top Breadcrumb & Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={14} /> ADMINISTRATOR ACCOUNT
          </div>
          <h1 style={{ fontSize: '28px', margin: '0 0 6px 0', color: 'var(--text-title)' }}>My Profile</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            Manage your superadmin credentials, contact information, and security preferences.
          </p>
        </div>

        {!isEditing && (
          <button 
            type="button"
            onClick={() => { setIsEditing(true); setFormData({ ...profile }); }}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '14px' }}
          >
            <Edit2 size={16} /> Edit Profile
          </button>
        )}
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '14px 18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
          <CheckCircle2 size={18} color="#10B981" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '14px 18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
          <AlertCircle size={18} color="#EF4444" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="card" style={{ padding: '28px', background: 'white', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ 
          width: '84px', 
          height: '84px', 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '30px', 
          fontWeight: '700',
          boxShadow: '0 8px 16px -4px rgba(37,99,235,0.3)',
          flexShrink: 0 
        }}>
          {getInitials(profile.name)}
        </div>

        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', margin: 0, color: 'var(--text-title)' }}>
              {profile.name}
            </h2>
            <span style={{ 
              background: '#EFF6FF', 
              color: '#2563EB', 
              border: '1px solid #BFDBFE', 
              padding: '3px 10px', 
              borderRadius: '20px', 
              fontSize: '12px', 
              fontWeight: '700', 
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <ShieldCheck size={13} /> {profile.role || 'Superadmin'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={15} color="#94A3B8" /> {profile.email}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={15} color="#94A3B8" /> {profile.phone || '+91 98765 43210'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={15} color="#94A3B8" /> {profile.designation || 'Platform Administrator'}
            </span>
          </div>
        </div>

        <div style={{ background: '#F8FAFC', padding: '12px 18px', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Account Status</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginTop: '2px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></div>
            Active & Verified
          </div>
          <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
            Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2025'}
          </div>
        </div>
      </div>

      {/* Main Content Grid: Personal Info & Security */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '24px' }}>
        
        {/* Card 1: Personal & Organization Info */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', background: 'white', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '20px 24px', background: '#F8FAFC', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', margin: 0, fontWeight: '700', color: 'var(--text-title)' }}>Profile Information</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Admin contact and designation details</span>
              </div>
            </div>

            {isEditing && (
              <button 
                type="button" 
                onClick={() => { setIsEditing(false); setFormData({ ...profile }); }}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
              >
                <X size={15} /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleProfileSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ fontWeight: '600', fontSize: '13px' }}>Full Name</label>
              <input 
                type="text" 
                className="input-field"
                disabled={!isEditing}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ background: isEditing ? 'white' : '#F8FAFC', cursor: isEditing ? 'text' : 'not-allowed' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontWeight: '600', fontSize: '13px' }}>Email Address</label>
                <input 
                  type="email" 
                  className="input-field"
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{ background: isEditing ? 'white' : '#F8FAFC', cursor: isEditing ? 'text' : 'not-allowed' }}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontWeight: '600', fontSize: '13px' }}>Phone Number</label>
                <input 
                  type="text" 
                  className="input-field"
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ background: isEditing ? 'white' : '#F8FAFC', cursor: isEditing ? 'text' : 'not-allowed' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontWeight: '600', fontSize: '13px' }}>Designation / Title</label>
                <input 
                  type="text" 
                  className="input-field"
                  disabled={!isEditing}
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  style={{ background: isEditing ? 'white' : '#F8FAFC', cursor: isEditing ? 'text' : 'not-allowed' }}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontWeight: '600', fontSize: '13px' }}>Department</label>
                <input 
                  type="text" 
                  className="input-field"
                  disabled={!isEditing}
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  style={{ background: isEditing ? 'white' : '#F8FAFC', cursor: isEditing ? 'text' : 'not-allowed' }}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ fontWeight: '600', fontSize: '13px' }}>System Role</label>
              <input 
                type="text" 
                className="input-field"
                disabled
                value={`${profile.role} (Master System Authority)`}
                style={{ background: '#F1F5F9', color: '#475569', cursor: 'not-allowed', fontWeight: '500' }}
              />
              <span style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>Administrative role is locked by system hierarchy.</span>
            </div>

            {isEditing && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => { setIsEditing(false); setFormData({ ...profile }); }}
                  className="btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '14px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="btn-primary"
                  style={{ padding: '10px 22px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Card 2: Security & Password Change */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', background: 'white', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '20px 24px', background: '#F8FAFC', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', margin: 0, fontWeight: '700', color: 'var(--text-title)' }}>Security & Password</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Update your administrative login password</span>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {passwordSuccess && (
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <AlertCircle size={16} color="#EF4444" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ fontWeight: '600', fontSize: '13px' }}>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showCurrentPassword ? "text" : "password"} 
                  className="input-field"
                  placeholder="Enter current password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  style={{ paddingRight: '40px' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)} 
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex' }}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ fontWeight: '600', fontSize: '13px' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  className="input-field"
                  placeholder="Enter new strong password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  style={{ paddingRight: '40px' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)} 
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex' }}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ fontWeight: '600', fontSize: '13px' }}>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  className="input-field"
                  placeholder="Re-enter new password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  style={{ paddingRight: '40px' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex' }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ marginTop: '8px' }}>
              <button 
                type="submit" 
                disabled={passwordLoading}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {passwordLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Lock size={16} />}
                Update Password
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Permissions & Security Summary */}
      <div className="card" style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0', color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="#2563EB" /> Superadmin Permissions Matrix
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A', marginBottom: '4px' }}>Tenant Impersonation</div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>Full read/write workspace access into any client account</div>
          </div>
          <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A', marginBottom: '4px' }}>Subscription Management</div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>Activate, suspend, upgrade, or modify billing plans</div>
          </div>
          <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A', marginBottom: '4px' }}>Customer Directory Control</div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>Onboard new enterprises and manage credentials</div>
          </div>
          <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A', marginBottom: '4px' }}>Pricing & Tier Customization</div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>Update base rate cards for all 4 business archetypes</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminProfile;
