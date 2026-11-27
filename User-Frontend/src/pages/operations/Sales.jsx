import { exportToCSV } from '@/utils/exportToCSV';
import { formatDate } from '@/utils/formatDate';
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  ArrowUp, 
  ArrowDown, 
  TrendingUp, 
  Plus, 
  X, 
  Eye, 
  Pencil, 
  Trash2, 
  AlertTriangle, 
  Search, 
  ArrowUpDown, 
  Download, 
  IndianRupee, 
  ShoppingCart, 
  Receipt,
  Barcode,
  FileText,
  CheckCircle2,
  Printer,
  Sparkles,
  Package,
  Wrench,
  Check
} from 'lucide-react';
import TablePagination from '@/components/TablePagination';

// SVG Barcode graphic component
const BarcodeSVG = ({ code, width = 160, height = 48, showText = true }) => {
  const bars = useMemo(() => {
    const list = [];
    let currentX = 8;
    const str = String(code || '8901234567890');
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      const w1 = (charCode % 3) + 1.2;
      const w2 = ((charCode * 2) % 3) + 1.1;
      const w3 = ((charCode * 3) % 4) + 1.4;
      list.push({ x: currentX, width: w1 });
      currentX += w1 + 1.5;
      list.push({ x: currentX, width: w2 });
      currentX += w2 + 2;
      list.push({ x: currentX, width: w3 });
      currentX += w3 + 1.8;
    }
    return { list, totalWidth: Math.max(width, currentX + 8) };
  }, [code, width]);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={bars.totalWidth} height={height} viewBox={`0 0 ${bars.totalWidth} ${height}`} style={{ background: '#FFFFFF', borderRadius: '4px' }}>
        {bars.list.map((bar, idx) => (
          <rect key={idx} x={bar.x} y="4" width={bar.width} height={height - (showText ? 14 : 8)} fill="#0F172A" />
        ))}
        {showText && (
          <text x={bars.totalWidth / 2} y={height - 2} textAnchor="middle" fontSize="10" fontFamily="monospace" fontWeight="700" fill="#334155" letterSpacing="2px">
            {code}
          </text>
        )}
      </svg>
    </div>
  );
};

// Default empty lists for fresh accounts
const DEFAULT_QUOTATIONS = [];
const DEFAULT_BARCODES = [];

const Sales = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  // Active Tab: 'Sales' (Billing), 'Purchase', 'Quotation', 'Barcode'
  const initialType = useMemo(() => {
    if (tabParam === 'purchase') return 'Purchase';
    if (tabParam === 'quotation') return 'Quotation';
    if (tabParam === 'barcode') return 'Barcode';
    return 'Sales';
  }, [tabParam]);

  const [type, setType] = useState(initialType);

  // Synchronize active tab with URL query parameter
  useEffect(() => {
    if (tabParam === 'purchase') setType('Purchase');
    else if (tabParam === 'quotation') setType('Quotation');
    else if (tabParam === 'barcode') setType('Barcode');
    else if (tabParam === 'sales') setType('Sales');
  }, [tabParam]);

  const [salesItems, setSalesItems] = useState([]);
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quotation Management State
  const [quotations, setQuotations] = useState(() => {
    try {
      const saved = localStorage.getItem('tenant_quotations');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      const filtered = Array.isArray(parsed) ? parsed.filter(q => !['q1', 'q2', 'q3'].includes(q._id)) : [];
      if (filtered.length !== (parsed ? parsed.length : 0)) {
        localStorage.setItem('tenant_quotations', JSON.stringify(filtered));
      }
      return filtered;
    } catch {
      return [];
    }
  });

  // Barcode Management State
  const [barcodes, setBarcodes] = useState(() => {
    try {
      const saved = localStorage.getItem('tenant_barcodes');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      const filtered = Array.isArray(parsed) ? parsed.filter(b => !['bc1', 'bc2', 'bc3', 'bc4'].includes(b._id)) : [];
      if (filtered.length !== (parsed ? parsed.length : 0)) {
        localStorage.setItem('tenant_barcodes', JSON.stringify(filtered));
      }
      return filtered;
    } catch {
      return [];
    }
  });

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Quotation Modals state
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [viewingQuotation, setViewingQuotation] = useState(null);
  const [convertQuotation, setConvertQuotation] = useState(null);

  // Barcode Modals state
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [printingBarcode, setPrintingBarcode] = useState(null);

  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterDays, setFilterDays] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Form data for Billing & Purchase
  const [formData, setFormData] = useState({ number: '', partyName: '', date: '', amount: '', status: '' });

  // Form data for Quotation
  const [quoteFormData, setQuoteFormData] = useState({
    quoteNo: '',
    customerName: '',
    phone: '',
    email: '',
    items: '',
    quantity: 100,
    unitPrice: 0,
    amount: 0,
    date: new Date().toISOString().substring(0, 10),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    status: 'Draft',
    discount: 0,
    notes: ''
  });

  // Form data for Barcode
  const [barcodeFormData, setBarcodeFormData] = useState({
    code: '',
    name: '',
    offeringType: 'Product',
    sku: '',
    category: '',
    price: '',
    stock: ''
  });

  const saveQuotations = (updated) => {
    setQuotations(updated);
    try {
      localStorage.setItem('tenant_quotations', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const saveBarcodes = (updated) => {
    setBarcodes(updated);
    try {
      localStorage.setItem('tenant_barcodes', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleTabChange = (newType) => {
    setType(newType);
    setSearchParams({ tab: newType.toLowerCase() });
    setCurrentPage(1);
    setSearch('');
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} style={{ opacity: 0.3, marginLeft: '4px' }} />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} style={{ color: 'var(--primary-blue)', marginLeft: '4px' }} /> 
      : <ArrowDown size={14} style={{ color: 'var(--primary-blue)', marginLeft: '4px' }} />;
  };

  const handleOpenAdd = () => {
    if (type === 'Quotation') {
      setEditingQuotation(null);
      const nextNum = `QT-2026-${String(quotations.length + 1).padStart(3, '0')}`;
      setQuoteFormData({
        quoteNo: nextNum,
        customerName: '',
        phone: '',
        email: '',
        items: '',
        quantity: 100,
        unitPrice: 0,
        amount: 0,
        date: new Date().toISOString().substring(0, 10),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        status: 'Draft',
        discount: 0,
        notes: ''
      });
      setShowQuotationModal(true);
      return;
    }

    if (type === 'Barcode') {
      const generatedCode = '8904' + Math.floor(100000000 + Math.random() * 900000000);
      setBarcodeFormData({
        code: generatedCode,
        name: '',
        offeringType: 'Both',
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category: 'General Inventory',
        price: '',
        stock: '50 units'
      });
      setShowBarcodeModal(true);
      return;
    }

    setEditingItem(null);
    setFormData({
      number: '',
      partyName: '',
      date: new Date().toISOString().substring(0, 10),
      amount: '',
      status: type === 'Purchase' ? 'Pending' : 'Paid'
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    if (type === 'Quotation') {
      setEditingQuotation(item);
      setQuoteFormData({ ...item });
      setShowQuotationModal(true);
      return;
    }

    setEditingItem(item);
    setFormData({
      number: item.invoiceNo || item.poNumber || '',
      partyName: item.customerName || item.supplierName || '',
      date: item.date ? (typeof item.date === 'string' ? item.date.substring(0, 10) : new Date(item.date).toISOString().substring(0, 10)) : '',
      amount: item.amount || '',
      status: item.status || (type === 'Purchase' ? 'Pending' : 'Paid')
    });
    setShowModal(true);
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const [salesRes, purchaseRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/sales`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/purchases`, { headers })
      ]);
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setSalesItems(salesData);
      }
      if (purchaseRes.ok) {
        const purchaseData = await purchaseRes.json();
        setPurchaseItems(purchaseData);
      }
    } catch (err) {
      console.error('Error fetching billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Save Billing or Purchase form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const isPurchase = type === 'Purchase';
      const endpoint = isPurchase ? 'purchases' : 'sales';
      const url = editingItem
        ? `${import.meta.env.VITE_API_URL}/api/${endpoint}/${editingItem._id}`
        : `${import.meta.env.VITE_API_URL}/api/${endpoint}`;
      const method = editingItem ? 'PUT' : 'POST';

      const payload = isPurchase
        ? {
            poNumber: formData.number,
            supplierName: formData.partyName,
            date: formData.date,
            amount: Number(formData.amount),
            status: formData.status || 'Pending'
          }
        : {
            invoiceNo: formData.number,
            customerName: formData.partyName,
            date: formData.date,
            amount: Number(formData.amount),
            status: formData.status || 'Paid'
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        setEditingItem(null);
        fetchItems();
      } else {
        alert(editingItem ? 'Failed to update record' : 'Failed to add record');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Quotation
  const handleSaveQuotation = (e) => {
    e.preventDefault();
    const calculatedAmount = (Number(quoteFormData.quantity) || 0) * (Number(quoteFormData.unitPrice) || 0);
    const finalAmount = quoteFormData.discount 
      ? Math.round(calculatedAmount * (1 - Number(quoteFormData.discount) / 100))
      : calculatedAmount;

    if (editingQuotation) {
      const updated = quotations.map(q => q._id === editingQuotation._id ? { ...quoteFormData, amount: finalAmount } : q);
      saveQuotations(updated);
    } else {
      const newQuote = {
        ...quoteFormData,
        _id: 'q_' + Date.now(),
        amount: finalAmount
      };
      saveQuotations([newQuote, ...quotations]);
    }
    setShowQuotationModal(false);
    setEditingQuotation(null);
  };

  // Convert Quotation into a Real Billing Invoice
  const handleConfirmConvert = async () => {
    if (!convertQuotation) return;
    try {
      const token = localStorage.getItem('token');
      const invoicePayload = {
        invoiceNo: `INV-${convertQuotation.quoteNo.replace('QT-', '')}`,
        customerName: convertQuotation.customerName,
        date: new Date().toISOString().substring(0, 10),
        amount: Number(convertQuotation.amount),
        status: 'Paid'
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(invoicePayload)
      });

      if (res.ok) {
        // Mark quotation as Converted
        const updated = quotations.map(q => q._id === convertQuotation._id ? { ...q, status: 'Converted to Invoice' } : q);
        saveQuotations(updated);
        setConvertQuotation(null);
        fetchItems();
        handleTabChange('Sales');
      } else {
        alert('Failed to generate billing invoice from quotation');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Barcode
  const handleSaveBarcode = (e) => {
    e.preventDefault();
    const newBarcode = {
      ...barcodeFormData,
      _id: 'bc_' + Date.now()
    };
    saveBarcodes([newBarcode, ...barcodes]);
    setShowBarcodeModal(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    if (type === 'Quotation') {
      const updated = quotations.filter(q => q._id !== deleteId);
      saveQuotations(updated);
      setDeleteId(null);
      return;
    }

    if (type === 'Barcode') {
      const updated = barcodes.filter(b => b._id !== deleteId);
      saveBarcodes(updated);
      setDeleteId(null);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'Purchase' ? 'purchases' : 'sales';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/${endpoint}/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteId(null);
        fetchItems();
      } else {
        alert('Failed to delete record');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Search handler
  const handleSearchChange = (val) => {
    setSearch(val);
  };

  // Determine active item list
  const activeItems = useMemo(() => {
    if (type === 'Purchase') return purchaseItems;
    if (type === 'Quotation') return quotations;
    if (type === 'Barcode') return barcodes;
    return salesItems;
  }, [type, purchaseItems, quotations, barcodes, salesItems]);

  const filteredItems = useMemo(() => {
    return activeItems
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
        
        if (sortConfig.key === 'number') {
          aVal = a.poNumber || a.invoiceNo || a.quoteNo || a.code || '';
          bVal = b.poNumber || b.invoiceNo || b.quoteNo || b.code || '';
        }
        if (sortConfig.key === 'party') {
          aVal = a.supplierName || a.customerName || a.name || '';
          bVal = b.supplierName || b.customerName || b.name || '';
        }

        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';

        if (sortConfig.key === 'date' || sortConfig.key === 'createdAt') {
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
  }, [activeItems, filterDays, customStartDate, customEndDate, search, sortConfig]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterDays, customStartDate, customEndDate, type, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleExport = () => {
    if (type === 'Quotation') {
      exportToCSV(filteredItems.map(q => ({
        'Quote No': q.quoteNo,
        'Customer Name': q.customerName,
        'Phone': q.phone || 'N/A',
        'Bulk Items': q.items,
        'Quantity': q.quantity,
        'Unit Rate (INR)': q.unitPrice,
        'Total Quoted (INR)': q.amount,
        'Issue Date': formatDate(q.date),
        'Valid Until': formatDate(q.validUntil),
        'Status': q.status,
        'Notes': q.notes || ''
      })), 'Bulk_Quotations');
      return;
    }

    if (type === 'Barcode') {
      exportToCSV(filteredItems.map(b => ({
        'Barcode Number': b.code,
        'Item Name': b.name,
        'Type': b.offeringType,
        'SKU': b.sku,
        'Category': b.category,
        'Price (INR)': b.price,
        'Stock': b.stock
      })), 'Barcode_Inventory_Register');
      return;
    }

    exportToCSV(filteredItems.map(item => ({ 
      ...item, 
      date: formatDate(item.date) 
    })), type === 'Purchase' ? 'Purchases_Billing' : 'Sales_Billing');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1240px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <TrendingUp size={28} color="var(--primary-blue)" /> Billing & Commercial Operations
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
            Mandatory core billing, purchase invoices, bulk order quotations, and barcode asset tracking.
          </p>
          
          {/* Navigation Tabs */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#F1F5F9',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            marginTop: '16px',
            gap: '4px',
            flexWrap: 'wrap'
          }}>
            {/* 1. Billing / Sales Tab */}
            <button
              type="button"
              onClick={() => handleTabChange('Sales')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                background: type === 'Sales' ? 'white' : 'transparent',
                color: type === 'Sales' ? 'var(--primary-blue, #2563EB)' : '#64748B',
                border: 'none',
                boxShadow: type === 'Sales' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <TrendingUp size={15} />
              <span>Billing</span>
              <span style={{
                fontSize: '11px',
                padding: '2px 7px',
                borderRadius: '99px',
                background: type === 'Sales' ? '#EFF6FF' : '#E2E8F0',
                color: type === 'Sales' ? 'var(--primary-blue, #2563EB)' : '#64748B',
                fontWeight: '700'
              }}>
                {salesItems.length}
              </span>
            </button>

            {/* 2. Purchase Tab */}
            <button
              type="button"
              onClick={() => handleTabChange('Purchase')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                background: type === 'Purchase' ? 'white' : 'transparent',
                color: type === 'Purchase' ? 'var(--primary-blue, #2563EB)' : '#64748B',
                border: 'none',
                boxShadow: type === 'Purchase' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <ShoppingCart size={15} />
              <span>Purchase</span>
              <span style={{
                fontSize: '11px',
                padding: '2px 7px',
                borderRadius: '99px',
                background: type === 'Purchase' ? '#EFF6FF' : '#E2E8F0',
                color: type === 'Purchase' ? 'var(--primary-blue, #2563EB)' : '#64748B',
                fontWeight: '700'
              }}>
                {purchaseItems.length}
              </span>
            </button>

            {/* 3. Quotation Tab (Bulk Orders) */}
            <button
              type="button"
              onClick={() => handleTabChange('Quotation')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                background: type === 'Quotation' ? 'white' : 'transparent',
                color: type === 'Quotation' ? '#D97706' : '#64748B',
                border: 'none',
                boxShadow: type === 'Quotation' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <FileText size={15} />
              <span>Quotation (Bulk Orders)</span>
              <span style={{
                fontSize: '11px',
                padding: '2px 7px',
                borderRadius: '99px',
                background: type === 'Quotation' ? '#FEF3C7' : '#E2E8F0',
                color: type === 'Quotation' ? '#B45309' : '#64748B',
                fontWeight: '700'
              }}>
                {quotations.length}
              </span>
            </button>

            {/* 4. Barcode Tab (Always available like Quotation) */}
            <button
              type="button"
              onClick={() => handleTabChange('Barcode')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                background: type === 'Barcode' ? 'white' : 'transparent',
                color: type === 'Barcode' ? '#7C3AED' : '#64748B',
                border: 'none',
                boxShadow: type === 'Barcode' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Barcode size={15} />
              <span>Bar Code</span>
              <span style={{
                fontSize: '11px',
                padding: '2px 7px',
                borderRadius: '99px',
                background: type === 'Barcode' ? '#EDE9FE' : '#E2E8F0',
                color: type === 'Barcode' ? '#6D28D9' : '#64748B',
                fontWeight: '700'
              }}>
                {barcodes.length}
              </span>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleOpenAdd} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '12px 20px', 
            background: type === 'Quotation' ? '#D97706' : (type === 'Barcode' ? '#7C3AED' : 'var(--primary-blue)'), 
            border: 'none', 
            borderRadius: '10px', 
            color: 'white', 
            fontWeight: '600', 
            fontSize: '14px', 
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            transition: 'transform 0.15s ease'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Plus size={18} /> 
          {type === 'Purchase' && 'Add Purchase Order'}
          {type === 'Sales' && 'Add New Invoice'}
          {type === 'Quotation' && 'New Bulk Quotation'}
          {type === 'Barcode' && 'Generate Barcode'}
        </button>
      </div>

      {/* Dynamic Summary Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {type === 'Quotation' ? (
          <>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Bulk Quotations</p>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>{quotations.length}</h3>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IndianRupee size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Quoted Pipeline</p>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>
                  ₹{quotations.reduce((acc, q) => acc + (Number(q.amount) || 0), 0).toLocaleString()}
                </h3>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Approved Quotes</p>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>
                  {quotations.filter(q => q.status === 'Approved').length}
                </h3>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Receipt size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Converted to Invoices</p>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>
                  {quotations.filter(q => q.status === 'Converted to Invoice').length}
                </h3>
              </div>
            </div>
          </>
        ) : type === 'Barcode' ? (
          <>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Barcode size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Barcoded Items</p>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>{barcodes.length}</h3>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Product Tags</p>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>
                  {barcodes.filter(b => b.offeringType === 'Product').length}
                </h3>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FDF4FF', color: '#C026D3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wrench size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Service Packages</p>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>
                  {barcodes.filter(b => b.offeringType === 'Service').length}
                </h3>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Hybrid Offerings</p>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>
                  {barcodes.filter(b => b.offeringType === 'Both').length}
                </h3>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {type === 'Purchase' ? <ShoppingCart size={24} /> : <Receipt size={24} />}
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
                  {type === 'Purchase' ? 'Total Purchases' : 'Total Invoices'}
                </p>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>{activeItems.length}</h3>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IndianRupee size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
                  {type === 'Purchase' ? 'Total Spent' : 'Total Revenue'}
                </p>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>
                  ₹{activeItems.reduce((acc, i) => acc + (Number(i.amount || 0)), 0).toLocaleString()}
                </h3>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Customer Invoices</p>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>{salesItems.length}</h3>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCart size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Purchases</p>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>{purchaseItems.length}</h3>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Control Bar: Search, Date Filter, Export */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: '0 1 300px', minWidth: '240px', position: 'relative' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder={
              type === 'Purchase' ? 'Search purchases...' :
              type === 'Quotation' ? 'Search bulk quotations...' :
              type === 'Barcode' ? 'Search barcodes or SKUs...' : 'Search sales invoices...'
            }
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ width: '100%', padding: '11px 16px 11px 42px', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {type !== 'Barcode' && (
            <select 
              value={filterDays} 
              onChange={(e) => setFilterDays(e.target.value)} 
              style={{ padding: '10px 14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontWeight: '500', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">Filter: All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          )}

          {filterDays === 'custom' && type !== 'Barcode' && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', fontSize: '13px' }} />
              <span style={{ fontSize: '13px', color: '#64748B' }}>to</span>
              <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', fontSize: '13px' }} />
            </div>
          )}
          
          <button 
            type="button" 
            onClick={handleExport} 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          
          {/* VIEW A: QUOTATION TABLE */}
          {type === 'Quotation' ? (
            <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '50px' }}>S.No</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Quote #</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Client / Buyer</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Bulk Order Items & Qty</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Estimated (₹)</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Validity</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
                      <FileText size={36} color="#CBD5E1" style={{ margin: '0 auto 12px auto' }} />
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0F172A' }}>No bulk quotations found</h4>
                      <p style={{ margin: 0, fontSize: '13px' }}>Click "+ New Bulk Quotation" above to draft a bulk price estimate.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((quote, idx) => (
                    <tr key={quote._id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.15s' }}>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#475569', fontWeight: '500' }}>{startIndex + idx + 1}</td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '700', color: '#2563EB' }}>{quote.quoteNo}</td>
                      <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                        <div style={{ fontWeight: '600', color: '#0F172A' }}>{quote.customerName}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>{quote.phone || quote.email}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#334155' }}>
                        <div style={{ fontWeight: '500' }}>{quote.items}</div>
                        <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                          Qty: {quote.quantity} units @ ₹{quote.unitPrice}/unit
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>
                        ₹{Number(quote.amount).toLocaleString()}
                        {quote.discount > 0 && (
                          <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: '600' }}>{quote.discount}% volume discount</div>
                        )}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748B' }}>
                        <div>Issued: {formatDate(quote.date)}</div>
                        <div style={{ fontSize: '12px', color: '#D97706', fontWeight: '500' }}>Valid till: {formatDate(quote.validUntil)}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '700',
                          display: 'inline-block',
                          background: quote.status === 'Approved' ? '#DCFCE7' : quote.status === 'Converted to Invoice' ? '#EFF6FF' : quote.status === 'Sent' ? '#FEF3C7' : '#F1F5F9',
                          color: quote.status === 'Approved' ? '#15803D' : quote.status === 'Converted to Invoice' ? '#1D4ED8' : quote.status === 'Sent' ? '#B45309' : '#475569'
                        }}>
                          {quote.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          {quote.status !== 'Converted to Invoice' && (
                            <button 
                              type="button" 
                              onClick={() => setConvertQuotation(quote)}
                              title="Convert to Live Invoice" 
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                            >
                              <Check size={13} /> Bill
                            </button>
                          )}
                          <button onClick={() => setViewingQuotation(quote)} title="View Preview" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Eye size={15} /></button>
                          <button onClick={() => handleEdit(quote)} title="Edit Quote" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#FEF3C7', color: '#B45309', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Pencil size={14} /></button>
                          <button onClick={() => setDeleteId(quote._id)} title="Delete Quote" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : type === 'Barcode' ? (
            /* VIEW B: BARCODE TABLE */
            <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '50px' }}>S.No</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Offering / Item Name</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Scope</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>SKU Code</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Barcode Scannable</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Unit Price (₹)</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Availability</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
                      <Barcode size={36} color="#CBD5E1" style={{ margin: '0 auto 12px auto' }} />
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0F172A' }}>No barcoded inventory registered</h4>
                      <p style={{ margin: 0, fontSize: '13px' }}>Click "+ Generate Barcode" above to create barcode stickers for products and services.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item, idx) => (
                    <tr key={item._id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.15s' }}>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#475569', fontWeight: '500' }}>{startIndex + idx + 1}</td>
                      <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                        <div style={{ fontWeight: '700', color: '#0F172A' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>{item.category}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: item.offeringType === 'Service' ? '#FDF4FF' : item.offeringType === 'Product' ? '#EFF6FF' : '#F0FDF4',
                          color: item.offeringType === 'Service' ? '#C026D3' : item.offeringType === 'Product' ? '#2563EB' : '#16A34A',
                          border: `1px solid ${item.offeringType === 'Service' ? '#F5D0FE' : item.offeringType === 'Product' ? '#BFDBFE' : '#BBF7D0'}`
                        }}>
                          {item.offeringType === 'Service' ? '🛠️ Service' : item.offeringType === 'Product' ? '📦 Product' : '🔄 Both Hybrid'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#475569', fontFamily: 'monospace' }}>
                        {item.sku}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <BarcodeSVG code={item.code} width={150} height={44} showText={true} />
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>
                        ₹{Number(item.price).toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748B' }}>
                        {item.stock}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button 
                            type="button" 
                            onClick={() => setPrintingBarcode(item)}
                            title="Print Barcode Labels" 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#EDE9FE', color: '#6D28D9', border: '1px solid #DDD6FE', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            <Printer size={13} /> Print Label
                          </button>
                          <button onClick={() => setDeleteId(item._id)} title="Delete" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            /* VIEW C: STANDARD BILLING / PURCHASES TABLE */
            <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '60px' }}>S.No</th>
                  <th onClick={() => requestSort('number')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {type === 'Purchase' ? 'PO Number' : 'InvoiceNo'} {renderSortIcon('number')}
                    </div>
                  </th>
                  <th onClick={() => requestSort('party')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {type === 'Purchase' ? 'Supplier Name' : 'CustomerName'} {renderSortIcon('party')}
                    </div>
                  </th>
                  <th onClick={() => requestSort('date')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Date {renderSortIcon('date')}</div>
                  </th>
                  <th onClick={() => requestSort('amount')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Amount (₹) {renderSortIcon('amount')}</div>
                  </th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>Loading records...</td></tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '48px 20px', color: '#94A3B8' }}>
                      {type === 'Purchase' ? (
                        <ShoppingCart size={40} style={{ opacity: 0.3, marginBottom: '10px', display: 'inline-block' }} />
                      ) : (
                        <TrendingUp size={40} style={{ opacity: 0.3, marginBottom: '10px', display: 'inline-block' }} />
                      )}
                      <h4 style={{ margin: '0 0 6px 0', color: '#334155', fontSize: '16px', fontWeight: '700' }}>
                        No {type === 'Purchase' ? 'Purchases' : 'Billing Invoices'} Found
                      </h4>
                      <p style={{ margin: 0, fontSize: '13.5px' }}>
                        {type === 'Purchase' ? 'Record a purchase order to stock your inventory.' : 'Create customer sales bills and invoices to record transactions.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item, index) => (
                    <tr key={item._id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                      <td style={{ padding: '16px 24px', fontSize: '15px', color: '#475569', fontWeight: '500' }}>{startIndex + index + 1}</td>
                      <td style={{ padding: '16px 24px', color: '#475569', fontSize: '14px', fontWeight: '600' }}>{item.invoiceNo || item.poNumber}</td>
                      <td style={{ padding: '16px 24px', color: '#475569', fontSize: '14px' }}>{item.customerName || item.supplierName}</td>
                      <td style={{ padding: '16px 24px', color: '#475569', fontSize: '14px', whiteSpace: 'nowrap' }}>{formatDate(item.date)}</td>
                      <td style={{ padding: '16px 24px', color: '#0F172A', fontSize: '14px', fontWeight: '600' }}>₹{Number(item.amount).toLocaleString()}</td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button onClick={() => setViewItem(item)} title="View" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#EFF6FF', color: '#3B82F6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Eye size={16} /></button>
                          <button onClick={() => handleEdit(item)} title="Edit" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Pencil size={15} /></button>
                          <button onClick={() => setDeleteId(item._id)} title="Delete" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

        </div>

        <TablePagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalItems={filteredItems.length}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          itemName={type === 'Quotation' ? 'quotations' : type === 'Barcode' ? 'barcodes' : 'records'}
        />
      </div>

      {/* MODAL 1: ADD/EDIT BILLING OR PURCHASE */}
      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                {editingItem ? 'Edit' : 'Add New'} {type === 'Purchase' ? 'Purchase Order' : 'Billing Invoice'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingItem(null); }} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>
                  {type === 'Purchase' ? 'PO Number' : 'Invoice Number'}
                </label>
                <input
                  placeholder={type === 'Purchase' ? 'e.g. PO-1001' : 'e.g. INV-1001'}
                  type="text"
                  value={formData.number}
                  onChange={e => setFormData({ ...formData, number: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>
                  {type === 'Purchase' ? 'Supplier Name' : 'Customer Name'}
                </label>
                <input
                  placeholder={type === 'Purchase' ? 'Enter supplier name' : 'Enter customer name'}
                  type="text"
                  value={formData.partyName}
                  onChange={e => setFormData({ ...formData, partyName: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Amount (₹)</label>
                <input
                  placeholder="Enter the amount (₹)"
                  type="number"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', color: '#0F172A', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingItem(null); }} style={{ flex: 1, padding: '14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '14px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>{editingItem ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

      {/* MODAL 2: ADD/EDIT BULK QUOTATION */}
      {showQuotationModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
                  {editingQuotation ? 'Edit Bulk Quotation' : 'Create New Bulk Quotation'}
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Issue price estimates and commercial terms for bulk customer orders.
                </p>
              </div>
              <button onClick={() => { setShowQuotationModal(false); setEditingQuotation(null); }} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveQuotation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Quote Number *</label>
                  <input
                    type="text"
                    required
                    value={quoteFormData.quoteNo}
                    onChange={e => setQuoteFormData({ ...quoteFormData, quoteNo: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Client / Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Global Corp"
                    value={quoteFormData.customerName}
                    onChange={e => setQuoteFormData({ ...quoteFormData, customerName: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={quoteFormData.phone}
                    onChange={e => setQuoteFormData({ ...quoteFormData, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Contact Email</label>
                  <input
                    type="email"
                    placeholder="e.g. buyer@company.com"
                    value={quoteFormData.email}
                    onChange={e => setQuoteFormData({ ...quoteFormData, email: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Bulk Items Description *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Specify items, grades, technical specifications, and packaging..."
                  value={quoteFormData.items}
                  onChange={e => setQuoteFormData({ ...quoteFormData, items: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quoteFormData.quantity}
                    onChange={e => setQuoteFormData({ ...quoteFormData, quantity: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Unit Rate (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quoteFormData.unitPrice}
                    onChange={e => setQuoteFormData({ ...quoteFormData, unitPrice: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Volume Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quoteFormData.discount}
                    onChange={e => setQuoteFormData({ ...quoteFormData, discount: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Total Estimated Quote Value:</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#16A34A' }}>
                  ₹{(Math.round((Number(quoteFormData.quantity) || 0) * (Number(quoteFormData.unitPrice) || 0) * (1 - (Number(quoteFormData.discount) || 0) / 100))).toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Issue Date</label>
                  <input
                    type="date"
                    value={quoteFormData.date}
                    onChange={e => setQuoteFormData({ ...quoteFormData, date: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Valid Until</label>
                  <input
                    type="date"
                    value={quoteFormData.validUntil}
                    onChange={e => setQuoteFormData({ ...quoteFormData, validUntil: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Commercial Terms & Notes</label>
                <input
                  type="text"
                  placeholder="e.g. 50% advance, balance upon delivery. Valid 30 days."
                  value={quoteFormData.notes}
                  onChange={e => setQuoteFormData({ ...quoteFormData, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '14px', marginTop: '12px' }}>
                <button type="button" onClick={() => { setShowQuotationModal(false); setEditingQuotation(null); }} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#D97706', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                  {editingQuotation ? 'Save Changes' : 'Create Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

      {/* MODAL 3: VIEW / PRINT FORMAL QUOTATION */}
      {viewingQuotation && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '36px', borderRadius: '20px', width: '100%', maxWidth: '640px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #F1F5F9', paddingBottom: '20px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#D97706', background: '#FEF3C7', padding: '3px 10px', borderRadius: '14px', textTransform: 'uppercase' }}>Commercial Bulk Estimate</span>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: '8px 0 2px 0' }}>{viewingQuotation.quoteNo}</h2>
                <div style={{ fontSize: '13px', color: '#64748B' }}>Issued on: {formatDate(viewingQuotation.date)} • Valid till: {formatDate(viewingQuotation.validUntil)}</div>
              </div>
              <button onClick={() => setViewingQuotation(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Client / Buyer</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>{viewingQuotation.customerName}</div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{viewingQuotation.phone || 'Phone: N/A'}</div>
                <div style={{ fontSize: '13px', color: '#64748B' }}>{viewingQuotation.email || 'Email: N/A'}</div>
              </div>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Quotation Status</div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: viewingQuotation.status === 'Approved' ? '#16A34A' : '#D97706' }}>
                  {viewingQuotation.status}
                </span>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
                  {viewingQuotation.notes || 'Standard volume order terms apply.'}
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <tr>
                    <th style={{ padding: '10px 14px', color: '#64748B' }}>Description</th>
                    <th style={{ padding: '10px 14px', color: '#64748B', textAlign: 'center' }}>Quantity</th>
                    <th style={{ padding: '10px 14px', color: '#64748B', textAlign: 'right' }}>Unit Rate</th>
                    <th style={{ padding: '10px 14px', color: '#64748B', textAlign: 'right' }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '14px', fontWeight: '600', color: '#0F172A' }}>{viewingQuotation.items}</td>
                    <td style={{ padding: '14px', textAlign: 'center', color: '#475569' }}>{viewingQuotation.quantity}</td>
                    <td style={{ padding: '14px', textAlign: 'right', color: '#475569' }}>₹{Number(viewingQuotation.unitPrice).toLocaleString()}</td>
                    <td style={{ padding: '14px', textAlign: 'right', fontWeight: '700', color: '#0F172A' }}>₹{Number(viewingQuotation.amount).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <button 
                type="button" 
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#334155', fontWeight: '700', cursor: 'pointer' }}
              >
                <Printer size={16} /> Print Quotation
              </button>
              {viewingQuotation.status !== 'Converted to Invoice' && (
                <button 
                  type="button" 
                  onClick={() => {
                    setViewingQuotation(null);
                    setConvertQuotation(viewingQuotation);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#16A34A', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 10px rgba(22,163,74,0.25)' }}
                >
                  <Check size={16} /> Convert to Live Invoice
                </button>
              )}
            </div>
          </div>
        </div>, document.body
      )}

      {/* MODAL 4: CONVERT QUOTATION TO INVOICE CONFIRMATION */}
      {convertQuotation && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '440px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px auto' }}>
              <CheckCircle2 size={32} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0' }}>
              Convert Quotation to Invoice
            </h2>
            <p style={{ color: '#64748B', fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              Convert <strong>{convertQuotation.quoteNo}</strong> for <strong>{convertQuotation.customerName}</strong> into an official billing invoice of <strong>₹{Number(convertQuotation.amount).toLocaleString()}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setConvertQuotation(null)} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleConfirmConvert} style={{ flex: 1.4, padding: '12px', background: '#16A34A', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 10px rgba(22,163,74,0.25)' }}>
                Confirm & Bill
              </button>
            </div>
          </div>
        </div>, document.body
      )}

      {/* MODAL 5: ADD / GENERATE BARCODE */}
      {showBarcodeModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '520px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
                  Generate Barcode & Tag Asset
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Create standard barcode labels for physical products or service bundles.
                </p>
              </div>
              <button onClick={() => setShowBarcodeModal(false)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveBarcode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Item Scope</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['Product', 'Service', 'Both'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setBarcodeFormData({ ...barcodeFormData, offeringType: opt })}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '8px',
                        border: barcodeFormData.offeringType === opt ? '2px solid #7C3AED' : '1px solid #CBD5E1',
                        background: barcodeFormData.offeringType === opt ? '#EDE9FE' : '#FFFFFF',
                        color: barcodeFormData.offeringType === opt ? '#6D28D9' : '#475569',
                        fontWeight: '700',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {opt === 'Product' ? '📦 Product' : opt === 'Service' ? '🛠️ Service' : '🔄 Both Hybrid'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Item / Package Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Industrial Sealant Cartridge 500ml"
                  value={barcodeFormData.name}
                  onChange={e => setBarcodeFormData({ ...barcodeFormData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={barcodeFormData.sku}
                    onChange={e => setBarcodeFormData({ ...barcodeFormData, sku: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Retail Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 850"
                    value={barcodeFormData.price}
                    onChange={e => setBarcodeFormData({ ...barcodeFormData, price: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Barcode Number (EAN / Code-128)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    required
                    value={barcodeFormData.code}
                    onChange={e => setBarcodeFormData({ ...barcodeFormData, code: e.target.value })}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', fontFamily: 'monospace', fontWeight: '700', letterSpacing: '1px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setBarcodeFormData({ ...barcodeFormData, code: '8904' + Math.floor(100000000 + Math.random() * 900000000) })}
                    style={{ padding: '8px 14px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Randomize
                  </button>
                </div>
              </div>

              {/* Live Preview */}
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Live Barcode Preview</div>
                <BarcodeSVG code={barcodeFormData.code} width={200} height={52} showText={true} />
              </div>

              <div style={{ display: 'flex', gap: '14px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowBarcodeModal(false)} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#7C3AED', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                  Save & Tag
                </button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

      {/* MODAL 6: PRINTABLE THERMAL BARCODE LABELS SHEET */}
      {printingBarcode && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '480px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Print Barcode Stickers
              </h2>
              <button onClick={() => setPrintingBarcode(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            {/* Sticker Graphic Preview (Thermal 50mm x 25mm style) */}
            <div style={{
              background: '#FFFFFF',
              border: '2px dashed #94A3B8',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                BIZ-TECH ENTERPRISE
              </div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                {printingBarcode.name}
              </div>
              <BarcodeSVG code={printingBarcode.code} width={220} height={54} showText={true} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                <span>SKU: {printingBarcode.sku}</span>
                <span style={{ color: '#16A34A', fontSize: '14px' }}>MRP: ₹{Number(printingBarcode.price).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setPrintingBarcode(null)} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Close</button>
              <button 
                type="button" 
                onClick={() => window.print()} 
                style={{ flex: 1.5, padding: '12px', background: '#7C3AED', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Printer size={16} /> Print Thermal Stickers
              </button>
            </div>
          </div>
        </div>, document.body
      )}

      {/* MODAL 7: VIEW BILLING / PURCHASE RECORD */}
      {viewItem && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                {type === 'Purchase' ? 'Purchase Order Details' : 'Billing Invoice Details'}
              </h2>
              <button onClick={() => setViewItem(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
                  {type === 'Purchase' ? 'PO Number' : 'Invoice Number'}
                </p>
                <p style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '600' }}>{viewItem.invoiceNo || viewItem.poNumber}</p>
              </div>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
                  {type === 'Purchase' ? 'Supplier Name' : 'Customer Name'}
                </p>
                <p style={{ margin: 0, fontSize: '16px', color: '#0F172A' }}>{viewItem.customerName || viewItem.supplierName}</p>
              </div>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Date</p>
                <p style={{ margin: 0, fontSize: '16px', color: '#0F172A' }}>{formatDate(viewItem.date)}</p>
              </div>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Amount</p>
                <p style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: '700' }}>₹{Number(viewItem.amount).toLocaleString()}</p>
              </div>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Status</p>
                <p style={{ margin: 0, fontSize: '16px', color: '#0F172A' }}>{viewItem.status || (type === 'Purchase' ? 'Pending' : 'Paid')}</p>
              </div>
            </div>
          </div>
        </div>, document.body
      )}

      {/* MODAL 8: DELETE CONFIRMATION */}
      {deleteId && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <AlertTriangle size={32} color="#EF4444" />
            </div>
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

export default Sales;
