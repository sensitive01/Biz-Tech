import { exportToCSV } from '@/utils/exportToCSV';
import { formatDate } from '@/utils/formatDate';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowUp, ArrowDown, ShoppingCart, Plus, X, Eye, Trash2, 
  AlertTriangle, Search, Filter, ArrowUpDown, Download, IndianRupee, 
  PackageCheck, Clock, Package, Check, CheckCircle2, Tag, 
  Loader2, Sparkles, PlusCircle, Building2, Phone, Calendar,
  CreditCard, FileText, ChevronRight
} from 'lucide-react';
import TablePagination from '@/components/TablePagination';

const Purchases = () => {
  const [items, setItems] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [subcategoriesList, setSubcategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingPurchase, setSavingPurchase] = useState(false);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filterDays, setFilterDays] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- Purchase Order Form State ---
  const [poForm, setPoForm] = useState({
    poNumber: '',
    supplierName: '',
    supplierPhone: '',
    date: new Date().toISOString().substring(0, 10),
    status: 'Received',
    paymentStatus: 'Paid',
    paymentMethod: 'Cash',
    notes: ''
  });

  // Current items in the purchase being created
  const [orderItems, setOrderItems] = useState([]);

  // Active line-item adder state
  const [itemMode, setItemMode] = useState('existing'); // 'existing' | 'new'
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  
  // Existing product inputs
  const [existingQty, setExistingQty] = useState(1);
  const [existingCostPrice, setExistingCostPrice] = useState('');
  const [existingSellingPrice, setExistingSellingPrice] = useState('');

  // New product inputs
  const [newProductName, setNewProductName] = useState('');
  const [newProductSku, setNewProductSku] = useState('');
  const [newProductCategoryId, setNewProductCategoryId] = useState('');
  const [newProductSubCategoryId, setNewProductSubCategoryId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('pcs');
  const [newQty, setNewQty] = useState(1);
  const [newCostPrice, setNewCostPrice] = useState('');
  const [newSellingPrice, setNewSellingPrice] = useState('');

  // Sorting helper
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} style={{ opacity: 0.3, marginLeft: '4px' }} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} style={{ color: 'var(--primary-blue)', marginLeft: '4px' }} /> : <ArrowDown size={14} style={{ color: 'var(--primary-blue)', marginLeft: '4px' }} />;
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'received' || s === 'completed' || s === 'delivered') {
      return { bg: '#DCFCE7', color: '#166534', border: '#BBF7D0', label: 'Received & Stocked' };
    }
    if (s === 'ordered') {
      return { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE', label: 'Ordered' };
    }
    if (s === 'pending') {
      return { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A', label: 'Pending' };
    }
    if (s === 'cancelled') {
      return { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA', label: 'Cancelled' };
    }
    return { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0', label: status || 'Received' };
  };

  const getPaymentBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'paid') return { bg: '#ECFDF5', color: '#059669', label: 'Paid' };
    if (s === 'due' || s === 'unpaid') return { bg: '#FEF2F2', color: '#DC2626', label: 'Due / Unpaid' };
    if (s === 'partial') return { bg: '#FFFBEB', color: '#D97706', label: 'Partial' };
    return { bg: '#F1F5F9', color: '#64748B', label: status || 'Paid' };
  };

  // Fetch purchases, products, and categories
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [purchasesRes, productsRes, categoriesRes, subcategoriesRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/purchases`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/products`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/categories`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/subcategories`, { headers })
      ]);

      if (purchasesRes.ok) setItems(await purchasesRes.json());
      if (productsRes.ok) {
        const prods = await productsRes.json();
        // Filter out pure services
        setProductsList(Array.isArray(prods) ? prods.filter(p => String(p.itemType || '').toLowerCase() !== 'service') : []);
      }
      if (categoriesRes.ok) setCategoriesList(await categoriesRes.json());
      if (subcategoriesRes.ok) setSubcategoriesList(await subcategoriesRes.json());
    } catch (err) {
      console.error('Error loading purchases data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open modal to add a new purchase
  const handleOpenAdd = () => {
    const autoPoNumber = `PO-${Date.now().toString().slice(-6)}`;
    setPoForm({
      poNumber: autoPoNumber,
      supplierName: '',
      supplierPhone: '',
      date: new Date().toISOString().substring(0, 10),
      status: 'Received',
      paymentStatus: 'Paid',
      paymentMethod: 'Cash',
      notes: ''
    });
    setOrderItems([]);
    setItemMode('existing');
    setSelectedProductId('');
    setProductSearchTerm('');
    setExistingQty(1);
    setExistingCostPrice('');
    setExistingSellingPrice('');
    setNewProductName('');
    setNewProductSku(`SKU-${Date.now().toString().slice(-5)}`);
    setNewProductCategoryId('');
    setNewProductSubCategoryId('');
    setNewCategoryName('');
    setNewProductUnit('pcs');
    setNewQty(1);
    setNewCostPrice('');
    setNewSellingPrice('');
    setShowModal(true);
  };

  // Filter subcategories for the newly configured product
  const availableNewSubCategories = useMemo(() => {
    if (!newProductCategoryId) return [];
    return subcategoriesList.filter(sc => {
      const catId = sc.categoryId?._id || sc.categoryId;
      return catId && String(catId) === String(newProductCategoryId);
    });
  }, [newProductCategoryId, subcategoriesList]);

  // When a product is selected in 'existing' mode, autofill its prices & info
  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return productsList.find(p => p._id === selectedProductId) || null;
  }, [selectedProductId, productsList]);

  useEffect(() => {
    if (selectedProduct) {
      setExistingSellingPrice(selectedProduct.price || '');
      setExistingCostPrice(selectedProduct.costPrice || '');
    }
  }, [selectedProduct]);

  // Add line item to purchase order
  const handleAddLineItem = (e) => {
    if (e) e.preventDefault();

    if (itemMode === 'existing') {
      if (!selectedProduct) {
        alert('Please select an existing product from the list.');
        return;
      }
      const qty = Number(existingQty) || 1;
      const unitCost = Number(existingCostPrice) || 0;
      const sellingPrice = Number(existingSellingPrice) || selectedProduct.price || 0;
      const totalCost = qty * unitCost;

      const subCatName = selectedProduct.subCategoryId?.name || '';
      const newItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: selectedProduct._id,
        name: selectedProduct.name,
        sku: selectedProduct.sku || '',
        categoryName: selectedProduct.categoryId?.name || '',
        categoryId: selectedProduct.categoryId?._id || selectedProduct.categoryId || null,
        subCategoryId: selectedProduct.subCategoryId?._id || selectedProduct.subCategoryId || null,
        subCategoryName: subCatName,
        unit: selectedProduct.unit || 'pcs',
        isNewProduct: false,
        quantity: qty,
        unitCost,
        sellingPrice,
        totalCost,
        currentStock: selectedProduct.stock || 0
      };

      setOrderItems(prev => [...prev, newItem]);

      // Reset item inputs
      setSelectedProductId('');
      setProductSearchTerm('');
      setExistingQty(1);
      setExistingCostPrice('');
      setExistingSellingPrice('');
    } else {
      // New Product Mode
      if (!newProductName.trim()) {
        alert('Please enter a name for the new product.');
        return;
      }
      const qty = Number(newQty) || 1;
      const unitCost = Number(newCostPrice) || 0;
      const sellingPrice = Number(newSellingPrice) || (unitCost * 1.25); // default markup if blank
      const totalCost = qty * unitCost;

      const chosenCategory = categoriesList.find(c => c._id === newProductCategoryId);
      const chosenSubCategory = subcategoriesList.find(sc => sc._id === newProductSubCategoryId);

      const newItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: null,
        name: newProductName.trim(),
        sku: newProductSku.trim() || `SKU-${Date.now().toString().slice(-5)}`,
        categoryId: newProductCategoryId || null,
        categoryName: chosenCategory?.name || newCategoryName || 'General',
        subCategoryId: newProductSubCategoryId || null,
        subCategoryName: chosenSubCategory?.name || '',
        unit: newProductUnit || 'pcs',
        isNewProduct: true,
        quantity: qty,
        unitCost,
        sellingPrice,
        totalCost,
        currentStock: 0
      };

      setOrderItems(prev => [...prev, newItem]);

      // Reset new product inputs
      setNewProductName('');
      setNewProductSku(`SKU-${Date.now().toString().slice(-5)}`);
      setNewProductCategoryId('');
      setNewProductSubCategoryId('');
      setNewCategoryName('');
      setNewProductUnit('pcs');
      setNewQty(1);
      setNewCostPrice('');
      setNewSellingPrice('');
    }
  };

  const handleRemoveLineItem = (index) => {
    setOrderItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Grand Total of purchase items
  const orderGrandTotal = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0);
  }, [orderItems]);

  const totalOrderUnits = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [orderItems]);

  // Submit Purchase to Backend
  const handleSavePurchaseOrder = async (e) => {
    e.preventDefault();

    if (!poForm.supplierName.trim()) {
      alert('Please enter the Supplier / Vendor name.');
      return;
    }

    if (orderItems.length === 0) {
      alert('Please add at least one product (existing or new) to this purchase order.');
      return;
    }

    setSavingPurchase(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        poNumber: poForm.poNumber,
        supplierName: poForm.supplierName,
        supplierPhone: poForm.supplierPhone,
        date: poForm.date,
        status: poForm.status,
        paymentStatus: poForm.paymentStatus,
        paymentMethod: poForm.paymentMethod,
        notes: poForm.notes,
        amount: orderGrandTotal,
        items: orderItems.map(item => ({
          productId: item.productId,
          name: item.name,
          sku: item.sku,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          isNewProduct: item.isNewProduct,
          quantity: item.quantity,
          unitCost: item.unitCost,
          sellingPrice: item.sellingPrice,
          totalCost: item.totalCost
        }))
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        // Refresh purchases list
        fetchData();
        // Dispatch global events so Products & Inventory tabs refresh automatically
        window.dispatchEvent(new Event('productDataUpdated'));
        window.dispatchEvent(new Event('inventoryDataUpdated'));
      } else {
        const errorData = await res.json();
        alert(`Error saving purchase: ${errorData.message || 'Server error'}`);
      }
    } catch (err) {
      console.error('Save purchase error:', err);
      alert('Failed to save purchase. Please check connection.');
    } finally {
      setSavingPurchase(false);
    }
  };

  // Confirm Delete
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/purchases/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteId(null);
        fetchData();
        window.dispatchEvent(new Event('productDataUpdated'));
        window.dispatchEvent(new Event('inventoryDataUpdated'));
      } else {
        alert('Failed to delete purchase order.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Summary Metrics
  const totalPurchasesCount = items.length;
  const totalSpentAmount = useMemo(() => items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0), [items]);
  const totalUnitsProcured = useMemo(() => {
    return items.reduce((sum, p) => {
      if (Array.isArray(p.items)) {
        return sum + p.items.reduce((iSum, itm) => iSum + (Number(itm.quantity) || 0), 0);
      }
      return sum;
    }, 0);
  }, [items]);
  const uniqueSuppliersCount = useMemo(() => {
    const sSet = new Set(items.map(i => (i.supplierName || '').trim().toLowerCase()).filter(Boolean));
    return sSet.size;
  }, [items]);

  // Filtering & Sorting
  const filteredItems = items
    .filter(i => {
      if (filterDays === 'all') return true;
      const itemDate = new Date(i.createdAt || i.date || new Date());
      const diffTime = Math.abs(new Date() - itemDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (filterDays === '7') return diffDays <= 7;
      if (filterDays === '30') return diffDays <= 30;
      if (filterDays === 'custom') {
        if (customStartDate && new Date(itemDate) < new Date(customStartDate)) return false;
        if (customEndDate && new Date(itemDate) > new Date(customEndDate)) return false;
      }
      return true;
    })
    .filter(i => {
      if (filterStatus === 'all') return true;
      return (i.status || 'Received').toLowerCase() === filterStatus.toLowerCase();
    })
    .filter(i => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const inPo = (i.poNumber || '').toLowerCase().includes(q);
      const inSupplier = (i.supplierName || '').toLowerCase().includes(q);
      const inItems = Array.isArray(i.items) && i.items.some(item => (item.name || '').toLowerCase().includes(q));
      return inPo || inSupplier || inItems;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'date' || sortConfig.key === 'createdAt') {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterDays, filterStatus, customStartDate, customEndDate, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  // Products filtered for the dropdown search
  const filteredDropdownProducts = useMemo(() => {
    if (!productSearchTerm.trim()) return productsList;
    const term = productSearchTerm.toLowerCase();
    return productsList.filter(p => 
      (p.name || '').toLowerCase().includes(term) || 
      (p.sku || '').toLowerCase().includes(term) ||
      (p.categoryId?.name || '').toLowerCase().includes(term)
    );
  }, [productsList, productSearchTerm]);

  return (
    <div style={{ padding: '24px', maxWidth: '1240px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Header & Primary Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
              <ShoppingCart size={24} />
            </div>
            Purchases &amp; Procurement
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
            Purchase new and existing inventory items. Newly purchased products automatically update into your Products section and add to stock.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '12px 22px', 
            background: '#2563EB', 
            border: 'none', 
            borderRadius: '10px', 
            color: 'white', 
            fontWeight: '600', 
            fontSize: '14px', 
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)' 
          }}
        >
          <Plus size={18} /> Record New Purchase
        </button>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
        
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={22} />
          </div>
          <div>
            <p style={{ margin: '0 0 3px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Orders</p>
            <h3 style={{ margin: 0, fontSize: '22px', color: '#0F172A', fontWeight: '700' }}>{totalPurchasesCount}</h3>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IndianRupee size={22} />
          </div>
          <div>
            <p style={{ margin: '0 0 3px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Amount Spent</p>
            <h3 style={{ margin: 0, fontSize: '22px', color: '#0F172A', fontWeight: '700' }}>
              ₹{totalSpentAmount.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={22} />
          </div>
          <div>
            <p style={{ margin: '0 0 3px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Units Procured</p>
            <h3 style={{ margin: 0, fontSize: '22px', color: '#0F172A', fontWeight: '700' }}>{totalUnitsProcured} Units</h3>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={22} />
          </div>
          <div>
            <p style={{ margin: '0 0 3px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Active Suppliers</p>
            <h3 style={{ margin: 0, fontSize: '22px', color: '#0F172A', fontWeight: '700' }}>{uniqueSuppliersCount}</h3>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input 
            type="text" 
            placeholder="Search PO #, supplier, or product..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }} 
          />
        </div>

        {/* Filters and CSV Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)} 
            style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white', fontSize: '13px', color: '#334155', outline: 'none', cursor: 'pointer' }}
          >
            <option value="all">All Statuses</option>
            <option value="received">Received &amp; Stocked</option>
            <option value="ordered">Ordered</option>
            <option value="pending">Pending</option>
          </select>

          <select 
            value={filterDays} 
            onChange={(e) => setFilterDays(e.target.value)} 
            style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white', fontSize: '13px', color: '#334155', outline: 'none', cursor: 'pointer' }}
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="custom">Custom Date Range</option>
          </select>

          {filterDays === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input 
                type="date" 
                value={customStartDate} 
                onChange={(e) => setCustomStartDate(e.target.value)} 
                style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }} 
              />
              <span style={{ color: '#94A3B8' }}>to</span>
              <input 
                type="date" 
                value={customEndDate} 
                onChange={(e) => setCustomEndDate(e.target.value)} 
                style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }} 
              />
            </div>
          )}

          <button 
            onClick={() => exportToCSV(filteredItems, 'Purchases_Export')} 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#334155', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            <Download size={14} /> Export CSV
          </button>

        </div>
      </div>

      {/* Main Purchases Table Card */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th onClick={() => requestSort('poNumber')} style={{ padding: '14px 18px', fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}>
                  PO # {renderSortIcon('poNumber')}
                </th>
                <th onClick={() => requestSort('supplierName')} style={{ padding: '14px 18px', fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}>
                  Supplier / Vendor {renderSortIcon('supplierName')}
                </th>
                <th onClick={() => requestSort('date')} style={{ padding: '14px 18px', fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}>
                  Date {renderSortIcon('date')}
                </th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Purchased Products &amp; Stock Added
                </th>
                <th onClick={() => requestSort('amount')} style={{ padding: '14px 18px', fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}>
                  Total Amount {renderSortIcon('amount')}
                </th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Status
                </th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px auto' }} />
                    <div>Loading purchase orders...</div>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px 20px', color: '#94A3B8' }}>
                    <ShoppingCart size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                    <h4 style={{ margin: '0 0 6px 0', color: '#334155', fontSize: '16px' }}>No Purchases Found</h4>
                    <p style={{ margin: 0, fontSize: '13.5px' }}>Record a purchase order to stock your inventory and populate new products.</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const badge = getStatusBadge(item.status);
                  const payBadge = getPaymentBadge(item.paymentStatus);
                  const itemCount = Array.isArray(item.items) ? item.items.length : 0;
                  const totalQty = Array.isArray(item.items) ? item.items.reduce((s, it) => s + (Number(it.quantity) || 0), 0) : 0;

                  return (
                    <tr key={item._id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }} onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                      
                      {/* PO # */}
                      <td style={{ padding: '14px 18px', fontSize: '13.5px', fontWeight: '700', color: '#0F172A', fontFamily: 'monospace' }}>
                        {item.poNumber || 'PO-N/A'}
                      </td>

                      {/* Supplier */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>
                          {item.supplierName || 'General Supplier'}
                        </div>
                        {item.supplierPhone && (
                          <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Phone size={11} /> {item.supplierPhone}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 18px', fontSize: '13.5px', color: '#475569', whiteSpace: 'nowrap' }}>
                        {formatDate(item.date || item.createdAt)}
                      </td>

                      {/* Purchased Products Summary */}
                      <td style={{ padding: '14px 18px' }}>
                        {itemCount > 0 ? (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                              {item.items.slice(0, 2).map((it, idx) => (
                                <span 
                                  key={idx} 
                                  style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '4px', 
                                    padding: '2px 8px', 
                                    borderRadius: '6px', 
                                    background: it.isNewProduct ? '#F0FDF4' : '#F1F5F9', 
                                    border: `1px solid ${it.isNewProduct ? '#BBF7D0' : '#E2E8F0'}`,
                                    fontSize: '11.5px', 
                                    color: it.isNewProduct ? '#166534' : '#334155',
                                    fontWeight: '500'
                                  }}
                                >
                                  {it.name} <strong style={{ color: it.isNewProduct ? '#059669' : '#2563EB' }}>+{it.quantity}</strong>
                                </span>
                              ))}
                              {itemCount > 2 && (
                                <span style={{ fontSize: '11px', color: '#64748B', background: '#F8FAFC', padding: '2px 6px', borderRadius: '4px' }}>
                                  +{itemCount - 2} more
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                              {itemCount} product{itemCount > 1 ? 's' : ''} • Total <strong>{totalQty} units</strong> added to stock
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
                            {item.amount ? 'Standard Procurement' : 'No items'}
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '14px 18px', fontSize: '14px', fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap' }}>
                        ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: '12px', fontSize: '11.5px', fontWeight: '600', background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                            {badge.label}
                          </span>
                          <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: '600', color: payBadge.color }}>
                            ● {payBadge.label}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          
                          <button 
                            type="button" 
                            onClick={() => setViewItem(item)} 
                            style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', border: '1px solid #DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            title="View Purchase Invoice & Item Breakdown"
                          >
                            <Eye size={15} />
                          </button>

                          <button 
                            type="button" 
                            onClick={() => setDeleteId(item._id)} 
                            style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            title="Delete Purchase Record"
                          >
                            <Trash2 size={15} />
                          </button>

                        </div>
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
          totalItems={filteredItems.length}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          itemName="purchases"
        />
      </div>

      {/* ======================================================== */}
      {/* RECORD PURCHASE ORDER MODAL */}
      {/* ======================================================== */}
      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '820px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 28px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Record Product Purchase</h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#64748B' }}>
                    Purchasing products updates existing inventory stock or automatically creates brand new catalog items.
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                style={{ background: 'white', border: '1px solid #E2E8F0', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSavePurchaseOrder} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', padding: '24px 28px', gap: '22px' }}>

              {/* Step 1: Purchase Order & Supplier Information */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} color="#2563EB" /> 1. Order &amp; Supplier Information
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>PO / Invoice #</label>
                    <input 
                      type="text" 
                      value={poForm.poNumber} 
                      onChange={e => setPoForm({ ...poForm, poNumber: e.target.value })} 
                      required 
                      style={{ width: '100%', height: '38px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'monospace' }} 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Supplier / Vendor Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ramesh Electronics Wholesale" 
                      value={poForm.supplierName} 
                      onChange={e => setPoForm({ ...poForm, supplierName: e.target.value })} 
                      required 
                      style={{ width: '100%', height: '38px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }} 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Purchase Date</label>
                    <input 
                      type="date" 
                      value={poForm.date} 
                      onChange={e => setPoForm({ ...poForm, date: e.target.value })} 
                      required 
                      style={{ width: '100%', height: '38px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }} 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Payment Status</label>
                    <select 
                      value={poForm.paymentStatus} 
                      onChange={e => setPoForm({ ...poForm, paymentStatus: e.target.value })} 
                      style={{ width: '100%', height: '38px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', background: 'white' }}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Due">Due / Unpaid</option>
                      <option value="Partial">Partial</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* Step 2: Add Products (Existing vs New Product Builder) */}
              <div style={{ background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '20px' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <PackagePlusIcon size={16} color="#2563EB" /> 2. Add Purchased Product
                  </h4>

                  {/* Mode Selector Tabs */}
                  <div style={{ display: 'flex', background: '#E2E8F0', padding: '3px', borderRadius: '8px', gap: '2px' }}>
                    <button
                      type="button"
                      onClick={() => setItemMode('existing')}
                      style={{
                        padding: '6px 14px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background: itemMode === 'existing' ? 'white' : 'transparent',
                        color: itemMode === 'existing' ? '#2563EB' : '#64748B',
                        boxShadow: itemMode === 'existing' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      🛒 Existing Product (Add Stock)
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemMode('new')}
                      style={{
                        padding: '6px 14px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background: itemMode === 'new' ? 'white' : 'transparent',
                        color: itemMode === 'new' ? '#059669' : '#64748B',
                        boxShadow: itemMode === 'new' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      ✨ New Product (Add to Catalog &amp; Stock)
                    </button>
                  </div>
                </div>

                {/* Sub-form A: Existing Product Selection */}
                {itemMode === 'existing' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                        Select Product from Catalog:
                      </label>
                      <select
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        style={{ width: '100%', height: '40px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', background: 'white' }}
                      >
                        <option value="">-- Choose Existing Product ({productsList.length} available) --</option>
                        {productsList.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.name} {p.sku ? `(${p.sku})` : ''} • Current Stock: {p.stock ?? 0} units • Selling Price: ₹{p.price}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedProduct && (
                      <div style={{ padding: '12px 16px', background: '#EFF6FF', borderRadius: '10px', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E3A8A' }}>{selectedProduct.name}</div>
                          <div style={{ fontSize: '12px', color: '#2563EB', marginTop: '2px' }}>
                            Category: <strong>{selectedProduct.categoryId?.name || 'General'}</strong> • SKU: <code>{selectedProduct.sku || 'N/A'}</code>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '12px', background: '#DBEAFE', color: '#1D4ED8', padding: '3px 10px', borderRadius: '12px', fontWeight: '700' }}>
                            Current In-Stock: {selectedProduct.stock ?? 0}
                          </span>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                          Qty to Purchase *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={existingQty}
                          onChange={e => {
                            const val = e.target.value;
                            setExistingQty(val === '' ? '' : Math.max(0, parseInt(val, 10) || 0));
                          }}
                          onBlur={() => {
                            if (!existingQty || Number(existingQty) < 1) setExistingQty(1);
                          }}
                          style={{ width: '100%', height: '38px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                        {selectedProduct && (
                          <span style={{ fontSize: '11px', color: '#059669', display: 'block', marginTop: '3px', fontWeight: '600' }}>
                            ➔ New stock: {(Number(selectedProduct.stock) || 0) + Number(existingQty)} units
                          </span>
                        )}
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                          Unit Buy Cost (₹) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="e.g. 250"
                          value={existingCostPrice}
                          onChange={e => setExistingCostPrice(e.target.value)}
                          style={{ width: '100%', height: '38px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                          Selling Price (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Selling Price"
                          value={existingSellingPrice}
                          onChange={e => setExistingSellingPrice(e.target.value)}
                          style={{ width: '100%', height: '38px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                          Subtotal (₹)
                        </label>
                        <div style={{ height: '38px', display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
                          ₹{(Number(existingQty || 1) * Number(existingCostPrice || 0)).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={handleAddLineItem}
                          style={{
                            width: '100%',
                            height: '38px',
                            background: '#2563EB',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <PlusCircle size={15} /> Add Item
                        </button>
                      </div>

                    </div>
                  </div>
                ) : (
                  /* Sub-form B: New Product Creation & Purchase */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ padding: '8px 12px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', fontSize: '12px', color: '#065F46' }}>
                      💡 <strong>New Catalog Item:</strong> This product will be automatically created in the <strong>Products</strong> catalog and stock inventory once this purchase order is saved.
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>New Product Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Wireless Mouse M185"
                          value={newProductName}
                          onChange={e => setNewProductName(e.target.value)}
                          style={{ width: '100%', height: '38px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Category *</label>
                        <select
                          value={newProductCategoryId}
                          onChange={e => {
                            setNewProductCategoryId(e.target.value);
                            setNewProductSubCategoryId('');
                          }}
                          style={{ width: '100%', height: '38px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', background: 'white' }}
                        >
                          <option value="">-- Select Category --</option>
                          {categoriesList.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Sub Category</label>
                        <select
                          value={newProductSubCategoryId}
                          onChange={e => setNewProductSubCategoryId(e.target.value)}
                          disabled={!newProductCategoryId || availableNewSubCategories.length === 0}
                          style={{
                            width: '100%',
                            height: '38px',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            fontSize: '13px',
                            boxSizing: 'border-box',
                            background: (!newProductCategoryId || availableNewSubCategories.length === 0) ? '#F8FAFC' : 'white',
                            color: (!newProductCategoryId || availableNewSubCategories.length === 0) ? '#94A3B8' : '#0F172A',
                            cursor: (!newProductCategoryId || availableNewSubCategories.length === 0) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {!newProductCategoryId ? (
                            <option value="">-- Select category first --</option>
                          ) : availableNewSubCategories.length === 0 ? (
                            <option value="">-- No subcategories --</option>
                          ) : (
                            <>
                              <option value="">-- Select Sub Category --</option>
                              {availableNewSubCategories.map(sc => (
                                <option key={sc._id} value={sc._id}>{sc.name}</option>
                              ))}
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>SKU / Barcode</label>
                        <input
                          type="text"
                          placeholder="SKU-XXXXX"
                          value={newProductSku}
                          onChange={e => setNewProductSku(e.target.value)}
                          style={{ width: '100%', height: '38px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'monospace' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Purchase Qty *</label>
                        <input
                          type="number"
                          min="1"
                          value={newQty}
                          onChange={e => {
                            const val = e.target.value;
                            setNewQty(val === '' ? '' : Math.max(0, parseInt(val, 10) || 0));
                          }}
                          onBlur={() => {
                            if (!newQty || Number(newQty) < 1) setNewQty(1);
                          }}
                          style={{ width: '100%', height: '38px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Unit / Type</label>
                        <select
                          value={newProductUnit}
                          onChange={e => setNewProductUnit(e.target.value)}
                          style={{ width: '100%', height: '38px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', background: 'white' }}
                        >
                          <option value="pcs">Pieces (pcs)</option>
                          <option value="kg">Kilogram (kg)</option>
                          <option value="g">Gram (g)</option>
                          <option value="L">Liter (L)</option>
                          <option value="ml">Milliliter (ml)</option>
                          <option value="box">Box (box)</option>
                          <option value="pack">Packet (pkt)</option>
                          <option value="meter">Meter (m)</option>
                          <option value="dozen">Dozen (dz)</option>
                          <option value="unit">Units (unit)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Unit Buy Cost (₹) *</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="e.g. 450"
                          value={newCostPrice}
                          onChange={e => setNewCostPrice(e.target.value)}
                          style={{ width: '100%', height: '38px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Selling Price (₹) *</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="e.g. 799"
                          value={newSellingPrice}
                          onChange={e => setNewSellingPrice(e.target.value)}
                          style={{ width: '100%', height: '38px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Subtotal (₹)</label>
                        <div style={{ height: '38px', display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '700', color: '#059669' }}>
                          ₹{((Number(newQty) || 0) * Number(newCostPrice || 0)).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={handleAddLineItem}
                          style={{
                            width: '100%',
                            height: '38px',
                            background: '#059669',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <PlusCircle size={15} /> Add New Item
                        </button>
                      </div>

                    </div>
                  </div>
                )}

              </div>

              {/* Step 3: Current Order Items List */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B', margin: 0 }}>
                    3. Items in this Purchase ({orderItems.length})
                  </h4>
                  {orderItems.length > 0 && (
                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                      Total Units: <strong>{totalOrderUnits}</strong>
                    </span>
                  )}
                </div>

                {orderItems.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1', color: '#94A3B8', fontSize: '13px' }}>
                    No products added yet. Select an existing product or configure a new product above and click <strong>"Add Item"</strong>.
                  </div>
                ) : (
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                          <th style={{ padding: '10px 14px', fontWeight: '600' }}>Product Name</th>
                          <th style={{ padding: '10px 14px', fontWeight: '600' }}>Type</th>
                          <th style={{ padding: '10px 14px', fontWeight: '600', textAlign: 'center' }}>Qty</th>
                          <th style={{ padding: '10px 14px', fontWeight: '600' }}>Unit Buy Cost</th>
                          <th style={{ padding: '10px 14px', fontWeight: '600' }}>Selling Price</th>
                          <th style={{ padding: '10px 14px', fontWeight: '600' }}>Subtotal</th>
                          <th style={{ padding: '10px 14px', textAlign: 'center' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.map((item, idx) => (
                          <tr key={item.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '10px 14px', fontWeight: '600', color: '#0F172A' }}>
                              {item.name}
                              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '400' }}>
                                {item.categoryName || 'General'}{item.subCategoryName ? ` • ${item.subCategoryName}` : ''}
                              </div>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              {item.isNewProduct ? (
                                <span style={{ padding: '2px 6px', borderRadius: '6px', fontSize: '11px', background: '#DCFCE7', color: '#166534', fontWeight: '600' }}>
                                  ✨ New Item
                                </span>
                              ) : (
                                <span style={{ padding: '2px 6px', borderRadius: '6px', fontSize: '11px', background: '#EFF6FF', color: '#1D4ED8', fontWeight: '600' }}>
                                  🛒 Existing (+Stock)
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '700', color: '#2563EB' }}>
                              +{item.quantity} {item.unit || 'units'}
                            </td>
                            <td style={{ padding: '10px 14px', color: '#475569' }}>
                              ₹{Number(item.unitCost).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '600' }}>
                              ₹{Number(item.sellingPrice).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: '700', color: '#0F172A' }}>
                              ₹{Number(item.totalCost).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveLineItem(idx)}
                                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                                title="Remove item"
                              >
                                <X size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Grand Total Footer Bar */}
                    <div style={{ padding: '14px 18px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '13px', color: '#64748B' }}>
                        Total <strong>{orderItems.length}</strong> items • <strong>{totalOrderUnits}</strong> units
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Grand Total:</span>
                        <span style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
                          ₹{orderGrandTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Notes Input */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Notes / Remarks (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="Additional order terms, shipping details, or remarks..."
                  value={poForm.notes}
                  onChange={e => setPoForm({ ...poForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              {/* Modal Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={savingPurchase}
                  style={{ padding: '10px 20px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontWeight: '600', fontSize: '13.5px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPurchase || orderItems.length === 0}
                  style={{
                    padding: '10px 24px',
                    background: '#2563EB',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '13.5px',
                    cursor: savingPurchase || orderItems.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: savingPurchase || orderItems.length === 0 ? 0.6 : 1
                  }}
                >
                  {savingPurchase ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving &amp; Updating Stock...
                    </>
                  ) : (
                    <>
                      <Check size={16} /> Save Purchase &amp; Update Stock
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>, document.body
      )}

      {/* ======================================================== */}
      {/* VIEW PURCHASE DETAILS INVOICE MODAL */}
      {/* ======================================================== */}
      {viewItem && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            
            <div style={{ padding: '20px 28px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                    Purchase Order Details ({viewItem.poNumber})
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                    Recorded on {formatDate(viewItem.date || viewItem.createdAt)}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setViewItem(null)} 
                style={{ background: 'white', border: '1px solid #E2E8F0', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: '24px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Order Meta Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Supplier</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>{viewItem.supplierName || 'General Supplier'}</div>
                  {viewItem.supplierPhone && <div style={{ fontSize: '12px', color: '#64748B' }}>{viewItem.supplierPhone}</div>}
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Purchase Status</div>
                  <div style={{ marginTop: '4px' }}>
                    {(() => {
                      const b = getStatusBadge(viewItem.status);
                      return <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11.5px', fontWeight: '600', background: b.bg, color: b.color }}>{b.label}</span>;
                    })()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Payment</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A', marginTop: '2px' }}>
                    {viewItem.paymentStatus || 'Paid'} via {viewItem.paymentMethod || 'Cash'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Total Amount</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#059669', marginTop: '2px' }}>
                    ₹{Number(viewItem.amount || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', margin: '0 0 10px 0' }}>
                  Procured Items Breakdown
                </h4>
                {Array.isArray(viewItem.items) && viewItem.items.length > 0 ? (
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                      <thead>
                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                          <th style={{ padding: '8px 12px', fontWeight: '600' }}>Item Name</th>
                          <th style={{ padding: '8px 12px', fontWeight: '600', textAlign: 'center' }}>Qty</th>
                          <th style={{ padding: '8px 12px', fontWeight: '600' }}>Unit Buy Cost</th>
                          <th style={{ padding: '8px 12px', fontWeight: '600' }}>Selling Price</th>
                          <th style={{ padding: '8px 12px', fontWeight: '600', textAlign: 'right' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewItem.items.map((it, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '8px 12px', fontWeight: '600', color: '#0F172A' }}>
                              {it.name}
                              {it.isNewProduct && (
                                <span style={{ marginLeft: '6px', fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: '#DCFCE7', color: '#166534', fontWeight: '600' }}>
                                  New Item
                                </span>
                              )}
                              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '400' }}>
                                {it.categoryName || ''}{it.subCategoryName ? ` • ${it.subCategoryName}` : ''}{it.sku ? ` • ${it.sku}` : ''}
                              </div>
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '700', color: '#2563EB' }}>
                              +{it.quantity} {it.unit || 'units'}
                            </td>
                            <td style={{ padding: '8px 12px', color: '#475569' }}>
                              ₹{Number(it.unitCost).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '8px 12px', color: '#059669' }}>
                              ₹{Number(it.sellingPrice).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700', color: '#0F172A' }}>
                              ₹{Number(it.totalCost).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748B', fontStyle: 'italic' }}>
                    Single procurement of ₹{viewItem.amount}.
                  </p>
                )}
              </div>

              {viewItem.notes && (
                <div style={{ padding: '12px 16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12.5px', color: '#475569' }}>
                  <strong>Notes:</strong> {viewItem.notes}
                </div>
              )}

            </div>

            <div style={{ padding: '14px 28px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => setViewItem(null)} 
                style={{ padding: '8px 18px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>

          </div>
        </div>, document.body
      )}

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {deleteId && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px auto', color: '#EF4444' }}>
              <AlertTriangle size={30} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', margin: '0 0 8px 0' }}>Delete Purchase Order?</h3>
            <p style={{ color: '#64748B', fontSize: '13.5px', margin: '0 0 22px 0', lineHeight: '1.5' }}>
              Are you sure you want to delete this purchase order? The added product and inventory quantities will be safely deducted from stock.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                onClick={() => setDeleteId(null)} 
                style={{ flex: 1, padding: '11px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '13.5px' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmDelete} 
                style={{ flex: 1, padding: '11px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13.5px' }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>, document.body
      )}

    </div>
  );
};

// Helper icon
const PackagePlusIcon = ({ size = 16, color = '#2563EB' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

export default Purchases;
