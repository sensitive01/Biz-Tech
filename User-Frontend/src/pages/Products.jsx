import { exportToCSV } from '../utils/exportToCSV';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp, ArrowDown, Plus, Search, Package, Tag, Trash2, Pencil, X, AlertTriangle, ArrowUpDown, Download } from 'lucide-react';

const getImageUrl = (image) => {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  return `${import.meta.env.VITE_API_URL}${image.startsWith('/') ? '' : '/'}${image}`;
};

const Products = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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

  const [catForm, setCatForm] = useState({ name: '', description: '', image: null, existingImage: null, itemType: 'Product', transactionType: 'Sales' });
  const [subCatForm, setSubCatForm] = useState({ name: '', categoryId: '', itemType: 'Product', transactionType: 'Sales', description: '' });
  const [prodForm, setProdForm] = useState({ name: '', sku: '', categoryId: '', subCategoryId: '', price: '', stock: '', image: null, existingImage: null, itemType: 'Product', description: '' });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setCatForm({ name: '', description: '', image: null, existingImage: null, itemType: 'Product', transactionType: 'Sales' });
    setSubCatForm({ name: '', categoryId: '', itemType: 'Product', transactionType: 'Sales', description: '' });
    setProdForm({ name: '', sku: '', categoryId: '', subCategoryId: '', price: '', stock: '', image: null, existingImage: null, itemType: 'Product', description: '' });
    setShowModal(true);
  };

  const handleEditCategory = (item) => {
    setEditingItem(item);
    setCatForm({
      name: item.name || '',
      description: item.description || '',
      image: null,
      existingImage: item.image || null,
      itemType: item.itemType || 'Product',
      transactionType: item.transactionType || 'Sales'
    });
    setShowModal(true);
  };

  const handleEditSubCategory = (item) => {
    setEditingItem(item);
    setSubCatForm({
      name: item.name || '',
      categoryId: item.categoryId?._id || item.categoryId || '',
      itemType: item.itemType || item.categoryId?.itemType || 'Product',
      transactionType: item.transactionType || item.categoryId?.transactionType || 'Sales',
      description: item.description || ''
    });
    setShowModal(true);
  };

  const handleEditProduct = (item) => {
    setEditingItem(item);
    const catId = item.categoryId?._id || item.categoryId || '';
    const matchedCat = categories.find(c => c._id === catId);
    const derivedType = item.itemType || matchedCat?.itemType || 'Product';
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
    
    if (activeTab === 'categories') {
      endpoint = editingItem ? `/api/categories/${editingItem._id}` : '/api/categories';
      bodyData = new FormData();
      Object.keys(catForm).forEach(key => {
        if (key === 'existingImage') return;
        if (catForm[key] !== null && catForm[key] !== '') {
          bodyData.append(key, catForm[key]);
        }
      });
    } else if (activeTab === 'subcategories') {
      endpoint = editingItem ? `/api/subcategories/${editingItem._id}` : '/api/subcategories';
      bodyData = JSON.stringify(subCatForm);
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
        setCatForm({ name: '', description: '', image: null, existingImage: null, itemType: 'Product', transactionType: 'Sales' });
        setSubCatForm({ name: '', categoryId: '', itemType: 'Product', transactionType: 'Sales', description: '' });
        setProdForm({ name: '', sku: '', categoryId: '', subCategoryId: '', price: '', stock: '', image: null, existingImage: null, itemType: 'Product', description: '' });
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

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Package size={28} color="var(--primary-blue)" /> Products & Services
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>Manage your inventory catalogue, service offerings, and categorizations.</p>
        </div>
        <button onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'var(--primary-blue)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}>
          <Plus size={18} /> Add New {activeTab === 'categories' ? 'Category' : activeTab === 'subcategories' ? 'Sub Category' : 'Product/Service'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tag size={24} /></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Categories</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A' }}>{categories.length}</h3>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F8FAFC', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tag size={24} /></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Sub Categories</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A' }}>{subcategories.length}</h3>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={24} /></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Products/Services</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A' }}>{products.length}</h3>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', background: '#F8FAFC', padding: '4px', borderRadius: '10px', alignSelf: 'flex-start' }}>
            <button onClick={() => setActiveTab('categories')} style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', background: activeTab === 'categories' ? 'white' : 'transparent', color: activeTab === 'categories' ? '#0F172A' : '#64748B', border: 'none', boxShadow: activeTab === 'categories' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Categories</button>
            <button onClick={() => setActiveTab('subcategories')} style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', background: activeTab === 'subcategories' ? 'white' : 'transparent', color: activeTab === 'subcategories' ? '#0F172A' : '#64748B', border: 'none', boxShadow: activeTab === 'subcategories' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Sub Categories</button>
            <button onClick={() => setActiveTab('products')} style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', background: activeTab === 'products' ? 'white' : 'transparent', color: activeTab === 'products' ? '#0F172A' : '#64748B', border: 'none', boxShadow: activeTab === 'products' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Products & Services</button>
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
              
                <button onClick={() => exportToCSV(filteredData, 'Products')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#475569', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}><Download size={16} /> Export</button>
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
                        {activeTab === 'categories' ? 'No categories available' : activeTab === 'subcategories' ? 'No subcategories available' : 'No products or services found'}
                      </p>
                      {/* <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                        Click "+ Add New {activeTab === 'categories' ? 'Category' : activeTab === 'subcategories' ? 'Sub Category' : 'Product/Service'}" above to create one.
                      </span> */}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '16px 24px', fontSize: '15px', color: '#475569', fontWeight: '500' }}>{index + 1}</td>
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
                        <td style={{ padding: '16px 24px', color: '#475569' }}>{item.itemType === 'Service' ? '-' : (item.stock || 0)}</td>
                      </>
                    )}

                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
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
      </div>

      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '540px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                {editingItem ? 'Edit' : 'Add'} {activeTab === 'categories' ? 'Category' : activeTab === 'subcategories' ? 'Sub Category' : 'Product / Service'}
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
                      <select value={catForm.itemType} onChange={e => setCatForm({...catForm, itemType: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                        <option value="Product">Product</option>
                        <option value="Service">Service</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Transaction Type</label>
                      <select value={catForm.transactionType} onChange={e => setCatForm({...catForm, transactionType: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                        <option value="Sales">Sales</option>
                        <option value="Purchase">Purchase</option>
                      </select>
                    </div>
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
                          itemType: matched?.itemType || subCatForm.itemType || 'Product',
                          transactionType: matched?.transactionType || subCatForm.transactionType || 'Sales'
                        });
                      }}
                      required
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                    >
                      {categories.length === 0 ? (
                        <option value="" disabled>No category available</option>
                      ) : (
                        <option value="">Select Category...</option>
                      )}
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  {subCatForm.categoryId && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Item Type</label>
                        <input
                          type="text"
                          readOnly
                          value={subCatForm.itemType || ''}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid #CBD5E1',
                            backgroundColor: '#F8FAFC',
                            color: '#334155',
                            cursor: 'default',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Transaction Type</label>
                        <input
                          type="text"
                          readOnly
                          value={subCatForm.transactionType || ''}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid #CBD5E1',
                            backgroundColor: '#F8FAFC',
                            color: '#334155',
                            cursor: 'default',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'products' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: prodForm.itemType === 'Product' ? '1fr 1fr' : '1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Name</label>
                      <input placeholder="Enter the product name" type="text" value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                    </div>
                    {prodForm.itemType === 'Product' && (
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
                          const derivedType = matched?.itemType || 'Product';
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
                        {categories.length === 0 ? (
                          <option value="" disabled>No category available</option>
                        ) : (
                          <option value="">Select Category...</option>
                        )}
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Sub Category</label>
                      <select
                        value={prodForm.subCategoryId}
                        onChange={e => setProdForm({ ...prodForm, subCategoryId: e.target.value })}
                        disabled={!prodForm.categoryId || subcategories.filter(sc => (sc.categoryId?._id || sc.categoryId) === prodForm.categoryId).length === 0}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '10px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: (!prodForm.categoryId || subcategories.filter(sc => (sc.categoryId?._id || sc.categoryId) === prodForm.categoryId).length === 0) ? '#F8FAFC' : 'white',
                          color: (!prodForm.categoryId || subcategories.filter(sc => (sc.categoryId?._id || sc.categoryId) === prodForm.categoryId).length === 0) ? '#64748B' : '#0F172A',
                          cursor: (!prodForm.categoryId || subcategories.filter(sc => (sc.categoryId?._id || sc.categoryId) === prodForm.categoryId).length === 0) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {!prodForm.categoryId ? (
                          <option value="" disabled>Select category first</option>
                        ) : subcategories.filter(sc => (sc.categoryId?._id || sc.categoryId) === prodForm.categoryId).length === 0 ? (
                          <option value="" disabled>No subcategory available</option>
                        ) : (
                          <>
                            <option value="">Select sub category</option>
                            {subcategories
                              .filter(sc => (sc.categoryId?._id || sc.categoryId) === prodForm.categoryId)
                              .map(sc => (
                                <option key={sc._id} value={sc._id}>{sc.name}</option>
                              ))}
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: prodForm.itemType === 'Product' ? '1fr 1fr' : '1fr', gap: '16px' }}>
                    {prodForm.itemType === 'Product' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Stock Quantity</label>
                        <input placeholder="Enter the stock quantity" type="number" value={prodForm.stock} onChange={e => setProdForm({...prodForm, stock: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                      </div>
                    )}
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Price</label>
                      <input placeholder="Enter the price amount" type="number" value={prodForm.price} onChange={e => setProdForm({...prodForm, price: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                    </div>
                    
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Product/Service Image</label>
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
                <button type="submit" style={{ flex: 1, padding: '14px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>{editingItem ? 'Update' : 'Save'}</button>
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
