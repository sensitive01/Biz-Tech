import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Store,
  Briefcase,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Edit3,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  User,
  Tag,
  CheckCircle2,
  XCircle,
  Building2,
  Award,
  GraduationCap,
  Sparkles,
  RefreshCw,
  X,
  Truck,
  Upload,
  Loader2
} from 'lucide-react';
import { exportToCSV } from '../utils/exportToCSV';
import TablePagination from '../components/TablePagination';

const DirectoryRegistrations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Tab: 'business' | 'career'
  const initialTab = searchParams.get('tab') === 'career' ? 'career' : 'business';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Data state
  const [businesses, setBusinesses] = useState([]);
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [viewItem, setViewItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Edit State
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [customTagInput, setCustomTagInput] = useState('');
  const [customSkillInput, setCustomSkillInput] = useState('');

  // Sync tab with URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'career' || tabParam === 'business') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setCurrentPage(1);
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedCity('All');
    setSelectedStatus('All');
  };

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [bizRes, careerRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/directory/businesses`),
        fetch(`${import.meta.env.VITE_API_URL}/api/directory/careers`)
      ]);

      if (bizRes.ok) {
        const bizData = await bizRes.json();
        setBusinesses(bizData);
      }
      if (careerRes.ok) {
        const careerData = await careerRes.json();
        setCareers(careerData);
      }
    } catch (err) {
      console.error('Failed to fetch directory data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open Edit Modal
  const handleOpenEdit = (type, item) => {
    if (type === 'business') {
      setEditForm({
        businessName: item.businessName || '',
        category: item.category || 'Retail',
        ownerName: item.ownerName || '',
        contactPhone: item.phone || '',
        whatsappNumber: item.whatsappNumber || item.phone || '',
        email: item.email || '',
        address: item.address || '',
        city: item.city || '',
        state: item.state || '',
        pincode: item.pincode || '',
        tags: Array.isArray(item.tags) ? [...item.tags] : [],
        websiteOrSocial: item.websiteOrSocial || '',
        description: item.description || '',
        panNumber: item.panNumber || '',
        panProofUrl: item.panProofUrl || '',
        isVerified: Boolean(item.isVerified)
      });
      setCustomTagInput('');
    } else {
      setEditForm({
        fullName: item.fullName || '',
        jobCategory: item.jobCategory || '',
        experience: item.experience || '1-2 Years',
        contactPhone: item.phone || '',
        whatsappNumber: item.whatsappNumber || item.phone || '',
        email: item.email || '',
        city: item.city || '',
        currentArea: item.currentArea || '',
        pincode: item.pincode || '',
        qualification: item.qualification || '',
        employmentType: item.employmentType || 'Full-time',
        availability: item.availability || 'Immediate',
        expectedSalary: item.expectedSalary || '',
        drivingLicense: item.drivingLicense || 'None',
        skills: Array.isArray(item.skills) ? [...item.skills] : [],
        bio: item.bio || '',
        isAvailableForHire: item.isAvailableForHire !== false
      });
      setCustomSkillInput('');
    }
    setEditItem({ type, data: item });
  };

  const [uploadingAdminProof, setUploadingAdminProof] = useState(false);

  const handleAdminProofUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Instant direct image preview
    const reader = new FileReader();
    reader.onload = () => {
      setEditForm(prev => ({
        ...prev,
        panProofUrl: reader.result,
        panProofName: file.name
      }));
    };
    reader.readAsDataURL(file);

    setUploadingAdminProof(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('proof', file);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/directory/upload-pan-proof`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.fileUrl) {
        setEditForm(prev => ({
          ...prev,
          panProofUrl: data.fileUrl,
          panProofName: data.originalName || file.name
        }));
      }
    } catch (err) {
      console.error('Error uploading proof image by admin:', err);
    } finally {
      setUploadingAdminProof(false);
    }
  };

  // Save Edit Changes
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editItem) return;
    setSavingEdit(true);
    try {
      const endpoint = editItem.type === 'business'
        ? `${import.meta.env.VITE_API_URL}/api/admin/directory/business/${editItem.data._id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/directory/career/${editItem.data._id}`;

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        if (editItem.type === 'business') {
          setBusinesses(prev => prev.map(b => {
            if (b._id === editItem.data._id) {
              return {
                ...b,
                ...editForm,
                phone: editForm.contactPhone || b.phone
              };
            }
            return b;
          }));
        } else {
          setCareers(prev => prev.map(c => {
            if (c._id === editItem.data._id) {
              return {
                ...c,
                ...editForm,
                phone: editForm.contactPhone || c.phone
              };
            }
            return c;
          }));
        }
        setEditItem(null);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to update user data');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating user data');
    } finally {
      setSavingEdit(false);
    }
  };

  // Toggle Business Verification
  const handleToggleVerification = async (bizId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/directory/verify-business/${bizId}`, {
        method: 'PUT'
      });
      if (res.ok) {
        setBusinesses(prev => prev.map(b => b._id === bizId ? { ...b, isVerified: !b.isVerified } : b));
        if (viewItem && viewItem.data._id === bizId) {
          setViewItem(prev => ({ ...prev, data: { ...prev.data, isVerified: !prev.data.isVerified } }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Candidate Hire Availability
  const handleToggleHireStatus = async (careerId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/directory/toggle-hire-status/${careerId}`, {
        method: 'PUT'
      });
      if (res.ok) {
        setCareers(prev => prev.map(c => c._id === careerId ? { ...c, isAvailableForHire: !c.isAvailableForHire } : c));
        if (viewItem && viewItem.data._id === careerId) {
          setViewItem(prev => ({ ...prev, data: { ...prev.data, isAvailableForHire: !prev.data.isAvailableForHire } }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Registration
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${deleteTarget._id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (activeTab === 'business') {
          setBusinesses(prev => prev.filter(b => b._id !== deleteTarget._id));
        } else {
          setCareers(prev => prev.filter(c => c._id !== deleteTarget._id));
        }
        setDeleteTarget(null);
      } else {
        alert('Failed to delete registration');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting registration');
    } finally {
      setDeleting(false);
    }
  };

  // Unique Cities and Categories for dropdowns
  const businessCities = useMemo(() => {
    const set = new Set(businesses.map(b => b.city).filter(Boolean));
    return Array.from(set);
  }, [businesses]);

  const careerCities = useMemo(() => {
    const set = new Set(careers.map(c => c.city).filter(Boolean));
    return Array.from(set);
  }, [careers]);

  const careerSectors = useMemo(() => {
    const set = new Set(careers.map(c => c.jobCategory).filter(Boolean));
    return Array.from(set);
  }, [careers]);

  // Filtered Businesses
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (b.businessName && b.businessName.toLowerCase().includes(q)) ||
        (b.ownerName && b.ownerName.toLowerCase().includes(q)) ||
        (b.email && b.email.toLowerCase().includes(q)) ||
        (b.phone && b.phone.toLowerCase().includes(q)) ||
        (b.city && b.city.toLowerCase().includes(q)) ||
        (b.state && b.state.toLowerCase().includes(q)) ||
        (b.address && b.address.toLowerCase().includes(q)) ||
        (b.tags && b.tags.some(t => t.toLowerCase().includes(q)))
      );

      const matchesStatus = selectedStatus === 'All' ||
        (selectedStatus === 'Verified' && b.isVerified) ||
        (selectedStatus === 'Unverified' && !b.isVerified);

      return matchesSearch && matchesStatus;
    });
  }, [businesses, searchQuery, selectedStatus]);

  // Filtered Careers
  const filteredCareers = useMemo(() => {
    return careers.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (c.fullName && c.fullName.toLowerCase().includes(q)) ||
        (c.jobCategory && c.jobCategory.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.currentArea && c.currentArea.toLowerCase().includes(q)) ||
        (c.skills && c.skills.some(s => s.toLowerCase().includes(q)))
      );

      const matchesStatus = selectedStatus === 'All' ||
        (selectedStatus === 'Available' && c.isAvailableForHire !== false) ||
        (selectedStatus === 'Unavailable' && c.isAvailableForHire === false);

      return matchesSearch && matchesStatus;
    });
  }, [careers, searchQuery, selectedStatus]);

  // Paginated Data
  const currentList = activeTab === 'business' ? filteredBusinesses : filteredCareers;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return currentList.slice(start, start + itemsPerPage);
  }, [currentList, currentPage, itemsPerPage]);

  const handleExportCSV = () => {
    if (activeTab === 'business') {
      const exportData = filteredBusinesses.map((b, i) => ({
        'S.No': i + 1,
        'Business Name': b.businessName,
        'Owner Name': b.ownerName,
        'Phone': b.phone,
        'WhatsApp': b.whatsappNumber,
        'Email': b.email,
        'Address': b.address,
        'City': b.city,
        'State': b.state,
        'Pincode': b.pincode,
        'Tags': (b.tags || []).join('; '),
        'Website': b.websiteOrSocial || '',
        'Verified': b.isVerified ? 'Yes' : 'No',
        'Registered At': b.registeredAt ? new Date(b.registeredAt).toLocaleDateString() : ''
      }));
      exportToCSV(exportData, `Business_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    } else {
      const exportData = filteredCareers.map((c, i) => ({
        'S.No': i + 1,
        'Candidate Name': c.fullName,
        'Role / Job Category': c.jobCategory,
        'Total Experience': c.experience,
        'Phone': c.phone,
        'WhatsApp': c.whatsappNumber,
        'Email': c.email,
        'City': c.city,
        'Area': c.currentArea || '',
        'Qualification': c.qualification || '',
        'Work Preference': c.employmentType || '',
        'Availability': c.availability || '',
        'Expected Salary': c.expectedSalary || '',
        'Skills': (c.skills || []).join('; '),
        'Available for Hire': c.isAvailableForHire !== false ? 'Yes' : 'No',
        'Registered At': c.registeredAt ? new Date(c.registeredAt).toLocaleDateString() : ''
      }));
      exportToCSV(exportData, `Career_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Page Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '6px', color: '#0F172A' }}>
            Business & Career Registrations
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', margin: 0 }}>
            Monitor and manage registered local store listings and job seeker career profiles
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchData}
            disabled={refreshing}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: 'white',
              color: '#334155',
              fontWeight: '600',
              fontSize: '13.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={handleExportCSV}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: 'white',
              color: '#334155',
              fontWeight: '600',
              fontSize: '13.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {/* THREE-WAY TOP DIRECTORY NAVIGATION PILL */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px',
        background: '#F1F5F9',
        borderRadius: '12px',
        width: 'fit-content'
      }}>
        <button
          onClick={() => navigate('/admin/customers')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: 'transparent',
            color: '#64748B',
            fontWeight: '600',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
          onMouseOver={e => e.currentTarget.style.color = '#0F172A'}
          onMouseOut={e => e.currentTarget.style.color = '#64748B'}
        >
          <Building2 size={16} />
          Pro ERP Clients
        </button>

        <button
          onClick={() => switchTab('business')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            background: activeTab === 'business' ? 'white' : 'transparent',
            color: activeTab === 'business' ? '#2563EB' : '#64748B',
            fontWeight: activeTab === 'business' ? '700' : '600',
            fontSize: '13.5px',
            boxShadow: activeTab === 'business' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <Store size={16} />
          Business Registrations ({businesses.length})
        </button>

        <button
          onClick={() => switchTab('career')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            background: activeTab === 'career' ? 'white' : 'transparent',
            color: activeTab === 'career' ? '#2563EB' : '#64748B',
            fontWeight: activeTab === 'career' ? '700' : '600',
            fontSize: '13.5px',
            boxShadow: activeTab === 'career' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <Briefcase size={16} />
          Career Registrations ({careers.length})
        </button>
      </div>

      {/* KPI METRICS ROW */}
      {activeTab === 'business' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Store size={22} />
            </div>
            <div>
              <p style={{ margin: '0 0 3px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Stores Listed</p>
              <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>{businesses.length}</h3>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <p style={{ margin: '0 0 3px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Verified Listings</p>
              <h3 style={{ margin: 0, fontSize: '24px', color: '#16A34A', fontWeight: '800' }}>
                {businesses.filter(b => b.isVerified).length}
              </h3>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={22} />
            </div>
            <div>
              <p style={{ margin: '0 0 3px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Cities Covered</p>
              <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>{businessCities.length || 1}</h3>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Tag size={22} />
            </div>
            <div>
              <p style={{ margin: '0 0 3px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Store Tags Active</p>
              <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>
                {businesses.reduce((acc, b) => acc + (b.tags?.length || 0), 0)}
              </h3>
            </div>
          </div>

        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={22} />
            </div>
            <div>
              <p style={{ margin: '0 0 3px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Candidates</p>
              <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>{careers.length}</h3>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Award size={22} />
            </div>
            <div>
              <p style={{ margin: '0 0 3px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Available for Hire</p>
              <h3 style={{ margin: 0, fontSize: '24px', color: '#16A34A', fontWeight: '800' }}>
                {careers.filter(c => c.isAvailableForHire !== false).length}
              </h3>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={22} />
            </div>
            <div>
              <p style={{ margin: '0 0 3px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Immediate Joiners</p>
              <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>
                {careers.filter(c => !c.availability || c.availability === 'Immediate').length}
              </h3>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Briefcase size={22} />
            </div>
            <div>
              <p style={{ margin: '0 0 3px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Industry Sectors</p>
              <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>{careerSectors.length || 1}</h3>
            </div>
          </div>

        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Compact Search input */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={17} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder={activeTab === 'business' ? "Search store name, owner, city..." : "Search candidate, role, skills, city..."}
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{
              width: '100%',
              height: '40px',
              paddingLeft: '38px',
              paddingRight: '12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13.5px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Dropdowns */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={selectedStatus}
            onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            style={{
              height: '40px',
              padding: '0 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              background: 'white',
              color: '#334155'
            }}
          >
            <option value="All">All Statuses</option>
            {activeTab === 'business' ? (
              <>
                <option value="Verified">Verified Only</option>
                <option value="Unverified">Unverified Only</option>
              </>
            ) : (
              <>
                <option value="Available">Available for Hire</option>
                <option value="Unavailable">Not Looking</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* DATA TABLE CONTAINER */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
            <p style={{ fontSize: '15px', fontWeight: '600' }}>Loading registrations...</p>
          </div>
        ) : paginatedList.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
            <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>No registrations found</p>
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>Try adjusting your search query or filters.</p>
          </div>
        ) : activeTab === 'business' ? (
          /* BUSINESS TABLE */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 18px', width: '60px' }}>S.NO</th>
                  <th style={{ padding: '14px 18px' }}>BUSINESS / STORE</th>
                  <th style={{ padding: '14px 18px' }}>OWNER & CONTACT</th>
                  <th style={{ padding: '14px 18px' }}>LOCATION</th>
                  <th style={{ padding: '14px 18px' }}>TAGS & KEYWORDS</th>
                  <th style={{ padding: '14px 18px' }}>STATUS</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedList.map((b, idx) => {
                  const serial = (currentPage - 1) * itemsPerPage + idx + 1;
                  return (
                    <tr key={b._id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }} onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      
                      <td style={{ padding: '14px 18px', color: '#64748B', fontWeight: '600' }}>
                        {serial}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}>
                            <Store size={18} />
                          </div>
                          <div>
                            <span style={{ fontWeight: '700', color: '#0F172A', display: 'block' }}>
                              {b.businessName}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                                ID: {b._id.slice(-6).toUpperCase()}
                              </span>
                              {b.panNumber && (
                                <span style={{ fontSize: '10.5px', background: '#F1F5F9', color: '#334155', padding: '1px 5px', borderRadius: '4px', fontWeight: '700', fontFamily: 'monospace' }}>
                                  PAN: {b.panNumber}
                                </span>
                              )}
                              {b.panProofUrl && (
                                <a
                                  href={b.panProofUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ fontSize: '10.5px', color: '#2563EB', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                                  title="View uploaded PAN proof document"
                                >
                                  Proof ↗
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontWeight: '600', color: '#334155', display: 'block' }}>
                          {b.ownerName || 'Store Owner'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '12.5px', color: '#64748B' }}>
                          <Phone size={12} /> {b.phone}
                        </div>
                        {b.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94A3B8' }}>
                            <Mail size={12} /> {b.email}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontWeight: '600', color: '#334155', display: 'block' }}>
                          {b.city || 'City pending'}{b.state ? `, ${b.state}` : ''}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748B', display: 'block', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.address || 'Address pending'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                          {(b.tags || []).slice(0, 3).map((tag, tIdx) => (
                            <span key={tIdx} style={{ background: '#F1F5F9', color: '#475569', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px' }}>
                              {tag}
                            </span>
                          ))}
                          {(b.tags || []).length > 3 && (
                            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600', padding: '2px 4px' }}>
                              +{b.tags.length - 3} more
                            </span>
                          )}
                          {(!b.tags || b.tags.length === 0) && (
                            <span style={{ color: '#94A3B8', fontSize: '12px' }}>No tags</span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <button
                          onClick={() => handleToggleVerification(b._id)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '12px',
                            border: b.isVerified ? '1px solid #BBF7D0' : (b.panProofUrl ? '1px solid #BFDBFE' : '1px solid #E2E8F0'),
                            fontSize: '11.5px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: b.isVerified ? '#DCFCE7' : (b.panProofUrl ? '#EFF6FF' : '#F1F5F9'),
                            color: b.isVerified ? '#166534' : (b.panProofUrl ? '#1D4ED8' : '#64748B')
                          }}
                          title={b.isVerified ? "Click to revoke verification" : "Click to mark as verified"}
                        >
                          {b.isVerified ? <CheckCircle2 size={13} /> : (b.panProofUrl ? <ShieldCheck size={13} /> : <XCircle size={13} />)}
                          {b.isVerified ? 'Verified' : (b.panProofUrl ? 'Verify (Has Proof)' : 'Unverified')}
                        </button>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => setViewItem({ type: 'business', data: b })}
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'white', color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title="View Full Profile"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => handleOpenEdit('business', b)}
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'white', color: '#D97706', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title="Edit Store Data"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            onClick={() => setDeleteTarget(b)}
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #FEE2E2', background: '#FEF2F2', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title="Delete Listing"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* CAREER TABLE */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 18px', width: '60px' }}>S.NO</th>
                  <th style={{ padding: '14px 18px' }}>CANDIDATE</th>
                  <th style={{ padding: '14px 18px' }}>SECTOR & EXP</th>
                  <th style={{ padding: '14px 18px' }}>CONTACT</th>
                  <th style={{ padding: '14px 18px' }}>LOCATION</th>
                  <th style={{ padding: '14px 18px' }}>SKILLS</th>
                  <th style={{ padding: '14px 18px' }}>HIRE STATUS</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedList.map((c, idx) => {
                  const serial = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isAvailable = c.isAvailableForHire !== false;
                  return (
                    <tr key={c._id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }} onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      
                      <td style={{ padding: '14px 18px', color: '#64748B', fontWeight: '600' }}>
                        {serial}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0, fontSize: '14px' }}>
                            {c.fullName ? c.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span style={{ fontWeight: '700', color: '#0F172A', display: 'block' }}>
                              {c.fullName}
                            </span>
                            <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                              ID: {c._id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontWeight: '600', color: '#334155', display: 'block' }}>
                          {c.jobCategory || 'General Work'}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>
                          Exp: <strong>{c.experience || 'Fresher'}</strong>
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#334155', fontWeight: '600' }}>
                          <Phone size={12} /> {c.phone}
                        </div>
                        {c.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                            <Mail size={12} /> {c.email}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontWeight: '600', color: '#334155', display: 'block' }}>
                          {c.city || 'City pending'}
                        </span>
                        {c.currentArea && (
                          <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>
                            {c.currentArea}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                          {(c.skills || []).slice(0, 3).map((skill, sIdx) => (
                            <span key={sIdx} style={{ background: '#EFF6FF', color: '#2563EB', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>
                              {skill}
                            </span>
                          ))}
                          {(c.skills || []).length > 3 && (
                            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600', padding: '2px 4px' }}>
                              +{c.skills.length - 3} more
                            </span>
                          )}
                          {(!c.skills || c.skills.length === 0) && (
                            <span style={{ color: '#94A3B8', fontSize: '12px' }}>No skills listed</span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <button
                          onClick={() => handleToggleHireStatus(c._id)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            border: 'none',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: isAvailable ? '#DCFCE7' : '#F1F5F9',
                            color: isAvailable ? '#166534' : '#64748B'
                          }}
                          title="Click to toggle availability"
                        >
                          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: isAvailable ? '#16A34A' : '#94A3B8' }} />
                          {isAvailable ? 'Available' : 'Unavailable'}
                        </button>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => setViewItem({ type: 'career', data: c })}
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'white', color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title="View Full Candidate Profile"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => handleOpenEdit('career', c)}
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'white', color: '#D97706', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title="Edit Candidate Data"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            onClick={() => setDeleteTarget(c)}
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #FEE2E2', background: '#FEF2F2', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title="Delete Candidate Profile"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Pagination */}
        {currentList.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalItems={currentList.length}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            itemName={activeTab === 'business' ? 'businesses' : 'candidates'}
          />
        )}

      </div>

      {/* VIEW DETAILS MODAL */}
      {viewItem && (
        <div 
          onClick={e => { if (e.target === e.currentTarget) setViewItem(null); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}
        >
          <div style={{ background: 'white', borderRadius: '18px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px #E2E8F0' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {viewItem.type === 'business' ? <Store size={22} /> : <User size={22} />}
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    {viewItem.type === 'business' ? viewItem.data.businessName : viewItem.data.fullName}
                  </h2>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    {viewItem.type === 'business' ? `Business Listing (${viewItem.data.category || 'Retail'})` : `Job Seeker (${viewItem.data.jobCategory || 'General'})`}
                  </span>
                </div>
              </div>

              <button onClick={() => setViewItem(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            {viewItem.type === 'business' ? (
              /* Business Details */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
                {/* Admin Verification & Statutory Review Box */}
                <div style={{
                  background: viewItem.data.isVerified ? '#F0FDF4' : (viewItem.data.panProofUrl ? '#EFF6FF' : '#FEF3C7'),
                  border: viewItem.data.isVerified ? '1px solid #BBF7D0' : (viewItem.data.panProofUrl ? '1px solid #BFDBFE' : '1px solid #FDE68A'),
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: viewItem.data.isVerified ? '#166534' : (viewItem.data.panProofUrl ? '#1E40AF' : '#92400E'), textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Business Verification Status
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        {viewItem.data.isVerified ? (
                          <span style={{ color: '#166534', fontWeight: '800', fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <CheckCircle2 size={16} /> Verified Storefront
                          </span>
                        ) : (
                          <span style={{ color: viewItem.data.panProofUrl ? '#1D4ED8' : '#B45309', fontWeight: '800', fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Clock size={16} /> {viewItem.data.panProofUrl ? 'Ready for Admin Verification' : 'Pending PAN & Verification'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Prominent Verification Action Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleVerification(viewItem.data._id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: viewItem.data.isVerified ? '#DC2626' : '#16A34A',
                        color: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      {viewItem.data.isVerified ? (
                        <>
                          <XCircle size={15} /> Revoke Verification
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={15} /> Approve & Verify Business
                        </>
                      )}
                    </button>
                  </div>

                  {/* PAN Card & Proof Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'white', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>PAN Card Number</span>
                      <p style={{ margin: '3px 0 0 0', fontWeight: '800', color: '#0F172A', fontFamily: 'monospace', fontSize: '14px' }}>
                        {viewItem.data.panNumber || 'Not submitted'}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Direct PAN Proof Image</span>
                      {viewItem.data.panProofUrl ? (
                        <div style={{ marginTop: '6px' }}>
                          <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden', background: '#F8FAFC', padding: '6px', textAlign: 'center' }}>
                            <img
                              src={viewItem.data.panProofUrl}
                              alt="Uploaded PAN Proof"
                              style={{ maxWidth: '100%', maxHeight: '220px', objectFit: 'contain', display: 'block', margin: '0 auto', borderRadius: '6px' }}
                            />
                          </div>
                          <span style={{ fontSize: '10.5px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                            Direct image uploaded by business owner
                          </span>
                        </div>
                      ) : (
                        <p style={{ margin: '3px 0 0 0', color: '#EF4444', fontSize: '12.5px', fontWeight: '600' }}>
                          No image proof uploaded
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Owner / Contact Person</span>
                  <p style={{ margin: '3px 0 0 0', fontWeight: '700', color: '#0F172A' }}>{viewItem.data.ownerName || 'Not specified'}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Phone Number</span>
                    <p style={{ margin: '3px 0 0 0', fontWeight: '600', color: '#0F172A' }}>{viewItem.data.phone}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>WhatsApp Number</span>
                    <p style={{ margin: '3px 0 0 0', fontWeight: '600', color: '#0F172A' }}>{viewItem.data.whatsappNumber || viewItem.data.phone}</p>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Email Address</span>
                  <p style={{ margin: '3px 0 0 0', fontWeight: '600', color: '#0F172A' }}>{viewItem.data.email || 'Not provided'}</p>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Shop Address</span>
                  <p style={{ margin: '3px 0 0 0', color: '#334155' }}>
                    {viewItem.data.address || 'Address pending'}, {viewItem.data.city || ''} {viewItem.data.state ? `, ${viewItem.data.state}` : ''} {viewItem.data.pincode ? `- ${viewItem.data.pincode}` : ''}
                  </p>
                </div>

                {viewItem.data.websiteOrSocial && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Website / Social Link</span>
                    <p style={{ margin: '3px 0 0 0', color: '#2563EB', fontWeight: '600' }}>
                      {viewItem.data.websiteOrSocial}
                    </p>
                  </div>
                )}

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Tags & Keywords</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(viewItem.data.tags || []).map((t, idx) => (
                      <span key={idx} style={{ background: '#EFF6FF', color: '#2563EB', fontWeight: '700', fontSize: '12px', padding: '4px 10px', borderRadius: '12px' }}>
                        ✓ {t}
                      </span>
                    ))}
                    {(!viewItem.data.tags || viewItem.data.tags.length === 0) && (
                      <span style={{ color: '#94A3B8' }}>No tags assigned</span>
                    )}
                  </div>
                </div>

                {viewItem.data.description && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>About Store</span>
                    <p style={{ margin: 0, background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#334155', lineHeight: '1.5' }}>
                      {viewItem.data.description}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Career Details */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#F8FAFC', padding: '14px', borderRadius: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Sector & Role</span>
                    <p style={{ margin: '3px 0 0 0', fontWeight: '700', color: '#0F172A' }}>{viewItem.data.jobCategory || 'General Staff'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Total Experience</span>
                    <p style={{ margin: '3px 0 0 0', fontWeight: '700', color: '#0F172A' }}>{viewItem.data.experience || 'Fresher'}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Phone Number</span>
                    <p style={{ margin: '3px 0 0 0', fontWeight: '600', color: '#0F172A' }}>{viewItem.data.phone}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>WhatsApp Number</span>
                    <p style={{ margin: '3px 0 0 0', fontWeight: '600', color: '#0F172A' }}>{viewItem.data.whatsappNumber || viewItem.data.phone}</p>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Email Address</span>
                  <p style={{ margin: '3px 0 0 0', fontWeight: '600', color: '#0F172A' }}>{viewItem.data.email || 'Not provided'}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Location</span>
                    <p style={{ margin: '3px 0 0 0', color: '#334155' }}>
                      {viewItem.data.city || 'City pending'}{viewItem.data.currentArea ? `, ${viewItem.data.currentArea}` : ''}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Education / Qualification</span>
                    <p style={{ margin: '3px 0 0 0', color: '#334155' }}>{viewItem.data.qualification || 'Not specified'}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Availability</span>
                    <p style={{ margin: '3px 0 0 0', fontWeight: '600', color: '#16A34A' }}>{viewItem.data.availability || 'Immediate'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Expected Salary</span>
                    <p style={{ margin: '3px 0 0 0', color: '#334155' }}>{viewItem.data.expectedSalary || 'Negotiable'}</p>
                  </div>
                </div>

                {viewItem.data.drivingLicense && viewItem.data.drivingLicense !== 'None' && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Driving License</span>
                    <p style={{ margin: '3px 0 0 0', color: '#334155' }}>{viewItem.data.drivingLicense}</p>
                  </div>
                )}

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Skills & Specialities</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(viewItem.data.skills || []).map((s, idx) => (
                      <span key={idx} style={{ background: '#EFF6FF', color: '#2563EB', fontWeight: '700', fontSize: '12px', padding: '4px 10px', borderRadius: '12px' }}>
                        ✓ {s}
                      </span>
                    ))}
                    {(!viewItem.data.skills || viewItem.data.skills.length === 0) && (
                      <span style={{ color: '#94A3B8' }}>No skills listed</span>
                    )}
                  </div>
                </div>

                {viewItem.data.bio && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Candidate Bio</span>
                    <p style={{ margin: 0, background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#334155', lineHeight: '1.5' }}>
                      {viewItem.data.bio}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setViewItem(null)}
                style={{ padding: '10px 18px', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editItem && (
        <div 
          onClick={e => { if (e.target === e.currentTarget) setEditItem(null); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}
        >
          <div style={{ background: 'white', borderRadius: '18px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px #E2E8F0' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit3 size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    {editItem.type === 'business' ? 'Edit Business Listing' : 'Edit Candidate Profile'}
                  </h2>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    ID: {editItem.data._id.slice(-6).toUpperCase()} • Update user information directly
                  </span>
                </div>
              </div>

              <button onClick={() => setEditItem(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {editItem.type === 'business' ? (
                /* Business Edit Fields */
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Business / Shop Name *</label>
                    <input type="text" value={editForm.businessName || ''} onChange={e => setEditForm({...editForm, businessName: e.target.value})} required style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Owner / Contact Person Name</label>
                    <input type="text" value={editForm.ownerName || ''} onChange={e => setEditForm({...editForm, ownerName: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }} />
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
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Business Email Address</label>
                    <input type="email" placeholder="store@example.com" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Shop Address</label>
                    <input type="text" value={editForm.address || ''} onChange={e => setEditForm({...editForm, address: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>City *</label>
                      <input type="text" value={editForm.city || ''} onChange={e => setEditForm({...editForm, city: e.target.value})} required style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>State</label>
                      <input type="text" placeholder="e.g. Karnataka" value={editForm.state || ''} onChange={e => setEditForm({...editForm, state: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Pincode</label>
                      <input type="text" maxLength={6} value={editForm.pincode || ''} onChange={e => setEditForm({...editForm, pincode: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  {/* Tags editor */}
                  <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>Tags & Keywords</label>
                    {editForm.tags && editForm.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                        {editForm.tags.map(t => (
                          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#2563EB', color: 'white', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '14px' }}>
                            <span>✓ {t}</span>
                            <button type="button" onClick={() => setEditForm(prev => ({ ...prev, tags: prev.tags.filter(x => x !== t) }))} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: 0, fontSize: '11px', display: 'flex', alignItems: 'center' }}>✕</button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="Add tag (e.g. Organic, Rice, Hardware)"
                        value={customTagInput}
                        onChange={e => setCustomTagInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = customTagInput.trim();
                            if (val && !editForm.tags?.includes(val)) {
                              setEditForm(prev => ({ ...prev, tags: [...(prev.tags || []), val] }));
                              setCustomTagInput('');
                            }
                          }
                        }}
                        style={{ flex: 1, height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = customTagInput.trim();
                          if (val && !editForm.tags?.includes(val)) {
                            setEditForm(prev => ({ ...prev, tags: [...(prev.tags || []), val] }));
                            setCustomTagInput('');
                          }
                        }}
                        style={{ height: '36px', padding: '0 12px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
                      >
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
                    <textarea rows={3} value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  </div>

                  {/* Statutory KYC (PAN Details) */}
                  <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                      Statutory KYC (PAN Details)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>PAN Card Number</label>
                        <input
                          type="text"
                          maxLength={10}
                          placeholder="ABCDE1234F"
                          value={editForm.panNumber || ''}
                          onChange={e => setEditForm({...editForm, panNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')})}
                          style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', background: 'white', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>PAN Proof (Direct Image Upload)</label>
                        {editForm.panProofUrl ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', border: '1px solid #CBD5E1', padding: '6px 10px', borderRadius: '8px', minHeight: '52px', boxSizing: 'border-box' }}>
                            <div style={{ width: '48px', height: '42px', borderRadius: '6px', overflow: 'hidden', background: '#F8FAFC', border: '1px solid #E2E8F0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <img src={editForm.panProofUrl} alt="Proof" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <span style={{ fontSize: '11px', fontWeight: '700', color: '#166534', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                Direct Image Attached
                              </span>
                              <label style={{ cursor: 'pointer', color: '#2563EB', fontSize: '11px', fontWeight: '700', display: 'inline-block', marginTop: '2px' }}>
                                Change Photo
                                <input type="file" accept="image/png,image/jpeg,image/webp,image/jpg" onChange={handleAdminProofUpload} style={{ display: 'none' }} />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '42px', background: 'white', border: '1.5px dashed #3B82F6', borderRadius: '8px', cursor: uploadingAdminProof ? 'not-allowed' : 'pointer', color: '#2563EB', fontSize: '12px', fontWeight: '600' }}>
                            {uploadingAdminProof ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                            <span>{uploadingAdminProof ? 'Uploading direct image...' : 'Upload Image Directly'}</span>
                            <input type="file" accept="image/png,image/jpeg,image/webp,image/jpg" disabled={uploadingAdminProof} onChange={handleAdminProofUpload} style={{ display: 'none' }} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                    <input
                      type="checkbox"
                      id="editVerified"
                      checked={Boolean(editForm.isVerified)}
                      onChange={e => setEditForm({...editForm, isVerified: e.target.checked})}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="editVerified" style={{ fontSize: '13.5px', fontWeight: '600', color: '#0F172A', cursor: 'pointer' }}>
                      Mark listing as Verified (shows green verified badge)
                    </label>
                  </div>
                </>
              ) : (
                /* Career Edit Fields */
                <>
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
                    <input type="email" placeholder="candidate@example.com" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }} />
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

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Driving License (Optional)</label>
                    <input type="text" placeholder="e.g. LMV / HMV / Two Wheeler / None" value={editForm.drivingLicense || ''} onChange={e => setEditForm({...editForm, drivingLicense: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>

                  {/* Skills editor */}
                  <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>Skills & Specialities</label>
                    {editForm.skills && editForm.skills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                        {editForm.skills.map(s => (
                          <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#2563EB', color: 'white', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '14px' }}>
                            <span>✓ {s}</span>
                            <button type="button" onClick={() => setEditForm(prev => ({ ...prev, skills: prev.skills.filter(x => x !== s) }))} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: 0, fontSize: '11px', display: 'flex', alignItems: 'center' }}>✕</button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="Add skill (e.g. Java, Tally, Forklift)"
                        value={customSkillInput}
                        onChange={e => setCustomSkillInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = customSkillInput.trim();
                            if (val && !editForm.skills?.includes(val)) {
                              setEditForm(prev => ({ ...prev, skills: [...(prev.skills || []), val] }));
                              setCustomSkillInput('');
                            }
                          }
                        }}
                        style={{ flex: 1, height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = customSkillInput.trim();
                          if (val && !editForm.skills?.includes(val)) {
                            setEditForm(prev => ({ ...prev, skills: [...(prev.skills || []), val] }));
                            setCustomSkillInput('');
                          }
                        }}
                        style={{ height: '36px', padding: '0 12px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Bio / Summary</label>
                    <textarea rows={3} placeholder="About candidate..." value={editForm.bio || ''} onChange={e => setEditForm({...editForm, bio: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                    <input
                      type="checkbox"
                      id="editAvailable"
                      checked={Boolean(editForm.isAvailableForHire)}
                      onChange={e => setEditForm({...editForm, isAvailableForHire: e.target.checked})}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="editAvailable" style={{ fontSize: '13.5px', fontWeight: '600', color: '#0F172A', cursor: 'pointer' }}>
                      Actively Available for Hire
                    </label>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13.5px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{ flex: 1, padding: '12px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {savingEdit ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div 
          onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}
        >
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px #E2E8F0' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Trash2 size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: '0 0 8px 0' }}>
              Delete Registration?
            </h3>
            <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              Are you sure you want to permanently delete{' '}
              <strong style={{ color: '#0F172A' }}>
                {deleteTarget.businessName || deleteTarget.fullName}
              </strong>
              ? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white', color: '#475569', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#EF4444', color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DirectoryRegistrations;
