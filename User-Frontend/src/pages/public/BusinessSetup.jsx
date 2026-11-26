import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  Mail,
  User,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Globe,
  FileText,
  Upload,
  ExternalLink
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';

const POPULAR_BUSINESS_TAGS = [
  'Retail', 'Wholesale', 'Kirana & Grocery', 'Supermarket',
  'Pharmacy / Medical', 'Hardware & Electrical', 'Textiles & Garments',
  'Automobile & Garage', 'Restaurant & Cafe', 'Distributor', 'Electronics'
];

const BusinessSetup = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);

  // Business Profile Form Data
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Retail');
  const [businessTags, setBusinessTags] = useState([]);
  const [customBusinessTag, setCustomBusinessTag] = useState('');
  const [operatingHours, setOperatingHours] = useState('9:00 AM - 9:00 PM');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessCity, setBusinessCity] = useState('');
  const [businessState, setBusinessState] = useState('');
  const [businessPincode, setBusinessPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  // Statutory & PAN Verification Data
  const [panNumber, setPanNumber] = useState('');
  const [panProofUrl, setPanProofUrl] = useState('');
  const [panProofName, setPanProofName] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofError, setProofError] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
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
        const bp = data.businessProfile || {};
        setBusinessName(bp.businessName || data.businessName || data.fullName || '');
        setOwnerName(bp.ownerName || data.fullName || '');
        setBusinessCategory(bp.category || 'Retail');
        if (bp.tags?.length) setBusinessTags(bp.tags);
        setOperatingHours(bp.operatingHours || '9:00 AM - 9:00 PM');
        setBusinessAddress(bp.address || '');
        setBusinessCity(bp.city || '');
        setBusinessState(bp.state || '');
        setBusinessPincode(bp.pincode || '');
        setPhone(bp.contactPhone || data.phone || '');
        setWhatsapp(bp.whatsappNumber || data.phone || '');
        setEmail(bp.email || data.email || '');
        setWebsite(bp.websiteOrSocial || '');
        setDescription(bp.description || '');
        setPanNumber(bp.panNumber || '');
        setPanProofUrl(bp.panProofUrl || '');
        setPanProofName(bp.panProofName || '');
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleProofUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setProofError('Proof file size exceeds the 20MB limit.');
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type.toLowerCase())) {
      setProofError('Please upload a valid image (PNG, JPG, JPEG, or WEBP).');
      return;
    }

    setProofError('');

    // Instant direct image preview
    const localReader = new FileReader();
    localReader.onload = () => {
      setPanProofUrl(localReader.result);
      setPanProofName(file.name);
    };
    localReader.readAsDataURL(file);

    setUploadingProof(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('proof', file);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/directory/upload-pan-proof`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        setProofError(data.message || 'Failed to upload image file');
      } else {
        setPanProofUrl(data.fileUrl);
        setPanProofName(data.originalName || file.name);
      }
    } catch (err) {
      setProofError('Network error uploading proof image.');
    } finally {
      setUploadingProof(false);
    }
  };

  const toggleTag = (tag) => {
    if (businessTags.includes(tag)) {
      setBusinessTags(businessTags.filter(t => t !== tag));
    } else {
      setBusinessTags([...businessTags, tag]);
    }
  };

  const addCustomTag = () => {
    const trimmed = customBusinessTag.trim();
    if (trimmed && !businessTags.includes(trimmed)) {
      setBusinessTags([...businessTags, trimmed]);
      setCustomBusinessTag('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!businessName.trim()) {
      setError('Please enter your business or shop name.');
      return;
    }

    if (!businessCity.trim()) {
      setError('Please enter the city where your business is located.');
      return;
    }

    // Validate PAN Card Format if entered
    if (panNumber.trim()) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(panNumber.trim().toUpperCase())) {
        setError('Invalid PAN Card Number format. Must be 10 characters (e.g. ABCDE1234F: 5 letters, 4 digits, 1 letter).');
        return;
      }
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        businessName: businessName.trim(),
        ownerName: ownerName.trim() || businessName.trim(),
        category: businessCategory,
        tags: businessTags,
        operatingHours: operatingHours.trim(),
        address: businessAddress.trim(),
        city: businessCity.trim(),
        state: businessState.trim(),
        pincode: businessPincode.trim(),
        contactPhone: phone,
        whatsappNumber: sameAsPhone ? phone : (whatsapp.trim() || phone),
        email: email.trim(),
        websiteOrSocial: website.trim(),
        description: description.trim(),
        panNumber: panNumber.trim().toUpperCase(),
        panProofUrl: panProofUrl.trim(),
        panProofName: panProofName.trim()
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/directory/my-business-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to save business profile.');
        setLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/business/profile', { replace: true });
    } catch (err) {
      console.error('Save business error:', err);
      setError('Server error saving profile, please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontWeight: '600' }}>Loading your business registration setup...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: 'white', borderBottom: '1px solid #E2E8F0', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', overflow: 'hidden' }}>
            <img src="/logo.jpg" alt="BizTech Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.5px' }}>BizTech</span>
            <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: '700', marginLeft: '6px', textTransform: 'uppercase', background: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>Business Listing</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 16px' }}>
        
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '780px', background: 'white', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0', padding: '36px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '26px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', marginBottom: '10px' }}>
              <Building2 size={14} /> Google Business Style Profile Setup
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
              Complete Your Business Profile
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
              Provide your shop and contact details so local customers and traders can find and contact you directly.
            </p>
          </div>

          {error && (
            <div style={{ color: '#EF4444', fontSize: '13.5px', marginBottom: '18px', textAlign: 'center', background: '#FEF2F2', padding: '12px', borderRadius: '10px', border: '1px solid #FECACA' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Section 1: Business Identity */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={16} color="#2563EB" /> Business Details
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Business / Shop Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sri Murugan Traders"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    required
                    style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Owner / Contact Person Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    required
                    style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* Section: PAN Card & Verification Proof */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#2563EB" /> PAN Card & Verification Proof
              </div>
              <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#64748B' }}>
                Provide your unique PAN number and upload proof document for official business verification by BizTech administrators.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                {/* PAN Number */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    PAN Card Number * (10 Characters)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="e.g. ABCDE1234F"
                    value={panNumber}
                    onChange={e => setPanNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      fontWeight: '700',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      background: 'white',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                    Standard Indian Tax ID (5 letters, 4 digits, 1 letter). Must be unique.
                  </span>
                </div>

                {/* Proof Document Upload */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Upload PAN Card Proof * (Image or PDF)
                  </label>

                  {panProofUrl ? (
                    <div style={{ background: 'white', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ width: '100%', height: '160px', background: '#F8FAFC', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E2E8F0' }}>
                        <img
                          src={panProofUrl}
                          alt="PAN Card Proof"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#166534', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <CheckCircle2 size={15} color="#16A34A" /> {panProofName || 'Direct Image Attached'}
                        </span>
                        <label style={{ cursor: 'pointer', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '5px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700' }}>
                          Change Image
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/jpg"
                            onChange={handleProofUpload}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        minHeight: '120px',
                        background: 'white',
                        border: '2px dashed #93C5FD',
                        borderRadius: '10px',
                        cursor: uploadingProof ? 'not-allowed' : 'pointer',
                        color: '#2563EB',
                        padding: '16px',
                        boxSizing: 'border-box'
                      }}>
                        {uploadingProof ? (
                          <>
                            <Loader2 size={24} className="animate-spin" color="#2563EB" />
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E40AF' }}>Uploading image directly...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={24} color="#2563EB" />
                            <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A' }}>Click to Upload PAN Card Image</span>
                            <span style={{ fontSize: '11.5px', color: '#64748B' }}>Direct image file upload from your device (PNG, JPG, WEBP)</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/jpg"
                              disabled={uploadingProof}
                              onChange={handleProofUpload}
                              style={{ display: 'none' }}
                            />
                          </>
                        )}
                      </label>
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                        Clear photo or scan of your PAN card. Direct image upload.
                      </span>
                    </div>
                  )}

                  {proofError && (
                    <span style={{ fontSize: '11.5px', color: '#EF4444', fontWeight: '600', display: 'block', marginTop: '4px' }}>
                      {proofError}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Business Tags */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={16} color="#2563EB" /> Tags & Keywords (helps local customers find your store)
              </div>

              {/* Selected Tags list (shows all active tags with an 'X' to remove) */}
              {businessTags.length > 0 && (
                <div style={{ marginBottom: '14px', background: 'white', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B', display: 'block', marginBottom: '8px' }}>
                    Selected Tags ({businessTags.length}):
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {businessTags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: '700',
                          background: '#2563EB',
                          color: 'white'
                        }}
                      >
                        <span>✓ {tag}</span>
                        <button
                          type="button"
                          onClick={() => toggleTag(tag)}
                          title="Remove tag"
                          style={{
                            background: 'rgba(255,255,255,0.25)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '16px',
                            height: '16px',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            lineHeight: 1
                          }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Suggestions */}
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '6px' }}>
                  Click to select popular business tags:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {POPULAR_BUSINESS_TAGS.map(t => {
                    const isSel = businessTags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTag(t)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: '600',
                          border: isSel ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                          background: isSel ? '#EFF6FF' : 'white',
                          color: isSel ? '#2563EB' : '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        {isSel ? '✓ ' : '+ '}{t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Tag Input */}
              <div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '6px' }}>
                  Or type any custom tag:
                </span>
                <div style={{ display: 'flex', gap: '8px', maxWidth: '380px' }}>
                  <input
                    type="text"
                    placeholder="e.g. Organic, Rice, Oil, Spices..."
                    value={customBusinessTag}
                    onChange={e => setCustomBusinessTag(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        addCustomTag();
                      }
                    }}
                    style={{ flex: 1, height: '38px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      addCustomTag();
                    }}
                    style={{
                      height: '38px',
                      padding: '0 16px',
                      background: '#2563EB',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Add Tag
                  </button>
                </div>
              </div>
            </div>

            {/* Section 3: Location & Address */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} color="#2563EB" /> Shop / Store Address
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                  Street Address & Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. No. 14, Main Bazaar Road, Near Bus Stand"
                  value={businessAddress}
                  onChange={e => setBusinessAddress(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Madurai"
                    value={businessCity}
                    onChange={e => setBusinessCity(e.target.value)}
                    required
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tamil Nadu"
                    value={businessState}
                    onChange={e => setBusinessState(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    Pincode
                  </label>
                  <input
                    type="text"
                    placeholder="625001"
                    maxLength={6}
                    value={businessPincode}
                    onChange={e => setBusinessPincode(e.target.value.replace(/\D/g, ''))}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Direct Customer Contacts */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={16} color="#16A34A" /> Direct Contact Channels (Calls & WhatsApp)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    Contact Phone Number (for calls)
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155' }}>
                      WhatsApp Number
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#475569', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={sameAsPhone}
                        onChange={e => setSameAsPhone(e.target.checked)}
                        style={{ accentColor: '#16A34A' }}
                      />
                      Same as phone
                    </label>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    disabled={sameAsPhone}
                    value={sameAsPhone ? phone : whatsapp}
                    onChange={e => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', background: sameAsPhone ? '#F1F5F9' : 'white' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                  About Your Business / Products Offered (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your shop specialties, top selling brands, or delivery services..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                background: '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15.5px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                marginTop: '6px'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Saving Business Profile...</span>
                </>
              ) : (
                <>
                  <span>Save & View Business Profile &rarr;</span>
                </>
              )}
            </button>

          </form>

        </div>

      </div>
    </div>
  );
};

export default BusinessSetup;
