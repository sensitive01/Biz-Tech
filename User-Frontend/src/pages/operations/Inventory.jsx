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
    costPrice: '',
    supplier: '',
    batchNumber: '',
    location: '',
    notes: '',
    currentStock: 0
  };

  const [formData, setFormData] = useState(initialForm);

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
    setShowModal(true);
  };

  const handleRestock = (item) => {
    setEditingItem(item);
    fetchProducts();

    const prodId = item.productId?._id || item.productId;
    const prod = availableProducts.find(p => String(p._id) === String(prodId));
    const currStock = Number(item.quantity) || 0;

    setFormData({
      productId: prodId || (prod ? prod._id : ''),
      itemName: item.itemName || (prod ? prod.name : ''),
      sku: item.sku || (prod ? prod.sku : ''),
      category: item.category || (prod ? (prod.categoryId?.name || prod.category) : ''),
      quantityToAdd: '',
      costPrice: item.costPrice !== undefined && item.costPrice !== null ? item.costPrice : '',
      supplier: item.supplier || '',
      batchNumber: item.batchNumber || '',
      location: item.location || '',
      notes: item.notes || '',
      currentStock: currStock
    });
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
        currentStock: 0
      }));
      return;
    }

    const prod = availableProducts.find(p => String(p._id) === String(selectedId));
    if (prod) {
      const existingInv = items.find(i => String(i.productId?._id || i.productId) === String(prod._id));
      const currStock = existingInv ? Number(existingInv.quantity) || 0 : (Number(prod.stock) || 0);

      setFormData(prev => ({
        ...prev,
        productId: prod._id,
        itemName: prod.name,
        sku: prod.sku || '',
        category: prod.categoryId?.name || prod.category || '',
        costPrice: prev.costPrice || existingInv?.costPrice || '',
        supplier: prev.supplier || existingInv?.supplier || '',
        batchNumber: prev.batchNumber || existingInv?.batchNumber || '',
        location: prev.location || existingInv?.location || '',
        notes: prev.notes || existingInv?.notes || '',
        currentStock: currStock
      }));
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
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
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
                              <span>{qty} • Low Stock</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={13} />
                              <span>{qty} units</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
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

              {/* Quantity to Add (Units) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>
                    Quantity to Add (Units) *
                  </label>
                  {formData.productId && (
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '6px' }}>
                      Current Stock: {formData.currentStock || 0} units
                    </span>
                  )}
                </div>
                <input
                  placeholder="Enter units to add (e.g. 10)"
                  type="number"
                  min="1"
                  value={formData.quantityToAdd}
                  onChange={e => setFormData({ ...formData, quantityToAdd: e.target.value })}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    borderRadius: '10px', 
                    border: '1px solid #CBD5E1', 
                    fontSize: '15px', 
                    color: '#0F172A', 
                    boxSizing: 'border-box',
                    backgroundColor: 'white',
                    cursor: 'text'
                  }}
                />

                {/* Show new total ONLY when user enters a number and product is chosen */}
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
                    📦 New Total Stock: <strong>{Number(formData.currentStock || 0) + Number(formData.quantityToAdd)} units</strong> ({formData.currentStock || 0} + {formData.quantityToAdd})
                  </div>
                )}
              </div>

              {/* Additional Stock Details - Always visible initially */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                    Cost Price / Unit (₹)
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
                  onClick={() => { setShowModal(false); setEditingItem(null); }}
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
                    ? `Add Stock (Total: ${Number(formData.currentStock || 0) + Number(formData.quantityToAdd)} units)`
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
