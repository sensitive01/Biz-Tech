import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, Users, Map, Calendar, ShieldCheck, Zap, BarChart3, 
  CheckCircle2, Building2, Menu, X, ArrowRight, Star, 
  Search, ChevronDown, ChevronUp, Sliders, Phone, Mail, MapPin, 
  Award, RefreshCw, FileText, Check
} from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeToggle from '@/components/ThemeToggle';

const Landing = ({ defaultView }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active view based on URL route or defaultView prop
  const getActiveViewFromPath = () => {
    const path = location.pathname.toLowerCase();
    if (path === '/about') return 'about';
    if (path === '/features') return 'features';
    if (path === '/solutions') return 'solutions';
    if (path === '/pricing') return 'pricing';
    if (path === '/faq') return 'faq';
    if (path === '/contact') return 'contact';
    if (defaultView) return defaultView;
    return 'home';
  };

  const activeView = getActiveViewFromPath();

  const navigateTo = (view) => {
    if (view === 'home') {
      navigate('/');
    } else {
      navigate(`/${view}`);
    }
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [pricingPlans, setPricingPlans] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [annualBilling, setAnnualBilling] = useState(false);

  // Home Interactive ROI Calculator State
  const [calcBranches, setCalcBranches] = useState(3);
  const [calcStaff, setCalcStaff] = useState(15);

  // FAQ Search & Filter State
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategory, setFaqCategory] = useState('all');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Features Category Filter
  const [featureCategory, setFeatureCategory] = useState('all');

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [submittedName, setSubmittedName] = useState('');

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      setSubmitError('Please fill in your name, email, and message.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setSubmittedName(contactForm.name);
      setShowSuccessPopup(true);
      setContactForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: 'General Inquiry',
        message: ''
      });
    } catch (err) {
      console.error('Contact form submission error:', err);
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pricing`);
        if (response.ok) {
          const data = await response.json();
          setPricingPlans(data);
        }
      } catch (error) {
        console.error('Failed to fetch pricing', error);
      }
    };
    fetchPricing();
  }, []);

  const getPrice = (typeTitle, defaultAmount) => {
    const plan = pricingPlans.find(p => p.customerType === typeTitle);
    const base = plan ? Number(plan.amount) : defaultAmount;
    const discount = (plan && typeof plan.annualDiscountPercent === 'number') ? plan.annualDiscountPercent : 0;
    if (annualBilling) {
      return discount > 0 ? Math.round(base * (1 - discount / 100)) : base;
    }
    return base;
  };

  // FAQ List
  const allFaqs = [
    {
      q: 'How does the 14-day free trial work?',
      a: 'You can sign up and use all features of your selected tier completely free for 14 days. No credit card is required to begin, and there are no automatic charges. When your trial ends, you simply choose whether to subscribe.',
      category: 'pricing'
    },
    {
      q: 'Can I upgrade, downgrade, or switch my business archetype later?',
      a: 'Yes, absolutely. BizTech is designed to scale with your business. You can add branches, upgrade to multi-branch management, or switch between archetypes at any time from your account settings without losing any operational data.',
      category: 'general'
    },
    {
      q: 'Does BizTech support physical barcode scanners and receipt printers?',
      a: 'Yes! The POS and inventory systems work seamlessly with handheld USB/Bluetooth barcode scanners, thermal receipt printers (58mm/80mm), and standard desktop A4 printers. You can also use your laptop/phone camera to scan barcodes directly.',
      category: 'features'
    },
    {
      q: 'How is our business data protected across multiple branches?',
      a: 'Every organization on BizTech operates within an isolated tenant structure with AES-256 encryption at rest and TLS 1.3 in transit. Automated cloud snapshots occur hourly, and role-based permissions ensure branch managers only see data authorized for their location.',
      category: 'security'
    },
    {
      q: 'What is the difference between Single Branch and Multi-Branch Enterprise plans?',
      a: 'The Single Branch plan provides comprehensive POS, inventory, staff scheduling, and attendance for a single location. The Multi-Branch Enterprise tier unlocks centralized multi-store visibility, inter-branch stock requisitions, and aggregated roll-up financial reports.',
      category: 'pricing'
    },
    {
      q: 'Can employees check in for shifts using GPS geofencing?',
      a: 'Yes! The employee attendance module includes optional geo-verified check-in/out to ensure staff are physically present at the designated store or office location before clocking in.',
      category: 'features'
    }
  ];

  const filteredFaqs = allFaqs.filter(faq => {
    const matchesCategory = faqCategory === 'all' || faq.category === faqCategory;
    const matchesSearch = faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
                          faq.a.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', overflowX: 'hidden' }}>

      {/* Global Modern Navbar */}
      <header className="landing-header" style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '72px',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)', zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => navigateTo('home')} 
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <img 
            src="/biztech_logo.png" 
            alt="BizTech Logo" 
            className="landing-brand-logo-light"
            style={{ height: '38px', width: 'auto', objectFit: 'contain' }} 
          />
          <img 
            src="/biztech_logo_dark.png" 
            alt="BizTech Logo" 
            className="landing-brand-logo-dark"
            style={{ height: '38px', width: 'auto', objectFit: 'contain' }} 
          />
        </div>

        {/* Desktop Navigation */}
        <div className="desktop-nav" style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          <button 
            onClick={() => navigateTo('home')} 
            style={{ 
              background: 'none', border: 'none', 
              color: activeView === 'home' ? '#2563EB' : 'var(--text-secondary)', 
              fontWeight: activeView === 'home' ? '700' : '500', 
              fontSize: '15px', cursor: 'pointer', padding: '6px 0',
              borderBottom: activeView === 'home' ? '2px solid #2563EB' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            Home
          </button>
          <button 
            onClick={() => navigateTo('features')} 
            style={{ 
              background: 'none', border: 'none', 
              color: activeView === 'features' ? '#2563EB' : 'var(--text-secondary)', 
              fontWeight: activeView === 'features' ? '700' : '500', 
              fontSize: '15px', cursor: 'pointer', padding: '6px 0',
              borderBottom: activeView === 'features' ? '2px solid #2563EB' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            Features
          </button>
          <button 
            onClick={() => navigateTo('solutions')} 
            style={{ 
              background: 'none', border: 'none', 
              color: activeView === 'solutions' ? '#2563EB' : 'var(--text-secondary)', 
              fontWeight: activeView === 'solutions' ? '700' : '500', 
              fontSize: '15px', cursor: 'pointer', padding: '6px 0',
              borderBottom: activeView === 'solutions' ? '2px solid #2563EB' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            Solutions
          </button>
          <button 
            onClick={() => navigateTo('pricing')} 
            style={{ 
              background: 'none', border: 'none', 
              color: activeView === 'pricing' ? '#2563EB' : 'var(--text-secondary)', 
              fontWeight: activeView === 'pricing' ? '700' : '500', 
              fontSize: '15px', cursor: 'pointer', padding: '6px 0',
              borderBottom: activeView === 'pricing' ? '2px solid #2563EB' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            Pricing
          </button>
          <button 
            onClick={() => navigateTo('about')} 
            style={{ 
              background: 'none', border: 'none', 
              color: activeView === 'about' ? '#2563EB' : 'var(--text-secondary)', 
              fontWeight: activeView === 'about' ? '700' : '500', 
              fontSize: '15px', cursor: 'pointer', padding: '6px 0',
              borderBottom: activeView === 'about' ? '2px solid #2563EB' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            About Us
          </button>
          <button 
            onClick={() => navigateTo('faq')} 
            style={{ 
              background: 'none', border: 'none', 
              color: activeView === 'faq' ? '#2563EB' : 'var(--text-secondary)', 
              fontWeight: activeView === 'faq' ? '700' : '500', 
              fontSize: '15px', cursor: 'pointer', padding: '6px 0',
              borderBottom: activeView === 'faq' ? '2px solid #2563EB' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            FAQ
          </button>
          <button 
            onClick={() => navigateTo('contact')} 
            style={{ 
              background: 'none', border: 'none', 
              color: activeView === 'contact' ? '#2563EB' : 'var(--text-secondary)', 
              fontWeight: activeView === 'contact' ? '700' : '500', 
              fontSize: '15px', cursor: 'pointer', padding: '6px 0',
              borderBottom: activeView === 'contact' ? '2px solid #2563EB' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            Contact
          </button>
        </div>

        {/* Right Actions */}
        <div className="desktop-nav" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ThemeToggle />
          <LanguageSelector />
          <button 
            onClick={() => navigate('/login')} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-title)', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/register')} 
            style={{ 
              background: '#2563EB', color: 'white', border: 'none', padding: '10px 22px', 
              borderRadius: '10px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', 
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)', transition: 'background 0.2s' 
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#1D4ED8'} 
            onMouseOut={(e) => e.currentTarget.style.background = '#2563EB'}
          >
            Register
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-menu" style={{ zIndex: 999 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button onClick={() => navigateTo('home')} style={{ textAlign: 'left', background: 'none', border: 'none', color: activeView === 'home' ? '#2563EB' : 'var(--text-title)', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>Home</button>
            <button onClick={() => navigateTo('features')} style={{ textAlign: 'left', background: 'none', border: 'none', color: activeView === 'features' ? '#2563EB' : 'var(--text-title)', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>Features</button>
            <button onClick={() => navigateTo('solutions')} style={{ textAlign: 'left', background: 'none', border: 'none', color: activeView === 'solutions' ? '#2563EB' : 'var(--text-title)', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>Solutions</button>
            <button onClick={() => navigateTo('pricing')} style={{ textAlign: 'left', background: 'none', border: 'none', color: activeView === 'pricing' ? '#2563EB' : 'var(--text-title)', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>Pricing</button>
            <button onClick={() => navigateTo('about')} style={{ textAlign: 'left', background: 'none', border: 'none', color: activeView === 'about' ? '#2563EB' : 'var(--text-title)', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>About Us</button>
            <button onClick={() => navigateTo('faq')} style={{ textAlign: 'left', background: 'none', border: 'none', color: activeView === 'faq' ? '#2563EB' : 'var(--text-title)', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>FAQ</button>
            <button onClick={() => navigateTo('contact')} style={{ textAlign: 'left', background: 'none', border: 'none', color: activeView === 'contact' ? '#2563EB' : 'var(--text-title)', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>Contact</button>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color, #E2E8F0)', margin: '12px 0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Appearance:</span>
              <ThemeToggle showLabel={true} />
            </div>
            <LanguageSelector />
            <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} style={{ textAlign: 'left', background: 'transparent', border: 'none', color: 'var(--text-title)', fontWeight: '600', fontSize: '15px', cursor: 'pointer', padding: 0 }}>
              Sign In
            </button>
            <button onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }} style={{ width: '100%', background: '#2563EB', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', textAlign: 'center' }}>
              Register
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DEDICATED VIEW: FEATURES                                               */}
      {/* ========================================================================= */}
      {activeView === 'features' && (
        <main style={{ paddingTop: '110px', paddingBottom: '90px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            

            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EFF6FF', color: '#2563EB', padding: '6px 16px', borderRadius: '20px', fontWeight: '600', fontSize: '13px', marginBottom: '16px' }}>
                <Zap size={14} /> Full Operational Capabilities
              </div>
              <h1 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-title)', letterSpacing: '-1px', marginBottom: '16px' }}>
                Engineered for Modern Enterprise Operations
              </h1>
              <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '750px', margin: '0 auto', lineHeight: '1.6' }}>
                Every tool required to accelerate sales, balance multi-location inventory, synchronize staffing, and protect margins — natively integrated into a single high-performance engine.
              </p>
            </div>

            {/* Feature Modules Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px', marginBottom: '64px' }}>
              
              {/* Module 1: POS & Barcode */}
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '36px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>
                  <Zap size={26} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '12px' }}>
                  Smart Billing & Barcode POS
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>
                  Sub-second item lookups with handheld USB/Bluetooth hardware scanners or on-screen rapid entry. Generate compliant GST invoices, proforma bills, and bulk quotes effortlessly.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-title)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Thermal 58/80mm & A4 printer support</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Split tenders, discounts & credit customer tabs</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Instant quotation-to-invoice conversion</div>
                </div>
              </div>

              {/* Module 2: Inventory */}
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '36px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>
                  <LayoutGrid size={26} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '12px' }}>
                  Multi-Warehouse & Stock Control
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>
                  Never run out of high-demand items again. Real-time batch-level tracking, automated minimum stock alerts, and multi-location reorder workflows keep your shelves filled.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-title)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Real-time stock sync at every sale</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Automated low-stock reorder thresholds</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Bulk CSV product import & barcode generator</div>
                </div>
              </div>

              {/* Module 3: HR & Attendance */}
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '36px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>
                  <Users size={26} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '12px' }}>
                  Staffing, Shifts & Geo-Attendance
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>
                  Eliminate time theft and messy shift spreadsheets. Manage employee profiles, assign shift schedules, and approve leave requests with one click.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-title)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Geofenced & shift-timed check-in / check-out</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Automated leave allowances and tracking</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Granular role permissions (Cashier, Manager, Admin)</div>
                </div>
              </div>

              {/* Module 4: Multi-Branch */}
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '36px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>
                  <Map size={26} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '12px' }}>
                  Multi-Branch Orchestration
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>
                  Whether operating 2 branches or 50 regional distribution hubs, govern all storefronts through a unified executive view with inter-branch stock transfers.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-title)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Inter-branch transfer requisitions & dispatch</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Branch-wise P&L and sales leaderboards</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Centralized catalog with local pricing overrides</div>
                </div>
              </div>

              {/* Module 5: Analytics */}
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '36px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#EFF6FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>
                  <BarChart3 size={26} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '12px' }}>
                  Real-Time Executive Analytics
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>
                  Turn raw register transactions into clear strategic foresight. Track net margins, customer retention, fast vs slow moving SKUs, and seasonal peaks.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-title)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Daily gross revenue, expenses, and net profit</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Dead stock and aging inventory indicators</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> One-click audit exports in Excel / PDF</div>
                </div>
              </div>

              {/* Module 6: Security */}
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '36px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>
                  <ShieldCheck size={26} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '12px' }}>
                  Multi-Tenant Security & Isolation
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>
                  Bank-level security standards protecting proprietary financial transactions, customer addresses, and supplier purchase contracts.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-title)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> AES-256 encryption at rest, TLS 1.3 in transit</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Hourly automated cloud snapshots & disaster failover</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Complete tamper-evident audit logs</div>
                </div>
              </div>

            </div>

            {/* Bottom Register Prompt */}
            <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)', borderRadius: '24px', padding: '48px 36px', color: 'white', textAlign: 'center', boxShadow: '0 20px 40px -10px rgba(37,99,235,0.4)' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px' }}>Ready to experience these features live?</h2>
              <p style={{ fontSize: '17px', opacity: 0.9, maxWidth: '600px', margin: '0 auto 28px auto' }}>Start your 14-day free trial now. Full access to all modules, no credit card required.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/register')} style={{ background: 'white', color: '#1E3A8A', border: 'none', padding: '14px 32px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
                  Get Started Free
                </button>
                <button onClick={() => navigateTo('pricing')} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '14px 28px', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>
                  View Pricing Plans
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 2. DEDICATED VIEW: SOLUTIONS (ARCHETYPES)                                 */}
      {/* ========================================================================= */}
      {activeView === 'solutions' && (
        <main style={{ paddingTop: '110px', paddingBottom: '90px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            

            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EFF6FF', color: '#2563EB', padding: '6px 16px', borderRadius: '20px', fontWeight: '600', fontSize: '13px', marginBottom: '16px' }}>
                <Building2 size={14} /> Adaptive Architecture
              </div>
              <h1 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-title)', letterSpacing: '-1px', marginBottom: '16px' }}>
                Tailored for Your Exact Business Scale
              </h1>
              <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '750px', margin: '0 auto', lineHeight: '1.6' }}>
                Unlike rigid ERP software, BizTech adapts its navigation, modules, and workflows to your exact operating model through our 4 proven business archetypes.
              </p>
            </div>

            {/* Archetypes List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '960px', margin: '0 auto 64px auto' }}>

              {/* Archetype 1 */}
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '36px', display: 'flex', gap: '28px', alignItems: 'flex-start', boxShadow: '0 4px 15px -2px rgba(0,0,0,0.03)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#F1F5F9', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', flexShrink: 0 }}>
                  1
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-title)' }}>Sole Operator</h3>
                    <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Solo Founders & Freelancers</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '18px' }}>
                    Built specifically for one-person shops, consultants, and independent retailers. We hide multi-staff scheduling, branch management, and complex enterprise hierarchies so you get a fast, uncluttered dashboard focused strictly on inventory, billing, and direct sales.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '14px', color: 'var(--text-title)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#2563EB" /> Fast 1-click invoice billing</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#2563EB" /> Basic item & service catalog</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#2563EB" /> Customer ledger & payment history</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#2563EB" /> Zero bloated menu options</div>
                  </div>
                </div>
              </div>

              {/* Archetype 2 */}
              <div style={{ background: 'var(--card-bg)', border: '2px solid #2563EB', borderRadius: '20px', padding: '36px', display: 'flex', gap: '28px', alignItems: 'flex-start', boxShadow: '0 10px 25px -5px rgba(37,99,235,0.1)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', flexShrink: 0 }}>
                  2
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-title)' }}>Single Branch + Staff</h3>
                    <span style={{ background: '#DBEAFE', color: '#1D4ED8', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>Most Popular</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '18px' }}>
                    Designed for established single-location stores, clinics, salons, and offices with staff. Activates full workforce management: staff rosters, shift scheduling, geofenced clock-in, cashier POS accounts, and manager expense oversight.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '14px', color: 'var(--text-title)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#2563EB" /> Up to 20 staff accounts & PINs</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#2563EB" /> Shift attendance & leave approvals</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#2563EB" /> Barcode scanner checkout mode</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#2563EB" /> Daily cashier register end-of-day balances</div>
                  </div>
                </div>
              </div>

              {/* Archetype 3 */}
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '36px', display: 'flex', gap: '28px', alignItems: 'flex-start', boxShadow: '0 4px 15px -2px rgba(0,0,0,0.03)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', flexShrink: 0 }}>
                  3
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-title)' }}>Multi-Branch Enterprise</h3>
                    <span style={{ background: '#EDE9FE', color: '#6D28D9', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Chains & Franchises</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '18px' }}>
                    Engineered for growing regional brands and retail chains operating multiple outlets or warehouses. Enables central catalog deployment, inter-branch inventory requisitions, cross-store stock visibility, and branch manager KPI comparisons.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '14px', color: 'var(--text-title)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#7C3AED" /> Unlimited branch locations</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#7C3AED" /> Inter-branch transfer slips & transit tracking</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#7C3AED" /> Branch revenue & margin comparison</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#7C3AED" /> Granular regional supervisor access</div>
                  </div>
                </div>
              </div>

              {/* Archetype 4 */}
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '36px', display: 'flex', gap: '28px', alignItems: 'flex-start', boxShadow: '0 4px 15px -2px rgba(0,0,0,0.03)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#ECFEFF', color: '#0891B2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', flexShrink: 0 }}>
                  4
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-title)' }}>Multi-Business Conglomerate</h3>
                    <span style={{ background: '#CFFAFE', color: '#0E7490', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Holding Companies</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '18px' }}>
                    For enterprise operators running multiple distinct business entities (e.g. a retail store, a manufacturing unit, and a hospitality business) under one corporate umbrella. Maintains strict financial isolation while giving executives consolidated group-level financial visibility.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '14px', color: 'var(--text-title)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#0891B2" /> Multiple independent businesses & brands</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#0891B2" /> Total brand data & tax isolation</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#0891B2" /> Consolidated corporate holding reports</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#0891B2" /> Executive single sign-on across businesses</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Selection Guidance CTA */}
            <div style={{ textAlign: 'center', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '10px' }}>Unsure which archetype matches your setup?</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px' }}>
                You can select an initial archetype during signup and easily change or upgrade it later from your dashboard without losing any records.
              </p>
              <button onClick={() => navigate('/register')} style={{ background: '#2563EB', color: 'white', border: 'none', padding: '14px 32px', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>
                Choose Your Archetype & Register
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 3. DEDICATED VIEW: PRICING                                                 */}
      {/* ========================================================================= */}
      {activeView === 'pricing' && (
        <main style={{ paddingTop: '110px', paddingBottom: '90px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            

            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EFF6FF', color: '#2563EB', padding: '6px 16px', borderRadius: '20px', fontWeight: '600', fontSize: '13px', marginBottom: '16px' }}>
                <CheckCircle2 size={14} /> Clear & Predictable Pricing
              </div>
              <h1 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-title)', letterSpacing: '-1px', marginBottom: '16px' }}>
                Straightforward Plans for Growing Businesses
              </h1>
              <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 28px auto', lineHeight: '1.6' }}>
                Every plan includes a 14-day free trial. No hidden activation charges or hardware lock-ins.
              </p>

              {/* Monthly vs Annual Toggle */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'var(--card-bg)', padding: '6px 8px', borderRadius: '30px', border: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => setAnnualBilling(false)}
                  style={{
                    border: 'none',
                    background: !annualBilling ? '#2563EB' : 'transparent',
                    color: !annualBilling ? 'white' : 'var(--text-secondary)',
                    padding: '8px 18px',
                    borderRadius: '20px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setAnnualBilling(true)}
                  style={{
                    border: 'none',
                    background: annualBilling ? '#2563EB' : 'transparent',
                    color: annualBilling ? 'white' : 'var(--text-secondary)',
                    padding: '8px 18px',
                    borderRadius: '20px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Annual Billing
                  {(() => {
                    const maxDiscount = Math.max(0, ...pricingPlans.map(p => Number(p.annualDiscountPercent || 0)));
                    return maxDiscount > 0 ? (
                      <span style={{ background: '#10B981', color: 'white', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>Save up to {maxDiscount}%</span>
                    ) : null;
                  })()}
                </button>
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '28px', marginBottom: '64px', alignItems: 'stretch' }}>
              
              {/* Plan 1 */}
              <div style={{ background: 'var(--card-bg)', padding: '36px 28px', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '6px' }}>Sole Operator</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>For one-person stores and solo practitioners.</p>
                <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-title)', letterSpacing: '-1.5px' }}>
                    ₹{getPrice('Type 1: Sole Operator', 19)}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>/mo</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}><CheckCircle2 size={16} color="#2563EB" /> 1 User Account</li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}><CheckCircle2 size={16} color="#2563EB" /> Unlimited POS Billing & Invoices</li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}><CheckCircle2 size={16} color="#2563EB" /> Inventory & Stock Tracking</li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}><CheckCircle2 size={16} color="#2563EB" /> Standard Email Support</li>
                </ul>
                <button onClick={() => navigate('/register')} style={{ width: '100%', background: '#EFF6FF', color: '#2563EB', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                  Start 14-Day Free Trial
                </button>
              </div>

              {/* Plan 2: Featured */}
              <div style={{ background: '#0F172A', padding: '36px 28px', borderRadius: '20px', border: '2px solid #2563EB', display: 'flex', flexDirection: 'column', position: 'relative', transform: 'scale(1.02)', boxShadow: '0 20px 30px -10px rgba(0,0,0,0.15)' }}>
                <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: '#2563EB', color: 'white', padding: '3px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>
                  MOST POPULAR
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '6px' }}>Single Branch + Staff</h3>
                <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '20px' }}>For single storefronts managing an in-person team.</p>
                <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '42px', fontWeight: '800', color: 'white', letterSpacing: '-1.5px' }}>
                    ₹{getPrice('Type 2: Single Branch + Staff', 49)}
                  </span>
                  <span style={{ color: '#94A3B8', fontWeight: '500' }}>/mo</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#F8FAFC', fontSize: '14px' }}><CheckCircle2 size={16} color="#3B82F6" /> Up to 20 Staff Accounts</li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#F8FAFC', fontSize: '14px' }}><CheckCircle2 size={16} color="#3B82F6" /> Shift Rosters & Geo-Attendance</li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#F8FAFC', fontSize: '14px' }}><CheckCircle2 size={16} color="#3B82F6" /> Cashier Barcode Scanner Mode</li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#F8FAFC', fontSize: '14px' }}><CheckCircle2 size={16} color="#3B82F6" /> Priority Phone & Chat Support</li>
                </ul>
                <button onClick={() => navigate('/register')} style={{ width: '100%', background: '#2563EB', color: 'white', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                  Start 14-Day Free Trial
                </button>
              </div>

              {/* Plan 3 */}
              <div style={{ background: 'var(--card-bg)', padding: '36px 28px', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '6px' }}>Multi-Branch Enterprise</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>For multi-store chains and distribution networks.</p>
                <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-title)', letterSpacing: '-1.5px' }}>
                    ₹{getPrice('Type 3: Multi-Branch Enterprise', 199)}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>/mo</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}><CheckCircle2 size={16} color="#2563EB" /> Unlimited Branches & Users</li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}><CheckCircle2 size={16} color="#2563EB" /> Inter-Branch Stock Transfers</li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}><CheckCircle2 size={16} color="#2563EB" /> Cross-Branch P&L Analytics</li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}><CheckCircle2 size={16} color="#2563EB" /> Dedicated Account Manager</li>
                </ul>
                <button onClick={() => navigate('/register')} style={{ width: '100%', background: '#EFF6FF', color: '#2563EB', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                  Start 14-Day Free Trial
                </button>
              </div>

              {/* Plan 4 */}
              <div style={{ background: 'var(--card-bg)', padding: '36px 28px', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '6px' }}>Conglomerate</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>For operators managing multiple separate business entities.</p>
                <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-title)', letterSpacing: '-1.5px' }}>
                    ₹{getPrice('Type 4: Multi-Business Conglomerate', 399)}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>/mo</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}><CheckCircle2 size={16} color="#2563EB" /> Unlimited Businesses & Brands</li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}><CheckCircle2 size={16} color="#2563EB" /> Brand Data Isolation</li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}><CheckCircle2 size={16} color="#2563EB" /> Group Consolidated Reporting</li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}><CheckCircle2 size={16} color="#2563EB" /> Custom API & ERP Integrations</li>
                </ul>
                <button onClick={() => navigate('/register')} style={{ width: '100%', background: '#EFF6FF', color: '#2563EB', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                  Start 14-Day Free Trial
                </button>
              </div>

            </div>

            {/* Need Custom Solution banner */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '6px' }}>Need a custom setup for 50+ locations?</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Our enterprise solutions architects can provide bespoke volume pricing and custom ERP bridges.</p>
              </div>
              <button onClick={() => navigateTo('contact')} style={{ background: '#2563EB', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                Contact Enterprise Sales
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 4. DEDICATED VIEW: ABOUT US                                               */}
      {/* ========================================================================= */}
      {activeView === 'about' && (
        <main style={{ paddingTop: '110px', paddingBottom: '90px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            

            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#DBEAFE', color: '#1D4ED8', padding: '6px 16px', borderRadius: '20px', fontWeight: '600', fontSize: '13px', marginBottom: '16px' }}>
                <Building2 size={14} /> Our Mission & Story
              </div>
              <h1 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-title)', letterSpacing: '-1px', marginBottom: '16px' }}>
                Building the Operating System for Modern Commerce
              </h1>
              <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '780px', margin: '0 auto', lineHeight: '1.7' }}>
                BizTech was founded to solve a fundamental frustration faced by every business owner: having your sales, inventory, employees, and branches trapped across fragmented apps, paper sheets, and messy spreadsheets.
              </p>
            </div>

            {/* Impact Numbers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '64px' }}>
              <div style={{ background: 'var(--card-bg)', padding: '32px 24px', borderRadius: '18px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '44px', fontWeight: '800', color: '#2563EB', marginBottom: '8px', letterSpacing: '-1px' }}>10k+</div>
                <div style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '600' }}>Active Storefronts & Teams</div>
              </div>
              <div style={{ background: 'var(--card-bg)', padding: '32px 24px', borderRadius: '18px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '44px', fontWeight: '800', color: '#2563EB', marginBottom: '8px', letterSpacing: '-1px' }}>50M+</div>
                <div style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '600' }}>Invoices & Transactions Processed</div>
              </div>
              <div style={{ background: 'var(--card-bg)', padding: '32px 24px', borderRadius: '18px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '44px', fontWeight: '800', color: '#2563EB', marginBottom: '8px', letterSpacing: '-1px' }}>99.99%</div>
                <div style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '600' }}>Cloud Service Availability</div>
              </div>
              <div style={{ background: 'var(--card-bg)', padding: '32px 24px', borderRadius: '18px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '44px', fontWeight: '800', color: '#2563EB', marginBottom: '8px', letterSpacing: '-1px' }}>4.9 / 5</div>
                <div style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '600' }}>Average Merchant Rating</div>
              </div>
            </div>

            {/* Core Values */}
            <div style={{ marginBottom: '64px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-title)', textAlign: 'center', marginBottom: '36px' }}>
                The Principles Driving Every Feature We Build
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '32px', borderRadius: '18px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                    <Zap size={22} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '10px' }}>Zero-Latency Performance</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                    In a bustling checkout counter, every millisecond counts. We engineer every view for rapid barcode scanning and instant ledger sync without lagging.
                  </p>
                </div>

                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '32px', borderRadius: '18px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                    <LayoutGrid size={22} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '10px' }}>Adaptive Simplicity</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                    We refuse bloated, overwhelming legacy software. Small shops only see what they need, while large retail conglomerates get deep enterprise control on demand.
                  </p>
                </div>

                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '32px', borderRadius: '18px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                    <ShieldCheck size={22} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '10px' }}>Absolute Data Sovereignty</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                    Your sales, customer records, and supplier pricing belong exclusively to you. Strict multi-tenant boundaries ensure 100% privacy and confidentiality.
                  </p>
                </div>
              </div>
            </div>

            {/* Team / Mission CTA */}
            <div style={{ textAlign: 'center', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '48px 32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-title)', marginBottom: '12px' }}>Have questions about our roadmap?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto 28px auto' }}>We partner closely with business leaders and merchants. Speak directly with our product leadership team.</p>
              <button onClick={() => navigateTo('contact')} style={{ background: '#2563EB', color: 'white', border: 'none', padding: '14px 32px', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>
                Connect With Our Team
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 5. DEDICATED VIEW: FAQ                                                    */}
      {/* ========================================================================= */}
      {activeView === 'faq' && (
        <main style={{ paddingTop: '110px', paddingBottom: '90px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
            

            <div style={{ textAlign: 'center', marginBottom: '44px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EFF6FF', color: '#2563EB', padding: '6px 16px', borderRadius: '20px', fontWeight: '600', fontSize: '13px', marginBottom: '16px' }}>
                <CheckCircle2 size={14} /> Help & Knowledge Center
              </div>
              <h1 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-title)', letterSpacing: '-1px', marginBottom: '16px' }}>
                Frequently Asked Questions
              </h1>
              <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                Clear answers regarding subscription tiers, hardware compatibility, attendance verification, and multi-branch rollouts.
              </p>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: '28px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search questions (e.g. barcode, free trial, multi-branch, security)..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--card-bg)',
                  color: 'var(--text-title)',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Questions' },
                { id: 'pricing', label: 'Billing & Plans' },
                { id: 'features', label: 'Features & Scanners' },
                { id: 'general', label: 'Archetypes & Setup' },
                { id: 'security', label: 'Security & Privacy' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFaqCategory(cat.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)',
                    background: faqCategory === cat.id ? '#2563EB' : 'var(--card-bg)',
                    color: faqCategory === cat.id ? 'white' : 'var(--text-secondary)',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Accordion Questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '56px' }}>
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        background: 'var(--card-bg)', 
                        border: isOpen ? '1px solid #2563EB' : '1px solid var(--border-color)', 
                        borderRadius: '16px', 
                        overflow: 'hidden',
                        transition: 'all 0.2s'
                      }}
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '20px 24px',
                          background: 'none',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-title)' }}>
                          {faq.q}
                        </span>
                        {isOpen ? <ChevronUp size={20} color="#2563EB" /> : <ChevronDown size={20} color="var(--text-secondary)" />}
                      </button>
                      {isOpen && (
                        <div style={{ padding: '0 24px 22px 24px', color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', borderTop: '1px solid var(--border-color)' }}>
                          <p style={{ marginTop: '14px', marginBottom: 0 }}>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  No questions match your search query. Feel free to contact our support team.
                </div>
              )}
            </div>

            {/* Still have questions prompt */}
            <div style={{ background: '#EFF6FF', borderRadius: '20px', padding: '32px', textAlign: 'center', border: '1px solid #BFDBFE' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1E3A8A', marginBottom: '8px' }}>Didn't find what you were looking for?</h3>
              <p style={{ color: '#3B82F6', fontSize: '15px', marginBottom: '20px' }}>Our technical specialists are always available to help you navigate custom requirements.</p>
              <button onClick={() => navigateTo('contact')} style={{ background: '#2563EB', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                Contact Support Team
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 6. DEDICATED VIEW: CONTACT                                                */}
      {/* ========================================================================= */}
      {activeView === 'contact' && (
        <main style={{ paddingTop: '110px', paddingBottom: '90px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'start' }}>
              {/* Left Info Column */}
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EFF6FF', color: '#2563EB', padding: '6px 16px', borderRadius: '20px', fontWeight: '600', fontSize: '13px', marginBottom: '16px' }}>
                  <Phone size={14} /> Direct Assistance
                </div>
                <h1 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-title)', letterSpacing: '-1px', marginBottom: '16px' }}>
                  Get in Touch With Our Solutions Team
                </h1>
                <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '36px' }}>
                  Have an enterprise inquiry, need assistance migrating from legacy software, or looking for a custom demo? Send us a message and a product architect will connect with you.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
                      <Phone size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>Direct Phone</div>
                      <div style={{ fontSize: '16px', color: 'var(--text-title)', fontWeight: '700' }}>+1 (800) 123-4567</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
                      <Mail size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>Support & Sales Email</div>
                      <div style={{ fontSize: '16px', color: 'var(--text-title)', fontWeight: '700' }}>support@biztech.com</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
                      <MapPin size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>Global Headquarters</div>
                      <div style={{ fontSize: '16px', color: 'var(--text-title)', fontWeight: '700' }}>123 Innovation Drive, Tech City</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '36px', padding: '16px 20px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px', color: '#15803D' }}>
                  <ShieldCheck size={20} />
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>Guaranteed response within 24 business hours.</span>
                </div>
              </div>

              {/* Right Form Card */}
              <div style={{ background: 'var(--card-bg)', padding: '36px', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.06)', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '6px' }}>Send a Message</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Fill out the details below and we will route your inquiry to the right specialist.</p>

                {submitError && (
                  <div style={{ padding: '10px 14px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#DC2626', borderRadius: '10px', fontSize: '13px', fontWeight: '500', marginBottom: '16px' }}>
                    {submitError}
                  </div>
                )}

                <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Full Name <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="Enter your name" 
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #E2E8F0)', background: 'var(--bg-color, white)', color: 'var(--text-title)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Work Email <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input 
                        type="email" 
                        required
                        placeholder="name@company.com" 
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #E2E8F0)', background: 'var(--bg-color, white)', color: 'var(--text-title)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Phone Number
                      </label>
                      <input 
                        type="tel" 
                        placeholder="+1 (555) 000-0000" 
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #E2E8F0)', background: 'var(--bg-color, white)', color: 'var(--text-title)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Company / Business Name
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. Acme Corp / Retail Store" 
                        value={contactForm.company}
                        onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #E2E8F0)', background: 'var(--bg-color, white)', color: 'var(--text-title)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} 
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Topic / Purpose of Inquiry
                    </label>
                    <select 
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #E2E8F0)', background: 'var(--bg-color, white)', color: 'var(--text-title)', outline: 'none', fontSize: '14px', boxSizing: 'border-box', cursor: 'pointer' }}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Product Demo & Consultation">Product Demo & Consultation</option>
                      <option value="Multi-Branch & Enterprise Solution">Multi-Branch & Enterprise Solution</option>
                      <option value="Custom Pricing & Subscription">Custom Pricing & Subscription</option>
                      <option value="Billing & Invoicing Features">Billing & Invoicing Features</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Partnership">Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Message <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <textarea 
                      rows="4" 
                      required
                      placeholder="How can we help you? Tell us about your business requirements..." 
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #E2E8F0)', background: 'var(--bg-color, white)', color: 'var(--text-title)', outline: 'none', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }} 
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{ width: '100%', background: '#2563EB', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isSubmitting ? 0.75 : 1, transition: 'all 0.2s' }}
                  >
                    {isSubmitting ? 'Sending Message...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 7. DEFAULT VIEW: HOME (COMPLETELY FRESH SCROLLING LANDING DATA)            */}
      {/* ========================================================================= */}
      {activeView === 'home' && (
        <main>
          {/* Section 1: Hero */}
          <section style={{ paddingTop: '160px', paddingBottom: '90px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
            {/* Background Glows */}
            <div style={{ position: 'absolute', top: '0%', left: '15%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', top: '25%', right: '15%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }}></div>

            <div style={{ zIndex: 1, maxWidth: '1200px', width: '100%', padding: '0 24px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EFF6FF', color: '#2563EB', padding: '6px 18px', borderRadius: '24px', fontWeight: '700', fontSize: '13px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(37,99,235,0.08)' }}>
                <Zap size={14} /> BizTech 2.0 • The Modern Enterprise Operating System
              </div>

              <h1 className="hero-title" style={{ maxWidth: '960px', margin: '0 auto 24px auto' }}>
                Scale Your Organization With <br /> 
                <span style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Absolute Precision
                </span>.
              </h1>

              <p className="hero-subtitle" style={{ maxWidth: '780px', margin: '0 auto 36px auto' }}>
                Run high-speed barcode billing, multi-warehouse inventory, staff geo-attendance, and multi-branch rollups from one lightning-fast command center.
              </p>

              <div className="hero-buttons">
                <button 
                  onClick={() => navigate('/register')} 
                  style={{ background: '#2563EB', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(37,99,235,0.4)', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }} 
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} 
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Start 14-Day Free Trial <ArrowRight size={18} />
                </button>
                <button 
                  onClick={() => navigateTo('features')} 
                  style={{ background: 'var(--card-bg)', color: 'var(--text-title)', border: '1px solid var(--border-color)', padding: '16px 36px', borderRadius: '12px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'background 0.2s' }} 
                  onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} 
                  onMouseOut={(e) => e.currentTarget.style.background = 'var(--card-bg)'}
                >
                  Explore Platform Modules
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '28px', marginTop: '40px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#10B981" /> No credit card required</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#10B981" /> Setup in under 2 minutes</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#10B981" /> Cancel anytime with 1 click</div>
              </div>
            </div>
          </section>

          {/* Section 3: Live Proof & Performance Metrics Banner */}
          <section style={{ background: '#0F172A', color: 'white', padding: '64px 24px', borderTop: '1px solid #1E293B', borderBottom: '1px solid #1E293B' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '46px', fontWeight: '800', color: '#38BDF8', letterSpacing: '-1px' }}>₹250Cr+</div>
                <div style={{ fontSize: '15px', color: '#94A3B8', marginTop: '6px', fontWeight: '500' }}>Transactions Processed Annually</div>
              </div>
              <div>
                <div style={{ fontSize: '46px', fontWeight: '800', color: '#38BDF8', letterSpacing: '-1px' }}>12,500+</div>
                <div style={{ fontSize: '15px', color: '#94A3B8', marginTop: '6px', fontWeight: '500' }}>Active Retail & Warehouse Outlets</div>
              </div>
              <div>
                <div style={{ fontSize: '46px', fontWeight: '800', color: '#38BDF8', letterSpacing: '-1px' }}>99.99%</div>
                <div style={{ fontSize: '15px', color: '#94A3B8', marginTop: '6px', fontWeight: '500' }}>Guaranteed System SLA Uptime</div>
              </div>
              <div>
                <div style={{ fontSize: '46px', fontWeight: '800', color: '#38BDF8', letterSpacing: '-1px' }}>&lt; 25ms</div>
                <div style={{ fontSize: '15px', color: '#94A3B8', marginTop: '6px', fontWeight: '500' }}>Real-Time Cloud Sync Latency</div>
              </div>
            </div>
          </section>

          {/* Section 4: The Unified Advantage - Old Way vs BizTech */}
          <section className="section-padding landing-section-alt">
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                <h2 style={{ fontSize: '38px', fontWeight: '800', color: 'var(--text-title)', letterSpacing: '-1px', marginBottom: '16px' }}>
                  The Unified Operating Advantage
                </h2>
                <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto' }}>
                  See how replacing 4 disconnected single-purpose tools with BizTech saves costs and eliminates human error.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                {/* Fragmented Way */}
                <div style={{ background: 'var(--card-bg)', borderRadius: '20px', padding: '36px', border: '1px solid #FECACA' }}>
                  <div style={{ color: '#DC2626', fontWeight: '700', fontSize: '14px', marginBottom: '12px' }}>THE FRAGMENTED APPROACH</div>
                  <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '20px' }}>Spreadsheets & 5 Separate Apps</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', gap: '10px' }}><X size={18} color="#DC2626" /> Standalone POS has zero visibility into warehouse stock</div>
                    <div style={{ display: 'flex', gap: '10px' }}><X size={18} color="#DC2626" /> Attendance tracked on paper or WhatsApp messages</div>
                    <div style={{ display: 'flex', gap: '10px' }}><X size={18} color="#DC2626" /> Manual end-of-day Excel reconciliations prone to math errors</div>
                    <div style={{ display: 'flex', gap: '10px' }}><X size={18} color="#DC2626" /> Multiple subscriptions adding up to ₹15,000+/month</div>
                  </div>
                </div>

                {/* BizTech Unified */}
                <div style={{ background: 'var(--card-bg)', borderRadius: '20px', padding: '36px', border: '2px solid #2563EB', boxShadow: '0 15px 30px -10px rgba(37,99,235,0.15)' }}>
                  <div style={{ color: '#2563EB', fontWeight: '700', fontSize: '14px', marginBottom: '12px' }}>THE BIZTECH ENGINE</div>
                  <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '20px' }}>One Synchronized Command Center</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: 'var(--text-title)' }}>
                    <div style={{ display: 'flex', gap: '10px' }}><CheckCircle2 size={18} color="#10B981" /> Barcode scan automatically decrements warehouse inventory</div>
                    <div style={{ display: 'flex', gap: '10px' }}><CheckCircle2 size={18} color="#10B981" /> Staff clock in via GPS geofenced mobile shifts</div>
                    <div style={{ display: 'flex', gap: '10px' }}><CheckCircle2 size={18} color="#10B981" /> Instant multi-store P&L reports with zero manual data entry</div>
                    <div style={{ display: 'flex', gap: '10px' }}><CheckCircle2 size={18} color="#10B981" /> Single transparent subscription starting at affordable rates</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Interactive Business ROI & Hours Saved Calculator */}
          <section style={{ padding: '80px 24px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border-color)', padding: '48px 36px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F0FDF4', color: '#16A34A', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', marginBottom: '12px' }}>
                  <Sliders size={14} /> Calculate Impact
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-title)', letterSpacing: '-0.5px' }}>
                  Estimate Time & Cost Savings for Your Operations
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Adjust the sliders to match your current company profile.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '36px', alignItems: 'center' }}>
                <div>
                  <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: '700', fontSize: '15px', color: 'var(--text-title)' }}>
                      <span>Number of Stores / Branches:</span>
                      <span style={{ color: '#2563EB', fontSize: '18px' }}>{calcBranches} {calcBranches === 1 ? 'Location' : 'Locations'}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="20" 
                      value={calcBranches} 
                      onChange={(e) => setCalcBranches(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#2563EB', cursor: 'pointer' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: '700', fontSize: '15px', color: 'var(--text-title)' }}>
                      <span>Team Members / Staff:</span>
                      <span style={{ color: '#2563EB', fontSize: '18px' }}>{calcStaff} Employees</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="80" 
                      value={calcStaff} 
                      onChange={(e) => setCalcStaff(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#2563EB', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                {/* Calculated Output Box */}
                <div style={{ background: '#0F172A', borderRadius: '18px', padding: '32px', color: 'white', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600', marginBottom: '6px' }}>ESTIMATED ADMIN TIME SAVED</div>
                  <div style={{ fontSize: '42px', fontWeight: '800', color: '#38BDF8', letterSpacing: '-1px', marginBottom: '4px' }}>
                    ~{Math.round(calcBranches * 12 + calcStaff * 4)} hrs
                  </div>
                  <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px' }}>Every Single Month</div>

                  <hr style={{ border: 'none', borderTop: '1px solid #1E293B', margin: '16px 0' }} />

                  <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600', marginBottom: '6px' }}>ESTIMATED OPERATIONAL SAVINGS</div>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#10B981' }}>
                    ₹{((calcBranches * 6500) + (calcStaff * 750)).toLocaleString()} / mo
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: 3-Step Setup Walkthrough */}
          <section className="section-padding landing-section-alt">
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                <h2 style={{ fontSize: '38px', fontWeight: '800', color: 'var(--text-title)', letterSpacing: '-1px', marginBottom: '16px' }}>
                  Up and Running in 3 Seamless Steps
                </h2>
                <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                  No extensive multi-week onboarding or IT consultants required.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '36px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>
                    1
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '12px' }}>Register & Choose Archetype</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6' }}>
                    Select your business archetype (Sole Operator to Conglomerate). Your workspace instantly configures itself to show only relevant tools.
                  </p>
                </div>

                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '36px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>
                    2
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '12px' }}>Import Products & Staff</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6' }}>
                    Quickly upload your inventory catalog via Excel / CSV, hook up your barcode scanner, and invite team cashiers with custom permissions.
                  </p>
                </div>

                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '36px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>
                    3
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '12px' }}>Start Billing & Growing</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6' }}>
                    Process transactions in sub-seconds, track live branch sales, and review automated profit margins from your phone, tablet, or PC.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7: Verified Merchant Testimonials / Case Studies */}
          <section style={{ padding: '90px 24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EFF6FF', color: '#2563EB', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', marginBottom: '14px' }}>
                <Star size={14} fill="#2563EB" /> Customer Case Studies
              </div>
              <h2 style={{ fontSize: '38px', fontWeight: '800', color: 'var(--text-title)', letterSpacing: '-1px' }}>
                Trusted by 10,000+ Fast-Growing Operators
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />)}
                  </div>
                  <p style={{ fontSize: '16px', lineHeight: '1.6', color: 'var(--text-title)', fontStyle: 'italic', marginBottom: '24px' }}>
                    "Switching to BizTech completely eliminated stock discrepancies across our 5 retail branches. The barcode scanner terminal is blisteringly fast."
                  </p>
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--text-title)' }}>Rajesh Patel</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Managing Director, Apex Retail Group</div>
                </div>
              </div>

              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />)}
                  </div>
                  <p style={{ fontSize: '16px', lineHeight: '1.6', color: 'var(--text-title)', fontStyle: 'italic', marginBottom: '24px' }}>
                    "The shift scheduling and GPS geo-attendance saved our HR team nearly 25 hours every week. Approving leaves now takes 5 seconds."
                  </p>
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--text-title)' }}>Priya Sharma</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Operations Head, Metro Life Clinics</div>
                </div>
              </div>

              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />)}
                  </div>
                  <p style={{ fontSize: '16px', lineHeight: '1.6', color: 'var(--text-title)', fontStyle: 'italic', marginBottom: '24px' }}>
                    "As a sole operator, I didn't want complex menus. BizTech's Sole Operator mode gave me clean, ultra-fast billing and perfect invoice records."
                  </p>
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--text-title)' }}>Vikram Malhotra</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Founder, TechCraft Studio</div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 8: Final Call to Action */}
          <section style={{ padding: '0 24px 90px 24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)', 
              borderRadius: '28px', 
              padding: '64px 36px', 
              color: 'white', 
              textAlign: 'center', 
              boxShadow: '0 25px 50px -15px rgba(37,99,235,0.4)' 
            }}>
              <h2 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-1px' }}>
                Ready to Upgrade Your Business Operations?
              </h2>
              <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '680px', margin: '0 auto 36px auto', lineHeight: '1.6' }}>
                Join thousands of modern enterprises running faster, smarter, and with zero manual friction. Start your 14-day free trial right now.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => navigate('/register')} 
                  style={{ background: 'white', color: '#1E3A8A', border: 'none', padding: '16px 36px', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                >
                  Create Free Account
                </button>
                <button 
                  onClick={() => navigateTo('contact')} 
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '16px 32px', borderRadius: '12px', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}
                >
                  Talk to Sales
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Global Footer */}
      <footer className="section-padding" style={{ background: '#0B1121', color: 'var(--text-secondary)', borderTop: '1px solid #1E293B' }}>
        <div className="footer-grid">

          <div className="footer-brand">
            <div 
              style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', cursor: 'pointer' }}
              onClick={() => navigateTo('home')}
            >
              <img 
                src="/biztech_logo_dark.png" 
                alt="BizTech" 
                style={{ height: '34px', width: 'auto', objectFit: 'contain' }} 
              />
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '24px', maxWidth: '300px' }}>
              The unified operating engine for retail commerce, barcode POS, multi-branch inventory, and modern team scheduling.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94A3B8' }}>
              <ShieldCheck size={16} /> Enterprise Grade Security & AES-256 Encryption
            </div>
          </div>

          <div>
            <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '16px', fontSize: '15px' }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <button onClick={() => navigateTo('features')} style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', padding: 0, cursor: 'pointer', fontSize: '14px' }}>Features & Modules</button>
              <button onClick={() => navigateTo('solutions')} style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', padding: 0, cursor: 'pointer', fontSize: '14px' }}>Business Archetypes</button>
              <button onClick={() => navigateTo('pricing')} style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', padding: 0, cursor: 'pointer', fontSize: '14px' }}>Pricing & Plans</button>
              <button onClick={() => navigate('/register')} style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', padding: 0, cursor: 'pointer', fontSize: '14px' }}>Create Free Trial</button>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '16px', fontSize: '15px' }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <button onClick={() => navigateTo('faq')} style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', padding: 0, cursor: 'pointer', fontSize: '14px' }}>Knowledge Base & FAQ</button>
              <button onClick={() => navigateTo('contact')} style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', padding: 0, cursor: 'pointer', fontSize: '14px' }}>Contact Support</button>
              <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', padding: 0, cursor: 'pointer', fontSize: '14px' }}>Tenant Login</button>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '16px', fontSize: '15px' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <button onClick={() => navigateTo('about')} style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', padding: 0, cursor: 'pointer', fontSize: '14px' }}>About BizTech</button>
              <button onClick={() => navigateTo('contact')} style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', padding: 0, cursor: 'pointer', fontSize: '14px' }}>Enterprise Partnerships</button>
              <span style={{ color: '#64748B', fontSize: '14px' }}>Security & Compliance</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '48px auto 0 auto', paddingTop: '24px', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', flexWrap: 'wrap', gap: '16px' }}>
          <div>&copy; 2026 BizTech Inc. All rights reserved.</div>
          <div style={{ color: '#64748B' }}>Built for high-efficiency commerce</div>
        </div>
      </footer>

      {/* Success Popup Modal */}
      {showSuccessPopup && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg, #FFFFFF)',
            borderRadius: '24px',
            maxWidth: '480px',
            width: '100%',
            padding: '36px 32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-color, #E2E8F0)',
            textAlign: 'center',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowSuccessPopup(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary, #64748B)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>

            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              border: '2px solid #BFDBFE'
            }}>
              <CheckCircle2 size={38} color="#2563EB" />
            </div>

            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-title, #0F172A)', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
              We Will Reach You Soon!
            </h3>

            <p style={{ fontSize: '15px', color: 'var(--text-secondary, #64748B)', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              Thank you for reaching out{submittedName ? `, ${submittedName}` : ''}! Your message has been received by our business solutions team. We will review your inquiry and connect with you shortly.
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '24px',
              color: '#15803D',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '24px'
            }}>
              <ShieldCheck size={16} /> Guaranteed response within 24 business hours
            </div>

            <button
              onClick={() => setShowSuccessPopup(false)}
              style={{
                width: '100%',
                background: '#2563EB',
                color: 'white',
                border: 'none',
                padding: '13px 20px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                transition: 'background 0.2s'
              }}
            >
              Got it, thank you!
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Landing;