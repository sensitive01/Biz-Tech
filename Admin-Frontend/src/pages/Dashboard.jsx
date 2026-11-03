import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, Plus, Building2, Layers, Activity, Banknote, 
  TrendingUp, TrendingDown, CheckCircle2, Server, 
  Zap, PlusCircle, Settings, ArrowUpRight, Clock,
  RefreshCw, Loader2, Store, Users, Map, ShieldCheck,
  ChevronRight, AlertCircle, Sparkles
} from 'lucide-react';
import { exportToCSV } from '../utils/exportToCSV';

const Dashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    overview: {
      totalTenants: 0,
      totalActive: 0,
      totalPending: 0,
      newThisMonth: 0,
      growthRate: 0,
      totalMrr: 0,
      totalArr: 0,
      arpu: 0
    },
    tierDistribution: {
      typeCounts: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentages: { 1: 0, 2: 0, 3: 0, 4: 0 }
    },
    platformScale: {
      totalEmployees: 0,
      totalBranches: 0,
      totalBusinesses: 0,
      totalProducts: 0,
      totalSalesCount: 0,
      totalSalesVolume: 0
    },
    systemTelemetry: {
      status: 'Operational',
      database: 'Connected',
      uptimeSeconds: 0,
      timestamp: new Date()
    },
    recentCustomers: []
  });

  const fetchDashboardStats = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${apiUrl}/api/admin/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to load dashboard metrics (Status: ${res.status})`);
      }

      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Recently';
    const now = new Date();
    const date = new Date(dateString);
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 172800) return 'Yesterday';
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (name) => {
    if (!name) return 'BT';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getTypeInfo = (type) => {
    switch (Number(type)) {
      case 1:
        return { label: 'Type 1: Sole Operator', color: '#475569', bg: '#F1F5F9', border: '#E2E8F0', shortName: 'Sole' };
      case 2:
        return { label: 'Type 2: Single + Staff', color: '#1E40AF', bg: '#EFF6FF', border: '#DBEAFE', shortName: 'Staff' };
      case 3:
        return { label: 'Type 3: Multi-Branch', color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE', shortName: 'Branch' };
      case 4:
        return { label: 'Type 4: Multi-Business', color: '#0E7490', bg: '#ECFEFF', border: '#CFFAFE', shortName: 'Conglom' };
      default:
        return { label: `Type ${type}`, color: '#475569', bg: '#F1F5F9', border: '#E2E8F0', shortName: `T${type}` };
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'Active').toLowerCase();
    if (s === 'active') {
      return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', dot: '#10B981', label: 'Active' };
    }
    if (s === 'pending') {
      return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A', dot: '#F59E0B', label: 'Pending Review' };
    }
    return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', dot: '#EF4444', label: status || 'Inactive' };
  };

  const handleExportMetrics = () => {
    const exportRows = [
      { Metric: 'Total Registered Tenants', Value: stats.overview.totalTenants },
      { Metric: 'Active Paying Tenants', Value: stats.overview.totalActive },
      { Metric: 'Pending Review Tenants', Value: stats.overview.totalPending },
      { Metric: 'New Tenants (Last 30 Days)', Value: stats.overview.newThisMonth },
      { Metric: 'Month-over-Month Growth Rate', Value: `${stats.overview.growthRate}%` },
      { Metric: 'Monthly Recurring Revenue (MRR)', Value: `₹${stats.overview.totalMrr.toLocaleString()}` },
      { Metric: 'Annual Recurring Revenue (ARR)', Value: `₹${stats.overview.totalArr.toLocaleString()}` },
      { Metric: 'Average Revenue Per Tenant (ARPU)', Value: `₹${stats.overview.arpu.toLocaleString()}` },
      { Metric: 'Type 1 (Sole Operator) Tenants', Value: stats.tierDistribution.typeCounts[1] || 0 },
      { Metric: 'Type 2 (Single + Staff) Tenants', Value: stats.tierDistribution.typeCounts[2] || 0 },
      { Metric: 'Type 3 (Multi-Branch) Tenants', Value: stats.tierDistribution.typeCounts[3] || 0 },
      { Metric: 'Type 4 (Multi-Business) Tenants', Value: stats.tierDistribution.typeCounts[4] || 0 },
      { Metric: 'Total Staff Managed Across Platform', Value: stats.platformScale.totalEmployees },
      { Metric: 'Total Branches Active Across Platform', Value: stats.platformScale.totalBranches },
      { Metric: 'Total Businesses Registered', Value: stats.platformScale.totalBusinesses },
      { Metric: 'Total Product Catalog Items', Value: stats.platformScale.totalProducts },
      { Metric: 'Total Sales Transactions Processed', Value: stats.platformScale.totalSalesCount },
      { Metric: 'Total Platform Sales Volume', Value: `₹${stats.platformScale.totalSalesVolume.toLocaleString()}` },
      { Metric: 'Platform System Status', Value: stats.systemTelemetry.status },
      { Metric: 'Export Timestamp', Value: new Date().toLocaleString() }
    ];

    exportToCSV(exportRows, `BizTech_Admin_Platform_Metrics_${new Date().toISOString().split('T')[0]}`);
  };

  const { overview, tierDistribution, platformScale, systemTelemetry, recentCustomers } = stats;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)' }}></span>
            OPERATIONAL CONTROL PLANE &bull; <span style={{ color: 'var(--text-secondary)' }}>Live Telemetry</span>
          </div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px', color: 'var(--text-title)' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '620px', lineHeight: '1.5' }}>
            Real-time analytics of system operations, customer tenant adoption, tier distribution, and active subscription revenues.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            className="btn-secondary" 
            onClick={() => fetchDashboardStats(true)}
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Refresh latest telemetry"
          >
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </button>

          <button className="btn-secondary" onClick={handleExportMetrics}>
            <Download size={17} /> Export Metrics
          </button>

          <button className="btn-primary" onClick={() => navigate('/admin/customers/new')}>
            <Plus size={18} /> Onboard Customer
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '14px 18px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', color: '#991B1B', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
          <AlertCircle size={18} color="#DC2626" />
          <span>{error}</span>
          <button onClick={() => fetchDashboardStats()} style={{ marginLeft: 'auto', background: '#DC2626', color: 'white', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>Retry</button>
        </div>
      )}

      {/* Top 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
        
        {/* Card 1: Total Customers */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.6px', marginBottom: '6px' }}>
                TOTAL CUSTOMERS
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-title)', fontFamily: 'Plus Jakarta Sans', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {loading ? <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /> : overview.totalTenants}
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #DBEAFE' }}>
              <Building2 size={20} />
            </div>
          </div>
          
          <div style={{ marginTop: 'auto', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span style={{ 
                color: overview.growthRate >= 0 ? '#059669' : '#DC2626', 
                display: 'inline-flex', 
                alignItems: 'center', 
                fontWeight: '700',
                background: overview.growthRate >= 0 ? '#ECFDF5' : '#FEF2F2',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {overview.growthRate >= 0 ? <TrendingUp size={13} style={{ marginRight: '3px' }} /> : <TrendingDown size={13} style={{ marginRight: '3px' }} />}
                {overview.growthRate >= 0 ? `+${overview.growthRate}%` : `${overview.growthRate}%`}
              </span>
              <span>vs last month ({overview.newThisMonth} new)</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
              {overview.totalActive} active &bull; {overview.totalPending} pending review
            </div>
          </div>
        </div>

        {/* Card 2: Tenants by Tier */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.6px', marginBottom: '6px' }}>
                TENANTS BY TIER
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-title)', fontFamily: 'Plus Jakarta Sans' }}>4</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>Tiers</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '4px' }}>({overview.totalTenants} Total)</span>
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #DDD6FE' }}>
              <Layers size={20} />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
            {/* Multi-segment progress bar */}
            <div style={{ display: 'flex', width: '100%', height: '7px', borderRadius: '6px', overflow: 'hidden', background: '#E2E8F0' }}>
              <div style={{ width: `${tierDistribution.percentages[1] || 0}%`, background: '#2563EB', transition: 'width 0.4s' }} title={`Type 1: ${tierDistribution.typeCounts[1] || 0} (${tierDistribution.percentages[1] || 0}%)`}></div>
              <div style={{ width: `${tierDistribution.percentages[2] || 0}%`, background: '#0EA5E9', transition: 'width 0.4s' }} title={`Type 2: ${tierDistribution.typeCounts[2] || 0} (${tierDistribution.percentages[2] || 0}%)`}></div>
              <div style={{ width: `${tierDistribution.percentages[3] || 0}%`, background: '#8B5CF6', transition: 'width 0.4s' }} title={`Type 3: ${tierDistribution.typeCounts[3] || 0} (${tierDistribution.percentages[3] || 0}%)`}></div>
              <div style={{ width: `${tierDistribution.percentages[4] || 0}%`, background: '#06B6D4', transition: 'width 0.4s' }} title={`Type 4: ${tierDistribution.typeCounts[4] || 0} (${tierDistribution.percentages[4] || 0}%)`}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center' }}>
              <div>
                <span style={{ color: '#2563EB' }}>T1:</span> {tierDistribution.typeCounts[1] || 0}
              </div>
              <div>
                <span style={{ color: '#0EA5E9' }}>T2:</span> {tierDistribution.typeCounts[2] || 0}
              </div>
              <div>
                <span style={{ color: '#8B5CF6' }}>T3:</span> {tierDistribution.typeCounts[3] || 0}
              </div>
              <div>
                <span style={{ color: '#06B6D4' }}>T4:</span> {tierDistribution.typeCounts[4] || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Platform Scale */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.6px', marginBottom: '6px' }}>
                PLATFORM SCALE & CAPACITY
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-title)', fontFamily: 'Plus Jakarta Sans' }}>
                {loading ? <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /> : `${platformScale.totalEmployees + platformScale.totalBranches}`}
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)', marginLeft: '6px' }}>Nodes</span>
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #A7F3D0' }}>
              <Activity size={20} />
            </div>
          </div>
          
          <div style={{ marginTop: 'auto', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                <Users size={13} color="#2563EB" />
                <span style={{ fontWeight: '700' }}>{platformScale.totalEmployees}</span> Staff
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                <Store size={13} color="#16A34A" />
                <span style={{ fontWeight: '700' }}>{platformScale.totalBranches}</span> Branches
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                <Building2 size={13} color="#7C3AED" />
                <span style={{ fontWeight: '700' }}>{platformScale.totalBusinesses}</span> Businesses
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                <ShieldCheck size={13} color="#059669" />
                <span style={{ color: '#059669', fontWeight: '600' }}>Live Sync</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Monthly Recurring Revenue */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.6px', marginBottom: '6px' }}>
                MONTHLY RECURRING REV (MRR)
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-title)', fontFamily: 'Plus Jakarta Sans' }}>
                {loading ? <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /> : `₹${Number(overview.totalMrr).toLocaleString()}`}
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #C7D2FE' }}>
              <Banknote size={20} />
            </div>
          </div>
          
          <div style={{ marginTop: 'auto', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>ARR:</span>
              <span style={{ fontWeight: '700', color: 'var(--text-title)' }}>₹{Number(overview.totalArr).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>ARPU: ₹{Number(overview.arpu).toLocaleString()}/tenant</span>
              <span>{overview.totalActive} active plans</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Quick Admin Actions Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)' }}>
              <Zap size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', margin: 0, fontWeight: '700', color: 'var(--text-title)' }}>Operational Shortcuts</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Instant management entry points</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px' }}>
            
            <button 
              style={{ padding: '16px', background: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s', cursor: 'pointer', textAlign: 'left' }} 
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary-blue)'; e.currentTarget.style.background = '#EFF6FF'; }} 
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = '#F8FAFC'; }} 
              onClick={() => navigate('/admin/customers/new')}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#EFF6FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #DBEAFE' }}>
                <PlusCircle size={22} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-title)' }}>Onboard Tenant</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Register new business client</div>
              </div>
            </button>
            
            <button 
              style={{ padding: '16px', background: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s', cursor: 'pointer', textAlign: 'left' }} 
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary-blue)'; e.currentTarget.style.background = '#EFF6FF'; }} 
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = '#F8FAFC'; }} 
              onClick={() => navigate('/admin/subscriptions')}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #BBF7D0' }}>
                <Banknote size={22} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-title)' }}>Manage Subscriptions</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Track plans, renewals & quotas</div>
              </div>
            </button>
            
            <button 
              style={{ padding: '16px', background: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s', cursor: 'pointer', textAlign: 'left' }} 
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary-blue)'; e.currentTarget.style.background = '#EFF6FF'; }} 
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = '#F8FAFC'; }} 
              onClick={() => navigate('/admin/customers')}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #DDD6FE' }}>
                <Building2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-title)' }}>Customer Directory</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Manage all client profiles</div>
              </div>
            </button>

            <button 
              style={{ padding: '16px', background: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s', cursor: 'pointer', textAlign: 'left' }} 
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary-blue)'; e.currentTarget.style.background = '#EFF6FF'; }} 
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = '#F8FAFC'; }} 
              onClick={() => navigate('/admin/pricing')}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #FDE68A' }}>
                <Settings size={22} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-title)' }}>Configure Pricing</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Tiers, quotas & fee models</div>
              </div>
            </button>

          </div>
        </div>

        {/* Recent Customers Table */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #DBEAFE' }}>
                <Building2 size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '17px', margin: '0 0 2px 0', fontWeight: '700', color: 'var(--text-title)' }}>Recent Customer Registrations</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>Latest client business tenants onboarded to the system</p>
              </div>
            </div>

            <button 
              onClick={() => navigate('/admin/customers')} 
              style={{ background: 'transparent', border: 'none', color: 'var(--primary-blue)', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#EFF6FF'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              View All {overview.totalTenants} Customers <ArrowUpRight size={16} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid var(--border-color)', background: '#F8FAFC' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Business Tenant</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Tier & Active Quota</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Registered</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                      <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px auto' }} />
                      <div>Loading dynamic customer telemetry...</div>
                    </td>
                  </tr>
                ) : recentCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                      <Building2 size={28} style={{ margin: '0 auto 10px auto', color: '#CBD5E1' }} />
                      <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '15px' }}>No customers onboarded yet</div>
                      <div style={{ fontSize: '13px', marginTop: '4px' }}>Get started by onboarding your first client business.</div>
                      <button 
                        className="btn-primary" 
                        onClick={() => navigate('/admin/customers/new')}
                        style={{ marginTop: '14px', fontSize: '13px' }}
                      >
                        <Plus size={16} /> Onboard First Customer
                      </button>
                    </td>
                  </tr>
                ) : (
                  recentCustomers.map((cust) => {
                    const typeInfo = getTypeInfo(cust.businessType);
                    const statusBadge = getStatusBadge(cust.subscriptionStatus);
                    return (
                      <tr 
                        key={cust._id} 
                        style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: '38px', 
                              height: '38px', 
                              borderRadius: '10px', 
                              background: typeInfo.bg, 
                              color: typeInfo.color, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontWeight: '700', 
                              fontSize: '13px',
                              border: `1px solid ${typeInfo.border}`,
                              flexShrink: 0
                            }}>
                              {getInitials(cust.businessName || cust.fullName)}
                            </div>
                            <div>
                              <div 
                                onClick={() => navigate(`/admin/customers/${cust._id}`)}
                                style={{ fontWeight: '700', color: 'var(--primary-blue)', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                              >
                                {cust.businessName}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{cust.userId}</span> &bull; {cust.city && cust.city !== 'N/A' ? `${cust.city} • ` : ''}{cust.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: typeInfo.bg, color: typeInfo.color, border: `1px solid ${typeInfo.border}` }}>
                            {typeInfo.label}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {cust.businessType === 1 && 'Owner-managed operations'}
                            {cust.businessType === 2 && `${cust.employeeCount || 0} Staff active`}
                            {cust.businessType === 3 && `${cust.branchCount || 0} Branches • ${cust.employeeCount || 0} Staff`}
                            {cust.businessType === 4 && `${cust.businessCount || 1} Biz • ${cust.branchCount || 0} Branches • ${cust.employeeCount || 0} Staff`}
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            <Clock size={14} color="#94A3B8" /> 
                            <span>{formatRelativeTime(cust.createdAt)}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {new Date(cust.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            padding: '4px 10px', 
                            borderRadius: '9999px', 
                            fontSize: '12px', 
                            fontWeight: '600', 
                            background: statusBadge.bg, 
                            color: statusBadge.text, 
                            border: `1px solid ${statusBadge.border}` 
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusBadge.dot }}></span>
                            {statusBadge.label}
                          </span>
                        </td>

                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button 
                            onClick={() => navigate(`/admin/customers/${cust._id}`)}
                            style={{ 
                              padding: '6px 12px', 
                              borderRadius: '6px', 
                              background: '#EFF6FF', 
                              border: '1px solid #DBEAFE', 
                              color: 'var(--primary-blue)', 
                              fontSize: '12px', 
                              fontWeight: '600', 
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#EFF6FF'}
                          >
                            Details <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
