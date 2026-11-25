import { exportToCSV } from '@/utils/exportToCSV';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { ArrowUp, ArrowDown, Plus, Search, Package, Tag, Trash2, Pencil, X, AlertTriangle, ArrowUpDown, Download, Wrench } from 'lucide-react';
import TablePagination from '@/components/TablePagination';
import { getSubCategoriesForCategory, normalizeCategoryKey } from '../../constants/businessCategories';

const getImageUrl = (image) => {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  return `${import.meta.env.VITE_API_URL}${image.startsWith('/') ? '' : '/'}${image}`;
};

const Products = ({ offeringMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
  const [filterDays, setFilterDays] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const storedUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  // Determine whether this page view is for 'product' or 'service'
  const offeringType = useMemo(() => {
    if (offeringMode === 'product' || offeringMode === 'service') return offeringMode;
    if (location.pathname.includes('/tenant/services')) return 'service';
    if (location.pathname.includes('/tenant/products')) {
      const param = searchParams.get('type');
      if (param === 'service') return 'service';
      return 'product';
    }
    const param = searchParams.get('type');
    if (param === 'service' || param === 'product') return param;
    return storedUser?.businessOfferingType === 'service' ? 'service' : 'product';
  }, [offeringMode, location.pathname, searchParams, storedUser]);

  const operationsType = storedUser?.businessOperationsType || 'both';
  const isBothOffering = String(storedUser?.businessOfferingType || storedUser?.offeringType || '').toLowerCase() === 'both';
  const defaultItemType = isBothOffering ? 'Both' : (offeringType === 'service' ? 'Service' : 'Product');
  const defaultTransactionType = operationsType === 'purchases' ? 'Purchase' : 'Sales';

  const matchesOffering = (itemTypeVal, targetOffering, isCategoryOrSub = false) => {
    const type = String(itemTypeVal || '').toLowerCase();
    if (type === 'both' || (isCategoryOrSub && isBothOffering)) {
      return true;
    }
    if (targetOffering === 'service') {
      return type === 'service';
    }
    return type !== 'service';
  };

  const [catForm, setCatForm] = useState({ name: '', description: '', image: null, existingImage: null, itemType: defaultItemType, transactionType: defaultTransactionType });
  const [subCatForm, setSubCatForm] = useState({ name: '', categoryId: '', itemType: defaultItemType, transactionType: defaultTransactionType, description: '' });
  const [prodForm, setProdForm] = useState({ name: '', sku: '', categoryId: '', subCategoryId: '', price: '', stock: '', image: null, existingImage: null, itemType: defaultItemType, description: '' });

  // Reset pagination & search when switching between Products and Services
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery('');
  }, [offeringType]);

  // Categories belonging to current offering type
  const availableCategories = useMemo(() => {
    return categories.filter(c => matchesOffering(c.itemType, offeringType, true));
  }, [categories, offeringType, isBothOffering]);

  // Subcategories belonging to chosen category
  const availableSubCategories = useMemo(() => {
    if (!prodForm.categoryId) return [];
    const selectedCat = categories.find(c => c._id === prodForm.categoryId);
    const catName = selectedCat?.name || '';
    const allowedSubNames = getSubCategoriesForCategory(catName);

    return subcategories.filter(sc => {
      const scCatId = sc.categoryId?._id || sc.categoryId;
      const matchesId = scCatId && String(scCatId) === String(prodForm.categoryId);
      if (!matchesId) return false;

      // If category has defined mapped subcategories, strictly enforce that sc.name belongs to this category!
      if (allowedSubNames.length > 0) {
        const normScName = normalizeCategoryKey(sc.name);
        const belongs = allowedSubNames.some(a => normalizeCategoryKey(a) === normScName);
        if (!belongs) return false;
      }
      return true;
    });
  }, [subcategories, prodForm.categoryId, categories]);

  // Dynamic counts for top cards
  const filteredCategoriesCount = useMemo(() => {
    return categories.filter(c => matchesOffering(c.itemType, offeringType, true)).length;
  }, [categories, offeringType, isBothOffering]);

  const filteredSubcategoriesCount = useMemo(() => {
    return subcategories.filter(sc => matchesOffering(sc.itemType || sc.categoryId?.itemType, offeringType, true)).length;
  }, [subcategories, offeringType, isBothOffering]);

  const filteredProductsCount = useMemo(() => {
    return products.filter(p => matchesOffering(p.itemType || p.categoryId?.itemType, offeringType, false)).length;
  }, [products, offeringType, isBothOffering]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    const fixedItemType = offeringType === 'service' ? 'Service' : 'Product';
    setCatForm({ name: '', description: '', image: null, existingImage: null, itemType: fixedItemType, transactionType: defaultTransactionType });
    setSubCatForm({ name: '', categoryId: '', itemType: fixedItemType, transactionType: defaultTransactionType, description: '' });
    setProdForm({ name: '', sku: '', categoryId: '', subCategoryId: '', price: '', stock: '', image: null, existingImage: null, itemType: fixedItemType, description: '' });
    setShowModal(true);
  };

  const handleEditCategory = (item) => {
    setEditingItem(item);
    setCatForm({
      name: item.name || '',
      description: item.description || '',
      image: null,
      existingImage: item.image || null,
      itemType: item.itemType || (offeringType === 'service' ? 'Service' : 'Product'),
      transactionType: item.transactionType || 'Sales'
    });
    setShowModal(true);
  };

  const handleEditSubCategory = (item) => {
    setEditingItem(item);
    setSubCatForm({
      name: item.name || '',
      categoryId: item.categoryId?._id || item.categoryId || '',
      itemType: item.itemType || item.categoryId?.itemType || (offeringType === 'service' ? 'Service' : 'Product'),
      transactionType: item.transactionType || item.categoryId?.transactionType || 'Sales',
      description: item.description || ''
    });
    setShowModal(true);
  };

  const handleEditProduct = (item) => {
    setEditingItem(item);
    const catId = item.categoryId?._id || item.categoryId || '';
    const matchedCat = categories.find(c => c._id === catId);
    const derivedType = item.itemType || matchedCat?.itemType || (offeringType === 'service' ? 'Service' : 'Product');
    setProdForm({
      name: item.name || '',
      sku: item.sku || '',
      categoryId: catId,
      subCategoryId: item.subCategoryId?._id || item.subCategoryId || '',
      price: item.price !== undefined ? item.price : '',
      stock: item.stock !== undefined ? item.stock : '',
      image: null,
      existingImage: item.image || null,
      itemType: derivedType,
      description: item.description || ''
    });
    setShowModal(true);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [catRes, subRes, prodRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/categories`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/subcategories`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/products`, { headers })
      ]);

      if (catRes.ok) setCategories(await catRes.json());
      if (subRes.ok) setSubcategories(await subRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    let endpoint = '';
    let bodyData;
    let headers = { 'Authorization': `Bearer ${token}` };
    const method = editingItem ? 'PUT' : 'POST';
    const targetItemType = offeringType === 'service' ? 'Service' : 'Product';
    
    if (activeTab === 'categories') {
      endpoint = editingItem ? `/api/categories/${editingItem._id}` : '/api/categories';
      bodyData = new FormData();
      Object.keys(catForm).forEach(key => {
        if (key === 'existingImage') return;
        if (catForm[key] !== null && catForm[key] !== '') {
          bodyData.append(key, catForm[key]);
        }
      });
      bodyData.set('itemType', catForm.itemType || editingItem?.itemType || targetItemType);
    } else if (activeTab === 'subcategories') {
      endpoint = editingItem ? `/api/subcategories/${editingItem._id}` : '/api/subcategories';
      bodyData = JSON.stringify({
        ...subCatForm,
        itemType: subCatForm.itemType || editingItem?.itemType || targetItemType
      });
      headers['Content-Type'] = 'application/json';
    } else {
      endpoint = editingItem ? `/api/products/${editingItem._id}` : '/api/products';
      bodyData = new FormData();
      Object.keys(prodForm).forEach(key => {
        if (key === 'existingImage') return;
        if (prodForm[key] !== null && prodForm[key] !== '') {
          bodyData.append(key, prodForm[key]);
        }
      });
      bodyData.set('itemType', prodForm.itemType || editingItem?.itemType || targetItemType);
      if (targetItemType === 'Service') {
        bodyData.set('stock', '0');
      } else if (!prodForm.stock || String(prodForm.stock).trim() === '') {
        bodyData.set('stock', '0');
      }
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method,
        headers: headers,
        body: bodyData
      });
      if (res.ok) {
        setShowModal(false);
        setEditingItem(null);
        setCatForm({ name: '', description: '', image: null, existingImage: null, itemType: targetItemType, transactionType: defaultTransactionType });
        setSubCatForm({ name: '', categoryId: '', itemType: targetItemType, transactionType: defaultTransactionType, description: '' });
        setProdForm({ name: '', sku: '', categoryId: '', subCategoryId: '', price: '', stock: '', image: null, existingImage: null, itemType: targetItemType, description: '' });
        fetchData();
      } else {
        alert('Failed to save');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const token = localStorage.getItem('token');
    let endpoint = activeTab === 'categories' ? '/api/categories' : activeTab === 'subcategories' ? '/api/subcategories' : '/api/products';
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteId(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getFilteredData = () => {
    let data = [];
    if (activeTab === 'categories') data = categories;
    else if (activeTab === 'subcategories') data = subcategories;
    else data = products;

    return data
      .filter(item => {
        if (filterDays === 'all') return true;
        const itemDate = new Date(item.createdAt || item.date || new Date());
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
      })
      .filter(item => {
        const itemType = item.itemType || item.categoryId?.itemType;
        const isCatOrSub = activeTab === 'categories' || activeTab === 'subcategories';
        if (!matchesOffering(itemType, offeringType, isCatOrSub)) return false;

        const txType = (item.transactionType || item.categoryId?.transactionType || '').toLowerCase();
        if (operationsType === 'sales') {
          if (txType && txType !== 'sales' && txType !== 'both') return false;
        } else if (operationsType === 'purchases') {
          if (txType && txType !== 'purchase' && txType !== 'both') return false;
        }
        return true;
      })
      .filter(item => (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
      if (!sortConfig.key) return 0;
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // Handle missing values
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      // Check if it's a date or number to sort accordingly
      if (sortConfig.key === 'date' || sortConfig.key === 'createdAt' || sortConfig.key === 'expiryDate') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
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

  const filteredData = getFilteredData();

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, filterDays, customStartDate, customEndDate, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {offeringType === 'service' ? (
              <>
                <Wrench size={28} color="#7C3AED" /> Services
              </>
            ) : (
              <>
                <Package size={28} color="var(--primary-blue)" /> Products
              </>
            )}
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
            {offeringType === 'service' ? 'Manage your service catalogue, offerings, and categorizations.' : 'Manage your inventory catalogue, products, and categorizations.'}
          </p>
        </div>
        <button onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: offeringType === 'service' ? '#7C3AED' : 'var(--primary-blue)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <Plus size={18} /> Add New {activeTab === 'categories' ? 'Category' : activeTab === 'subcategories' ? 'Sub Category' : offeringType === 'service' ? 'Service' : 'Product'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tag size={24} /></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Categories</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A' }}>{filteredCategoriesCount}</h3>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F8FAFC', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tag size={24} /></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Sub Categories</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A' }}>{filteredSubcategoriesCount}</h3>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: offeringType === 'service' ? '#FAF5FF' : '#F0FDF4', color: offeringType === 'service' ? '#7C3AED' : '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {offeringType === 'service' ? <Wrench size={24} /> : <Package size={24} />}
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>{offeringType === 'service' ? 'Services' : 'Products'}</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A' }}>{filteredProductsCount}</h3>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', background: '#F8FAFC', padding: '4px', borderRadius: '10px', alignSelf: 'flex-start' }}>
            <button onClick={() => setActiveTab('categories')} style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', background: activeTab === 'categories' ? 'white' : 'transparent', color: activeTab === 'categories' ? '#0F172A' : '#64748B', border: 'none', boxShadow: activeTab === 'categories' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Categories</button>
            <button onClick={() => setActiveTab('subcategories')} style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', background: activeTab === 'subcategories' ? 'white' : 'transparent', color: activeTab === 'subcategories' ? '#0F172A' : '#64748B', border: 'none', boxShadow: activeTab === 'subcategories' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Sub Categories</button>
            <button onClick={() => setActiveTab('products')} style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', background: activeTab === 'products' ? 'white' : 'transparent', color: activeTab === 'products' ? '#0F172A' : '#64748B', border: 'none', boxShadow: activeTab === 'products' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
              {offeringType === 'service' ? 'Services' : 'Products'}
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ flex: '0 1 300px', minWidth: '250px', position: 'relative' }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <select value={filterDays} onChange={(e) => setFilterDays(e.target.value)} style={{ padding: '10px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#475569', fontWeight: '500', fontSize: '14px', outline: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <option value="all">Filter: All Time</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
          <option value="custom">Custom Range</option>
        </select>
        {filterDays === 'custom' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', outline: 'none', fontSize: '13px', color: '#475569' }} />
            <span style={{ fontSize: '13px', color: '#64748B' }}>to</span>
            <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', outline: 'none', fontSize: '13px', color: '#475569' }} />
          </div>
        )}
              
                <button onClick={() => exportToCSV(filteredData, offeringType === 'service' ? 'Services' : 'Products')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#475569', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}><Download size={16} /> Export</button>
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '60px' }}>S.No</th>
                <th onClick={() => requestSort('name')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>Name {renderSortIcon('name')}</div>
              </th>
                {activeTab === 'categories' && (
                  <>
                    <th onClick={() => requestSort('itemType')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>Item Type {renderSortIcon('itemType')}</div>
              </th>
                    <th onClick={() => requestSort('transactionType')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>Transaction Type {renderSortIcon('transactionType')}</div>
              </th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Description</th>
                  </>
                )}
                {activeTab === 'subcategories' && (
                  <>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Parent Category</th>
                    <th onClick={() => requestSort('itemType')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>Item Type {renderSortIcon('itemType')}</div>
                    </th>
                    <th onClick={() => requestSort('transactionType')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>Transaction Type {renderSortIcon('transactionType')}</div>
                    </th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Description</th>
                  </>
                )}
                {activeTab === 'products' && (
                  <>
                    <th onClick={() => requestSort('category')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>Category {renderSortIcon('category')}</div>
              </th>
                    <th onClick={() => requestSort('type')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>Type {renderSortIcon('type')}</div>
              </th>
                    <th onClick={() => requestSort('price')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>Price {renderSortIcon('price')}</div>
              </th>
                    <th onClick={() => requestSort('stock')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>Stock {renderSortIcon('stock')}</div>
              </th>
                  </>
                )}
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '36px 24px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#334155' }}>
                        {activeTab === 'categories' ? `No ${offeringType === 'service' ? 'service' : 'product'} categories available` : activeTab === 'subcategories' ? `No ${offeringType === 'service' ? 'service' : 'product'} subcategories available` : `No ${offeringType === 'service' ? 'services' : 'products'} found`}
                      </p>
                      {(storedUser?.category || storedUser?.categories?.length > 0) && activeTab !== 'products' && (
                        <button
                          type="button"
                          onClick={async () => {
                            setLoading(true);
                            try {
                              const token = localStorage.getItem('token');
                              await fetch(`${import.meta.env.VITE_API_URL}/api/categories/sync-profile`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}` }
                              });
                              await fetchData();
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setLoading(false);
                            }
                          }}
                          style={{
                            marginTop: '10px',
                            background: '#EFF6FF',
                            color: '#2563EB',
                            border: '1px solid #BFDBFE',
                            padding: '7px 16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          ⚡ Auto-Import from Onboarding Business Profile
                        </button>
                      )}
                      {/* <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                        Click "+ Add New {activeTab === 'categories' ? 'Category' : activeTab === 'subcategories' ? 'Sub Category' : 'Product/Service'}" above to create one.
                      </span> */}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '16px 24px', fontSize: '15px', color: '#475569', fontWeight: '500' }}>{startIndex + index + 1}</td>
                    <td style={{ padding: '16px 24px', fontWeight: '600', color: '#0F172A' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.image ? (
                          <img
                            src={getImageUrl(item.image)}
                            alt=""
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                            style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                        ) : null}
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: '#F1F5F9',
                            display: item.image ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {activeTab === 'subcategories' ? <Tag size={16} color="#94A3B8" /> : <Package size={16} color="#94A3B8" />}
                        </div>
                        <span>{item.name}</span>
                      </div>
                    </td>
                    
                    {activeTab === 'categories' && (
                      <>
                        <td style={{ padding: '16px 24px', color: '#475569' }}>{item.itemType}</td>
                        <td style={{ padding: '16px 24px', color: '#475569' }}>{item.transactionType}</td>
                        <td style={{ padding: '16px 24px', color: '#475569' }}>{item.description || '-'}</td>
                      </>
                    )}

                    {activeTab === 'subcategories' && (
                      <>
                        <td style={{ padding: '16px 24px', color: '#475569' }}>{item.categoryId?.name || '-'}</td>
                        <td style={{ padding: '16px 24px', color: '#475569' }}>{item.itemType || item.categoryId?.itemType || '-'}</td>
                        <td style={{ padding: '16px 24px', color: '#475569' }}>{item.transactionType || item.categoryId?.transactionType || '-'}</td>
                        <td style={{ padding: '16px 24px', color: '#475569' }}>{item.description || '-'}</td>
                      </>
                    )}

                    {activeTab === 'products' && (
                      <>
                        <td style={{ padding: '16px 24px', color: '#475569' }}>
                          {item.categoryId?.name || '-'}
                          {item.subCategoryId && <span style={{ fontSize: '12px', color: '#94A3B8', display: 'block' }}>{item.subCategoryId.name}</span>}
                        </td>
                        <td style={{ padding: '16px 24px', color: '#475569' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', background: item.itemType === 'Product' ? '#EFF6FF' : '#F0FDF4', color: item.itemType === 'Product' ? '#2563EB' : '#16A34A' }}>
                            {item.itemType}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', color: '#475569', fontWeight: '500' }}>₹{item.price || 0}</td>
                        <td style={{ padding: '16px 24px' }}>
                          {item.itemType === 'Service' ? (
                            <span style={{ color: '#94A3B8' }}>-</span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '700',
                              background: Number(item.stock || 0) <= 0 ? '#FEF2F2' : Number(item.stock || 0) <= 5 ? '#FFFBEB' : '#ECFDF5',
                              color: Number(item.stock || 0) <= 0 ? '#DC2626' : Number(item.stock || 0) <= 5 ? '#D97706' : '#16A34A',
                              border: `1px solid ${Number(item.stock || 0) <= 0 ? '#FECACA' : Number(item.stock || 0) <= 5 ? '#FDE68A' : '#A7F3D0'}`
                            }}>
                              {Number(item.stock || 0) <= 0 ? '0 (Out of stock)' : `${item.stock} units`}
                            </span>
                          )}
                        </td>
                      </>
                    )}

                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        {activeTab === 'products' && item.itemType !== 'Service' && (
                          <button
                            type="button"
                            onClick={() => navigate(`/tenant/inventory?restock=${item._id}`)}
                            title="Add Stock"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              background: '#F0FDF4',
                              color: '#16A34A',
                              border: '1px solid #BBF7D0',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Plus size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (activeTab === 'categories') handleEditCategory(item);
                            else if (activeTab === 'subcategories') handleEditSubCategory(item);
                            else handleEditProduct(item);
                          }}
                          title="Edit"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            background: '#EFF6FF',
                            color: '#2563EB',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(item._id)}
                          title="Delete"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            background: '#FEE2E2',
                            color: '#EF4444',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
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
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          itemName={activeTab === 'categories' ? 'categories' : activeTab === 'subcategories' ? 'subcategories' : (offeringType === 'service' ? 'services' : 'products')}
        />
      </div>

      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '540px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                {editingItem ? 'Edit' : 'Add'} {activeTab === 'categories' ? 'Category' : activeTab === 'subcategories' ? 'Sub Category' : (offeringType === 'service' ? 'Service' : 'Product')}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingItem(null); }} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {activeTab === 'categories' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Category Name</label>
                    <input placeholder="Enter category name" type="text" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Item Type</label>
                      <select
                        value={catForm.itemType || (offeringType === 'service' ? 'Service' : 'Product')}
                        onChange={e => setCatForm({ ...catForm, itemType: e.target.value })}
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', background: 'white' }}
                      >
                        <option value="Both">Both (Product & Service)</option>
                        <option value="Product">Product</option>
                        <option value="Service">Service</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Transaction Type</label>
                      <select value={catForm.transactionType} onChange={e => setCatForm({...catForm, transactionType: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', background: 'white' }}>
                        <option value="Sales">Sales</option>
                        <option value="Purchase">Purchase</option>
                        <option value="Both">Both (Sales & Purchase)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Description</label>
                    <textarea
                      placeholder="Enter category description..."
                      rows={3}
                      value={catForm.description}
                      onChange={e => setCatForm({...catForm, description: e.target.value})}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Category Image</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {(catForm.image || catForm.existingImage) && (
                        <img
                          src={catForm.image ? URL.createObjectURL(catForm.image) : getImageUrl(catForm.existingImage)}
                          alt="Preview"
                          style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #CBD5E1', flexShrink: 0 }}
                        />
                      )}
                      <input type="file" accept="image/*" onChange={e => setCatForm({...catForm, image: e.target.files[0]})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'subcategories' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Sub Category Name</label>
                    <input placeholder="Enter the subcategory name" type="text" value={subCatForm.name} onChange={e => setSubCatForm({...subCatForm, name: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Parent Category</label>
                    <select
                      value={subCatForm.categoryId}
                      onChange={e => {
                        const catId = e.target.value;
                        const matched = categories.find(c => c._id === catId);
                        setSubCatForm({
                          ...subCatForm,
                          categoryId: catId,
                          itemType: matched?.itemType || subCatForm.itemType || (offeringType === 'service' ? 'Service' : 'Product'),
                          transactionType: matched?.transactionType || subCatForm.transactionType || 'Sales'
                        });
                      }}
                      required
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                    >
                      {availableCategories.length === 0 ? (
                        <option value="" disabled>No {offeringType === 'service' ? 'service' : 'product'} category available</option>
                      ) : (
                        <option value="">Select Category...</option>
                      )}
                      {availableCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Item Type</label>
                      <select
                        value={subCatForm.itemType || (offeringType === 'service' ? 'Service' : 'Product')}
                        onChange={e => setSubCatForm({ ...subCatForm, itemType: e.target.value })}
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', background: 'white' }}
                      >
                        <option value="Both">Both (Product & Service)</option>
                        <option value="Product">Product</option>
                        <option value="Service">Service</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Transaction Type</label>
                      <select
                        value={subCatForm.transactionType || 'Sales'}
                        onChange={e => setSubCatForm({ ...subCatForm, transactionType: e.target.value })}
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', background: 'white' }}
                      >
                        <option value="Sales">Sales</option>
                        <option value="Purchase">Purchase</option>
                        <option value="Both">Both (Sales & Purchase)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Description</label>
                    <textarea
                      placeholder="Enter sub category description..."
                      rows={3}
                      value={subCatForm.description}
                      onChange={e => setSubCatForm({...subCatForm, description: e.target.value})}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                  </div>
                </>
              )}

              {activeTab === 'products' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: offeringType === 'product' ? '1fr 1fr' : '1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>{offeringType === 'service' ? 'Service Name' : 'Product Name'}</label>
                      <input placeholder={offeringType === 'service' ? 'Enter the service name' : 'Enter the product name'} type="text" value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                    </div>
                    {offeringType === 'product' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Stock Keeping Unit (SKU)</label>
                        <input placeholder="e.g. SKU-101" type="text" value={prodForm.sku} onChange={e => setProdForm({...prodForm, sku: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Category</label>
                      <select
                        value={prodForm.categoryId}
                        onChange={e => {
                          const catId = e.target.value;
                          const matched = categories.find(c => c._id === catId);
                          const derivedType = matched?.itemType || (offeringType === 'service' ? 'Service' : 'Product');
                          setProdForm({
                            ...prodForm,
                            categoryId: catId,
                            subCategoryId: '',
                            itemType: derivedType,
                            ...(derivedType === 'Service' ? { stock: '', sku: '' } : {})
                          });
                        }}
                        required
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                      >
                        {availableCategories.length === 0 ? (
                          <option value="" disabled>No {offeringType === 'service' ? 'service' : 'product'} category available</option>
                        ) : (
                          <option value="">Select Category...</option>
                        )}
                        {availableCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Sub Category</label>
                      <select
                        value={prodForm.subCategoryId}
                        onChange={e => setProdForm({ ...prodForm, subCategoryId: e.target.value })}
                        disabled={!prodForm.categoryId || availableSubCategories.length === 0}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '10px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: (!prodForm.categoryId || availableSubCategories.length === 0) ? '#F8FAFC' : 'white',
                          color: (!prodForm.categoryId || availableSubCategories.length === 0) ? '#64748B' : '#0F172A',
                          cursor: (!prodForm.categoryId || availableSubCategories.length === 0) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {!prodForm.categoryId ? (
                          <option value="" disabled>Select category first</option>
                        ) : availableSubCategories.length === 0 ? (
                          <option value="" disabled>No subcategory available</option>
                        ) : (
                          <>
                            <option value="">Select sub category</option>
                            {availableSubCategories.map(sc => (
                              <option key={sc._id} value={sc._id}>{sc.name}</option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: offeringType === 'product' ? '1fr 1fr' : '1fr', gap: '16px' }}>
                    {offeringType === 'product' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>Initial Stock Quantity</label>
                          <span style={{ fontSize: '12px', color: '#64748B' }}>(Optional)</span>
                        </div>
                        <input 
                          placeholder="e.g. 10" 
                          type="number" 
                          min="0"
                          value={prodForm.stock} 
                          onChange={e => setProdForm({...prodForm, stock: e.target.value})} 
                          style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} 
                        />
                      </div>
                    )}
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Price (₹)</label>
                      <input placeholder="Enter the price amount" type="number" value={prodForm.price} onChange={e => setProdForm({...prodForm, price: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Description</label>
                    <textarea
                      placeholder="Enter product description..."
                      rows={3}
                      value={prodForm.description}
                      onChange={e => setProdForm({...prodForm, description: e.target.value})}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>{offeringType === 'service' ? 'Service Image' : 'Product Image'}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {(prodForm.image || prodForm.existingImage) && (
                        <img
                          src={prodForm.image ? URL.createObjectURL(prodForm.image) : getImageUrl(prodForm.existingImage)}
                          alt="Preview"
                          style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #CBD5E1', flexShrink: 0 }}
                        />
                      )}
                      <input type="file" accept="image/*" onChange={e => setProdForm({...prodForm, image: e.target.files[0]})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingItem(null); }} style={{ flex: 1, padding: '14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '14px', background: offeringType === 'service' ? '#7C3AED' : '#2563EB', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>{editingItem ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

      {deleteId && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}><AlertTriangle size={32} color="#EF4444" /></div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: '0 0 12px 0' }}>Delete Record</h2>
            <p style={{ color: '#64748B', margin: '0 0 24px 0' }}>Are you sure you want to delete this record? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button type="button" onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={confirmDelete} style={{ flex: 1, padding: '14px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  );
};

export default Products;
