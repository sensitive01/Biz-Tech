import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { exportToCSV } from '../utils/exportToCSV';
import { 
  CheckCircle2, 
  CreditCard, 
  Shield, 
  Download, 
  Sparkles, 
  CalendarDays, 
  Search, 
  ArrowUpRight, 
  FileText, 
  X, 
  Check, 
  Receipt, 
  DollarSign, 
  Calendar,
  AlertCircle
} from 'lucide-react';

const Billing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab = rawTab === 'subscriptions' ? 'subscriptions' : 'plan';

  const [searchInvoice, setSearchInvoice] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [upgradeModalPlan, setUpgradeModalPlan] = useState(null);

  // Static Available Plans Data
  const plans = [
    {
      id: 'starter',
      name: 'Starter Plan',
      tagline: 'Best for single-store retailers & small teams',
      price: 49,
      period: '/month',
      isCurrent: false,
      badge: null,
      features: [
        'Up to 5 Employees',
        '1 Business Location / Branch',
        'Standard Product & Inventory Catalog',
        'Basic Sales & Purchase Reports',
        'Email Support (48h response)',
        '1 GB Document Storage'
      ]
    },
    {
      id: 'professional',
      name: 'Professional Suite',
      tagline: 'Ideal for scaling multi-branch operations',
      price: 99,
      period: '/month',
      isCurrent: false,
      badge: 'POPULAR',
      features: [
        'Up to 25 Employees',
        'Up to 3 Branches / Warehouses',
        'Full Inventory & Stock Alerts',
        'Advanced Sales Analytics & CSV Export',
        'Live Chat & Priority Email Support',
        '10 GB Document Storage',
        'Customer & Supplier Management'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise Suite',
      tagline: 'Full-featured power for enterprise business',
      price: 199,
      period: '/month',
      isCurrent: true,
      badge: 'CURRENT ACTIVE PLAN',
      features: [
        'Unlimited Employees & Staff',
        'Up to 10 Branches / Warehouses',
        'Real-time Multi-tenant Sync',
        'Full Financial & Tax Invoicing',
        '24/7 Dedicated Priority Support',
        'Unlimited Document Storage',
        'Custom Reporting & Audit Logs',
        'Custom Roles & Granular Permissions'
      ]
    },
    {
      id: 'corporate',
      name: 'Ultimate Corporate',
      tagline: 'Custom infrastructure & dedicated services',
      price: 299,
      period: '/month',
      isCurrent: false,
      badge: 'MAXIMUM SCALE',
      features: [
        'Unlimited Everything',
        'Unlimited Branches & Franchises',
        'Dedicated Enterprise Account Manager',
        'Custom API Integrations & Webhooks',
        'Custom Domain & White-label Branding',
        '99.99% Guaranteed SLA Uptime',
        'Onboarding & Staff Training Included'
      ]
    }
  ];

  // Static Monthly Subscription Paid List Data
  const monthlyPaidHistory = [
    {
      id: 'INV-2026-10',
      period: 'October 2026',
      date: 'Oct 01, 2026',
      plan: 'Enterprise Suite',
      amount: '$199.00',
      method: 'Visa •••• 4242',
      status: 'Paid',
      transactionId: 'TXN-9842109'
    },
    {
      id: 'INV-2026-09',
      period: 'September 2026',
      date: 'Sep 01, 2026',
      plan: 'Enterprise Suite',
      amount: '$199.00',
      method: 'Visa •••• 4242',
      status: 'Paid',
      transactionId: 'TXN-8741021'
    },
    {
      id: 'INV-2026-08',
      period: 'August 2026',
      date: 'Aug 01, 2026',
      plan: 'Enterprise Suite',
      amount: '$199.00',
      method: 'Visa •••• 4242',
      status: 'Paid',
      transactionId: 'TXN-7631980'
    },
    {
      id: 'INV-2026-07',
      period: 'July 2026',
      date: 'Jul 01, 2026',
      plan: 'Enterprise Suite',
      amount: '$199.00',
      method: 'Visa •••• 4242',
      status: 'Paid',
      transactionId: 'TXN-6520843'
    },
    {
      id: 'INV-2026-06',
      period: 'June 2026',
      date: 'Jun 01, 2026',
      plan: 'Enterprise Suite',
      amount: '$199.00',
      method: 'Visa •••• 4242',
      status: 'Paid',
      transactionId: 'TXN-5419732'
    },
    {
      id: 'INV-2026-05',
      period: 'May 2026',
      date: 'May 01, 2026',
      plan: 'Enterprise Suite',
      amount: '$199.00',
      method: 'Visa •••• 4242',
      status: 'Paid',
      transactionId: 'TXN-4308621'
    },
    {
      id: 'INV-2026-04',
      period: 'April 2026',
      date: 'Apr 01, 2026',
      plan: 'Enterprise Suite',
      amount: '$199.00',
      method: 'Visa •••• 4242',
      status: 'Paid',
      transactionId: 'TXN-3297510'
    },
    {
      id: 'INV-2026-03',
      period: 'March 2026',
      date: 'Mar 01, 2026',
      plan: 'Enterprise Suite',
      amount: '$199.00',
      method: 'Visa •••• 4242',
      status: 'Paid',
      transactionId: 'TXN-2186409'
    },
    {
      id: 'INV-2026-02',
      period: 'February 2026',
      date: 'Feb 01, 2026',
      plan: 'Enterprise Suite',
      amount: '$199.00',
      method: 'Visa •••• 4242',
      status: 'Paid',
      transactionId: 'TXN-1075398'
    },
    {
      id: 'INV-2026-01',
      period: 'January 2026',
      date: 'Jan 01, 2026',
      plan: 'Enterprise Suite',
      amount: '$199.00',
      method: 'Visa •••• 4242',
      status: 'Paid',
      transactionId: 'TXN-0964287'
    }
  ];

  const filteredHistory = monthlyPaidHistory.filter(inv => 
    inv.id.toLowerCase().includes(searchInvoice.toLowerCase()) ||
    inv.period.toLowerCase().includes(searchInvoice.toLowerCase()) ||
    inv.date.toLowerCase().includes(searchInvoice.toLowerCase())
  );

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
          My Subscription & Billing
        </h1>
        <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
          Manage your subscription plans, explore available upgrade options, and review monthly payment history.
        </p>
      </div>

      {/* Tab Selector */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', marginBottom: '28px' }}>
        <button
          onClick={() => handleTabChange('plan')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'plan' ? '3px solid var(--primary-blue)' : '3px solid transparent',
            color: activeTab === 'plan' ? 'var(--primary-blue)' : '#64748B',
            fontWeight: activeTab === 'plan' ? '700' : '500',
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '-1px'
          }}
        >
          <Sparkles size={18} /> MY Plan → Upgrade Plan
        </button>

        <button
          onClick={() => handleTabChange('subscriptions')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'subscriptions' ? '3px solid var(--primary-blue)' : '3px solid transparent',
            color: activeTab === 'subscriptions' ? 'var(--primary-blue)' : '#64748B',
            fontWeight: activeTab === 'subscriptions' ? '700' : '500',
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '-1px'
          }}
        >
          <CalendarDays size={18} /> Plan Subscriptions (Monthly Paid list)
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MY PLAN & UPGRADE PLAN                            */}
      {/* ======================================================== */}
      {activeTab === 'plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Current Active Plan Banner Card */}
          <div style={{
            background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
            borderRadius: '16px',
            padding: '32px',
            color: 'white',
            boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px'
          }}>
            <div style={{ maxWidth: '600px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(4px)',
                borderRadius: '99px',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '0.5px',
                marginBottom: '12px'
              }}>
                <Check size={14} /> ACTIVE SUBSCRIPTION
              </div>
              <h2 style={{ fontSize: '30px', fontWeight: '800', margin: '0 0 8px 0', color: 'white' }}>Enterprise Suite</h2>
              <p style={{ margin: 0, fontSize: '15px', color: '#DBEAFE', lineHeight: '1.6' }}>
                You are currently on our top-tier business plan. Full access to all business modules, multi-branch operations, and priority support.
              </p>
              
              <div style={{ display: 'flex', gap: '24px', marginTop: '20px', flexWrap: 'wrap', fontSize: '13px', color: '#BFDBFE' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} /> Next Renewal: <strong>Nov 01, 2026</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={15} /> Card: <strong>Visa ending in 4242</strong>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              padding: '24px 28px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center',
              minWidth: '200px'
            }}>
              <div style={{ fontSize: '13px', color: '#BFDBFE', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Monthly Cost</div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: 'white', lineHeight: '1' }}>$199<span style={{ fontSize: '16px', fontWeight: '500', color: '#93C5FD' }}>/mo</span></div>
              <span style={{ display: 'inline-block', marginTop: '10px', fontSize: '12px', background: '#22C55E', color: 'white', padding: '3px 10px', borderRadius: '99px', fontWeight: '700' }}>
                Auto-Renew Active
              </span>
            </div>
          </div>

          {/* Section: Available Plans for Upgrade/Downgrade */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0' }}>
                Available Plans & Upgrades
              </h3>
              <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                Select an upgraded plan to unlock additional capacity, branches, or customized integrations.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              {plans.map((plan) => {
                const isCurrent = plan.isCurrent;
                return (
                  <div 
                    key={plan.id}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '28px 24px',
                      border: isCurrent ? '2px solid var(--primary-blue)' : '1px solid #E2E8F0',
                      boxShadow: isCurrent ? '0 10px 25px -5px rgba(37, 99, 235, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                  >
                    {plan.badge && (
                      <div style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: isCurrent ? 'var(--primary-blue)' : '#0F172A',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '4px 12px',
                        borderRadius: '99px',
                        letterSpacing: '0.5px'
                      }}>
                        {plan.badge}
                      </div>
                    )}

                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0' }}>{plan.name}</h4>
                      <p style={{ fontSize: '13px', color: '#64748B', margin: 0, minHeight: '36px' }}>{plan.tagline}</p>
                    </div>

                    <div style={{ margin: '12px 0 20px 0', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A' }}>${plan.price}</span>
                      <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>{plan.period}</span>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                      {plan.features.map((feat, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#334155' }}>
                          <CheckCircle2 size={16} color={isCurrent ? '#2563EB' : '#10B981'} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => !isCurrent && setUpgradeModalPlan(plan)}
                      disabled={isCurrent}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '10px',
                        fontWeight: '600',
                        fontSize: '14px',
                        border: 'none',
                        cursor: isCurrent ? 'default' : 'pointer',
                        background: isCurrent ? '#F1F5F9' : plan.id === 'corporate' ? '#0F172A' : 'var(--primary-blue)',
                        color: isCurrent ? '#64748B' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'opacity 0.2s'
                      }}
                    >
                      {isCurrent ? (
                        <>Current Plan</>
                      ) : (
                        <>
                          {plan.price > 199 ? 'Upgrade Now' : 'Switch Plan'} <ArrowUpRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method & Security Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="var(--primary-blue)" /> Payment Method
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '30px', background: '#1E293B', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '12px' }}>
                    VISA
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>Visa ending in 4242</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Expires 12/28 • Default Payment</div>
                  </div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: '6px' }}>
                  Active
                </span>
              </div>
              <button style={{ width: '100%', padding: '10px', background: 'white', border: '1px dashed #CBD5E1', borderRadius: '8px', color: 'var(--primary-blue)', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                + Add or Update Payment Card
              </button>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0F172A', marginBottom: '10px' }}>
                <Shield size={22} color="#16A34A" />
                <h4 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Encrypted & Secure Billing</h4>
              </div>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>
                All transactions are encrypted with 256-bit SSL protocols. Invoices and monthly payment records are maintained for tax and audit compliance.
              </p>
              <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                Questions? Contact billing at <span style={{ color: 'var(--primary-blue)', fontWeight: '500' }}>billing@biztech.com</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PLAN SUBSCRIPTIONS (MONTHLY PAID LIST)            */}
      {/* ======================================================== */}
      {activeTab === 'subscriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Top Summary Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', marginBottom: '6px' }}>Current Subscription</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A' }}>Enterprise Suite</div>
              <div style={{ fontSize: '12px', color: '#16A34A', fontWeight: '600', marginTop: '4px' }}>● Status: Active</div>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', marginBottom: '6px' }}>Monthly Rate</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A' }}>$199.00 / mo</div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Auto-billed on 1st of month</div>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', marginBottom: '6px' }}>Total Paid (2026 YTD)</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A' }}>$1,990.00</div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>10 Consecutive Monthly Invoices</div>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', marginBottom: '6px' }}>Next Due Date</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-blue)' }}>Nov 01, 2026</div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Amount: $199.00</div>
            </div>
          </div>

          {/* Search, Filter & Export Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '280px', flex: '0 1 340px' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by Invoice ID or Month..."
                value={searchInvoice}
                onChange={(e) => setSearchInvoice(e.target.value)}
                style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <button
              onClick={() => exportToCSV(monthlyPaidHistory, 'Monthly_Plan_Subscriptions')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                color: '#475569',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}
            >
              <Download size={15} /> Export Monthly Paid List
            </button>
          </div>

          {/* Monthly Paid List Table */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '60px' }}>S.No</th>
                    <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Invoice ID</th>
                    <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Billing Period</th>
                    <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Paid Date</th>
                    <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Plan Subscribed</th>
                    <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Amount</th>
                    <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Payment Method</th>
                    <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ padding: '48px 20px', textAlign: 'center', color: '#64748B' }}>
                        No subscription records found matching "{searchInvoice}"
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((item, index) => (
                      <tr 
                        key={item.id} 
                        style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#64748B', fontWeight: '500' }}>{index + 1}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: 'var(--primary-blue)', fontFamily: 'monospace' }}>
                          {item.id}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>{item.period}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#64748B' }}>{item.date}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#334155', fontWeight: '500' }}>
                          <span style={{ padding: '4px 8px', background: '#EFF6FF', color: '#1E40AF', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                            {item.plan}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{item.amount}</td>
                        <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748B' }}>{item.method}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#DCFCE7', color: '#166534', borderRadius: '99px', fontSize: '12px', fontWeight: '600' }}>
                            <Check size={12} /> {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedInvoice(item)}
                            title="View / Download Invoice"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              background: '#EFF6FF',
                              color: 'var(--primary-blue)',
                              borderRadius: '6px',
                              border: 'none',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <Download size={14} /> Invoice
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* INVOICE PREVIEW MODAL                                    */}
      {/* ======================================================== */}
      {selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={22} color="var(--primary-blue)" />
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#0F172A' }}>Monthly Subscription Invoice</h3>
              </div>
              <button onClick={() => setSelectedInvoice(null)} style={{ background: '#F1F5F9', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Invoice ID</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary-blue)', fontFamily: 'monospace' }}>{selectedInvoice.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Billing Month</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{selectedInvoice.period}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Payment Date</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{selectedInvoice.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Plan Subscribed</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{selectedInvoice.plan}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Transaction ID</span>
                <span style={{ fontSize: '13px', color: '#475569', fontFamily: 'monospace' }}>{selectedInvoice.transactionId}</span>
              </div>
              <div style={{ height: '1px', background: '#E2E8F0', margin: '12px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>Total Paid</span>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#16A34A' }}>{selectedInvoice.amount}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setSelectedInvoice(null)} 
                style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
              >
                Close
              </button>
              <button 
                onClick={() => {
                  alert(`Downloading Invoice ${selectedInvoice.id} (${selectedInvoice.period})...`);
                  setSelectedInvoice(null);
                }} 
                style={{ flex: 1, padding: '12px', background: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PLAN UPGRADE CONFIRMATION MODAL                          */}
      {/* ======================================================== */}
      {upgradeModalPlan && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '28px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <Sparkles size={28} color="var(--primary-blue)" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 8px 0', color: '#0F172A' }}>
              Switch to {upgradeModalPlan.name}?
            </h3>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 20px 0', lineHeight: '1.5' }}>
              Your account will be updated to the <strong>{upgradeModalPlan.name}</strong> at <strong>${upgradeModalPlan.price}/month</strong> starting next billing cycle.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setUpgradeModalPlan(null)} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert(`Plan changed successfully to ${upgradeModalPlan.name}!`);
                  setUpgradeModalPlan(null);
                }} 
                style={{ flex: 1, padding: '12px', background: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Confirm Switch
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Billing;
