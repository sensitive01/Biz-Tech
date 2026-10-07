import React from 'react';
import { CheckCircle2, CreditCard, Clock, Shield } from 'lucide-react';

const Billing = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-title)' }}>My Subscription & Billing</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
        {/* Left Column - Current Plan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', background: 'var(--badge-type2-bg)', color: 'var(--badge-type2-text)', borderRadius: '99px', fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>
                  ACTIVE PLAN
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-title)', margin: '0 0 8px 0' }}>Enterprise Suite</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>All modules included. Perfect for growing businesses.</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-title)' }}>$199<span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: '500' }}>/mo</span></div>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--border-color)', margin: '24px 0' }}></div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {['Unlimited Employees', 'Advanced Analytics', 'Multi-Branch Support', 'Priority 24/7 Support', 'Custom Reporting', 'API Access'].map((feature, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-title)', fontSize: '14px', fontWeight: '500' }}>
                  <CheckCircle2 size={18} color="#10B981" /> {feature}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
              <button style={{ padding: '10px 20px', background: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                Upgrade Plan
              </button>
              <button style={{ padding: '10px 20px', background: 'white', color: '#EF4444', border: '1px solid #FECACA', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                Cancel Subscription
              </button>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-title)', margin: '0 0 20px 0' }}>Billing History</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '13px' }}>Date</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '13px' }}>Amount</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '13px' }}>Status</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '13px' }}>Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: 'Oct 01, 2026', amount: '$199.00', status: 'Paid' },
                    { date: 'Sep 01, 2026', amount: '$199.00', status: 'Paid' },
                    { date: 'Aug 01, 2026', amount: '$199.00', status: 'Paid' },
                  ].map((inv, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '16px 8px', fontSize: '14px', color: 'var(--text-title)', fontWeight: '500' }}>{inv.date}</td>
                      <td style={{ padding: '16px 8px', fontSize: '14px', color: 'var(--text-title)' }}>{inv.amount}</td>
                      <td style={{ padding: '16px 8px' }}>
                        <span style={{ display: 'inline-flex', padding: '4px 8px', background: '#DCFCE7', color: '#166534', borderRadius: '99px', fontSize: '12px', fontWeight: '600' }}>{inv.status}</span>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <button style={{ color: 'var(--primary-blue)', background: 'none', border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Download</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Payment Method */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-title)', margin: '0 0 20px 0' }}>Payment Method</h4>
            
            <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '32px', background: '#F1F5F9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={20} color="var(--text-secondary)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-title)' }}>Visa ending in 4242</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Expires 12/28</p>
              </div>
            </div>

            <button style={{ width: '100%', padding: '10px', background: 'transparent', color: 'var(--primary-blue)', border: '1px dashed var(--primary-blue)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
              + Add Payment Method
            </button>
          </div>

          <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-title)' }}>
              <Shield size={20} />
              <h4 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Secure Checkout</h4>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Your payment information is securely processed. We never store your full credit card details on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
