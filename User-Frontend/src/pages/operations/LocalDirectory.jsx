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
  ShieldCheck,
  RefreshCw,
  Store,
  Mail
} from 'lucide-react';
import TablePagination from '@/components/TablePagination';

const LocalDirectory = () => {
  const [activeTab, setActiveTab] = useState('careers'); // 'careers' | 'businesses'
  const [careers, setCareers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [careerSearch, setCareerSearch] = useState('');
  const [businessSearch, setBusinessSearch] = useState('');

  // Pagination
  const [careerPage, setCareerPage] = useState(1);
  const [careerItemsPerPage, setCareerItemsPerPage] = useState(10);
  const [businessPage, setBusinessPage] = useState(1);
  const [businessItemsPerPage, setBusinessItemsPerPage] = useState(10);

  useEffect(() => {
    fetchDirectoryData();
  }, [activeTab]);

  useEffect(() => {
    setCareerPage(1);
  }, [careerSearch]);

  useEffect(() => {
    setBusinessPage(1);
  }, [businessSearch]);

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

  // Paginated slices
  const paginatedCareers = filteredCareers.slice((careerPage - 1) * careerItemsPerPage, careerPage * careerItemsPerPage);
  const paginatedBusinesses = filteredBusinesses.slice((businessPage - 1) * businessItemsPerPage, businessPage * businessItemsPerPage);

  const careerStartIndex = (careerPage - 1) * careerItemsPerPage;
  const businessStartIndex = (businessPage - 1) * businessItemsPerPage;

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      
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
          {/* Search Bar */}
          <div style={{ background: 'white', padding: '16px 20px', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
            
            {/* Reduced width Search bar */}
            <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by candidate name, skill, role..."
                value={careerSearch}
                onChange={e => setCareerSearch(e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 12px 0 36px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

          </div>

          {/* Candidates Table View */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '14px 18px', width: '60px' }}>S.NO</th>
                    <th style={{ padding: '14px 18px' }}>CANDIDATE</th>
                    <th style={{ padding: '14px 18px' }}>SECTOR & EXPERIENCE</th>
                    <th style={{ padding: '14px 18px' }}>LOCATION</th>
                    <th style={{ padding: '14px 18px' }}>SKILLS</th>
                    <th style={{ padding: '14px 18px' }}>HIRE STATUS</th>
                    <th style={{ padding: '14px 18px', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '48px 20px', textAlign: 'center', color: '#64748B' }}>
                        <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                        Loading talent directory...
                      </td>
                    </tr>
                  ) : filteredCareers.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '48px 20px', color: '#94A3B8' }}>
                        <Users size={40} style={{ opacity: 0.3, marginBottom: '10px', display: 'inline-block' }} />
                        <h4 style={{ margin: '0 0 6px 0', color: '#334155', fontSize: '16px', fontWeight: '700' }}>No Candidates Found</h4>
                        <p style={{ margin: 0, fontSize: '13.5px' }}>
                          Try adjusting your search filters or check back as more candidates register.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedCareers.map((cand, idx) => {
                      const phone = cand.phone || '';
                      const whatsapp = cand.whatsappNumber || phone;
                      const serial = careerStartIndex + idx + 1;
                      const isAvailable = cand.isAvailableForHire !== false;

                      return (
                        <tr
                          key={cand._id}
                          style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}
                          onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'}
                          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* S.NO */}
                          <td style={{ padding: '14px 18px', color: '#64748B', fontWeight: '600' }}>
                            {serial}
                          </td>

                          {/* Candidate Name & Avatar */}
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', fontWeight: '800', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #DBEAFE' }}>
                                {cand.fullName ? cand.fullName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <span style={{ fontWeight: '700', color: '#0F172A', display: 'block', fontSize: '14px' }}>
                                  {cand.fullName}
                                </span>
                                {cand._id && (
                                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                                    ID: {cand._id.slice(-6).toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Sector & Experience */}
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontWeight: '600', color: '#1E293B' }}>
                              {cand.jobCategory || 'General Work'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span>Exp: <strong>{cand.experience || 'Fresher'}</strong></span>
                              {cand.expectedSalary && (
                                <span style={{ color: '#16A34A', fontWeight: '600' }}>
                                  • Pay: {cand.expectedSalary}
                                </span>
                              )}
                            </div>
                            {cand.drivingLicense && cand.drivingLicense !== 'None' && (
                              <div style={{ fontSize: '11.5px', color: '#B45309', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                                <Truck size={12} color="#D97706" /> License: {cand.drivingLicense}
                              </div>
                            )}
                          </td>

                          {/* Location */}
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600', color: '#334155' }}>
                              <MapPin size={13} color="#64748B" />
                              <span>{cand.city || 'City pending'}</span>
                            </div>
                            {cand.currentArea && (
                              <div style={{ fontSize: '12px', color: '#64748B', paddingLeft: '18px' }}>
                                {cand.currentArea}
                              </div>
                            )}
                          </td>

                          {/* Skills */}
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '220px' }}>
                              {(cand.skills || []).map((sk, sIdx) => (
                                <span
                                  key={sIdx}
                                  style={{
                                    background: '#EFF6FF',
                                    color: '#1D4ED8',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    border: '1px solid #DBEAFE',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {sk}
                                </span>
                              ))}
                              {(!cand.skills || cand.skills.length === 0) && (
                                <span style={{ color: '#94A3B8', fontSize: '12px' }}>—</span>
                              )}
                            </div>
                          </td>

                          {/* Hire Status */}
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              padding: '3px 9px',
                              borderRadius: '12px',
                              background: isAvailable ? '#DCFCE7' : '#F1F5F9',
                              color: isAvailable ? '#16A34A' : '#64748B',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap'
                            }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isAvailable ? '#16A34A' : '#94A3B8' }}></span>
                              {isAvailable ? 'Available' : 'Employed'}
                            </span>
                          </td>

                          {/* Action Buttons: Direct Call & WhatsApp */}
                          <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              {phone && (
                                <a
                                  href={`tel:${phone}`}
                                  title={`Call ${cand.fullName}`}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '7px 12px',
                                    background: '#EFF6FF',
                                    color: '#2563EB',
                                    border: '1px solid #BFDBFE',
                                    borderRadius: '8px',
                                    fontSize: '12.5px',
                                    fontWeight: '700',
                                    textDecoration: 'none',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.15s'
                                  }}
                                  onMouseOver={e => e.currentTarget.style.background = '#DBEAFE'}
                                  onMouseOut={e => e.currentTarget.style.background = '#EFF6FF'}
                                >
                                  <Phone size={13} /> Call
                                </a>
                              )}

                              {whatsapp && (
                                <a
                                  href={`https://wa.me/91${whatsapp.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(cand.fullName)},%20we%20found%20your%20profile%20on%20BizTech%20and%20are%20looking%20to%20hire%20for%20${encodeURIComponent(cand.jobCategory || 'work')}.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={`WhatsApp ${cand.fullName}`}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '7px 12px',
                                    background: '#DCFCE7',
                                    color: '#16A34A',
                                    border: '1px solid #BBF7D0',
                                    borderRadius: '8px',
                                    fontSize: '12.5px',
                                    fontWeight: '700',
                                    textDecoration: 'none',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.15s'
                                  }}
                                  onMouseOver={e => e.currentTarget.style.background = '#BBF7D0'}
                                  onMouseOut={e => e.currentTarget.style.background = '#DCFCE7'}
                                >
                                  <MessageSquare size={13} /> WhatsApp
                                </a>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredCareers.length > 0 && (
              <TablePagination
                currentPage={careerPage}
                totalPages={Math.ceil(filteredCareers.length / careerItemsPerPage) || 1}
                itemsPerPage={careerItemsPerPage}
                totalItems={filteredCareers.length}
                onPageChange={setCareerPage}
                onItemsPerPageChange={(val) => { setCareerItemsPerPage(val); setCareerPage(1); }}
              />
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: LOCAL BUSINESS DIRECTORY (SUPPLIERS)              */}
      {/* ======================================================== */}
      {activeTab === 'businesses' && (
        <div>
          {/* Search Bar */}
          <div style={{ background: 'white', padding: '16px 20px', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
            
            {/* Reduced width Search bar */}
            <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search shop name, tags, city..."
                value={businessSearch}
                onChange={e => setBusinessSearch(e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 12px 0 36px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

          </div>

          {/* Businesses Table View */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '14px 18px', width: '60px' }}>S.NO</th>
                    <th style={{ padding: '14px 18px' }}>BUSINESS / STORE</th>
                    <th style={{ padding: '14px 18px' }}>OWNER & CONTACT</th>
                    <th style={{ padding: '14px 18px' }}>LOCATION</th>
                    <th style={{ padding: '14px 18px' }}>HOURS</th>
                    <th style={{ padding: '14px 18px' }}>TAGS & KEYWORDS</th>
                    <th style={{ padding: '14px 18px' }}>STATUS</th>
                    <th style={{ padding: '14px 18px', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" style={{ padding: '48px 20px', textAlign: 'center', color: '#64748B' }}>
                        <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                        Loading business directory...
                      </td>
                    </tr>
                  ) : filteredBusinesses.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '48px 20px', color: '#94A3B8' }}>
                        <Building2 size={40} style={{ opacity: 0.3, marginBottom: '10px', display: 'inline-block' }} />
                        <h4 style={{ margin: '0 0 6px 0', color: '#334155', fontSize: '16px', fontWeight: '700' }}>No Businesses Found</h4>
                        <p style={{ margin: 0, fontSize: '13.5px' }}>
                          Try adjusting your search filters or keywords.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedBusinesses.map((biz, idx) => {
                      const phone = biz.phone || '';
                      const whatsapp = biz.whatsappNumber || phone;
                      const serial = businessStartIndex + idx + 1;

                      return (
                        <tr
                          key={biz._id}
                          style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}
                          onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'}
                          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* S.NO */}
                          <td style={{ padding: '14px 18px', color: '#64748B', fontWeight: '600' }}>
                            {serial}
                          </td>

                          {/* Business Name & Store Icon */}
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #DBEAFE' }}>
                                <Store size={18} />
                              </div>
                              <div>
                                <span style={{ fontWeight: '700', color: '#0F172A', display: 'block', fontSize: '14px' }}>
                                  {biz.businessName}
                                </span>
                                <span style={{ fontSize: '12px', color: '#64748B' }}>
                                  {biz.category || 'Retail'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Owner & Contact */}
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontWeight: '600', color: '#1E293B' }}>
                              {biz.ownerName || 'Business Owner'}
                            </div>
                            {phone && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                                <Phone size={12} /> {phone}
                              </div>
                            )}
                          </td>

                          {/* Location */}
                          <td style={{ padding: '14px 18px', maxWidth: '240px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600', color: '#334155' }}>
                              <MapPin size={13} color="#64748B" />
                              <span>{biz.city || 'City pending'}</span>
                            </div>
                            {biz.address && (
                              <div style={{ fontSize: '12px', color: '#64748B', paddingLeft: '18px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={biz.address}>
                                {biz.address}
                              </div>
                            )}
                          </td>

                          {/* Operating Hours */}
                          <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                            {biz.operatingHours ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: '#475569' }}>
                                <Clock size={13} color="#16A34A" />
                                <span>{biz.operatingHours}</span>
                              </div>
                            ) : (
                              <span style={{ color: '#94A3B8', fontSize: '12px' }}>—</span>
                            )}
                          </td>

                          {/* Tags & Keywords */}
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '220px' }}>
                              {(biz.tags || []).map((t, tIdx) => (
                                <span
                                  key={tIdx}
                                  style={{
                                    background: '#F1F5F9',
                                    color: '#334155',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  #{t}
                                </span>
                              ))}
                              {(!biz.tags || biz.tags.length === 0) && (
                                <span style={{ color: '#94A3B8', fontSize: '12px' }}>—</span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              padding: '3px 9px',
                              borderRadius: '12px',
                              background: '#DCFCE7',
                              color: '#16A34A',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap'
                            }}>
                              <ShieldCheck size={12} />
                              Verified
                            </span>
                          </td>

                          {/* Actions: Call & WhatsApp */}
                          <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              {phone && (
                                <a
                                  href={`tel:${phone}`}
                                  title={`Call ${biz.businessName}`}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '7px 12px',
                                    background: '#EFF6FF',
                                    color: '#2563EB',
                                    border: '1px solid #BFDBFE',
                                    borderRadius: '8px',
                                    fontSize: '12.5px',
                                    fontWeight: '700',
                                    textDecoration: 'none',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.15s'
                                  }}
                                  onMouseOver={e => e.currentTarget.style.background = '#DBEAFE'}
                                  onMouseOut={e => e.currentTarget.style.background = '#EFF6FF'}
                                >
                                  <Phone size={13} /> Call
                                </a>
                              )}

                              {whatsapp && (
                                <a
                                  href={`https://wa.me/91${whatsapp.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(biz.businessName)},%20I%20found%20your%20business%20on%20BizTech%20and%20would%20like%20to%20enquire%20about%20products/supplies.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={`WhatsApp ${biz.businessName}`}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '7px 12px',
                                    background: '#DCFCE7',
                                    color: '#16A34A',
                                    border: '1px solid #BBF7D0',
                                    borderRadius: '8px',
                                    fontSize: '12.5px',
                                    fontWeight: '700',
                                    textDecoration: 'none',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.15s'
                                  }}
                                  onMouseOver={e => e.currentTarget.style.background = '#BBF7D0'}
                                  onMouseOut={e => e.currentTarget.style.background = '#DCFCE7'}
                                >
                                  <MessageSquare size={13} /> WhatsApp
                                </a>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredBusinesses.length > 0 && (
              <TablePagination
                currentPage={businessPage}
                totalPages={Math.ceil(filteredBusinesses.length / businessItemsPerPage) || 1}
                itemsPerPage={businessItemsPerPage}
                totalItems={filteredBusinesses.length}
                onPageChange={setBusinessPage}
                onItemsPerPageChange={(val) => { setBusinessItemsPerPage(val); setBusinessPage(1); }}
              />
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default LocalDirectory;
