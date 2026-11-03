import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, Users, Map, Calendar, Clock, Package, Archive, TrendingUp, 
  ShoppingCart, Receipt, Building2, UserCheck, FileText, BellRing, Store, 
  ArrowLeft, RefreshCw, Loader2, AlertCircle, User, Mail, Phone, MapPin, 
  Briefcase, IndianRupee, Search, Download, ExternalLink, Layers, Check, 
  X, Sparkles, Eye, CreditCard, Edit2, Trash2, AlertTriangle, Save, CheckCircle2,
  ArrowUp, ArrowDown, ArrowUpDown, Plus, KeyRound, Lock, EyeOff, Tag,
  Pencil, Building, ShieldCheck, CalendarDays, List, ChevronLeft, ChevronRight, Repeat, Bell, LogOut
} from 'lucide-react';
import TablePagination from '../components/TablePagination';
import { exportToCSV } from '../utils/exportToCSV';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState(null);
  const [productTab, setProductTab] = useState('categories');
  const [remindersViewMode, setRemindersViewMode] = useState('calendar');
  const [reminderCurrentDate, setReminderCurrentDate] = useState(new Date());
  const [reminderSelectedDate, setReminderSelectedDate] = useState(new Date());
  const [checkoutModalData, setCheckoutModalData] = useState(null);

  // Profile Page inline editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    industry: '',
    address: '',
    regNo: '',
    subscriptionStatus: 'Active',
    subscriptionBillingCycle: 'Monthly',
    subscriptionCustomAmount: '',
    employeeLimit: '',
    branchLimit: '',
    businessLimit: ''
  });

  // Date filtering state
  const [filterDays, setFilterDays] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Login credentials modal state
  const [loginModalData, setLoginModalData] = useState(null); // { type, item, email, password, isLoginEnabled }
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [credentialsError, setCredentialsError] = useState('');
  const [credentialsSuccess, setCredentialsSuccess] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Pagination & Sorting States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // View, Edit, Delete Modal States
  const [viewModalData, setViewModalData] = useState(null); // { type, data }
  const [editModalData, setEditModalData] = useState(null); // { type, data, formData }
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type, id, name, parentId }
  const [addModalData, setAddModalData] = useState(null);   // { type, formData }
  const [savingAction, setSavingAction] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const showNotification = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => {
      setActionSuccessMsg('');
    }, 3500);
  };

  const fetchCustomerDetails = () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    fetch(`${apiUrl}/api/admin/users/${id}/details`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load customer details');
        return res.json();
      })
      .then(data => {
        setDetails(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching customer details:', err);
        setError(err.message || 'Unable to load customer records');
        setLoading(false);
      });
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    fetchCustomerDetails();
  }, [id, navigate]);

  // Reset pagination and sorting on section or search change
  useEffect(() => {
    setCurrentPage(1);
    setSortConfig({ key: null, direction: 'asc' });
  }, [activeSection, searchTerm]);

  const customer = details?.user || {};
  const branches = details?.branches || [];
  const employees = details?.employees || [];
  const businesses = details?.businesses || customer.businesses || [];
  const expenses = details?.expenses || [];
  const sales = details?.sales || [];
  const inventory = details?.inventory || [];
  const products = details?.products || [];
  const customersList = details?.customers || [];
  const purchases = details?.purchases || [];
  const attendance = details?.attendance || [];
  const leaves = details?.leaves || [];
  const reminders = details?.reminders || [];
  const documents = details?.documents || [];
  const categories = details?.categories || [];
  const subcategories = details?.subcategories || [];

  const financials = details?.financials || {
    totalSales: sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0),
    totalExpenses: expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    totalPurchases: purchases.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  };

  const counts = details?.counts || {
    branches: branches.length,
    employees: employees.length,
    businesses: businesses.length || 1,
    expenses: expenses.length,
    sales: sales.length,
    inventory: inventory.length,
    products: products.length,
    customers: customersList.length,
    purchases: purchases.length,
    attendance: attendance.length,
    leaves: leaves.length,
    reminders: reminders.length,
    documents: documents.length,
    categories: categories.length,
    subcategories: subcategories.length
  };

  const businessType = Number(customer.businessType || 1);
  const typeLabel = `Type ${businessType}: ${
    businessType === 1 ? 'Sole Operator' : 
    businessType === 2 ? 'Single Branch + Staff' : 
    businessType === 3 ? 'Multi-Branch Enterprise' : 
    'Multi-Business Conglomerate'
  }`;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(amt) || 0);
  };

  // Sync Customer Profile Form Data
  useEffect(() => {
    if (customer && customer._id) {
      setProfileFormData({
        fullName: customer.fullName || '',
        businessName: customer.businessName || '',
        email: customer.email || '',
        phone: customer.phone || customer.businessPhone || '',
        industry: customer.industry || '',
        address: customer.address || '',
        regNo: customer.regNo || '',
        subscriptionStatus: customer.subscriptionStatus || 'Active',
        subscriptionBillingCycle: customer.subscriptionBillingCycle || 'Monthly',
        subscriptionCustomAmount: customer.subscriptionCustomAmount || '',
        employeeLimit: customer.employeeLimit != null ? customer.employeeLimit : '',
        branchLimit: customer.branchLimit != null ? customer.branchLimit : '',
        businessLimit: customer.businessLimit != null ? customer.businessLimit : ''
      });
    }
  }, [customer]);

  const getArchetypeInfo = (type) => {
    switch (Number(type)) {
      case 1:
        return { 
          label: 'Type 1: Single Login (Owner-Managed)', 
          desc: '1 Owner • 1 Shop • Owner-managed staff, attendance & leaves',
          icon: Store,
          bg: '#EEF2FF',
          color: '#4338CA',
          border: '#E0E7FF'
        };
      case 2:
        return { 
          label: 'Type 2: Multi-Login (Staff Portal)', 
          desc: '1 Owner • 1 Shop • Multi-login with staff self-service',
          icon: Users,
          bg: '#ECFDF5',
          color: '#065F46',
          border: '#D1FAE5'
        };
      case 3:
        return { 
          label: 'Type 3: Multi-Branch Enterprise', 
          desc: '1 Owner • Multiple Branches • Full employee management',
          icon: Map,
          bg: '#F5F3FF',
          color: '#6B21A8',
          border: '#EDE9FE'
        };
      case 4:
        return { 
          label: 'Type 4: Multi-Business Conglomerate', 
          desc: '1 Owner • Multiple Businesses • Multi-Branch management',
          icon: Building2,
          bg: '#FFF7ED',
          color: '#C2410C',
          border: '#FFEDD5'
        };
      default:
        return { 
          label: 'Tenant Account', 
          desc: 'Standard Business Plan',
          icon: Building2,
          bg: '#F1F5F9',
          color: '#475569',
          border: '#E2E8F0'
        };
    }
  };

  const handleSaveCustomerProfile = async (e) => {
    if (e) e.preventDefault();
    if (profileFormData.phone && profileFormData.phone.length > 0 && profileFormData.phone.length !== 10) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }
    setSavingProfile(true);

    try {
      const response = await fetch(`${apiUrl}/api/admin/users/${customer._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          fullName: profileFormData.fullName,
          businessName: profileFormData.businessName,
          phone: profileFormData.phone,
          businessPhone: profileFormData.phone,
          industry: profileFormData.industry,
          address: profileFormData.address,
          regNo: profileFormData.regNo,
          subscriptionStatus: profileFormData.subscriptionStatus,
          subscriptionBillingCycle: profileFormData.subscriptionBillingCycle,
          subscriptionCustomAmount: profileFormData.subscriptionCustomAmount,
          employeeLimit: profileFormData.employeeLimit === '' ? null : Number(profileFormData.employeeLimit),
          branchLimit: profileFormData.branchLimit === '' ? null : Number(profileFormData.branchLimit),
          businessLimit: profileFormData.businessLimit === '' ? null : Number(profileFormData.businessLimit)
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update customer profile');
      }

      showNotification('Customer profile updated successfully!');
      setIsEditingProfile(false);
      fetchCustomerDetails();
    } catch (err) {
      alert(`Error updating profile: ${err.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  // Sorting request handler
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={13} style={{ opacity: 0.35, marginLeft: '6px' }} />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp size={13} style={{ color: '#2563EB', marginLeft: '6px' }} />
    ) : (
      <ArrowDown size={13} style={{ color: '#2563EB', marginLeft: '6px' }} />
    );
  };

  // Date filtering helper
  const applyDateFilter = (items, dateKey = 'createdAt') => {
    if (!items || !items.length) return [];
    return items.filter(item => {
      if (filterDays === 'all') return true;
      const d = item[dateKey] || item.date || item.createdAt;
      if (!d) return true;
      const itemDate = new Date(d);
      if (isNaN(itemDate.getTime())) return true;
      const diffTime = Math.abs(new Date() - itemDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (filterDays === '7') return diffDays <= 7;
      if (filterDays === '30') return diffDays <= 30;
      if (filterDays === 'custom') {
        if (customStartDate && new Date(itemDate) < new Date(customStartDate)) return false;
        if (customEndDate && new Date(itemDate) > new Date(customEndDate)) return false;
        return true;
      }
      return true;
    });
  };

  // Login credentials modal handler
  const handleOpenLoginModal = (type, item) => {
    setLoginModalData({
      type,
      item,
      email: item.email || '',
      password: '',
      isLoginEnabled: item.isLoginEnabled !== false
    });
    setShowLoginPassword(false);
    setCredentialsError('');
    setCredentialsSuccess('');
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    if (!loginModalData) return;
    const { type, item, email, password, isLoginEnabled } = loginModalData;

    if (!email || !email.trim()) {
      setCredentialsError('Please enter a valid email address');
      return;
    }
    if (!item.email && !password) {
      setCredentialsError('Please enter a password for this login (min 6 characters)');
      return;
    }
    if (password && password.length < 6) {
      setCredentialsError('Password must be at least 6 characters long');
      return;
    }

    setSavingCredentials(true);
    setCredentialsError('');
    setCredentialsSuccess('');

    try {
      let endpoint = '';
      if (type === 'business') {
        endpoint = `${apiUrl}/api/admin/businesses/${customer._id}/${item._id}/credentials`;
      } else if (type === 'branch') {
        endpoint = `${apiUrl}/api/admin/branches/${item._id}/credentials`;
      } else if (type === 'employee') {
        endpoint = `${apiUrl}/api/admin/employees/${item._id}/credentials`;
      } else if (type === 'user') {
        endpoint = `${apiUrl}/api/admin/users/${customer._id}/credentials`;
      }

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password || undefined,
          isLoginEnabled: true
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to update credentials');
      }

      setCredentialsSuccess('Login credentials saved successfully!');
      showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} login credentials updated!`);
      setTimeout(() => {
        setLoginModalData(null);
        fetchCustomerDetails();
      }, 700);
    } catch (err) {
      setCredentialsError(err.message || 'Error saving credentials');
    } finally {
      setSavingCredentials(false);
    }
  };

  // CSV Export for each section
  const exportSectionCSV = (sectionName) => {
    let dataToExport = [];
    let filename = sectionName;

    if (sectionName === 'businesses') {
      dataToExport = filteredBusinesses.map((b, idx) => ({
        'S.No': idx + 1,
        'Business ID': b.businessId || b.businessCode || '-',
        'Business Name': b.name || '',
        'Category': b.category || 'General',
        'Offering Type': b.offeringType || 'both',
        'Operations Type': b.operationsType || 'both',
        'Contact Person': b.contactPerson || '-',
        'Phone': b.phone || '-',
        'Email': b.email || '-',
        'GSTIN / Tax ID': b.taxNumber || '-',
        'City': b.city || '-',
        'Address': b.address || '-',
        'Login Access': b.email ? (b.isLoginEnabled !== false ? 'Active' : 'Disabled') : 'Not Configured',
        'Created At': b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ''
      }));
      filename = 'Businesses';
    } else if (sectionName === 'branches') {
      dataToExport = filteredBranches.map((b, idx) => ({
        'S.No': idx + 1,
        'Branch ID': b.branchId || b.branchCode || '-',
        'Branch Name': b.name || '',
        'Business Name': b.businessName || '-',
        'Location': b.location || '-',
        'Manager': b.manager || '-',
        'Contact Number': b.contactNumber || '-',
        'Email': b.email || '-',
        'Login Status': b.email ? (b.isLoginEnabled !== false ? 'Active' : 'Disabled') : 'Not Configured'
      }));
      filename = 'Branches';
    } else if (sectionName === 'employees') {
      dataToExport = filteredEmployees.map((e, idx) => ({
        'S.No': idx + 1,
        'Employee ID': e.employeeId || '-',
        'Employee Name': e.name || '',
        'Role / Position': e.position || e.designation || 'Staff',
        'Branch': e.branchName || 'Main',
        'Email': e.email || '-',
        'Contact': e.contactNumber || '-',
        'Salary': e.salary || 0,
        'Status': e.status || 'Active',
        'Login Access': e.email ? (e.isLoginEnabled !== false ? 'Active' : 'Disabled') : 'Not Configured'
      }));
      filename = 'Employees';
    } else if (sectionName === 'expenses') {
      dataToExport = filteredExpenses.map((exp, idx) => ({
        'S.No': idx + 1,
        'Title': exp.title,
        'Category': exp.category || 'General',
        'Amount': exp.amount,
        'Date': formatDate(exp.date),
        'Description': exp.description || ''
      }));
      filename = 'Expenses';
    } else if (sectionName === 'sales') {
      dataToExport = filteredSales.map((s, idx) => ({
        'S.No': idx + 1,
        'Invoice No': s.invoiceNo || s._id,
        'Customer': s.customerName || 'Walk-in',
        'Amount': s.amount,
        'Status': s.status || 'Paid',
        'Date': formatDate(s.date)
      }));
      filename = 'Sales';
    } else if (sectionName === 'products') {
      if (productTab === 'categories') {
        dataToExport = filteredCategories.map((c, idx) => ({
          'S.No': idx + 1,
          'Name': c.name,
          'Item Type': c.itemType || 'product',
          'Transaction Type': c.transactionType || 'both',
          'Description': c.description || '-',
          'Created At': formatDate(c.createdAt)
        }));
        filename = 'Categories';
      } else if (productTab === 'subcategories') {
        dataToExport = filteredSubcategories.map((sc, idx) => ({
          'S.No': idx + 1,
          'Name': sc.name,
          'Parent Category': sc.categoryId?.name || '-',
          'Item Type': sc.itemType || 'product',
          'Transaction Type': sc.transactionType || 'both',
          'Description': sc.description || '-',
          'Created At': formatDate(sc.createdAt)
        }));
        filename = 'SubCategories';
      } else {
        dataToExport = filteredProducts.map((p, idx) => ({
          'S.No': idx + 1,
          'Name': p.name,
          'SKU': p.sku || '-',
          'Category': p.categoryId?.name || p.category || 'General',
          'SubCategory': p.subCategoryId?.name || p.subCategory || '-',
          'Type': p.itemType || p.type || 'Product',
          'Price': p.price || 0,
          'Stock': p.stock || 0
        }));
        filename = 'Products';
      }
    } else if (sectionName === 'inventory') {
      dataToExport = filteredInventory.map((i, idx) => ({
        'S.No': idx + 1,
        'Item Name': i.itemName,
        'SKU': i.sku || '-',
        'Category': i.category || 'General',
        'Quantity': i.quantity || 0,
        'Unit': i.unit || 'pcs'
      }));
      filename = 'Inventory';
    } else if (sectionName === 'customers') {
      dataToExport = filteredCustomersList.map((c, idx) => ({
        'S.No': idx + 1,
        'Name': c.name,
        'Company': c.companyName || '-',
        'Email': c.email || '-',
        'Phone': c.phone || '-',
        'City': c.city || '-'
      }));
      filename = 'Customers';
    } else if (sectionName === 'purchases') {
      dataToExport = filteredPurchases.map((p, idx) => ({
        'S.No': idx + 1,
        'PO Number': p.poNumber || '-',
        'Supplier': p.supplierName || '-',
        'Amount': p.amount || 0,
        'Status': p.status || 'Pending',
        'Date': formatDate(p.date)
      }));
      filename = 'Purchases';
    } else if (sectionName === 'attendance') {
      dataToExport = filteredAttendance.map((a, idx) => ({
        'S.No': idx + 1,
        'Staff': a.employeeId?.name || a.employeeName || '-',
        'Date': formatDate(a.date),
        'Status': a.status || 'Present',
        'Check In': a.checkIn || '-',
        'Check Out': a.checkOut || '-'
      }));
      filename = 'Attendance';
    } else if (sectionName === 'leaves') {
      dataToExport = filteredLeaves.map((l, idx) => ({
        'S.No': idx + 1,
        'Staff': l.employeeId?.name || l.employeeName || '-',
        'Leave Type': l.type || 'Leave',
        'From': formatDate(l.startDate),
        'To': formatDate(l.endDate),
        'Status': l.status || 'Pending'
      }));
      filename = 'Leaves';
    } else if (sectionName === 'reminders') {
      dataToExport = filteredReminders.map((r, idx) => ({
        'S.No': idx + 1,
        'Title': r.title,
        'Due Date': formatDate(r.date),
        'Priority': r.priority || 'Normal',
        'Status': r.status || 'Pending'
      }));
      filename = 'Reminders';
    } else if (sectionName === 'documents') {
      dataToExport = filteredDocuments.map((d, idx) => ({
        'S.No': idx + 1,
        'Document Name': d.title,
        'Category': d.type || 'General',
        'Expiry Date': formatDate(d.expiryDate)
      }));
      filename = 'Documents';
    }

    exportToCSV(dataToExport, `${customer.businessName || 'Client'}_${filename}`);
  };

  // Generic Sort Helper
  const sortList = (list) => {
    if (!sortConfig.key) return list;
    return [...list].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      if (sortConfig.key === 'employee') {
        aVal = (a.employeeId?.name || a.employeeName || '').toLowerCase();
        bVal = (b.employeeId?.name || b.employeeName || '').toLowerCase();
      } else if (sortConfig.key === 'date' || sortConfig.key === 'createdAt' || sortConfig.key === 'expiryDate' || sortConfig.key === 'startDate' || sortConfig.key === 'endDate') {
        aVal = new Date(aVal).getTime() || 0;
        bVal = new Date(bVal).getTime() || 0;
      } else if (!isNaN(Number(aVal)) && !isNaN(Number(bVal)) && aVal !== '' && bVal !== '') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Search filtered & sorted lists with date range filtering
  const filteredBranches = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const dateFiltered = applyDateFilter(branches, 'createdAt');
    const filtered = dateFiltered.filter(b => 
      (b.name && b.name.toLowerCase().includes(q)) || 
      (b.branchId && b.branchId.toLowerCase().includes(q)) || 
      (b.branchCode && b.branchCode.toLowerCase().includes(q)) || 
      (b.location && b.location.toLowerCase().includes(q)) || 
      (b.manager && b.manager.toLowerCase().includes(q)) ||
      (b.businessName && b.businessName.toLowerCase().includes(q)) ||
      (b.email && b.email.toLowerCase().includes(q)) ||
      (b.contactNumber && b.contactNumber.includes(q))
    );
    return sortList(filtered);
  }, [branches, searchTerm, sortConfig, filterDays, customStartDate, customEndDate]);

  const filteredEmployees = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const dateFiltered = applyDateFilter(employees, 'dateOfJoining');
    const filtered = dateFiltered.filter(e => 
      (e.name && e.name.toLowerCase().includes(q)) || 
      (e.employeeId && e.employeeId.toLowerCase().includes(q)) || 
      (e.position && e.position.toLowerCase().includes(q)) || 
      (e.email && e.email.toLowerCase().includes(q)) || 
      (e.branchName && e.branchName.toLowerCase().includes(q)) ||
      (e.businessName && e.businessName.toLowerCase().includes(q)) ||
      (e.contactNumber && e.contactNumber.includes(q))
    );
    return sortList(filtered);
  }, [employees, searchTerm, sortConfig, filterDays, customStartDate, customEndDate]);

  const filteredExpenses = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const dateFiltered = applyDateFilter(expenses, 'date');
    const filtered = dateFiltered.filter(e => (e.title && e.title.toLowerCase().includes(q)) || (e.category && e.category.toLowerCase().includes(q)) || (e.description && e.description.toLowerCase().includes(q)));
    return sortList(filtered);
  }, [expenses, searchTerm, sortConfig, filterDays, customStartDate, customEndDate]);

  const filteredSales = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const dateFiltered = applyDateFilter(sales, 'date');
    const filtered = dateFiltered.filter(s => (s.invoiceNo && s.invoiceNo.toLowerCase().includes(q)) || (s.customerName && s.customerName.toLowerCase().includes(q)) || (s.status && s.status.toLowerCase().includes(q)));
    return sortList(filtered);
  }, [sales, searchTerm, sortConfig, filterDays, customStartDate, customEndDate]);

  const filteredInventory = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const dateFiltered = applyDateFilter(inventory, 'createdAt');
    const filtered = dateFiltered.filter(i => ((i.itemName || i.name) && (i.itemName || i.name).toLowerCase().includes(q)) || (i.sku && i.sku.toLowerCase().includes(q)) || (i.category && i.category.toLowerCase().includes(q)));
    return sortList(filtered);
  }, [inventory, searchTerm, sortConfig, filterDays, customStartDate, customEndDate]);

  const filteredCategories = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const dateFiltered = applyDateFilter(categories, 'createdAt');
    const filtered = dateFiltered.filter(c => 
      (c.name && c.name.toLowerCase().includes(q)) || 
      (c.itemType && c.itemType.toLowerCase().includes(q)) || 
      (c.transactionType && c.transactionType.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
    return sortList(filtered);
  }, [categories, searchTerm, sortConfig, filterDays, customStartDate, customEndDate]);

  const filteredSubcategories = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const dateFiltered = applyDateFilter(subcategories, 'createdAt');
    const filtered = dateFiltered.filter(sc => 
      (sc.name && sc.name.toLowerCase().includes(q)) || 
      (sc.categoryId?.name && sc.categoryId.name.toLowerCase().includes(q)) ||
      (sc.itemType && sc.itemType.toLowerCase().includes(q)) || 
      (sc.transactionType && sc.transactionType.toLowerCase().includes(q)) ||
      (sc.description && sc.description.toLowerCase().includes(q))
    );
    return sortList(filtered);
  }, [subcategories, searchTerm, sortConfig, filterDays, customStartDate, customEndDate]);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const dateFiltered = applyDateFilter(products, 'createdAt');
    const filtered = dateFiltered.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) || 
      (p.sku && p.sku.toLowerCase().includes(q)) || 
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.categoryId?.name && p.categoryId.name.toLowerCase().includes(q)) ||
      (p.subCategoryId?.name && p.subCategoryId.name.toLowerCase().includes(q)) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(q))
    );
    return sortList(filtered);
  }, [products, searchTerm, sortConfig, filterDays, customStartDate, customEndDate]);

  const filteredCustomersList = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const dateFiltered = applyDateFilter(customersList, 'createdAt');
    const filtered = dateFiltered.filter(c => (c.name && c.name.toLowerCase().includes(q)) || (c.companyName && c.companyName.toLowerCase().includes(q)) || (c.email && c.email.toLowerCase().includes(q)) || (c.phone && c.phone.toLowerCase().includes(q)));
    return sortList(filtered);
  }, [customersList, searchTerm, sortConfig, filterDays, customStartDate, customEndDate]);

  const filteredPurchases = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const dateFiltered = applyDateFilter(purchases, 'date');
    const filtered = dateFiltered.filter(p => (p.poNumber && p.poNumber.toLowerCase().includes(q)) || (p.supplierName && p.supplierName.toLowerCase().includes(q)) || (p.status && p.status.toLowerCase().includes(q)));
    return sortList(filtered);
  }, [purchases, searchTerm, sortConfig, filterDays, customStartDate, customEndDate]);

  const filteredAttendance = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const dateFiltered = applyDateFilter(attendance, 'date');
    const filtered = dateFiltered.filter(a => ((a.employeeId?.name || a.employeeName || '') && (a.employeeId?.name || a.employeeName || '').toLowerCase().includes(q)) || (a.status && a.status.toLowerCase().includes(q)));
    return sortList(filtered);
  }, [attendance, searchTerm, sortConfig, filterDays, customStartDate, customEndDate]);

  const filteredLeaves = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const dateFiltered = applyDateFilter(leaves, 'startDate');
    const filtered = dateFiltered.filter(l => ((l.employeeId?.name || l.employeeName || '') && (l.employeeId?.name || l.employeeName || '').toLowerCase().includes(q)) || (l.type && l.type.toLowerCase().includes(q)) || (l.status && l.status.toLowerCase().includes(q)));
    return sortList(filtered);
  }, [leaves, searchTerm, sortConfig, filterDays, customStartDate, customEndDate]);

  const filteredReminders = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const dateFiltered = applyDateFilter(reminders, 'date');
    const filtered = dateFiltered.filter(r => (r.title && r.title.toLowerCase().includes(q)) || (r.description && r.description.toLowerCase().includes(q)) || (r.status && r.status.toLowerCase().includes(q)));
    return sortList(filtered);
  }, [reminders, searchTerm, sortConfig, filterDays, customStartDate, customEndDate]);

  const filteredDocuments = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const dateFiltered = applyDateFilter(documents, 'createdAt');
    const filtered = dateFiltered.filter(d => (d.title && d.title.toLowerCase().includes(q)) || (d.type && d.type.toLowerCase().includes(q)));
    return sortList(filtered);
  }, [documents, searchTerm, sortConfig, filterDays, customStartDate, customEndDate]);

  const filteredBusinesses = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const dateFiltered = applyDateFilter(businesses, 'createdAt');
    const filtered = dateFiltered.filter(b => 
      (b.name && b.name.toLowerCase().includes(q)) || 
      (b.businessId && b.businessId.toLowerCase().includes(q)) || 
      (b.businessCode && b.businessCode.toLowerCase().includes(q)) || 
      (b.category && b.category.toLowerCase().includes(q)) || 
      (b.contactPerson && b.contactPerson.toLowerCase().includes(q)) ||
      (b.city && b.city.toLowerCase().includes(q)) ||
      (b.taxNumber && b.taxNumber.toLowerCase().includes(q)) ||
      (b.email && b.email.toLowerCase().includes(q)) ||
      (b.phone && b.phone.includes(q))
    );
    return sortList(filtered);
  }, [businesses, searchTerm, sortConfig, filterDays, customStartDate, customEndDate]);

  // Paginated slices
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBranches = filteredBranches.slice(startIndex, startIndex + itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
  const paginatedSales = filteredSales.slice(startIndex, startIndex + itemsPerPage);
  const paginatedInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);
  const paginatedSubcategories = filteredSubcategories.slice(startIndex, startIndex + itemsPerPage);
  const paginatedCustomers = filteredCustomersList.slice(startIndex, startIndex + itemsPerPage);
  const paginatedPurchases = filteredPurchases.slice(startIndex, startIndex + itemsPerPage);
  const paginatedAttendance = filteredAttendance.slice(startIndex, startIndex + itemsPerPage);
  const paginatedLeaves = filteredLeaves.slice(startIndex, startIndex + itemsPerPage);
  const paginatedReminders = filteredReminders.slice(startIndex, startIndex + itemsPerPage);
  const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + itemsPerPage);
  const paginatedBusinesses = filteredBusinesses.slice(startIndex, startIndex + itemsPerPage);

  // Handle Edit Submissions
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editModalData) return;
    setSavingAction(true);

    const { type, data, formData } = editModalData;
    let endpoint = '';

    if (type === 'user') endpoint = `${apiUrl}/api/admin/users/${customer._id}`;
    else if (type === 'branch') endpoint = `${apiUrl}/api/admin/branches/${data._id}`;
    else if (type === 'employee') endpoint = `${apiUrl}/api/admin/employees/${data._id}`;
    else if (type === 'business') endpoint = `${apiUrl}/api/admin/businesses/${customer._id}/${data._id}`;
    else if (type === 'expense') endpoint = `${apiUrl}/api/admin/expenses/${data._id}`;
    else if (type === 'sale') endpoint = `${apiUrl}/api/admin/sales/${data._id}`;
    else if (type === 'inventory') endpoint = `${apiUrl}/api/admin/inventory/${data._id}`;
    else if (type === 'product') endpoint = `${apiUrl}/api/admin/products/${data._id}`;
    else if (type === 'category') endpoint = `${apiUrl}/api/admin/categories/${data._id}`;
    else if (type === 'subcategory') endpoint = `${apiUrl}/api/admin/subcategories/${data._id}`;
    else if (type === 'customer') endpoint = `${apiUrl}/api/admin/customers/${data._id}`;
    else if (type === 'purchase') endpoint = `${apiUrl}/api/admin/purchases/${data._id}`;
    else if (type === 'attendance') endpoint = `${apiUrl}/api/admin/attendance/${data._id}`;
    else if (type === 'leave') endpoint = `${apiUrl}/api/admin/leaves/${data._id}`;
    else if (type === 'reminder') endpoint = `${apiUrl}/api/admin/reminders/${data._id}`;
    else if (type === 'document') endpoint = `${apiUrl}/api/admin/documents/${data._id}`;

    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || errJson.error || 'Update failed');
      }

      showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`);
      setEditModalData(null);
      fetchCustomerDetails();
    } catch (err) {
      alert(`Error updating ${type}: ${err.message}`);
    } finally {
      setSavingAction(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setSavingAction(true);

    const { type, id: itemId, parentId } = deleteConfirm;
    let endpoint = '';

    if (type === 'user') endpoint = `${apiUrl}/api/admin/users/${itemId}`;
    else if (type === 'branch') endpoint = `${apiUrl}/api/admin/branches/${itemId}`;
    else if (type === 'employee') endpoint = `${apiUrl}/api/admin/employees/${itemId}`;
    else if (type === 'business') endpoint = `${apiUrl}/api/admin/businesses/${parentId || customer._id}/${itemId}`;
    else if (type === 'expense') endpoint = `${apiUrl}/api/admin/expenses/${itemId}`;
    else if (type === 'sale') endpoint = `${apiUrl}/api/admin/sales/${itemId}`;
    else if (type === 'inventory') endpoint = `${apiUrl}/api/admin/inventory/${itemId}`;
    else if (type === 'product') endpoint = `${apiUrl}/api/admin/products/${itemId}`;
    else if (type === 'category') endpoint = `${apiUrl}/api/admin/categories/${itemId}`;
    else if (type === 'subcategory') endpoint = `${apiUrl}/api/admin/subcategories/${itemId}`;
    else if (type === 'customer') endpoint = `${apiUrl}/api/admin/customers/${itemId}`;
    else if (type === 'purchase') endpoint = `${apiUrl}/api/admin/purchases/${itemId}`;
    else if (type === 'attendance') endpoint = `${apiUrl}/api/admin/attendance/${itemId}`;
    else if (type === 'leave') endpoint = `${apiUrl}/api/admin/leaves/${itemId}`;
    else if (type === 'reminder') endpoint = `${apiUrl}/api/admin/reminders/${itemId}`;
    else if (type === 'document') endpoint = `${apiUrl}/api/admin/documents/${itemId}`;

    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || errJson.error || 'Delete failed');
      }

      setDeleteConfirm(null);

      if (type === 'user') {
        alert('Customer account deleted successfully');
        navigate('/admin/customers');
      } else {
        showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
        fetchCustomerDetails();
      }
    } catch (err) {
      alert(`Error deleting ${type}: ${err.message}`);
    } finally {
      setSavingAction(false);
    }
  };

  // Field placeholder helper matching user side conventions
  const getFieldPlaceholder = (fieldKey, type = '') => {
    switch (fieldKey) {
      case 'employeeId':
        return 'e.g. EMP-001';
      case 'branchId':
      case 'branchCode':
        return 'e.g. BR-001';
      case 'businessId':
      case 'businessCode':
        return 'e.g. BIZ-001';
      case 'name':
        if (type === 'category') return 'Enter category name';
        if (type === 'subcategory') return 'Enter the subcategory name';
        if (type === 'product') return 'Enter the product name';
        if (type === 'branch') return 'Enter branch name';
        if (type === 'business') return 'e.g. Apex Supermarket & Grocery';
        if (type === 'employee') return 'Enter Employee Name';
        if (type === 'customer') return 'Enter contact/customer name';
        return 'Enter name';
      case 'sku':
        return 'e.g. SKU-101';
      case 'itemName':
        return 'Enter item name';
      case 'title':
        if (type === 'expense') return 'Enter the title';
        if (type === 'reminder') return 'e.g. Shop Rent, GST Filing, Vendor Payment';
        if (type === 'document') return 'Enter document title';
        return 'Enter title';
      case 'price':
        return 'Enter the price amount';
      case 'stock':
      case 'quantity':
        return 'Enter the stock quantity';
      case 'amount':
        if (type === 'purchase') return 'Enter the amount (e.g. 2000)';
        return 'Enter the amount (₹)';
      case 'category':
        return 'Type category name (Mandatory) *';
      case 'contactPerson':
        return 'e.g. Rajesh Kumar';
      case 'manager':
        return 'Enter manager name';
      case 'contactNumber':
      case 'phone':
        return 'Enter 10-digit number';
      case 'email':
        if (type === 'business') return 'e.g. contact@apexretail.com';
        if (type === 'employee') return 'Enter Email Address';
        return 'Enter email address';
      case 'location':
        return 'Enter complete address';
      case 'address':
        if (type === 'business') return 'Street address, building, landmark, pincode';
        return 'Enter full address';
      case 'city':
        return 'e.g. Bangalore, Karnataka';
      case 'taxNumber':
      case 'gstin':
        return 'e.g. 29ABCDE1234F1Z5';
      case 'companyName':
        return 'e.g. Acme Corp / Retail Shop';
      case 'poNumber':
        return 'Enter the product order number';
      case 'supplierName':
        return 'Enter the supplier name';
      case 'invoiceNo':
        return 'e.g. INV-2024-001';
      case 'customerName':
        return 'Enter customer name';
      case 'position':
        return 'e.g. Lead Cashier / Sales';
      case 'salary':
        return 'e.g. 50000';
      case 'description':
        if (type === 'expense') return 'Enter the description';
        if (type === 'reminder') return 'Additional details, bank account, reference info...';
        return 'Enter description...';
      case 'reason':
        return 'Enter reason for leave...';
      case 'notifyBeforeDays':
        return 'e.g. 1, 2, 7';
      case 'fileUrl':
        return 'https://example.com/document.pdf or paste URL';
      case 'checkIn':
        return 'e.g. 09:00';
      case 'checkOut':
        return 'e.g. 18:00';
      case 'branchName':
        return 'Enter branch name';
      case 'businessName':
        return 'Enter business name';
      case 'fullName':
        return 'Enter full name';
      case 'industry':
        return 'e.g. Retail, Healthcare, IT';
      case 'regNo':
        return 'e.g. REG-12345';
      case 'subscriptionCustomAmount':
        return 'e.g. 2999';
      default: {
        const label = fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
        return `Enter ${label.toLowerCase()}...`;
      }
    }
  };

  // Reminders Calendar helpers
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleReminderPrevMonth = () => {
    setReminderCurrentDate(new Date(reminderCurrentDate.getFullYear(), reminderCurrentDate.getMonth() - 1, 1));
  };

  const handleReminderNextMonth = () => {
    setReminderCurrentDate(new Date(reminderCurrentDate.getFullYear(), reminderCurrentDate.getMonth() + 1, 1));
  };

  const handleReminderToday = () => {
    const today = new Date();
    setReminderCurrentDate(today);
    setReminderSelectedDate(today);
  };

  const formatReminderDateKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isReminderToday = (d) => {
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  const isReminderSelected = (d) => {
    return d.getDate() === reminderSelectedDate.getDate() &&
      d.getMonth() === reminderSelectedDate.getMonth() &&
      d.getFullYear() === reminderSelectedDate.getFullYear();
  };

  const reminderCalendarDays = useMemo(() => {
    const year = reminderCurrentDate.getFullYear();
    const month = reminderCurrentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 for Sunday
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Preceding padding days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Days in current month
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true });
    }

    // Trailing padding days to fill 5 or 6 weeks (total 35 or 42)
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }

    return days;
  }, [reminderCurrentDate]);

  const getRemindersForDate = (date) => {
    const targetDateStr = formatReminderDateKey(date);
    const targetDayOfMonth = date.getDate();

    return reminders.filter(item => {
      if (!item.date) return false;
      const itemDate = new Date(item.date);
      const itemDateStr = formatReminderDateKey(itemDate);

      // 1. Exact Date Match
      if (itemDateStr === targetDateStr) return true;

      // 2. Monthly Recurring Match (Same day of the month) - Applicable for current year
      if (item.repeatMonthly && itemDate.getDate() === targetDayOfMonth) {
        const itemYear = itemDate.getFullYear();
        if (date.getFullYear() === itemYear && date.getMonth() >= itemDate.getMonth()) {
          return true;
        }
      }

      return false;
    });
  };

  const selectedDayReminders = useMemo(() => {
    return getRemindersForDate(reminderSelectedDate);
  }, [reminders, reminderSelectedDate]);

  const handleToggleReminderStatus = async (item) => {
    const newStatus = item.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await fetch(`${apiUrl}/api/admin/reminders/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showNotification(`Reminder marked as ${newStatus}`);
        fetchCustomerDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle staff checkout confirmation
  const handleConfirmCheckout = async (e) => {
    e.preventDefault();
    if (!checkoutModalData) return;
    setSavingAction(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/attendance/${checkoutModalData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ checkOut: checkoutModalData.time })
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Check out failed');
      }
      showNotification(`Staff checked out successfully at ${checkoutModalData.time}`);
      setCheckoutModalData(null);
      fetchCustomerDetails();
    } catch (err) {
      alert(`Error recording check out: ${err.message}`);
    } finally {
      setSavingAction(false);
    }
  };

  // Open Add Modal for a given section
  const openAddModal = (type, overrides = {}) => {
    const tenantId = customer._id;
    let initialFormData = {};
    if (type === 'branch') {
      const existingBranchIds = new Set(branches.map(b => (b.branchId || b.branchCode || '').trim().toUpperCase()));
      let bCount = branches.length + 1;
      while (existingBranchIds.has(`BR-${String(bCount).padStart(3, '0')}`)) { bCount++; }
      const suggestedBranchId = `BR-${String(bCount).padStart(3, '0')}`;
      initialFormData = { tenantId, branchId: suggestedBranchId, name: '', location: '', manager: '', contactNumber: '', type: 'Store', ...overrides };
    } else if (type === 'employee') {
      const existingEmpIds = new Set(employees.map(e => (e.employeeId || '').trim().toUpperCase()));
      let eCount = employees.length + 1;
      while (existingEmpIds.has(`EMP-${String(eCount).padStart(3, '0')}`)) { eCount++; }
      const suggestedEmpId = `EMP-${String(eCount).padStart(3, '0')}`;
      initialFormData = { tenantId, employeeId: suggestedEmpId, name: '', email: '', position: '', contactNumber: '', salary: '', status: 'Active', ...overrides };
    } else if (type === 'business') {
      const existingBizIds = new Set(businesses.map(b => (b.businessId || b.businessCode || '').trim().toUpperCase()));
      let bizCount = businesses.length + 1;
      while (existingBizIds.has(`BIZ-${String(bizCount).padStart(3, '0')}`)) { bizCount++; }
      const suggestedBizId = `BIZ-${String(bizCount).padStart(3, '0')}`;
      initialFormData = { businessId: suggestedBizId, name: '', category: '', contactPerson: '', phone: '', email: '', taxNumber: '', city: '', address: '', offeringType: 'both', operationsType: 'both', ...overrides };
    } else if (type === 'expense') {
      initialFormData = { tenantId, title: '', category: '', amount: '', date: new Date().toISOString().split('T')[0], description: '', ...overrides };
    } else if (type === 'sale') {
      initialFormData = { tenantId, invoiceNo: '', customerName: '', amount: '', date: new Date().toISOString().split('T')[0], status: 'Paid', ...overrides };
    } else if (type === 'inventory') {
      initialFormData = { tenantId, itemName: '', sku: '', category: '', quantity: '', price: '', ...overrides };
    } else if (type === 'product') {
      initialFormData = { tenantId, name: '', sku: '', categoryId: categories[0]?._id || '', subCategoryId: '', price: '', stock: '', description: '', ...overrides };
    } else if (type === 'category') {
      initialFormData = { tenantId, name: '', itemType: 'product', transactionType: 'both', description: '', ...overrides };
    } else if (type === 'subcategory') {
      initialFormData = { tenantId, name: '', categoryId: categories[0]?._id || '', itemType: 'product', transactionType: 'both', description: '' };
    } else if (type === 'customer') {
      initialFormData = { tenantId, name: '', companyName: '', customerType: 'Retail', email: '', phone: '', address: '', ...overrides };
    } else if (type === 'purchase') {
      initialFormData = { tenantId, poNumber: '', supplierName: '', amount: '', date: new Date().toISOString().split('T')[0], status: 'Pending', ...overrides };
    } else if (type === 'attendance') {
      initialFormData = { tenantId, employeeId: employees[0]?._id || '', date: new Date().toISOString().split('T')[0], status: 'Present', checkIn: '09:00', ...overrides };
    } else if (type === 'leave') {
      initialFormData = { tenantId, employeeId: employees[0]?._id || '', type: 'Sick Leave', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], reason: '', status: 'Pending', ...overrides };
    } else if (type === 'reminder') {
      initialFormData = { tenantId, title: '', date: overrides.date || new Date().toISOString().split('T')[0], description: '', repeatMonthly: false, notifyBeforeDays: '', status: 'Pending', ...overrides };
    } else if (type === 'document') {
      initialFormData = { tenantId, title: '', type: 'Contract', fileUrl: '', expiryDate: '', ...overrides };
    }
    setAddModalData({ type, formData: initialFormData });
  };

  // Handle Add Form Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addModalData) return;
    setSavingAction(true);
    const { type, formData } = addModalData;

    // Sanitize numeric fields if left empty
    const sanitizedData = { ...formData };
    ['amount', 'price', 'salary', 'stock', 'quantity', 'notifyBeforeDays'].forEach(k => {
      if (k in sanitizedData) {
        sanitizedData[k] = sanitizedData[k] === '' || sanitizedData[k] === null || isNaN(Number(sanitizedData[k])) ? 0 : Number(sanitizedData[k]);
      }
    });

    let endpoint = '';
    if (type === 'branch') endpoint = `${apiUrl}/api/admin/branches`;
    else if (type === 'employee') endpoint = `${apiUrl}/api/admin/employees`;
    else if (type === 'business') endpoint = `${apiUrl}/api/admin/businesses/${customer._id}`;
    else if (type === 'expense') endpoint = `${apiUrl}/api/admin/expenses`;
    else if (type === 'sale') endpoint = `${apiUrl}/api/admin/sales`;
    else if (type === 'inventory') endpoint = `${apiUrl}/api/admin/inventory`;
    else if (type === 'product') endpoint = `${apiUrl}/api/admin/products`;
    else if (type === 'category') endpoint = `${apiUrl}/api/admin/categories`;
    else if (type === 'subcategory') endpoint = `${apiUrl}/api/admin/subcategories`;
    else if (type === 'customer') endpoint = `${apiUrl}/api/admin/customers`;
    else if (type === 'purchase') endpoint = `${apiUrl}/api/admin/purchases`;
    else if (type === 'attendance') endpoint = `${apiUrl}/api/admin/attendance`;
    else if (type === 'leave') endpoint = `${apiUrl}/api/admin/leaves`;
    else if (type === 'reminder') endpoint = `${apiUrl}/api/admin/reminders`;
    else if (type === 'document') endpoint = `${apiUrl}/api/admin/documents`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(sanitizedData)
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || errJson.error || 'Create failed');
      }
      showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);
      setAddModalData(null);
      fetchCustomerDetails();
    } catch (err) {
      alert(`Error adding ${type}: ${err.message}`);
    } finally {
      setSavingAction(false);
    }
  };

  // Open Edit Modal for a given item
  const openEditModal = (type, item) => {
    let initialFormData = {};

    if (type === 'user') {
      initialFormData = {
        fullName: item.fullName || '',
        businessName: item.businessName || '',
        email: item.email || '',
        phone: item.phone || '',
        industry: item.industry || '',
        address: item.address || '',
        regNo: item.regNo || '',
        subscriptionStatus: item.subscriptionStatus || 'Active',
        subscriptionBillingCycle: item.subscriptionBillingCycle || 'Monthly',
        subscriptionCustomAmount: item.subscriptionCustomAmount || ''
      };
    } else if (type === 'branch') {
      initialFormData = {
        branchId: item.branchId || item.branchCode || '',
        name: item.name || '',
        location: item.location || '',
        manager: item.manager || '',
        contactNumber: item.contactNumber || '',
        type: item.type || 'Store',
        isLoginEnabled: item.isLoginEnabled !== false
      };
    } else if (type === 'employee') {
      initialFormData = {
        employeeId: item.employeeId || '',
        name: item.name || '',
        email: item.email || '',
        position: item.position || item.designation || '',
        contactNumber: item.contactNumber || '',
        salary: item.salary || 0,
        shiftFrom: item.shiftFrom || '',
        shiftTo: item.shiftTo || '',
        status: item.status || 'Active',
        branchName: item.branchName || ''
      };
    } else if (type === 'business') {
      initialFormData = {
        businessId: item.businessId || item.businessCode || '',
        name: item.name || '',
        category: item.category || '',
        contactPerson: item.contactPerson || '',
        taxNumber: item.taxNumber || '',
        city: item.city || '',
        address: item.address || '',
        phone: item.phone || '',
        email: item.email || '',
        offeringType: item.offeringType || 'both',
        operationsType: item.operationsType || 'both'
      };
    } else if (type === 'expense') {
      initialFormData = {
        title: item.title || '',
        category: item.category || 'General',
        amount: item.amount || 0,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
        description: item.description || ''
      };
    } else if (type === 'sale') {
      initialFormData = {
        invoiceNo: item.invoiceNo || '',
        customerName: item.customerName || '',
        amount: item.amount || 0,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
        status: item.status || 'Paid'
      };
    } else if (type === 'inventory') {
      initialFormData = {
        itemName: item.itemName || item.name || '',
        sku: item.sku || '',
        category: item.category || 'General',
        quantity: item.quantity ?? item.stock ?? 0,
        price: item.price || 0
      };
    } else if (type === 'product') {
      initialFormData = {
        name: item.name || '',
        sku: item.sku || '',
        categoryId: item.categoryId?._id || item.categoryId || '',
        subCategoryId: item.subCategoryId?._id || item.subCategoryId || '',
        price: item.price || 0,
        stock: item.stock || 0,
        description: item.description || ''
      };
    } else if (type === 'category') {
      initialFormData = {
        name: item.name || '',
        itemType: item.itemType || 'product',
        transactionType: item.transactionType || 'both',
        description: item.description || ''
      };
    } else if (type === 'subcategory') {
      initialFormData = {
        name: item.name || '',
        categoryId: item.categoryId?._id || item.categoryId || '',
        itemType: item.itemType || 'product',
        transactionType: item.transactionType || 'both',
        description: item.description || ''
      };
    } else if (type === 'customer') {
      initialFormData = {
        name: item.name || '',
        companyName: item.companyName || '',
        customerType: item.customerType || 'Retail',
        gstin: item.gstin || '',
        email: item.email || '',
        phone: item.phone || '',
        address: item.address || ''
      };
    } else if (type === 'purchase') {
      initialFormData = {
        poNumber: item.poNumber || '',
        supplierName: item.supplierName || '',
        amount: item.amount || 0,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
        status: item.status || 'Pending'
      };
    } else if (type === 'attendance') {
      initialFormData = {
        employeeId: item.employeeId?._id || item.employeeId || '',
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
        status: item.status || 'Present',
        checkIn: item.checkIn || '',
        checkOut: item.checkOut || ''
      };
    } else if (type === 'leave') {
      initialFormData = {
        employeeId: item.employeeId?._id || item.employeeId || '',
        type: item.type || 'Sick Leave',
        startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
        endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
        reason: item.reason || '',
        status: item.status || 'Pending'
      };
    } else if (type === 'reminder') {
      initialFormData = {
        title: item.title || '',
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
        description: item.description || '',
        repeatMonthly: Boolean(item.repeatMonthly),
        notifyBeforeDays: item.notifyBeforeDays || 0,
        status: item.status || 'Pending'
      };
    } else if (type === 'document') {
      initialFormData = {
        title: item.title || '',
        type: item.type || 'Contract',
        fileUrl: item.fileUrl || '',
        expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ''
      };
    }

    setEditModalData({ type, data: item, formData: initialFormData });
  };

  // Sidebar navigation configuration
  const sidebarItems = [
    ...(businessType === 4 || businesses.length > 0 ? [{ id: 'businesses', label: 'Businesses', icon: Building2, count: counts.businesses }] : []),
    { id: 'branches', label: businessType === 2 ? 'Branch' : 'Branches', icon: Map, count: counts.branches },
    { id: 'products', label: 'Products & Services', icon: Package, count: counts.products },
    { id: 'inventory', label: 'Stock / Inventory', icon: Archive, count: counts.inventory },
    { id: 'customers', label: 'Customers', icon: UserCheck, count: counts.customers },
    { id: 'expenses', label: 'Expenses', icon: Receipt, count: counts.expenses },
    { id: 'purchases', label: 'Purchases', icon: ShoppingCart, count: counts.purchases },
    { id: 'sales', label: 'Billing / Sales', icon: TrendingUp, count: counts.sales },
    { id: 'documents', label: 'Documents', icon: FileText, count: counts.documents },
    { id: 'reminders', label: 'Reminders', icon: BellRing, count: counts.reminders },
    { id: 'employees', label: 'Employees / Staff', icon: Users, count: counts.employees },
    { id: 'attendance', label: 'Attendance', icon: Clock, count: counts.attendance },
    { id: 'leaves', label: 'Leave Requests', icon: Calendar, count: counts.leaves }
  ];

  if (loading && !details) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', gap: '16px' }}>
        <Loader2 size={44} color="#2563EB" style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ color: '#0F172A', fontSize: '18px', fontWeight: '600' }}>Loading Customer Workspace...</div>
        <div style={{ color: '#64748B', fontSize: '14px' }}>Loading sidebar modules, records, and operations</div>
      </div>
    );
  }

  if (error && !details) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '24px' }}>
        <div style={{ padding: '40px 24px', maxWidth: '520px', width: '100%', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <AlertCircle size={48} color="#EF4444" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#0F172A', fontSize: '20px' }}>Failed to Load Customer</h3>
          <p style={{ color: '#64748B', fontSize: '14px', margin: '0 0 24px 0' }}>{error}</p>
          <button onClick={() => navigate('/admin/customers')} className="btn-primary" style={{ padding: '10px 20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} /> Back to Customer Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden', background: '#F8FAFC' }}>
      
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '32px',
          background: '#059669',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 999999,
          fontSize: '14px',
          fontWeight: '600'
        }}>
          <CheckCircle2 size={18} />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* LEFT SIDEBAR: USER'S WORKSPACE MODULES */}
      {/* ============================================================ */}
      <aside style={{
        width: '260px',
        height: '100vh',
        background: 'white',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        zIndex: 20
      }}>
        
        {/* Sidebar Header: Return Back Button */}
        <div style={{ 
          height: '60px', 
          boxSizing: 'border-box',
          padding: '0 16px', 
          borderBottom: '1px solid #E2E8F0', 
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <button 
            onClick={() => navigate('/admin/customers')}
            style={{ 
              width: '100%',
              height: '36px',
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '8px', 
              background: '#F1F5F9', 
              border: '1px solid #E2E8F0', 
              borderRadius: '8px', 
              padding: '0 12px', 
              color: '#334155', 
              fontSize: '13px', 
              fontWeight: '600', 
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#E2E8F0'}
            onMouseOut={(e) => e.currentTarget.style.background = '#F1F5F9'}
          >
            <ArrowLeft size={15} /> Back to Customer Directory
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>

          {sidebarItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { 
                  setActiveSection(item.id); 
                  setSearchTerm(''); 
                  setCurrentPage(1);
                  setSortConfig({ key: null, direction: 'asc' });
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: isActive ? '#EFF6FF' : 'transparent',
                  color: isActive ? '#2563EB' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.15s',
                  textAlign: 'left'
                }}
                onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = '#F8FAFC'; }}
                onMouseOut={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={17} color={isActive ? '#2563EB' : '#64748B'} />
                  <span>{item.label}</span>
                </div>
                {item.count !== null && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    background: isActive ? '#DBEAFE' : '#F1F5F9',
                    color: isActive ? '#1D4ED8' : '#64748B'
                  }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Owner: <strong style={{ color: '#0F172A' }}>{customer.fullName}</strong>
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
            {typeLabel}
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* RIGHT MAIN CONTENT AREA */}
      {/* ============================================================ */}
      <main style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Control Bar */}
        <header style={{
          height: '60px',
          background: 'white',
          borderBottom: '1px solid #E2E8F0',
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: '16px'
        }}>
          {/* Left: Section Title & Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>
              {customer.businessName || `${customer.fullName}'s Business`}
            </span>
            <span style={{ color: '#CBD5E1' }}>/</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#2563EB', textTransform: 'capitalize' }}>
              {sidebarItems.find(s => s.id === activeSection)?.label || (activeSection === 'overview' ? 'Customer Profile' : activeSection)}
            </span>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            <button
              onClick={() => {
                setActiveSection('overview');
                setIsEditingProfile(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                background: activeSection === 'overview' ? '#EFF6FF' : '#F8FAFC',
                border: `1px solid ${activeSection === 'overview' ? '#BFDBFE' : '#E2E8F0'}`,
                borderRadius: '8px',
                color: activeSection === 'overview' ? '#1D4ED8' : '#334155',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <UserCheck size={14} /> Customer Profile
            </button>

            <button
              onClick={() => setDeleteConfirm({ type: 'user', id: customer._id, name: customer.businessName || customer.fullName })}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                background: '#FEE2E2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                color: '#DC2626',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={13} /> Delete Account
            </button>

            <button
              onClick={fetchCustomerDetails}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                color: '#475569',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              title="Refresh Customer Data"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </header>

        {/* Main Scrollable Canvas */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* ======================================================== */}
          {/* SECTION 1: CUSTOMER PROFILE */}
          {/* ======================================================== */}
          {activeSection === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
              
              {/* Profile Page Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.5px', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #DBEAFE' }}>
                      <UserCheck size={22} />
                    </div>
                    Customer Profile
                  </h1>
                  <p style={{ color: '#64748B', fontSize: '14px', margin: '4px 0 0 0' }}>
                    Manage customer identity, contact info, commercial details, and account security.
                  </p>
                </div>

                <div>
                  {!isEditingProfile ? (
                    <button 
                      onClick={() => setIsEditingProfile(true)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}
                    >
                      <Pencil size={15} /> Edit Profile
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(false);
                          if (customer) {
                            setProfileFormData({
                              fullName: customer.fullName || '',
                              businessName: customer.businessName || '',
                              email: customer.email || '',
                              phone: customer.phone || customer.businessPhone || '',
                              industry: customer.industry || '',
                              address: customer.address || '',
                              regNo: customer.regNo || '',
                              subscriptionStatus: customer.subscriptionStatus || 'Active',
                              subscriptionBillingCycle: customer.subscriptionBillingCycle || 'Monthly',
                              subscriptionCustomAmount: customer.subscriptionCustomAmount || '',
                              employeeLimit: customer.employeeLimit != null ? customer.employeeLimit : '',
                              branchLimit: customer.branchLimit != null ? customer.branchLimit : '',
                              businessLimit: customer.businessLimit != null ? customer.businessLimit : ''
                            });
                          }
                        }}
                        style={{ padding: '10px 18px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="button"
                        onClick={handleSaveCustomerProfile}
                        disabled={savingProfile}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}
                      >
                        {savingProfile ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Hero Overview Card */}
              <div style={{ 
                background: 'white', 
                borderRadius: '16px', 
                padding: '28px 32px', 
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)', 
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ 
                    width: '76px', 
                    height: '76px', 
                    borderRadius: '20px', 
                    background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '30px', 
                    fontWeight: '700', 
                    boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.3)',
                    flexShrink: 0
                  }}>
                    {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                        {customer.businessName || `${customer.fullName}'s Business`}
                      </h2>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        padding: '3px 10px', 
                        borderRadius: '12px', 
                        fontSize: '11px', 
                        fontWeight: '700', 
                        background: '#F1F5F9', 
                        color: '#334155', 
                        border: '1px solid #E2E8F0',
                        fontFamily: 'monospace'
                      }}>
                        ID: {customer.userId || customer.id || 'BT-TENANT'}
                      </span>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '5px', 
                        padding: '3px 10px', 
                        borderRadius: '12px', 
                        fontSize: '11px', 
                        fontWeight: '600', 
                        background: customer.subscriptionStatus === 'Active' ? '#ECFDF5' : '#FEF3C7', 
                        color: customer.subscriptionStatus === 'Active' ? '#059669' : '#D97706', 
                        border: `1px solid ${customer.subscriptionStatus === 'Active' ? '#D1FAE5' : '#FDE68A'}` 
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: customer.subscriptionStatus === 'Active' ? '#10B981' : '#F59E0B' }}></span>
                        {customer.subscriptionStatus || 'Active'} Tenant
                      </span>
                    </div>
                    <p style={{ color: '#64748B', margin: '4px 0 10px 0', fontSize: '14px' }}>
                      {customer.email}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {(() => {
                        const arch = getArchetypeInfo(businessType);
                        const ArchIcon = arch.icon;
                        return (
                          <span style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            fontSize: '12px', 
                            fontWeight: '600', 
                            background: arch.bg, 
                            color: arch.color, 
                            border: `1px solid ${arch.border}` 
                          }}>
                            <ArchIcon size={14} /> {arch.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '600' }}>Client Enrolled</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A', marginTop: '2px' }}>{formatDate(customer.createdAt)}</div>
                </div>
              </div>

              {/* Form or View Sections */}
              <form onSubmit={handleSaveCustomerProfile} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Section 1: Personal Information */}
                <div style={{ 
                  background: 'white', 
                  borderRadius: '16px', 
                  padding: '28px 32px', 
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)', 
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#0F172A', margin: 0 }}>Personal Information</h3>
                      <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>Customer identity details and primary contact channel</p>
                    </div>
                  </div>

                  {!isEditingProfile ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                      <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', marginBottom: '6px' }}>
                          <User size={15} />
                          <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>
                          {customer.fullName || <span style={{ color: '#94A3B8', fontStyle: 'italic', fontWeight: '400' }}>Not specified</span>}
                        </p>
                      </div>

                      <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B' }}>
                            <Mail size={15} />
                            <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</span>
                          </div>
                          <span style={{ fontSize: '11px', color: '#059669', background: '#ECFDF5', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>Login ID</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>
                          {customer.email || <span style={{ color: '#94A3B8', fontStyle: 'italic', fontWeight: '400' }}>Not specified</span>}
                        </p>
                      </div>

                      <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', marginBottom: '6px' }}>
                          <Phone size={15} />
                          <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>
                          {customer.phone || customer.businessPhone || <span style={{ color: '#94A3B8', fontStyle: 'italic', fontWeight: '400' }}>Not configured</span>}
                        </p>
                      </div>

                      <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', marginBottom: '6px' }}>
                          <ShieldCheck size={15} />
                          <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tenant User ID</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#2563EB', fontFamily: 'monospace' }}>
                          {customer.userId || customer.id || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                          <User size={14} color="#2563EB" /> Full Name <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input 
                          type="text" 
                          value={profileFormData.fullName} 
                          onChange={e => setProfileFormData({ ...profileFormData, fullName: e.target.value })} 
                          placeholder="e.g. Ajay Kumar"
                          required 
                          style={{ width: '100%', height: '42px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#64748B', marginBottom: '6px' }}>
                          <Mail size={14} color="#94A3B8" /> Email Address
                        </label>
                        <input 
                          type="email" 
                          value={customer.email || ''} 
                          disabled 
                          style={{ width: '100%', height: '42px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px', background: '#F8FAFC', color: '#64748B', cursor: 'not-allowed', boxSizing: 'border-box' }}
                        />
                        <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', display: 'block' }}>Email can be managed in Account Credentials below.</span>
                      </div>

                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                          <Phone size={14} color="#2563EB" /> Phone Number
                        </label>
                        <input 
                          type="tel" 
                          maxLength={10}
                          value={profileFormData.phone} 
                          onChange={e => setProfileFormData({ ...profileFormData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} 
                          placeholder="10-digit phone number"
                          style={{ width: '100%', height: '42px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: Business Information */}
                <div style={{ 
                  background: 'white', 
                  borderRadius: '16px', 
                  padding: '28px 32px', 
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)', 
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#0F172A', margin: 0 }}>Business Information</h3>
                      <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>Registered commercial entity and official premises</p>
                    </div>
                  </div>

                  {!isEditingProfile ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                      <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', marginBottom: '6px' }}>
                          <Building size={15} />
                          <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Business / Shop Name</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>
                          {customer.businessName || <span style={{ color: '#94A3B8', fontStyle: 'italic', fontWeight: '400' }}>Not configured</span>}
                        </p>
                      </div>

                      <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', marginBottom: '6px' }}>
                          <FileText size={15} />
                          <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registration / GSTIN No.</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#0F172A', fontFamily: 'monospace' }}>
                          {customer.regNo || <span style={{ color: '#94A3B8', fontStyle: 'italic', fontWeight: '400' }}>Not configured</span>}
                        </p>
                      </div>

                      <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', marginBottom: '6px' }}>
                          <Briefcase size={15} />
                          <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Industry</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>
                          {customer.industry || 'General Commerce'}
                        </p>
                      </div>

                      <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9', gridColumn: '1 / -1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', marginBottom: '6px' }}>
                          <MapPin size={15} />
                          <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Primary Address</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: customer.address ? '500' : '400', color: customer.address ? '#0F172A' : '#94A3B8', fontStyle: customer.address ? 'normal' : 'italic', lineHeight: '1.5' }}>
                          {customer.address || 'Not configured'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                          <Building size={14} color="#7C3AED" /> Business Name
                        </label>
                        <input 
                          type="text" 
                          value={profileFormData.businessName} 
                          onChange={e => setProfileFormData({ ...profileFormData, businessName: e.target.value })} 
                          placeholder="e.g. Ajay Enterprises"
                          style={{ width: '100%', height: '42px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                          <FileText size={14} color="#7C3AED" /> Reg / GSTIN No.
                        </label>
                        <input 
                          type="text" 
                          value={profileFormData.regNo} 
                          onChange={e => setProfileFormData({ ...profileFormData, regNo: e.target.value })} 
                          placeholder="e.g. 29ABCDE1234F1Z5"
                          style={{ width: '100%', height: '42px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                          <Briefcase size={14} color="#7C3AED" /> Industry
                        </label>
                        <input 
                          type="text" 
                          value={profileFormData.industry} 
                          onChange={e => setProfileFormData({ ...profileFormData, industry: e.target.value })} 
                          placeholder="e.g. Retail, Tech, Manufacturing"
                          style={{ width: '100%', height: '42px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                          <MapPin size={14} color="#7C3AED" /> Primary Address
                        </label>
                        <textarea 
                          rows={3}
                          value={profileFormData.address} 
                          onChange={e => setProfileFormData({ ...profileFormData, address: e.target.value })} 
                          placeholder="Full address, city, state, pincode"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Subscription & Billing Plan */}
                <div style={{ 
                  background: 'white', 
                  borderRadius: '16px', 
                  padding: '28px 32px', 
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)', 
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#0F172A', margin: 0 }}>Subscription & Billing Plan</h3>
                      <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>Current active tier, billing frequency, and renewal schedule</p>
                    </div>
                  </div>

                  {!isEditingProfile ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                      <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Status</div>
                        <span style={{ fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '12px', background: customer.subscriptionStatus === 'Active' ? '#DCFCE7' : '#FEE2E2', color: customer.subscriptionStatus === 'Active' ? '#15803D' : '#B91C1C' }}>
                          {customer.subscriptionStatus || 'Active'}
                        </span>
                      </div>

                      <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Billing Cycle</div>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>
                          {customer.subscriptionBillingCycle || 'Monthly'}
                        </p>
                      </div>

                      <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Plan Rate</div>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#059669' }}>
                          {customer.subscriptionCustomAmount ? formatCurrency(customer.subscriptionCustomAmount) : (businessType === 1 ? '₹499/mo' : businessType === 2 ? '₹999/mo' : businessType === 3 ? '₹1,999/mo' : '₹3,499/mo')}
                        </p>
                      </div>

                      <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Next Renewal</div>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>
                          {formatDate(customer.subscriptionRenewalDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
                        </p>
                      </div>

                      <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Employee Limit</div>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: customer.employeeLimit ? '#2563EB' : '#059669' }}>
                          {customer.employeeLimit ? `${customer.employeeLimit} Employees` : 'Unlimited (No Limit)'}
                        </p>
                      </div>

                      {(businessType === 3 || businessType === 4) && (
                        <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Branch Limit</div>
                          <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: customer.branchLimit ? '#166534' : '#059669' }}>
                            {customer.branchLimit ? `${customer.branchLimit} Branches` : 'Unlimited'}
                          </p>
                        </div>
                      )}

                      {businessType === 4 && (
                        <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Business Limit</div>
                          <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: customer.businessLimit ? '#6B21A8' : '#059669' }}>
                            {customer.businessLimit ? `${customer.businessLimit} Businesses` : 'Unlimited'}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                          Subscription Status
                        </label>
                        <select 
                          value={profileFormData.subscriptionStatus} 
                          onChange={e => setProfileFormData({ ...profileFormData, subscriptionStatus: e.target.value })} 
                          style={{ width: '100%', height: '42px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', background: 'white' }}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Suspended">Suspended</option>
                          <option value="Trial">Trial</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                          Billing Cycle
                        </label>
                        <select 
                          value={profileFormData.subscriptionBillingCycle} 
                          onChange={e => setProfileFormData({ ...profileFormData, subscriptionBillingCycle: e.target.value })} 
                          style={{ width: '100%', height: '42px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', background: 'white' }}
                        >
                          <option value="Monthly">Monthly</option>
                          <option value="Quarterly">Quarterly</option>
                          <option value="Yearly">Yearly</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                          Custom Plan Amount (₹)
                        </label>
                        <input 
                          type="number" 
                          value={profileFormData.subscriptionCustomAmount} 
                          onChange={e => setProfileFormData({ ...profileFormData, subscriptionCustomAmount: e.target.value })} 
                          placeholder="Leave blank for standard tier rate"
                          style={{ width: '100%', height: '42px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                          Max Employee Limit
                        </label>
                        <input 
                          type="number" 
                          min="0"
                          value={profileFormData.employeeLimit} 
                          onChange={e => setProfileFormData({ ...profileFormData, employeeLimit: e.target.value })} 
                          placeholder="Leave blank for Unlimited"
                          style={{ width: '100%', height: '42px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                          Leave empty or 0 for unlimited employee creation
                        </span>
                      </div>

                      {(businessType === 3 || businessType === 4) && (
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                            Max Branch Limit (Type 3 & 4)
                          </label>
                          <input 
                            type="number" 
                            min="0"
                            value={profileFormData.branchLimit} 
                            onChange={e => setProfileFormData({ ...profileFormData, branchLimit: e.target.value })} 
                            placeholder="Leave blank for Unlimited"
                            style={{ width: '100%', height: '42px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                          />
                          <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                            Leave empty or 0 for unlimited branch creation
                          </span>
                        </div>
                      )}

                      {businessType === 4 && (
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                            Max Business Limit (Type 4)
                          </label>
                          <input 
                            type="number" 
                            min="0"
                            value={profileFormData.businessLimit} 
                            onChange={e => setProfileFormData({ ...profileFormData, businessLimit: e.target.value })} 
                            placeholder="Leave blank for Unlimited"
                            style={{ width: '100%', height: '42px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                          />
                          <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                            Leave empty or 0 for unlimited business creation
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Section 4: Primary Login Access & Security */}
                <div style={{ 
                  background: 'white', 
                  borderRadius: '16px', 
                  padding: '28px 32px', 
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)', 
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <KeyRound size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#0F172A', margin: 0 }}>Account Credentials & Security</h3>
                        <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>Tenant primary authentication and secure sign-in status</p>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => handleOpenLoginModal('user', customer)} 
                      style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#1D4ED8',
                        fontSize: '13px', 
                        fontWeight: '600', 
                        cursor: 'pointer' 
                      }}
                    >
                      <KeyRound size={15} /> Manage Login Credentials
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                    <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Login Email</div>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>{customer.email}</p>
                    </div>

                    <div style={{ padding: '16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Password Encryption</div>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748B'}}>••••••••</p>
                    </div>
                  </div>
                </div>

                {/* Subscribed Modules */}
                <div style={{ 
                  background: 'white', 
                  borderRadius: '16px', 
                  padding: '28px 32px', 
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)', 
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ fontSize: '13px', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={17} /> Subscribed Modules & Privileges
                  </div>
                  {customer.modules && customer.modules.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {customer.modules.map(mod => (
                        <span key={mod} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', fontSize: '13px', fontWeight: '600', border: '1px solid #BFDBFE' }}>
                          <CheckCircle2 size={14} color="#2563EB" />
                          {mod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#64748B', fontSize: '14px' }}>All standard business modules active for this tenant account.</div>
                  )}
                </div>

              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 2: ATTENDANCE */}
          {/* ======================================================== */}
          {activeSection === 'attendance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #DBEAFE' }}>
                      <Clock size={22} />
                    </div>
                    Attendance Management
                  </h1>
                  <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                    Monitor staff daily attendance check-ins, check-outs, and presence tracking.
                  </p>
                </div>
                <button 
                  onClick={() => openAddModal('attendance')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}
                >
                  <Plus size={17} /> Mark Attendance
                </button>
              </div>

              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Logs</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{attendance.length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Present Staff</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{attendance.filter(a => a.status === 'Present').length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertCircle size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Absent / Other</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{attendance.filter(a => a.status !== 'Present').length}</h3>
                  </div>
                </div>
              </div>

              {/* Search, Filter, Export Bar */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: '0 1 360px', minWidth: '260px', position: 'relative' }}>
                  <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Search attendance by staff, status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '11px 16px 11px 44px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select 
                    value={filterDays} 
                    onChange={(e) => setFilterDays(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '13px', color: '#334155', fontWeight: '500', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="all">Filter: All Time</option>
                    <option value="today">Today</option>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="thisMonth">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>

                  {filterDays === 'custom' && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none' }} />
                      <span style={{ color: '#94A3B8', fontSize: '12px' }}>to</span>
                      <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none' }} />
                    </div>
                  )}

                  <button 
                    onClick={() => exportSectionCSV('attendance')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <Download size={15} /> Export
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '60px' }}>S.No</th>
                        <th onClick={() => requestSort('date')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Date {renderSortIcon('date')}</div>
                        </th>
                        <th onClick={() => requestSort('employee')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Employee {renderSortIcon('employee')}</div>
                        </th>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Check In</th>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Check Out</th>
                        <th onClick={() => requestSort('status')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Status {renderSortIcon('status')}</div>
                        </th>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAttendance.length === 0 ? (
                        <tr><td colSpan="7" style={{ padding: '36px 20px', textAlign: 'center', color: '#64748B' }}>No attendance records found.</td></tr>
                      ) : (
                        paginatedAttendance.map((item, idx) => (
                          <tr key={item._id || idx} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                            <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748B', fontWeight: '500' }}>{startIndex + idx + 1}</td>
                            <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>{formatDate(item.date)}</td>
                            <td style={{ padding: '14px 20px' }}>
                              <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>{item.employeeId?.name || item.employeeName || 'Staff Member'}</div>
                              <div style={{ fontSize: '11px', color: '#64748B' }}>{item.employeeId?.position || item.employeeId?.email || ''}</div>
                            </td>
                            <td style={{ padding: '14px 20px', color: '#475569', fontSize: '13px' }}>{item.checkIn || '09:00 AM'}</td>
                            <td style={{ padding: '14px 20px', color: '#475569', fontSize: '13px' }}>
                              {item.checkOut ? (
                                <span style={{ fontWeight: '600', color: '#0F172A', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={13} color="#64748B" /> {item.checkOut}
                                </span>
                              ) : (
                                <button
                                  onClick={() => setCheckoutModalData({
                                    id: item._id,
                                    employeeName: item.employeeId?.name || item.employeeName || 'Staff Member',
                                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                                  })}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                                    padding: '5px 10px', borderRadius: '6px',
                                    background: '#EFF6FF', color: '#2563EB',
                                    border: '1px solid #DBEAFE', fontSize: '12px', fontWeight: '600',
                                    cursor: 'pointer'
                                  }}
                                  title="Record Check Out"
                                >
                                  <LogOut size={13} /> Check Out
                                </button>
                              )}
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', background: item.status === 'Present' ? '#DCFCE7' : item.status === 'Absent' ? '#FEE2E2' : '#FEF3C7', color: item.status === 'Present' ? '#15803D' : item.status === 'Absent' ? '#B91C1C' : '#B45309', fontWeight: '600' }}>
                                {item.status || 'Present'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                {!item.checkOut && (
                                  <button 
                                    onClick={() => setCheckoutModalData({
                                      id: item._id,
                                      employeeName: item.employeeId?.name || item.employeeName || 'Staff Member',
                                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                                    })} 
                                    style={{ padding: '6px', borderRadius: '6px', background: '#EFF6FF', border: 'none', color: '#2563EB', cursor: 'pointer' }}
                                    title="Check Out Staff"
                                  >
                                    <LogOut size={15} />
                                  </button>
                                )}
                                <button onClick={() => setViewModalData({ type: 'attendance', data: item })} style={{ padding: '6px', borderRadius: '6px', background: '#F1F5F9', border: 'none', color: '#475569', cursor: 'pointer' }} title="View Details"><Eye size={15} /></button>
                                <button onClick={() => openEditModal('attendance', item)} style={{ padding: '6px', borderRadius: '6px', background: '#EFF6FF', border: 'none', color: '#2563EB', cursor: 'pointer' }} title="Edit"><Edit2 size={15} /></button>
                                <button onClick={() => setDeleteConfirm({ type: 'attendance', id: item._id, name: `Attendance on ${formatDate(item.date)}` })} style={{ padding: '6px', borderRadius: '6px', background: '#FEE2E2', border: 'none', color: '#EF4444', cursor: 'pointer' }} title="Delete"><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalItems={filteredAttendance.length}
                  itemsPerPage={itemsPerPage}
                  setItemsPerPage={setItemsPerPage}
                  itemName="attendance logs"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 3: LEAVE REQUESTS */}
          {/* ======================================================== */}
          {activeSection === 'leaves' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #DBEAFE' }}>
                      <Calendar size={22} />
                    </div>
                    Leaves Management
                  </h1>
                  <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                    Track, review, approve, and manage staff leave requests and off-days.
                  </p>
                </div>
                <button 
                  onClick={() => openAddModal('leave')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}
                >
                  <Plus size={17} /> Add Leave
                </button>
              </div>

              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Requests</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{leaves.length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Approved</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{leaves.filter(l => l.status === 'Approved').length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Pending Review</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{leaves.filter(l => l.status === 'Pending' || !l.status).length}</h3>
                  </div>
                </div>
              </div>

              {/* Search, Filter, Export Bar */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: '0 1 360px', minWidth: '260px', position: 'relative' }}>
                  <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Search leave requests by staff, type, reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '11px 16px 11px 44px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select 
                    value={filterDays} 
                    onChange={(e) => setFilterDays(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '13px', color: '#334155', fontWeight: '500', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="all">Filter: All Time</option>
                    <option value="today">Today</option>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="thisMonth">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>

                  {filterDays === 'custom' && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none' }} />
                      <span style={{ color: '#94A3B8', fontSize: '12px' }}>to</span>
                      <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none' }} />
                    </div>
                  )}

                  <button 
                    onClick={() => exportSectionCSV('leaves')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <Download size={15} /> Export
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '60px' }}>S.No</th>
                        <th onClick={() => requestSort('employee')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Employee {renderSortIcon('employee')}</div>
                        </th>
                        <th onClick={() => requestSort('type')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Leave Type {renderSortIcon('type')}</div>
                        </th>
                        <th onClick={() => requestSort('startDate')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Start Date {renderSortIcon('startDate')}</div>
                        </th>
                        <th onClick={() => requestSort('endDate')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>End Date {renderSortIcon('endDate')}</div>
                        </th>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Reason</th>
                        <th onClick={() => requestSort('status')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Status {renderSortIcon('status')}</div>
                        </th>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeaves.length === 0 ? (
                        <tr><td colSpan="8" style={{ padding: '36px 20px', textAlign: 'center', color: '#64748B' }}>No leave applications logged.</td></tr>
                      ) : (
                        paginatedLeaves.map((item, idx) => (
                          <tr key={item._id || idx} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                            <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748B', fontWeight: '500' }}>{startIndex + idx + 1}</td>
                            <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>
                              {item.employeeId?.name || item.employeeName || 'Staff Member'}
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: '#F1F5F9', color: '#475569', fontWeight: '500' }}>
                                {item.type}
                              </span>
                            </td>
                            <td style={{ padding: '14px 20px', color: '#475569', fontSize: '13px' }}>{formatDate(item.startDate)}</td>
                            <td style={{ padding: '14px 20px', color: '#475569', fontSize: '13px' }}>{formatDate(item.endDate)}</td>
                            <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '13px', maxWidth: '180px' }}>{item.reason || '—'}</td>
                            <td style={{ padding: '14px 20px' }}>
                              <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', background: item.status === 'Approved' ? '#DCFCE7' : item.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7', color: item.status === 'Approved' ? '#15803D' : item.status === 'Rejected' ? '#B91C1C' : '#B45309', fontWeight: '600' }}>
                                {item.status || 'Pending'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                <button onClick={() => setViewModalData({ type: 'leave', data: item })} style={{ padding: '6px', borderRadius: '6px', background: '#F1F5F9', border: 'none', color: '#475569', cursor: 'pointer' }}><Eye size={15} /></button>
                                <button onClick={() => openEditModal('leave', item)} style={{ padding: '6px', borderRadius: '6px', background: '#EFF6FF', border: 'none', color: '#2563EB', cursor: 'pointer' }}><Edit2 size={15} /></button>
                                <button onClick={() => setDeleteConfirm({ type: 'leave', id: item._id, name: `${item.type} for ${item.employeeId?.name || 'Staff'}` })} style={{ padding: '6px', borderRadius: '6px', background: '#FEE2E2', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalItems={filteredLeaves.length}
                  itemsPerPage={itemsPerPage}
                  setItemsPerPage={setItemsPerPage}
                  itemName="leave requests"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 4: REMINDERS & EVENT CALENDAR */}
          {/* ======================================================== */}
          {activeSection === 'reminders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #DBEAFE' }}>
                      <Calendar size={22} />
                    </div>
                    Reminders & Event Calendar
                  </h1>
                  <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                    Click on any date to schedule reminders, monthly repeating bills, and advance notification alerts.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {/* View Mode Switcher */}
                  <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '8px' }}>
                    <button
                      onClick={() => setRemindersViewMode('calendar')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '6px',
                        fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer',
                        background: remindersViewMode === 'calendar' ? 'white' : 'transparent',
                        color: remindersViewMode === 'calendar' ? '#2563EB' : '#64748B',
                        boxShadow: remindersViewMode === 'calendar' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <CalendarDays size={16} /> Calendar
                    </button>
                    <button
                      onClick={() => setRemindersViewMode('list')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '6px',
                        fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer',
                        background: remindersViewMode === 'list' ? 'white' : 'transparent',
                        color: remindersViewMode === 'list' ? '#2563EB' : '#64748B',
                        boxShadow: remindersViewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <List size={16} /> Table View
                    </button>
                  </div>

                  <button 
                    onClick={() => openAddModal('reminder', { date: formatReminderDateKey(reminderSelectedDate) })} 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}
                  >
                    <Plus size={17} /> Add Reminder
                  </button>
                </div>
              </div>

              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '18px' }}>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Scheduled</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{reminders.length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bell size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Pending Action</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{reminders.filter(r => r.status !== 'Completed').length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Completed</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{reminders.filter(r => r.status === 'Completed').length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Repeat size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Monthly Recurring</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{reminders.filter(r => r.repeatMonthly).length}</h3>
                  </div>
                </div>
              </div>

              {/* Mode 1: Calendar View */}
              {remindersViewMode === 'calendar' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '24px', alignItems: 'start' }}>
                  
                  {/* Calendar Grid Box */}
                  <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(15,23,42,0.03)', minWidth: 0, overflow: 'hidden' }}>
                    
                    {/* Month Header & Prev/Next */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                          {monthNames[reminderCurrentDate.getMonth()]} {reminderCurrentDate.getFullYear()}
                        </h2>
                        <button
                          onClick={handleReminderToday}
                          style={{
                            padding: '4px 10px', fontSize: '12px', fontWeight: '600',
                            background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '6px',
                            color: '#475569', cursor: 'pointer'
                          }}
                        >
                          Today
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          onClick={handleReminderPrevMonth}
                          style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          title="Previous month"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button 
                          onClick={handleReminderNextMonth}
                          style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          title="Next month"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Weekday Labels */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '8px', textAlign: 'center', marginBottom: '8px' }}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                        <div key={i} style={{ fontSize: '12px', fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '6px 0' }}>
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '8px' }}>
                      {reminderCalendarDays.map((slot, index) => {
                        const dayReminders = getRemindersForDate(slot.date);
                        const isCurrent = isReminderToday(slot.date);
                        const isSel = isReminderSelected(slot.date);

                        return (
                          <div
                            key={index}
                            onClick={() => setReminderSelectedDate(slot.date)}
                            style={{
                              minHeight: '84px',
                              minWidth: 0,
                              overflow: 'hidden',
                              boxSizing: 'border-box',
                              borderRadius: '10px',
                              padding: '8px',
                              cursor: 'pointer',
                              border: isSel 
                                ? '2px solid #2563EB' 
                                : isCurrent 
                                  ? '1px solid #93C5FD' 
                                  : '1px solid #F1F5F9',
                              background: isSel 
                                ? '#EFF6FF' 
                                : slot.isCurrentMonth 
                                  ? '#FFFFFF' 
                                  : '#F8FAFC',
                              opacity: slot.isCurrentMonth ? 1 : 0.5,
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              position: 'relative'
                            }}
                            onMouseOver={e => { if (!isSel) e.currentTarget.style.borderColor = '#2563EB'; }}
                            onMouseOut={e => { if (!isSel) e.currentTarget.style.borderColor = isCurrent ? '#93C5FD' : '#F1F5F9'; }}
                          >
                            {/* Top Row: Date Number & Count Badge */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{
                                width: '24px', height: '24px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '13px', fontWeight: isCurrent ? '700' : '500',
                                background: isCurrent ? '#2563EB' : 'transparent',
                                color: isCurrent ? 'white' : '#0F172A'
                              }}>
                                {slot.date.getDate()}
                              </span>

                              {dayReminders.length > 0 && (
                                <span style={{ fontSize: '10px', fontWeight: '700', color: '#2563EB', background: '#DBEAFE', borderRadius: '10px', padding: '1px 5px' }}>
                                  {dayReminders.length}
                                </span>
                              )}
                            </div>

                            {/* Event Badges inside Cell */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px', minWidth: 0, width: '100%', overflow: 'hidden' }}>
                              {dayReminders.slice(0, 2).map((item, idx) => (
                                <div
                                  key={idx}
                                  title={item.title}
                                  style={{
                                    fontSize: '11px',
                                    padding: '2px 5px',
                                    borderRadius: '4px',
                                    background: '#EFF6FF',
                                    color: '#1E40AF',
                                    border: '1px solid #DBEAFE',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontWeight: '500',
                                    minWidth: 0,
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    textDecoration: item.status === 'Completed' ? 'line-through' : 'none'
                                  }}
                                >
                                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#2563EB', flexShrink: 0 }}></span>
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{item.title}</span>
                                  {item.repeatMonthly && <Repeat size={10} style={{ flexShrink: 0 }} />}
                                </div>
                              ))}
                              {dayReminders.length > 2 && (
                                <span style={{ fontSize: '10px', color: '#94A3B8', textAlign: 'right', fontWeight: '600' }}>
                                  +{dayReminders.length - 2} more
                                </span>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>

                  </div>

                  {/* Side Panel: Selected Date Details */}
                  <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(15,23,42,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Selected Date
                        </p>
                        <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>
                          {monthNames[reminderSelectedDate.getMonth()]} {reminderSelectedDate.getDate()}, {reminderSelectedDate.getFullYear()}
                        </h3>
                      </div>
                      <button
                        onClick={() => openAddModal('reminder', { date: formatReminderDateKey(reminderSelectedDate) })}
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: '#EFF6FF', border: '1px solid #DBEAFE', color: '#2563EB',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}
                        title="Add event for this date"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    {/* List of Reminders for this day */}
                    {selectedDayReminders.length === 0 ? (
                      <div style={{ padding: '36px 16px', textAlign: 'center', color: '#94A3B8' }}>
                        <Bell size={32} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>No reminders scheduled</p>
                        <p style={{ margin: '4px 0 16px 0', fontSize: '12px', color: '#64748B' }}>
                          Click below to set an alert or recurring monthly event.
                        </p>
                        <button
                          onClick={() => openAddModal('reminder', { date: formatReminderDateKey(reminderSelectedDate) })}
                          className="btn-primary"
                          style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Plus size={14} /> Schedule for this day
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {selectedDayReminders.map(item => (
                          <div 
                            key={item._id}
                            style={{
                              padding: '14px',
                              borderRadius: '10px',
                              background: item.status === 'Completed' ? '#F8FAFC' : 'white',
                              border: '1px solid #E2E8F0',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  {item.repeatMonthly && (
                                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', background: '#F5F3FF', color: '#6D28D9', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                      <Repeat size={11} /> Monthly (Current Year)
                                    </span>
                                  )}
                                  {item.notifyBeforeDays > 0 && (
                                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                      <Bell size={11} /> {item.notifyBeforeDays}d Advance
                                    </span>
                                  )}
                                </div>
                                <h4 style={{ 
                                  fontSize: '15px', fontWeight: '600', color: '#0F172A', margin: '6px 0 0 0',
                                  textDecoration: item.status === 'Completed' ? 'line-through' : 'none',
                                  opacity: item.status === 'Completed' ? 0.6 : 1
                                }}>
                                  {item.title}
                                </h4>
                              </div>

                              {/* Quick action buttons */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <button
                                  onClick={() => handleToggleReminderStatus(item)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: item.status === 'Completed' ? '#16A34A' : '#94A3B8', padding: '4px' }}
                                  title={item.status === 'Completed' ? 'Mark Pending' : 'Mark Complete'}
                                >
                                  <CheckCircle2 size={18} />
                                </button>
                                <button
                                  onClick={() => openEditModal('reminder', item)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px' }}
                                  title="Edit"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm({ type: 'reminder', id: item._id, name: item.title })}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '4px' }}
                                  title="Delete"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>

                            {item.description && (
                              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B', lineHeight: '1.4' }}>
                                {item.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                /* Mode 2: Table / List View */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Search, Filter, Export Bar */}
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: '0 1 360px', minWidth: '260px', position: 'relative' }}>
                      <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input 
                        type="text" 
                        placeholder="Search reminders by title, note, status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '11px 16px 11px 44px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                      />
                      {searchTerm && (
                        <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
                          <X size={15} />
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <select 
                        value={filterDays} 
                        onChange={(e) => setFilterDays(e.target.value)}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '13px', color: '#334155', fontWeight: '500', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="all">Filter: All Time</option>
                        <option value="today">Today</option>
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="thisMonth">This Month</option>
                        <option value="custom">Custom Range</option>
                      </select>

                      {filterDays === 'custom' && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none' }} />
                          <span style={{ color: '#94A3B8', fontSize: '12px' }}>to</span>
                          <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none' }} />
                        </div>
                      )}

                      <button 
                        onClick={() => exportSectionCSV('reminders')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <Download size={15} /> Export
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto', width: '100%' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                        <thead>
                          <tr style={{ background: '#F8FAFC' }}>
                            <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '60px' }}>S.No</th>
                            <th onClick={() => requestSort('title')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>Title {renderSortIcon('title')}</div>
                            </th>
                            <th onClick={() => requestSort('date')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>Due Date {renderSortIcon('date')}</div>
                            </th>
                            <th onClick={() => requestSort('repeatMonthly')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>Repeat Monthly {renderSortIcon('repeatMonthly')}</div>
                            </th>
                            <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Advance Notice</th>
                            <th onClick={() => requestSort('status')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>Status {renderSortIcon('status')}</div>
                            </th>
                            <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReminders.length === 0 ? (
                            <tr><td colSpan="7" style={{ padding: '36px 20px', textAlign: 'center', color: '#64748B' }}>No reminders found.</td></tr>
                          ) : (
                            paginatedReminders.map((item, idx) => (
                              <tr key={item._id || idx} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                                <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748B', fontWeight: '500' }}>{startIndex + idx + 1}</td>
                                <td style={{ padding: '14px 20px' }}>
                                  <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>{item.title}</div>
                                  {item.description && <div style={{ fontSize: '11px', color: '#64748B' }}>{item.description}</div>}
                                </td>
                                <td style={{ padding: '14px 20px', color: '#0F172A', fontWeight: '500', fontSize: '13px' }}>{formatDate(item.date)}</td>
                                <td style={{ padding: '14px 20px' }}>
                                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: item.repeatMonthly ? '#F5F3FF' : '#F1F5F9', color: item.repeatMonthly ? '#7C3AED' : '#64748B', fontWeight: '600' }}>
                                    {item.repeatMonthly ? 'Yes (Monthly)' : 'No'}
                                  </span>
                                </td>
                                <td style={{ padding: '14px 20px', color: '#475569', fontSize: '13px' }}>{item.notifyBeforeDays ? `${item.notifyBeforeDays} days prior` : 'On the day'}</td>
                                <td style={{ padding: '14px 20px' }}>
                                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', background: item.status === 'Completed' ? '#DCFCE7' : '#FEF3C7', color: item.status === 'Completed' ? '#15803D' : '#B45309', fontWeight: '600' }}>
                                    {item.status || 'Pending'}
                                  </span>
                                </td>
                                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                    <button onClick={() => setViewModalData({ type: 'reminder', data: item })} style={{ padding: '6px', borderRadius: '6px', background: '#F1F5F9', border: 'none', color: '#475569', cursor: 'pointer' }}><Eye size={15} /></button>
                                    <button onClick={() => openEditModal('reminder', item)} style={{ padding: '6px', borderRadius: '6px', background: '#EFF6FF', border: 'none', color: '#2563EB', cursor: 'pointer' }}><Edit2 size={15} /></button>
                                    <button onClick={() => setDeleteConfirm({ type: 'reminder', id: item._id, name: item.title })} style={{ padding: '6px', borderRadius: '6px', background: '#FEE2E2', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={15} /></button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <TablePagination
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      totalItems={filteredReminders.length}
                      itemsPerPage={itemsPerPage}
                      setItemsPerPage={setItemsPerPage}
                      itemName="reminders"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 5: DOCUMENTS */}
          {/* ======================================================== */}
          {activeSection === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #DBEAFE' }}>
                      <FileText size={22} />
                    </div>
                    Documents Management
                  </h1>
                  <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                    Store, organize, and track business licenses, GST certificates, and regulatory files.
                  </p>
                </div>
                <button 
                  onClick={() => openAddModal('document')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}
                >
                  <Plus size={17} /> Add Document
                </button>
              </div>

              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Documents</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{documents.length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ExternalLink size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Files Attached</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{documents.filter(d => d.fileUrl).length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Layers size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Categories</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{new Set(documents.map(d => d.type).filter(Boolean)).size || (documents.length > 0 ? 1 : 0)}</h3>
                  </div>
                </div>
              </div>

              {/* Search, Filter, Export Bar */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: '0 1 360px', minWidth: '260px', position: 'relative' }}>
                  <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Search documents by title, category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '11px 16px 11px 44px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select 
                    value={filterDays} 
                    onChange={(e) => setFilterDays(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '13px', color: '#334155', fontWeight: '500', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="all">Filter: All Time</option>
                    <option value="today">Today</option>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="thisMonth">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>

                  {filterDays === 'custom' && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none' }} />
                      <span style={{ color: '#94A3B8', fontSize: '12px' }}>to</span>
                      <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none' }} />
                    </div>
                  )}

                  <button 
                    onClick={() => exportSectionCSV('documents')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <Download size={15} /> Export
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '60px' }}>S.No</th>
                        <th onClick={() => requestSort('title')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Document Title {renderSortIcon('title')}</div>
                        </th>
                        <th onClick={() => requestSort('type')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Document Type {renderSortIcon('type')}</div>
                        </th>
                        <th onClick={() => requestSort('expiryDate')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Expiry Date {renderSortIcon('expiryDate')}</div>
                        </th>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>File Link</th>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocuments.length === 0 ? (
                        <tr><td colSpan="6" style={{ padding: '36px 20px', textAlign: 'center', color: '#64748B' }}>No documents uploaded.</td></tr>
                      ) : (
                        paginatedDocuments.map((item, idx) => (
                          <tr key={item._id || idx} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                            <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748B', fontWeight: '500' }}>{startIndex + idx + 1}</td>
                            <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>{item.title}</td>
                            <td style={{ padding: '14px 20px' }}>
                              <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: '#F1F5F9', color: '#475569', fontWeight: '500' }}>
                                {item.type || 'General'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 20px', color: '#475569', fontSize: '13px' }}>{formatDate(item.expiryDate)}</td>
                            <td style={{ padding: '14px 20px' }}>
                              {item.fileUrl ? (
                                <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563EB', fontSize: '12px', fontWeight: '600' }}>
                                  <ExternalLink size={12} /> Open File
                                </a>
                              ) : <span style={{ color: '#94A3B8', fontSize: '12px' }}>None</span>}
                            </td>
                            <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                <button onClick={() => setViewModalData({ type: 'document', data: item })} style={{ padding: '6px', borderRadius: '6px', background: '#F1F5F9', border: 'none', color: '#475569', cursor: 'pointer' }}><Eye size={15} /></button>
                                <button onClick={() => openEditModal('document', item)} style={{ padding: '6px', borderRadius: '6px', background: '#EFF6FF', border: 'none', color: '#2563EB', cursor: 'pointer' }}><Edit2 size={15} /></button>
                                <button onClick={() => setDeleteConfirm({ type: 'document', id: item._id, name: item.title })} style={{ padding: '6px', borderRadius: '6px', background: '#FEE2E2', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalItems={filteredDocuments.length}
                  itemsPerPage={itemsPerPage}
                  setItemsPerPage={setItemsPerPage}
                  itemName="documents"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 6: PURCHASES */}
          {/* ======================================================== */}
          {activeSection === 'purchases' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #DBEAFE' }}>
                      <ShoppingCart size={22} />
                    </div>
                    Purchases & Procurement
                  </h1>
                  <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                    Track vendor purchase orders, inventory restocking, and procurement balances.
                  </p>
                </div>
                <button 
                  onClick={() => openAddModal('purchase')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}
                >
                  <Plus size={17} /> Add Purchase
                </button>
              </div>

              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IndianRupee size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Spend</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{formatCurrency(financials.totalPurchases)}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingCart size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Purchase Orders</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{purchases.length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Completed Orders</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{purchases.filter(p => p.status === 'Completed').length}</h3>
                  </div>
                </div>
              </div>

              {/* Search, Filter, Export Bar */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: '0 1 360px', minWidth: '260px', position: 'relative' }}>
                  <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Search purchases by PO, supplier, status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '11px 16px 11px 44px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select 
                    value={filterDays} 
                    onChange={(e) => setFilterDays(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '13px', color: '#334155', fontWeight: '500', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="all">Filter: All Time</option>
                    <option value="today">Today</option>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="thisMonth">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>

                  {filterDays === 'custom' && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none' }} />
                      <span style={{ color: '#94A3B8', fontSize: '12px' }}>to</span>
                      <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none' }} />
                    </div>
                  )}

                  <button 
                    onClick={() => exportSectionCSV('purchases')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <Download size={15} /> Export
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '60px' }}>S.No</th>
                        <th onClick={() => requestSort('poNumber')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>PO # {renderSortIcon('poNumber')}</div>
                        </th>
                        <th onClick={() => requestSort('supplierName')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Supplier {renderSortIcon('supplierName')}</div>
                        </th>
                        <th onClick={() => requestSort('date')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Date {renderSortIcon('date')}</div>
                        </th>
                        <th onClick={() => requestSort('amount')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Amount {renderSortIcon('amount')}</div>
                        </th>
                        <th onClick={() => requestSort('status')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Status {renderSortIcon('status')}</div>
                        </th>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPurchases.length === 0 ? (
                        <tr><td colSpan="7" style={{ padding: '36px 20px', textAlign: 'center', color: '#64748B' }}>No purchase orders found.</td></tr>
                      ) : (
                        paginatedPurchases.map((item, idx) => (
                          <tr key={item._id || idx} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                            <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748B', fontWeight: '500' }}>{startIndex + idx + 1}</td>
                            <td style={{ padding: '14px 20px', fontWeight: '600', color: '#2563EB', fontFamily: 'monospace' }}>{item.poNumber || `PO-${idx+1}`}</td>
                            <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>{item.supplierName || 'General Supplier'}</td>
                            <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '13px' }}>{formatDate(item.date)}</td>
                            <td style={{ padding: '14px 20px', fontWeight: '700', color: '#0F172A', fontSize: '13px' }}>{formatCurrency(item.amount)}</td>
                            <td style={{ padding: '14px 20px' }}>
                              <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', background: item.status === 'Completed' ? '#DCFCE7' : '#FEF3C7', color: item.status === 'Completed' ? '#15803D' : '#B45309', fontWeight: '600' }}>
                                {item.status || 'Pending'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                <button onClick={() => setViewModalData({ type: 'purchase', data: item })} style={{ padding: '6px', borderRadius: '6px', background: '#F1F5F9', border: 'none', color: '#475569', cursor: 'pointer' }}><Eye size={15} /></button>
                                <button onClick={() => openEditModal('purchase', item)} style={{ padding: '6px', borderRadius: '6px', background: '#EFF6FF', border: 'none', color: '#2563EB', cursor: 'pointer' }}><Edit2 size={15} /></button>
                                <button onClick={() => setDeleteConfirm({ type: 'purchase', id: item._id, name: item.poNumber || 'PO' })} style={{ padding: '6px', borderRadius: '6px', background: '#FEE2E2', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalItems={filteredPurchases.length}
                  itemsPerPage={itemsPerPage}
                  setItemsPerPage={setItemsPerPage}
                  itemName="purchases"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 7: PRODUCTS & SERVICES (CATEGORIES, SUBCATEGORIES, PRODUCTS) */}
          {/* ======================================================== */}
          {activeSection === 'products' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #DBEAFE' }}>
                      <Package size={22} />
                    </div>
                    Products & Services Catalog
                  </h1>
                  <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                    Manage categories, sub categories, and your product & service inventory.
                  </p>
                </div>
                <button 
                  onClick={() => openAddModal(productTab === 'categories' ? 'category' : productTab === 'subcategories' ? 'subcategory' : 'product')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}
                >
                  <Plus size={17} /> Add New {productTab === 'categories' ? 'Category' : productTab === 'subcategories' ? 'Sub Category' : 'Product / Service'}
                </button>
              </div>

              {/* Stat Cards: 3 Matching User Side */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                <div 
                  onClick={() => { setProductTab('categories'); setCurrentPage(1); }}
                  style={{ 
                    background: 'white', 
                    borderRadius: '16px', 
                    border: productTab === 'categories' ? '2px solid #2563EB' : '1px solid #E2E8F0', 
                    padding: '18px 20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px', 
                    cursor: 'pointer',
                    boxShadow: productTab === 'categories' ? '0 4px 12px rgba(37,99,235,0.12)' : '0 2px 4px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tag size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Categories</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{categories.length}</h3>
                  </div>
                </div>

                <div 
                  onClick={() => { setProductTab('subcategories'); setCurrentPage(1); }}
                  style={{ 
                    background: 'white', 
                    borderRadius: '16px', 
                    border: productTab === 'subcategories' ? '2px solid #2563EB' : '1px solid #E2E8F0', 
                    padding: '18px 20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px', 
                    cursor: 'pointer',
                    boxShadow: productTab === 'subcategories' ? '0 4px 12px rgba(37,99,235,0.12)' : '0 2px 4px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Layers size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Sub Categories</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{subcategories.length}</h3>
                  </div>
                </div>

                <div 
                  onClick={() => { setProductTab('products'); setCurrentPage(1); }}
                  style={{ 
                    background: 'white', 
                    borderRadius: '16px', 
                    border: productTab === 'products' ? '2px solid #2563EB' : '1px solid #E2E8F0', 
                    padding: '18px 20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px', 
                    cursor: 'pointer',
                    boxShadow: productTab === 'products' ? '0 4px 12px rgba(37,99,235,0.12)' : '0 2px 4px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Products & Services</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{products.length}</h3>
                  </div>
                </div>
              </div>

              {/* Table Card Container */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                
                {/* Top Controls: 3 Subheading Tabs + Search + Filter + Export */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* The 3 Subheadings Tabs (Matching User Side 1:1) */}
                  <div style={{ display: 'inline-flex', gap: '6px', background: '#F1F5F9', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
                    <button 
                      onClick={() => { setProductTab('categories'); setCurrentPage(1); }}
                      style={{ 
                        padding: '8px 18px', 
                        borderRadius: '8px', 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        background: productTab === 'categories' ? 'white' : 'transparent', 
                        color: productTab === 'categories' ? '#0F172A' : '#64748B', 
                        border: 'none', 
                        boxShadow: productTab === 'categories' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', 
                        cursor: 'pointer', 
                        transition: 'all 0.15s' 
                      }}
                    >
                      Categories
                    </button>
                    <button 
                      onClick={() => { setProductTab('subcategories'); setCurrentPage(1); }}
                      style={{ 
                        padding: '8px 18px', 
                        borderRadius: '8px', 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        background: productTab === 'subcategories' ? 'white' : 'transparent', 
                        color: productTab === 'subcategories' ? '#0F172A' : '#64748B', 
                        border: 'none', 
                        boxShadow: productTab === 'subcategories' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', 
                        cursor: 'pointer', 
                        transition: 'all 0.15s' 
                      }}
                    >
                      Sub Categories
                    </button>
                    <button 
                      onClick={() => { setProductTab('products'); setCurrentPage(1); }}
                      style={{ 
                        padding: '8px 18px', 
                        borderRadius: '8px', 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        background: productTab === 'products' ? 'white' : 'transparent', 
                        color: productTab === 'products' ? '#0F172A' : '#64748B', 
                        border: 'none', 
                        boxShadow: productTab === 'products' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', 
                        cursor: 'pointer', 
                        transition: 'all 0.15s' 
                      }}
                    >
                      Products & Services
                    </button>
                  </div>

                  {/* Search and Filters */}
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: '0 1 360px', minWidth: '260px', position: 'relative' }}>
                      <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input 
                        type="text" 
                        placeholder={productTab === 'categories' ? "Search categories by name, type, description..." : productTab === 'subcategories' ? "Search subcategories by name, parent category..." : "Search products by name, SKU, category..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '11px 16px 11px 44px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                      />
                      {searchTerm && (
                        <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
                          <X size={15} />
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <select 
                        value={filterDays} 
                        onChange={(e) => setFilterDays(e.target.value)}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '13px', color: '#334155', fontWeight: '500', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="all">Filter: All Time</option>
                        <option value="today">Today</option>
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="thisMonth">This Month</option>
                        <option value="custom">Custom Range</option>
                      </select>

                      {filterDays === 'custom' && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none' }} />
                          <span style={{ color: '#94A3B8', fontSize: '12px' }}>to</span>
                          <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none' }} />
                        </div>
                      )}

                      <button 
                        onClick={() => exportSectionCSV('products')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <Download size={15} /> Export
                      </button>
                    </div>
                  </div>

                </div>

                {/* Subheading Tab 1: Categories Table */}
                {productTab === 'categories' && (
                  <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                      <thead>
                        <tr style={{ background: '#F8FAFC' }}>
                          <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '60px' }}>S.No</th>
                          <th onClick={() => requestSort('name')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>Category Name {renderSortIcon('name')}</div>
                          </th>
                          <th onClick={() => requestSort('itemType')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>Item Type {renderSortIcon('itemType')}</div>
                          </th>
                          <th onClick={() => requestSort('transactionType')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>Transaction Type {renderSortIcon('transactionType')}</div>
                          </th>
                          <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Description</th>
                          <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCategories.length === 0 ? (
                          <tr><td colSpan="6" style={{ padding: '36px 20px', textAlign: 'center', color: '#64748B' }}>No categories found.</td></tr>
                        ) : (
                          paginatedCategories.map((item, idx) => (
                            <tr key={item._id || idx} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                              <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748B', fontWeight: '500' }}>{startIndex + idx + 1}</td>
                              <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Tag size={14} />
                                  </div>
                                  <span>{item.name}</span>
                                </div>
                              </td>
                              <td style={{ padding: '14px 20px' }}>
                                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: item.itemType === 'service' ? '#F0FDF4' : '#EFF6FF', color: item.itemType === 'service' ? '#16A34A' : '#2563EB', fontWeight: '600', textTransform: 'capitalize' }}>
                                  {item.itemType || 'Product'}
                                </span>
                              </td>
                              <td style={{ padding: '14px 20px' }}>
                                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: '#F1F5F9', color: '#475569', fontWeight: '500', textTransform: 'capitalize' }}>
                                  {item.transactionType || 'Both'}
                                </span>
                              </td>
                              <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '13px' }}>
                                {item.description || '-'}
                              </td>
                              <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                  <button onClick={() => setViewModalData({ type: 'category', data: item })} style={{ padding: '6px', borderRadius: '6px', background: '#F1F5F9', border: 'none', color: '#475569', cursor: 'pointer' }}><Eye size={15} /></button>
                                  <button onClick={() => openEditModal('category', item)} style={{ padding: '6px', borderRadius: '6px', background: '#EFF6FF', border: 'none', color: '#2563EB', cursor: 'pointer' }}><Edit2 size={15} /></button>
                                  <button onClick={() => setDeleteConfirm({ type: 'category', id: item._id, name: item.name })} style={{ padding: '6px', borderRadius: '6px', background: '#FEE2E2', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={15} /></button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Subheading Tab 2: Sub Categories Table */}
                {productTab === 'subcategories' && (
                  <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
                      <thead>
                        <tr style={{ background: '#F8FAFC' }}>
                          <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '60px' }}>S.No</th>
                          <th onClick={() => requestSort('name')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>Sub Category Name {renderSortIcon('name')}</div>
                          </th>
                          <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Parent Category</th>
                          <th onClick={() => requestSort('itemType')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>Item Type {renderSortIcon('itemType')}</div>
                          </th>
                          <th onClick={() => requestSort('transactionType')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>Transaction Type {renderSortIcon('transactionType')}</div>
                          </th>
                          <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Description</th>
                          <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubcategories.length === 0 ? (
                          <tr><td colSpan="7" style={{ padding: '36px 20px', textAlign: 'center', color: '#64748B' }}>No sub categories found.</td></tr>
                        ) : (
                          paginatedSubcategories.map((item, idx) => (
                            <tr key={item._id || idx} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                              <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748B', fontWeight: '500' }}>{startIndex + idx + 1}</td>
                              <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Layers size={14} />
                                  </div>
                                  <span>{item.name}</span>
                                </div>
                              </td>
                              <td style={{ padding: '14px 20px' }}>
                                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: '#EFF6FF', color: '#1D4ED8', fontWeight: '600' }}>
                                  {item.categoryId?.name || 'General'}
                                </span>
                              </td>
                              <td style={{ padding: '14px 20px' }}>
                                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: item.itemType === 'service' ? '#F0FDF4' : '#EFF6FF', color: item.itemType === 'service' ? '#16A34A' : '#2563EB', fontWeight: '600', textTransform: 'capitalize' }}>
                                  {item.itemType || item.categoryId?.itemType || 'Product'}
                                </span>
                              </td>
                              <td style={{ padding: '14px 20px' }}>
                                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: '#F1F5F9', color: '#475569', fontWeight: '500', textTransform: 'capitalize' }}>
                                  {item.transactionType || item.categoryId?.transactionType || 'Both'}
                                </span>
                              </td>
                              <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '13px' }}>
                                {item.description || '-'}
                              </td>
                              <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                  <button onClick={() => setViewModalData({ type: 'subcategory', data: item })} style={{ padding: '6px', borderRadius: '6px', background: '#F1F5F9', border: 'none', color: '#475569', cursor: 'pointer' }}><Eye size={15} /></button>
                                  <button onClick={() => openEditModal('subcategory', item)} style={{ padding: '6px', borderRadius: '6px', background: '#EFF6FF', border: 'none', color: '#2563EB', cursor: 'pointer' }}><Edit2 size={15} /></button>
                                  <button onClick={() => setDeleteConfirm({ type: 'subcategory', id: item._id, name: item.name })} style={{ padding: '6px', borderRadius: '6px', background: '#FEE2E2', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={15} /></button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Subheading Tab 3: Products Table */}
                {productTab === 'products' && (
                  <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                      <thead>
                        <tr style={{ background: '#F8FAFC' }}>
                          <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '60px' }}>S.No</th>
                          <th onClick={() => requestSort('name')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>Name {renderSortIcon('name')}</div>
                          </th>
                          <th onClick={() => requestSort('sku')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>SKU {renderSortIcon('sku')}</div>
                          </th>
                          <th onClick={() => requestSort('category')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>Category & SubCategory {renderSortIcon('category')}</div>
                          </th>
                          <th onClick={() => requestSort('stock')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>Stock {renderSortIcon('stock')}</div>
                          </th>
                          <th onClick={() => requestSort('price')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>Price {renderSortIcon('price')}</div>
                          </th>
                          <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.length === 0 ? (
                          <tr><td colSpan="7" style={{ padding: '36px 20px', textAlign: 'center', color: '#64748B' }}>No products or services found.</td></tr>
                        ) : (
                          paginatedProducts.map((item, idx) => (
                            <tr key={item._id || idx} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                              <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748B', fontWeight: '500' }}>{startIndex + idx + 1}</td>
                              <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>{item.name}</td>
                              <td style={{ padding: '14px 20px', color: '#64748B', fontFamily: 'monospace', fontSize: '12px' }}>{item.sku || 'N/A'}</td>
                              <td style={{ padding: '14px 20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#1E293B' }}>
                                    {item.categoryId?.name || item.category || 'General'}
                                  </span>
                                  {(item.subCategoryId?.name || item.subCategory) && (
                                    <span style={{ fontSize: '11px', color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <Tag size={10} color="#3B82F6" />
                                      <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '1px 6px', borderRadius: '4px', fontWeight: '500' }}>
                                        {item.subCategoryId?.name || item.subCategory}
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>{item.stock ?? 0}</td>
                              <td style={{ padding: '14px 20px', fontWeight: '700', color: '#2563EB', fontSize: '13px' }}>{formatCurrency(item.price)}</td>
                              <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                  <button onClick={() => setViewModalData({ type: 'product', data: item })} style={{ padding: '6px', borderRadius: '6px', background: '#F1F5F9', border: 'none', color: '#475569', cursor: 'pointer' }}><Eye size={15} /></button>
                                  <button onClick={() => openEditModal('product', item)} style={{ padding: '6px', borderRadius: '6px', background: '#EFF6FF', border: 'none', color: '#2563EB', cursor: 'pointer' }}><Edit2 size={15} /></button>
                                  <button onClick={() => setDeleteConfirm({ type: 'product', id: item._id, name: item.name })} style={{ padding: '6px', borderRadius: '6px', background: '#FEE2E2', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={15} /></button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Table Pagination */}
                <TablePagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalItems={productTab === 'categories' ? filteredCategories.length : productTab === 'subcategories' ? filteredSubcategories.length : filteredProducts.length}
                  itemsPerPage={itemsPerPage}
                  setItemsPerPage={setItemsPerPage}
                  itemName={productTab === 'categories' ? 'categories' : productTab === 'subcategories' ? 'sub categories' : 'products & services'}
                />

              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 8: STOCK / INVENTORY */}
          {/* ======================================================== */}
          {activeSection === 'inventory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #DBEAFE' }}>
                      <Archive size={22} />
                    </div>
                    Stock & Inventory Management
                  </h1>
                  <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                    Real-time stock valuation, unit tracking, threshold warnings, and reorder levels.
                  </p>
                </div>
                <button 
                  onClick={() => openAddModal('inventory')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}
                >
                  <Plus size={17} /> Add Item
                </button>
              </div>

              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Archive size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Tracked Items</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{inventory.length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Low Stock (&lt; 5)</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#DC2626', fontWeight: '700' }}>{inventory.filter(i => (i.quantity || i.stock || 0) < 5).length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IndianRupee size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Inventory Valuation</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{formatCurrency(inventory.reduce((acc, i) => acc + ((Number(i.quantity) || Number(i.stock) || 0) * (Number(i.price) || 0)), 0))}</h3>
                  </div>
                </div>
              </div>

              {/* Search, Filter, Export Bar */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: '0 1 360px', minWidth: '260px', position: 'relative' }}>
                  <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Search inventory by item, SKU, category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '11px 16px 11px 44px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select 
                    value={filterDays} 
                    onChange={(e) => setFilterDays(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '13px', color: '#334155', fontWeight: '500', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="all">Filter: All Time</option>
                    <option value="today">Today</option>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="thisMonth">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>

                  {filterDays === 'custom' && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none' }} />
                      <span style={{ color: '#94A3B8', fontSize: '12px' }}>to</span>
                      <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none' }} />
                    </div>
                  )}

                  <button 
                    onClick={() => exportSectionCSV('inventory')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <Download size={15} /> Export
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '60px' }}>S.No</th>
                        <th onClick={() => requestSort('itemName')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Item Name {renderSortIcon('itemName')}</div>
                        </th>
                        <th onClick={() => requestSort('sku')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>SKU {renderSortIcon('sku')}</div>
                        </th>
                        <th onClick={() => requestSort('category')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Category {renderSortIcon('category')}</div>
                        </th>
                        <th onClick={() => requestSort('quantity')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Stock Qty {renderSortIcon('quantity')}</div>
                        </th>
                        <th onClick={() => requestSort('price')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Unit Price {renderSortIcon('price')}</div>
                        </th>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.length === 0 ? (
                        <tr><td colSpan="7" style={{ padding: '36px 20px', textAlign: 'center', color: '#64748B' }}>No inventory items recorded.</td></tr>
                      ) : (
                        paginatedInventory.map((item, idx) => (
                          <tr key={item._id || idx} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                            <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748B', fontWeight: '500' }}>{startIndex + idx + 1}</td>
                            <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>{item.itemName || item.name}</td>
                            <td style={{ padding: '14px 20px', color: '#64748B', fontFamily: 'monospace', fontSize: '12px' }}>{item.sku || 'N/A'}</td>
                            <td style={{ padding: '14px 20px' }}><span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: '#F1F5F9', color: '#475569', fontWeight: '500' }}>{item.category || 'General'}</span></td>
                            <td style={{ padding: '14px 20px', fontWeight: '600', color: (item.quantity || 0) < 5 ? '#DC2626' : '#0F172A', fontSize: '13px' }}>{item.quantity ?? item.stock ?? 0} in stock</td>
                            <td style={{ padding: '14px 20px', fontWeight: '700', color: '#2563EB', fontSize: '13px' }}>{formatCurrency(item.price)}</td>
                            <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                <button onClick={() => setViewModalData({ type: 'inventory', data: item })} style={{ padding: '6px', borderRadius: '6px', background: '#F1F5F9', border: 'none', color: '#475569', cursor: 'pointer' }}><Eye size={15} /></button>
                                <button onClick={() => openEditModal('inventory', item)} style={{ padding: '6px', borderRadius: '6px', background: '#EFF6FF', border: 'none', color: '#2563EB', cursor: 'pointer' }}><Edit2 size={15} /></button>
                                <button onClick={() => setDeleteConfirm({ type: 'inventory', id: item._id, name: item.itemName || item.name })} style={{ padding: '6px', borderRadius: '6px', background: '#FEE2E2', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalItems={filteredInventory.length}
                  itemsPerPage={itemsPerPage}
                  setItemsPerPage={setItemsPerPage}
                  itemName="inventory items"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 9: CUSTOMERS */}
          {/* ======================================================== */}
          {activeSection === 'customers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #DBEAFE' }}>
                      <Users size={22} />
                    </div>
                    Client Customers Management
                  </h1>
                  <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                    Directory of client customers, retail patrons, wholesale buyers, and business contacts.
                  </p>
                </div>
                <button 
                  onClick={() => openAddModal('customer')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}
                >
                  <Plus size={17} /> Add Customer
                </button>
              </div>

              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Customers</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{customersList.length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCheck size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Retail Patrons</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{customersList.filter(c => (c.customerType || '').toLowerCase().includes('retail') || !c.customerType).length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Corporate / Wholesale</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{customersList.filter(c => (c.customerType || '').toLowerCase().includes('wholesale') || (c.customerType || '').toLowerCase().includes('corporate')).length}</h3>
                  </div>
                </div>
              </div>

              {/* Search, Filter, Export Bar */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: '0 1 360px', minWidth: '260px', position: 'relative' }}>
                  <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Search customers by name, company, email, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '11px 16px 11px 44px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select 
                    value={filterDays} 
                    onChange={(e) => setFilterDays(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '13px', color: '#334155', fontWeight: '500', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="all">Filter: All Time</option>
                    <option value="today">Today</option>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="thisMonth">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>

                  {filterDays === 'custom' && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none' }} />
                      <span style={{ color: '#94A3B8', fontSize: '12px' }}>to</span>
                      <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none' }} />
                    </div>
                  )}

                  <button 
                    onClick={() => exportSectionCSV('customers')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <Download size={15} /> Export
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '60px' }}>S.No</th>
                        <th onClick={() => requestSort('name')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Customer {renderSortIcon('name')}</div>
                        </th>
                        <th onClick={() => requestSort('companyName')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Company {renderSortIcon('companyName')}</div>
                        </th>
                        <th onClick={() => requestSort('customerType')} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Type {renderSortIcon('customerType')}</div>
                        </th>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Contact</th>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Address</th>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomersList.length === 0 ? (
                        <tr><td colSpan="7" style={{ padding: '36px 20px', textAlign: 'center', color: '#64748B' }}>No customers added.</td></tr>
                      ) : (
                        paginatedCustomers.map((cust, idx) => (
                          <tr key={cust._id || idx} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                            <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748B', fontWeight: '500' }}>{startIndex + idx + 1}</td>
                            <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>{cust.name}</td>
                            <td style={{ padding: '14px 20px', color: '#475569', fontSize: '13px' }}>{cust.companyName || '—'}</td>
                            <td style={{ padding: '14px 20px' }}><span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: '#F1F5F9', color: '#475569', fontWeight: '500' }}>{cust.customerType || 'Retail'}</span></td>
                            <td style={{ padding: '14px 20px', fontSize: '12px' }}>
                              <div style={{ color: '#0F172A', fontWeight: '500' }}>{cust.phone || 'N/A'}</div>
                              <div style={{ color: '#2563EB' }}>{cust.email}</div>
                            </td>
                            <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '13px' }}>{cust.address || '—'}</td>
                            <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                <button onClick={() => setViewModalData({ type: 'customer', data: cust })} style={{ padding: '6px', borderRadius: '6px', background: '#F1F5F9', border: 'none', color: '#475569', cursor: 'pointer' }}><Eye size={15} /></button>
                                <button onClick={() => openEditModal('customer', cust)} style={{ padding: '6px', borderRadius: '6px', background: '#EFF6FF', border: 'none', color: '#2563EB', cursor: 'pointer' }}><Edit2 size={15} /></button>
                                <button onClick={() => setDeleteConfirm({ type: 'customer', id: cust._id, name: cust.name })} style={{ padding: '6px', borderRadius: '6px', background: '#FEE2E2', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalItems={filteredCustomersList.length}
                  itemsPerPage={itemsPerPage}
                  setItemsPerPage={setItemsPerPage}
                  itemName="customers"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 10: EXPENSES */}
          {/* ======================================================== */}
          {activeSection === 'expenses' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #DBEAFE' }}>
                      <Receipt size={22} />
                    </div>
                    Expenses Management
                  </h1>
                  <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                    Track operational expenditures, receipts, vendor invoices, and category breakdowns.
                  </p>
                </div>
                <button 
                  onClick={() => openAddModal('expense')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}
                >
                  <Plus size={17} /> Add Expense
                </button>
              </div>

              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Receipt size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Expenses</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{formatCurrency(financials.totalExpenses)}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CreditCard size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Entries</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{expenses.length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Receipts Attached</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{expenses.filter(e => e.proofUrl).length}</h3>
                  </div>
                </div>
              </div>

              {/* Search, Filter, Export Bar */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: '0 1 360px', minWidth: '260px', position: 'relative' }}>
                  <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Search expenses by title, category, note..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '10px 16px 10px 44px', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '14px', boxSizing: 'border-box', background: 'white' }}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                      <X size={15} />
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select value={filterDays} onChange={(e) => setFilterDays(e.target.value)} style={{ padding: '9px 14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#334155', fontWeight: '500', fontSize: '13.5px', outline: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <option value="all">Filter: All Time</option>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="custom">Custom Range</option>
                  </select>
                  {filterDays === 'custom' && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', color: '#334155', background: 'white' }} />
                      <span style={{ fontSize: '13px', color: '#64748B' }}>to</span>
                      <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', color: '#334155', background: 'white' }} />
                    </div>
                  )}
                  <button onClick={() => exportSectionCSV('expenses')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 15px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#334155', fontWeight: '600', fontSize: '13.5px', cursor: 'pointer' }}>
                    <Download size={16} /> Export
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        <th style={{ padding: '14px 10px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '56px', textAlign: 'center', verticalAlign: 'middle' }}>
                          S.No
                        </th>
                        <th onClick={() => requestSort('title')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Title / Description {renderSortIcon('title')}</div>
                        </th>
                        <th onClick={() => requestSort('category')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Category {renderSortIcon('category')}</div>
                        </th>
                        <th onClick={() => requestSort('amount')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Amount {renderSortIcon('amount')}</div>
                        </th>
                        <th onClick={() => requestSort('date')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Date {renderSortIcon('date')}</div>
                        </th>
                        <th style={{ padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', verticalAlign: 'middle' }}>
                          Receipt Proof
                        </th>
                        <th style={{ padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', verticalAlign: 'middle', width: '120px' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ padding: '64px 32px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                <Receipt size={32} color="#3B82F6" />
                              </div>
                              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>No expenses found</h3>
                              <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5', fontSize: '14px' }}>
                                No expenses logged or matching the current search filters.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedExpenses.map((exp, index) => (
                          <tr key={exp._id || index} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                            <td style={{ padding: '14px 10px', fontSize: '13px', color: '#64748B', fontWeight: '600', textAlign: 'center', verticalAlign: 'middle' }}>
                              {startIndex + index + 1}
                            </td>
                            <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                              <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '14px' }}>{exp.title}</div>
                              {exp.description && <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{exp.description}</div>}
                            </td>
                            <td style={{ padding: '14px 14px', verticalAlign: 'middle' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', padding: '3px 9px', borderRadius: '8px', background: '#F1F5F9', color: '#334155', border: '1px solid #E2E8F0' }}>
                                <Tag size={12} color="#64748B" />
                                {exp.category || 'General'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 14px', verticalAlign: 'middle', fontWeight: '700', color: '#D97706', fontSize: '14px' }}>
                              {formatCurrency(exp.amount)}
                            </td>
                            <td style={{ padding: '14px 14px', verticalAlign: 'middle', color: '#64748B', fontSize: '13px' }}>
                              {formatDate(exp.date)}
                            </td>
                            <td style={{ padding: '14px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                              {exp.proofUrl ? (
                                <button 
                                  onClick={() => setPreviewReceiptUrl(exp.proofUrl)} 
                                  style={{ padding: '4px 10px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                  View Receipt
                                </button>
                              ) : (
                                <span style={{ fontSize: '12px', color: '#94A3B8' }}>None</span>
                              )}
                            </td>
                            <td style={{ padding: '14px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <button onClick={() => setViewModalData({ type: 'expense', data: exp })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', background: '#EFF6FF', border: '1px solid #DBEAFE', color: '#2563EB', cursor: 'pointer' }} title="View Expense"><Eye size={15} /></button>
                                <button onClick={() => openEditModal('expense', exp)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', cursor: 'pointer' }} title="Edit Expense"><Edit2 size={15} /></button>
                                <button onClick={() => setDeleteConfirm({ type: 'expense', id: exp._id, name: exp.title })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#EF4444', cursor: 'pointer' }} title="Delete Expense"><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalItems={filteredExpenses.length}
                  itemsPerPage={itemsPerPage}
                  setItemsPerPage={setItemsPerPage}
                  itemName="expenses"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 11: BILLING / SALES */}
          {/* ======================================================== */}
          {activeSection === 'sales' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #DBEAFE' }}>
                      <TrendingUp size={22} />
                    </div>
                    Sales & Invoicing
                  </h1>
                  <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                    Manage client orders, billing records, payment statuses, and revenue logs.
                  </p>
                </div>
                <button 
                  onClick={() => openAddModal('sale')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}
                >
                  <Plus size={17} /> Add Sale Invoice
                </button>
              </div>

              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Revenue</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{formatCurrency(financials.totalSales)}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Receipt size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Invoices Issued</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{sales.length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Paid Orders</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{sales.filter(s => s.status === 'Paid').length}</h3>
                  </div>
                </div>
              </div>

              {/* Search, Filter, Export Bar */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: '0 1 360px', minWidth: '260px', position: 'relative' }}>
                  <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Search sales by invoice #, customer, status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '10px 16px 10px 44px', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '14px', boxSizing: 'border-box', background: 'white' }}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                      <X size={15} />
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select value={filterDays} onChange={(e) => setFilterDays(e.target.value)} style={{ padding: '9px 14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#334155', fontWeight: '500', fontSize: '13.5px', outline: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <option value="all">Filter: All Time</option>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="custom">Custom Range</option>
                  </select>
                  {filterDays === 'custom' && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', color: '#334155', background: 'white' }} />
                      <span style={{ fontSize: '13px', color: '#64748B' }}>to</span>
                      <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', color: '#334155', background: 'white' }} />
                    </div>
                  )}
                  <button onClick={() => exportSectionCSV('sales')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 15px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#334155', fontWeight: '600', fontSize: '13.5px', cursor: 'pointer' }}>
                    <Download size={16} /> Export
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        <th style={{ padding: '14px 10px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '56px', textAlign: 'center', verticalAlign: 'middle' }}>
                          S.No
                        </th>
                        <th onClick={() => requestSort('invoiceNo')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Invoice # {renderSortIcon('invoiceNo')}</div>
                        </th>
                        <th onClick={() => requestSort('customerName')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Customer {renderSortIcon('customerName')}</div>
                        </th>
                        <th onClick={() => requestSort('date')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Date {renderSortIcon('date')}</div>
                        </th>
                        <th onClick={() => requestSort('amount')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Amount {renderSortIcon('amount')}</div>
                        </th>
                        <th onClick={() => requestSort('status')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Status {renderSortIcon('status')}</div>
                        </th>
                        <th style={{ padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', verticalAlign: 'middle', width: '120px' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSales.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ padding: '64px 32px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                <TrendingUp size={32} color="#3B82F6" />
                              </div>
                              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>No sales records found</h3>
                              <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5', fontSize: '14px' }}>
                                No sales or billing transactions recorded yet.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedSales.map((sale, index) => (
                          <tr key={sale._id || index} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                            <td style={{ padding: '14px 10px', fontSize: '13px', color: '#64748B', fontWeight: '600', textAlign: 'center', verticalAlign: 'middle' }}>
                              {startIndex + index + 1}
                            </td>
                            <td style={{ padding: '14px 16px', verticalAlign: 'middle', fontWeight: '700', color: '#2563EB', fontFamily: 'monospace' }}>
                              {sale.invoiceNo || `INV-${sale._id ? sale._id.substring(sale._id.length - 6).toUpperCase() : index + 1}`}
                            </td>
                            <td style={{ padding: '14px 14px', verticalAlign: 'middle', color: '#0F172A', fontWeight: '600', fontSize: '13.5px' }}>
                              {sale.customerName || 'Direct Customer'}
                            </td>
                            <td style={{ padding: '14px 14px', verticalAlign: 'middle', color: '#64748B', fontSize: '13px' }}>
                              {formatDate(sale.date)}
                            </td>
                            <td style={{ padding: '14px 14px', verticalAlign: 'middle', fontWeight: '700', color: '#059669', fontSize: '14px' }}>
                              {formatCurrency(sale.amount)}
                            </td>
                            <td style={{ padding: '14px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                              <span style={{ 
                                display: 'inline-block',
                                fontSize: '11.5px', 
                                padding: '3px 10px', 
                                borderRadius: '12px', 
                                background: sale.status === 'Paid' ? '#DCFCE7' : sale.status === 'Pending' ? '#FEF3C7' : '#FEE2E2', 
                                color: sale.status === 'Paid' ? '#15803D' : sale.status === 'Pending' ? '#B45309' : '#B91C1C', 
                                fontWeight: '700' 
                              }}>
                                {sale.status || 'Paid'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <button onClick={() => setViewModalData({ type: 'sale', data: sale })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', background: '#EFF6FF', border: '1px solid #DBEAFE', color: '#2563EB', cursor: 'pointer' }} title="View Sale"><Eye size={15} /></button>
                                <button onClick={() => openEditModal('sale', sale)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', cursor: 'pointer' }} title="Edit Sale"><Edit2 size={15} /></button>
                                <button onClick={() => setDeleteConfirm({ type: 'sale', id: sale._id, name: sale.invoiceNo || 'Sale' })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#EF4444', cursor: 'pointer' }} title="Delete Sale"><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalItems={filteredSales.length}
                  itemsPerPage={itemsPerPage}
                  setItemsPerPage={setItemsPerPage}
                  itemName="sales & invoices"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 12: BRANCHES */}
          {/* ======================================================== */}
          {activeSection === 'branches' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #DBEAFE' }}>
                      <Store size={22} />
                    </div>
                    Branches Management
                  </h1>
                  <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                    Manage multiple business locations, managers, contact details, and dedicated branch access.
                  </p>
                </div>
                <button 
                  onClick={() => openAddModal('branch')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}
                >
                  <Plus size={17} /> Add New Branch
                </button>
              </div>

              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Store size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Branches</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{branches.length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><KeyRound size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Login Enabled</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{branches.filter(b => b.email && b.isLoginEnabled !== false).length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Active Managers</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{branches.filter(b => b.manager).length}</h3>
                  </div>
                </div>
              </div>

              {/* Search, Filter, Export Bar */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: '0 1 360px', minWidth: '260px', position: 'relative' }}>
                  <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Search branches by name, location, manager..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '10px 16px 10px 44px', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '14px', boxSizing: 'border-box', background: 'white' }}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                      <X size={15} />
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select value={filterDays} onChange={(e) => setFilterDays(e.target.value)} style={{ padding: '9px 14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#334155', fontWeight: '500', fontSize: '13.5px', outline: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <option value="all">Filter: All Time</option>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="custom">Custom Range</option>
                  </select>
                  {filterDays === 'custom' && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', color: '#334155', background: 'white' }} />
                      <span style={{ fontSize: '13px', color: '#64748B' }}>to</span>
                      <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', color: '#334155', background: 'white' }} />
                    </div>
                  )}
                  <button onClick={() => exportSectionCSV('branches')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 15px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#334155', fontWeight: '600', fontSize: '13.5px', cursor: 'pointer' }}>
                    <Download size={16} /> Export
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        <th style={{ padding: '14px 10px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '56px', textAlign: 'center', verticalAlign: 'middle' }}>
                          S.No
                        </th>
                        <th onClick={() => requestSort('name')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Branch Name {renderSortIcon('name')}</div>
                        </th>
                        {(businessType === 4 || businesses.length > 0) && (
                          <th onClick={() => requestSort('businessName')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>Business Entity {renderSortIcon('businessName')}</div>
                          </th>
                        )}
                        <th onClick={() => requestSort('location')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Location {renderSortIcon('location')}</div>
                        </th>
                        <th onClick={() => requestSort('manager')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Manager {renderSortIcon('manager')}</div>
                        </th>
                        <th style={{ padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', verticalAlign: 'middle' }}>
                          Contact Info
                        </th>
                        <th style={{ padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          Login Access
                        </th>
                        <th style={{ padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', verticalAlign: 'middle', width: '120px' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBranches.length === 0 ? (
                        <tr>
                          <td colSpan={(businessType === 4 || businesses.length > 0) ? "8" : "7"} style={{ padding: '64px 32px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                <Store size={32} color="#3B82F6" />
                              </div>
                              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>No branches found</h3>
                              <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5', fontSize: '14px' }}>
                                No branches registered or matching search filters.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedBranches.map((branch, index) => (
                          <tr key={branch._id || index} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                            <td style={{ padding: '14px 10px', fontSize: '13px', color: '#64748B', fontWeight: '600', textAlign: 'center', verticalAlign: 'middle' }}>
                              {startIndex + index + 1}
                            </td>
                            <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #DBEAFE', flexShrink: 0 }}>
                                  <Store size={18} />
                                </div>
                                <div>
                                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', display: 'block', lineHeight: '1.3' }}>{branch.name}</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                                    <span>{branch.type || 'Branch'}</span>
                                    <span>&bull;</span>
                                    <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#2563EB', background: '#EFF6FF', padding: '1px 6px', borderRadius: '4px', border: '1px solid #DBEAFE' }}>
                                      {branch.branchId || branch.branchCode || (branch.name ? `BR-${branch.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}` : 'BR-0000')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            {(businessType === 4 || businesses.length > 0) && (
                              <td style={{ padding: '14px 14px', verticalAlign: 'middle' }}>
                                {branch.businessName ? (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', padding: '3px 9px', borderRadius: '8px', background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' }}>
                                    <Building2 size={13} color="#7C3AED" />
                                    {branch.businessName}
                                  </span>
                                ) : (
                                  <span style={{ color: '#94A3B8', fontSize: '13px' }}>—</span>
                                )}
                              </td>
                            )}
                            <td style={{ padding: '14px 14px', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', fontSize: '13px', fontWeight: '500' }}>
                                <MapPin size={14} color="#64748B" />
                                <span>{branch.location || '—'}</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 14px', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', fontSize: '13px', fontWeight: '500' }}>
                                <Users size={14} color="#64748B" />
                                <span>{branch.manager || '—'}</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 14px', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                {branch.contactNumber ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F172A', fontSize: '13px', fontWeight: '600' }}>
                                    <Phone size={13} color="#64748B" /> <span>{branch.contactNumber}</span>
                                  </div>
                                ) : <span style={{ color: '#94A3B8', fontSize: '13px' }}>—</span>}
                                {branch.email && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748B', fontSize: '12px' }}>
                                    <Mail size={12} color="#94A3B8" />
                                    <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={branch.email}>{branch.email}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '14px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                              {branch.email ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenLoginModal('branch', branch)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '7px',
                                    background: '#EFF6FF',
                                    border: '1px solid #BFDBFE',
                                    color: '#1D4ED8',
                                    padding: '7px 14px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    boxShadow: '0 1px 2px rgba(37, 99, 235, 0.05)'
                                  }}
                                  onMouseOver={(e) => { e.currentTarget.style.background = '#DBEAFE'; }}
                                  onMouseOut={(e) => { e.currentTarget.style.background = '#EFF6FF'; }}
                                >
                                  <KeyRound size={15} />
                                  <span>Manage Login</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenLoginModal('branch', branch)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '7px',
                                    background: '#F8FAFC',
                                    border: '1px dashed #93C5FD',
                                    color: '#2563EB',
                                    padding: '7px 14px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseOver={(e) => { e.currentTarget.style.background = '#EFF6FF'; }}
                                  onMouseOut={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                                >
                                  <KeyRound size={15} />
                                  <span>Setup Login</span>
                                </button>
                              )}
                            </td>
                            <td style={{ padding: '14px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <button onClick={() => setViewModalData({ type: 'branch', data: branch })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', background: '#EFF6FF', border: '1px solid #DBEAFE', color: '#2563EB', cursor: 'pointer' }} title="View Branch"><Eye size={15} /></button>
                                <button onClick={() => openEditModal('branch', branch)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', cursor: 'pointer' }} title="Edit Branch"><Edit2 size={15} /></button>
                                <button onClick={() => setDeleteConfirm({ type: 'branch', id: branch._id, name: branch.name })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#EF4444', cursor: 'pointer' }} title="Delete Branch"><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalItems={filteredBranches.length}
                  itemsPerPage={itemsPerPage}
                  setItemsPerPage={setItemsPerPage}
                  itemName="branches"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 13: EMPLOYEES */}
          {/* ======================================================== */}
          {activeSection === 'employees' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #DBEAFE' }}>
                      <UserCheck size={22} />
                    </div>
                    Employees & Staff
                  </h1>
                  <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                    Manage team roster, designations, salaries, branch assignments, and staff login credentials.
                  </p>
                </div>
                <button 
                  onClick={() => openAddModal('employee')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}
                >
                  <Plus size={17} /> Add New Employee
                </button>
              </div>

              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Employees</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{employees.length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCheck size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Active Staff</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{employees.filter(e => e.status === 'Active').length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><KeyRound size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Login Enabled</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{employees.filter(e => e.email && e.isLoginEnabled !== false).length}</h3>
                  </div>
                </div>
              </div>

              {/* Search, Filter, Export Bar */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: '0 1 360px', minWidth: '260px', position: 'relative' }}>
                  <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Search employees by name, role, email, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '10px 16px 10px 44px', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '14px', boxSizing: 'border-box', background: 'white' }}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                      <X size={15} />
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select value={filterDays} onChange={(e) => setFilterDays(e.target.value)} style={{ padding: '9px 14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#334155', fontWeight: '500', fontSize: '13.5px', outline: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <option value="all">Filter: All Time</option>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="custom">Custom Range</option>
                  </select>
                  {filterDays === 'custom' && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', color: '#334155', background: 'white' }} />
                      <span style={{ fontSize: '13px', color: '#64748B' }}>to</span>
                      <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', color: '#334155', background: 'white' }} />
                    </div>
                  )}
                  <button onClick={() => exportSectionCSV('employees')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 15px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#334155', fontWeight: '600', fontSize: '13.5px', cursor: 'pointer' }}>
                    <Download size={16} /> Export
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        <th style={{ padding: '14px 10px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '56px', textAlign: 'center', verticalAlign: 'middle' }}>
                          S.No
                        </th>
                        <th onClick={() => requestSort('name')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Employee Name {renderSortIcon('name')}</div>
                        </th>
                        <th onClick={() => requestSort('position')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Role / Designation {renderSortIcon('position')}</div>
                        </th>
                        <th onClick={() => requestSort('branchName')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Branch / Location {renderSortIcon('branchName')}</div>
                        </th>
                        <th onClick={() => requestSort('salary')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Salary {renderSortIcon('salary')}</div>
                        </th>
                        <th onClick={() => requestSort('status')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Status {renderSortIcon('status')}</div>
                        </th>
                        <th style={{ padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          Login Access
                        </th>
                        <th style={{ padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', verticalAlign: 'middle', width: '120px' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ padding: '64px 32px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                <Users size={32} color="#3B82F6" />
                              </div>
                              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>No employees found</h3>
                              <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5', fontSize: '14px' }}>
                                No employees added yet or matching the search filters.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedEmployees.map((emp, index) => (
                          <tr key={emp._id || index} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                            <td style={{ padding: '14px 10px', fontSize: '13px', color: '#64748B', fontWeight: '600', textAlign: 'center', verticalAlign: 'middle' }}>
                              {startIndex + index + 1}
                            </td>
                            <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #DBEAFE', flexShrink: 0 }}>
                                  <User size={18} />
                                </div>
                                <div>
                                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', display: 'block', lineHeight: '1.3' }}>{emp.name}</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                                    <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#2563EB', background: '#EFF6FF', padding: '1px 6px', borderRadius: '4px', border: '1px solid #DBEAFE' }}>
                                      {emp.employeeId || (emp.name ? `EMP-${emp.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}` : 'EMP-0000')}
                                    </span>
                                    {emp.contactNumber && <span>&bull; {emp.contactNumber}</span>}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '14px 14px', verticalAlign: 'middle' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', padding: '3px 9px', borderRadius: '8px', background: '#F1F5F9', color: '#334155', border: '1px solid #E2E8F0' }}>
                                <Briefcase size={12} color="#64748B" />
                                {emp.position || emp.designation || 'Staff'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 14px', verticalAlign: 'middle', color: '#334155', fontSize: '13px', fontWeight: '500' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Store size={13} color="#64748B" />
                                <span>{emp.branchName || 'Main Store'}</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 14px', verticalAlign: 'middle', color: '#16A34A', fontSize: '13.5px', fontWeight: '700' }}>
                              {emp.salary ? formatCurrency(emp.salary) : '—'}
                            </td>
                            <td style={{ padding: '14px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                              <span style={{ 
                                display: 'inline-block',
                                fontSize: '11.5px', 
                                padding: '3px 10px', 
                                borderRadius: '12px', 
                                background: emp.status === 'Active' ? '#DCFCE7' : '#FEE2E2', 
                                color: emp.status === 'Active' ? '#15803D' : '#B91C1C', 
                                fontWeight: '700' 
                              }}>
                                {emp.status || 'Active'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                              {emp.email ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenLoginModal('employee', emp)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '7px',
                                    background: '#EFF6FF',
                                    border: '1px solid #BFDBFE',
                                    color: '#1D4ED8',
                                    padding: '7px 14px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    boxShadow: '0 1px 2px rgba(37, 99, 235, 0.05)'
                                  }}
                                  onMouseOver={(e) => { e.currentTarget.style.background = '#DBEAFE'; }}
                                  onMouseOut={(e) => { e.currentTarget.style.background = '#EFF6FF'; }}
                                >
                                  <KeyRound size={15} />
                                  <span>Manage Login</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenLoginModal('employee', emp)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '7px',
                                    background: '#F8FAFC',
                                    border: '1px dashed #93C5FD',
                                    color: '#2563EB',
                                    padding: '7px 14px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseOver={(e) => { e.currentTarget.style.background = '#EFF6FF'; }}
                                  onMouseOut={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                                >
                                  <KeyRound size={15} />
                                  <span>Setup Login</span>
                                </button>
                              )}
                            </td>
                            <td style={{ padding: '14px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <button onClick={() => setViewModalData({ type: 'employee', data: emp })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', background: '#EFF6FF', border: '1px solid #DBEAFE', color: '#2563EB', cursor: 'pointer' }} title="View Employee"><Eye size={15} /></button>
                                <button onClick={() => openEditModal('employee', emp)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', cursor: 'pointer' }} title="Edit Employee"><Edit2 size={15} /></button>
                                <button onClick={() => setDeleteConfirm({ type: 'employee', id: emp._id, name: emp.name })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#EF4444', cursor: 'pointer' }} title="Delete Employee"><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalItems={filteredEmployees.length}
                  itemsPerPage={itemsPerPage}
                  setItemsPerPage={setItemsPerPage}
                  itemName="employees"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 14: BUSINESSES */}
          {/* ======================================================== */}
          {activeSection === 'businesses' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #DBEAFE' }}>
                      <Building2 size={24} />
                    </div>
                    Businesses Management
                  </h1>
                  <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                    Manage conglomerate businesses, branches, categories, key contacts, and dedicated access.
                  </p>
                </div>
                <button 
                  onClick={() => openAddModal('business')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563EB', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}
                >
                  <Plus size={17} /> Add New Business
                </button>
              </div>

              {/* 3 Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Businesses</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{businesses.length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><KeyRound size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Login Enabled</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{businesses.filter(b => b.email && b.isLoginEnabled !== false).length}</h3>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={22} /></div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Active Categories</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{new Set(businesses.map(b => b.category).filter(Boolean)).size || (businesses.length > 0 ? 1 : 0)}</h3>
                  </div>
                </div>
              </div>

              {/* Search, Filter, Export Bar */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: '0 1 360px', minWidth: '260px', position: 'relative' }}>
                  <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Search by name, category, contact, city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '10px 16px 10px 44px', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '14px', boxSizing: 'border-box', background: 'white' }}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                      <X size={15} />
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select value={filterDays} onChange={(e) => setFilterDays(e.target.value)} style={{ padding: '9px 14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#334155', fontWeight: '500', fontSize: '13.5px', outline: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <option value="all">Filter: All Time</option>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="custom">Custom Range</option>
                  </select>
                  {filterDays === 'custom' && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', color: '#334155', background: 'white' }} />
                      <span style={{ fontSize: '13px', color: '#64748B' }}>to</span>
                      <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', color: '#334155', background: 'white' }} />
                    </div>
                  )}
                  <button onClick={() => exportSectionCSV('businesses')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 15px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#334155', fontWeight: '600', fontSize: '13.5px', cursor: 'pointer' }}>
                    <Download size={16} /> Export
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '980px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        <th style={{ padding: '14px 10px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '56px', textAlign: 'center', verticalAlign: 'middle' }}>
                          S.No
                        </th>
                        <th onClick={() => requestSort('name')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '180px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Business Name {renderSortIcon('name')}</div>
                        </th>
                        <th onClick={() => requestSort('category')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 12px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '135px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Category {renderSortIcon('category')}</div>
                        </th>
                        <th style={{ padding: '14px 12px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '160px', verticalAlign: 'middle' }}>
                          Model & Operations
                        </th>
                        <th onClick={() => requestSort('contactPerson')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 12px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '135px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Contact Person {renderSortIcon('contactPerson')}</div>
                        </th>
                        <th onClick={() => requestSort('phone')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 12px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '150px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Contact Info {renderSortIcon('phone')}</div>
                        </th>
                        <th onClick={() => requestSort('city')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '14px 12px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '140px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>Location & Tax {renderSortIcon('city')}</div>
                        </th>
                        <th style={{ padding: '14px 12px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '155px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          Login Access
                        </th>
                        <th style={{ padding: '14px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px', width: '120px', textAlign: 'center', verticalAlign: 'middle' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBusinesses.length === 0 ? (
                        <tr>
                          <td colSpan="9" style={{ padding: '64px 32px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                <Building2 size={32} color="#3B82F6" />
                              </div>
                              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>No businesses found</h3>
                              <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5', fontSize: '14px' }}>
                                No businesses match the current search or filters. Click the button above to add one.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedBusinesses.map((b, index) => (
                          <tr key={b._id || index} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                            <td style={{ padding: '14px 10px', fontSize: '13px', color: '#64748B', fontWeight: '600', textAlign: 'center', verticalAlign: 'middle' }}>
                              {startIndex + index + 1}
                            </td>
                            <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0, border: '1px solid #DBEAFE' }}>
                                  <Building2 size={18} />
                                </div>
                                <div>
                                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', display: 'block', lineHeight: '1.3' }}>{b.name}</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                                    <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#2563EB', background: '#EFF6FF', padding: '1px 6px', borderRadius: '4px', border: '1px solid #DBEAFE' }}>
                                      {b.businessId || b.businessCode || (b.name ? `BIZ-${b.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}` : 'BIZ-0000')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '14px 12px', verticalAlign: 'middle' }}>
                              {b.category ? (
                                <span style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '5px', 
                                  fontSize: '12px', 
                                  fontWeight: '600', 
                                  padding: '4px 9px', 
                                  borderRadius: '8px', 
                                  background: '#F1F5F9', 
                                  color: '#334155',
                                  border: '1px solid #E2E8F0'
                                }}>
                                  <Tag size={12} color="#64748B" />
                                  {b.category}
                                </span>
                              ) : (
                                <span style={{ color: '#94A3B8', fontSize: '13px' }}>—</span>
                              )}
                            </td>
                            <td style={{ padding: '14px 12px', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '4px', 
                                  fontSize: '11px', 
                                  fontWeight: '600', 
                                  padding: '2px 8px', 
                                  borderRadius: '6px', 
                                  background: b.offeringType === 'service' ? '#F3E8FF' : b.offeringType === 'product' ? '#EFF6FF' : '#F0FDF4', 
                                  color: b.offeringType === 'service' ? '#7E22CE' : b.offeringType === 'product' ? '#1D4ED8' : '#15803D',
                                  width: 'fit-content',
                                  border: `1px solid ${b.offeringType === 'service' ? '#E9D5FF' : b.offeringType === 'product' ? '#BFDBFE' : '#BBF7D0'}`
                                }}>
                                  {b.offeringType === 'service' ? '🛠️ Services' : b.offeringType === 'product' ? '📦 Products' : '🔄 Product & Service'}
                                </span>
                                <span style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '4px', 
                                  fontSize: '11px', 
                                  fontWeight: '600', 
                                  padding: '2px 8px', 
                                  borderRadius: '6px', 
                                  background: b.operationsType === 'sales' ? '#EFF6FF' : b.operationsType === 'purchases' ? '#FEF3C7' : '#F8FAFC', 
                                  color: b.operationsType === 'sales' ? '#1D4ED8' : b.operationsType === 'purchases' ? '#B45309' : '#475569',
                                  width: 'fit-content',
                                  border: `1px solid ${b.operationsType === 'sales' ? '#BFDBFE' : b.operationsType === 'purchases' ? '#FDE68A' : '#E2E8F0'}`
                                }}>
                                  {b.operationsType === 'sales' ? '📈 Sales Only' : b.operationsType === 'purchases' ? '🛒 Purchases' : '🔁 Sales & Purchases'}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 12px', verticalAlign: 'middle' }}>
                              {b.contactPerson ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', fontSize: '13px', fontWeight: '500' }}>
                                  <User size={14} color="#64748B" />
                                  <span>{b.contactPerson}</span>
                                </div>
                              ) : (
                                <span style={{ color: '#94A3B8', fontSize: '13px' }}>—</span>
                              )}
                            </td>
                            <td style={{ padding: '14px 12px', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                {b.phone ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F172A', fontSize: '13px', fontWeight: '600' }}>
                                    <Phone size={13} color="#64748B" /> <span>{b.phone}</span>
                                  </div>
                                ) : <span style={{ color: '#94A3B8', fontSize: '13px' }}>—</span>}
                                {b.email && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748B', fontSize: '12px' }}>
                                    <Mail size={12} color="#94A3B8" />
                                    <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={b.email}>{b.email}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '14px 12px', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                {b.city ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#334155', fontSize: '13px', fontWeight: '500' }}>
                                    <MapPin size={13} color="#64748B" />
                                    <span>{b.city}</span>
                                  </div>
                                ) : (!b.taxNumber && <span style={{ color: '#94A3B8', fontSize: '13px' }}>—</span>)}
                                {b.taxNumber && (
                                  <span style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '1px 6px', borderRadius: '4px', width: 'fit-content' }}>
                                    GST: {b.taxNumber}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '14px 12px', textAlign: 'center', verticalAlign: 'middle' }}>
                              {b.email ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenLoginModal('business', b)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '7px',
                                    background: '#EFF6FF',
                                    border: '1px solid #BFDBFE',
                                    color: '#1D4ED8',
                                    padding: '7px 14px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    boxShadow: '0 1px 2px rgba(37, 99, 235, 0.05)'
                                  }}
                                  onMouseOver={(e) => { e.currentTarget.style.background = '#DBEAFE'; }}
                                  onMouseOut={(e) => { e.currentTarget.style.background = '#EFF6FF'; }}
                                >
                                  <KeyRound size={15} />
                                  <span>Manage Login</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenLoginModal('business', b)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '7px',
                                    background: '#F8FAFC',
                                    border: '1px dashed #93C5FD',
                                    color: '#2563EB',
                                    padding: '7px 14px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseOver={(e) => { e.currentTarget.style.background = '#EFF6FF'; }}
                                  onMouseOut={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                                >
                                  <KeyRound size={15} />
                                  <span>Setup Login</span>
                                </button>
                              )}
                            </td>
                            <td style={{ padding: '14px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <button onClick={() => setViewModalData({ type: 'business', data: b })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', background: '#EFF6FF', border: '1px solid #DBEAFE', color: '#2563EB', cursor: 'pointer' }} title="View Business"><Eye size={15} /></button>
                                <button onClick={() => openEditModal('business', b)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', cursor: 'pointer' }} title="Edit Business"><Edit2 size={15} /></button>
                                <button onClick={() => setDeleteConfirm({ type: 'business', id: b._id, name: b.name, parentId: customer._id })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#EF4444', cursor: 'pointer' }} title="Delete Business"><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalItems={filteredBusinesses.length}
                  itemsPerPage={itemsPerPage}
                  setItemsPerPage={setItemsPerPage}
                  itemName="businesses"
                />
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ============================================================ */}
      {/* VIEW MODAL */}
      {/* ============================================================ */}
      {viewModalData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', maxWidth: '560px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} color="#2563EB" />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0F172A', textTransform: 'capitalize' }}>
                  {viewModalData.type} Details
                </h3>
              </div>
              <button onClick={() => setViewModalData(null)} style={{ cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(viewModalData.data)
                .filter(([key]) => !['_id', 'tenantId', 'password', '__v'].includes(key))
                .map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#64748B', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A', textAlign: 'right', maxWidth: '300px' }}>
                      {typeof value === 'boolean' ? (value ? 'Yes / Enabled' : 'No / Disabled') : typeof value === 'number' && (key.toLowerCase().includes('amount') || key.toLowerCase().includes('salary') || key.toLowerCase().includes('price')) ? formatCurrency(value) : key.toLowerCase().includes('date') || key.toLowerCase().includes('at') ? formatDate(value) : typeof value === 'object' && value !== null ? (value.name || JSON.stringify(value)) : String(value || 'N/A')}
                    </span>
                  </div>
                ))}
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#F8FAFC' }}>
              <button onClick={() => { const t = viewModalData.type; const d = viewModalData.data; setViewModalData(null); openEditModal(t, d); }} className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                <Edit2 size={14} /> Edit This Record
              </button>
              <button onClick={() => setViewModalData(null)} style={{ padding: '8px 16px', background: '#E2E8F0', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* EDIT MODAL */}
      {/* ============================================================ */}
      {editModalData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', maxWidth: '600px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={18} color="#2563EB" />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0F172A', textTransform: 'capitalize' }}>
                  Edit {editModalData.type === 'user' ? 'Customer Profile' : editModalData.type}
                </h3>
              </div>
              <button onClick={() => setEditModalData(null)} style={{ cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {Object.entries(editModalData.formData).map(([fieldKey, val]) => {
                  const isEmployeeFieldInEmployee = editModalData.type === 'employee' && fieldKey === 'employeeId';
                  const label = isEmployeeFieldInEmployee 
                    ? 'Employee ID' 
                    : fieldKey === 'employeeId' 
                    ? 'Employee' 
                    : fieldKey === 'branchId' 
                    ? 'Branch ID' 
                    : fieldKey === 'businessId' 
                    ? 'Business ID' 
                    : fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  const isSelect = !isEmployeeFieldInEmployee && ['subscriptionStatus', 'subscriptionBillingCycle', 'status', 'isLoginEnabled', 'offeringType', 'type', 'itemType', 'transactionType', 'categoryId', 'subCategoryId', 'employeeId'].includes(fieldKey) && !fieldKey.toLowerCase().includes('phone');

                  return (
                    <div key={fieldKey} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>{label}</label>

                      {isSelect ? (
                        <select
                          value={String(val || '')}
                          onChange={(e) => {
                            const newV = fieldKey === 'isLoginEnabled' ? e.target.value === 'true' : e.target.value;
                            setEditModalData(prev => ({
                              ...prev,
                              formData: { ...prev.formData, [fieldKey]: newV }
                            }));
                          }}
                          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: 'white' }}
                        >
                          {fieldKey === 'employeeId' && (
                            <>
                              <option value="">Select Employee...</option>
                              {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.name}{emp.position ? ` (${emp.position})` : ''}</option>
                              ))}
                            </>
                          )}
                          {fieldKey === 'categoryId' && (
                            <>
                              <option value="">Select Category</option>
                              {categories.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                              ))}
                            </>
                          )}
                          {fieldKey === 'subCategoryId' && (
                            <>
                              <option value="">Select Sub Category (Optional)</option>
                              {subcategories.map(sc => (
                                <option key={sc._id} value={sc._id}>{sc.name} ({sc.categoryId?.name || 'General'})</option>
                              ))}
                            </>
                          )}
                          {fieldKey === 'itemType' && (
                            <>
                              <option value="product">Product</option>
                              <option value="service">Service</option>
                            </>
                          )}
                          {fieldKey === 'transactionType' && (
                            <>
                              <option value="both">Both Sales & Purchases</option>
                              <option value="sales">Sales Only</option>
                              <option value="purchases">Purchases Only</option>
                            </>
                          )}
                          {fieldKey === 'subscriptionStatus' && (
                            <>
                              <option value="Active">Active</option>
                              <option value="Trial">Trial</option>
                              <option value="Pending Renewal">Pending Renewal</option>
                              <option value="Expired">Expired</option>
                              <option value="Cancelled">Cancelled</option>
                            </>
                          )}
                          {fieldKey === 'subscriptionBillingCycle' && (
                            <>
                              <option value="Monthly">Monthly</option>
                              <option value="Annual">Annual</option>
                            </>
                          )}
                          {fieldKey === 'status' && editModalData.type === 'attendance' ? (
                            <>
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                              <option value="Half Day">Half Day</option>
                              <option value="Late">Late</option>
                            </>
                          ) : fieldKey === 'status' && editModalData.type === 'leave' ? (
                            <>
                              <option value="Pending">Pending</option>
                              <option value="Approved">Approved</option>
                              <option value="Rejected">Rejected</option>
                            </>
                          ) : fieldKey === 'status' ? (
                            <>
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                              <option value="On Leave">On Leave</option>
                              <option value="Paid">Paid</option>
                              <option value="Pending">Pending</option>
                              <option value="Completed">Completed</option>
                            </>
                          ) : null}
                          {fieldKey === 'type' && editModalData.type === 'leave' && (
                            <>
                              <option value="Sick Leave">Sick Leave</option>
                              <option value="Casual Leave">Casual Leave</option>
                              <option value="Annual Leave">Annual Leave</option>
                              <option value="Unpaid">Unpaid</option>
                            </>
                          )}
                          {fieldKey === 'isLoginEnabled' && (
                            <>
                              <option value="true">Enabled</option>
                              <option value="false">Disabled</option>
                            </>
                          )}
                          {fieldKey === 'offeringType' && (
                            <>
                              <option value="both">Both Products & Services</option>
                              <option value="product">Products Only</option>
                              <option value="service">Services Only</option>
                            </>
                          )}
                        </select>
                      ) : ['description', 'reason', 'address'].includes(fieldKey) ? (
                        <textarea
                          rows={3}
                          value={val || ''}
                          placeholder={getFieldPlaceholder(fieldKey, editModalData.type)}
                          onChange={(e) => {
                            setEditModalData(prev => ({
                              ...prev,
                              formData: { ...prev.formData, [fieldKey]: e.target.value }
                            }));
                          }}
                          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: '#F8FAFC', width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                        />
                      ) : (
                        <input
                          type={typeof val === 'number' || ['amount', 'price', 'salary', 'stock', 'quantity', 'notifyBeforeDays'].includes(fieldKey) ? 'number' : fieldKey.toLowerCase().includes('date') ? 'date' : 'text'}
                          value={val ?? ''}
                          placeholder={getFieldPlaceholder(fieldKey, editModalData.type)}
                          onChange={(e) => {
                            const isNum = typeof val === 'number' || ['amount', 'price', 'salary', 'stock', 'quantity', 'notifyBeforeDays'].includes(fieldKey);
                            const newV = isNum ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value;
                            setEditModalData(prev => ({
                              ...prev,
                              formData: { ...prev.formData, [fieldKey]: newV }
                            }));
                          }}
                          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: '#F8FAFC', width: '100%', boxSizing: 'border-box' }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#F8FAFC' }}>
                <button type="button" onClick={() => setEditModalData(null)} style={{ padding: '8px 16px', background: '#E2E8F0', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                  Cancel
                </button>
                <button type="submit" disabled={savingAction} className="btn-primary" style={{ fontSize: '13px', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {savingAction ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD MODAL */}
      {/* ============================================================ */}
      {addModalData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '540px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0F172A' }}>
                  {addModalData.type === 'attendance' ? 'Mark Attendance' : `Add ${addModalData.type.charAt(0).toUpperCase() + addModalData.type.slice(1)}`}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>Fill in the details below</p>
              </div>
              <button onClick={() => setAddModalData(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit} style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Object.entries(addModalData.formData)
                  .filter(([k]) => !['tenantId'].includes(k) && !(addModalData.type === 'attendance' && k === 'checkOut'))
                  .map(([fieldKey, fieldValue]) => {
                    const isEmployeeFieldInEmployee = addModalData.type === 'employee' && fieldKey === 'employeeId';
                    const label = isEmployeeFieldInEmployee 
                      ? 'Employee ID' 
                      : fieldKey === 'employeeId' 
                      ? 'Employee' 
                      : fieldKey === 'branchId' 
                      ? 'Branch ID' 
                      : fieldKey === 'businessId' 
                      ? 'Business ID' 
                      : fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                    const isBoolean = typeof fieldValue === 'boolean';
                    const isDate = fieldKey.toLowerCase().includes('date');
                    const isNumber = typeof fieldValue === 'number' || ['amount', 'price', 'salary', 'stock', 'quantity', 'notifyBeforeDays'].includes(fieldKey);
                    const isSelect = !isEmployeeFieldInEmployee && ['status', 'type', 'customerType', 'offeringType', 'subscriptionStatus', 'subscriptionBillingCycle', 'itemType', 'transactionType', 'categoryId', 'subCategoryId', 'employeeId'].includes(fieldKey);
                    const isTextarea = ['description', 'reason', 'address'].includes(fieldKey);
                    const placeholder = getFieldPlaceholder(fieldKey, addModalData.type);
                    return (
                      <div key={fieldKey}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748B', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
                        {isBoolean ? (
                          <select
                            value={fieldValue ? 'true' : 'false'}
                            onChange={(e) => setAddModalData(p => ({ ...p, formData: { ...p.formData, [fieldKey]: e.target.value === 'true' } }))}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: '#F8FAFC' }}
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        ) : isSelect ? (
                          <select
                            value={String(fieldValue || '')}
                            onChange={(e) => setAddModalData(p => ({ ...p, formData: { ...p.formData, [fieldKey]: e.target.value } }))}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: '#F8FAFC' }}
                          >
                            {fieldKey === 'employeeId' && (
                              <>
                                <option value="">Select Employee...</option>
                                {employees.map(emp => (
                                  <option key={emp._id} value={emp._id}>{emp.name}{emp.position ? ` (${emp.position})` : ''}</option>
                                ))}
                              </>
                            )}
                            {fieldKey === 'categoryId' && (
                              <>
                                <option value="">Select Category...</option>
                                {categories.map(c => (
                                  <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                              </>
                            )}
                            {fieldKey === 'subCategoryId' && (
                              <>
                                <option value="">Select Sub Category (Optional)...</option>
                                {subcategories
                                  .filter(sc => !addModalData.formData.categoryId || (sc.categoryId?._id || sc.categoryId) === addModalData.formData.categoryId)
                                  .map(sc => (
                                    <option key={sc._id} value={sc._id}>{sc.name}</option>
                                  ))}
                              </>
                            )}
                            {fieldKey === 'itemType' && (
                              <>
                                <option value="product">Product</option>
                                <option value="service">Service</option>
                              </>
                            )}
                            {fieldKey === 'transactionType' && (
                              <>
                                <option value="both">Both Sales & Purchases</option>
                                <option value="sales">Sales Only</option>
                                <option value="purchases">Purchases Only</option>
                              </>
                            )}
                            {fieldKey === 'status' && addModalData.type === 'attendance' && (<><option value="Present">Present</option><option value="Absent">Absent</option><option value="Half Day">Half Day</option><option value="Late">Late</option></>)}
                            {fieldKey === 'status' && addModalData.type === 'leave' && (<><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option></>)}
                            {fieldKey === 'status' && addModalData.type === 'reminder' && (<><option value="Pending">Pending</option><option value="Completed">Completed</option></>)}
                            {fieldKey === 'status' && !['attendance','leave','reminder'].includes(addModalData.type) && (<><option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Paid">Paid</option><option value="Pending">Pending</option><option value="Cancelled">Cancelled</option></>)}
                            {fieldKey === 'type' && addModalData.type === 'leave' && (<><option value="Sick Leave">Sick Leave</option><option value="Casual Leave">Casual Leave</option><option value="Annual Leave">Annual Leave</option><option value="Unpaid">Unpaid</option></>)}
                            {fieldKey === 'type' && addModalData.type === 'document' && (<><option value="Contract">Contract</option><option value="Invoice">Invoice</option><option value="Certificate">Certificate</option><option value="Report">Report</option><option value="Other">Other</option></>)}
                            {fieldKey === 'type' && addModalData.type === 'branch' && (<><option value="Store">Store</option><option value="Warehouse">Warehouse</option><option value="Office">Office</option></>)}
                            {fieldKey === 'customerType' && (<><option value="Retail">Retail</option><option value="Wholesale">Wholesale</option><option value="Corporate">Corporate</option></>)}
                            {fieldKey === 'offeringType' && (<><option value="both">Products & Services</option><option value="products">Products Only</option><option value="services">Services Only</option></>)}
                          </select>
                        ) : isTextarea ? (
                          <textarea
                            rows={3}
                            value={fieldValue ?? ''}
                            placeholder={placeholder}
                            onChange={(e) => setAddModalData(p => ({ ...p, formData: { ...p.formData, [fieldKey]: e.target.value } }))}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box', resize: 'vertical' }}
                          />
                        ) : (
                          <input
                            type={isDate ? 'date' : isNumber ? 'number' : 'text'}
                            value={fieldValue ?? ''}
                            placeholder={placeholder}
                            onChange={(e) => setAddModalData(p => ({ ...p, formData: { ...p.formData, [fieldKey]: isNumber ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value } }))}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box' }}
                          />
                        )}
                      </div>
                    );
                  })}
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#F8FAFC', flexShrink: 0 }}>
                <button type="button" onClick={() => setAddModalData(null)} style={{ padding: '8px 16px', background: '#E2E8F0', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#475569', border: 'none', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={savingAction} className="btn-primary" style={{ fontSize: '13px', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {savingAction ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
                  {addModalData.type === 'attendance' ? 'Mark Attendance' : `Add ${addModalData.type.charAt(0).toUpperCase() + addModalData.type.slice(1)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ============================================================ */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', maxWidth: '440px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', textAlign: 'center', padding: '28px 24px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>
              Delete {deleteConfirm.type === 'user' ? 'Customer Account' : deleteConfirm.type.charAt(0).toUpperCase() + deleteConfirm.type.slice(1)}?
            </h3>
            
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748B', lineHeight: '1.5' }}>
              Are you sure you want to permanently delete <strong>{deleteConfirm.name || 'this item'}</strong>? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: '9px 18px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} disabled={savingAction} style={{ padding: '9px 20px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {savingAction && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CONFIRM CHECK OUT MODAL */}
      {/* ============================================================ */}
      {checkoutModalData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', maxWidth: '420px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LogOut size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>Confirm Check Out</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>{checkoutModalData.employeeName}</p>
                </div>
              </div>
              <button type="button" onClick={() => setCheckoutModalData(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmCheckout} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                  Check Out Time <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="time"
                  required
                  value={checkoutModalData.time}
                  onChange={(e) => setCheckoutModalData(prev => ({ ...prev, time: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCheckoutModalData(null)}
                  style={{ padding: '9px 16px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAction}
                  style={{ padding: '9px 20px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {savingAction && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  <LogOut size={14} />
                  Confirm Check Out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* RECEIPT PREVIEW LIGHTBOX */}
      {previewReceiptUrl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', maxWidth: '600px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Expense Receipt Proof</h3>
              <button onClick={() => setPreviewReceiptUrl(null)} style={{ cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', maxHeight: '70vh', overflowY: 'auto' }}>
              <img src={previewReceiptUrl} alt="Receipt proof" style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '8px' }} />
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <a href={previewReceiptUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ fontSize: '13px', padding: '8px 14px' }}>
                <ExternalLink size={14} /> Open Full Size
              </a>
              <button onClick={() => setPreviewReceiptUrl(null)} style={{ padding: '8px 14px', background: '#F1F5F9', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* LOGIN CREDENTIALS MODAL (Setup Login & Manage Login) */}
      {/* ============================================================ */}
      {loginModalData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '18px', maxWidth: '480px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #DBEAFE' }}>
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0F172A' }}>
                    {loginModalData.item?.email ? 'Manage Login Access' : 'Setup Login Credentials'}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                    Configure dedicated login credentials for <strong style={{ color: '#0F172A' }}>{loginModalData.item?.name || loginModalData.item?.fullName || 'Entity'}</strong>
                  </p>
                </div>
              </div>
              <button onClick={() => setLoginModalData(null)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#64748B', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCredentials} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {credentialsError && (
                <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#B91C1C', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{credentialsError}</span>
                </div>
              )}

              {credentialsSuccess && (
                <div style={{ padding: '10px 14px', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', color: '#15803D', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} />
                  <span>{credentialsSuccess}</span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Login Email <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="email"
                    required
                    value={loginModalData.email}
                    onChange={(e) => setLoginModalData({ ...loginModalData, email: e.target.value })}
                    placeholder="e.g. login@biztech.com"
                    style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  {loginModalData.item?.email ? 'New Password (leave blank to keep current)' : 'Set Password *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginModalData.password}
                    onChange={(e) => setLoginModalData({ ...loginModalData, password: e.target.value })}
                    placeholder={loginModalData.item?.email ? 'Enter new password to change' : 'Min 6 characters'}
                    style={{ width: '100%', padding: '10px 40px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  Password should be at least 6 characters long.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setLoginModalData(null)}
                  style={{ flex: 1, padding: '10px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCredentials}
                  style={{ flex: 1, padding: '10px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', opacity: savingCredentials ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {savingCredentials ? (
                    <>
                      <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Credentials</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export { CustomerDetails };
export default CustomerDetails;

