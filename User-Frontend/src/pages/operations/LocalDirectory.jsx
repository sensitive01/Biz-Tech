import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Briefcase,
  Search,
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  Award,
  Truck,
  Filter,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

const LocalDirectory = () => {
  const [activeTab, setActiveTab] = useState('careers'); // 'careers' | 'businesses'
  const [careers, setCareers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Careers
  const [careerSearch, setCareerSearch] = useState('');
  const [selectedJobCategory, setSelectedJobCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedLicense, setSelectedLicense] = useState('All');

  // Filters for Businesses
  const [businessSearch, setBusinessSearch] = useState('');
  const [selectedBusinessCategory, setSelectedBusinessCategory] = useState('All');
  const [selectedBusinessCity, setSelectedBusinessCity] = useState('All');

  useEffect(() => {
    fetchDirectoryData();
  }, [activeTab]);

  const fetchDirectoryData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (activeTab === 'careers') {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/directory/careers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCareers(data);
        }
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/directory/businesses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBusinesses(data);
        }
      }
    } catch (err) {
      console.error('Error fetching directory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Careers
  const filteredCareers = careers.filter(c => {
    if (selectedJobCategory !== 'All' && c.jobCategory !== selectedJobCategory) return false;
    if (selectedCity !== 'All' && c.city?.toLowerCase() !== selectedCity.toLowerCase()) return false;
    if (selectedLicense !== 'All' && !c.drivingLicense?.toLowerCase().includes(selectedLicense.toLowerCase())) return false;
    if (careerSearch.trim()) {
      const term = careerSearch.toLowerCase();
      const matchName = c.fullName?.toLowerCase().includes(term);
      const matchRole = c.jobCategory?.toLowerCase().includes(term);
      const matchCity = c.city?.toLowerCase().includes(term);
      const matchSkills = c.skills?.some(s => s.toLowerCase().includes(term));
      return matchName || matchRole || matchCity || matchSkills;
    }
    return true;
  });

  // Filtered Businesses
  const filteredBusinesses = businesses.filter(b => {
    if (selectedBusinessCategory !== 'All' && b.category !== selectedBusinessCategory) return false;
    if (selectedBusinessCity !== 'All' && b.city?.toLowerCase() !== selectedBusinessCity.toLowerCase()) return false;
    if (businessSearch.trim()) {
      const term = businessSearch.toLowerCase();
      const matchName = b.businessName?.toLowerCase().includes(term);
      const matchCat = b.category?.toLowerCase().includes(term);
      const matchCity = b.city?.toLowerCase().includes(term);
      const matchTags = b.tags?.some(t => t.toLowerCase().includes(term));
      return matchName || matchCat || matchCity || matchTags;
    }
    return true;
  });

  // Unique cities
  const careerCities = Array.from(new Set(careers.map(c => c.city).filter(Boolean)));
  const businessCities = Array.from(new Set(businesses.map(b => b.city).filter(Boolean)));

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={26} color="#2563EB" />
            Local Directory & Talent Network
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>
            Discover and directly contact local job seekers (drivers, marketing, billing staff) and verified B2B suppliers.
          </p>
        </div>

        <button
          onClick={fetchDirectoryData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 16px',
            background: 'white',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#334155',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Directory
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('careers')}
          style={{
            padding: '12px 20px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'careers' ? '2.5px solid #2563EB' : '2.5px solid transparent',
            color: activeTab === 'careers' ? '#2563EB' : '#64748B',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Briefcase size={16} />
          Hire Talent & Staff ({careers.length})
        </button>

        <button
          onClick={() => setActiveTab('businesses')}
          style={{
            padding: '12px 20px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'businesses' ? '2.5px solid #2563EB' : '2.5px solid transparent',
            color: activeTab === 'businesses' ? '#2563EB' : '#64748B',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Building2 size={16} />
          Local Business & Suppliers ({businesses.length})
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: CAREERS / TALENT FINDER                           */}
      {/* ======================================================== */}
      {activeTab === 'careers' && (
        <div>
          {/* Filter Bar */}
          <div style={{ background: 'white', padding: '16px 20px', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
            
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                placeholder="Search by candidate name, skill, driver, role..."
                value={careerSearch}
                onChange={e => setCareerSearch(e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 12px 0 36px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            {/* Role Filter */}
            <div style={{ minWidth: '180px' }}>
              <select
                value={selectedJobCategory}
                onChange={e => setSelectedJobCategory(e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: 'white' }}
              >
                <option value="All">All Job Categories</option>
                <option value="Commercial Driver & Transport">Commercial Driver & Transport</option>
                <option value="Delivery Partner">Delivery & Logistics</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Accounts & Billing">Accounts & Billing</option>
                <option value="Retail & Counter Staff">Retail & Counter Staff</option>
                <option value="Warehouse & Inventory">Warehouse & Inventory</option>
                <option value="Electrician & Maintenance">Electrician & Maintenance</option>
                <option value="Cook & Kitchen Staff">Cook & Kitchen Staff</option>
              </select>
            </div>

            {/* City Filter */}
            <div style={{ minWidth: '140px' }}>
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: 'white' }}
              >
                <option value="All">All Cities</option>
                {careerCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* License Filter */}
            <div style={{ minWidth: '150px' }}>
              <select
                value={selectedLicense}
                onChange={e => setSelectedLicense(e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: 'white' }}
              >
                <option value="All">Any License</option>
                <option value="HMV">HMV (Heavy Commercial)</option>
                <option value="LMV">LMV (Light Vehicle)</option>
                <option value="Two Wheeler">Two Wheeler</option>
              </select>
            </div>

            {(careerSearch || selectedJobCategory !== 'All' || selectedCity !== 'All' || selectedLicense !== 'All') && (
              <button
                onClick={() => {
                  setCareerSearch('');
                  setSelectedJobCategory('All');
                  setSelectedCity('All');
                  setSelectedLicense('All');
                }}
                style={{ padding: '6px 12px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
              >
                Clear Filters
              </button>
            )}

          </div>

          {/* Candidates Grid */}
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
              Loading talent directory...
            </div>
          ) : filteredCareers.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '48px', textAlign: 'center' }}>
              <Users size={40} color="#94A3B8" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0' }}>No candidates found</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                Try adjusting your search filters or check back as more candidates register.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
              {filteredCareers.map(cand => {
                const phone = cand.phone || '';
                const whatsapp = cand.whatsappNumber || phone;
                return (
                  <div
                    key={cand._id}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      padding: '20px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    <div>
                      {/* Top Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', fontWeight: '800', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {cand.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: '0 0 2px 0' }}>
                              {cand.fullName}
                            </h3>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#2563EB' }}>
                              {cand.jobCategory}
                            </span>
                          </div>
                        </div>

                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: cand.isAvailableForHire ? '#DCFCE7' : '#F1F5F9',
                          color: cand.isAvailableForHire ? '#16A34A' : '#64748B'
                        }}>
                          {cand.isAvailableForHire ? 'Available' : 'Employed'}
                        </span>
                      </div>

                      {/* Details row */}
                      <div style={{ fontSize: '12.5px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={14} color="#64748B" />
                          <span>{cand.city ? `${cand.city}${cand.currentArea ? `, ${cand.currentArea}` : ''}` : 'Location on request'}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Award size={14} color="#64748B" />
                          <span>Experience: <strong>{cand.experience || 'Fresher'}</strong></span>
                          {cand.expectedSalary && (
                            <span style={{ marginLeft: '6px', color: '#16A34A', fontWeight: '600' }}>
                              • Pay: {cand.expectedSalary}
                            </span>
                          )}
                        </div>

                        {cand.drivingLicense && cand.drivingLicense !== 'None' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Truck size={14} color="#D97706" />
                            <span style={{ color: '#B45309', fontWeight: '600' }}>License: {cand.drivingLicense}</span>
                          </div>
                        )}
                      </div>

                      {/* Skill Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
                        {(cand.skills || []).map((sk, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: '#F1F5F9',
                              color: '#334155',
                              fontSize: '11.5px',
                              fontWeight: '600',
                              padding: '3px 8px',
                              borderRadius: '12px'
                            }}
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Contact Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                      <a
                        href={`tel:${phone}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '9px 12px',
                          background: '#EFF6FF',
                          color: '#2563EB',
                          border: '1px solid #BFDBFE',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '700',
                          textDecoration: 'none'
                        }}
                      >
                        <Phone size={14} /> Call
                      </a>

                      <a
                        href={`https://wa.me/91${whatsapp.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(cand.fullName)},%20we%20found%20your%20profile%20on%20BizTech%20and%20are%20looking%20to%20hire%20for%20${encodeURIComponent(cand.jobCategory)}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '9px 12px',
                          background: '#DCFCE7',
                          color: '#16A34A',
                          border: '1px solid #BBF7D0',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '700',
                          textDecoration: 'none'
                        }}
                      >
                        <MessageSquare size={14} /> WhatsApp
                      </a>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: LOCAL BUSINESS DIRECTORY (SUPPLIERS)              */}
      {/* ======================================================== */}
      {activeTab === 'businesses' && (
        <div>
          {/* Filter Bar */}
          <div style={{ background: 'white', padding: '16px 20px', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
            
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                placeholder="Search by shop name, wholesale, retail, city, product tags..."
                value={businessSearch}
                onChange={e => setBusinessSearch(e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 12px 0 36px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            {/* Category Filter */}
            <div style={{ minWidth: '180px' }}>
              <select
                value={selectedBusinessCategory}
                onChange={e => setSelectedBusinessCategory(e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: 'white' }}
              >
                <option value="All">All Categories</option>
                <option value="Retail">Retail Shop / Store</option>
                <option value="Wholesale">Wholesale Trader / Supplier</option>
                <option value="Kirana & Supermarket">Kirana & Supermarket</option>
                <option value="Pharmacy & Medical">Pharmacy & Medical</option>
                <option value="Hardware & Electrical">Hardware & Electrical</option>
                <option value="Garments & Textiles">Garments & Textiles</option>
                <option value="Automobile & Garage">Automobile & Garage</option>
                <option value="Restaurant & Food">Restaurant & Food</option>
                <option value="Distribution">Wholesale Distribution</option>
              </select>
            </div>

            {/* City Filter */}
            <div style={{ minWidth: '140px' }}>
              <select
                value={selectedBusinessCity}
                onChange={e => setSelectedBusinessCity(e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: 'white' }}
              >
                <option value="All">All Cities</option>
                {businessCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {(businessSearch || selectedBusinessCategory !== 'All' || selectedBusinessCity !== 'All') && (
              <button
                onClick={() => {
                  setBusinessSearch('');
                  setSelectedBusinessCategory('All');
                  setSelectedBusinessCity('All');
                }}
                style={{ padding: '6px 12px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
              >
                Clear Filters
              </button>
            )}

          </div>

          {/* Businesses Grid */}
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
              Loading business directory...
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '48px', textAlign: 'center' }}>
              <Building2 size={40} color="#94A3B8" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0' }}>No businesses found</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                Try adjusting your filters or search keywords.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
              {filteredBusinesses.map(biz => {
                const phone = biz.phone || '';
                const whatsapp = biz.whatsappNumber || phone;
                return (
                  <div
                    key={biz._id}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      padding: '20px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      {/* Top Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Building2 size={22} />
                          </div>
                          <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: '0 0 2px 0' }}>
                              {biz.businessName}
                            </h3>
                            <span style={{ fontSize: '12.5px', color: '#64748B' }}>
                              {biz.category} • {biz.ownerName ? `Owner: ${biz.ownerName}` : ''}
                            </span>
                          </div>
                        </div>

                        <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '12px', background: '#DCFCE7', color: '#16A34A' }}>
                          Verified
                        </span>
                      </div>

                      {/* Details row */}
                      <div style={{ fontSize: '12.5px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={14} color="#64748B" />
                          <span>{biz.address ? `${biz.address}, ` : ''}{biz.city || 'City on request'}</span>
                        </div>

                        {biz.operatingHours && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={14} color="#16A34A" />
                            <span>Hours: {biz.operatingHours}</span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
                        {(biz.tags || []).map((t, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: '#F1F5F9',
                              color: '#334155',
                              fontSize: '11.5px',
                              fontWeight: '600',
                              padding: '3px 8px',
                              borderRadius: '12px'
                            }}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Contact Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                      <a
                        href={`tel:${phone}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '9px 12px',
                          background: '#EFF6FF',
                          color: '#2563EB',
                          border: '1px solid #BFDBFE',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '700',
                          textDecoration: 'none'
                        }}
                      >
                        <Phone size={14} /> Call
                      </a>

                      <a
                        href={`https://wa.me/91${whatsapp.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(biz.businessName)},%20I%20found%20your%20business%20on%20BizTech%20and%20would%20like%20to%20enquire%20about%20products/supplies.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '9px 12px',
                          background: '#DCFCE7',
                          color: '#16A34A',
                          border: '1px solid #BBF7D0',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '700',
                          textDecoration: 'none'
                        }}
                      >
                        <MessageSquare size={14} /> WhatsApp
                      </a>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default LocalDirectory;
