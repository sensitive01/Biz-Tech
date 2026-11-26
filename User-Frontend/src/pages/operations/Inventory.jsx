import { exportToCSV } from '@/utils/exportToCSV';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  ArrowUp, 
  ArrowDown, 
  Archive, 
  Plus, 
  X, 
  Eye, 
  Pencil, 
  Trash2, 
  AlertTriangle, 
  Search, 
  ArrowUpDown, 
  Download, 
  Package, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Tag,
  Boxes
} from 'lucide-react';
import TablePagination from '@/components/TablePagination';

const Inventory = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterDays, setFilterDays] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const initialForm = {
    productId: '',
    itemName: '',
    sku: '',
    category: '',
    quantityToAdd: '',
    packageQtyToAdd: '',
    restockUnitType: 'base',
    costPrice: '',
    supplier: '',
    batchNumber: '',
    location: '',
    notes: '',
    currentStock: 0,
    unit: 'pcs',
    measurementType: 'Piece',
    secondaryUnit: '',
    conversionFactor: 1
  };

  const [formData, setFormData] = useState(initialForm);
  const [showConversionSection, setShowConversionSection] = useState(false);

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

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          // Keep physical products (non-service)
          const physical = data.filter(p => String(p.itemType || '').toLowerCase() !== 'service');
          setAvailableProducts(physical);
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchProducts();
    const handleUpdate = () => {
      fetchItems();
      fetchProducts();
    };
    window.addEventListener('inventoryDataUpdated', handleUpdate);
    window.addEventListener('productDataUpdated', handleUpdate);
    return () => {
      window.removeEventListener('inventoryDataUpdated', handleUpdate);
      window.removeEventListener('productDataUpdated', handleUpdate);
    };
  }, []);

  // Handle ?restock=productId query param from Products page shortcut
  useEffect(() => {
    const restockId = searchParams.get('restock');
    if (restockId && availableProducts.length > 0) {
      handleSelectProduct(restockId);
      setShowModal(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, availableProducts]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    fetchProducts();
    setFormData(initialForm);
    setShowConversionSection(false);
    setShowModal(true);
  };

  const handleRestock = (item) => {
    setEditingItem(item);
    fetchProducts();

    const prodId = item.productId?._id || item.productId;
    const prod = availableProducts.find(p => String(p._id) === String(prodId));
    const currStock = Number(item.quantity) || 0;
    const unit = item.unit || prod?.unit || item.productId?.unit || 'pcs';
    const measurementType = item.measurementType || prod?.measurementType || item.productId?.measurementType || 'Piece';
    const secondaryUnit = item.secondaryUnit || prod?.secondaryUnit || item.productId?.secondaryUnit || '';
    const conversionFactor = item.conversionFactor || prod?.conversionFactor || item.productId?.conversionFactor || 1;

    setFormData({
      productId: prodId || (prod ? prod._id : ''),
      itemName: item.itemName || (prod ? prod.name : ''),
      sku: item.sku || (prod ? prod.sku : ''),
      category: item.category || (prod ? (prod.categoryId?.name || prod.category) : ''),
      quantityToAdd: '',
      packageQtyToAdd: '',
      restockUnitType: secondaryUnit && Number(conversionFactor) > 1 ? 'package' : 'base',
      costPrice: item.costPrice !== undefined && item.costPrice !== null ? item.costPrice : (prod?.costPrice || ''),
      supplier: item.supplier || '',
      batchNumber: item.batchNumber || '',
      location: item.location || '',
      notes: item.notes || '',
      currentStock: currStock,
      unit,
      measurementType,
      secondaryUnit,
      conversionFactor
    });
    setShowConversionSection(Boolean(secondaryUnit || (unit && unit !== 'pcs')));
    setShowModal(true);
  };

  const handleEdit = (item) => {
    handleRestock(item);
  };

  const handleSelectProduct = (selectedId) => {
    if (!selectedId) {
      setFormData(prev => ({
        ...prev,
        productId: '',
        itemName: '',
        sku: '',
        category: '',
        currentStock: 0,
        unit: 'pcs',
        measurementType: 'Piece',
        secondaryUnit: '',
        conversionFactor: 1,
        restockUnitType: 'base',
        quantityToAdd: '',
        packageQtyToAdd: ''
      }));
      return;
    }

    const prod = availableProducts.find(p => String(p._id) === String(selectedId));
    if (prod) {
      const existingInv = items.find(i => String(i.productId?._id || i.productId) === String(prod._id));
      const currStock = existingInv ? Number(existingInv.quantity) || 0 : (Number(prod.stock) || 0);
      const unit = prod.unit || existingInv?.unit || 'pcs';
      const measurementType = prod.measurementType || existingInv?.measurementType || 'Piece';
      const secondaryUnit = prod.secondaryUnit || existingInv?.secondaryUnit || '';
      const conversionFactor = prod.conversionFactor || existingInv?.conversionFactor || 1;

      setFormData(prev => ({
        ...prev,
        productId: prod._id,
        itemName: prod.name,
        sku: prod.sku || '',
        category: prod.categoryId?.name || prod.category || '',
        costPrice: prev.costPrice || existingInv?.costPrice || prod.costPrice || '',
        supplier: prev.supplier || existingInv?.supplier || '',
        batchNumber: prev.batchNumber || existingInv?.batchNumber || '',
        location: prev.location || existingInv?.location || '',
        notes: prev.notes || existingInv?.notes || '',
        currentStock: currStock,
        unit,
        measurementType,
        secondaryUnit,
        conversionFactor,
        restockUnitType: secondaryUnit && Number(conversionFactor) > 1 ? 'package' : 'base',
        quantityToAdd: '',
        packageQtyToAdd: ''
      }));
      setShowConversionSection(Boolean(secondaryUnit || (unit && unit !== 'pcs')));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingItem
        ? `${import.meta.env.VITE_API_URL}/api/inventory/${editingItem._id}`
        : `${import.meta.env.VITE_API_URL}/api/inventory`;
      const method = editingItem ? 'PUT' : 'POST';

      const finalQty = Number(formData.currentStock || 0) + Number(formData.quantityToAdd || 0);

      const payload = {
        productId: formData.productId || undefined,
        itemName: formData.itemName,
        sku: formData.sku,
        category: formData.category,
        quantity: finalQty,
        quantityToAdd: formData.quantityToAdd,
        costPrice: formData.costPrice,
        unit: formData.unit || 'pcs',
        measurementType: formData.measurementType || 'Piece',
        secondaryUnit: formData.secondaryUnit || '',
        conversionFactor: formData.conversionFactor || 1,
        supplier: formData.supplier,
        batchNumber: formData.batchNumber,
        location: formData.location,
        notes: formData.notes,
        mode: 'add'
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        setEditingItem(null);
        setFormData(initialForm);
        fetchItems();
        fetchProducts();
      } else {
        alert(editingItem ? 'Failed to update stock' : 'Failed to add stock');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/inventory/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteId(null);
        fetchItems();
        fetchProducts();
      } else {
        alert('Failed to delete');
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        return true;
      }
      return true;
    })
    .filter(i => Object.values(i).some(val => String(val).toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterDays, customStartDate, customEndDate, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const totalStockUnits = items.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);
  const lowStockCount = items.filter(i => (Number(i.quantity) || 0) <= 5).length;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Archive size={28} color="var(--primary-blue)" /> Stock & Inventory Management
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
            Track in-stock quantities and replenish stock for products in your catalogue.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={handleOpenAdd} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '11px 18px', 
              background: 'var(--primary-blue)', 
              border: 'none', 
              borderRadius: '8px', 
              color: 'white', 
              fontWeight: '600', 
              fontSize: '13px', 
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37,99,235,0.2)'
            }}
          >
            <Plus size={16} /> Add / Restock Stock
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Archive size={24} />
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Stock Items</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{items.length}</h3>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={24} />
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Units Stocked</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '700' }}>{totalStockUnits}</h3>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: lowStockCount > 0 ? '#FEF2F2' : '#FFFBEB', color: lowStockCount > 0 ? '#DC2626' : '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Low Stock Items (≤ 5)</p>
            <h3 style={{ margin: 0, fontSize: '24px', color: lowStockCount > 0 ? '#DC2626' : '#0F172A', fontWeight: '700' }}>{lowStockCount}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ flex: '0 1 300px', minWidth: '250px', position: 'relative' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} 
          />
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <select 
            value={filterDays} 
            onChange={(e) => setFilterDays(e.target.value)} 
            style={{ padding: '10px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#475569', fontWeight: '500', fontSize: '14px', outline: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
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
          
          <button 
            onClick={() => exportToCSV(filteredItems, 'Inventory')} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#475569', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '60px' }}>S.No</th>
                <th onClick={() => requestSort('itemName')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Item Name {renderSortIcon('itemName')}</div>
                </th>
                <th onClick={() => requestSort('sku')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Stock Keeping Unit(SKU) {renderSortIcon('sku')}</div>
                </th>
                <th onClick={() => requestSort('category')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Category {renderSortIcon('category')}</div>
                </th>
                <th onClick={() => requestSort('quantity')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Quantity {renderSortIcon('quantity')}</div>
                </th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>Loading inventory...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '64px 32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <Archive size={32} color="#3B82F6" />
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>No stock items found</h3>
                      <p style={{ color: '#64748B', fontSize: '14px', margin: '0 0 16px 0', maxWidth: '450px', lineHeight: '1.5' }}>
                        Products added in your Products Catalogue automatically appear here. You can add stock to existing catalogue products or replenish inventory.
                      </p>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button 
                          onClick={handleOpenAdd}
                          style={{ padding: '8px 16px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Plus size={16} /> Add Stock to Product
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, index) => {
                  const qty = Number(item.quantity) || 0;
                  const isOut = qty <= 0;
                  const isLow = qty > 0 && qty <= 5;
                  const thumb = item.productId?.image;

                  return (
                    <tr 
                      key={item._id} 
                      style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.2s' }} 
                      onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} 
                      onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', fontWeight: '500' }}>
                        {startIndex + index + 1}
                      </td>
                      
                      {/* Item Name with optional image/badge */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {thumb ? (
                            <img 
                              src={thumb} 
                              alt={item.itemName} 
                              style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E2E8F0' }} 
                            />
                          ) : (
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F1F5F9', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Package size={18} />
                            </div>
                          )}
                          <div>
                            <span style={{ fontWeight: '600', color: '#0F172A', fontSize: '14px', display: 'block' }}>
                              {item.itemName}
                            </span>
                            {item.price !== undefined && item.price !== null && (
                              <span style={{ fontSize: '12px', color: '#64748B' }}>
                                ₹{item.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '16px 24px', color: '#475569', fontSize: '14px', fontFamily: 'monospace' }}>
                        {item.sku || '-'}
                      </td>

                      <td style={{ padding: '16px 24px', color: '#475569', fontSize: '14px' }}>
                        {item.category || '-'}
                      </td>

                      {/* Quantity & Stock Status Badge */}
                      <td style={{ padding: '16px 24px' }}>
                        <div>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '16px',
                            fontSize: '13px',
                            fontWeight: '700',
                            background: isOut ? '#FEF2F2' : isLow ? '#FFFBEB' : '#ECFDF5',
                            color: isOut ? '#DC2626' : isLow ? '#D97706' : '#16A34A',
                            border: `1px solid ${isOut ? '#FECACA' : isLow ? '#FDE68A' : '#A7F3D0'}`
                          }}>
                            {isOut ? (
                              <>
                                <AlertCircle size={13} />
                                <span>0 • Out of Stock</span>
                              </>
                            ) : isLow ? (
                              <>
                                <AlertTriangle size={13} />
                                <span>{qty} {item.unit || item.productId?.unit || 'units'} • Low Stock</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={13} />
                                <span>{qty} {item.unit || item.productId?.unit || 'units'}</span>
                              </>
                            )}
                          </span>

                          {/* Packaging / Bulk Conversion details if defined */}
                          {(item.secondaryUnit || item.productId?.secondaryUnit) && Number(item.conversionFactor || item.productId?.conversionFactor) > 1 && (
                            <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '3px' }}>
                              <span>
                                ≈ {parseFloat((qty / Number(item.conversionFactor || item.productId?.conversionFactor)).toFixed(1))} {item.secondaryUnit || item.productId?.secondaryUnit}
                              </span>
                              <span style={{ marginLeft: '4px', color: '#94A3B8' }}>
                                (1 {item.secondaryUnit || item.productId?.secondaryUnit} = {item.conversionFactor || item.productId?.conversionFactor} {item.unit || item.productId?.unit || 'pcs'})
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          {/* Quick Restock button */}
                          <button 
                            type="button"
                            onClick={() => handleRestock(item)} 
                            title="Add Stock" 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              width: '32px', 
                              height: '32px', 
                              background: '#EFF6FF', 
                              color: '#2563EB', 
                              border: '1px solid #BFDBFE', 
                              borderRadius: '6px', 
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Plus size={16} />
                          </button>
                          
                          <button onClick={() => setViewItem(item)} title="View" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer' }}>
                            <Eye size={15} />
                          </button>
                          <button onClick={() => handleEdit(item)} title="Edit" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#F8FAFC', color: '#2563EB', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer' }}>
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeleteId(item._id)} title="Delete" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', borderRadius: '6px', cursor: 'pointer' }}>
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
          itemName="items"
        />
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD STOCK / RESTOCK PRODUCT                                        */}
      {/* ========================================================================= */}
      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '540px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Boxes size={22} color="var(--primary-blue)" />
                  Add Stock to Product
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Select a product and enter the units to add to inventory.
                </p>
              </div>
              <button 
                onClick={() => { setShowModal(false); setEditingItem(null); }} 
                style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Product Selection Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>
                  Select Product to Stock *
                </label>
                <select
                  value={formData.productId || ''}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #2563EB',
                    fontSize: '14px',
                    color: '#0F172A',
                    background: 'white',
                    fontWeight: '600',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">-- Choose a product from catalogue --</option>
                  {availableProducts.map(p => {
                    const stockVal = p.stock !== undefined && p.stock !== null ? p.stock : 0;
                    const isZero = stockVal <= 0;
                    return (
                      <option key={p._id} value={p._id}>
                        {p.name} {p.sku ? `(${p.sku})` : ''} — Current Stock: {stockVal} {isZero ? '⚠️ [Out of Stock]' : 'units'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Quantity to Add */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>
                    Quantity to Add *
                  </label>
                  {formData.productId && (
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '6px' }}>
                      Current Stock: {formData.currentStock || 0} {formData.unit || 'pcs'}
                    </span>
                  )}
                </div>

                {/* If product has packaging conversion (e.g. 1 Box = 10 pcs), allow toggling between Base Units and Packages */}
                {formData.secondaryUnit && Number(formData.conversionFactor) > 1 && (
                  <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#334155', fontWeight: '600' }}>
                      Rule: 1 {formData.secondaryUnit} = {formData.conversionFactor} {formData.unit || 'pcs'}
                    </span>
                    <div style={{ display: 'flex', gap: '4px', background: '#E2E8F0', padding: '2px', borderRadius: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const factor = Number(formData.conversionFactor) || 1;
                          const newBaseQty = formData.packageQtyToAdd ? String(Number(formData.packageQtyToAdd) * factor) : formData.quantityToAdd;
                          setFormData(prev => ({ ...prev, restockUnitType: 'package', quantityToAdd: newBaseQty }));
                        }}
                        style={{
                          padding: '4px 10px',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          background: formData.restockUnitType === 'package' ? '#2563EB' : 'transparent',
                          color: formData.restockUnitType === 'package' ? 'white' : '#64748B'
                        }}
                      >
                        Add in {formData.secondaryUnit}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, restockUnitType: 'base' }))}
                        style={{
                          padding: '4px 10px',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          background: formData.restockUnitType === 'base' ? '#2563EB' : 'transparent',
                          color: formData.restockUnitType === 'base' ? 'white' : '#64748B'
                        }}
                      >
                        Add in {formData.unit || 'pcs'}
                      </button>
                    </div>
                  </div>
                )}

                {formData.restockUnitType === 'package' && formData.secondaryUnit && Number(formData.conversionFactor) > 1 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                        Number of {formData.secondaryUnit} *
                      </label>
                      <input
                        placeholder={`e.g. 5 ${formData.secondaryUnit}`}
                        type="number"
                        min="1"
                        value={formData.packageQtyToAdd || ''}
                        onChange={e => {
                          const pQty = e.target.value;
                          const factor = Number(formData.conversionFactor) || 1;
                          const baseQty = pQty ? String(Number(pQty) * factor) : '';
                          setFormData(prev => ({ ...prev, packageQtyToAdd: pQty, quantityToAdd: baseQty }));
                        }}
                        required
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748B', marginBottom: '4px' }}>
                        Total {formData.unit || 'pcs'} (Calculated)
                      </label>
                      <div style={{ height: '42px', padding: '0 14px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '700', color: '#2563EB' }}>
                        {formData.quantityToAdd ? `${formData.quantityToAdd} ${formData.unit || 'pcs'}` : `0 ${formData.unit || 'pcs'}`}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      placeholder={`Enter ${formData.unit || 'units'} to add (e.g. 10)`}
                      type="number"
                      min="1"
                      value={formData.quantityToAdd}
                      onChange={e => {
                        const val = e.target.value;
                        const factor = Number(formData.conversionFactor) || 1;
                        const pQty = val ? String(parseFloat((Number(val) / factor).toFixed(2))) : '';
                        setFormData(prev => ({ ...prev, quantityToAdd: val, packageQtyToAdd: pQty }));
                      }}
                      required
                      style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                    <div style={{ height: '42px', minWidth: '60px', padding: '0 12px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#2563EB' }}>
                      {formData.unit || 'pcs'}
                    </div>
                  </div>
                )}

                {/* Show new total stock preview */}
                {formData.productId && formData.quantityToAdd && Number(formData.quantityToAdd) > 0 && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    fontSize: '13px',
                    color: '#15803D',
                    fontWeight: '600'
                  }}>
                    📦 New Total Stock: <strong>{Number(formData.currentStock || 0) + Number(formData.quantityToAdd)} {formData.unit || 'pcs'}</strong> ({formData.currentStock || 0} + {formData.quantityToAdd})
                    {formData.secondaryUnit && Number(formData.conversionFactor) > 1 && (
                      <span style={{ marginLeft: '6px', color: '#166534', fontWeight: '500' }}>
                        (≈ {((Number(formData.currentStock || 0) + Number(formData.quantityToAdd)) / Number(formData.conversionFactor)).toFixed(1)} {formData.secondaryUnit})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Tickbox to Edit / Configure Unit & Conversion for this product */}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#1E293B', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={showConversionSection}
                    onChange={e => setShowConversionSection(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#2563EB', cursor: 'pointer' }}
                  />
                  Unit of Measure & Packaging Conversion
                </label>
                <p style={{ margin: '2px 0 0 24px', fontSize: '11.5px', color: '#64748B' }}>
                  Configure product measurement type ({formData.measurementType || 'Piece'}) and packaging conversion.
                </p>
              </div>

              {showConversionSection && (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                        Measurement Category *
                      </label>
                      <select
                        value={formData.measurementType || 'Piece'}
                        onChange={e => {
                          const t = e.target.value;
                          const defaultUnits = { Piece: 'pcs', Weight: 'kg', Volume: 'L', Length: 'meter', Other: 'unit' };
                          setFormData(prev => ({ ...prev, measurementType: t, unit: defaultUnits[t] || 'pcs' }));
                        }}
                        style={{ width: '100%', height: '36px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'white', fontSize: '12.5px' }}
                      >
                        <option value="Piece">Piece / Count (Units, Items, Pieces)</option>
                        <option value="Weight">Weight (Kg, Gram, Ton)</option>
                        <option value="Volume">Volume / Liquid (Liter, ml)</option>
                        <option value="Length">Length / Dimension (Meter, Feet)</option>
                        <option value="Other">Other / Custom</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                        Base Selling Unit *
                      </label>
                      {formData.measurementType === 'Other' ? (
                        <input
                          type="text"
                          placeholder="e.g. Roll, Sheet"
                          value={formData.unit || ''}
                          onChange={e => setFormData({ ...formData, unit: e.target.value })}
                          style={{ width: '100%', height: '36px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'white', fontSize: '12.5px', boxSizing: 'border-box' }}
                        />
                      ) : (
                        <select
                          value={formData.unit || 'pcs'}
                          onChange={e => setFormData({ ...formData, unit: e.target.value })}
                          style={{ width: '100%', height: '36px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'white', fontSize: '12.5px' }}
                        >
                          {formData.measurementType === 'Weight' ? (
                            <>
                              <option value="kg">Kilograms (kg)</option>
                              <option value="g">Grams (g)</option>
                              <option value="mg">Milligrams (mg)</option>
                              <option value="quintal">Quintal</option>
                              <option value="ton">Metric Ton</option>
                            </>
                          ) : formData.measurementType === 'Volume' ? (
                            <>
                              <option value="L">Liters (L)</option>
                              <option value="ml">Milliliters (ml)</option>
                              <option value="bottle">Bottle</option>
                              <option value="can">Can</option>
                              <option value="gallon">Gallon</option>
                            </>
                          ) : formData.measurementType === 'Length' ? (
                            <>
                              <option value="meter">Meters (m)</option>
                              <option value="cm">Centimeters (cm)</option>
                              <option value="feet">Feet (ft)</option>
                              <option value="inch">Inches (in)</option>
                            </>
                          ) : (
                            <>
                              <option value="pcs">Pieces (pcs)</option>
                              <option value="unit">Units (unit)</option>
                              <option value="item">Items (item)</option>
                              <option value="pack">Packets (pkt)</option>
                              <option value="dozen">Dozen (12 pcs)</option>
                              <option value="pair">Pair</option>
                              <option value="set">Set</option>
                            </>
                          )}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Packaging Conversion Definition */}
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                      Packaging Conversion (e.g. 1 Box = 10 {formData.unit || 'pcs'})
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155' }}>1</span>
                      <input
                        type="text"
                        placeholder="Package (e.g. Box, Carton)"
                        value={formData.secondaryUnit || ''}
                        onChange={e => setFormData({ ...formData, secondaryUnit: e.target.value })}
                        style={{ width: '150px', height: '34px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', boxSizing: 'border-box' }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>contains</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty (e.g. 10)"
                        value={formData.conversionFactor || ''}
                        onChange={e => setFormData({ ...formData, conversionFactor: e.target.value })}
                        style={{ width: '110px', height: '34px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', boxSizing: 'border-box' }}
                      />
                      <div style={{ height: '34px', padding: '0 10px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#2563EB' }}>
                        {formData.unit || 'pcs'}
                      </div>
                    </div>

                    {formData.secondaryUnit && formData.conversionFactor && (
                      <div style={{ marginTop: '6px', fontSize: '12px', color: '#166534', fontWeight: '600' }}>
                        Rule: 1 {formData.secondaryUnit} = {formData.conversionFactor} {formData.unit || 'pcs'}
                      </div>
                    )}

                    {/* Auto-Swap Helper */}
                    {Boolean(
                      formData.secondaryUnit &&
                      ['piece', 'pieces', 'pcs', 'unit', 'units'].includes(formData.secondaryUnit.toLowerCase().trim()) &&
                      ['box', 'carton', 'case', 'pack', 'packet'].includes((formData.unit || '').toLowerCase().trim())
                    ) && (
                      <div style={{ marginTop: '6px', padding: '6px 10px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '6px', fontSize: '11.5px', color: '#92400E', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Tip: A {formData.unit} contains {formData.secondaryUnit}.</span>
                        <button
                          type="button"
                          onClick={() => {
                            const oldUnit = formData.unit;
                            const oldSec = formData.secondaryUnit;
                            setFormData(prev => ({ ...prev, unit: oldSec, secondaryUnit: oldUnit }));
                          }}
                          style={{ padding: '2px 6px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Swap
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Stock Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                    Cost Price / {formData.unit || 'unit'} (₹)
                  </label>
                  <input
                    placeholder="e.g. 750"
                    type="number"
                    min="0"
                    step="any"
                    value={formData.costPrice || ''}
                    onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                    Supplier / Vendor
                  </label>
                  <input
                    placeholder="e.g. ABC Wholesalers"
                    type="text"
                    value={formData.supplier || ''}
                    onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                  Notes / Remarks
                </label>
                <textarea
                  placeholder="e.g. Received new stock delivery in good condition..."
                  rows={2}
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingItem(null); setShowConversionSection(false); }}
                  style={{ flex: 1, padding: '14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.productId || !formData.quantityToAdd || Number(formData.quantityToAdd) <= 0}
                  style={{ 
                    flex: 1, 
                    padding: '14px', 
                    background: (!formData.productId || !formData.quantityToAdd || Number(formData.quantityToAdd) <= 0) ? '#94A3B8' : '#2563EB', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '10px', 
                    fontWeight: '700', 
                    fontSize: '14px', 
                    cursor: (!formData.productId || !formData.quantityToAdd || Number(formData.quantityToAdd) <= 0) ? 'not-allowed' : 'pointer', 
                    boxShadow: (!formData.productId || !formData.quantityToAdd || Number(formData.quantityToAdd) <= 0) ? 'none' : '0 2px 8px rgba(37,99,235,0.25)' 
                  }}
                >
                  {formData.quantityToAdd && Number(formData.quantityToAdd) > 0
                    ? `Add Stock (Total: ${Number(formData.currentStock || 0) + Number(formData.quantityToAdd)} ${formData.unit || 'pcs'})`
                    : 'Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW DETAILS                                                       */}
      {/* ========================================================================= */}
      {viewItem && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Stock Details</h2>
              <button onClick={() => setViewItem(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Item Name</p>
                <p style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '600' }}>{viewItem.itemName}</p>
              </div>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Stock Keeping Unit (SKU)</p>
                <p style={{ margin: 0, fontSize: '16px', color: '#0F172A' }}>{viewItem.sku || '-'}</p>
              </div>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Category</p>
                <p style={{ margin: 0, fontSize: '16px', color: '#0F172A' }}>{viewItem.category || '-'}</p>
              </div>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Quantity Available</p>
                <p style={{ margin: 0, fontSize: '18px', color: Number(viewItem.quantity) <= 0 ? '#DC2626' : '#16A34A', fontWeight: '700' }}>
                  {viewItem.quantity} units {Number(viewItem.quantity) <= 0 ? '(Out of Stock)' : ''}
                </p>
              </div>
              {viewItem.price !== undefined && viewItem.price !== null && (
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Selling Price</p>
                  <p style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '600' }}>₹{viewItem.price}</p>
                </div>
              )}
              {viewItem.costPrice !== undefined && viewItem.costPrice !== null && viewItem.costPrice !== '' && (
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Cost Price per Unit</p>
                  <p style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '600' }}>₹{viewItem.costPrice}</p>
                </div>
              )}
              {viewItem.supplier && (
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Supplier / Vendor</p>
                  <p style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '600' }}>{viewItem.supplier}</p>
                </div>
              )}
              {viewItem.batchNumber && (
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Batch / PO Number</p>
                  <p style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '600' }}>{viewItem.batchNumber}</p>
                </div>
              )}
              {viewItem.location && (
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Storage Location / Shelf</p>
                  <p style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '600' }}>{viewItem.location}</p>
                </div>
              )}
              {viewItem.notes && (
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Notes / Remarks</p>
                  <p style={{ margin: 0, fontSize: '15px', color: '#334155' }}>{viewItem.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>, document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                                */}
      {/* ========================================================================= */}
      {deleteId && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <AlertTriangle size={32} color="#EF4444" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: '0 0 12px 0' }}>Delete Record</h2>
            <p style={{ color: '#64748B', margin: '0 0 24px 0' }}>Are you sure you want to delete this inventory record?</p>
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

export default Inventory;
