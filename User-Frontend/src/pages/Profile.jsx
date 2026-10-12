import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Building, MapPin, 
  FileText, Loader2, Store, Users, Map, 
  Building2, Briefcase, Pencil, Check, X, 
  ShieldCheck, ArrowRight, CheckCircle2,
  Lock, Key, Eye, EyeOff, AlertCircle
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    businessName: '',
    regNo: '',
    address: ''
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const getArchetypeInfo = (type) => {
    switch (Number(type)) {
      case 1:
        return { 
          label: 'Type 1: Sole Operator', 
          desc: '1 Owner • 1 Shop • Direct operations',
          icon: Store,
          bg: '#EEF2FF',
          color: '#4338CA',
          border: '#E0E7FF'
        };
      case 2:
        return { 
          label: 'Type 2: Single Branch + Staff', 
          desc: '1 Owner • 1 Shop • Includes staff attendance & leaves',
          icon: Users,
          bg: '#ECFDF5',
          color: '#065F46',
          border: '#D1FAE5'
        };
      case 3:
        return { 
          label: 'Type 3: Multi-Branch Enterprise', 
          desc: '1 Owner • Multiple Branches • Full employee management',
          icon: Map,
          bg: '#F5F3FF',
          color: '#6B21A8',
          border: '#EDE9FE'
        };
      case 4:
        return { 
          label: 'Type 4: Multi-Business Conglomerate', 
          desc: '1 Owner • Multiple Businesses • Multi-Branch management',
          icon: Building2,
          bg: '#FFF7ED',
          color: '#C2410C',
          border: '#FFEDD5'
        };
      default:
        return { 
          label: 'Tenant Account', 
          desc: 'Standard Business Plan',
          icon: Building,
          bg: '#F1F5F9',
          color: '#475569',
          border: '#E2E8F0'
        };
    }
  };

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
        setFormData({
          fullName: data.fullName || '',
          phone: data.businessPhone || data.phone || '',
          businessName: data.businessName || '',
          regNo: data.regNo || '',
          address: data.address || ''
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data.');
        
        // Fallback to local storage if API fails
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const parsed = JSON.parse(userStr);
          setUser(parsed);
          setFormData({
            fullName: parsed.fullName || '',
            phone: parsed.businessPhone || parsed.phone || '',
            businessName: parsed.businessName || '',
            regNo: parsed.regNo || '',
            address: parsed.address || ''
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleStartEdit = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.businessPhone || user.phone || '',
        businessName: user.businessName || '',
        regNo: user.regNo || '',
        address: user.address || ''
      });
    }
    setSaveSuccess(false);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.businessPhone || user.phone || '',
        businessName: user.businessName || '',
        regNo: user.regNo || '',
        address: user.address || ''
      });
    }
    setIsEditing(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          businessPhone: formData.phone,
          businessName: formData.businessName,
          regNo: formData.regNo,
          address: formData.address
        })
      });

      if (response.ok) {
        const updated = await response.json();
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        window.dispatchEvent(new Event('userProfileUpdated'));
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from your current password.');
      return;
    }

    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/change-password`, {
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

      const data = await response.json();
      if (response.ok) {
        setPasswordSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setPasswordSuccess(''), 5000);
      } else {
        setPasswordError(data.message || 'Failed to change password. Please check your current password.');
      }
    } catch (err) {
      console.error(err);
      setPasswordError('Network error while changing password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Loader2 size={32} className="spin" style={{ margin: '0 auto 16px auto', color: 'var(--primary-blue)' }} />
        <p style={{ fontSize: '15px', fontWeight: '500' }}>Loading profile details...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: '600px', margin: '40px auto', textAlign: 'center', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '12px', color: '#991B1B' }}>
        <p style={{ fontWeight: '600', marginBottom: '8px' }}>Unable to load profile</p>
        <p style={{ fontSize: '14px', margin: 0 }}>{error}</p>
      </div>
    );
  }

  const archetype = user ? getArchetypeInfo(user.businessType) : getArchetypeInfo(1);
  const ArchetypeIcon = archetype.icon;

  return (
    <div style={{ padding: '32px 24px', maxWidth: '920px', margin: '0 auto', width: '100%' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-title)', letterSpacing: '-0.5px', margin: 0 }}>
            My Profile
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '4px 0 0 0' }}>
            Manage your personal credentials, contact info, business profile, and account security.
          </p>
        </div>

        {!isEditing && (
          <button 
            onClick={handleStartEdit}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '14px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(37,99,235,0.2)' }}
          >
            <Pencil size={15} /> Edit Profile
          </button>
        )}
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '12px 18px', borderRadius: '8px', marginBottom: '24px' }}>
          <CheckCircle2 size={18} color="#059669" />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Your profile details have been successfully updated!</span>
        </div>
      )}

      {/* Hero Overview Card */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '28px 32px', 
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)', 
        border: '1px solid var(--border-color)',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: '76px', 
            height: '76px', 
            borderRadius: '20px', 
            background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '30px', 
            fontWeight: '700', 
            boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.3)',
            flexShrink: 0
          }}>
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-title)', margin: 0 }}>
                {user?.fullName || 'Business Owner'}
              </h2>
              {user?.userId && (
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  padding: '3px 10px', 
                  borderRadius: '12px', 
                  fontSize: '11px', 
                  fontWeight: '700', 
                  background: '#F1F5F9', 
                  color: '#334155', 
                  border: '1px solid #E2E8F0',
                  fontFamily: 'monospace'
                }}>
                  ID: {user.userId}
                </span>
              )}
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '5px', 
                padding: '3px 10px', 
                borderRadius: '12px', 
                fontSize: '11px', 
                fontWeight: '600', 
                background: '#ECFDF5', 
                color: '#059669', 
                border: '1px solid #D1FAE5' 
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }}></span> Active Tenant
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 10px 0', fontSize: '14px' }}>
              {user?.email}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '12px', 
                fontWeight: '600', 
                background: archetype.bg, 
                color: archetype.color, 
                border: `1px solid ${archetype.border}` 
              }}>
                <ArchetypeIcon size={14} /> {archetype.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Details Form */}
      <form onSubmit={handleSaveProfile}>

        {/* Section 1: Personal Information */}
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '28px 32px', 
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)', 
          border: '1px solid var(--border-color)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-title)', margin: 0 }}>Personal Information</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Your identity details and primary contact channel</p>
            </div>
          </div>

          {!isEditing ? (
            /* View Mode */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              
              <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <User size={15} />
                  <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</span>
                </div>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--text-title)' }}>
                  {user?.fullName || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: '400' }}>Not specified</span>}
                </p>
              </div>

              <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                    <Mail size={15} />
                    <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#059669', background: '#ECFDF5', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>Login ID</span>
                </div>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--text-title)' }}>
                  {user?.email || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: '400' }}>Not specified</span>}
                </p>
              </div>

              <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <Phone size={15} />
                  <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</span>
                </div>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--text-title)' }}>
                  {user?.businessPhone || user?.phone || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: '400' }}>Not configured</span>}
                </p>
              </div>

              <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <ShieldCheck size={15} />
                  <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tenant User ID</span>
                </div>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--primary-blue)', fontFamily: 'monospace' }}>
                  {user?.userId || 'N/A'}
                </p>
              </div>

            </div>
          ) : (
            /* Inline Edit Mode */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} color="var(--primary-blue)" /> Full Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.fullName} 
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })} 
                  placeholder="e.g. John Doe"
                  required 
                  style={{ height: '42px', fontSize: '14px' }}
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} color="var(--text-muted)" /> Email Address
                </label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={user?.email || ''} 
                  disabled 
                  style={{ height: '42px', fontSize: '14px', background: '#F8FAFC', color: 'var(--text-secondary)', cursor: 'not-allowed' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Email cannot be changed directly as it is your account login.</span>
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} color="var(--primary-blue)" /> Phone Number
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                  placeholder="e.g. +91 9876543210"
                  style={{ height: '42px', fontSize: '14px' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Business Information */}
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '28px 32px', 
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)', 
          border: '1px solid var(--border-color)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-title)', margin: 0 }}>Business Information</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Registered commercial entity and official premises</p>
            </div>
          </div>

          {!isEditing ? (
            /* View Mode */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              
              <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <Building size={15} />
                  <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Business / Shop Name</span>
                </div>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: user?.businessName ? 'var(--text-title)' : 'var(--text-muted)', fontStyle: user?.businessName ? 'normal' : 'italic' }}>
                  {user?.businessName || 'Not configured'}
                </p>
              </div>

              <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <FileText size={15} />
                  <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registration / GSTIN No.</span>
                </div>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: user?.regNo ? 'var(--text-title)' : 'var(--text-muted)', fontStyle: user?.regNo ? 'normal' : 'italic' }}>
                  {user?.regNo || 'Not configured'}
                </p>
              </div>

              <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9', gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <MapPin size={15} />
                  <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Primary Address</span>
                </div>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: user?.address ? '500' : '400', color: user?.address ? 'var(--text-title)' : 'var(--text-muted)', fontStyle: user?.address ? 'normal' : 'italic', lineHeight: '1.5' }}>
                  {user?.address || 'Not configured'}
                </p>
              </div>

            </div>
          ) : (
            /* Inline Edit Mode */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building size={14} color="#7C3AED" /> Business / Shop Name
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.businessName} 
                  onChange={e => setFormData({ ...formData, businessName: e.target.value })} 
                  placeholder="e.g. Acme Retailers"
                  style={{ height: '42px', fontSize: '14px' }}
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} color="#7C3AED" /> Registration / GSTIN No.
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.regNo} 
                  onChange={e => setFormData({ ...formData, regNo: e.target.value })} 
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  style={{ height: '42px', fontSize: '14px' }}
                />
              </div>

              <div className="input-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#7C3AED" /> Primary Business Address
                </label>
                <textarea 
                  className="input-field" 
                  rows="3" 
                  value={formData.address} 
                  onChange={e => setFormData({ ...formData, address: e.target.value })} 
                  placeholder="Street address, City, State, PIN code..."
                  style={{ fontSize: '14px', resize: 'vertical' }}
                />
              </div>

            </div>
          )}

          {/* Action Bar when in Edit Mode */}
          {isEditing && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              alignItems: 'center', 
              gap: '12px', 
              marginTop: '28px', 
              paddingTop: '20px', 
              borderTop: '1px solid var(--border-color)' 
            }}>
              <button 
                type="button" 
                onClick={handleCancelEdit} 
                disabled={saving}
                className="btn-secondary" 
                style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '14px' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving} 
                className="btn-primary" 
                style={{ padding: '10px 26px', borderRadius: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} /> Save Changes
                  </>
                )}
              </button>
            </div>
          )}

        </div>

      </form>

      {/* Section 3: Account Security & Password Change */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '28px 32px', 
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)', 
        border: '1px solid var(--border-color)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-title)', margin: 0 }}>Security & Password</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Update your account password to ensure your tenant credentials remain secure</p>
          </div>
        </div>

        {passwordError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            <AlertCircle size={18} color="#DC2626" />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            <CheckCircle2 size={18} color="#059669" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
            
            {/* Row 1: Current Password */}
            <div style={{ maxWidth: '420px', width: '100%' }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} color="var(--text-muted)" /> Current Password <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showCurrentPassword ? "text" : "password"} 
                    className="input-field" 
                    value={passwordData.currentPassword} 
                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} 
                    placeholder="Enter current password"
                    required 
                    style={{ height: '42px', fontSize: '14px', paddingRight: '40px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: New Password & Confirm New Password in the same line */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              
              {/* New Password */}
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={14} color="var(--text-muted)" /> New Password <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    className="input-field" 
                    value={passwordData.newPassword} 
                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
                    placeholder="Min 6 characters"
                    required 
                    style={{ height: '42px', fontSize: '14px', paddingRight: '40px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>At least 6 characters required.</span>
              </div>

              {/* Confirm New Password */}
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} color="var(--text-muted)" /> Confirm New Password <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    className="input-field" 
                    value={passwordData.confirmPassword} 
                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
                    placeholder="Re-enter new password"
                    required 
                    style={{ height: '42px', fontSize: '14px', paddingRight: '40px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              disabled={passwordLoading}
              className="btn-primary" 
              style={{ padding: '10px 24px', borderRadius: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', background: '#0F172A' }}
            >
              {passwordLoading ? (
                <>
                  <Loader2 size={16} className="spin" /> Updating Password...
                </>
              ) : (
                <>
                  <Lock size={15} /> Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Section 4: Business Setup & Architecture Card */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '24px 32px', 
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)', 
        border: '1px solid var(--border-color)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: archetype.bg, color: archetype.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArchetypeIcon size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-title)', margin: 0 }}>
                  {archetype.label}
                </h4>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• Current Tier</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '13px' }}>
                {archetype.desc}
              </p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/onboarding')}
            style={{ 
              padding: '10px 20px', 
              background: '#F8FAFC', 
              color: 'var(--primary-blue)', 
              border: '1px solid #E2E8F0', 
              borderRadius: '8px', 
              fontWeight: '600', 
              fontSize: '13px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#BFDBFE'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
          >
            <Briefcase size={15} /> Resume Setup Wizard <ArrowRight size={14} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Profile;
