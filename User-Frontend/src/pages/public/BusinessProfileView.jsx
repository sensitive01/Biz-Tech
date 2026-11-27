import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Phone,
  Tag,
  ShieldCheck,
  Sparkles,
  Edit3,
  LogOut,
  ExternalLink,
  CheckCircle2,
  X,
  Globe,
  Star,
  FileText,
  Upload,
  Loader2
} from 'lucide-react';

const POPULAR_BUSINESS_TAGS = [
  'Retail', 'Wholesale', 'Kirana & Grocery', 'Supermarket',
  'Pharmacy / Medical', 'Hardware & Electrical', 'Textiles & Garments',
  'Automobile & Garage', 'Restaurant & Cafe', 'Distributor', 'Electronics'
];

const BusinessProfileView = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [modalCustomTag, setModalCustomTag] = useState('');

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
        const bp = data.businessProfile || {};
        setEditForm({
          businessName: bp.businessName || data.businessName || data.fullName,
          ownerName: bp.ownerName || data.fullName,
          tags: bp.tags?.length ? bp.tags : (data.tags || []),
          contactPhone: bp.contactPhone || data.phone,
          whatsappNumber: bp.whatsappNumber || bp.contactPhone || data.phone,
          email: bp.email || data.email,
          address: bp.address || data.address || '',
          city: bp.city || data.city || '',
          state: bp.state || data.state || '',
          pincode: bp.pincode || data.pincode || '',
          websiteOrSocial: bp.websiteOrSocial || '',
          description: bp.description || '',
          panNumber: bp.panNumber || '',
          panProofUrl: bp.panProofUrl || '',
          panProofName: bp.panProofName || ''
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

  const [uploadingModalProof, setUploadingModalProof] = useState(false);
  const [modalProofError, setModalProofError] = useState('');

  const handleModalProofUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setModalProofError('File size exceeds the 20MB limit.');
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type.toLowerCase())) {
      setModalProofError('Please upload a valid image (PNG, JPG, JPEG, or WEBP).');
      return;
    }

    setModalProofError('');

    // Instant local image preview
    const localReader = new FileReader();
    localReader.onload = () => {
      setEditForm(prev => ({
        ...prev,
        panProofUrl: localReader.result,
        panProofName: file.name
      }));
    };
    localReader.readAsDataURL(file);

    setUploadingModalProof(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('proof', file);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/directory/upload-pan-proof`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        setModalProofError(data.message || 'Failed to upload proof document');
      } else {
        setEditForm(prev => ({
          ...prev,
          panProofUrl: data.fileUrl,
          panProofName: data.originalName || file.name
        }));
      }
    } catch (err) {
      setModalProofError('Network error uploading proof document.');
    } finally {
      setUploadingModalProof(false);
    }
  };

  const toggleModalTag = (tag) => {
    const current = editForm.tags || [];
    if (current.includes(tag)) {
      setEditForm({ ...editForm, tags: current.filter(t => t !== tag) });
    } else {
      setEditForm({ ...editForm, tags: [...current, tag] });
    }
  };

  const addModalCustomTag = () => {
    const trimmed = modalCustomTag.trim();
    if (trimmed) {
      const current = editForm.tags || [];
      if (!current.includes(trimmed)) {
        setEditForm({ ...editForm, tags: [...current, trimmed] });
      }
      setModalCustomTag('');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/directory/my-business-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (res.ok) {
        setShowEdit(false);
        fetchProfile();
      } else {
        alert(data.message || 'Failed to update business profile');
      }
    } catch (err) {
      console.error(err);
      alert('Network error updating business profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleUpgradeToPro = () => {
    navigate('/onboarding');
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
        <p style={{ color: '#64748B', fontSize: '14px', fontWeight: '600' }}>Loading your business profile...</p>
      </div>
    );
  }

  const bp = profile?.businessProfile || {};
  const tags = bp.tags?.length ? bp.tags : (profile?.tags || []);
  const bName = bp.businessName || profile?.businessName || profile?.fullName || 'Business';
  const owner = bp.ownerName || profile?.fullName;
  const phone = bp.contactPhone || profile?.phone;
  const whatsapp = bp.whatsappNumber || phone;
  const fullAddress = [bp.address, bp.city, bp.state, bp.pincode].filter(Boolean).join(', ');
  const mapsUrl = fullAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${bName}, ${fullAddress}`)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bName)}`;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top App Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '12px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden' }}>
            <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', fontFamily: 'Plus Jakarta Sans' }}>BizTech</span>
            <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: '700', marginLeft: '6px', background: '#DCFCE7', padding: '2px 8px', borderRadius: '12px' }}>
              Business Profile
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowEdit(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}
          >
            <Edit3 size={14} /> Edit Profile
          </button>
          
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', color: '#DC2626', cursor: 'pointer' }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: '860px', width: '100%', margin: '24px auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* GOOGLE BUSINESS PROFILE CARD */}
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
          
          {/* Aesthetic Cover Banner */}
          <div style={{
            height: '140px',
            background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #38BDF8 100%)',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            padding: '16px 20px'
          }}>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              color: 'white',
              fontSize: '11.5px',
              fontWeight: '700',
              padding: '4px 12px',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <CheckCircle2 size={13} /> Verified Digital Storefront
            </span>

            {/* Profile Avatar Overlay */}
            <div style={{
              position: 'absolute',
              bottom: '-32px',
              left: '28px',
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'white',
              padding: '4px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '16px',
                background: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
                fontWeight: '800',
                fontSize: '28px',
                fontFamily: 'Plus Jakarta Sans'
              }}>
                {bName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Profile Header Details */}
          <div style={{ padding: '44px 28px 24px 28px' }}>
            
            {/* Title & Owner */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
                  {bName}
                </h1>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#DCFCE7', color: '#166534', fontSize: '11.5px', fontWeight: '700', padding: '3px 10px', borderRadius: '14px' }}>
                  <CheckCircle2 size={13} color="#16A34A" /> Active Listing
                </span>
                {bp.isVerified ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#EFF6FF', color: '#1E40AF', fontSize: '11.5px', fontWeight: '700', padding: '3px 10px', borderRadius: '14px', border: '1px solid #BFDBFE' }}>
                    <ShieldCheck size={13} color="#2563EB" /> Verified Storefront
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FEF3C7', color: '#92400E', fontSize: '11.5px', fontWeight: '700', padding: '3px 10px', borderRadius: '14px', border: '1px solid #FDE68A' }}>
                    <Clock size={13} color="#D97706" /> Pending Admin Verification
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '13.5px', color: '#64748B', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#EAB308', fontWeight: '700' }}>
                  <Star size={14} fill="#EAB308" />
                  <span>5.0</span>
                  <span style={{ color: '#94A3B8', fontWeight: '400', marginLeft: '2px' }}>(New Store Listing)</span>
                </div>
                <span>•</span>
                <span>Owned by <strong>{owner}</strong></span>
                {bp.city && (
                  <>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={13} color="#2563EB" /> {bp.city}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Selected Tags list */}
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {tags.map((t, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#F1F5F9',
                      color: '#334155',
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '5px 12px',
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Tag size={12} color="#64748B" />
                    <span>{t}</span>
                  </span>
                ))}
              </div>
            )}

          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #F1F5F9', margin: 0 }} />

          {/* Business Details Grid */}
          <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            
            {/* Address */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={18} />
              </div>
              <div>
                <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Store Location
                </span>
                <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#0F172A', display: 'block', marginTop: '2px', lineHeight: '1.4' }}>
                  {bp.address || 'Address not specified'}
                </span>
              </div>
            </div>

            {/* Direct Contacts */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Phone size={18} />
              </div>
              <div>
                <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Contact Information
                </span>
                {phone && (
                  <a href={`tel:${phone}`} style={{ fontSize: '13.5px', fontWeight: '600', color: '#0F172A', display: 'block', marginTop: '2px', textDecoration: 'none' }}>
                    Phone: +91 {phone}
                  </a>
                )}
                {whatsapp && (
                  <a href={`https://wa.me/91${whatsapp.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(bName)},%20I%20found%20your%20business%20on%20BizTech.`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#16A34A', fontWeight: '600', display: 'block', marginTop: '2px', textDecoration: 'none' }}>
                    WhatsApp: +91 {whatsapp}
                  </a>
                )}
                {bp.email && (
                  <span style={{ fontSize: '13px', color: '#64748B', display: 'block', marginTop: '2px' }}>
                    Email: {bp.email}
                  </span>
                )}
              </div>
            </div>

            {/* Website / Social Link (if provided) */}
            {bp.websiteOrSocial && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Globe size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Website / Link
                  </span>
                  <a
                    href={bp.websiteOrSocial.startsWith('http') ? bp.websiteOrSocial : `https://${bp.websiteOrSocial}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '13px', color: '#2563EB', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}
                  >
                    <span>{bp.websiteOrSocial}</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            )}

            {/* PAN Card Details */}
            {bp.panNumber && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F8FAFC', color: '#2563EB', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    PAN Card & Tax ID
                  </span>
                  <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A', display: 'block', marginTop: '2px', fontFamily: 'monospace' }}>
                    {bp.panNumber}
                  </span>
                  {bp.panProofUrl ? (
                    <div style={{ marginTop: '8px', maxWidth: '300px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1', background: '#F8FAFC', padding: '6px' }}>
                      <img
                        src={bp.panProofUrl}
                        alt="PAN Card Proof"
                        style={{ width: '100%', maxHeight: '160px', objectFit: 'contain', display: 'block', borderRadius: '6px' }}
                      />
                    </div>
                  ) : (
                    <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>No image proof uploaded</span>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* About / Description (if provided) */}
          {bp.description && (
            <div style={{ padding: '0 28px 24px 28px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                About This Store
              </span>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', lineHeight: '1.6', background: '#F8FAFC', padding: '14px 18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                {bp.description}
              </p>
            </div>
          )}

        </div>

        {/* ELEGANT PRO ERP CARD (CLEAN & SUBTLE AT THE BOTTOM) */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          border: '1.5px dashed #CBD5E1',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={22} />
            </div>
            <div>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', display: 'block' }}>
                Need GST Billing, Live Stock & Staff Management?
              </span>
              <span style={{ fontSize: '12.5px', color: '#64748B' }}>
                Upgrade your store listing to BizTech Pro Cloud ERP anytime
              </span>
            </div>
          </div>
          <button
            onClick={handleUpgradeToPro}
            style={{
              padding: '10px 18px',
              background: '#2563EB',
              color: 'white',
              fontWeight: '700',
              fontSize: '13px',
              border: 'none',
              borderRadius: '9px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(37,99,235,0.2)',
              whiteSpace: 'nowrap'
            }}
          >
            Upgrade to Pro ERP &rarr;
          </button>
        </div>

      </main>

      {/* EDIT MODAL */}
      {showEdit && (
        <div 
          onClick={e => { if (e.target === e.currentTarget) setShowEdit(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}
        >
          <div style={{ background: 'white', borderRadius: '18px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px #E2E8F0' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                Edit Business Profile
              </h2>
              <button onClick={() => setShowEdit(false)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Business / Shop Name *</label>
                <input type="text" value={editForm.businessName} onChange={e => setEditForm({...editForm, businessName: e.target.value})} required style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Owner / Contact Person Name</label>
                <input type="text" value={editForm.ownerName} onChange={e => setEditForm({...editForm, ownerName: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Contact Phone *</label>
                  <input type="tel" maxLength={10} value={editForm.contactPhone} onChange={e => setEditForm({...editForm, contactPhone: e.target.value})} required style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>WhatsApp Number</label>
                  <input type="tel" maxLength={10} value={editForm.whatsappNumber} onChange={e => setEditForm({...editForm, whatsappNumber: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Business Email Address</label>
                <input type="email" placeholder="your.email@example.com" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Shop Address</label>
                <input type="text" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>City *</label>
                  <input type="text" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} required style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>State</label>
                  <input type="text" placeholder="e.g. Karnataka" value={editForm.state || ''} onChange={e => setEditForm({...editForm, state: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Pincode</label>
                  <input type="text" maxLength={6} value={editForm.pincode} onChange={e => setEditForm({...editForm, pincode: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* PAN Card & Proof in Edit Modal */}
              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                  Statutory & PAN Card Details
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                      PAN Card Number (10 Chars)
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="e.g. ABCDE1234F"
                      value={editForm.panNumber || ''}
                      onChange={e => setEditForm({...editForm, panNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')})}
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13.5px',
                        fontWeight: '700',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        background: 'white',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                      PAN Proof Image (Direct Upload)
                    </label>
                    {editForm.panProofUrl ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', border: '1px solid #CBD5E1', padding: '6px 10px', borderRadius: '8px', minHeight: '60px', boxSizing: 'border-box' }}>
                        <div style={{ width: '54px', height: '48px', borderRadius: '6px', overflow: 'hidden', background: '#F8FAFC', border: '1px solid #E2E8F0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img src={editForm.panProofUrl} alt="Proof" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#166534', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {editForm.panProofName || 'Direct Image Attached'}
                          </span>
                          <label style={{ cursor: 'pointer', color: '#2563EB', fontSize: '11px', fontWeight: '700', display: 'inline-block', marginTop: '2px' }}>
                            Change Photo
                            <input type="file" accept="image/png,image/jpeg,image/webp,image/jpg" onChange={handleModalProofUpload} style={{ display: 'none' }} />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '42px', background: 'white', border: '1.5px dashed #3B82F6', borderRadius: '8px', cursor: uploadingModalProof ? 'not-allowed' : 'pointer', color: '#2563EB', fontSize: '12px', fontWeight: '600' }}>
                        {uploadingModalProof ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                        <span>{uploadingModalProof ? 'Uploading direct image...' : 'Upload Image Directly'}</span>
                        <input type="file" accept="image/png,image/jpeg,image/webp,image/jpg" disabled={uploadingModalProof} onChange={handleModalProofUpload} style={{ display: 'none' }} />
                      </label>
                    )}
                    {modalProofError && <span style={{ fontSize: '11px', color: '#EF4444', display: 'block', marginTop: '2px' }}>{modalProofError}</span>}
                  </div>
                </div>
              </div>

              {/* Tags & Keywords in Edit Modal */}
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Tags & Keywords
                </label>

                {/* Selected active tags with X */}
                {editForm.tags && editForm.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {editForm.tags.map(t => (
                      <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#2563EB', color: 'white', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '14px' }}>
                        <span>✓ {t}</span>
                        <button type="button" onClick={() => toggleModalTag(t)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: 0, fontSize: '11px', display: 'flex', alignItems: 'center' }}>✕</button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Popular tags buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                  {POPULAR_BUSINESS_TAGS.map(t => {
                    const isSel = (editForm.tags || []).includes(t);
                    return (
                      <button key={t} type="button" onClick={() => toggleModalTag(t)} style={{ padding: '4px 10px', borderRadius: '14px', fontSize: '11.5px', fontWeight: '600', border: isSel ? '1.5px solid #2563EB' : '1px solid #CBD5E1', background: isSel ? '#EFF6FF' : 'white', color: isSel ? '#2563EB' : '#475569', cursor: 'pointer' }}>
                        {isSel ? '✓ ' : '+ '}{t}
                      </button>
                    );
                  })}
                </div>

                {/* Custom tag input */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="Add custom tag (e.g. Organic, Rice, Oil)"
                    value={modalCustomTag}
                    onChange={e => setModalCustomTag(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addModalCustomTag(); } }}
                    style={{ flex: 1, height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px' }}
                  />
                  <button type="button" onClick={addModalCustomTag} style={{ height: '36px', padding: '0 12px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Website or Social Link</label>
                <input type="text" placeholder="https://..." value={editForm.websiteOrSocial || ''} onChange={e => setEditForm({...editForm, websiteOrSocial: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>About Store / Specialities</label>
                <textarea rows={3} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowEdit(false)} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13.5px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer' }}>
                  {saving ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default BusinessProfileView;
