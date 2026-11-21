import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Check, 
  Copy, 
  Upload, 
  Loader2, 
  Sparkles, 
  QrCode, 
  CreditCard, 
  CheckCircle2, 
  FileText, 
  Trash2,
  AlertCircle,
  ShieldCheck,
  Lock
} from 'lucide-react';

const TIERS = [
  {
    id: 'tier-1',
    tierNum: 1,
    title: 'Tier 1: Sole Operator',
    monthlyBase: 1000,
    annualBase: 8400,
    desc: '1 Owner • 1 Shop • Direct billing & cashflow tools'
  },
  {
    id: 'tier-2',
    tierNum: 2,
    title: 'Tier 2: Single Branch + Staff',
    monthlyBase: 2000,
    annualBase: 16800,
    desc: '1 Owner • 1 Shop • Includes staff attendance & leaves'
  },
  {
    id: 'tier-3',
    tierNum: 3,
    title: 'Tier 3: Multi-Branch Enterprise',
    monthlyBase: 3000,
    annualBase: 25200,
    desc: '1 Owner • Multiple Branches • Full employee management'
  },
  {
    id: 'tier-4',
    tierNum: 4,
    title: 'Tier 4: Multi-Business Conglomerate',
    monthlyBase: 4000,
    annualBase: 33600,
    desc: '1 Owner • Multiple Businesses • Multi-branch scalability'
  }
];

const SubscriptionRenewalModal = ({
  isOpen,
  onClose,
  prefillEmailOrPhone = '',
  prefillPassword = '',
  currentPlanId = 'tier-1',
  onSuccess
}) => {
  if (!isOpen) return null;

  const [billingCycle, setBillingCycle] = useState('Monthly');
  const [selectedTierId, setSelectedTierId] = useState(currentPlanId || 'tier-1');
  const [paymentMethod, setPaymentMethod] = useState('upi_qr');
  
  const [emailOrPhone, setEmailOrPhone] = useState(prefillEmailOrPhone || '');
  const [password, setPassword] = useState(prefillPassword || '');

  // UPI QR states
  const [adminUpiId, setAdminUpiId] = useState('admin@okaxis');
  const [upiCopied, setUpiCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  // Sync prefill values
  useEffect(() => {
    if (prefillEmailOrPhone) setEmailOrPhone(prefillEmailOrPhone);
    if (prefillPassword) setPassword(prefillPassword);
  }, [prefillEmailOrPhone, prefillPassword]);

  // Fetch Admin active UPI ID
  useEffect(() => {
    const fetchActiveUpi = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/active-upi-qr`);
        if (res.ok) {
          const data = await res.json();
          if (data.upiId) setAdminUpiId(data.upiId);
        }
      } catch (err) {
        console.error('Failed to fetch UPI QR details:', err);
      }
    };
    fetchActiveUpi();
  }, []);

  const selectedTier = TIERS.find(t => t.id === selectedTierId) || TIERS[0];
  const isAnnual = billingCycle === 'Annual';
  const baseRate = isAnnual ? selectedTier.annualBase : selectedTier.monthlyBase;
  const gstAmount = Math.round(baseRate * 0.18);
  const grandTotal = baseRate + gstAmount;

  const handleProofChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('Proof file size exceeds 15MB limit.');
      return;
    }
    setProofFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setProofPreview(ev.target?.result);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  };

  const handleUpiSubmission = async (e) => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('token');
    if (!token && (!emailOrPhone.trim() || !password.trim())) {
      setError('Please provide your registered email/phone and password to verify your account.');
      return;
    }

    const cleanUtr = (utrNumber || '').trim();
    if (!cleanUtr || cleanUtr.length < 8) {
      setError('Please enter a valid 12-digit UPI UTR / Transaction Reference Number.');
      return;
    }

    if (!proofFile) {
      setError('Please upload your UPI payment screenshot or receipt.');
      return;
    }

    try {
      setLoading(true);

      // 1. Upload proof file to Cloudinary
      const formData = new FormData();
      formData.append('proof', proofFile);
      const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/upload-proof`, {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.message || 'Failed to upload receipt screenshot');
      }

      // 2. Submit renewal request
      const payload = {
        emailOrPhone: emailOrPhone.trim(),
        password: password.trim(),
        planId: selectedTier.id,
        planName: selectedTier.title,
        billingCycle,
        amount: grandTotal,
        paymentMethod: 'UPI (Admin QR)',
        transactionId: cleanUtr,
        paymentProof: {
          utrNumber: cleanUtr,
          proofUrl: uploadData.fileUrl,
          originalFileName: uploadData.originalName || proofFile.name
        }
      };

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/renew-plan`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Renewal request failed');
      }

      setSuccessInfo({
        isPendingApproval: true,
        message: data.message || 'Your renewal payment proof has been submitted! Platform admin will verify and reactivate your workspace.'
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayRenewal = async () => {
    setError('');

    const token = localStorage.getItem('token');
    if (!token && (!emailOrPhone.trim() || !password.trim())) {
      setError('Please provide your registered email/phone and password to verify your account.');
      return;
    }

    setLoading(true);

    const loadScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const isLoaded = await loadScript();
    if (!isLoaded) {
      setError('Failed to load Razorpay payment gateway. Please check your internet connection.');
      setLoading(false);
      return;
    }

    try {
      // 1. Create order
      const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotal,
          currency: 'INR',
          receipt: `renew_${Date.now()}`,
          notes: {
            plan: selectedTier.title,
            cycle: billingCycle
          }
        })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.order) {
        throw new Error(orderData.message || 'Failed to initiate Razorpay checkout order');
      }

      // 2. Open Razorpay options
      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'BizTech Workspace Renewal',
        description: `${selectedTier.title} (${billingCycle} Plan)`,
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            setLoading(true);
            const renewPayload = {
              emailOrPhone: emailOrPhone.trim(),
              password: password.trim(),
              planId: selectedTier.id,
              planName: selectedTier.title,
              billingCycle,
              amount: grandTotal,
              paymentMethod: 'Razorpay',
              transactionId: response.razorpay_payment_id,
              razorpayPayment: response
            };

            const renewHeaders = { 'Content-Type': 'application/json' };
            if (token) renewHeaders['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/renew-plan`, {
              method: 'POST',
              headers: renewHeaders,
              body: JSON.stringify(renewPayload)
            });
            const data = await res.json();
            if (!res.ok) {
              throw new Error(data.message || 'Payment completed but workspace activation failed');
            }

            if (data.token) {
              localStorage.setItem('token', data.token);
              localStorage.setItem('user', JSON.stringify(data.user));
              localStorage.setItem('tenantType', (data.user.businessType || 1).toString());
              localStorage.setItem('modules', JSON.stringify(data.user.modules || []));
            }

            setSuccessInfo({
              isReactivated: true,
              message: data.message || 'Workspace subscription reactivated successfully!'
            });

            if (onSuccess) onSuccess(data);
          } catch (renewErr) {
            console.error('Renewal activation error:', renewErr);
            setError(renewErr.message);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          contact: emailOrPhone
        },
        theme: {
          color: '#2563EB'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (failResp) => {
        setError(`Payment failed: ${failResp.error?.description || 'Transaction cancelled'}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Razorpay flow error:', err);
      setError(err.message || 'Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '840px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'white',
          zIndex: 10
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', color: '#2563EB', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
              <ShieldCheck size={13} /> Workspace Subscription
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Repurchase / Renew Subscription Plan
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Success Notification */}
          {successInfo ? (
            <div style={{
              background: successInfo.isReactivated ? '#F0FDF4' : '#FFFBEB',
              border: successInfo.isReactivated ? '1.5px solid #86EFAC' : '1.5px solid #FCD34D',
              borderRadius: '16px',
              padding: '28px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: successInfo.isReactivated ? '#DCFCE7' : '#FEF3C7',
                color: successInfo.isReactivated ? '#16A34A' : '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                {successInfo.isReactivated ? 'Workspace Reactivated!' : 'Payment Submitted for Verification'}
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', maxWidth: '520px', margin: '0 auto 20px' }}>
                {successInfo.message}
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (successInfo.isReactivated) {
                    window.location.href = '/tenant/dashboard';
                  }
                }}
                style={{
                  padding: '12px 28px',
                  background: '#2563EB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                {successInfo.isReactivated ? 'Go to Workspace Dashboard' : 'Got it, Close'}
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: '#DC2626',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {/* Billing Cycle Switch */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  display: 'inline-flex',
                  background: '#F1F5F9',
                  padding: '4px',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0'
                }}>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('Monthly')}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      background: billingCycle === 'Monthly' ? '#2563EB' : 'transparent',
                      color: billingCycle === 'Monthly' ? 'white' : '#64748B',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Monthly (30 Days)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('Annual')}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      background: billingCycle === 'Annual' ? '#2563EB' : 'transparent',
                      color: billingCycle === 'Annual' ? 'white' : '#64748B',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    Annual (365 Days)
                    <span style={{
                      fontSize: '10px',
                      background: '#16A34A',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontWeight: '800'
                    }}>
                      Save 30%
                    </span>
                  </button>
                </div>
              </div>

              {/* Tier Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px'
              }}>
                {TIERS.map(tier => {
                  const isSelected = selectedTierId === tier.id;
                  const price = isAnnual ? tier.annualBase : tier.monthlyBase;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTierId(tier.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '14px',
                        border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                        background: isSelected ? '#EFF6FF' : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: isSelected ? '#2563EB' : '#475569' }}>
                            {tier.title}
                          </span>
                          {isSelected && <CheckCircle2 size={16} color="#2563EB" />}
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                          ₹{price.toLocaleString()}
                          <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748B' }}>
                            /{isAnnual ? 'yr' : 'mo'}
                          </span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#64748B', margin: 0, lineHeight: '1.4' }}>
                          {tier.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '16px 20px',
                fontSize: '13px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748B' }}>
                    {selectedTier.title} ({billingCycle} • {isAnnual ? '1 Year / 365 Days' : '1 Month / 30 Days'})
                  </span>
                  <span style={{ fontWeight: '600', color: '#0F172A' }}>₹{baseRate.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#64748B' }}>Goods & Services Tax (GST 18%)</span>
                  <span style={{ fontWeight: '600', color: '#0F172A' }}>₹{gstAmount.toLocaleString()}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #CBD5E1',
                  paddingTop: '10px',
                  fontWeight: '800',
                  fontSize: '15px'
                }}>
                  <span style={{ color: '#0F172A' }}>Total Amount Payable:</span>
                  <span style={{ color: '#2563EB', fontSize: '18px' }}>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Credentials / Verification entry if not logged in */}
              {!localStorage.getItem('token') && (
                <div style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '12px'
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Registered Email or Phone <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter registered email or phone"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: 'white', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Account Password <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Enter account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: 'white', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '10px', textTransform: 'uppercase' }}>
                  Select Payment Method
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div
                    onClick={() => setPaymentMethod('upi_qr')}
                    style={{
                      border: paymentMethod === 'upi_qr' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      background: paymentMethod === 'upi_qr' ? '#EFF6FF' : 'white',
                      padding: '14px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <QrCode size={20} color="#2563EB" />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#0F172A' }}>Instant UPI QR</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>GPay, PhonePe, Paytm</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('razorpay')}
                    style={{
                      border: paymentMethod === 'razorpay' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      background: paymentMethod === 'razorpay' ? '#EFF6FF' : 'white',
                      padding: '14px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <CreditCard size={20} color="#16A34A" />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#0F172A' }}>Razorpay Checkout</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Cards, Netbanking, Wallet</div>
                    </div>
                  </div>
                </div>

                {/* Method 1: UPI QR Details */}
                {paymentMethod === 'upi_qr' && (
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '20px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '10px' }}>
                      Scan QR & Pay: <span style={{ color: '#2563EB', fontSize: '16px' }}>₹{grandTotal.toLocaleString()}</span>
                    </div>

                    <div style={{
                      display: 'inline-block',
                      background: 'white',
                      padding: '14px',
                      borderRadius: '14px',
                      border: '1px solid #CBD5E1',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      marginBottom: '10px'
                    }}>
                      <QRCodeSVG
                        value={`upi://pay?pa=${adminUpiId}&pn=BizTech%20Platform&am=${grandTotal}&cu=INR&tn=Renewal%20${encodeURIComponent(selectedTier.title)}`}
                        size={160}
                        level="H"
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>
                      <span>Platform UPI ID:</span>
                      <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>{adminUpiId}</strong>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(adminUpiId);
                          setUpiCopied(true);
                          setTimeout(() => setUpiCopied(false), 2000);
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: upiCopied ? '#16A34A' : '#2563EB' }}
                      >
                        {upiCopied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>

                    <div style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                          12-Digit UPI Reference / UTR Number <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 432109876543"
                          maxLength={22}
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9A-Za-z]/g, ''))}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: 'white', boxSizing: 'border-box', fontFamily: 'monospace', fontWeight: '700' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                          Payment Receipt Screenshot <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        {!proofFile ? (
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '12px',
                            border: '1.5px dashed #94A3B8',
                            borderRadius: '8px',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#475569'
                          }}>
                            <Upload size={16} color="#2563EB" /> Click to attach receipt screenshot (Max 15MB)
                            <input type="file" accept="image/*,.pdf" onChange={handleProofChange} style={{ display: 'none' }} />
                          </label>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'white', border: '1px solid #86EFAC', borderRadius: '8px', fontSize: '12px' }}>
                            <span style={{ color: '#16A34A', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <CheckCircle2 size={14} /> {proofFile.name}
                            </span>
                            <button type="button" onClick={() => { setProofFile(null); setProofPreview(null); }} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleUpiSubmission}
                        disabled={loading}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: '#2563EB',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '14px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          marginTop: '4px'
                        }}
                      >
                        {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : 'Submit Payment Proof & Renew'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Method 2: Razorpay Details */}
                {paymentMethod === 'razorpay' && (
                  <div style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                      Instant Workspace Activation
                    </div>
                    <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                      Pay safely via UPI, Debit/Credit Card, Net Banking, or Wallets. Your workspace access will be activated immediately.
                    </p>
                    <button
                      type="button"
                      onClick={handleRazorpayRenewal}
                      disabled={loading}
                      style={{
                        padding: '12px 28px',
                        background: '#16A34A',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '14px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing Checkout...</> : `Pay ₹${grandTotal.toLocaleString()} with Razorpay`}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SubscriptionRenewalModal;
