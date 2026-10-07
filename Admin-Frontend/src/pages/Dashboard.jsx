import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, Plus, Building2, Layers, Activity, Banknote, 
  TrendingUp, CheckCircle2, ListMinus, Server, PieChart, 
  Bell, Zap, PlusCircle, Settings, FileText, ActivitySquare,
  ArrowUpRight, Clock
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            OPERATIONAL CONTROL PLANE &bull; <span style={{ color: 'var(--text-secondary)' }}>Realtime Telemetry</span>
          </div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '600px' }}>
            Overview of system activity, registered business tenants, and subscription metrics across active deployment clusters.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary">
            <Download size={18} /> Export Metrics
          </button>
          <button className="btn-primary" onClick={() => navigate('/admin/customers/new')}>
            <Plus size={18} /> Onboard Customer
          </button>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {/* Card 1 */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '8px' }}>TOTAL CUSTOMERS</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-title)', fontFamily: 'Plus Jakarta Sans' }}>142</div>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span style={{ color: '#059669', display: 'flex', alignItems: 'center', fontWeight: '600' }}><ArrowUpRight size={14} />+12%</span> vs last month
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary-blue)' }}></div>
              3 pending onboarding review
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '8px' }}>TENANTS BY TIER</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-title)', fontFamily: 'Plus Jakarta Sans' }}>3</span>
                <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-title)' }}>Tiers</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>142<br/>Total</span>
              </div>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={20} />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            <div style={{ display: 'flex', width: '100%', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '41%', background: 'var(--primary-blue)' }}></div>
              <div style={{ width: '43%', background: '#0EA5E9' }}></div>
              <div style={{ width: '16%', background: '#818CF8' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary-blue)' }}></div>Sole<br/>(58)</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0EA5E9' }}></div>Staff<br/>(61)</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818CF8' }}></div>Multi<br/>(23)</div>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '8px' }}>PLATFORM UTILIZATION</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-title)', fontFamily: 'Plus Jakarta Sans' }}>94.8%</div>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={20} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-title)', fontWeight: '600', marginBottom: '4px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary-blue)' }}></div>
              Uptime & Active Sync
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              All 4 cloud regions operational (us-east, eu-central, ap-southeast, sa-east)
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '8px' }}>MONTHLY RECURRING REV</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-title)', fontFamily: 'Plus Jakarta Sans' }}>$18,450</div>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Banknote size={20} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span style={{ color: '#059669', display: 'flex', alignItems: 'center', fontWeight: '600' }}><ArrowUpRight size={14} />+8.4%</span> MoM increase
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Next automatic billing cycle: Nov 1, 2024
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Quick Admin Actions Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <Zap size={20} color="var(--primary-blue)" />
            <h2 style={{ fontSize: '16px', margin: '0' }}>Quick Admin Actions</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <button style={{ padding: '16px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-blue)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'} onClick={() => navigate('/admin/customers/new')}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EFF6FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <PlusCircle size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-title)' }}>Add Customer</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Onboard new client</div>
              </div>
            </button>
            
            <button style={{ padding: '16px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-blue)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'} onClick={() => navigate('/admin/pricing')}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Settings size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-title)' }}>Configure Pricing</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Manage subscription tiers</div>
              </div>
            </button>
            
            <button style={{ padding: '16px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-blue)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'} onClick={() => navigate('/admin/customers')}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-title)' }}>View Customers</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Customer directory</div>
              </div>
            </button>

            <button style={{ padding: '16px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-blue)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bell size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-title)' }}>Alerts & Log</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>System health</div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Customers Table */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Building2 size={20} color="var(--primary-blue)" style={{ marginTop: '2px' }} />
              <div>
                <h2 style={{ fontSize: '16px', margin: '0 0 4px 0' }}>Recent Customer Registrations</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>Latest operational accounts onboarded across the platform</p>
              </div>
            </div>
            <button onClick={() => navigate('/admin/customers')} style={{ background: 'transparent', border: 'none', color: 'var(--primary-blue)', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              View All Customers <ArrowUpRight size={16} />
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Business Tenant</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Tier & Scale</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Timestamp</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' }}>AR</div>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-title)', fontSize: '14px' }}>Artisan Roast Coffee</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>tenant-arc-8891 &bull; Portland, OR</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-title)' }}>Type 1: Sole Operator</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Solo entrepreneur</div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <Clock size={14} /> 2 hours ago
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span className="badge" style={{ background: 'var(--badge-active-bg)', color: 'var(--primary-blue)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                    Active
                  </span>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' }}>SH</div>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-title)', fontSize: '14px' }}>Summit Health Clinic</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>tenant-shc-4012 &bull; Denver, CO</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-title)' }}>Type 2: Single + Staff</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>12 active staff</div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <Clock size={14} /> Yesterday, 15:42
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span className="badge" style={{ background: 'var(--badge-active-bg)', color: 'var(--primary-blue)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                    Active
                  </span>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ECFEFF', color: '#0891B2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' }}>PL</div>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-title)', fontSize: '14px' }}>Pacific Logistics Group</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>tenant-plg-9120 &bull; Seattle, WA</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-title)' }}>Type 3: Multi-Branch</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>4 branches &bull; 48 staff</div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <Clock size={14} /> 2 days ago
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span className="badge" style={{ background: 'var(--badge-pending-bg)', color: 'var(--badge-pending-text)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                    Pending Review
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
