import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Package, Wrench, Boxes, FileText, CheckCircle2, 
  ArrowRight, ArrowLeft, QrCode, CreditCard, ShieldCheck, 
  Upload, Check, AlertCircle, Loader2, Sparkles, RefreshCw, X, Menu, Copy,
  Plus, Trash2, Send, Clock, AlertTriangle, Eye, Landmark
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import ThemeToggle from '@/components/ThemeToggle';

// Business Categories
const BUSINESS_CATEGORIES = [
  { id: 'manufacturing', label: 'Manufacturing', desc: 'Factories, production units, assembly, custom fabrication' },
  { id: 'distributor', label: 'Distributor / Wholesaler', desc: 'Stockists, bulk supply chain, B2B wholesale dealers' },
  { id: 'retail', label: 'Retail Storefront', desc: 'Shops, supermarkets, boutiques, showrooms, commercial outlets' },
  { id: 'others', label: 'Others (Specify)', desc: 'Custom business model or specialized industry' }
];

// Industry Sub-Categories
const SUB_CATEGORIES = [
  'Automobile & Spare Parts',
  'Grocery & Provisions',
  'Supermarket & Departmental',
  'Electronics & Electrical Appliances',
  'Fashion, Apparel & Footwear',
  'Pharmacy, Medical & Healthcare',
  'Hardware, Sanitary & Construction',
  'Restaurant, Cafe & Food Services',
  'Professional, IT & Consulting Services',
  'Others'
];

const ONBOARDING_STEPS = [
  { id: 'business', title: 'Register Business', desc: 'Legal entity & address' },
  { id: 'offering', title: 'Products & Services', desc: 'Select revenue model' },
  { id: 'category', title: 'Business Category', desc: 'Operational tier' },
  { id: 'subcategory', title: 'Industry Sub-Category', desc: 'Specific market segment' },
  { id: 'documents', title: 'Documentations', desc: 'Statutory compliance' },
  { id: 'plan_payment', title: 'Plan & Payment', desc: 'Select tier & activate' }
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Business Info State
  const [businessInfo, setBusinessInfo] = useState(() => {
    let defaultOwner = '';
    let defaultEmail = '';
    let defaultPhone = '';
    try {
      const stored = JSON.parse(localStorage.getItem('user'));
      if (stored) {
        defaultOwner = stored.fullName || '';
        defaultEmail = stored.email || '';
        defaultPhone = stored.phone || '';
      }
    } catch (e) {}

    return {
      name: '',
      brandName: '',
      ownerName: defaultOwner,
      panNumber: '',
      gstNumber: '',
      regNo: '',
      phone: defaultPhone,
      email: defaultEmail,
      address: '',
      city: '',
      state: '',
      pincode: ''
    };
  });

  const [panChecking, setPanChecking] = useState(false);
  const [panCheckResult, setPanCheckResult] = useState(null);

  // 2. Offering Selection State ('product', 'service', 'both')
  const [offeringType, setOfferingType] = useState('product');

  // 3. Category State
  const [category, setCategory] = useState('retail');
  const [customCategory, setCustomCategory] = useState('');

  // 4. Sub-Category State
  const [subCategory, setSubCategory] = useState('Grocery & Provisions');
  const [customSubCategory, setCustomSubCategory] = useState('');

  // 5. Documentations State
  const [documents, setDocuments] = useState({
    pan: '',
    gstin: '',
    msme: '',
    fssai: '',
    tradeLicense: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [customDocuments, setCustomDocuments] = useState([]);

  // 6. Plan & Payment State
  const [pricingPlans, setPricingPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('Type 2: Single Branch + Staff');
  const [billingCycle, setBillingCycle] = useState('Monthly'); // 'Monthly' | 'Annual'
  const [paymentMethod, setPaymentMethod] = useState('upi_qr'); // 'upi_qr' | 'razorpay' | 'trial'
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayTab, setRazorpayTab] = useState('card');
  const [upiVerified, setUpiVerified] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [adminUpiId, setAdminUpiId] = useState('biztech@upi');
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_U18JZ6gYj3ozhP');
  const [upiCopied, setUpiCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [submittedApprovalData, setSubmittedApprovalData] = useState(null);

  const handleProofFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      setError('');
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProofPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setProofPreview(null);
      }
    }
  };

  // Fetch Payment Configuration (Admin UPI ID & Razorpay Public Key)
  useEffect(() => {
    const fetchPaymentConfig = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/config`);
        if (res.ok) {
          const data = await res.json();
          if (data.upiId) setAdminUpiId(data.upiId);
          if (data.razorpayKeyId) setRazorpayKeyId(data.razorpayKeyId);
        }
      } catch (err) {
        console.error('Error fetching payment config:', err);
      }
    };
    fetchPaymentConfig();
  }, []);

  // Prefill initial user contact details if logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserStr = localStorage.getItem('user');
    if (!token && !storedUserStr) {
      navigate('/register', { replace: true });
      return;
    }

    try {
      if (storedUserStr) {
        const u = JSON.parse(storedUserStr);
        setBusinessInfo(prev => ({
          ...prev,
          name: u.businessName || prev.name,
          email: u.email || prev.email,
          phone: u.phone || prev.phone,
          address: u.address || prev.address
        }));
        if (u.offeringType) setOfferingType(u.offeringType);
        if (u.category) setCategory(u.category);
        if (u.subCategory) setSubCategory(u.subCategory);
      }
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
  }, [navigate]);

  // Fetch Pricing Plans
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pricing`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPricingPlans(data);
          }
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
      }
    };
    fetchPricing();
  }, []);

  const defaultPlans = [
    { title: 'Type 1: Sole Operator', amount: 1000, desc: '1 Owner • 1 Shop • Basic billing & inventory' },
    { title: 'Type 2: Single Branch + Staff', amount: 2000, desc: '1 Store • Staff attendance • Barcode POS' },
    { title: 'Type 3: Multi-Branch Enterprise', amount: 3000, desc: 'Multiple branches • Inter-store stock transfers' },
    { title: 'Type 4: Multi-Business Conglomerate', amount: 4000, desc: 'Multiple businesses • Holding rollups' }
  ];

  const getPlanDetails = (title) => {
    const plan = pricingPlans.find(p => p.customerType === title);
    const defaultP = defaultPlans.find(p => p.title === title) || defaultPlans[1];
    const monthlyBase = plan ? Number(plan.amount) : defaultP.amount;
    const discountPercent = (plan && typeof plan.annualDiscountPercent === 'number') ? plan.annualDiscountPercent : 0;
    const fullAnnual = monthlyBase * 12;

    if (billingCycle === 'Annual') {
      const discountedAnnual = discountPercent > 0 
        ? Math.round(fullAnnual * (1 - discountPercent / 100))
        : fullAnnual;
      return {
        title,
        desc: plan?.description || defaultP.desc,
        monthlyAmount: monthlyBase,
        fullAnnual,
        discountPercent,
        savings: fullAnnual - discountedAnnual,
        amount: discountedAnnual,
        isAnnual: true
      };
    }

    return {
      title,
      desc: plan?.description || defaultP.desc,
      monthlyAmount: monthlyBase,
      fullAnnual,
      discountPercent,
      savings: 0,
      amount: monthlyBase,
      isAnnual: false
    };
  };

  const activePlan = getPlanDetails(selectedPlanId);
  const taxAmount = Math.round(activePlan.amount * 0.18);
  const grandTotal = activePlan.amount + taxAmount;

  // File upload simulation handler
  const handleFileUpload = (docKey, e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [docKey]: file.name
      }));
    }
  };

  // Custom Document Handlers
  const handleAddCustomDoc = () => {
    setCustomDocuments(prev => [
      ...prev,
      { id: Date.now(), name: '', number: '', fileName: '' }
    ]);
  };

  const handleRemoveCustomDoc = (id) => {
    setCustomDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const updateCustomDoc = (id, field, value) => {
    setCustomDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, [field]: value } : doc
    ));
  };

  const handleCustomFileUpload = (id, e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomDocuments(prev => prev.map(doc => 
        doc.id === id ? { ...doc, fileName: file.name } : doc
      ));
    }
  };

  // PAN Check Handler
  const checkPanAvailability = async (pan) => {
    if (!pan || pan.length !== 10) return;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan)) {
      setPanCheckResult({ checked: true, exists: true, message: 'Invalid format (Must be 5 capital letters, 4 digits, 1 capital letter, e.g. ABCDE1234F)' });
      return;
    }

    try {
      setPanChecking(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/check-pan?pan=${encodeURIComponent(pan)}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (!res.ok || data.exists) {
        setPanCheckResult({ checked: true, exists: true, message: data.message || `The PAN card number ${pan} is already registered.` });
      } else {
        setPanCheckResult({ checked: true, exists: false, message: 'PAN is available and unique.' });
      }
    } catch (err) {
      console.error('PAN check error:', err);
    } finally {
      setPanChecking(false);
    }
  };

  // Step Validation
  const validateCurrentStep = () => {
    setError('');
    if (currentStep === 0) {
      if (!businessInfo.name.trim()) {
        setError('Please enter your business or legal company name.');
        return false;
      }
      if (!businessInfo.ownerName || !businessInfo.ownerName.trim()) {
        setError('Business Owner Name is mandatory. Please enter the owner name.');
        return false;
      }
      if (!businessInfo.panNumber || !businessInfo.panNumber.trim()) {
        setError('PAN Card Number is mandatory. Please enter your business PAN.');
        return false;
      }
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      const cleanPan = businessInfo.panNumber.trim().toUpperCase();
      if (!panRegex.test(cleanPan)) {
        setError('Invalid PAN format. Must be 10 characters (5 capital letters, 4 digits, 1 capital letter, e.g. ABCDE1234F).');
        return false;
      }
      if (panCheckResult?.exists) {
        setError(panCheckResult.message || `The PAN card number ${cleanPan} is already registered with another business.`);
        return false;
      }
      if (businessInfo.gstNumber && businessInfo.gstNumber.trim()) {
        const cleanGst = businessInfo.gstNumber.trim().toUpperCase();
        if (cleanGst.length !== 15) {
          setError('GST Number should be 15 alphanumeric characters (e.g. 29ABCDE1234F1Z5).');
          return false;
        }
      }
      if (!businessInfo.phone.trim() || businessInfo.phone.length < 10) {
        setError('Please enter a valid 10-digit phone number.');
        return false;
      }
      if (!businessInfo.email.trim() || !businessInfo.email.includes('@')) {
        setError('Please enter a valid business email.');
        return false;
      }
      if (!businessInfo.address.trim()) {
        setError('Please enter your street address.');
        return false;
      }
      if (!businessInfo.city.trim() || !businessInfo.state.trim() || !businessInfo.pincode.trim()) {
        setError('Please complete city, state, and pincode.');
        return false;
      }
    } else if (currentStep === 2) {
      if (category === 'others' && !customCategory.trim()) {
        setError('Please specify your custom category.');
        return false;
      }
    } else if (currentStep === 3) {
      if (subCategory === 'Others' && !customSubCategory.trim()) {
        setError('Please specify your industry segment.');
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    // Verify PAN uniqueness on step 0
    if (currentStep === 0) {
      const cleanPan = businessInfo.panNumber.trim().toUpperCase();
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/check-pan?pan=${encodeURIComponent(cleanPan)}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (!res.ok || data.exists) {
          setError(data.message || `This PAN Card Number (${cleanPan}) is already registered with another business. Please use a unique PAN.`);
          setPanCheckResult({ checked: true, exists: true, message: data.message });
          setLoading(false);
          return;
        }
        setPanCheckResult({ checked: true, exists: false, message: 'PAN is available and unique.' });
      } catch (err) {
        console.error('PAN verification error:', err);
      } finally {
        setLoading(false);
      }

      // Sync with documents
      setDocuments(prev => ({ 
        ...prev, 
        pan: cleanPan,
        gstin: (businessInfo.gstNumber || '').trim().toUpperCase() || prev.gstin
      }));
    }

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Final Onboarding Completion
  const handleCompleteOnboarding = async (paymentOverride = null, txnIdOverride = null, paymentProofPayload = null) => {
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    const selectedFinalCategory = category === 'others' ? (customCategory.trim() || 'General Business') : category;
    const selectedFinalSubCategory = subCategory === 'Others' ? (customSubCategory.trim() || 'General Trade') : subCategory;

    // Determine active operational modules according to offeringType
    const modules = ['sales', 'expenses', 'customers'];
    if (offeringType === 'product' || offeringType === 'both') {
      modules.push('products_services', 'inventory', 'purchases');
    }
    if (offeringType === 'service' || offeringType === 'both' || offeringType === 'institution') {
      if (!modules.includes('products_services')) modules.push('products_services');
    }

    const resolvedMethod = paymentOverride || paymentMethod;

    const cleanPan = (businessInfo.panNumber || '').trim().toUpperCase();
    const cleanGst = (businessInfo.gstNumber || '').trim().toUpperCase();
    const cleanOwner = (businessInfo.ownerName || '').trim();

    const payload = {
      panNumber: cleanPan,
      ownerName: cleanOwner,
      gstNumber: cleanGst,
      singleBusiness: {
        name: businessInfo.name,
        brandName: businessInfo.brandName,
        ownerName: cleanOwner,
        contactPerson: cleanOwner,
        panNumber: cleanPan,
        gstNumber: cleanGst,
        taxNumber: cleanGst,
        regNo: businessInfo.regNo,
        phone: businessInfo.phone,
        email: businessInfo.email,
        address: `${businessInfo.address}, ${businessInfo.city}, ${businessInfo.state} - ${businessInfo.pincode}`
      },
      businessName: businessInfo.name,
      address: `${businessInfo.address}, ${businessInfo.city}, ${businessInfo.state} - ${businessInfo.pincode}`,
      regNo: businessInfo.regNo,
      phone: businessInfo.phone,
      offeringType,
      businessOfferingType: offeringType,
      category: selectedFinalCategory,
      subCategory: selectedFinalSubCategory,
      documents: {
        ...documents,
        pan: cleanPan,
        gstin: cleanGst || documents.gstin,
        customDocuments: customDocuments.filter(d => d.name.trim() || d.number.trim() || d.fileName)
      },
      modules,
      subscription: {
        planId: selectedPlanId,
        planName: activePlan.title,
        amount: grandTotal,
        billingCycle,
        paymentMethod: resolvedMethod,
        paymentStatus: paymentProofPayload ? 'Pending Approval' : 'Active',
        transactionId: txnIdOverride || `TXN-${Date.now()}`
      }
    };

    if (paymentProofPayload) {
      payload.paymentProof = paymentProofPayload;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to complete onboarding');
      }

      if (data.isPendingApproval) {
        // Clear local session tokens so user cannot bypass without approval
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('modules');
        localStorage.removeItem('tenantType');

        setSubmittedApprovalData({
          businessName: businessInfo.name || 'Your Business',
          brandName: businessInfo.brandName || '',
          ownerName: cleanOwner || 'Business Owner',
          email: businessInfo.email,
          phone: businessInfo.phone,
          planTitle: activePlan.title,
          billingCycle,
          grandTotal,
          utrNumber: txnIdOverride || utrNumber,
          proofUrl: paymentProofPayload?.proofUrl || proofPreview,
          fileName: paymentProofPayload?.originalFileName || proofFile?.name || 'Payment Receipt',
          submittedAt: new Date()
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Update local session
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('tenantType', String(data.user.businessType || 1));
        localStorage.setItem('modules', JSON.stringify(data.user.modules || modules));
      }

      // Smooth transition to tenant dashboard
      navigate('/tenant/dashboard', { replace: true });
    } catch (err) {
      console.error('Onboarding completion error:', err);
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // UPI QR Payment & Proof Submission Handler
  const handleUpiSubmit = async () => {
    setError('');
    const cleanUtr = (utrNumber || '').trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      setError('Please enter a valid 12-digit UPI Reference / UTR Number.');
      return;
    }

    if (!proofFile) {
      setError('Please upload your payment screenshot or receipt proof before submitting.');
      return;
    }

    try {
      setUploadingProof(true);
      setLoading(true);

      const formData = new FormData();
      formData.append('proof', proofFile);

      const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/upload-proof`, {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.message || 'Failed to upload payment proof file');
      }

      const proofPayload = {
        utrNumber: cleanUtr,
        proofUrl: uploadData.fileUrl,
        originalFileName: uploadData.originalName || proofFile.name
      };

      await handleCompleteOnboarding('UPI (Admin QR)', cleanUtr, proofPayload);
    } catch (err) {
      console.error('UPI submission error:', err);
      setError(err.message || 'Failed to submit payment verification. Please try again.');
    } finally {
      setUploadingProof(false);
      setLoading(false);
    }
  };

  // Official Razorpay Gateway Checkout Handler
  const handleRazorpayCheckout = async () => {
    setLoading(true);
    setError('');

    // 1. Ensure Razorpay SDK script is loaded
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
      setShowRazorpayModal(true);
      setLoading(false);
      return;
    }

    try {
      // 2. Call backend to create Razorpay Order
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotal,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: {
            plan: activePlan.title,
            cycle: billingCycle,
            businessName: businessInfo.name
          }
        })
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.orderId) {
        throw new Error(orderData.message || 'Failed to create Razorpay order');
      }

      // 3. Configure and trigger Razorpay Checkout modal
      const options = {
        key: orderData.keyId || razorpayKeyId || 'rzp_test_U18JZ6gYj3ozhP',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'BizTech Platform',
        description: `${activePlan.title} (${billingCycle}) Fee Collection`,
        image: '/logo.jpg',
        order_id: orderData.orderId,
        prefill: {
          name: businessInfo.name || 'Business Owner',
          email: businessInfo.email || 'owner@example.com',
          contact: businessInfo.phone || '9999999999'
        },
        theme: {
          color: '#2563EB'
        },
        handler: async function (response) {
          try {
            // 4. Verify payment signature on backend
            const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.message || 'Payment signature verification failed');
            }

            // 5. Successfully verified, activate tenant workspace
            await handleCompleteOnboarding('Razorpay', response.razorpay_payment_id);
          } catch (err) {
            console.error('Payment verification error:', err);
            setError(err.message || 'Payment verification failed. Please contact support.');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setError(`Payment failed: ${resp.error ? resp.error.description : 'Transaction cancelled'}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Razorpay checkout initialization error:', err);
      // Fallback to internal card modal
      setShowRazorpayModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color, #F8FAFC)', display: 'flex' }}>
      
      {/* Backdrop for mobile */}
      <div 
        className={`sidebar-backdrop ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Left Sidebar Progress */}
      <div className={`onboarding-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden' }}>
              <img src="/logo.jpg" alt="BizTech Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-title)', fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.5px' }}>BizTech</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ThemeToggle size="small" />
            <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)} title="Close Sidebar">
              <X size={20} />
            </button>
          </div>
        </div>

        <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '24px', fontWeight: '700' }}>Setup Progress</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
          {/* Vertical Line */}
          <div style={{ position: 'absolute', left: '15px', top: '16px', bottom: '16px', width: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
          
          {ONBOARDING_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            const color = isCompleted ? '#10B981' : isActive ? 'var(--primary-blue, #2563EB)' : 'var(--border-color, #E2E8F0)';
            
            return (
              <div 
                key={step.id} 
                style={{ 
                  display: 'flex', 
                  gap: '14px', 
                  zIndex: 1, 
                  cursor: 'pointer',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(37, 99, 235, 0.2)' : '1px solid transparent',
                  transition: 'all 0.2s',
                  alignItems: 'center'
                }}
                onClick={async () => {
                  if (currentStep === 0 && idx > 0) {
                    if (!validateCurrentStep()) return;
                    const cleanPan = (businessInfo.panNumber || '').trim().toUpperCase();
                    try {
                      const token = localStorage.getItem('token');
                      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/check-pan?pan=${encodeURIComponent(cleanPan)}`, {
                        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                      });
                      const data = await res.json();
                      if (!res.ok || data.exists) {
                        setError(data.message || `This PAN Card Number (${cleanPan}) is already registered with another business.`);
                        setPanCheckResult({ checked: true, exists: true, message: data.message });
                        return;
                      }
                      setPanCheckResult({ checked: true, exists: false, message: 'PAN is available and unique.' });
                    } catch (e) {}
                    setDocuments(prev => ({ ...prev, pan: cleanPan }));
                  }
                  setError('');
                  setCurrentStep(idx);
                  if (window.innerWidth <= 768) setIsSidebarOpen(false);
                }}
                title={`Jump to Step ${idx + 1}: ${step.title}`}
              >
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  background: isCompleted ? '#10B981' : isActive ? 'var(--primary-blue, #2563EB)' : 'var(--card-bg, #FFFFFF)', 
                  border: `2px solid ${color}`,
                  color: isCompleted || isActive ? 'white' : 'var(--text-muted, #94A3B8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'all 0.3s',
                  fontWeight: '700',
                  fontSize: '13px',
                  boxShadow: isActive ? '0 0 0 4px rgba(37, 99, 235, 0.15)' : 'none'
                }}>
                  {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '14px', color: isActive ? 'var(--primary-blue, #2563EB)' : (isCompleted ? 'var(--text-title)' : 'var(--text-muted)'), fontWeight: isActive ? '700' : '600', transition: 'color 0.2s' }}>{step.title}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary, #64748B)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="onboarding-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Header for mobile or when sidebar collapsed */}
        <div className={`onboarding-header ${isSidebarOpen ? 'hide-on-desktop' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden' }}>
              <img src="/logo.jpg" alt="BizTech Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-title)', fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.5px' }}>BizTech</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
            <ThemeToggle size="small" />
            <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(true)} title="Open Steps Sidebar">
              <Menu size={22} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '36px 24px 60px 24px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '960px', width: '100%' }}>

          {/* Error Alert */}
          {error && (
            <div style={{
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#DC2626',
              padding: '12px 18px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {!submittedApprovalData ? (
            <>
          {/* ========================================================================= */}
          {/* STEP 1: REGISTER BUSINESS                                                 */}
          {/* ========================================================================= */}
          {currentStep === 0 && (
            <div style={{ background: 'var(--card-bg, #FFFFFF)', borderRadius: '20px', border: '1px solid var(--border-color, #E2E8F0)', padding: '36px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                  <Building2 size={14} /> Step 1: Legal Identity
                </div>
                <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-title, #0F172A)', margin: '0 0 6px 0' }}>Register Your Business</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748B)', margin: 0 }}>Enter your primary business identity and official address for invoices and receipts.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-title)', marginBottom: '6px' }}>
                    Business / Company Legal Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Apex Enterprises Pvt Ltd" 
                    value={businessInfo.name}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #E2E8F0)', background: 'var(--bg-color, white)', color: 'var(--text-title)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-title)', marginBottom: '6px' }}>
                    Trade / Store Display Name (Optional)
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Apex Superstore" 
                    value={businessInfo.brandName}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, brandName: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #E2E8F0)', background: 'var(--bg-color, white)', color: 'var(--text-title)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Row 2: Owner Name & Official Business Email */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-title)', marginBottom: '6px' }}>
                    Business Owner Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe / Proprietor Name" 
                    value={businessInfo.ownerName}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, ownerName: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #E2E8F0)', background: 'var(--bg-color, white)', color: 'var(--text-title)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-title)', marginBottom: '6px' }}>
                    Official Business Email <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="email" 
                    placeholder="contact@company.com" 
                    value={businessInfo.email}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #E2E8F0)', background: 'var(--bg-color, white)', color: 'var(--text-title)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Row 3: Business PAN Card Number & GST Number (Optional) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '18px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-title)' }}>
                      Business PAN Card Number <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    {panChecking && (
                      <span style={{ fontSize: '11px', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Loader2 size={12} className="animate-spin" /> Verifying...
                      </span>
                    )}
                    {!panChecking && panCheckResult?.checked && !panCheckResult.exists && (
                      <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Check size={12} /> Unique PAN
                      </span>
                    )}
                    {!panChecking && panCheckResult?.checked && panCheckResult.exists && (
                      <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <AlertCircle size={12} /> Already Registered
                      </span>
                    )}
                  </div>
                  <input 
                    type="text" 
                    placeholder="e.g. ABCDE1234F" 
                    maxLength={10}
                    value={businessInfo.panNumber}
                    onChange={(e) => {
                      const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
                      setBusinessInfo(prev => ({ ...prev, panNumber: clean }));
                      setDocuments(prev => ({ ...prev, pan: clean }));
                      setPanCheckResult(null);
                      if (clean.length === 10) {
                        checkPanAvailability(clean);
                      }
                    }}
                    onBlur={() => {
                      if (businessInfo.panNumber && businessInfo.panNumber.length === 10) {
                        checkPanAvailability(businessInfo.panNumber);
                      }
                    }}
                    style={{ 
                      width: '100%', 
                      padding: '12px 14px', 
                      borderRadius: '10px', 
                      border: panCheckResult?.exists ? '1.5px solid #EF4444' : (panCheckResult?.checked ? '1.5px solid #10B981' : '1px solid var(--border-color, #E2E8F0)'), 
                      background: 'var(--bg-color, white)', 
                      color: 'var(--text-title)', 
                      outline: 'none', 
                      fontSize: '14px', 
                      boxSizing: 'border-box',
                      fontFamily: 'monospace',
                      fontWeight: '700',
                      letterSpacing: '1px'
                    }}
                  />
                  <span style={{ fontSize: '11px', color: panCheckResult?.exists ? '#EF4444' : '#64748B', display: 'block', marginTop: '4px' }}>
                    {panCheckResult?.exists ? panCheckResult.message : '10-character alphanumeric PAN (capital letters & numbers). Mandatory & unique.'}
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-title)', marginBottom: '6px' }}>
                    GST Number (Optional)
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. 29ABCDE1234F1Z5" 
                    maxLength={15}
                    value={businessInfo.gstNumber}
                    onChange={(e) => {
                      const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
                      setBusinessInfo(prev => ({ ...prev, gstNumber: clean }));
                      setDocuments(prev => ({ ...prev, gstin: clean }));
                    }}
                    style={{ 
                      width: '100%', 
                      padding: '12px 14px', 
                      borderRadius: '10px', 
                      border: '1px solid var(--border-color, #E2E8F0)', 
                      background: 'var(--bg-color, white)', 
                      color: 'var(--text-title)', 
                      outline: 'none', 
                      fontSize: '14px', 
                      boxSizing: 'border-box',
                      fontFamily: 'monospace',
                      letterSpacing: '0.5px'
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                    15-character alphanumeric GSTIN (Optional).
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-title)', marginBottom: '6px' }}>
                    Official Contact Phone <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="tel" 
                    placeholder="+91 9876543210" 
                    value={businessInfo.phone}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #E2E8F0)', background: 'var(--bg-color, white)', color: 'var(--text-title)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-title)', marginBottom: '6px' }}>
                    Street / Building Address <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Unit 4B, Commercial Market Square, MG Road" 
                    value={businessInfo.address}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #E2E8F0)', background: 'var(--bg-color, white)', color: 'var(--text-title)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-title)', marginBottom: '6px' }}>
                    City <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Bangalore" 
                    value={businessInfo.city}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, city: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #E2E8F0)', background: 'var(--bg-color, white)', color: 'var(--text-title)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-title)', marginBottom: '6px' }}>
                    State <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Karnataka" 
                    value={businessInfo.state}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, state: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #E2E8F0)', background: 'var(--bg-color, white)', color: 'var(--text-title)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-title)', marginBottom: '6px' }}>
                    Pincode <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. 560001" 
                    value={businessInfo.pincode}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, pincode: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #E2E8F0)', background: 'var(--bg-color, white)', color: 'var(--text-title)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: PRODUCT & SERVICE SELECTION                                       */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div style={{ background: 'var(--card-bg, #FFFFFF)', borderRadius: '20px', border: '1px solid var(--border-color, #E2E8F0)', padding: '36px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <div style={{ marginBottom: '28px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                  <Package size={14} /> Step 2: Commercial Offering
                </div>
                <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-title, #0F172A)', margin: '0 0 6px 0' }}>What Does Your Business Offer?</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748B)', margin: 0 }}>This automatically configures your sidebar navigation and inventory modules.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {/* Option 1: Product Based Business */}
                <div 
                  onClick={() => setOfferingType('product')}
                  style={{
                    border: offeringType === 'product' ? '2px solid #2563EB' : '1px solid var(--border-color, #E2E8F0)',
                    background: offeringType === 'product' ? 'rgba(37,99,235,0.03)' : 'var(--card-bg, white)',
                    borderRadius: '16px',
                    padding: '28px 20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  {offeringType === 'product' && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', color: '#2563EB' }}>
                      <CheckCircle2 size={20} />
                    </div>
                  )}
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', padding: '4px 12px', borderRadius: '20px', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', marginBottom: '14px' }}>
                      Group 1
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-title)', margin: '0 0 8px 0' }}>Product Based Business</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                      Sells tangible goods, retail items, or wholesale stock.
                    </p>
                  </div>
                  <div style={{ marginTop: '20px', padding: '7px 10px', background: '#F1F5F9', borderRadius: '8px', fontSize: '11px', color: '#475569', fontWeight: '600' }}>
                    Enables: Products, Stock & Purchases
                  </div>
                </div>

                {/* Option 2: Service Based Business */}
                <div 
                  onClick={() => setOfferingType('service')}
                  style={{
                    border: offeringType === 'service' ? '2px solid #2563EB' : '1px solid var(--border-color, #E2E8F0)',
                    background: offeringType === 'service' ? 'rgba(37,99,235,0.03)' : 'var(--card-bg, white)',
                    borderRadius: '16px',
                    padding: '28px 20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  {offeringType === 'service' && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', color: '#2563EB' }}>
                      <CheckCircle2 size={20} />
                    </div>
                  )}
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', padding: '4px 12px', borderRadius: '20px', background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', marginBottom: '14px' }}>
                      Group 2
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-title)', margin: '0 0 8px 0' }}>Service Based Business</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                      Consulting, agency, maintenance, clinic, or client services.
                    </p>
                  </div>
                  <div style={{ marginTop: '20px', padding: '7px 10px', background: '#F1F5F9', borderRadius: '8px', fontSize: '11px', color: '#475569', fontWeight: '600' }}>
                    Enables: Services (Purchases & Stock hidden)
                  </div>
                </div>

                {/* Option 3: Product & Service Based Business */}
                <div 
                  onClick={() => setOfferingType('both')}
                  style={{
                    border: offeringType === 'both' ? '2px solid #2563EB' : '1px solid var(--border-color, #E2E8F0)',
                    background: offeringType === 'both' ? 'rgba(37,99,235,0.03)' : 'var(--card-bg, white)',
                    borderRadius: '16px',
                    padding: '28px 20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  {offeringType === 'both' && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', color: '#2563EB' }}>
                      <CheckCircle2 size={20} />
                    </div>
                  )}
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', padding: '4px 12px', borderRadius: '20px', background: '#F5F3FF', color: '#6D28D9', border: '1px solid #DDD6FE', marginBottom: '14px' }}>
                      Group 3
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-title)', margin: '0 0 8px 0' }}>Product & Service Based</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                      Combined business selling merchandise along with services/repair.
                    </p>
                  </div>
                  <div style={{ marginTop: '20px', padding: '7px 10px', background: '#F1F5F9', borderRadius: '8px', fontSize: '11px', color: '#475569', fontWeight: '600' }}>
                    Enables: Full Suite (Products, Services & Purchases)
                  </div>
                </div>

                {/* Option 4: Institution and Organization */}
                <div 
                  onClick={() => setOfferingType('institution')}
                  style={{
                    border: offeringType === 'institution' ? '2px solid #2563EB' : '1px solid var(--border-color, #E2E8F0)',
                    background: offeringType === 'institution' ? 'rgba(37,99,235,0.03)' : 'var(--card-bg, white)',
                    borderRadius: '16px',
                    padding: '28px 20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  {offeringType === 'institution' && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', color: '#2563EB' }}>
                      <CheckCircle2 size={20} />
                    </div>
                  )}
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', padding: '4px 12px', borderRadius: '20px', background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', marginBottom: '14px' }}>
                      Group 4
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-title)', margin: '0 0 8px 0' }}>Institution & Organization</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                      Schools, colleges, NGOs, trusts, hospitals, societies, or non-profits.
                    </p>
                  </div>
                  <div style={{ marginTop: '20px', padding: '7px 10px', background: '#F1F5F9', borderRadius: '8px', fontSize: '11px', color: '#475569', fontWeight: '600' }}>
                    Enables: Core Suite (Operations, Billing & Admin)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: CATEGORY SELECTION                                                */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div style={{ background: 'var(--card-bg, #FFFFFF)', borderRadius: '20px', border: '1px solid var(--border-color, #E2E8F0)', padding: '36px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                  <Building2 size={14} /> Step 3: Operational Model
                </div>
                <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-title, #0F172A)', margin: '0 0 6px 0' }}>Select Business Category</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748B)', margin: 0 }}>How does your organization operate in the supply chain?</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                {BUSINESS_CATEGORIES.map(cat => {
                  const isSelected = category === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      style={{
                        border: isSelected ? '2px solid #2563EB' : '1px solid var(--border-color, #E2E8F0)',
                        background: isSelected ? 'rgba(37,99,235,0.03)' : 'var(--card-bg, white)',
                        borderRadius: '14px',
                        padding: '18px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-title)', margin: '0 0 4px 0' }}>{cat.label}</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{cat.desc}</p>
                      </div>
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        border: isSelected ? '6px solid #2563EB' : '2px solid #CBD5E1',
                        background: 'white'
                      }}></div>
                    </div>
                  );
                })}
              </div>

              {category === 'others' && (
                <div style={{ marginTop: '16px', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-title)', marginBottom: '6px' }}>
                    Specify Your Business Category <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Research & Development / Specialized Fabrication" 
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid var(--border-color, #E2E8F0)', background: 'white', color: 'var(--text-title)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: SUB-CATEGORY SELECTION                                            */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div style={{ background: 'var(--card-bg, #FFFFFF)', borderRadius: '20px', border: '1px solid var(--border-color, #E2E8F0)', padding: '36px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                  <Sparkles size={14} /> Step 4: Industry Specialization
                </div>
                <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-title, #0F172A)', margin: '0 0 6px 0' }}>Select Industry Sub-Category</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748B)', margin: 0 }}>This tunes your default tax codes, invoice formats, and measurement units.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                {SUB_CATEGORIES.map(sub => {
                  const isSelected = subCategory === sub;
                  return (
                    <div
                      key={sub}
                      onClick={() => setSubCategory(sub)}
                      style={{
                        border: isSelected ? '2px solid #2563EB' : '1px solid var(--border-color, #E2E8F0)',
                        background: isSelected ? 'rgba(37,99,235,0.03)' : 'var(--card-bg, white)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '14px',
                        fontWeight: isSelected ? '700' : '500',
                        color: isSelected ? '#2563EB' : 'var(--text-title)',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span>{sub}</span>
                      {isSelected && <Check size={16} color="#2563EB" />}
                    </div>
                  );
                })}
              </div>

              {subCategory === 'Others' && (
                <div style={{ marginTop: '16px', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-title)', marginBottom: '6px' }}>
                    Specify Your Industry Segment <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Printing & Packaging" 
                    value={customSubCategory}
                    onChange={(e) => setCustomSubCategory(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid var(--border-color, #E2E8F0)', background: 'white', color: 'var(--text-title)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: DOCUMENTATIONS                                                    */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div style={{ background: 'var(--card-bg, #FFFFFF)', borderRadius: '20px', border: '1px solid var(--border-color, #E2E8F0)', padding: '36px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                  <FileText size={14} /> Step 5: Statutory Compliance
                </div>
                <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-title, #0F172A)', margin: '0 0 6px 0' }}>Business Documentations</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748B)', margin: 0 }}>
                  Enter your official numbers and attach documents. You can also skip and upload later in Settings.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                {/* 1. PAN Card */}
                <div style={{ padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color, #E2E8F0)', background: 'var(--bg-color, #F8FAFC)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-title)' }}>1. Business / Proprietor PAN Card</span>
                    {uploadedFiles.pan && <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '600' }}>✓ {uploadedFiles.pan}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. ABCDE1234F" 
                      maxLength={10}
                      value={documents.pan}
                      onChange={(e) => setDocuments({ ...documents, pan: e.target.value.toUpperCase() })}
                      style={{ flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white', color: 'var(--text-title)', outline: 'none', fontSize: '14px' }}
                    />
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                      <Upload size={14} /> Upload File
                      <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileUpload('pan', e)} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>

                {/* 2. GSTIN Certificate */}
                <div style={{ padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color, #E2E8F0)', background: 'var(--bg-color, #F8FAFC)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-title)' }}>2. GSTIN Certificate (Optional)</span>
                    {uploadedFiles.gstin && <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '600' }}>✓ {uploadedFiles.gstin}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. 29ABCDE1234F1Z5" 
                      maxLength={15}
                      value={documents.gstin}
                      onChange={(e) => setDocuments({ ...documents, gstin: e.target.value.toUpperCase() })}
                      style={{ flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white', color: 'var(--text-title)', outline: 'none', fontSize: '14px' }}
                    />
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                      <Upload size={14} /> Upload File
                      <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileUpload('gstin', e)} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>

                {/* 3. MSME / Udyam */}
                <div style={{ padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color, #E2E8F0)', background: 'var(--bg-color, #F8FAFC)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-title)' }}>3. MSME / Udyam Registration (Optional)</span>
                    {uploadedFiles.msme && <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '600' }}>✓ {uploadedFiles.msme}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. UDYAM-KR-03-0012345" 
                      value={documents.msme}
                      onChange={(e) => setDocuments({ ...documents, msme: e.target.value.toUpperCase() })}
                      style={{ flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white', color: 'var(--text-title)', outline: 'none', fontSize: '14px' }}
                    />
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                      <Upload size={14} /> Upload File
                      <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileUpload('msme', e)} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>

                {/* 4. Food License (FSSAI) */}
                <div style={{ padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color, #E2E8F0)', background: 'var(--bg-color, #F8FAFC)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-title)' }}>4. Food License (FSSAI) (For Food/Grocery/Restaurant)</span>
                    {uploadedFiles.fssai && <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '600' }}>✓ {uploadedFiles.fssai}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. 10019043000000" 
                      maxLength={14}
                      value={documents.fssai}
                      onChange={(e) => setDocuments({ ...documents, fssai: e.target.value })}
                      style={{ flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white', color: 'var(--text-title)', outline: 'none', fontSize: '14px' }}
                    />
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                      <Upload size={14} /> Upload File
                      <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileUpload('fssai', e)} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>

                {/* 5+. Custom / Additional Documents */}
                {customDocuments.map((doc, index) => (
                  <div 
                    key={doc.id} 
                    style={{ 
                      padding: '18px', 
                      borderRadius: '12px', 
                      border: '1px solid var(--border-color, #E2E8F0)', 
                      background: 'var(--bg-color, #F8FAFC)' 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-title)' }}>
                        {4 + index + 1}. {doc.name.trim() ? doc.name : `Custom Document #${index + 1}`}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {doc.fileName && (
                          <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '600' }}>
                            ✓ {doc.fileName}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomDoc(doc.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            borderRadius: '6px'
                          }}
                          title="Remove document"
                        >
                          <Trash2 size={15} /> Remove
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <input 
                        type="text" 
                        placeholder="Document Name (e.g. Trade License, Drug License, Fire NOC)" 
                        value={doc.name}
                        onChange={(e) => updateCustomDoc(doc.id, 'name', e.target.value)}
                        style={{ flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white', color: 'var(--text-title)', outline: 'none', fontSize: '14px' }}
                      />
                      <input 
                        type="text" 
                        placeholder="Registration / Certificate Number" 
                        value={doc.number}
                        onChange={(e) => updateCustomDoc(doc.id, 'number', e.target.value)}
                        style={{ flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white', color: 'var(--text-title)', outline: 'none', fontSize: '14px' }}
                      />
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap' }}>
                        <Upload size={14} /> Upload File
                        <input type="file" accept=".pdf,image/*" onChange={(e) => handleCustomFileUpload(doc.id, e)} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>
                ))}

                {/* Add New Document Action Button */}
                <button
                  type="button"
                  onClick={handleAddCustomDoc}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: '2px dashed #2563EB',
                    background: 'rgba(37,99,235,0.03)',
                    color: '#2563EB',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(37,99,235,0.08)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(37,99,235,0.03)'}
                >
                  <Plus size={18} /> Add New Document (Name, Number & Upload)
                </button>
              </div>

              <div style={{ textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                Tip: You can proceed now and update your documents anytime from <strong>Settings & Compliance</strong>.
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 6: PLAN SELECTION & PAYMENT                                          */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div style={{ background: 'var(--card-bg, #FFFFFF)', borderRadius: '20px', border: '1px solid var(--border-color, #E2E8F0)', padding: '36px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                  <ShieldCheck size={14} /> Final Step: Workspace Activation
                </div>
                <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-title, #0F172A)', margin: '0 0 6px 0' }}>Select Plan & Complete Payment</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748B)', margin: 0 }}>Choose your tier and pay via instant UPI QR code or online checkout.</p>

                {/* Billing Cycle Switch */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'var(--bg-color, #F1F5F9)', padding: '4px', borderRadius: '24px', marginTop: '18px' }}>
                  <button
                    onClick={() => setBillingCycle('Monthly')}
                    style={{
                      border: 'none',
                      background: billingCycle === 'Monthly' ? '#2563EB' : 'transparent',
                      color: billingCycle === 'Monthly' ? 'white' : 'var(--text-secondary)',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('Annual')}
                    style={{
                      border: 'none',
                      background: billingCycle === 'Annual' ? '#2563EB' : 'transparent',
                      color: billingCycle === 'Annual' ? 'white' : 'var(--text-secondary)',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontWeight: '600',
                      fontSize: '13px',
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
                        <span style={{ background: '#10B981', color: 'white', fontSize: '10px', padding: '1px 6px', borderRadius: '8px', fontWeight: '700' }}>
                          Save up to {maxDiscount}%
                        </span>
                      ) : (
                        <span style={{ background: '#64748B', color: 'white', fontSize: '10px', padding: '1px 6px', borderRadius: '8px', fontWeight: '600' }}>
                          12 Months
                        </span>
                      );
                    })()}
                  </button>
                </div>
              </div>

              {/* Plans Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                {defaultPlans.map(plan => {
                  const details = getPlanDetails(plan.title);
                  const isSelected = selectedPlanId === plan.title;
                  return (
                    <div
                      key={plan.title}
                      onClick={() => setSelectedPlanId(plan.title)}
                      style={{
                        border: isSelected ? '2px solid #2563EB' : '1px solid var(--border-color, #E2E8F0)',
                        background: isSelected ? 'rgba(37,99,235,0.04)' : 'var(--card-bg, white)',
                        borderRadius: '14px',
                        padding: '18px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s',
                        position: 'relative'
                      }}
                    >
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#2563EB' }}>
                          <CheckCircle2 size={18} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '4px' }}>
                          {plan.title.replace('Type ', 'Tier ')}
                        </div>
                        {billingCycle === 'Annual' ? (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '20px', fontWeight: '800', color: '#2563EB' }}>
                                ₹{details.amount.toLocaleString()}
                              </span>
                              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 'normal' }}>/yr</span>
                              {details.discountPercent > 0 && (
                                <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through' }}>
                                  ₹{details.fullAnnual.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {details.discountPercent > 0 ? (
                              <div style={{ marginTop: '4px', display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ background: '#DCFCE7', color: '#16A34A', fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '4px' }}>
                                  {details.discountPercent}% OFF
                                </span>
                                <span style={{ fontSize: '10px', color: '#64748B' }}>
                                  (₹{Math.round(details.amount / 12).toLocaleString()}/mo)
                                </span>
                              </div>
                            ) : (
                              <div style={{ fontSize: '10px', color: '#64748B', marginTop: '3px' }}>
                                Full annual (₹{details.monthlyAmount.toLocaleString()}/mo)
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ fontSize: '22px', fontWeight: '800', color: '#2563EB', marginBottom: '4px' }}>
                            ₹{details.amount.toLocaleString()}
                            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 'normal' }}>/mo</span>
                          </div>
                        )}
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: '1.4' }}>
                        {details.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Order Breakdown / Billing Summary */}
              <div style={{ 
                background: '#F8FAFC', 
                border: '1px solid #E2E8F0', 
                borderRadius: '14px', 
                padding: '16px 20px', 
                marginBottom: '28px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #E2E8F0' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{activePlan.title}</span>
                    <span style={{ fontSize: '12px', color: '#64748B', marginLeft: '8px' }}>
                      ({billingCycle === 'Annual' ? 'Annual Subscription • 12 Months' : 'Monthly Subscription • 1 Month'})
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#2563EB' }}>
                    {billingCycle === 'Annual' 
                      ? (activePlan.discountPercent > 0 ? `${activePlan.discountPercent}% Discount Applied` : 'Standard 12-Month Rate') 
                      : 'Standard Monthly Rate'}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#475569' }}>
                  {billingCycle === 'Annual' ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Base 12-Month Rate (₹{activePlan.monthlyAmount.toLocaleString()} × 12):</span>
                        <span style={{ fontWeight: '500' }}>₹{activePlan.fullAnnual.toLocaleString()}</span>
                      </div>
                      {activePlan.discountPercent > 0 ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', fontWeight: '600' }}>
                          <span>Annual Special Discount ({activePlan.discountPercent}% OFF):</span>
                          <span>-₹{activePlan.savings.toLocaleString()}</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '12px' }}>
                          <span>Annual Discount:</span>
                          <span>No discount configured (Full amount payable)</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Base 1-Month Plan Rate:</span>
                      <span style={{ fontWeight: '500' }}>₹{activePlan.monthlyAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px dashed #E2E8F0' }}>
                    <span>Plan Subtotal:</span>
                    <span style={{ fontWeight: '600', color: '#0F172A' }}>₹{activePlan.amount.toLocaleString()}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Goods & Services Tax (GST 18%):</span>
                    <span style={{ fontWeight: '500' }}>₹{taxAmount.toLocaleString()}</span>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '16px', 
                    fontWeight: '800', 
                    color: '#0F172A', 
                    borderTop: '2px solid #E2E8F0', 
                    paddingTop: '10px', 
                    marginTop: '2px' 
                  }}>
                    <span>Total Amount Payable:</span>
                    <span style={{ color: '#2563EB' }}>₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div style={{ borderTop: '1px solid var(--border-color, #E2E8F0)', paddingTop: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '16px' }}>Select Payment Method</h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                  {/* Option A: UPI QR */}
                  <div
                    onClick={() => setPaymentMethod('upi_qr')}
                    style={{
                      border: paymentMethod === 'upi_qr' ? '2px solid #2563EB' : '1px solid var(--border-color, #E2E8F0)',
                      background: paymentMethod === 'upi_qr' ? 'rgba(37,99,235,0.03)' : 'var(--card-bg, white)',
                      padding: '16px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <QrCode size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-title)' }}>Scan UPI QR</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>GPay, PhonePe, Paytm</div>
                    </div>
                  </div>

                  {/* Option B: Razorpay */}
                  <div
                    onClick={() => setPaymentMethod('razorpay')}
                    style={{
                      border: paymentMethod === 'razorpay' ? '2px solid #2563EB' : '1px solid var(--border-color, #E2E8F0)',
                      background: paymentMethod === 'razorpay' ? 'rgba(37,99,235,0.03)' : 'var(--card-bg, white)',
                      padding: '16px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-title)' }}>Razorpay Checkout</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cards, Netbanking, Wallet</div>
                    </div>
                  </div>
                </div>

                {/* UPI QR Display Panel */}
                {paymentMethod === 'upi_qr' && (
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '4px' }}>
                      Scan QR to Pay Total: <span style={{ color: '#2563EB', fontSize: '18px' }}>₹{grandTotal.toLocaleString()}</span> (incl. 18% GST)
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>Scan with any UPI app on your phone (Google Pay, PhonePe, Paytm, BHIM, Cred)</p>

                    {/* Dynamic Real Scannable UPI QR Code */}
                    <div style={{ display: 'inline-block', background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #CBD5E1', boxShadow: '0 4px 14px rgba(0,0,0,0.06)', marginBottom: '14px' }}>
                      <QRCodeSVG 
                        value={`upi://pay?pa=${adminUpiId}&pn=BizTech%20Platform&am=${grandTotal}&cu=INR&tn=BizTech%20${encodeURIComponent(activePlan.title)}`}
                        size={180}
                        level="H"
                        includeMargin={false}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '13px', color: '#64748B' }}>Official Platform UPI ID:</span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', fontFamily: 'monospace' }}>{adminUpiId}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(adminUpiId);
                          setUpiCopied(true);
                          setTimeout(() => setUpiCopied(false), 2000);
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: upiCopied ? '#10B981' : '#2563EB', display: 'flex', alignItems: 'center' }}
                        title="Copy UPI ID"
                      >
                        {upiCopied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>

                    {/* UTR / Reference ID & Proof Upload Entry */}
                    <div style={{ maxWidth: '480px', margin: '0 auto', background: 'white', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '20px', textAlign: 'left', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
                      
                      {/* Field 1: UTR Number */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '6px' }}>
                          Enter 12-digit UPI Reference / UTR Number <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 432109876543"
                          maxLength={22}
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9A-Za-z]/g, ''))}
                          style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace', fontWeight: '700', letterSpacing: '1px' }}
                        />
                        <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                          Found in your UPI payment details (Google Pay, PhonePe, Paytm, BHIM, etc.).
                        </span>
                      </div>

                      {/* Field 2: Upload Payment Proof */}
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '6px' }}>
                          Upload Payment Screenshot / Receipt <span style={{ color: '#EF4444' }}>*</span>
                        </label>

                        {!proofFile ? (
                          <label style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '18px',
                            borderRadius: '10px',
                            border: '2px dashed #94A3B8',
                            background: '#F8FAFC',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'border-color 0.2s'
                          }}>
                            <Upload size={24} color="#2563EB" />
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>
                              Click to browse or drop payment receipt
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>
                              JPG, PNG, WEBP or PDF receipt (Max 15MB)
                            </span>
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp,.pdf,image/*"
                              onChange={handleProofFileChange}
                              style={{ display: 'none' }}
                            />
                          </label>
                        ) : (
                          <div style={{ border: '1px solid #CBD5E1', borderRadius: '10px', padding: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                              {proofPreview ? (
                                <img src={proofPreview} alt="Receipt preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                              ) : (
                                <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                                  <FileText size={24} />
                                </div>
                              )}
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {proofFile.name}
                                </div>
                                <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: '600' }}>
                                  {(proofFile.size / 1024).toFixed(1)} KB • Ready to submit
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setProofFile(null); setProofPreview(null); }}
                              style={{ background: '#FEE2E2', border: 'none', color: '#EF4444', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <X size={14} /> Remove
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Submit Button */}
                      <button
                        type="button"
                        onClick={handleUpiSubmit}
                        disabled={loading || uploadingProof}
                        style={{
                          width: '100%',
                          background: '#10B981',
                          color: 'white',
                          border: 'none',
                          padding: '13px 20px',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: '700',
                          cursor: (loading || uploadingProof) ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(16,185,129,0.25)'
                        }}
                      >
                        {loading || uploadingProof ? (
                          <>
                            <Loader2 size={18} className="animate-spin" /> Submitting for Admin Approval...
                          </>
                        ) : (
                          <>
                            <Send size={18} /> Submit for Admin Approval
                          </>
                        )}
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', marginTop: '10px', color: '#64748B', fontSize: '11px' }}>
                        <ShieldCheck size={14} color="#10B981" />
                        <span>Payment verified by platform admin before account access is activated.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Razorpay Trigger Button */}
                {paymentMethod === 'razorpay' && (
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-title)', marginBottom: '8px' }}>
                      Total Payable: ₹{grandTotal.toLocaleString()} (incl. 18% GST)
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '18px' }}>
                      Official Razorpay Gateway supporting Credit/Debit Cards, NetBanking, UPI, and Mobile Wallets.
                    </p>
                    <button
                      onClick={handleRazorpayCheckout}
                      disabled={loading}
                      style={{
                        background: '#0F172A',
                        color: 'white',
                        border: 'none',
                        padding: '13px 28px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(15,23,42,0.15)'
                      }}
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                      Pay ₹{grandTotal.toLocaleString()} with Razorpay
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Bottom Actions */}
          {currentStep < 5 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '24px' }}>
              <button
                onClick={handleNext}
                style={{
                  background: '#2563EB',
                  color: 'white',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
                }}
              >
                Continue to Next Step <ArrowRight size={16} />
              </button>
            </div>
          )}
          </>
          ) : (
            /* ========================================================================= */
            /* PENDING ADMIN APPROVAL CONFIRMATION VIEW                                 */
            /* ========================================================================= */
            <div style={{ background: 'var(--card-bg, #FFFFFF)', borderRadius: '24px', border: '1px solid var(--border-color, #E2E8F0)', padding: '44px 32px', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', maxWidth: '640px', margin: '20px auto' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 0 0 8px #FFFBEB' }}>
                <Clock size={36} />
              </div>
              
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FEF3C7', color: '#B45309', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', marginBottom: '14px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }}></span>
                Verification Pending Admin Approval
              </div>

              <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-title, #0F172A)', margin: '0 0 10px 0' }}>
                Payment Proof Submitted!
              </h2>

              <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748B)', lineHeight: '1.6', marginBottom: '26px', maxWidth: '520px', margin: '0 auto 26px auto' }}>
                Thank you for completing registration for <strong>{submittedApprovalData.businessName}</strong>. Your UPI QR payment screenshot and UTR number have been sent to the platform administrator for verification.
              </p>

              {/* Details Summary Card */}
              <div style={{ background: 'var(--bg-color, #F8FAFC)', border: '1px solid var(--border-color, #E2E8F0)', borderRadius: '16px', padding: '22px', textAlign: 'left', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Registered Business</span>
                    <strong style={{ color: 'var(--text-title, #0F172A)', fontSize: '14px' }}>{submittedApprovalData.businessName}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Business Owner</span>
                    <strong style={{ color: 'var(--text-title, #0F172A)', fontSize: '14px' }}>{submittedApprovalData.ownerName}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Selected Plan</span>
                    <strong style={{ color: 'var(--text-title, #0F172A)' }}>{submittedApprovalData.planTitle} ({submittedApprovalData.billingCycle})</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Total Paid</span>
                    <strong style={{ color: '#2563EB', fontSize: '16px', fontWeight: '800' }}>₹{submittedApprovalData.grandTotal.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>UTR / Reference Number</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0F172A', background: '#E2E8F0', padding: '3px 8px', borderRadius: '6px', fontSize: '13px', display: 'inline-block', marginTop: '2px' }}>
                      {submittedApprovalData.utrNumber}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Receipt File</span>
                    <span style={{ color: '#16A34A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <CheckCircle2 size={14} /> {submittedApprovalData.fileName}
                    </span>
                  </div>
                </div>

                {submittedApprovalData.proofUrl && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Uploaded Receipt Preview:</span>
                    <a 
                      href={`${import.meta.env.VITE_API_URL}${submittedApprovalData.proofUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontSize: '12px', color: '#2563EB', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                    >
                      <Eye size={14} /> View Uploaded Proof Document
                    </a>
                  </div>
                )}
              </div>

              {/* Informative Guidance Banner */}
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '16px', fontSize: '13px', color: '#1E40AF', marginBottom: '28px', textAlign: 'left', lineHeight: '1.5' }}>
                <strong>What happens next?</strong> Once the platform administrator verifies your payment receipt and UTR number, your account status will transition to <em>Active</em>. You can then return to the login page and sign in with your email and password to begin setting up your products, branches, and staff.
              </div>

              {/* Bottom Actions */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  style={{
                    background: '#2563EB',
                    color: 'white',
                    border: 'none',
                    padding: '13px 32px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  Go to Login Page <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  style={{
                    background: 'var(--bg-color, #F1F5F9)',
                    color: 'var(--text-title, #334155)',
                    border: '1px solid var(--border-color, #CBD5E1)',
                    padding: '13px 24px',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Return to Home
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>

      {/* ========================================================================= */}
      {/* RAZORPAY PAYMENT MODAL                                                    */}
      {/* ========================================================================= */}
      {showRazorpayModal && (
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
            background: 'white',
            borderRadius: '20px',
            maxWidth: '460px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #E2E8F0'
          }}>
            {/* Modal Header */}
            <div style={{ background: '#0F172A', color: 'white', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#38BDF8', fontWeight: '700' }}>RAZORPAY SECURE GATEWAY</div>
                <div style={{ fontSize: '18px', fontWeight: '800' }}>Pay ₹{grandTotal.toLocaleString()}</div>
              </div>
              <button onClick={() => setShowRazorpayModal(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '4px', borderRadius: '10px', marginBottom: '20px' }}>
                <button
                  onClick={() => setRazorpayTab('card')}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: razorpayTab === 'card' ? 'white' : 'transparent',
                    color: razorpayTab === 'card' ? '#0F172A' : '#64748B',
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Card
                </button>
                <button
                  onClick={() => setRazorpayTab('netbanking')}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: razorpayTab === 'netbanking' ? 'white' : 'transparent',
                    color: razorpayTab === 'netbanking' ? '#0F172A' : '#64748B',
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Netbanking
                </button>
                <button
                  onClick={() => setRazorpayTab('upi')}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: razorpayTab === 'upi' ? 'white' : 'transparent',
                    color: razorpayTab === 'upi' ? '#0F172A' : '#64748B',
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  UPI ID
                </button>
              </div>

              {razorpayTab === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Card Number</label>
                    <input type="text" placeholder="4242 •••• •••• 4242" defaultValue="4111 2222 3333 4444" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Expiry</label>
                      <input type="text" placeholder="MM/YY" defaultValue="12/28" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>CVV</label>
                      <input type="text" placeholder="123" defaultValue="888" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>
              )}

              {razorpayTab === 'netbanking' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                  {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'].map(bank => (
                    <div key={bank} style={{ padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', textAlign: 'center', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: '#F8FAFC' }}>
                      {bank}
                    </div>
                  ))}
                </div>
              )}

              {razorpayTab === 'upi' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Enter VPA / UPI ID</label>
                  <input type="text" placeholder="username@okhdfcbank" defaultValue="user@upi" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                </div>
              )}

              <button
                onClick={() => {
                  setShowRazorpayModal(false);
                  handleCompleteOnboarding('Razorpay');
                }}
                disabled={loading}
                style={{
                  width: '100%',
                  background: '#2563EB',
                  color: 'white',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                Confirm Payment & Launch Workspace
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Onboarding;