import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
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
  Award,
  GraduationCap,
  Truck,
  Layers,
  Sparkles
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';

// Sector-specific skills dictionary for universal coverage
const SECTOR_SKILLS_MAP = {
  'IT & Software Development': [
    'Web Development', 'React / Node.js', 'Python', 'Java', 'SQL / Database',
    'UI / UX Design', 'QA & Software Testing', 'IT Desktop Support', 'Cloud / DevOps', 'Data Analysis'
  ],
  'Retail, Counter & Supermarket': [
    'Store Cashier', 'POS Billing System', 'Customer Service', 'Stock Replenishment',
    'Merchandising', 'Barcode Scanning', 'Store Supervisor', 'Counter Sales'
  ],
  'Accounting, Finance & Tally': [
    'Tally ERP / Prime', 'GST Filing & Compliance', 'MS Excel / Advanced Excel',
    'Bookkeeping', 'Invoicing & Billing', 'Payroll Processing', 'Accounts Payable', 'Audit Support'
  ],
  'Sales, Marketing & BD': [
    'Field Sales', 'B2B Sales', 'Lead Generation', 'Cold Calling / Telecalling',
    'Digital Marketing', 'Client Relationship', 'Product Demonstration', 'Negotiation'
  ],
  'Logistics, Transport & Drivers': [
    'Commercial Driver (HMV)', 'Light Vehicle Driver (LMV)', 'Delivery Executive',
    'Route Optimization', 'Two Wheeler Courier', 'Forklift Operator', 'Loading / Dispatch'
  ],
  'Warehouse & Inventory Helper': [
    'Warehouse Helper', 'Inventory Auditing', 'Loading & Unloading', 'Packing & Dispatch',
    'Store Keeper', 'Material Handling', 'Order Picking'
  ],
  'Healthcare, Nursing & Pharmacy': [
    'Pharmacy Dispensing', 'Registered Nurse', 'Lab Technician', 'Patient Care',
    'Medical Billing', 'Clinic Reception', 'First Aid & CPR'
  ],
  'Hospitality, Chef & Food Service': [
    'Chef / Cook', 'Kitchen Helper', 'Food Preparation', 'Waiter / Table Service',
    'Barista', 'Hotel Front Desk', 'Housekeeping & Sanitization'
  ],
  'Technical, Electrical & Maintenance': [
    'Licensed Electrician', 'Plumber', 'HVAC / AC Technician', 'CCTV & Security Systems',
    'Appliance Repair', 'Machine Maintenance', 'Wiring & Panel Work'
  ],
  'Office Administration & HR': [
    'Office Assistant', 'Data Entry Operator', 'Front Office Receptionist', 'HR Support',
    'Document Archiving', 'Email & Calendar Management', 'Security Staff'
  ],
  'Education, Teaching & Training': [
    'School Teacher', 'Subject Tutor (Maths / Science)', 'Spoken English Trainer',
    'Computer Instructor', 'Daycare / Nursery Staff', 'Curriculum Planning'
  ],
  'Manufacturing & Machine Operations': [
    'Machine Operator', 'CNC Machine Operator', 'Welder / Fabricator', 'Quality Inspector',
    'Assembly Line Worker', 'Industrial Safety'
  ],
  'Construction & Engineering Trades': [
    'Site Supervisor', 'Masonry & Concrete', 'Carpentry', 'Painting & Finishing',
    'Civil Draughtsman / AutoCAD', 'Scaffolding'
  ],
  'Creative, Design & Media': [
    'Graphic Design (Photoshop / Canva)', 'Video Editing (Premiere / CapCut)', 'Content Writing',
    'Social Media Management', 'Photography & Lighting'
  ],
  'Other / General Work': [
    'Customer Support', 'General Helper', 'Operations Executive', 'Facility Management', 'Team Lead'
  ]
};

const SECTORS = Object.keys(SECTOR_SKILLS_MAP);

const CareerSetup = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);

  // Form State
  const [fullName, setFullName] = useState('');
  const [selectedSector, setSelectedSector] = useState('Retail, Counter & Supermarket');
  const [jobTitle, setJobTitle] = useState('');
  const [skills, setSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [experience, setExperience] = useState('1 - 2 Years');
  const [qualification, setQualification] = useState("Bachelor's Degree (Any)");
  const [drivingLicense, setDrivingLicense] = useState('None / Not Required');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [city, setCity] = useState('');
  const [currentArea, setCurrentArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [availability, setAvailability] = useState('Immediate');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [isAvailableForHire, setIsAvailableForHire] = useState(true);

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
        const cp = data.careerProfile || {};
        setFullName(cp.fullName || data.fullName || '');
        setPhone(cp.contactPhone || data.phone || '');
        setWhatsapp(cp.whatsappNumber || data.phone || '');
        setEmail(cp.email || data.email || '');

        if (cp.jobCategory) {
          // If sector matches one of ours
          const matchSector = SECTORS.find(s => s.toLowerCase() === cp.jobCategory.toLowerCase());
          if (matchSector) {
            setSelectedSector(matchSector);
          } else {
            setJobTitle(cp.jobCategory);
          }
        }
        if (cp.skills?.length) setSkills(cp.skills);
        if (cp.experience) setExperience(cp.experience);
        if (cp.qualification) setQualification(cp.qualification);
        if (cp.drivingLicense) setDrivingLicense(cp.drivingLicense);
        if (cp.expectedSalary) setExpectedSalary(cp.expectedSalary);
        if (cp.city) setCity(cp.city);
        if (cp.currentArea) setCurrentArea(cp.currentArea);
        if (cp.pincode) setPincode(cp.pincode);
        if (cp.availability) setAvailability(cp.availability);
        if (cp.employmentType) setEmploymentType(cp.employmentType);
        if (cp.bio) setBio(cp.bio);
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error('Error loading career profile:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleSectorChange = (newSector) => {
    setSelectedSector(newSector);
  };

  const toggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCustomSkill('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!city.trim()) {
      setError('Please enter your current city.');
      return;
    }

    const resolvedJobTitle = jobTitle.trim() || selectedSector;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        fullName: fullName.trim(),
        jobCategory: resolvedJobTitle,
        skills,
        experience,
        qualification,
        drivingLicense,
        expectedSalary: expectedSalary.trim(),
        employmentType,
        city: city.trim(),
        currentArea: currentArea.trim(),
        pincode: pincode.trim(),
        availability,
        contactPhone: phone,
        whatsappNumber: sameAsPhone ? phone : (whatsapp.trim() || phone),
        email: email.trim(),
        bio: bio.trim(),
        isAvailableForHire
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/directory/my-career-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to save career profile.');
        setLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/career/profile', { replace: true });
    } catch (err) {
      console.error('Save career error:', err);
      setError('Server error saving career profile, please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontWeight: '600' }}>Loading your career registration setup...</p>
      </div>
    );
  }

  const currentSectorSkills = SECTOR_SKILLS_MAP[selectedSector] || [];

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
            <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: '700', marginLeft: '6px', textTransform: 'uppercase', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>Career Profile</span>
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
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#DCFCE7', color: '#16A34A', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', marginBottom: '10px' }}>
              <Briefcase size={14} /> Universal Career & Talent Profile
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
              Complete Your Career Registration
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
              Build your professional profile across any industry so local businesses and verified employers can hire you.
            </p>
          </div>

          {error && (
            <div style={{ color: '#EF4444', fontSize: '13.5px', marginBottom: '18px', textAlign: 'center', background: '#FEF2F2', padding: '12px', borderRadius: '10px', border: '1px solid #FECACA' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Section 1: Professional Sector & Role */}
            <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} color="#2563EB" /> Industry Sector & Desired Job Role
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Select Your Industry / Sector *
                  </label>
                  <select
                    value={selectedSector}
                    onChange={e => handleSectorChange(e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', background: 'white' }}
                  >
                    {SECTORS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Specific Job Role / Designation (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. ${selectedSector === 'IT & Software Development' ? 'Full Stack Developer' : (selectedSector === 'Accounting, Finance & Tally' ? 'Senior Accountant' : 'Store Supervisor')}`}
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Skills for chosen sector */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                  Skills & Tools
                </label>

                {/* Selected Skills list (shows all active skills with an 'X' to remove) */}
                {skills.length > 0 && (
                  <div style={{ marginBottom: '14px', background: 'white', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B', display: 'block', marginBottom: '8px' }}>
                      Selected Skills ({skills.length}):
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {skills.map(sk => (
                        <span
                          key={sk}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 12px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: '700',
                            background: '#16A34A',
                            color: 'white'
                          }}
                        >
                          <span>✓ {sk}</span>
                          <button
                            type="button"
                            onClick={() => toggleSkill(sk)}
                            title="Remove skill"
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

                {/* Popular Sector Suggestions */}
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '6px' }}>
                    Popular for {selectedSector}:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {currentSectorSkills.map(sk => {
                      const isSel = skills.includes(sk);
                      return (
                        <button
                          key={sk}
                          type="button"
                          onClick={() => toggleSkill(sk)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: '600',
                            border: isSel ? '1.5px solid #16A34A' : '1px solid #CBD5E1',
                            background: isSel ? '#DCFCE7' : 'white',
                            color: isSel ? '#166534' : '#475569',
                            cursor: 'pointer'
                          }}
                        >
                          {isSel ? '✓ ' : '+ '}{sk}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add Custom Skill Input */}
                <div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '6px' }}>
                    Or type any custom skill / tool:
                  </span>
                  <div style={{ display: 'flex', gap: '8px', maxWidth: '380px' }}>
                    <input
                      type="text"
                      placeholder="e.g. Photoshop, Forklift, Excel, React..."
                      value={customSkill}
                      onChange={e => setCustomSkill(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          addCustomSkill();
                        }
                      }}
                      style={{ flex: 1, height: '38px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        addCustomSkill();
                      }}
                      style={{
                        height: '38px',
                        padding: '0 16px',
                        background: '#16A34A',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Add Skill
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Experience, Education, License */}
            <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={16} color="#2563EB" /> Experience & Qualifications
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    Total Work Experience
                  </label>
                  <select
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: 'white' }}
                  >
                    <option value="Fresher (0 - 1 year)">Fresher (0 - 1 year)</option>
                    <option value="1 - 2 Years">1 - 2 Years</option>
                    <option value="3 - 5 Years">3 - 5 Years</option>
                    <option value="5 - 10 Years">5 - 10 Years</option>
                    <option value="10+ Years">10+ Years (Senior)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    Highest Education
                  </label>
                  <select
                    value={qualification}
                    onChange={e => setQualification(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: 'white' }}
                  >
                    <option value="10th / Secondary">10th / SSLC</option>
                    <option value="12th / Higher Secondary">12th / HSC</option>
                    <option value="ITI / Diploma">ITI / Polytechnic Diploma</option>
                    <option value="Bachelor's Degree (Any)">Graduate / Bachelor's (B.Com, B.Sc, B.A, etc.)</option>
                    <option value="Engineering (B.E / B.Tech)">Engineering (B.E / B.Tech / BCA)</option>
                    <option value="Master's Degree (MBA / M.Tech)">Postgraduate (MBA, MCA, M.Com, M.Tech)</option>
                    <option value="Other / Self-Taught">Other / Self-Taught Professional</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    Driving License (If Applicable)
                  </label>
                  <select
                    value={drivingLicense}
                    onChange={e => setDrivingLicense(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: 'white' }}
                  >
                    <option value="None / Not Required">None / Not Required</option>
                    <option value="Two Wheeler">Two Wheeler</option>
                    <option value="LMV (Car / Van)">LMV (Car / Van)</option>
                    <option value="HMV (Heavy Commercial)">HMV (Heavy Commercial Goods/Passenger)</option>
                    <option value="Forklift / Special Vehicle">Forklift / Special Equipment</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    Expected Salary (e.g. ₹20,000 / month)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹25,000 / month or Negotiable"
                    value={expectedSalary}
                    onChange={e => setExpectedSalary(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    Employment Preference
                  </label>
                  <select
                    value={employmentType}
                    onChange={e => setEmploymentType(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: 'white' }}
                  >
                    <option value="Full-time">Full-time Regular</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Remote / Work from Home">Remote / Work from Home</option>
                    <option value="Contract / Freelance">Contract / Freelance</option>
                    <option value="Shift Work">Rotational / Night Shifts</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Location & Availability */}
            <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} color="#2563EB" /> Location & Availability
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    Current City *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Madurai"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    required
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    Locality / Area
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Anna Nagar"
                    value={currentArea}
                    onChange={e => setCurrentArea(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    Notice Period / Availability
                  </label>
                  <select
                    value={availability}
                    onChange={e => setAvailability(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: 'white' }}
                  >
                    <option value="Immediate">Immediate Joiner</option>
                    <option value="Within 15 days">Within 15 Days</option>
                    <option value="1 Month">1 Month</option>
                    <option value="2 Months">2 Months</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Contact & Professional Summary */}
            <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={16} color="#16A34A" /> Direct Contact Channels
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    Phone Number for Interview Calls
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

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                  Professional Summary / Bio (Introduce yourself to employers)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Dedicated professional with 3+ years experience in retail store inventory & billing. Passionate about customer satisfaction and fast operations..."
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              {/* Availability for hire checkbox */}
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#16A34A" />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#166534' }}>
                    Set status as actively available for hire
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isAvailableForHire}
                  onChange={e => setIsAvailableForHire(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#16A34A', cursor: 'pointer' }}
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
                background: '#16A34A',
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
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)',
                marginTop: '6px'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Saving Career Profile...</span>
                </>
              ) : (
                <>
                  <span>Save & View Career Profile &rarr;</span>
                </>
              )}
            </button>

          </form>

        </div>

      </div>
    </div>
  );
};

export default CareerSetup;
