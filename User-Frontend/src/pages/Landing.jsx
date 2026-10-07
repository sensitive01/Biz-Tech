import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Users, Map, Calendar, ShieldCheck, Zap, BarChart3, CheckCircle2 } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', overflowX: 'hidden' }}>
      
      {/* Navbar */}
      <header style={{ 
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
        
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="#features" style={{ color: '#475569', fontWeight: '500', fontSize: '15px', textDecoration: 'none' }}>Features</a>
          <a href="#solutions" style={{ color: '#475569', fontWeight: '500', fontSize: '15px', textDecoration: 'none' }}>Solutions</a>
          <a href="#pricing" style={{ color: '#475569', fontWeight: '500', fontSize: '15px', textDecoration: 'none' }}>Pricing</a>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: 'none', color: '#0F172A', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>
            Sign In
          </button>
          <button onClick={() => navigate('/register')} style={{ background: '#2563EB', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#1D4ED8'} onMouseOut={(e) => e.currentTarget.style.background = '#2563EB'}>
           Register
          </button>
        </div> 
      </header>

      {/* Hero Section */}
      <section style={{ paddingTop: '160px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
        {/* Background Gradients */}
        <div style={{ position: 'absolute', top: '0%', left: '10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }}></div>

        <div style={{ zIndex: 1, maxWidth: '800px', padding: '0 24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EFF6FF', color: '#2563EB', padding: '6px 16px', borderRadius: '20px', fontWeight: '600', fontSize: '13px', marginBottom: '24px' }}>
            <Zap size={14} /> The #1 Business Management Platform
          </div>
          
          <h1 style={{ fontSize: '56px', fontWeight: '800', color: '#0F172A', letterSpacing: '-1.5px', lineHeight: '1.1', marginBottom: '24px' }}>
            Manage Your Entire Business From <span style={{ color: '#2563EB' }}>One Dashboard</span>.
          </h1>
          
          <p style={{ fontSize: '18px', color: '#64748B', lineHeight: '1.6', marginBottom: '40px', padding: '0 40px' }}>
            BizTech streamlines operations, attendance, leaves, and branch management. Whether you're a single-store operator or a multi-branch enterprise, we scale with you.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={() => navigate('/register')} style={{ background: '#2563EB', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '12px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(37,99,235,0.4)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              Start Your Free Trial
            </button>
            <button style={{ background: 'white', color: '#0F172A', border: '1px solid #E2E8F0', padding: '16px 36px', borderRadius: '12px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
              Book a Demo
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginTop: '48px', color: '#64748B', fontSize: '14px', fontWeight: '500' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#10B981" /> No credit card required</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#10B981" /> 14-day free trial</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#10B981" /> Cancel anytime</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '100px 48px', background: '#F8FAFC', position: 'relative' }}>
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
      <section id="solutions" style={{ padding: '100px 48px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#0F172A', letterSpacing: '-1px', marginBottom: '16px' }}>Built for your exact business model</h2>
            <p style={{ fontSize: '18px', color: '#64748B', maxWidth: '600px', margin: '0 auto' }}>Choose an operational archetype during registration to instantly tailor your dashboard.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', padding: '32px', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '64px', height: '64px', background: '#F8FAFC', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '32px', flexShrink: 0 }}>
                <span style={{ fontSize: '24px', fontWeight: '800', color: '#94A3B8' }}>1</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>Sole Operator</h3>
                <p style={{ color: '#64748B', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>Perfect for one-person shops. We hide complex employee and branch management tools so you get a clean, streamlined dashboard focused purely on inventory and sales.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', padding: '32px', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '64px', height: '64px', background: '#EFF6FF', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '32px', flexShrink: 0 }}>
                <span style={{ fontSize: '24px', fontWeight: '800', color: '#2563EB' }}>2</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>Single Branch + Staff</h3>
                <p style={{ color: '#64748B', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>Unlock Employee Management, Attendance Tracking, and Leave Requests. Everything you need to manage a team at a single location without the clutter of multi-branch networks.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', padding: '32px', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '64px', height: '64px', background: '#F5F3FF', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '32px', flexShrink: 0 }}>
                <span style={{ fontSize: '24px', fontWeight: '800', color: '#7C3AED' }}>3</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>Multi-Branch Enterprise</h3>
                <p style={{ color: '#64748B', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>The full suite. Seamlessly manage unlimited branches, cross-location staff, aggregated attendance reporting, and hierarchical permissions.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 48px', background: '#0F172A', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '24px' }}>Ready to transform your operations?</h2>
          <p style={{ fontSize: '18px', color: '#94A3B8', marginBottom: '40px' }}>Join thousands of businesses scaling efficiently with BizTech.</p>
          <button onClick={() => navigate('/register')} style={{ background: '#2563EB', color: 'white', border: 'none', padding: '16px 40px', borderRadius: '12px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#3B82F6'} onMouseOut={(e) => e.currentTarget.style.background = '#2563EB'}>
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0B1121', padding: '64px 48px', color: '#64748B', borderTop: '1px solid #1E293B' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px' }}>
          
          <div style={{ gridColumn: '1 / span 2' }}>
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
