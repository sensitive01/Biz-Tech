import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, MapPin, Wand2, UserPlus, Eye, EyeOff, ChevronDown,
  Package, Briefcase, RefreshCw, ShoppingCart, ShieldCheck, Landmark,
  Building2, User, Layers, ListTree, FileText, Award, Upload, Check, AlertCircle,
  Loader2, Trash2, Plus, Search, ExternalLink, Calendar, CheckSquare, Square
} from 'lucide-react';
import {
  PRODUCT_CATEGORIES,
  SERVICE_CATEGORIES,
  BOTH_CATEGORIES,
  INSTITUTION_CATEGORIES,
  getSubCategoriesForCategory
} from '../constants/businessCategories';

const formatPanNumber = (input = '') => {
  const raw = String(input).toUpperCase().replace(/[^A-Z0-9]/g, '');
  let formatted = '';
  for (let i = 0; i < raw.length && formatted.length < 10; i++) {
    const char = raw[i];
    const targetIdx = formatted.length;
    if (targetIdx < 5) {
      if (/[A-Z]/.test(char)) formatted += char;
    } else if (targetIdx < 9) {
      if (/[0-9]/.test(char)) formatted += char;
    } else if (targetIdx === 9) {
      if (/[A-Z]/.test(char)) formatted += char;
    }
  }
  return formatted;
};

const STEPS = [
  { id: 1, title: 'User Account', subtitle: 'Login credentials', icon: User },
  { id: 2, title: 'Register Business', subtitle: 'Legal & identity', icon: Building2 },
  { id: 3, title: 'Product & Service', subtitle: 'Offering scope', icon: Package },
  { id: 4, title: 'Business Category', subtitle: 'Industry categories', icon: Layers },
  { id: 5, title: 'Sub-Category', subtitle: 'Specific niches', icon: ListTree },
  { id: 6, title: 'Documentation', subtitle: 'Upload compliance', icon: FileText },
  { id: 7, title: 'Plan & Activation', subtitle: 'Direct activation', icon: ShieldCheck }
];

const STRUCTURES = [
  {
    id: 1,
    title: '1 Owner — 1 Shop — Owner as Employee',
    badge: 'Solo Operator',
    planId: 'plan_solo',
    planName: 'Starter Solo',
    monthlyPrice: 499,
    annualPrice: 4790,
    desc: 'For solo business owners. Single store without staff management overhead.'
  },
  {
    id: 2,
    title: '1 Owner — 1 Shop — Multiple Employees',
    badge: 'Single Store',
    planId: 'plan_single_store',
    planName: 'Growth Single Store',
    monthlyPrice: 999,
    annualPrice: 9590,
    desc: 'Single store with staff team. Includes Employee Attendance & Leave Management.'
  },
  {
    id: 3,
    title: '1 Owner — Multiple Branches — Multiple Employees',
    badge: 'Multi-Location',
    planId: 'plan_multi_location',
    planName: 'Pro Multi-Location',
    monthlyPrice: 1999,
    annualPrice: 19190,
    desc: 'Multi-location chain. Includes Branch Switcher, per-branch Staff, and Investor Equity.'
  },
  {
    id: 4,
    title: '1 Owner — Multiple Businesses — Multiple Branches',
    badge: 'Multi-Business Conglomerate',
    planId: 'plan_conglomerate',
    planName: 'Enterprise Conglomerate',
    monthlyPrice: 3999,
    annualPrice: 38390,
    desc: 'Enterprise managing multiple distinct business entities, branches, staff teams, and investors.'
  }
];

const AddCustomer = () => {
  const navigate = useNavigate();

  // Wizard Step State (1 through 7)
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Step 1: User Account Credentials
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 2: Register Business
  const [businessName, setBusinessName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [panChecking, setPanChecking] = useState(false);
  const [panStatus, setPanStatus] = useState(null); // { available: boolean, message: string }
  const [gstNumber, setGstNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Step 3: Product and Service
  const [offeringType, setOfferingType] = useState('both'); // 'product', 'service', 'both', 'institution'
  const [operationsType, setOperationsType] = useState('purchases'); // 'purchases', 'billing_only'
  const [selectedModules, setSelectedModules] = useState([
    'sales', 'products_services', 'inventory', 'purchases', 'expenses', 'documents', 'reminders'
  ]);

  // Step 4: Business Category
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState('');

  // Step 5: Business Sub-Category
  // Map of categoryName -> Array of subCategory names
  const [selectedSubCategoriesMap, setSelectedSubCategoriesMap] = useState({});
  const [subCategorySearch, setSubCategorySearch] = useState('');

  // Step 6: Documentation
  const [panFileUrl, setPanFileUrl] = useState('');
  const [panFileName, setPanFileName] = useState('');
  const [gstinFileUrl, setGstinFileUrl] = useState('');
  const [gstinFileName, setGstinFileName] = useState('');
  const [registrationDocNumber, setRegistrationDocNumber] = useState('');
  const [registrationFileUrl, setRegistrationFileUrl] = useState('');
  const [registrationFileName, setRegistrationFileName] = useState('');
  const [msmeDocNumber, setMsmeDocNumber] = useState('');
  const [msmeFileUrl, setMsmeFileUrl] = useState('');
  const [msmeFileName, setMsmeFileName] = useState('');
  const [customDocuments, setCustomDocuments] = useState([]);
  const [uploadingDocKey, setUploadingDocKey] = useState(null);

  // Step 7: Plan Selection
  const [selectedStructureId, setSelectedStructureId] = useState(1);
  const [billingCycle, setBillingCycle] = useState('Monthly'); // 'Monthly' | 'Annual'

  // Pre-fill Step 2 from Step 1 values if empty
  useEffect(() => {
    if (!ownerName && fullName) setOwnerName(fullName);
    if (!businessEmail && email) setBusinessEmail(email);
    if (!businessPhone && phone) setBusinessPhone(phone);
  }, [fullName, email, phone]);

  // Prevent browser from auto-filling stored admin credentials on page load or refresh
  useEffect(() => {
    const timer = setTimeout(() => {
      setEmail(prev => (prev === 'admin@biztech.com' ? '' : prev));
      setPassword(prev => (prev === 'admin@123' ? '' : prev));
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Adjust modules when offeringType or operationsType changes
  useEffect(() => {
    setSelectedModules(prev => {
      const next = new Set(prev);
      next.add('sales'); // mandatory
      next.add('products_services');
      next.add('expenses');
      next.add('documents');
      next.add('reminders');

      if (offeringType === 'service') {
        next.delete('inventory');
      } else {
        next.add('inventory');
      }

      if (operationsType === 'billing_only') {
        next.delete('purchases');
      } else {
        next.add('purchases');
      }

      return Array.from(next);
    });
  }, [offeringType, operationsType]);

  // Dynamic Category List based on Step 3 Offering Type
  const activeCategoryList = useMemo(() => {
    if (offeringType === 'product') return PRODUCT_CATEGORIES;
    if (offeringType === 'service') return SERVICE_CATEGORIES;
    if (offeringType === 'institution') return INSTITUTION_CATEGORIES;
    return BOTH_CATEGORIES;
  }, [offeringType]);

  // Filtered categories for search
  const filteredCategoryList = useMemo(() => {
    if (!categorySearch.trim()) return activeCategoryList;
    const query = categorySearch.toLowerCase();
    return activeCategoryList.filter(c =>
      c.label.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query)
    );
  }, [activeCategoryList, categorySearch]);

  // Clear or align selected categories when offering type changes
  useEffect(() => {
    // If selected categories don't match active list, reset
    const activeLabels = new Set(activeCategoryList.map(c => c.label));
    const retained = selectedCategories.filter(cat => activeLabels.has(cat));
    if (retained.length !== selectedCategories.length) {
      setSelectedCategories(retained);
    }
  }, [activeCategoryList]);

  // PAN Check Debounce
  useEffect(() => {
    const clean = panNumber.trim().toUpperCase();
    if (!clean || clean.length < 10) {
      setPanStatus(null);
      setPanChecking(false);
      return;
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(clean)) {
      setPanStatus({ available: false, message: 'Invalid format (Must be 5 letters, 4 digits, 1 letter)' });
      return;
    }

    let isMounted = true;
    setPanChecking(true);
    setPanStatus(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/check-pan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pan: clean })
        });
        const data = await res.json();
        if (isMounted) {
          if (res.ok && !data.exists) {
            setPanStatus({ available: true, message: 'PAN is available & valid' });
          } else {
            setPanStatus({ available: false, message: data.message || 'This PAN is already registered' });
          }
        }
      } catch (err) {
        if (isMounted) {
          setPanStatus({ available: true, message: 'PAN format valid' });
        }
      } finally {
        if (isMounted) setPanChecking(false);
      }
    }, 450);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [panNumber]);

  // Handle Document Upload
  const handleFileUpload = async (docKey, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDocKey(docKey);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (res.ok && data.fileUrl) {
        if (docKey === 'pan') {
          setPanFileUrl(data.fileUrl);
          setPanFileName(data.fileName || file.name);
        } else if (docKey === 'gstin') {
          setGstinFileUrl(data.fileUrl);
          setGstinFileName(data.fileName || file.name);
        } else if (docKey === 'registration') {
          setRegistrationFileUrl(data.fileUrl);
          setRegistrationFileName(data.fileName || file.name);
        } else if (docKey === 'msme') {
          setMsmeFileUrl(data.fileUrl);
          setMsmeFileName(data.fileName || file.name);
        } else if (String(docKey).startsWith('custom_')) {
          const index = parseInt(docKey.split('_')[1], 10);
          setCustomDocuments(prev => prev.map((doc, idx) =>
            idx === index ? { ...doc, fileUrl: data.fileUrl, fileName: data.fileName || file.name } : doc
          ));
        }
      } else {
        setError(data.message || 'File upload failed');
      }
    } catch (err) {
      setError('Error uploading file to server');
    } finally {
      setUploadingDocKey(null);
    }
  };

  // Step Validation
  const validateCurrentStep = () => {
    setError('');

    if (currentStep === 1) {
      if (!fullName.trim()) {
        setError('Please enter the customer / owner full name.');
        return false;
      }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError('Please enter a valid email address.');
        return false;
      }
      if (!phone || phone.length !== 10) {
        setError('Phone number must be exactly 10 digits.');
        return false;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters.');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Password and Confirm Password do not match.');
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      if (!businessName.trim()) {
        setError('Please enter the Business / Company Legal Name.');
        return false;
      }
      if (!panNumber || panNumber.length !== 10) {
        setError('Please enter a valid 10-character PAN Card Number (e.g. ABCDE1234F).');
        return false;
      }
      if (panStatus && !panStatus.available) {
        setError(panStatus.message || 'Please provide a unique, valid PAN card number.');
        return false;
      }
      if (!streetAddress.trim()) {
        setError('Please enter the street / building address.');
        return false;
      }
      if (!city.trim()) {
        setError('Please enter the city.');
        return false;
      }
      if (!state.trim()) {
        setError('Please enter the state.');
        return false;
      }
      if (!pincode.trim() || pincode.trim().length !== 6) {
        setError('Please enter a valid 6-digit postal pincode.');
        return false;
      }
      return true;
    }

    if (currentStep === 3) {
      if (!offeringType) {
        setError('Please select a business offering scope.');
        return false;
      }
      return true;
    }

    if (currentStep === 4) {
      if (selectedCategories.length === 0) {
        setError('Please select at least 1 business industry category.');
        return false;
      }
      return true;
    }

    if (currentStep === 5) {
      // Check if at least 1 subcategory is chosen across any category
      const totalSubs = Object.values(selectedSubCategoriesMap).reduce((sum, list) => sum + (list?.length || 0), 0);
      if (totalSubs === 0) {
        setError('Please select at least 1 sub-category to seed the product catalogue.');
        return false;
      }
      return true;
    }

    if (currentStep === 6) {
      // Documentation is flexible for admin (can upload or proceed)
      return true;
    }

    if (currentStep === 7) {
      if (!selectedStructureId) {
        setError('Please select an operational structure tier.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    if (nextStep > maxStepReached) {
      setMaxStepReached(nextStep);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const jumpToStep = (stepNumber) => {
    if (stepNumber <= maxStepReached) {
      setError('');
      setCurrentStep(stepNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Toggle Category selection
  const toggleCategory = (catLabel) => {
    setSelectedCategories(prev => {
      if (prev.includes(catLabel)) {
        const next = prev.filter(c => c !== catLabel);
        // remove subcategories as well
        setSelectedSubCategoriesMap(oldMap => {
          const newMap = { ...oldMap };
          delete newMap[catLabel];
          return newMap;
        });
        return next;
      } else {
        const next = [...prev, catLabel];
        // Auto-select top subcategories for convenience
        const availableSubs = getSubCategoriesForCategory(catLabel);
        setSelectedSubCategoriesMap(oldMap => ({
          ...oldMap,
          [catLabel]: availableSubs.slice(0, 3) // pre-select first 3
        }));
        return next;
      }
    });
  };

  // Toggle Sub-Category selection
  const toggleSubCategory = (catLabel, subName) => {
    setSelectedSubCategoriesMap(prev => {
      const currentList = prev[catLabel] || [];
      const isSelected = currentList.includes(subName);
      const nextList = isSelected
        ? currentList.filter(s => s !== subName)
        : [...currentList, subName];
      return {
        ...prev,
        [catLabel]: nextList
      };
    });
  };

  // Select / Deselect All subcategories for a category
  const toggleAllSubsForCategory = (catLabel) => {
    const allSubs = getSubCategoriesForCategory(catLabel);
    setSelectedSubCategoriesMap(prev => {
      const currentList = prev[catLabel] || [];
      const allSelected = allSubs.every(s => currentList.includes(s));
      return {
        ...prev,
        [catLabel]: allSelected ? [] : [...allSubs]
      };
    });
  };

  // Add custom document row
  const addCustomDocument = () => {
    setCustomDocuments(prev => [
      ...prev,
      { name: '', number: '', fileUrl: '', fileName: '', type: 'Registration' }
    ]);
  };

  const removeCustomDocument = (index) => {
    setCustomDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // Build catalogueData payload from step 4 & 5
  const buildCatalogueData = () => {
    const itemType = offeringType === 'service' ? 'Service' : 'Product';
    return selectedCategories.map(catName => ({
      categoryName: catName,
      subCategories: selectedSubCategoriesMap[catName] || [],
      itemType: itemType
    }));
  };

  // Final Submission to Admin API
  const handleCreateCustomer = async () => {
    if (!validateCurrentStep()) return;

    setLoading(true);
    setError('');

    const chosenStructure = STRUCTURES.find(s => s.id === selectedStructureId) || STRUCTURES[0];
    const planPrice = billingCycle === 'Annual' ? chosenStructure.annualPrice : chosenStructure.monthlyPrice;
    const catalogueData = buildCatalogueData();
    const fullAddress = [streetAddress, city, state, pincode].filter(Boolean).join(', ');

    const payload = {
      fullName,
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
      businessType: selectedStructureId,
      businessName: businessName.trim(),
      brandName: brandName.trim(),
      ownerName: (ownerName || fullName).trim(),
      businessEmail: (businessEmail || email).trim().toLowerCase(),
      businessPhone: businessPhone || phone,
      panNumber: panNumber.trim().toUpperCase(),
      gstNumber: (gstNumber || '').trim().toUpperCase(),
      streetAddress,
      city,
      state,
      pincode,
      address: fullAddress,
      offeringType,
      businessOfferingType: offeringType,
      operationsType,
      businessOperationsType: operationsType,
      modules: selectedModules,
      category: selectedCategories[0] || '',
      categories: selectedCategories,
      subCategory: Object.values(selectedSubCategoriesMap).flat().join(', '),
      catalogueData,
      documents: {
        panFileUrl,
        panFileName,
        gstinFileUrl,
        gstinFileName,
        registration: registrationDocNumber,
        registrationFileUrl,
        registrationFileName,
        msme: msmeDocNumber,
        msmeFileUrl,
        msmeFileName,
        customDocuments
      },
      subscription: {
        planId: chosenStructure.planId,
        planName: chosenStructure.planName,
        amount: planPrice,
        billingCycle: billingCycle,
        paymentMethod: 'Admin Direct',
        paymentStatus: 'Active'
      }
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/create-customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && (data.success || data.user)) {
        setSuccessMessage('Customer created, fully onboarded, and activated successfully!');
        setTimeout(() => {
          navigate('/admin/customers');
        }, 1500);
      } else {
        setError(data.message || 'Failed to create customer account');
      }
    } catch (err) {
      console.error('Create customer error:', err);
      setError('Server connection error. Please verify backend service and retry.');
    } finally {
      setLoading(false);
    }
  };

  const selectedStructure = STRUCTURES.find(s => s.id === selectedStructureId) || STRUCTURES[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}>

      {/* Top Header & Breadcrumb */}
      <div>
        <button
          onClick={() => navigate('/admin/customers')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '14px',
            fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: 0
          }}
        >
          <ArrowLeft size={16} />
          Back to Customer Directory
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '28px', margin: '0 0 6px 0', fontWeight: '800', color: 'var(--text-title)', letterSpacing: '-0.5px' }}>
              Add New Customer
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              Complete 7-Step Registration & Instant Onboarding Setup Wizard
            </p>
          </div>
          
        </div>
      </div>

      {/* Stepper Progress Bar & Step Chips */}
      <div className="card" style={{ padding: '20px 24px', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Step {currentStep} of {STEPS.length}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-title)' }}>
              {STEPS[currentStep - 1].title}
            </span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
            {Math.round((currentStep / STEPS.length) * 100)}% Completed
          </span>
        </div>

        {/* Linear progress bar */}
        <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
          <div
            style={{
              height: '100%',
              width: `${(currentStep / STEPS.length) * 100}%`,
              background: 'linear-gradient(90deg, #2563EB 0%, #3B82F6 100%)',
              transition: 'width 0.3s ease-in-out'
            }}
          />
        </div>

        {/* Responsive Step Pills */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px'
        }}>
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isCompleted = s.id < currentStep;
            const isActive = s.id === currentStep;
            const isClickable = s.id <= maxStepReached;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => jumpToStep(s.id)}
                disabled={!isClickable}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: isActive ? '2px solid var(--primary-blue, #2563EB)' : isCompleted ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
                  background: isActive ? '#EFF6FF' : isCompleted ? '#F0FDF4' : '#F8FAFC',
                  color: isActive ? '#1E40AF' : isCompleted ? '#166534' : '#64748B',
                  cursor: isClickable ? 'pointer' : 'not-allowed',
                  opacity: isClickable ? 1 : 0.6,
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isActive ? '#2563EB' : isCompleted ? '#22C55E' : '#E2E8F0',
                  color: isActive || isCompleted ? '#FFFFFF' : '#64748B',
                  flexShrink: 0
                }}>
                  {isCompleted ? <Check size={14} strokeWidth={3} /> : <span style={{ fontSize: '11px', fontWeight: '700' }}>{s.id}</span>}
                </div>
                <div style={{ overflow: 'hidden', minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {s.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error & Success Alerts */}
      {error && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C',
          padding: '14px 18px', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div style={{
          background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534',
          padding: '14px 18px', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <CheckCircle2 size={20} color="#16A34A" style={{ flexShrink: 0 }} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Wizard Form Card */}
      <div className="card" style={{ padding: '32px', background: 'white', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* ========================================================================= */}
        {/* STEP 1: REGISTER USER DATA                                                */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', margin: 0, fontWeight: '700', color: 'var(--text-title)' }}>
                  Step 1: Register User Credentials
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>
                  Create the customer's primary login account and security credentials.
                </p>
              </div>
            </div>

            {/* Hidden dummy credentials to trap aggressive browser autofill */}
            <div style={{ position: 'absolute', opacity: 0, height: 0, width: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
              <input type="text" name="dummy_username" tabIndex={-1} autoComplete="username" />
              <input type="password" name="dummy_password" tabIndex={-1} autoComplete="current-password" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontWeight: '600' }}>
                  Full Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="customer_full_name"
                  autoComplete="off"
                  className="input-field"
                  placeholder="e.g. Sarah Jenkins"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontWeight: '600' }}>
                  Email Address (Primary Login ID) <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="email"
                  name="customer_login_email"
                  autoComplete="off"
                  className="input-field"
                  placeholder="sarah@bluestarbakery.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontWeight: '600' }}>
                  Mobile Phone Number <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="tel"
                  name="customer_phone_number"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="off"
                  className="input-field"
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
                {phone && phone.length < 10 && (
                  <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>
                    Must be 10 digits ({10 - phone.length} digits remaining)
                  </span>
                )}
              </div>
              <div />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="input-label" style={{ fontWeight: '600' }}>
                    Account Password <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const generated = Math.random().toString(36).slice(-8) + 'A1!';
                      setPassword(generated);
                      setConfirmPassword(generated);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-blue)',
                      fontSize: '12px', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer'
                    }}
                  >
                    <Wand2 size={13} /> Generate Password
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="customer_security_password"
                    autoComplete="new-password"
                    className="input-field"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontWeight: '600' }}>
                  Re-enter Password <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="customer_security_confirm_password"
                    autoComplete="new-password"
                    className="input-field"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(p => !p)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>
                    Passwords do not match
                  </span>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: REGISTER BUSINESS                                                 */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', margin: 0, fontWeight: '700', color: 'var(--text-title)' }}>
                  Step 2: Register Business Details & Location
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>
                  Enter primary legal entity name, PAN card identification, and physical headquarters.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontWeight: '600' }}>
                  Business / Company Legal Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Apex Supermarket Pvt Ltd"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontWeight: '600' }}>
                  Trade / Store Display Name (Optional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Apex Superstore"
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontWeight: '600' }}>
                  Business Owner Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Owner / Proprietor name"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontWeight: '600' }}>
                  Official Business Email
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="billing@apexsuperstore.com"
                  value={businessEmail}
                  onChange={e => setBusinessEmail(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {/* PAN Number with Smart Formatter & Live Uniqueness Check */}
              <div className="input-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="input-label" style={{ fontWeight: '600' }}>
                    Business PAN Card Number <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  {panChecking && (
                    <span style={{ fontSize: '11px', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Loader2 size={12} className="animate-spin" /> Checking...
                    </span>
                  )}
                  {!panChecking && panStatus && (
                    <span style={{
                      fontSize: '11px', fontWeight: '700',
                      color: panStatus.available ? '#16A34A' : '#DC2626'
                    }}>
                      {panStatus.available ? '✓ Available' : '⚠ Already Registered'}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={10}
                  className="input-field"
                  placeholder="e.g. ABCDE1234F"
                  value={panNumber}
                  onChange={e => setPanNumber(formatPanNumber(e.target.value))}
                  style={{
                    textTransform: 'uppercase',
                    fontFamily: 'monospace',
                    letterSpacing: '1px',
                    borderColor: panStatus ? (panStatus.available ? '#86EFAC' : '#FCA5A5') : undefined
                  }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Format: 5 letters, 4 digits, 1 letter. Mandatory for tax & legal compliance.
                </span>
              </div>

              {/* GST Number */}
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontWeight: '600' }}>
                  GST Number (Optional)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  className="input-field"
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  value={gstNumber}
                  onChange={e => setGstNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '1px' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  15-character Goods and Services Tax Identification Number.
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontWeight: '600' }}>
                  Official Contact Phone
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  className="input-field"
                  placeholder="10-digit number"
                  value={businessPhone}
                  onChange={e => setBusinessPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontWeight: '600' }}>
                  Street / Building Address <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Unit 4B, Commercial Market Square, MG Road"
                  value={streetAddress}
                  onChange={e => setStreetAddress(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontWeight: '600' }}>City <span style={{ color: '#EF4444' }}>*</span></label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Bangalore"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontWeight: '600' }}>State <span style={{ color: '#EF4444' }}>*</span></label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Karnataka"
                  value={state}
                  onChange={e => setState(e.target.value)}
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontWeight: '600' }}>Pincode <span style={{ color: '#EF4444' }}>*</span></label>
                <input
                  type="text"
                  maxLength={6}
                  className="input-field"
                  placeholder="e.g. 560001"
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: PRODUCT AND SERVICE                                               */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', margin: 0, fontWeight: '700', color: 'var(--text-title)' }}>
                  Step 3: Product and Service Offering Scope
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>
                  Select the core offering scope that represents this client's business model.
                </p>
              </div>
            </div>

            {/* Scope Cards */}
            <div>
              <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-title)', display: 'block', marginBottom: '12px' }}>
                Business Offering Scope <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>

                {/* Physical Products */}
                <div
                  onClick={() => setOfferingType('product')}
                  style={{
                    border: `2px solid ${offeringType === 'product' ? 'var(--primary-blue, #2563EB)' : '#E2E8F0'}`,
                    background: offeringType === 'product' ? '#EFF6FF' : 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8' }}>
                      <Package size={22} />
                    </div>
                    {offeringType === 'product' && <CheckCircle2 size={20} color="#2563EB" />}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>Physical Products</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
                    Tangible goods requiring inventory, warehouse stock, and replenishment.
                  </p>
                </div>

                {/* Services Only */}
                <div
                  onClick={() => setOfferingType('service')}
                  style={{
                    border: `2px solid ${offeringType === 'service' ? 'var(--primary-blue, #2563EB)' : '#E2E8F0'}`,
                    background: offeringType === 'service' ? '#EFF6FF' : 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6D28D9' }}>
                      <Briefcase size={22} />
                    </div>
                    {offeringType === 'service' && <CheckCircle2 size={20} color="#2563EB" />}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>Services</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
                    Consulting, repairs, labor, or billable hourly services (omits stock warehouse).
                  </p>
                </div>

                {/* Products & Services (Both) */}
                <div
                  onClick={() => setOfferingType('both')}
                  style={{
                    border: `2px solid ${offeringType === 'both' ? 'var(--primary-blue, #2563EB)' : '#E2E8F0'}`,
                    background: offeringType === 'both' ? '#EFF6FF' : 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803D' }}>
                      <RefreshCw size={22} />
                    </div>
                    {offeringType === 'both' && <CheckCircle2 size={20} color="#2563EB" />}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>Products & Services</h3>
                    <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#15803D', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                      Barcode POS
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
                    Hybrid business with goods and services. Unlocks barcode scanner tab in Billing.
                  </p>
                </div>

                {/* Institutions & Organisations */}
                <div
                  onClick={() => setOfferingType('institution')}
                  style={{
                    border: `2px solid ${offeringType === 'institution' ? 'var(--primary-blue, #2563EB)' : '#E2E8F0'}`,
                    background: offeringType === 'institution' ? '#EFF6FF' : 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B45309' }}>
                      <Landmark size={22} />
                    </div>
                    {offeringType === 'institution' && <CheckCircle2 size={20} color="#2563EB" />}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>Institutions</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
                    Schools, hospitals, NGOs, trusts, clubs, media houses & government bodies.
                  </p>
                </div>

              </div>
            </div>

          </section>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: BUSINESS CATEGORY                                                 */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', margin: 0, fontWeight: '700', color: 'var(--text-title)' }}>
                  Step 4: Select Business Industry Categories
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>
                  Select one or multiple primary categories that describe this client's trade.
                </p>
              </div>
            </div>

            {/* Filter & Selection Counter Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={e => setCategorySearch(e.target.value)}
                  style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: selectedCategories.length > 0 ? '#1D4ED8' : 'var(--text-secondary)' }}>
                  {selectedCategories.length} Categories Selected
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const all = activeCategoryList.map(c => c.label);
                    if (selectedCategories.length === all.length) {
                      setSelectedCategories([]);
                      setSelectedSubCategoriesMap({});
                    } else {
                      setSelectedCategories(all);
                      const map = {};
                      all.forEach(cat => {
                        map[cat] = getSubCategoriesForCategory(cat).slice(0, 3);
                      });
                      setSelectedSubCategoriesMap(map);
                    }
                  }}
                  style={{
                    background: '#F1F5F9', border: 'none', padding: '6px 12px',
                    borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#334155'
                  }}
                >
                  {selectedCategories.length === activeCategoryList.length ? 'Clear All' : 'Select All'}
                </button>
              </div>
            </div>

            {/* Category Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {filteredCategoryList.map(cat => {
                const isSelected = selectedCategories.includes(cat.label);
                return (
                  <div
                    key={cat.id || cat.label}
                    onClick={() => toggleCategory(cat.label)}
                    style={{
                      border: `2px solid ${isSelected ? 'var(--primary-blue, #2563EB)' : '#E2E8F0'}`,
                      background: isSelected ? '#EFF6FF' : 'white',
                      borderRadius: '12px',
                      padding: '16px 18px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease-in-out',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: isSelected ? '#1E40AF' : '#0F172A', lineHeight: '1.3' }}>
                        {cat.label}
                      </h4>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '5px',
                        border: isSelected ? 'none' : '2px solid #CBD5E1',
                        background: isSelected ? '#2563EB' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', flexShrink: 0
                      }}>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
                      {cat.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: BUSINESS SUB-CATEGORY                                             */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FCE7F3', color: '#DB2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ListTree size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', margin: 0, fontWeight: '700', color: 'var(--text-title)' }}>
                  Step 5: Business Sub-Category Selection
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>
                  Choose specific sub-categories for each chosen category to seed the customer's catalogue.
                </p>
              </div>
            </div>

            {/* Subcategory Search & Total Count */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Filter sub-categories..."
                  value={subCategorySearch}
                  onChange={e => setSubCategorySearch(e.target.value)}
                  style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
                />
              </div>

              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary-blue)' }}>
                {Object.values(selectedSubCategoriesMap).reduce((sum, list) => sum + (list?.length || 0), 0)} Total Sub-Categories Selected
              </span>
            </div>

            {/* List of Accordions / Cards per selected Category */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {selectedCategories.map(catLabel => {
                const availableSubs = getSubCategoriesForCategory(catLabel);
                const selectedSubs = selectedSubCategoriesMap[catLabel] || [];
                const filteredSubs = subCategorySearch.trim()
                  ? availableSubs.filter(s => s.toLowerCase().includes(subCategorySearch.toLowerCase()))
                  : availableSubs;

                return (
                  <div
                    key={catLabel}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '20px',
                      background: '#FAFAFA'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>
                          {catLabel}
                        </span>
                        <span style={{
                          fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px',
                          background: selectedSubs.length > 0 ? '#DBEAFE' : '#F1F5F9',
                          color: selectedSubs.length > 0 ? '#1E40AF' : '#64748B'
                        }}>
                          {selectedSubs.length} of {availableSubs.length} selected
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleAllSubsForCategory(catLabel)}
                        style={{
                          background: 'white', border: '1px solid #CBD5E1', padding: '4px 10px',
                          borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#475569'
                        }}
                      >
                        {selectedSubs.length === availableSubs.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    {/* Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {filteredSubs.map(subName => {
                        const isSubSelected = selectedSubs.includes(subName);
                        return (
                          <button
                            key={subName}
                            type="button"
                            onClick={() => toggleSubCategory(catLabel, subName)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600',
                              border: isSubSelected ? '1px solid #2563EB' : '1px solid #CBD5E1',
                              background: isSubSelected ? '#2563EB' : 'white',
                              color: isSubSelected ? '#FFFFFF' : '#334155',
                              cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                          >
                            {isSubSelected && <Check size={12} strokeWidth={3} />}
                            {subName}
                          </button>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: DOCUMENTATION                                                     */}
        {/* ========================================================================= */}
        {currentStep === 6 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#CCFBF1', color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', margin: 0, fontWeight: '700', color: 'var(--text-title)' }}>
                  Step 6: Business Documentation & Verification Proofs
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>
                  Upload verification records directly or note registration numbers. Can also be completed by the client later.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

              {/* 1. PAN Card Document */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px', background: '#FAFAFA' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>1. Business PAN Card</span>
                  <span style={{ fontSize: '11px', background: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                    {panNumber || 'Required'}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 12px 0' }}>
                  Upload digital scan or photo of the official PAN card (PDF, PNG, JPG).
                </p>

                {panFileUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <CheckCircle2 size={16} color="#16A34A" />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#166534', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {panFileName || 'PAN Card Uploaded'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a href={panFileUrl} target="_blank" rel="noreferrer" style={{ color: '#2563EB', padding: '4px' }}>
                        <Eye size={16} />
                      </a>
                      <button type="button" onClick={() => { setPanFileUrl(''); setPanFileName(''); }} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '16px', border: '2px dashed #CBD5E1', borderRadius: '8px', background: 'white',
                    cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#475569'
                  }}>
                    {uploadingDocKey === 'pan' ? (
                      <>
                        <Loader2 size={18} className="animate-spin" color="#2563EB" /> Uploading to Cloudinary...
                      </>
                    ) : (
                      <>
                        <Upload size={18} color="#2563EB" /> Browse or Drop PAN File
                      </>
                    )}
                    <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => handleFileUpload('pan', e)} />
                  </label>
                )}
              </div>

              {/* 2. GST Certificate */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px', background: '#FAFAFA' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>2. GSTIN Certificate</span>
                  <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                    {gstNumber || 'Optional'}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 12px 0' }}>
                  GST registration certificate or government tax document.
                </p>

                {gstinFileUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <CheckCircle2 size={16} color="#16A34A" />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#166534', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {gstinFileName || 'GSTIN Certificate Uploaded'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a href={gstinFileUrl} target="_blank" rel="noreferrer" style={{ color: '#2563EB', padding: '4px' }}>
                        <Eye size={16} />
                      </a>
                      <button type="button" onClick={() => { setGstinFileUrl(''); setGstinFileName(''); }} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '16px', border: '2px dashed #CBD5E1', borderRadius: '8px', background: 'white',
                    cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#475569'
                  }}>
                    {uploadingDocKey === 'gstin' ? (
                      <>
                        <Loader2 size={18} className="animate-spin" color="#2563EB" /> Uploading to Cloudinary...
                      </>
                    ) : (
                      <>
                        <Upload size={18} color="#2563EB" /> Browse or Drop GSTIN File
                      </>
                    )}
                    <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => handleFileUpload('gstin', e)} />
                  </label>
                )}
              </div>

              {/* 3. Registration Certificate (Shop Act / CIN / Incorporation) */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px', background: '#FAFAFA' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>3. Business Registration Proof</span>
                  <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                    Optional
                  </span>
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Registration / License number"
                  value={registrationDocNumber}
                  onChange={e => setRegistrationDocNumber(e.target.value)}
                  style={{ height: '34px', fontSize: '12px', marginBottom: '10px' }}
                />

                {registrationFileUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <CheckCircle2 size={16} color="#16A34A" />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#166534', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {registrationFileName || 'Registration File Uploaded'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a href={registrationFileUrl} target="_blank" rel="noreferrer" style={{ color: '#2563EB', padding: '4px' }}>
                        <Eye size={16} />
                      </a>
                      <button type="button" onClick={() => { setRegistrationFileUrl(''); setRegistrationFileName(''); }} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '14px', border: '2px dashed #CBD5E1', borderRadius: '8px', background: 'white',
                    cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#475569'
                  }}>
                    {uploadingDocKey === 'registration' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" color="#2563EB" /> Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} color="#2563EB" /> Upload License / Certificate
                      </>
                    )}
                    <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => handleFileUpload('registration', e)} />
                  </label>
                )}
              </div>

              {/* 4. MSME / Udyam Certificate */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px', background: '#FAFAFA' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>4. MSME / Udyam Certificate</span>
                  <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                    Optional
                  </span>
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Udyam registration number"
                  value={msmeDocNumber}
                  onChange={e => setMsmeDocNumber(e.target.value)}
                  style={{ height: '34px', fontSize: '12px', marginBottom: '10px' }}
                />

                {msmeFileUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <CheckCircle2 size={16} color="#16A34A" />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#166534', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {msmeFileName || 'MSME File Uploaded'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a href={msmeFileUrl} target="_blank" rel="noreferrer" style={{ color: '#2563EB', padding: '4px' }}>
                        <Eye size={16} />
                      </a>
                      <button type="button" onClick={() => { setMsmeFileUrl(''); setMsmeFileName(''); }} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '14px', border: '2px dashed #CBD5E1', borderRadius: '8px', background: 'white',
                    cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#475569'
                  }}>
                    {uploadingDocKey === 'msme' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" color="#2563EB" /> Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} color="#2563EB" /> Upload MSME Certificate
                      </>
                    )}
                    <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => handleFileUpload('msme', e)} />
                  </label>
                )}
              </div>

            </div>

            {/* Custom Documents Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>Additional Documents</span>
                <button
                  type="button"
                  onClick={addCustomDocument}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE',
                    padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                  }}
                >
                  <Plus size={14} /> Add Document
                </button>
              </div>

              {customDocuments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {customDocuments.map((doc, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '10px', alignItems: 'center', background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <input
                        type="text"
                        placeholder="Document Title (e.g. FSSAI License)"
                        className="input-field"
                        style={{ height: '36px', fontSize: '13px' }}
                        value={doc.name}
                        onChange={e => {
                          const val = e.target.value;
                          setCustomDocuments(prev => prev.map((d, i) => i === idx ? { ...d, name: val } : d));
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Document / License Number"
                        className="input-field"
                        style={{ height: '36px', fontSize: '13px' }}
                        value={doc.number}
                        onChange={e => {
                          const val = e.target.value;
                          setCustomDocuments(prev => prev.map((d, i) => i === idx ? { ...d, number: val } : d));
                        }}
                      />
                      <label style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px',
                        background: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#475569'
                      }}>
                        {uploadingDocKey === `custom_${idx}` ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {doc.fileName ? 'Change File' : 'Upload'}
                        <input type="file" style={{ display: 'none' }} onChange={e => handleFileUpload(`custom_${idx}`, e)} />
                      </label>
                      <button type="button" onClick={() => removeCustomDocument(idx)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '6px' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </section>
        )}

        {/* ========================================================================= */}
        {/* STEP 7: PLAN SELECTION (NO PAYMENTS FROM ADMIN SIDE)                      */}
        {/* ========================================================================= */}
        {currentStep === 7 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', margin: 0, fontWeight: '700', color: 'var(--text-title)' }}>
                  Step 7: Operational Tier & Direct Account Activation
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>
                  Choose the business operational tier and activate the account instantly without payment gateway requirements.
                </p>
              </div>
            </div>

            {/* Structure Selection Cards */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                    Select Operational Structure Tier
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                    Defines branch and staff architecture inside their portal
                  </p>
                </div>

                {/* Billing Cycle Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', padding: '4px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('Monthly')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      background: billingCycle === 'Monthly' ? 'white' : 'transparent',
                      color: billingCycle === 'Monthly' ? '#0F172A' : '#64748B',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer',
                      boxShadow: billingCycle === 'Monthly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('Annual')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      background: billingCycle === 'Annual' ? 'white' : 'transparent',
                      color: billingCycle === 'Annual' ? '#0F172A' : '#64748B',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer',
                      boxShadow: billingCycle === 'Annual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Annual <span style={{ background: '#DCFCE7', color: '#15803D', padding: '1px 5px', borderRadius: '4px', fontSize: '10px' }}>Save 20%</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {STRUCTURES.map(st => {
                  const isSelected = selectedStructureId === st.id;
                  const price = billingCycle === 'Annual' ? st.annualPrice : st.monthlyPrice;
                  return (
                    <div
                      key={st.id}
                      onClick={() => setSelectedStructureId(st.id)}
                      style={{
                        border: `2px solid ${isSelected ? 'var(--primary-blue, #2563EB)' : '#E2E8F0'}`,
                        background: isSelected ? '#EFF6FF' : 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{
                            fontSize: '11px', fontWeight: '800', textTransform: 'uppercase',
                            padding: '3px 8px', borderRadius: '4px',
                            background: isSelected ? '#DBEAFE' : '#F1F5F9',
                            color: isSelected ? '#1E40AF' : '#475569'
                          }}>
                            {st.badge}
                          </span>
                          {isSelected && <CheckCircle2 size={18} color="#2563EB" />}
                        </div>

                        <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700', color: '#0F172A', lineHeight: '1.3' }}>
                          {st.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
                          {st.desc}
                        </p>
                      </div>

                      <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div>
                          <span style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>₹{price.toLocaleString('en-IN')}</span>
                          <span style={{ fontSize: '12px', color: '#64748B' }}> / {billingCycle === 'Annual' ? 'year' : 'month'}</span>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: isSelected ? '#2563EB' : '#94A3B8' }}>
                          {isSelected ? 'Selected' : 'Select'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review Summary Card */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                Onboarding Configuration Summary
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Account Credentials</span>
                  <div style={{ fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>{fullName}</div>
                  <div style={{ color: '#334155' }}>{email}</div>
                  <div style={{ color: '#334155' }}>+91 {phone}</div>
                </div>

                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Business Identity</span>
                  <div style={{ fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>{businessName}</div>
                  <div style={{ color: '#334155' }}>PAN: <strong>{panNumber}</strong></div>
                  {gstNumber && <div style={{ color: '#334155' }}>GST: {gstNumber}</div>}
                  <div style={{ color: '#64748B', fontSize: '12px' }}>{city}, {state} - {pincode}</div>
                </div>

                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Operational Model</span>
                  <div style={{ fontWeight: '700', color: '#0F172A', marginTop: '2px', textTransform: 'capitalize' }}>
                    Offering: {offeringType}
                  </div>
                  <div style={{ color: '#334155' }}>Categories: {selectedCategories.length} selected</div>
                  <div style={{ color: '#334155' }}>
                    Sub-Categories: {Object.values(selectedSubCategoriesMap).reduce((sum, list) => sum + (list?.length || 0), 0)} niches
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Tier & Subscription</span>
                  <div style={{ fontWeight: '700', color: '#059669', marginTop: '2px' }}>{selectedStructure.badge}</div>
                  <div style={{ color: '#334155' }}>Cycle: {billingCycle}</div>
                  <div style={{ color: '#059669', fontWeight: '700', marginTop: '4px' }}>
                    Status: Auto-Activated (Admin)
                  </div>
                </div>
              </div>
            </div>

          </section>
        )}

        {/* Footer Navigation Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '20px', borderTop: '1px solid #E2E8F0', marginTop: '8px', flexWrap: 'wrap', gap: '12px'
        }}>
          <div>
            {currentStep === 1 ? (
              <button
                type="button"
                className="btn-secondary"
                style={{ background: '#F1F5F9', border: 'none', color: '#475569', fontWeight: '600' }}
                onClick={() => navigate('/admin/customers')}
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
                onClick={handleBack}
              >
                <ArrowLeft size={16} /> Back: {STEPS[currentStep - 2].title}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {currentStep < 7 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={handleNext}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontWeight: '700' }}
              >
                Next: {STEPS[currentStep].title}
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={handleCreateCustomer}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 28px', fontWeight: '800', fontSize: '15px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Provisioning Customer...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={20} /> Create Customer & Activate Account
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddCustomer;
