import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Users, Map, Calendar, ShieldCheck, Zap, BarChart3, CheckCircle2, Building2, Menu, X } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';

const Landing = () => {
  const navigate = useNavigate();
  const [pricingPlans, setPricingPlans] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    return plan ? plan.amount : defaultAmount;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', overflowX: 'hidden' }}>

      {/* Navbar */}
      <header className="landing-header" style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '72px',
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #E2E8F0', zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden' }}>
            <img src="/logo.jpg" alt="BizTech Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.5px' }}>BizTech</span>
        </div>

        <div className="desktop-nav" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="#about" style={{ color: '#475569', fontWeight: '500', fontSize: '15px', textDecoration: 'none' }}>About Us</a>
          <a href="#features" style={{ color: '#475569', fontWeight: '500', fontSize: '15px', textDecoration: 'none' }}>Features</a>
          <a href="#solutions" style={{ color: '#475569', fontWeight: '500', fontSize: '15px', textDecoration: 'none' }}>Solutions</a>
          <a href="#pricing" style={{ color: '#475569', fontWeight: '500', fontSize: '15px', textDecoration: 'none' }}>Pricing</a>
          <a href="#faq" style={{ color: '#475569', fontWeight: '500', fontSize: '15px', textDecoration: 'none' }}>FAQ</a>
          <a href="#contact" style={{ color: '#475569', fontWeight: '500', fontSize: '15px', textDecoration: 'none' }}>Contact</a>
        </div>

        <div className="desktop-nav" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <LanguageSelector />
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: 'none', color: '#0F172A', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>
            Sign In
          </button>
          <button onClick={() => navigate('/register')} style={{ background: '#2563EB', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#1D4ED8'} onMouseOut={(e) => e.currentTarget.style.background = '#2563EB'}>
            Register
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <a href="#about" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#475569', fontWeight: '500', fontSize: '15px', textDecoration: 'none' }}>About Us</a>
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#475569', fontWeight: '500', fontSize: '15px', textDecoration: 'none' }}>Features</a>
            <a href="#solutions" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#475569', fontWeight: '500', fontSize: '15px', textDecoration: 'none' }}>Solutions</a>
            <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#475569', fontWeight: '500', fontSize: '15px', textDecoration: 'none' }}>Pricing</a>
            <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#475569', fontWeight: '500', fontSize: '15px', textDecoration: 'none' }}>FAQ</a>
            <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#475569', fontWeight: '500', fontSize: '15px', textDecoration: 'none' }}>Contact</a>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '8px 0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <LanguageSelector />
            <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} style={{ textAlign: 'left', background: 'transparent', border: 'none', color: '#0F172A', fontWeight: '600', fontSize: '15px', cursor: 'pointer', padding: 0 }}>
              Sign In
            </button>
            <button onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }} style={{ width: '100%', background: '#2563EB', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', textAlign: 'center' }}>
              Register
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section style={{ paddingTop: '160px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
        {/* Background Gradients */}
        <div style={{ position: 'absolute', top: '0%', left: '10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }}></div>

        <div style={{ zIndex: 1, maxWidth: '1200px', width: '100%', padding: '0 24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EFF6FF', color: '#2563EB', padding: '6px 16px', borderRadius: '20px', fontWeight: '600', fontSize: '13px', marginBottom: '24px' }}>
            <Zap size={14} /> The Ultimate Enterprise Operating System
          </div>

          <h1 className="hero-title">
            Scale Your Organization With <br /> <span style={{ color: '#2563EB' }}>Absolute Precision</span>.
          </h1>

          <p className="hero-subtitle">
            Take control of your entire workflow with intelligent automation, real-time analytics, and seamless collaboration tools built for modern teams.
          </p>

          <div className="hero-buttons">
            <button onClick={() => navigate('/register')} style={{ background: '#2563EB', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '12px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(37,99,235,0.4)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              Get Started Now
            </button>
            <button style={{ background: 'white', color: '#0F172A', border: '1px solid #E2E8F0', padding: '16px 36px', borderRadius: '12px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
              Talk to Sales
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginTop: '48px', color: '#64748B', fontSize: '14px', fontWeight: '500' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#10B981" /> Free 30-day trial</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#10B981" /> No setup fees</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#10B981" /> Cancel anytime</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding" style={{ background: '#F8FAFC', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#0F172A', letterSpacing: '-1px', marginBottom: '16px' }}>Everything you need to grow</h2>
            <p style={{ fontSize: '18px', color: '#64748B', maxWidth: '600px', margin: '0 auto' }}>Powerful tools designed specifically for modern business operations.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>

            {/* Feature 1 */}
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', background: '#EFF6FF', color: '#2563EB', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>Employee Management</h3>
              <p style={{ color: '#64748B', lineHeight: '1.6' }}>Maintain detailed profiles, roles, and shift allocations for all your staff members across any location.</p>
            </div>

            {/* Feature 2 */}
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', background: '#F0FDF4', color: '#16A34A', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Map size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>Multi-Branch Support</h3>
              <p style={{ color: '#64748B', lineHeight: '1.6' }}>Scale effortlessly. Manage 1 or 1,000 branches from a single unified dashboard without extra hassle.</p>
            </div>

            {/* Feature 3 */}
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', background: '#FEF2F2', color: '#DC2626', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Calendar size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>Leave & Attendance</h3>
              <p style={{ color: '#64748B', lineHeight: '1.6' }}>Automated attendance tracking and streamlined leave approval workflows for your entire workforce.</p>
            </div>

            {/* Feature 4 */}
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', background: '#F5F3FF', color: '#7C3AED', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <BarChart3 size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>Advanced Analytics</h3>
              <p style={{ color: '#64748B', lineHeight: '1.6' }}>Gain actionable insights into your business performance, employee productivity, and branch efficiency.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Solutions / Archetypes Section */}
      <section id="solutions" className="section-padding" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#0F172A', letterSpacing: '-1px', marginBottom: '16px' }}>Built for your exact business model</h2>
            <p style={{ fontSize: '18px', color: '#64748B', maxWidth: '600px', margin: '0 auto' }}>Choose an operational archetype during registration to instantly tailor your dashboard.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>

            <div className="archetype-card">
              <div className="archetype-icon" style={{ background: '#F8FAFC' }}>
                <span style={{ fontSize: '24px', fontWeight: '800', color: '#94A3B8' }}>1</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>Sole Operator</h3>
                <p style={{ color: '#64748B', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>Perfect for one-person shops. We hide complex employee and branch management tools so you get a clean, streamlined dashboard focused purely on inventory and sales.</p>
              </div>
            </div>

            <div className="archetype-card">
              <div className="archetype-icon" style={{ background: '#EFF6FF' }}>
                <span style={{ fontSize: '24px', fontWeight: '800', color: '#2563EB' }}>2</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>Single Branch + Staff</h3>
                <p style={{ color: '#64748B', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>Unlock Employee Management, Attendance Tracking, and Leave Requests. Everything you need to manage a team at a single location without the clutter of multi-branch networks.</p>
              </div>
            </div>

            <div className="archetype-card">
              <div className="archetype-icon" style={{ background: '#F5F3FF' }}>
                <span style={{ fontSize: '24px', fontWeight: '800', color: '#7C3AED' }}>3</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>Multi-Branch Enterprise</h3>
                <p style={{ color: '#64748B', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>The full suite. Seamlessly manage unlimited branches, cross-location staff, aggregated attendance reporting, and hierarchical permissions.</p>
              </div>
            </div>

            <div className="archetype-card">
              <div className="archetype-icon" style={{ background: '#ECFEFF' }}>
                <span style={{ fontSize: '24px', fontWeight: '800', color: '#0891B2' }}>4</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>Multi-Business Conglomerate</h3>
                <p style={{ color: '#64748B', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>For operators managing entirely separate businesses under one umbrella. Consolidate operations, branches, and staff with full isolation and aggregate reporting.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section-padding" style={{ background: '#F8FAFC' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#0F172A', letterSpacing: '-1px', marginBottom: '16px' }}>Transparent, Simple Pricing</h2>
            <p style={{ fontSize: '18px', color: '#64748B', maxWidth: '600px', margin: '0 auto' }}>Choose the plan that best fits your business model. No hidden fees.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>

            {/* Sole Operator Plan */}
            <div style={{ background: 'white', padding: '40px 32px', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>Sole Operator</h3>
              <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>Perfect for one-person shops starting out.</p>
              <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '48px', fontWeight: '800', color: '#0F172A', letterSpacing: '-2px' }}>₹{getPrice('Type 1: Sole Operator', 19)}</span>
                <span style={{ color: '#64748B', fontWeight: '500' }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#475569', fontSize: '15px' }}><CheckCircle2 size={18} color="#2563EB" /> 1 User Account</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#475569', fontSize: '15px' }}><CheckCircle2 size={18} color="#2563EB" /> Basic Inventory Management</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#475569', fontSize: '15px' }}><CheckCircle2 size={18} color="#2563EB" /> Sales Tracking & Reports</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#475569', fontSize: '15px' }}><CheckCircle2 size={18} color="#2563EB" /> Email Support</li>
              </ul>
              <button onClick={() => navigate('/register')} style={{ width: '100%', background: '#EFF6FF', color: '#2563EB', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'} onMouseOut={(e) => e.currentTarget.style.background = '#EFF6FF'}>Get Started</button>
            </div>

            {/* Single Branch Plan */}
            <div style={{ background: '#0F172A', padding: '40px 32px', borderRadius: '24px', border: '1px solid #1E293B', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative', transform: 'scale(1.05)', zIndex: 10 }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#2563EB', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>MOST POPULAR</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Single Branch + Staff</h3>
              <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '24px' }}>For growing teams at a single location.</p>
              <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '48px', fontWeight: '800', color: 'white', letterSpacing: '-2px' }}>₹{getPrice('Type 2: Single Branch + Staff', 49)}</span>
                <span style={{ color: '#94A3B8', fontWeight: '500' }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#F8FAFC', fontSize: '15px' }}><CheckCircle2 size={18} color="#3B82F6" /> Up to 20 Employee Accounts</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#F8FAFC', fontSize: '15px' }}><CheckCircle2 size={18} color="#3B82F6" /> Employee Management</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#F8FAFC', fontSize: '15px' }}><CheckCircle2 size={18} color="#3B82F6" /> Leave & Attendance Tracking</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#F8FAFC', fontSize: '15px' }}><CheckCircle2 size={18} color="#3B82F6" /> Priority Support</li>
              </ul>
              <button onClick={() => navigate('/register')} style={{ width: '100%', background: '#2563EB', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#1D4ED8'} onMouseOut={(e) => e.currentTarget.style.background = '#2563EB'}>Get Started</button>
            </div>

            {/* Enterprise Plan */}
            <div style={{ background: 'white', padding: '40px 32px', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>Multi-Branch Enterprise</h3>
              <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>For large operations spanning multiple sites.</p>
              <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '48px', fontWeight: '800', color: '#0F172A', letterSpacing: '-2px' }}>₹{getPrice('Type 3: Multi-Branch Enterprise', 199)}</span>
                <span style={{ color: '#64748B', fontWeight: '500' }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#475569', fontSize: '15px' }}><CheckCircle2 size={18} color="#2563EB" /> Unlimited Branches & Users</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#475569', fontSize: '15px' }}><CheckCircle2 size={18} color="#2563EB" /> Cross-Branch Reporting</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#475569', fontSize: '15px' }}><CheckCircle2 size={18} color="#2563EB" /> Hierarchical Permissions</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#475569', fontSize: '15px' }}><CheckCircle2 size={18} color="#2563EB" /> 24/7 Dedicated Account Manager</li>
              </ul>
              <button onClick={() => navigate('/register')} style={{ width: '100%', background: '#EFF6FF', color: '#2563EB', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'} onMouseOut={(e) => e.currentTarget.style.background = '#EFF6FF'}>Get Started</button>
            </div>

            {/* Conglomerate Plan */}
            <div style={{ background: 'white', padding: '40px 32px', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>Multi-Business Conglomerate</h3>
              <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>For umbrella corps managing varied brands.</p>
              <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '48px', fontWeight: '800', color: '#0F172A', letterSpacing: '-2px' }}>₹{getPrice('Type 4: Multi-Business Conglomerate', 399)}</span>
                <span style={{ color: '#64748B', fontWeight: '500' }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#475569', fontSize: '15px' }}><CheckCircle2 size={18} color="#2563EB" /> Unlimited Businesses & Brands</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#475569', fontSize: '15px' }}><CheckCircle2 size={18} color="#2563EB" /> Corporate Roll-up Reporting</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#475569', fontSize: '15px' }}><CheckCircle2 size={18} color="#2563EB" /> Brand Isolation Setup</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#475569', fontSize: '15px' }}><CheckCircle2 size={18} color="#2563EB" /> Custom Integrations Support</li>
              </ul>
              <button onClick={() => navigate('/register')} style={{ width: '100%', background: '#EFF6FF', color: '#2563EB', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'} onMouseOut={(e) => e.currentTarget.style.background = '#EFF6FF'}>Get Started</button>
            </div>

          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="section-padding" style={{ background: '#F8FAFC', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: '#DBEAFE', color: '#1D4ED8', padding: '6px 16px', borderRadius: '20px', fontWeight: '600', fontSize: '13px', marginBottom: '24px' }}>Our Mission</div>
          <h2 style={{ fontSize: '40px', fontWeight: '800', color: '#0F172A', marginBottom: '24px', letterSpacing: '-1px' }}>About BizTech</h2>
          <p style={{ fontSize: '18px', color: '#64748B', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
            We believe that running a business should be seamless, intuitive, and scalable. At BizTech, our mission is to empower organizations of all sizes with a unified operating system that eliminates friction, connects teams, and turns complex workflows into simple, automated processes. 
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginTop: '64px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', fontWeight: '800', color: '#2563EB' }}>10k+</div>
              <div style={{ fontSize: '15px', color: '#64748B', fontWeight: '500' }}>Active Businesses</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', fontWeight: '800', color: '#2563EB' }}>50M+</div>
              <div style={{ fontSize: '15px', color: '#64748B', fontWeight: '500' }}>Transactions Processed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', fontWeight: '800', color: '#2563EB' }}>99.9%</div>
              <div style={{ fontSize: '15px', color: '#64748B', fontWeight: '500' }}>Uptime Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section-padding" style={{ background: '#FFFFFF', position: 'relative' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '800', color: '#0F172A', marginBottom: '16px', letterSpacing: '-1px' }}>Frequently Asked Questions</h2>
            <p style={{ fontSize: '18px', color: '#64748B' }}>Everything you need to know about the product and billing.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>How does the 14-day free trial work?</h3>
              <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '15px' }}>You can sign up and use all the features of your selected plan completely free for 14 days. No credit card is required to start. We will notify you before your trial expires.</p>
            </div>
            <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>Can I switch plans or business archetypes later?</h3>
              <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '15px' }}>Yes, BizTech is highly flexible. You can upgrade, downgrade, or switch your business archetype at any time from your billing dashboard. Your data will seamlessly migrate.</p>
            </div>
            <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>Is my data secure?</h3>
              <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '15px' }}>Security is our top priority. We use AES-256 encryption for data at rest and TLS 1.3 for data in transit. We are fully GDPR and SOC2 compliant.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-padding" style={{ background: '#F8FAFC', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '64px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '40px', fontWeight: '800', color: '#0F172A', marginBottom: '16px', letterSpacing: '-1px' }}>Get in Touch</h2>
            <p style={{ fontSize: '18px', color: '#64748B', marginBottom: '40px' }}>Have a question or need a custom solution? Our team is here to help you navigate your business needs.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>Call Us</div>
                  <div style={{ fontSize: '16px', color: '#0F172A', fontWeight: '700' }}>+1 (800) 123-4567</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>Email Us</div>
                  <div style={{ fontSize: '16px', color: '#0F172A', fontWeight: '700' }}>support@biztech.com</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>Headquarters</div>
                  <div style={{ fontSize: '16px', color: '#0F172A', fontWeight: '700' }}>123 Innovation Drive, Tech City</div>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Send a Message</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Full Name</label>
                <input type="text" placeholder="Enter your name" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '15px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Work Email</label>
                <input type="email" placeholder="Enter your email" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '15px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Message</label>
                <textarea rows="4" placeholder="How can we help you?" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '15px', resize: 'none' }}></textarea>
              </div>
              <button style={{ width: '100%', background: '#2563EB', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', marginTop: '8px' }}>Send Message</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="section-padding" style={{ background: '#0B1121', color: '#64748B', borderTop: '1px solid #1E293B' }}>
        <div className="footer-grid">

          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden' }}>
                <img src="/logo.jpg" alt="BizTech Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: '20px', fontWeight: '800', color: 'white', fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.5px' }}>BizTech</span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '24px', maxWidth: '300px' }}>
              The unified platform for modern business operations, team management, and multi-branch orchestration.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <ShieldCheck size={16} /> Enterprise Grade Security
            </div>
          </div>

          <div>
            <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '16px', fontSize: '15px' }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Features</a>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Pricing</a>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Archetypes</a>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Integrations</a>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '16px', fontSize: '15px' }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Documentation</a>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Blog</a>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Support Center</a>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>API Reference</a>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '16px', fontSize: '15px' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>About Us</a>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Careers</a>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Terms of Service</a>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '48px auto 0 auto', paddingTop: '24px', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', flexWrap: 'wrap', gap: '16px' }}>
          <div>&copy; 2026 BizTech Inc. All rights reserved.</div>
          <div>Designed by sensitive technologies</div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
