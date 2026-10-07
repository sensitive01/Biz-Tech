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

      {/* Main Grid: Left 2/3, Right 1/3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Chart Card */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <TrendingUp size={24} color="var(--primary-blue)" style={{ marginTop: '2px' }} />
                <div>
                  <h2 style={{ fontSize: '16px', margin: '0 0 4px 0' }}>Tenant Activity & Operations Overview</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>Aggregated hourly user authentication sessions and cloud synchronization requests</p>
                </div>
              </div>
              <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 'var(--radius-lg)', padding: '4px' }}>
                <button style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 12px', fontSize: '12px', fontWeight: '600', color: 'var(--text-title)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>Last 7 Days</button>
                <button style={{ background: 'transparent', border: 'none', padding: '4px 12px', fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>Last 30 Days</button>
                <button style={{ background: 'transparent', border: 'none', padding: '4px 12px', fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>This Quarter</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--primary-blue)' }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>Daily Active Logins</span>
                <strong style={{ color: 'var(--text-title)' }}>4,812 / day</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#38BDF8' }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>Attendance Sync Events</span>
                <strong style={{ color: 'var(--text-title)' }}>32.4k / day</strong>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={14} /> Peak latency: 24ms
              </div>
            </div>

            {/* Fake Chart Area */}
            <div style={{ height: '240px', background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(248,250,252,1) 100%)', borderRadius: '8px', border: '1px dashed var(--border-color)', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '16px' }}>
              {/* Fake Lines using SVG */}
              <svg style={{ position: 'absolute', top: '20px', left: 0, width: '100%', height: '200px' }} preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M 0 80 Q 20 70 40 85 T 80 50 T 100 40" fill="none" stroke="#38BDF8" strokeWidth="2" />
                <path d="M 0 70 Q 20 60 40 75 T 80 40 T 100 30" fill="none" stroke="var(--primary-blue)" strokeWidth="2.5" />
                <circle cx="80" cy="40" r="1.5" fill="white" stroke="var(--primary-blue)" strokeWidth="1" />
                <circle cx="100" cy="30" r="1.5" fill="white" stroke="var(--primary-blue)" strokeWidth="1" />
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '8px', zIndex: 1 }}>
                <span>Mon, Oct 21</span>
                <span>Tue, Oct 22</span>
                <span>Wed, Oct 23</span>
                <span>Thu, Oct 24</span>
                <span>Fri, Oct 25</span>
                <span>Sat, Oct 26</span>
                <span style={{ color: 'var(--primary-blue)', fontWeight: '600' }}>Sun, Oct 27 (Today)</span>
              </div>
            </div>

            {/* Bottom Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ color: 'var(--primary-blue)' }}><CheckCircle2 size={24} /></div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>Auth Success Rate</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-title)' }}>99.98%</div>
                </div>
              </div>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ color: '#475569' }}><ListMinus size={24} /></div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>Queue Backlog</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-title)' }}>0 jobs pending</div>
                </div>
              </div>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ color: '#475569' }}><Server size={24} /></div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>Replica Delay</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-title)' }}>&lt; 12ms avg</div>
                </div>
              </div>
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
              <a href="/admin/customers" style={{ fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All Customers <ArrowUpRight size={16} />
              </a>
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
                <tr>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' }}>NH</div>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-title)', fontSize: '14px' }}>Nordic Home Decor</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>tenant-nhd-1149 &bull; Minneapolis, MN</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-title)' }}>Type 1: Sole Operator</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Solo entrepreneur</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <Clock size={14} /> 3 days ago
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span className="badge" style={{ background: 'var(--badge-active-bg)', color: 'var(--primary-blue)' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                      Active
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Structure Distribution Card */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <PieChart size={20} color="var(--primary-blue)" style={{ marginTop: '2px' }} />
                <h2 style={{ fontSize: '16px', margin: '0' }}>Structure<br/>Distribution</h2>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div style={{ fontWeight: '600', color: 'var(--text-title)', fontSize: '14px' }}>142</div>
                ACTIVE
              </div>
            </div>

            {/* Donut Chart visual */}
            <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 32px auto' }}>
              <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#818CF8" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="210" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#0EA5E9" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="140" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--primary-blue)" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="40" />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-title)', fontFamily: 'Plus Jakarta Sans' }}>100%</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Provisioned</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary-blue)', marginTop: '4px' }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-title)' }}>Type 1: Sole Operator</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-title)' }}>41%</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>58 businesses &bull; No HR/attendance module required</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#0EA5E9', marginTop: '4px' }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-title)' }}>Type 2: Single Shop + St...</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-title)' }}>43%</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>61 businesses &bull; Active staff clock-in enabled</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#818CF8', marginTop: '4px' }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-title)' }}>Type 3: Multi-Branch</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-title)' }}>16%</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>23 businesses &bull; Multi-location branch switcher active</div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts & Notice Board Card */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Bell size={20} color="var(--primary-blue)" />
                <h2 style={{ fontSize: '16px', margin: '0' }}>Alerts & Notice Board</h2>
              </div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-blue)' }}></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F1F5F9', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Server size={16} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-title)' }}>Automated Backup</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>04:00 UTC</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                    Automated database snapshot completed successfully. 142 tenant schemas verified.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building2 size={16} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#B91C1C' }}>Tenant Review Required</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>2d ago</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                    1 customer pending branch verification: <strong>Pacific Logistics Group</strong>.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-title)' }}>Sync Latency Nominal</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Just now</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                    Attendance sync engine operating at nominal latency (18ms average response).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Admin Actions Card */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <Zap size={20} color="var(--primary-blue)" />
              <h2 style={{ fontSize: '16px', margin: '0' }}>Quick Admin Actions</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button style={{ padding: '16px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-blue)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EFF6FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PlusCircle size={18} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-title)' }}>Add New Customer</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Onboard wizard</div>
                </div>
              </button>
              
              <button style={{ padding: '16px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-blue)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Settings size={18} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-title)' }}>Configure Tiers</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Edit pricing & caps</div>
                </div>
              </button>
              
              <button style={{ padding: '16px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-blue)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-title)' }}>Audit Logs</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Security trails</div>
                </div>
              </button>
              
              <button style={{ padding: '16px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-blue)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ActivitySquare size={18} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-title)' }}>System Health</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Infrastructure status</div>
                </div>
              </button>
            </div>
          </div>
          
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
