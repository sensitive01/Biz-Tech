import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { exportToCSV } from '@/utils/exportToCSV';
import TablePagination from '@/components/TablePagination';
import { 
  CheckCircle2, 
  CreditCard, 
  Download, 
  Sparkles, 
  CalendarDays, 
  Search, 
  ArrowUpRight, 
  FileText, 
  X, 
  Check, 
  Receipt, 
  IndianRupee, 
  Calendar,
  AlertCircle,
  Printer,
  Clock,
  Loader2
} from 'lucide-react';
import SubscriptionRenewalModal from '@/components/SubscriptionRenewalModal';

const Billing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab = rawTab === 'subscriptions' ? 'subscriptions' : 'plan';

  const [searchInvoice, setSearchInvoice] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [upgradeModalPlan, setUpgradeModalPlan] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  // Real Subscription & Paid History States
  const [paidHistory, setPaidHistory] = useState([]);
  const [subscriptionSummary, setSubscriptionSummary] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [pricingTiers, setPricingTiers] = useState([]);

  const fetchMe = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const fresh = await res.json();
        setCurrentUser(fresh);
        localStorage.setItem('user', JSON.stringify(fresh));
      }
    } catch (e) {
      console.error('Failed to fetch profile in Billing:', e);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoadingHistory(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/my-subscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSubscriptionSummary(data.summary);
          setPaidHistory(data.history || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch subscriptions history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchPricing = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pricing`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPricingTiers(data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch pricing:', e);
    }
  };

  useEffect(() => {
    fetchMe();
    fetchSubscriptions();
    fetchPricing();
  }, []);

  useEffect(() => {
    if (activeTab === 'subscriptions') {
      fetchSubscriptions();
    }
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchInvoice, itemsPerPage]);

  // Real BizTech Pricing Tiers mapped with active user subscription
  const baseTiers = [
    {
      id: 'tier-1',
      tierNum: 1,
      name: 'Type 1: Sole Operator',
      tagline: '1 Owner • 1 Store • Single Login (Owner Managed)',
      price: 1000,
      annualPrice: 8400,
      features: [
        'Single Owner Admin Login',
        '1 Store / Shop Location',
        'Owner-Managed Staff Attendance & Leaves',
        'Products, Services & Barcode Inventory',
        'POS Counter Billing & Invoices',
        'Quotation Management for Bulk Orders',
        'Customer CRM, Purchases & Expenses'
      ]
    },
    {
      id: 'tier-2',
      tierNum: 2,
      name: 'Type 2: Single Branch + Staff',
      tagline: '1 Owner • 1 Store • Multi-Login with Staff Portals',
      price: 2000,
      annualPrice: 16800,
      badge: 'POPULAR',
      features: [
        'Multi-User Logins for Owner & Staff Members',
        '1 Store Location with Store Badge',
        'Dedicated Staff Portal for Attendance Clock In/Out',
        'Staff Leave & Permission Request Submission',
        'Formal Managerial Leave Approval Workflow',
        'Products, Services & Warehouse Stock Tracking',
        'POS Billing, Bulk Quotes & Barcode Scanner'
      ]
    },
    {
      id: 'tier-3',
      tierNum: 3,
      name: 'Type 3: Multi-Branch Enterprise',
      tagline: '1 Owner • Multiple Branches • Multi-Location Operations',
      price: 3000,
      annualPrice: 25200,
      badge: 'MULTI-BRANCH',
      features: [
        'Branches Module (Add & Manage Store Locations)',
        'Dedicated Branch Login Credentials & Managers',
        'Branch-Based Filtering Across All Reports & Data',
        'Investors Module (Equity Stakeholders & Audit Access)',
        'Cross-Branch Staff Allocation & Transfer',
        'Centralized Attendance & Leave Approvals',
        'Multi-Location Inventory, POS Billing & Purchases'
      ]
    },
    {
      id: 'tier-4',
      tierNum: 4,
      name: 'Type 4: Multi-Business Conglomerate',
      tagline: '1 Owner • Multiple Businesses • Multiple Branches',
      price: 4000,
      annualPrice: 33600,
      badge: 'ENTERPRISE SCALE',
      features: [
        'Businesses Module (Add Independent Corporate Entities & GSTINs)',
        '1-Click Business Switcher in Top Navigation Bar',
        'Conglomerate Branch Hierarchy (Map Branches to Businesses)',
        'Group & Individual Entity Investor Management',
        'Dedicated Business & Branch Login Credentials',
        'Unlimited Employees across Entire Conglomerate',
        'Unified Workforce, Group Consolidated Analytics & Reports'
      ]
    }
  ];

  const currentPlanName = (currentUser?.subscription?.planName || '').toLowerCase();
  const currentBusinessType = Number(currentUser?.businessType) || 1;

  const plans = baseTiers.map(t => {
    const matchedPricing = pricingTiers.find(p => 
      p.customerType?.toLowerCase().includes(`type ${t.tierNum}`) || 
      p.customerType?.toLowerCase().includes(`tier ${t.tierNum}`)
    );
    const price = matchedPricing ? matchedPricing.amount : t.price;
    const isCurrent = currentPlanName.includes(`type ${t.tierNum}`) || 
      currentPlanName.includes(`tier ${t.tierNum}`) || 
      (currentPlanName === '' && currentBusinessType === t.tierNum);

    return {
      ...t,
      price,
      period: '/month',
      isCurrent,
      badge: isCurrent ? 'CURRENT ACTIVE PLAN' : t.badge
    };
  });

  // Filter real payment invoices
  const filteredHistory = paidHistory.filter(inv => {
    const q = searchInvoice.toLowerCase();
    return (
      (inv.id && inv.id.toLowerCase().includes(q)) ||
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(q)) ||
      (inv.period && inv.period.toLowerCase().includes(q)) ||
      (inv.date && inv.date.toLowerCase().includes(q)) ||
      (inv.plan && inv.plan.toLowerCase().includes(q)) ||
      (inv.method && inv.method.toLowerCase().includes(q)) ||
      (inv.transactionId && inv.transactionId.toLowerCase().includes(q))
    );
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = filteredHistory.slice(startIndex, startIndex + itemsPerPage);

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  // Printable Invoice Generator
  const handlePrintInvoice = (invoice) => {
    if (!invoice) return;
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert('Please allow popups to view and print the invoice.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoice.id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0F172A; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #E2E8F0; padding-bottom: 24px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 800; color: #2563EB; }
            .inv-meta { text-align: right; }
            .inv-meta h1 { margin: 0 0 6px 0; font-size: 22px; color: #0F172A; }
            .inv-meta p { margin: 2px 0; color: #64748B; font-size: 13px; }
            .client-info { margin-bottom: 30px; }
            .client-info h4 { margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; color: #64748B; }
            .client-info p { margin: 2px 0; font-size: 15px; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #F8FAFC; padding: 12px 16px; text-align: left; font-size: 13px; text-transform: uppercase; color: #64748B; border-bottom: 1px solid #CBD5E1; }
            td { padding: 16px; border-bottom: 1px solid #E2E8F0; font-size: 14px; }
            .total-row { display: flex; justify-content: flex-end; margin-bottom: 40px; }
            .total-box { width: 280px; }
            .total-line { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
            .total-line.final { border-top: 2px solid #0F172A; font-size: 18px; font-weight: 800; color: #16A34A; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: 700; background: #DCFCE7; color: #166534; }
            .footer { border-top: 1px solid #E2E8F0; padding-top: 20px; font-size: 12px; color: #94A3B8; text-align: center; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">BizTech SaaS Platform</div>
              <p style="margin: 6px 0 0 0; color: #64748B; font-size: 13px;">Official Tax Invoice & Receipt</p>
            </div>
            <div class="inv-meta">
              <h1>INVOICE</h1>
              <p><strong>Invoice ID:</strong> ${invoice.id}</p>
              <p><strong>Date:</strong> ${invoice.date}</p>
              <p><strong>Status:</strong> <span class="badge">${invoice.status}</span></p>
            </div>
          </div>

          <div class="client-info">
            <h4>Billed To:</h4>
            <p>${currentUser?.businessName || currentUser?.fullName || 'Valued Customer'}</p>
            <p style="font-weight: 400; color: #475569;">${currentUser?.email || ''}</p>
            ${currentUser?.phone ? `<p style="font-weight: 400; color: #475569;">Phone: ${currentUser.phone}</p>` : ''}
            ${currentUser?.userId ? `<p style="font-weight: 400; color: #475569;">Tenant ID: ${currentUser.userId}</p>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Billing Cycle</th>
                <th>Payment Method</th>
                <th>Transaction / UTR</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${invoice.plan}</strong><br><span style="color: #64748B; font-size: 12px;">Period: ${invoice.period}</span></td>
                <td>${invoice.billingCycle || 'Monthly'}</td>
                <td>${invoice.method}</td>
                <td style="font-family: monospace;">${invoice.transactionId}</td>
                <td style="text-align: right; font-weight: 700;">${invoice.amount}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-row">
            <div class="total-box">
              <div class="total-line">
                <span>Subtotal</span>
                <span>${invoice.amount}</span>
              </div>
              <div class="total-line">
                <span>Tax (GST Included)</span>
                <span>₹0.00</span>
              </div>
              <div class="total-line final">
                <span>Total Paid</span>
                <span>${invoice.amount}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            Thank you for choosing BizTech. For questions, contact billing@biztech.com.
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
                background: currentUser?.subscriptionStatus === 'Expired' ? '#EF4444' : 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(4px)',
                borderRadius: '99px',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '0.5px',
                marginBottom: '12px'
              }}>
                <Check size={14} /> {currentUser?.subscriptionStatus === 'Expired' ? 'SUBSCRIPTION EXPIRED' : 'ACTIVE SUBSCRIPTION'}
              </div>
              <h2 style={{ fontSize: '30px', fontWeight: '800', margin: '0 0 8px 0', color: 'white' }}>
                {currentUser?.subscription?.planName || 'Standard Business Suite'}
              </h2>
              <p style={{ margin: 0, fontSize: '15px', color: '#DBEAFE', lineHeight: '1.6' }}>
                {currentUser?.subscription?.billingCycle === 'Annual'
                  ? 'Annual workspace subscription with 365 days of full management and operational access.'
                  : 'Monthly workspace subscription with 30 days of full management and operational access.'}
              </p>
              
              <div style={{ display: 'flex', gap: '24px', marginTop: '20px', flexWrap: 'wrap', fontSize: '13px', color: '#BFDBFE' }}>
                {currentUser?.subscription?.validUntil && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={15} /> Valid Until: <strong>{new Date(currentUser.subscription.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={15} /> Billing: <strong>{currentUser?.subscription?.billingCycle || 'Monthly'}</strong>
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
              minWidth: '220px'
            }}>
              <div style={{ fontSize: '13px', color: '#BFDBFE', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>
                {currentUser?.subscription?.billingCycle === 'Annual' ? 'Annual Cost' : 'Monthly Cost'}
              </div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: 'white', lineHeight: '1' }}>
                ₹{(currentUser?.subscription?.amount || 1000).toLocaleString()}
                <span style={{ fontSize: '16px', fontWeight: '500', color: '#93C5FD' }}>
                  /{currentUser?.subscription?.billingCycle === 'Annual' ? 'yr' : 'mo'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowRenewalModal(true)}
                style={{
                  marginTop: '16px',
                  width: '100%',
                  padding: '10px 16px',
                  background: 'white',
                  color: '#2563EB',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <Sparkles size={15} /> Repurchase / Renew Plan
              </button>
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
                      <span style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A' }}>₹{plan.price}</span>
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
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A' }}>
                {subscriptionSummary?.currentPlan || currentUser?.subscription?.planName || 'Standard Plan'}
              </div>
              <div style={{ fontSize: '12px', color: '#16A34A', fontWeight: '600', marginTop: '4px' }}>
                ● Status: {subscriptionSummary?.status || currentUser?.subscriptionStatus || 'Active'}
              </div>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', marginBottom: '6px' }}>Billing Rate</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A' }}>
                {subscriptionSummary?.monthlyRate || (currentUser?.subscription?.amount ? `₹${Number(currentUser.subscription.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} / ${currentUser.subscription?.billingCycle === 'Annual' ? 'yr' : 'mo'}` : '₹1,000.00 / mo')}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                {subscriptionSummary?.autoBilledNote || (currentUser?.subscription?.billingCycle === 'Annual' ? 'Auto-billed annually' : 'Auto-billed on 1st of month')}
              </div>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', marginBottom: '6px' }}>Total Paid</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A' }}>
                {subscriptionSummary?.totalPaidFormatted || (currentUser?.subscription?.amount ? `₹${Number(currentUser.subscription.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00')}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                {subscriptionSummary?.paidInvoicesNote || `${paidHistory.filter(i => i.status === 'Paid').length} Paid Invoices`}
              </div>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', marginBottom: '6px' }}>Next Due Date</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-blue)' }}>
                {subscriptionSummary?.nextDueDate || (currentUser?.subscriptionRenewalDate || currentUser?.subscription?.validUntil ? new Date(currentUser.subscriptionRenewalDate || currentUser.subscription?.validUntil).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A')}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                Amount: {subscriptionSummary?.nextDueAmountFormatted || (currentUser?.subscription?.amount ? `₹${Number(currentUser.subscription.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00')}
              </div>
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
              onClick={() => {
                const exportData = paidHistory.map(h => ({
                  'Invoice ID': h.id,
                  'Billing Period': h.period,
                  'Paid Date': h.date,
                  'Plan Subscribed': h.plan,
                  'Billing Cycle': h.billingCycle || 'Monthly',
                  'Amount Paid': h.amount,
                  'Payment Method': h.method,
                  'Transaction / UTR': h.transactionId,
                  'Status': h.status
                }));
                exportToCSV(exportData.length > 0 ? exportData : [{ 'Status': 'No Paid Invoices Recorded' }], 'My_Subscription_Paid_List');
              }}
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
                  {loadingHistory ? (
                    <tr>
                      <td colSpan="9" style={{ padding: '64px 20px', textAlign: 'center', color: '#64748B' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                          <Loader2 size={32} color="var(--primary-blue)" style={{ animation: 'spin 1s linear infinite' }} />
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>Loading payment history...</div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ padding: '64px 20px', textAlign: 'center', color: '#64748B' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                            <Receipt size={24} />
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A' }}>No Paid Invoices Found</div>
                          <div style={{ fontSize: '13px', color: '#64748B', maxWidth: '380px' }}>
                            {searchInvoice ? `No subscription records matching "${searchInvoice}".` : 'You have no recorded subscription payments yet. When you activate or renew your plan, your invoices and receipts will appear here.'}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedHistory.map((item, index) => {
                      const isPaid = item.status === 'Paid';
                      const isPending = item.status === 'Pending';
                      return (
                        <tr 
                          key={item._id || item.id} 
                          style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                        >
                          <td style={{ padding: '16px 20px', fontSize: '14px', color: '#64748B', fontWeight: '500' }}>{startIndex + index + 1}</td>
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
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              background: isPaid ? '#DCFCE7' : isPending ? '#FEF3C7' : '#FEE2E2',
                              color: isPaid ? '#166534' : isPending ? '#92400E' : '#991B1B',
                              borderRadius: '99px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {isPaid ? <Check size={12} /> : isPending ? <Clock size={12} /> : <AlertCircle size={12} />} {item.status}
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <TablePagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalItems={filteredHistory.length}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              itemName="invoices"
            />
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
                onClick={() => handlePrintInvoice(selectedInvoice)} 
                style={{ flex: 1, padding: '12px', background: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Printer size={16} /> Print / Save PDF
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
              Your account will be updated to the <strong>{upgradeModalPlan.name}</strong> at <strong>₹{upgradeModalPlan.price}/month</strong> starting next billing cycle.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setUpgradeModalPlan(null)} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                Cancel
              </button>
              <button 
                onClick={() => {
                  setUpgradeModalPlan(null);
                  setShowRenewalModal(true);
                }} 
                style={{ flex: 1, padding: '12px', background: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBSCRIPTION REPURCHASE / RENEWAL MODAL                  */}
      {/* ======================================================== */}
      <SubscriptionRenewalModal
        isOpen={showRenewalModal}
        onClose={() => setShowRenewalModal(false)}
        prefillEmailOrPhone={currentUser?.email || currentUser?.phone || ''}
        currentPlanId={currentUser?.subscription?.planId || (currentUser?.businessType ? `tier-${currentUser.businessType}` : 'tier-1')}
        currentPlanName={currentUser?.subscription?.planName || ''}
        businessType={currentUser?.businessType}
        onSuccess={(data) => {
          if (data?.user) setCurrentUser(data.user);
          setShowRenewalModal(false);
          fetchSubscriptions();
          fetchMe();
        }}
      />

    </div>
  );
};

export default Billing;