import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Phone,
  Edit3,
  LogOut,
  X,
  Truck,
  Award,
  Share2,
  GraduationCap,
  Briefcase
} from 'lucide-react';

const CareerProfileView = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [modalCustomSkill, setModalCustomSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/directory/my-profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        const cp = data.careerProfile || {};
        setEditForm({
          fullName: cp.fullName || data.fullName,
          jobCategory: cp.jobCategory || 'Commercial Driver & Transport',
          skills: cp.skills?.length ? cp.skills : (data.tags || []),
          experience: cp.experience || '1-2 Years',
          expectedSalary: cp.expectedSalary || '',
          city: cp.city || '',
          currentArea: cp.currentArea || '',
          pincode: cp.pincode || '',
          contactPhone: cp.contactPhone || data.phone,
          whatsappNumber: cp.whatsappNumber || cp.contactPhone || data.phone,
          email: cp.email || data.email,
          availability: cp.availability || 'Immediate',
          employmentType: cp.employmentType || 'Full-time',
          drivingLicense: cp.drivingLicense || 'None',
          qualification: cp.qualification || '',
          bio: cp.bio || '',
          isAvailableForHire: cp.isAvailableForHire !== false
        });
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeModalSkill = (skillToRemove) => {
    setEditForm(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(s => s !== skillToRemove)
    }));
  };

  const addModalCustomSkill = () => {
    const s = modalCustomSkill.trim();
    if (!s) return;
    const current = editForm.skills || [];
    if (!current.includes(s)) {
      setEditForm(prev => ({
        ...prev,
        skills: [...(prev.skills || []), s]
      }));
    }
    setModalCustomSkill('');
  };

  const handleToggleHireStatus = async () => {
    setTogglingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/directory/toggle-hire-status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/directory/my-career-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setShowEdit(false);
        fetchProfile();
      } else {
        alert('Failed to update career profile');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontWeight: '600' }}>Loading your career profile...</p>
      </div>
    );
  }

  const cp = profile?.careerProfile || {};
  const skills = cp.skills?.length ? cp.skills : (profile?.tags || ['General Staff']);
  const name = cp.fullName || profile?.fullName;
  const phone = cp.contactPhone || profile?.phone;
  const whatsapp = cp.whatsappNumber || phone;
  const isAvailable = cp.isAvailableForHire !== false;

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navigation */}
      <header style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden' }}>
            <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', fontFamily: 'Plus Jakarta Sans' }}>BizTech</span>
            <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: '700', marginLeft: '6px', background: '#EFF6FF', padding: '2px 8px', borderRadius: '12px' }}>
              Free Career Profile
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowEdit(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}
          >
            <Edit3 size={15} /> Edit Profile
          </button>

          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#DC2626', cursor: 'pointer' }}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: '840px', width: '100%', margin: '24px auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* AVAILABILITY STATUS TOGGLE BAR */}
        <div style={{
          background: isAvailable ? '#F0FDF4' : '#F8FAFC',
          border: isAvailable ? '1.5px solid #BBF7D0' : '1.5px solid #CBD5E1',
          borderRadius: '16px',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: isAvailable ? '#22C55E' : '#94A3B8',
              boxShadow: isAvailable ? '0 0 0 4px #DCFCE7' : 'none'
            }} />
            <div>
              <span style={{ fontSize: '15px', fontWeight: '700', color: isAvailable ? '#166534' : '#475569' }}>
                {isAvailable ? 'Actively Available for Hire' : 'Currently Not Looking for Jobs'}
              </span>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>
                {isAvailable ? 'Local businesses and employers can see your profile and contact you directly.' : 'Your profile is hidden from active hiring searches.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleHireStatus}
            disabled={togglingStatus}
            style={{
              padding: '8px 16px',
              background: isAvailable ? '#16A34A' : '#64748B',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {isAvailable ? 'Set as Unavailable' : 'Set as Available'}
          </button>
        </div>

        {/* LINKEDIN-STYLE CANDIDATE PROFILE CARD */}
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          
          {/* Header Cover Bar */}
          <div style={{ height: '90px', background: 'linear-gradient(90deg, #1E40AF 0%, #3B82F6 100%)', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: '-36px', left: '28px', width: '76px', height: '76px', borderRadius: '50%', background: 'white', padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', fontWeight: '800', fontSize: '26px' }}>
                {name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Candidate Details */}
          <div style={{ padding: '48px 28px 20px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
                  {name}
                </h1>
                <p style={{ margin: 0, color: '#475569', fontSize: '15px', fontWeight: '600' }}>
                  {cp.jobCategory || 'General Staff'}
                </p>
                <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '13.5px' }}>
                  📍 {cp.city || 'City pending'}{cp.currentArea ? `, ${cp.currentArea}` : ''} • Experience: <strong>{cp.experience || 'Fresher'}</strong>
                </p>
              </div>

              {/* Direct Call */}
              {phone && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <a
                    href={`tel:${phone}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 18px',
                      background: '#2563EB',
                      color: 'white',
                      borderRadius: '10px',
                      fontSize: '13.5px',
                      fontWeight: '700',
                      textDecoration: 'none'
                    }}
                  >
                    <Phone size={15} /> Call: {phone}
                  </a>
                </div>
              )}
            </div>

            {/* Skills & Badges */}
            <div style={{ marginTop: '18px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '5px 12px',
                    borderRadius: '16px',
                    border: '1px solid #BFDBFE'
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #F1F5F9', margin: 0 }} />

          {/* Quick Stats Grid */}
          <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            
            {/* Qualification */}
            {cp.qualification && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <GraduationCap size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>
                    Education
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                    {cp.qualification}
                  </span>
                </div>
              </div>
            )}

            {/* Employment Type */}
            {cp.employmentType && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Briefcase size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>
                    Work Type
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                    {cp.employmentType}
                  </span>
                </div>
              </div>
            )}

            {/* Expected Salary */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Award size={18} />
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>
                  Expected Salary
                </span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#16A34A' }}>
                  {cp.expectedSalary || 'Negotiable'}
                </span>
              </div>
            </div>

            {/* Availability */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={18} />
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>
                  Availability
                </span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                  {cp.availability || 'Immediate'}
                </span>
              </div>
            </div>

            {/* Driving License (Only if present and not 'None') */}
            {cp.drivingLicense && cp.drivingLicense !== 'None' && cp.drivingLicense !== 'None / Not Required' && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Truck size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>
                    Driving License
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                    {cp.drivingLicense}
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Bio / Summary */}
          {cp.bio && (
            <div style={{ padding: '0 28px 24px 28px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', textTransform: 'uppercase', marginBottom: '6px' }}>
                Summary / Bio
              </span>
              <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.6', background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                {cp.bio}
              </p>
            </div>
          )}

        </div>

      </main>

      {/* EDIT MODAL */}
      {showEdit && (
        <div 
          onClick={e => { if (e.target === e.currentTarget) setShowEdit(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}
        >
          <div style={{ background: 'white', borderRadius: '18px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px #E2E8F0' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                Edit Career Profile
              </h2>
              <button onClick={() => setShowEdit(false)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Full Name *</label>
                <input type="text" value={editForm.fullName || ''} onChange={e => setEditForm({...editForm, fullName: e.target.value})} required style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Job Category / Sector</label>
                  <input type="text" value={editForm.jobCategory || ''} onChange={e => setEditForm({...editForm, jobCategory: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Total Experience</label>
                  <select value={editForm.experience || '1-2 Years'} onChange={e => setEditForm({...editForm, experience: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', background: 'white', boxSizing: 'border-box' }}>
                    <option value="Fresher">Fresher / No Experience</option>
                    <option value="Less than 1 Year">Less than 1 Year</option>
                    <option value="1-2 Years">1-2 Years</option>
                    <option value="3-5 Years">3-5 Years</option>
                    <option value="5-10 Years">5-10 Years</option>
                    <option value="10+ Years">10+ Years</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Contact Phone *</label>
                  <input type="tel" maxLength={10} value={editForm.contactPhone || ''} onChange={e => setEditForm({...editForm, contactPhone: e.target.value})} required style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>WhatsApp Number</label>
                  <input type="tel" maxLength={10} value={editForm.whatsappNumber || ''} onChange={e => setEditForm({...editForm, whatsappNumber: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Email Address</label>
                <input type="email" placeholder="your.email@example.com" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }} />
              </div>

              {/* Skills & Specialities Editor */}
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Skills & Specialities
                </label>
                {editForm.skills && editForm.skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {editForm.skills.map(s => (
                      <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#2563EB', color: 'white', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '14px' }}>
                        <span>✓ {s}</span>
                        <button type="button" onClick={() => removeModalSkill(s)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: 0, fontSize: '11px', display: 'flex', alignItems: 'center' }}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="Add custom skill (e.g. Forklift, GST Billing, Tally, Java)"
                    value={modalCustomSkill}
                    onChange={e => setModalCustomSkill(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addModalCustomSkill(); } }}
                    style={{ flex: 1, height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px' }}
                  />
                  <button type="button" onClick={addModalCustomSkill} style={{ height: '36px', padding: '0 12px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                    Add
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Education / Qualification</label>
                  <select value={editForm.qualification || ''} onChange={e => setEditForm({...editForm, qualification: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: 'white', boxSizing: 'border-box' }}>
                    <option value="">Select Qualification</option>
                    <option value="10th / SSLC">10th / SSLC</option>
                    <option value="12th / HSC">12th / HSC</option>
                    <option value="ITI / Diploma">ITI / Diploma</option>
                    <option value="Graduate / Degree">Graduate / Degree</option>
                    <option value="Post Graduate">Post Graduate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Work Preference</label>
                  <select value={editForm.employmentType || 'Full-time'} onChange={e => setEditForm({...editForm, employmentType: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: 'white', boxSizing: 'border-box' }}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract / Freelance">Contract / Freelance</option>
                    <option value="Daily Wages">Daily Wages</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Availability</label>
                  <select value={editForm.availability || 'Immediate'} onChange={e => setEditForm({...editForm, availability: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: 'white', boxSizing: 'border-box' }}>
                    <option value="Immediate">Immediate</option>
                    <option value="Within 15 Days">Within 15 Days</option>
                    <option value="1 Month">1 Month</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Expected Salary</label>
                  <input type="text" placeholder="e.g. ₹20,000 / month" value={editForm.expectedSalary || ''} onChange={e => setEditForm({...editForm, expectedSalary: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>City *</label>
                  <input type="text" value={editForm.city || ''} onChange={e => setEditForm({...editForm, city: e.target.value})} required style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Area / Locality</label>
                  <input type="text" placeholder="e.g. Indiranagar" value={editForm.currentArea || ''} onChange={e => setEditForm({...editForm, currentArea: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Pincode</label>
                  <input type="text" maxLength={6} value={editForm.pincode || ''} onChange={e => setEditForm({...editForm, pincode: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Driving License (Optional)</label>
                <input type="text" placeholder="e.g. LMV / HMV / Two Wheeler / None" value={editForm.drivingLicense || ''} onChange={e => setEditForm({...editForm, drivingLicense: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Bio / Summary</label>
                <textarea rows={3} placeholder="Tell employers about your key strengths and experience..." value={editForm.bio || ''} onChange={e => setEditForm({...editForm, bio: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowEdit(false)} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13.5px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer' }}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default CareerProfileView;
