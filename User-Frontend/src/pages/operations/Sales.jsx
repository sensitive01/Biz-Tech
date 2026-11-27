import { exportToCSV } from '@/utils/exportToCSV';
import { formatDate } from '@/utils/formatDate';
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft,
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
  Receipt,
  Barcode,
  FileText,
  CheckCircle2,
  Printer,
  Sparkles,
  Package,
  Wrench,
  Check,
  User,
  UserPlus,
  Clock,
  ShoppingCart
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

const Sales = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  // Retrieve current user and business offering group from localStorage
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  // Commercial offering groups:
  // Group 1: 'product' -> Only Product Billing
  // Group 2: 'service' -> Only Service Billing
  // Group 3: 'both'    -> Both Product & Service Billing
  const offeringType = useMemo(() => {
    const raw = String(storedUser?.businessOfferingType || storedUser?.offeringType || '').toLowerCase();
    if (raw === 'service') return 'service';
    if (raw === 'both') return 'both';
    return 'product'; // Default Group 1
  }, [storedUser]);

  const isProductEnabled = offeringType === 'product' || offeringType === 'both';
  const isServiceEnabled = offeringType === 'service' || offeringType === 'both';

  // Active Tab: 'Product', 'Service', 'Quotation', 'Barcode'
  const initialType = useMemo(() => {
    if (tabParam === 'service' && isServiceEnabled) return 'Service';
    if (tabParam === 'quotation') return 'Quotation';
    if (tabParam === 'barcode') return 'Barcode';
    if (tabParam === 'product' && isProductEnabled) return 'Product';
    return isProductEnabled ? 'Product' : 'Service';
  }, [tabParam, isProductEnabled, isServiceEnabled]);

  const [type, setType] = useState(initialType);

  // Synchronize active tab with URL query parameter
  useEffect(() => {
    if (tabParam === 'service' && isServiceEnabled) setType('Service');
    else if (tabParam === 'product' && isProductEnabled) setType('Product');
    else if (tabParam === 'quotation') setType('Quotation');
    else if (tabParam === 'barcode') setType('Barcode');
    else if (!tabParam) {
      setType(isProductEnabled ? 'Product' : 'Service');
    }
  }, [tabParam, isProductEnabled, isServiceEnabled]);

  const [salesItems, setSalesItems] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
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

  // ----------------------------------------------------
  // INVOICE CREATION STATE (Product & Service Billing)
  // ----------------------------------------------------
  const [customerMode, setCustomerMode] = useState('walkin'); // 'walkin' | 'existing' | 'new'
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const [invoiceHeader, setInvoiceHeader] = useState({
    invoiceNo: '',
    date: new Date().toISOString().substring(0, 10),
    status: 'Paid',
    notes: ''
  });

  // Line items for the invoice: [{ productId, name, quantity, unit, unitPrice, amount }]
  const [lineItems, setLineItems] = useState([]);

  // Step 2: Product Picker State
  const [pickerProdId, setPickerProdId] = useState('');
  const [pickerQty, setPickerQty] = useState(1);
  const [pickerPrice, setPickerPrice] = useState(0);

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

  // Available catalog filtered by active tab
  const availableCatalog = useMemo(() => {
    if (type === 'Service') {
      return productsList.filter(p => (p.itemType || '').toLowerCase() === 'service');
    }
    return productsList.filter(p => (p.itemType || 'Product').toLowerCase() !== 'service');
  }, [productsList, type]);

  // Open Add Modal
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
        offeringType: 'Product',
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category: 'General Inventory',
        price: '',
        stock: '50 units'
      });
      setShowBarcodeModal(true);
      return;
    }

    // Product or Service Invoice
    setEditingItem(null);
    setCustomerMode(customersList.length > 0 ? 'existing' : 'new');
    setSelectedCustomerId(customersList[0]?._id || '');
    setNewCustomer({ name: '', phone: '', email: '', address: '' });
    
    // Auto-generate invoice number: INV-YEAR-XXX
    const nextInvoiceCount = salesItems.length + 1;
    const prefix = type === 'Service' ? 'SRV' : 'INV';
    const autoInvNo = `${prefix}-${new Date().getFullYear()}-${String(nextInvoiceCount).padStart(3, '0')}`;
    
    setInvoiceHeader({
      invoiceNo: autoInvNo,
      date: new Date().toISOString().substring(0, 10),
      status: 'Paid',
      notes: ''
    });

    // Initialize product picker
    const firstProduct = availableCatalog[0];
    if (firstProduct) {
      setPickerProdId(firstProduct._id);
      setPickerQty(1);
      setPickerPrice(Number(firstProduct.price) || 0);
    } else {
      setPickerProdId('');
      setPickerQty(1);
      setPickerPrice(0);
    }
    // Cart starts clean for new selection
    setLineItems([]);

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
    // Find customer if exists
    const matchedCustomer = customersList.find(c => c._id === item.customerId || c.name === item.customerName);
    if (matchedCustomer) {
      setCustomerMode('existing');
      setSelectedCustomerId(matchedCustomer._id);
    } else {
      setCustomerMode('new');
      setNewCustomer({
        name: item.customerName || '',
        phone: item.customerPhone || '',
        email: item.customerEmail || '',
        address: item.customerAddress || ''
      });
    }

    setInvoiceHeader({
      invoiceNo: item.invoiceNo || '',
      date: item.date ? (typeof item.date === 'string' ? item.date.substring(0, 10) : new Date(item.date).toISOString().substring(0, 10)) : new Date().toISOString().substring(0, 10),
      status: item.status || 'Paid',
      notes: item.notes || ''
    });

    if (Array.isArray(item.items) && item.items.length > 0) {
      setLineItems(item.items.map(it => ({
        productId: it.productId || '',
        name: it.name || '',
        quantity: Number(it.quantity) || 1,
        unit: it.unit || 'pcs',
        unitPrice: Number(it.unitPrice) || 0,
        amount: Number(it.amount) || ((Number(it.quantity) || 1) * (Number(it.unitPrice) || 0))
      })));
    } else {
      setLineItems([{
        productId: '',
        name: item.itemsSummary || 'Item',
        quantity: 1,
        unit: 'pcs',
        unitPrice: Number(item.amount) || 0,
        amount: Number(item.amount) || 0
      }]);
    }

    setShowModal(true);
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const [salesRes, customersRes, productsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/sales`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/customers`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/products`, { headers })
      ]);
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setSalesItems(salesData);
      }
      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomersList(customersData);
      }
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProductsList(productsData);
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

  // Handle sellItem query param (e.g. from Products table "Sell" button)
  useEffect(() => {
    const sellItemId = searchParams.get('sellItem');
    if (sellItemId && productsList.length > 0) {
      const matched = productsList.find(p => p._id === sellItemId);
      if (matched) {
        setEditingItem(null);
        setCustomerMode('walkin');
        const nextInvoiceCount = salesItems.length + 1;
        const prefix = (matched.itemType || '').toLowerCase() === 'service' ? 'SRV' : 'INV';
        setInvoiceHeader({
          invoiceNo: `${prefix}-${new Date().getFullYear()}-${String(nextInvoiceCount).padStart(3, '0')}`,
          date: new Date().toISOString().substring(0, 10),
          status: 'Paid',
          notes: ''
        });
        setLineItems([{
          productId: matched._id,
          name: matched.name,
          quantity: 1,
          unit: matched.unit || 'pcs',
          unitPrice: Number(matched.price) || 0,
          amount: Number(matched.price) || 0
        }]);
        setShowModal(true);
      }
    }
  }, [searchParams, productsList]);

  // Update line item details when product selected or quantity changed
  const handleProductSelect = (index, prodId) => {
    const selectedProd = productsList.find(p => p._id === prodId);
    const updated = [...lineItems];
    if (selectedProd) {
      const qty = Number(updated[index].quantity) > 0 ? Number(updated[index].quantity) : 1;
      const rate = Number(selectedProd.price) || 0;
      updated[index] = {
        ...updated[index],
        productId: selectedProd._id,
        name: selectedProd.name,
        unit: selectedProd.unit || 'pcs',
        unitPrice: rate,
        amount: Math.round(qty * rate * 100) / 100
      };
    } else {
      updated[index] = {
        ...updated[index],
        productId: '',
        name: '',
        unit: 'pcs',
        unitPrice: 0,
        amount: 0
      };
    }
    setLineItems(updated);
  };

  const handleQuantityChange = (index, newQty) => {
    const updated = [...lineItems];
    const rate = Number(updated[index].unitPrice) || 0;
    const numVal = newQty === '' ? '' : Math.max(0, Number(newQty));
    const effectiveQty = typeof numVal === 'number' ? numVal : 0;
    updated[index] = {
      ...updated[index],
      quantity: newQty,
      amount: Math.round(effectiveQty * rate * 100) / 100
    };
    setLineItems(updated);
  };

  const adjustQuantity = (index, delta) => {
    const updated = [...lineItems];
    const currentQty = Number(updated[index].quantity) || 0;
    const newQty = Math.max(1, currentQty + delta);
    const rate = Number(updated[index].unitPrice) || 0;
    updated[index] = {
      ...updated[index],
      quantity: newQty,
      amount: Math.round(newQty * rate * 100) / 100
    };
    setLineItems(updated);
  };

  const handleUnitPriceChange = (index, newRate) => {
    const updated = [...lineItems];
    const qty = Number(updated[index].quantity) || 0;
    const numRate = newRate === '' ? '' : Math.max(0, Number(newRate));
    const effectiveRate = typeof numRate === 'number' ? numRate : 0;
    updated[index] = {
      ...updated[index],
      unitPrice: newRate,
      amount: Math.round(qty * effectiveRate * 100) / 100
    };
    setLineItems(updated);
  };

  // Selected product object from Step 2 picker
  const selectedPickerProd = useMemo(() => {
    return productsList.find(p => p._id === pickerProdId) || null;
  }, [productsList, pickerProdId]);

  const handlePickerProductChange = (prodId) => {
    setPickerProdId(prodId);
    const found = productsList.find(p => p._id === prodId);
    if (found) {
      setPickerPrice(Number(found.price) || 0);
    }
  };

  const handleAddToCartFromPicker = () => {
    if (!pickerProdId) {
      alert(`Please select a ${type.toLowerCase()} from the dropdown first.`);
      return;
    }
    const found = productsList.find(p => p._id === pickerProdId);
    if (!found) return;

    const qty = Number(pickerQty) > 0 ? Number(pickerQty) : 1;
    const price = Number(pickerPrice) >= 0 ? Number(pickerPrice) : (Number(found.price) || 0);

    setLineItems(prev => {
      const existingIdx = prev.findIndex(item => item.productId === found._id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = (Number(updated[existingIdx].quantity) || 0) + qty;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          unitPrice: price,
          amount: Math.round(newQty * price * 100) / 100
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: found._id,
            name: found.name,
            quantity: qty,
            unit: found.unit || 'pcs',
            unitPrice: price,
            amount: Math.round(qty * price * 100) / 100
          }
        ];
      }
    });

    setPickerQty(1);
  };

  const quickAddProductToCart = (prod) => {
    const price = Number(prod.price) || 0;
    setLineItems(prev => {
      const existingIdx = prev.findIndex(item => item.productId === prod._id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = (Number(updated[existingIdx].quantity) || 0) + 1;
        const effectivePrice = Number(updated[existingIdx].unitPrice) || price;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          amount: Math.round(newQty * effectivePrice * 100) / 100
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: prod._id,
            name: prod.name,
            quantity: 1,
            unit: prod.unit || 'pcs',
            unitPrice: price,
            amount: price
          }
        ];
      }
    });
  };

  const addLineItem = () => {
    const defaultProd = availableCatalog[0];
    if (defaultProd) {
      setLineItems(prev => [
        ...prev,
        {
          productId: defaultProd._id,
          name: defaultProd.name,
          quantity: 1,
          unit: defaultProd.unit || 'pcs',
          unitPrice: Number(defaultProd.price) || 0,
          amount: Number(defaultProd.price) || 0
        }
      ]);
    } else {
      setLineItems(prev => [
        ...prev,
        { productId: '', name: '', quantity: 1, unit: 'pcs', unitPrice: 0, amount: 0 }
      ]);
    }
  };

  const removeLineItem = (index) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  // Total Billing Amount calculation
  const totalBillingAmount = useMemo(() => {
    return lineItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  }, [lineItems]);

  // Save Product or Service Invoice
  const handleSubmitInvoice = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      let finalCustomerId = selectedCustomerId;
      let finalCustomerName = '';
      let finalCustomerPhone = '';
      let finalCustomerEmail = '';
      let finalCustomerAddress = '';

      // 1. Process customer
      if (customerMode === 'walkin') {
        finalCustomerName = 'Walk-in Customer';
      } else if (customerMode === 'new') {
        if (!newCustomer.name.trim()) {
          alert('Please enter a Customer Name.');
          return;
        }

        const custRes = await fetch(`${import.meta.env.VITE_API_URL}/api/customers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            name: newCustomer.name.trim(),
            phone: newCustomer.phone.trim(),
            email: newCustomer.email.trim(),
            address: newCustomer.address.trim(),
            customerType: 'Retail'
          })
        });

        if (custRes.ok) {
          const savedCustomer = await custRes.json();
          finalCustomerId = savedCustomer._id;
          finalCustomerName = savedCustomer.name;
          finalCustomerPhone = savedCustomer.phone;
          finalCustomerEmail = savedCustomer.email;
          finalCustomerAddress = savedCustomer.address;
          setCustomersList(prev => [savedCustomer, ...prev]);
        } else {
          finalCustomerName = newCustomer.name.trim();
          finalCustomerPhone = newCustomer.phone.trim();
          finalCustomerEmail = newCustomer.email.trim();
          finalCustomerAddress = newCustomer.address.trim();
        }
      } else {
        const found = customersList.find(c => c._id === selectedCustomerId);
        if (!found) {
          alert('Please select an existing customer or switch to "Walk-in Customer".');
          return;
        }
        finalCustomerId = found._id;
        finalCustomerName = found.name;
        finalCustomerPhone = found.phone || '';
        finalCustomerEmail = found.email || '';
        finalCustomerAddress = found.address || '';
      }

      // 2. Validate line items
      const validItems = lineItems
        .filter(it => it.name && it.name.trim())
        .map(it => {
          const qty = Number(it.quantity) > 0 ? Number(it.quantity) : 1;
          const rate = Number(it.unitPrice) || 0;
          return {
            ...it,
            quantity: qty,
            unitPrice: rate,
            amount: Math.round(qty * rate * 100) / 100
          };
        });

      if (validItems.length === 0) {
        alert(type === 'Service' ? 'Please add at least one service to the billing cart before submitting.' : 'Please add at least one product to the billing cart before submitting.');
        return;
      }

      // 3. Prepare Invoice Payload
      const billingCategory = type === 'Service' ? 'Service' : 'Product';
      const payload = {
        invoiceNo: invoiceHeader.invoiceNo.trim(),
        customerName: finalCustomerName,
        customerId: finalCustomerId,
        customerPhone: finalCustomerPhone,
        customerEmail: finalCustomerEmail,
        customerAddress: finalCustomerAddress,
        billingType: billingCategory,
        date: invoiceHeader.date,
        items: validItems,
        amount: totalBillingAmount,
        status: invoiceHeader.status || 'Paid',
        notes: invoiceHeader.notes
      };

      const url = editingItem
        ? `${import.meta.env.VITE_API_URL}/api/sales/${editingItem._id}`
        : `${import.meta.env.VITE_API_URL}/api/sales`;
      const method = editingItem ? 'PUT' : 'POST';

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
        alert(editingItem ? 'Failed to update invoice.' : 'Failed to create invoice.');
      }
    } catch (err) {
      console.error('Error saving invoice:', err);
      alert('An error occurred while saving the invoice.');
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
      const newEntry = {
        ...quoteFormData,
        _id: 'qt_' + Date.now(),
        amount: finalAmount,
        createdAt: new Date().toISOString()
      };
      saveQuotations([newEntry, ...quotations]);
    }
    setShowQuotationModal(false);
    setEditingQuotation(null);
  };

  // Convert Quotation to Invoice
  const handleConvertQuotation = async (quote) => {
    try {
      const token = localStorage.getItem('token');
      const invoicePayload = {
        invoiceNo: `INV-${quote.quoteNo.replace('QT-', '')}`,
        customerName: quote.customerName,
        customerPhone: quote.phone,
        customerEmail: quote.email,
        date: new Date().toISOString().substring(0, 10),
        amount: Number(quote.amount) || 0,
        billingType: isProductEnabled ? 'Product' : 'Service',
        status: 'Paid',
        items: [{
          name: quote.items || 'Bulk Order Items',
          quantity: Number(quote.quantity) || 1,
          unit: 'pcs',
          unitPrice: Number(quote.unitPrice) || 0,
          amount: Number(quote.amount) || 0
        }],
        notes: quote.notes || ''
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(invoicePayload)
      });

      if (res.ok) {
        const updatedQuotes = quotations.map(q => q._id === quote._id ? { ...q, status: 'Converted to Invoice' } : q);
        saveQuotations(updatedQuotes);
        setConvertQuotation(null);
        setType(isProductEnabled ? 'Product' : 'Service');
        fetchItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Barcode
  const handleSaveBarcode = (e) => {
    e.preventDefault();
    const newEntry = {
      ...barcodeFormData,
      _id: 'bc_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    saveBarcodes([newEntry, ...barcodes]);
    setShowBarcodeModal(false);
  };

  // Delete Record
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sales/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteId(null);
        fetchItems();
      } else {
        alert('Failed to delete invoice');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Search handler
  const handleSearchChange = (val) => {
    setSearch(val);
  };

  // Determine active item list based on active tab
  const activeItems = useMemo(() => {
    if (type === 'Quotation') return quotations;
    if (type === 'Barcode') return barcodes;
    if (type === 'Service') {
      return salesItems.filter(s => (s.billingType || '').toLowerCase() === 'service');
    }
    // Product Billing (default fallback includes legacy items without billingType)
    return salesItems.filter(s => (s.billingType || 'Product').toLowerCase() !== 'service');
  }, [type, quotations, barcodes, salesItems]);

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
          aVal = a.invoiceNo || a.quoteNo || a.code || '';
          bVal = b.invoiceNo || b.quoteNo || b.code || '';
        }
        if (sortConfig.key === 'party') {
          aVal = a.customerName || a.name || '';
          bVal = b.customerName || b.name || '';
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
        'Quote #': q.quoteNo,
        'Client': q.customerName,
        'Phone': q.phone || '',
        'Email': q.email || '',
        'Items': q.items,
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
      'Invoice No': item.invoiceNo,
      'Customer Name': item.customerName,
      'Phone': item.customerPhone || '',
      'Date': formatDate(item.date),
      'Amount (INR)': item.amount,
      'Status': item.status || 'Paid',
      'Billing Type': item.billingType || type
    })), `${type}_Invoices`);
  };

  // Specific counts for tabs
  const productInvoicesCount = useMemo(() => {
    return salesItems.filter(s => (s.billingType || 'Product').toLowerCase() !== 'service').length;
  }, [salesItems]);

  const serviceInvoicesCount = useMemo(() => {
    return salesItems.filter(s => (s.billingType || '').toLowerCase() === 'service').length;
  }, [salesItems]);

  // ========================================================
  // 1. IN-PAGE VIEW: VIEW INVOICE RECORD
  // (Renders directly within TenantLayout without hiding or dimming sidebar/header)
  // ========================================================
  if (viewItem) {
    return (
      <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.25s ease-out' }}>
        {/* Top Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px', background: 'white', padding: '16px 20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => {
                const itemToEdit = viewItem;
                setViewItem(null);
                handleEdit(itemToEdit);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                background: 'white',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                color: '#2563EB',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Pencil size={15} /> Edit Invoice
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 20px',
                background: '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)'
              }}
            >
              <Printer size={16} /> Print Invoice
            </button>
          </div>
        </div>

        {/* Invoice Printable View Card */}
        <div style={{ background: 'white', padding: '36px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #F1F5F9', paddingBottom: '20px', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563EB', background: '#EFF6FF', padding: '4px 12px', borderRadius: '14px', textTransform: 'uppercase' }}>
                {viewItem.billingType || 'Customer'} Invoice
              </span>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', margin: '8px 0 4px 0', fontFamily: 'monospace' }}>
                {viewItem.invoiceNo}
              </h2>
              <div style={{ fontSize: '13px', color: '#64748B' }}>Issued on: {formatDate(viewItem.date)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '700',
                background: (viewItem.status || 'Paid').toLowerCase() === 'paid' ? '#DCFCE7' : '#FEF3C7',
                color: (viewItem.status || 'Paid').toLowerCase() === 'paid' ? '#15803D' : '#B45309'
              }}>
                {(viewItem.status || 'Paid').toLowerCase() === 'paid' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                {viewItem.status || 'Paid'}
              </span>
            </div>
          </div>

          {/* Customer Details Box */}
          <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
              Customer / Billed To
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>{viewItem.customerName}</div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '6px' }}>
              {viewItem.customerPhone && <div style={{ fontSize: '13.5px', color: '#475569' }}>📞 {viewItem.customerPhone}</div>}
              {viewItem.customerEmail && <div style={{ fontSize: '13.5px', color: '#475569' }}>✉️ {viewItem.customerEmail}</div>}
              {viewItem.customerAddress && <div style={{ fontSize: '13.5px', color: '#475569' }}>📍 {viewItem.customerAddress}</div>}
            </div>
          </div>

          {/* Itemized Breakdown Table */}
          {Array.isArray(viewItem.items) && viewItem.items.length > 0 ? (
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <tr>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Item</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: '700', color: '#64748B', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: '700', color: '#64748B', textAlign: 'right' }}>Rate (₹)</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: '700', color: '#64748B', textAlign: 'right' }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {viewItem.items.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 18px', fontSize: '14px', color: '#0F172A', fontWeight: '600' }}>{it.name}</td>
                      <td style={{ padding: '14px 18px', fontSize: '14px', color: '#475569', textAlign: 'center' }}>{it.quantity} {it.unit || 'pcs'}</td>
                      <td style={{ padding: '14px 18px', fontSize: '14px', color: '#475569', textAlign: 'right' }}>₹{Number(it.unitPrice).toLocaleString()}</td>
                      <td style={{ padding: '14px 18px', fontSize: '14px', color: '#0F172A', fontWeight: '800', textAlign: 'right' }}>₹{Number(it.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {/* Total Box */}
          <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', padding: '18px 24px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount Paid</span>
              <div style={{ fontSize: '13px', color: '#15803D', marginTop: '2px' }}>Payment Status: {viewItem.status || 'Paid'}</div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#14532D' }}>
              ₹{Number(viewItem.amount).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // 2. IN-PAGE VIEW: CREATE OR EDIT INVOICE
  // (Renders directly within TenantLayout without hiding or dimming sidebar/header)
  // ========================================================
  if (showModal) {
    return (
      <div style={{ padding: '24px', maxWidth: '1240px', margin: '0 auto', animation: 'fadeIn 0.25s ease-out' }}>
        
        {/* Top Header & Navigation Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'white',
          padding: '18px 24px',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', background: type === 'Service' ? '#F5F3FF' : '#EFF6FF', color: type === 'Service' ? '#7C3AED' : '#2563EB', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {type} Billing
                </span>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>•</span>
                <span style={{ fontSize: '12.5px', color: '#64748B', fontFamily: 'monospace', fontWeight: '700' }}>
                  {invoiceHeader.invoiceNo}
                </span>
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {type === 'Service' ? <Wrench size={22} color="#7C3AED" /> : <Package size={22} color="#2563EB" />}
                {editingItem ? 'Edit' : 'Add New'} {type} Invoice
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => { setShowModal(false); setEditingItem(null); }}
              style={{ padding: '10px 18px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', fontSize: '13.5px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitInvoice}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                background: type === 'Service' ? '#7C3AED' : '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '13.5px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)'
              }}
            >
              <Check size={16} />
              {editingItem ? 'Update Invoice' : 'Submit & Generate Bill'}
            </button>
          </div>
        </div>

        {/* Invoice Form Card */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <form onSubmit={handleSubmitInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* ---------------------------------------------------- */}
            {/* STEP 1: CUSTOMER SELECTION OR QUICK-ADD NEW CUSTOMER */}
            {/* ---------------------------------------------------- */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: '800', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  1. Customer Information *
                </label>
                
                {/* Mode Toggle Pills */}
                <div style={{ display: 'inline-flex', background: '#E2E8F0', borderRadius: '8px', padding: '3px', gap: '3px' }}>
                  <button
                    type="button"
                    onClick={() => setCustomerMode('walkin')}
                    style={{
                      padding: '5px 12px',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: customerMode === 'walkin' ? 'white' : 'transparent',
                      color: customerMode === 'walkin' ? '#16A34A' : '#64748B',
                      boxShadow: customerMode === 'walkin' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    ⚡ Walk-in Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerMode('existing')}
                    style={{
                      padding: '5px 12px',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: customerMode === 'existing' ? 'white' : 'transparent',
                      color: customerMode === 'existing' ? '#2563EB' : '#64748B',
                      boxShadow: customerMode === 'existing' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    Registered Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerMode('new')}
                    style={{
                      padding: '5px 12px',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: customerMode === 'new' ? 'white' : 'transparent',
                      color: customerMode === 'new' ? '#2563EB' : '#64748B',
                      boxShadow: customerMode === 'new' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    + Add New Customer
                  </button>
                </div>
              </div>

              {customerMode === 'walkin' ? (
                <div style={{ padding: '12px 16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', fontSize: '13px', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                    <span>⚡ Standard Walk-in Retail Customer</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#15803D', fontWeight: '600' }}>Fast Cash Sale • No details required</span>
                </div>
              ) : customerMode === 'existing' ? (
                <div>
                  {customersList.length === 0 ? (
                    <div style={{ padding: '14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', fontSize: '13px', color: '#92400E' }}>
                      No saved customers found. Switched to <strong>Add New Customer</strong> below to enter details:
                      <div style={{ marginTop: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setCustomerMode('new')}
                          style={{ padding: '6px 12px', background: '#D97706', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Enter New Customer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', background: 'white' }}
                      >
                        <option value="">-- Select Registered Customer --</option>
                        {customersList.map(cust => (
                          <option key={cust._id} value={cust._id}>
                            {cust.name} {cust.phone ? `(${cust.phone})` : ''} - {cust.companyName || 'Retail'}
                          </option>
                        ))}
                      </select>

                      {/* Customer Quick Preview */}
                      {(() => {
                        const chosen = customersList.find(c => c._id === selectedCustomerId);
                        if (!chosen) return null;
                        return (
                          <div style={{ marginTop: '12px', padding: '12px 16px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontWeight: '700', color: '#0F172A' }}>{chosen.name}</span>
                              {chosen.phone && <span style={{ color: '#64748B', marginLeft: '10px' }}>📞 {chosen.phone}</span>}
                              {chosen.address && <span style={{ color: '#64748B', marginLeft: '10px' }}>📍 {chosen.address}</span>}
                            </div>
                            <span style={{ fontSize: '11px', background: '#EFF6FF', color: '#2563EB', padding: '3px 10px', borderRadius: '12px', fontWeight: '700' }}>
                              {chosen.customerType || 'Customer'}
                            </span>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              ) : (
                /* Add New Customer Inputs */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Customer Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Phone Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Email (Optional)</label>
                      <input
                        type="email"
                        placeholder="e.g. customer@gmail.com"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>City / Address (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. MG Road, Bengaluru"
                        value={newCustomer.address}
                        onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                    <CheckCircle2 size={14} />
                    This customer will automatically be added to your Customer Directory upon submission.
                  </div>
                </div>
              )}
            </div>

            {/* ---------------------------------------------------- */}
            {/* STEP 2: PRODUCT SELECTION                            */}
            {/* ---------------------------------------------------- */}
            <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '14px', padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', background: '#2563EB', color: 'white', padding: '4px 10px', borderRadius: '8px', letterSpacing: '0.5px' }}>
                    STEP 2
                  </span>
                  <label style={{ fontSize: '14px', fontWeight: '800', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {type} Selection *
                  </label>
                </div>
                <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '600' }}>
                  Select item, set quantity & price, then click <strong>+ Add to Cart</strong>
                </span>
              </div>

              {availableCatalog.length === 0 ? (
                <div style={{ padding: '16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', fontSize: '13px', color: '#92400E' }}>
                  No {type.toLowerCase()}s found in your catalog. Please add {type.toLowerCase()}s in the <strong>{type}s</strong> section first.
                </div>
              ) : (
                <div>
                  {/* Picker Grid Controls */}
                  <div style={{
                    background: 'white',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'grid',
                    gridTemplateColumns: '2.5fr 1.2fr 1.2fr 1.3fr auto',
                    gap: '16px',
                    alignItems: 'end',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}>
                    {/* Product Dropdown */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Select {type} *
                      </label>
                      <select
                        value={pickerProdId}
                        onChange={(e) => handlePickerProductChange(e.target.value)}
                        style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '14px', background: 'white', fontWeight: '600', color: '#0F172A' }}
                      >
                        <option value="">-- Choose {type} --</option>
                        {availableCatalog.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.name} — ₹{p.price}/{p.unit || 'pcs'} (Stock: {p.stock || 0} pcs)
                          </option>
                        ))}
                      </select>
                      {selectedPickerProd && (
                        <div style={{ marginTop: '6px', fontSize: '12px' }}>
                          <span style={{
                            color: Number(selectedPickerProd.stock || 0) > 0 ? '#16A34A' : '#DC2626',
                            fontWeight: '700',
                            background: Number(selectedPickerProd.stock || 0) > 0 ? '#F0FDF4' : '#FEF2F2',
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}>
                            In Stock: {selectedPickerProd.stock || 0} {selectedPickerProd.unit || 'pcs'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quantity (pcs) Stepper */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Qty ({selectedPickerProd?.unit || 'pcs'}) *
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden', height: '42px', background: '#F8FAFC' }}>
                        <button
                          type="button"
                          onClick={() => setPickerQty(q => Math.max(1, Number(q || 1) - 1))}
                          disabled={Number(pickerQty) <= 1}
                          style={{ width: '36px', height: '100%', border: 'none', background: 'transparent', cursor: Number(pickerQty) <= 1 ? 'not-allowed' : 'pointer', color: '#475569', fontWeight: '800', fontSize: '16px' }}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={pickerQty}
                          onChange={(e) => setPickerQty(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                          style={{ width: '100%', height: '100%', textAlign: 'center', border: 'none', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', background: 'white', fontSize: '14px', fontWeight: '700', color: '#0F172A', outline: 'none' }}
                        />
                        <button
                          type="button"
                          onClick={() => setPickerQty(q => Number(q || 0) + 1)}
                          style={{ width: '36px', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#2563EB', fontWeight: '800', fontSize: '16px' }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price / pcs */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Price / {selectedPickerProd?.unit || 'pcs'} (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={pickerPrice}
                        onChange={(e) => setPickerPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '14px', fontWeight: '600', color: '#0F172A', boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* Subtotal preview */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#166534', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Subtotal (₹)
                      </label>
                      <div style={{ height: '42px', padding: '0 12px', background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', boxSizing: 'border-box' }}>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#15803D' }}>
                          ₹{((Number(pickerQty) || 0) * (Number(pickerPrice) || 0)).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <div>
                      <button
                        type="button"
                        onClick={handleAddToCartFromPicker}
                        disabled={!pickerProdId}
                        style={{
                          height: '42px',
                          padding: '0 20px',
                          background: !pickerProdId ? '#94A3B8' : (type === 'Service' ? '#7C3AED' : '#2563EB'),
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontSize: '13.5px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: !pickerProdId ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap',
                          boxShadow: !pickerProdId ? 'none' : '0 4px 6px -1px rgba(37,99,235,0.2)'
                        }}
                      >
                        <ShoppingCart size={16} /> + Add to Cart
                      </button>
                    </div>
                  </div>

                  {/* Quick Add Chips */}
                  {availableCatalog.length > 0 && (
                    <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>
                        ⚡ Quick Add:
                      </span>
                      {availableCatalog.slice(0, 6).map(prod => (
                        <button
                          key={prod._id}
                          type="button"
                          onClick={() => quickAddProductToCart(prod)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 12px',
                            background: 'white',
                            border: '1px solid #CBD5E1',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#1E293B',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#1E293B'; }}
                          title={`Click to add 1 ${prod.unit || 'pcs'} of ${prod.name} directly to cart`}
                        >
                          <Plus size={13} color="#2563EB" />
                          <span>{prod.name}</span>
                          <span style={{ color: '#16A34A', fontWeight: '700' }}>₹{prod.price}</span>
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>({prod.stock || 0} {prod.unit || 'pcs'})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ---------------------------------------------------- */}
            {/* STEP 3: BILLING SECTION (CART & FINAL BILL)          */}
            {/* ---------------------------------------------------- */}
            <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '14px', padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', background: '#16A34A', color: 'white', padding: '4px 10px', borderRadius: '8px', letterSpacing: '0.5px' }}>
                    STEP 3
                  </span>
                  <label style={{ fontSize: '14px', fontWeight: '800', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Billing Section (Cart & Edit) *
                  </label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#15803D', background: '#DCFCE7', padding: '4px 12px', borderRadius: '14px' }}>
                    🛒 {lineItems.length} {lineItems.length === 1 ? 'Item' : 'Items'} in Cart
                  </span>
                  {lineItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setLineItems([])}
                      style={{ fontSize: '12px', color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Clear Cart
                    </button>
                  )}
                </div>
              </div>

              {/* Cart Table */}
              {lineItems.length === 0 ? (
                <div style={{
                  background: 'white',
                  border: '1.5px dashed #CBD5E1',
                  borderRadius: '12px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                    <ShoppingCart size={24} />
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#475569' }}>
                    Your billing cart is empty
                  </div>
                  <div style={{ fontSize: '13px', color: '#94A3B8', maxWidth: '380px' }}>
                    Select a {type.toLowerCase()} in Step 2 above and click <strong>+ Add to Cart</strong>, or click any Quick Add button.
                  </div>
                </div>
              ) : (
                <div style={{ background: 'white', border: '1px solid #CBD5E1', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                      <tr>
                        <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', width: '50px' }}>#</th>
                        <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Item Name</th>
                        <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', width: '170px', textAlign: 'center' }}>Quantity (Edit)</th>
                        <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', width: '150px', textAlign: 'right' }}>Price / pc (₹)</th>
                        <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', width: '150px', textAlign: 'right' }}>Total (₹)</th>
                        <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', width: '60px', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, idx) => {
                        const matchedProd = productsList.find(p => p._id === item.productId);
                        const unitLabel = item.unit || 'pcs';

                        return (
                          <tr key={idx} style={{ borderBottom: idx < lineItems.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                            {/* S.No */}
                            <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748B', fontWeight: '700' }}>
                              {idx + 1}
                            </td>

                            {/* Item Name */}
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{item.name}</div>
                              {matchedProd && (
                                <div style={{ fontSize: '11.5px', color: Number(matchedProd.stock || 0) > 0 ? '#16A34A' : '#DC2626', fontWeight: '600', marginTop: '2px' }}>
                                  In Stock: {matchedProd.stock || 0} {unitLabel}
                                </div>
                              )}
                            </td>

                            {/* Editable Quantity Stepper */}
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden', height: '36px', width: '140px', margin: '0 auto', background: '#F8FAFC' }}>
                                <button
                                  type="button"
                                  onClick={() => adjustQuantity(idx, -1)}
                                  disabled={Number(item.quantity) <= 1}
                                  style={{ width: '34px', height: '100%', border: 'none', background: 'transparent', cursor: Number(item.quantity) <= 1 ? 'not-allowed' : 'pointer', color: '#475569', fontWeight: '800', fontSize: '15px' }}
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(idx, e.target.value)}
                                  required
                                  style={{ width: '100%', height: '100%', textAlign: 'center', border: 'none', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', background: 'white', fontSize: '13.5px', fontWeight: '700', color: '#0F172A', outline: 'none' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => adjustQuantity(idx, 1)}
                                  style={{ width: '34px', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#2563EB', fontWeight: '800', fontSize: '15px' }}
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            {/* Editable Unit Price */}
                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => handleUnitPriceChange(idx, e.target.value)}
                                required
                                style={{ width: '110px', height: '36px', padding: '0 10px', textAlign: 'right', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', fontWeight: '700', color: '#0F172A', boxSizing: 'border-box' }}
                              />
                            </td>

                            {/* Total Amount */}
                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                              <div style={{ fontSize: '15px', fontWeight: '800', color: '#15803D' }}>
                                ₹{(Number(item.amount) || 0).toLocaleString()}
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#64748B' }}>
                                {item.quantity} × ₹{item.unitPrice}
                              </div>
                            </td>

                            {/* Action: Delete */}
                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => removeLineItem(idx)}
                                style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease' }}
                                title="Remove item from cart"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Invoice Header Details (Invoice No, Date, Status) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px', marginTop: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceHeader.invoiceNo}
                    onChange={(e) => setInvoiceHeader({ ...invoiceHeader, invoiceNo: e.target.value })}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', fontFamily: 'monospace', fontWeight: '700', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Billing Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={invoiceHeader.date}
                    onChange={(e) => setInvoiceHeader({ ...invoiceHeader, date: e.target.value })}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Payment Status
                  </label>
                  <select
                    value={invoiceHeader.status}
                    onChange={(e) => setInvoiceHeader({ ...invoiceHeader, status: e.target.value })}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', background: 'white', fontWeight: '600' }}
                  >
                    <option value="Paid">Paid (Cash/Online)</option>
                    <option value="Pending">Pending / Credit</option>
                  </select>
                </div>
              </div>

              {/* Grand Total Billing Amount Card */}
              <div style={{
                marginTop: '20px',
                background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                border: '1.5px solid #86EFAC',
                borderRadius: '12px',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Billing Amount
                  </span>
                  <div style={{ fontSize: '13px', color: '#15803D', marginTop: '2px' }}>
                    {lineItems.length} {lineItems.length === 1 ? 'item' : 'items'} • {lineItems.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0)} total pcs
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#14532D' }}>
                  ₹{Number(totalBillingAmount).toLocaleString()}
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setEditingItem(null); }} 
                  style={{ padding: '11px 22px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '700', fontSize: '13.5px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={lineItems.length === 0}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '11px 32px',
                    background: lineItems.length === 0 ? '#94A3B8' : (type === 'Service' ? '#7C3AED' : '#2563EB'),
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: lineItems.length === 0 ? 'not-allowed' : 'pointer',
                    boxShadow: lineItems.length === 0 ? 'none' : '0 4px 6px -1px rgba(37,99,235,0.2)'
                  }}
                >
                  <Check size={16} />
                  {editingItem ? 'Update Invoice' : 'Submit & Generate Bill'}
                </button>
              </div>

            </div>

          </form>
        </div>

      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1240px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <TrendingUp size={28} color="var(--primary-blue)" /> Billing & Commercial Operations
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
            {offeringType === 'product' && 'Product customer billing invoices, bulk order quotations, and barcode asset tracking.'}
            {offeringType === 'service' && 'Service customer billing invoices and bulk service quotations.'}
            {offeringType === 'both' && 'Unified product and service customer billing, bulk order quotations, and asset barcodes.'}
          </p>
          
          {/* Navigation Tabs (Dynamic based on Onboarding Commercial Group) */}
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
            {/* 1. Product Billing Tab (Group 1 or Group 3) */}
            {isProductEnabled && (
              <button
                type="button"
                onClick={() => handleTabChange('Product')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  background: type === 'Product' ? 'white' : 'transparent',
                  color: type === 'Product' ? 'var(--primary-blue, #2563EB)' : '#64748B',
                  border: 'none',
                  boxShadow: type === 'Product' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Package size={15} />
                <span>Product</span>
                <span style={{
                  fontSize: '11px',
                  padding: '2px 7px',
                  borderRadius: '99px',
                  background: type === 'Product' ? '#EFF6FF' : '#E2E8F0',
                  color: type === 'Product' ? 'var(--primary-blue, #2563EB)' : '#64748B',
                  fontWeight: '700'
                }}>
                  {productInvoicesCount}
                </span>
              </button>
            )}

            {/* 2. Service Billing Tab (Group 2 or Group 3) */}
            {isServiceEnabled && (
              <button
                type="button"
                onClick={() => handleTabChange('Service')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  background: type === 'Service' ? 'white' : 'transparent',
                  color: type === 'Service' ? '#7C3AED' : '#64748B',
                  border: 'none',
                  boxShadow: type === 'Service' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Wrench size={15} />
                <span>Service</span>
                <span style={{
                  fontSize: '11px',
                  padding: '2px 7px',
                  borderRadius: '99px',
                  background: type === 'Service' ? '#F5F3FF' : '#E2E8F0',
                  color: type === 'Service' ? '#7C3AED' : '#64748B',
                  fontWeight: '700'
                }}>
                  {serviceInvoicesCount}
                </span>
              </button>
            )}

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

            {/* 4. Barcode Tab (Products & Assets) */}
            {isProductEnabled && (
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
                  color: type === 'Barcode' ? '#0D9488' : '#64748B',
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
                  background: type === 'Barcode' ? '#CCFBF1' : '#E2E8F0',
                  color: type === 'Barcode' ? '#0F766E' : '#64748B',
                  fontWeight: '700'
                }}>
                  {barcodes.length}
                </span>
              </button>
            )}
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
            background: type === 'Service' ? '#7C3AED' : type === 'Quotation' ? '#D97706' : type === 'Barcode' ? '#0D9488' : 'var(--primary-blue, #2563EB)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px', 
            fontWeight: '600', 
            fontSize: '14px', 
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
            transition: 'all 0.2s ease'
          }}
        >
          <Plus size={18} /> 
          {type === 'Product' && 'Add New Invoice'}
          {type === 'Service' && 'Add Service Invoice'}
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
          /* Product or Service Invoices Metrics */
          <>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: 'var(--primary-blue, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Receipt size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
                  Total {type} Invoices
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
                  Total {type} Revenue
                </p>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>
                  ₹{activeItems.reduce((acc, i) => acc + (Number(i.amount || 0)), 0).toLocaleString()}
                </h3>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Paid Invoices</p>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>
                  {activeItems.filter(i => (i.status || 'Paid').toLowerCase() === 'paid').length}
                </h3>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Pending Invoices</p>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#0F172A', fontWeight: '800' }}>
                  {activeItems.filter(i => (i.status || '').toLowerCase() === 'pending').length}
                </h3>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Control Bar: Search, Date Filter, Export */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: '0 1 320px', minWidth: '240px', position: 'relative' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder={
              type === 'Quotation' ? 'Search bulk quotations...' :
              type === 'Barcode' ? 'Search barcodes or SKUs...' : `Search ${type.toLowerCase()} invoices...`
            }
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ width: '100%', padding: '10px 16px 10px 44px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', background: 'white', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {type !== 'Barcode' && (
            <select
              value={filterDays}
              onChange={(e) => setFilterDays(e.target.value)}
              style={{ padding: '10px 14px', border: '1px solid #CBD5E1', borderRadius: '8px', background: 'white', color: '#334155', fontWeight: '500', outline: 'none', fontSize: '13px', cursor: 'pointer' }}
            >
              <option value="all">Filter: All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="custom">Custom Date Range</option>
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
            /* VIEW C: PRODUCT / SERVICE INVOICES TABLE */
            <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', width: '60px' }}>S.No</th>
                  <th onClick={() => requestSort('number')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      Invoice No {renderSortIcon('number')}
                    </div>
                  </th>
                  <th onClick={() => requestSort('party')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      Customer Name {renderSortIcon('party')}
                    </div>
                  </th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                    {type === 'Service' ? 'Services Billed' : 'Products Billed'}
                  </th>
                  <th onClick={() => requestSort('date')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Date {renderSortIcon('date')}</div>
                  </th>
                  <th onClick={() => requestSort('amount')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',  padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Amount (₹) {renderSortIcon('amount')}</div>
                  </th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>Loading {type.toLowerCase()} invoices...</td></tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '48px 20px', color: '#94A3B8' }}>
                      {type === 'Service' ? (
                        <Wrench size={40} style={{ opacity: 0.3, marginBottom: '10px', display: 'inline-block' }} />
                      ) : (
                        <Package size={40} style={{ opacity: 0.3, marginBottom: '10px', display: 'inline-block' }} />
                      )}
                      <h4 style={{ margin: '0 0 6px 0', color: '#334155', fontSize: '16px', fontWeight: '700' }}>
                        No {type} Invoices Found
                      </h4>
                      <p style={{ margin: 0, fontSize: '13.5px' }}>
                        Click "+ Add New Invoice" above to select a customer, choose {type.toLowerCase()}s, and record a transaction.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item, index) => {
                    const itemsSummary = Array.isArray(item.items) && item.items.length > 0
                      ? item.items.map(it => `${it.name}${it.quantity > 1 ? ` (×${it.quantity})` : ''}`).join(', ')
                      : (item.itemsSummary || 'Standard Bill');

                    const isPaid = (item.status || 'Paid').toLowerCase() === 'paid';

                    return (
                      <tr key={item._id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', fontWeight: '500' }}>{startIndex + index + 1}</td>
                        <td style={{ padding: '16px 24px', color: '#2563EB', fontSize: '14px', fontWeight: '700', fontFamily: 'monospace' }}>
                          {item.invoiceNo || `INV-${startIndex + index + 1}`}
                        </td>
                        <td style={{ padding: '16px 24px', color: '#0F172A', fontSize: '14px', fontWeight: '600' }}>
                          <div>{item.customerName || 'Walk-in Customer'}</div>
                          {item.customerPhone && (
                            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '400' }}>{item.customerPhone}</div>
                          )}
                        </td>
                        <td style={{ padding: '16px 24px', color: '#334155', fontSize: '13px', maxWidth: '280px' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }} title={itemsSummary}>
                            {itemsSummary}
                          </div>
                          {Array.isArray(item.items) && item.items.length > 1 && (
                            <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: '600' }}>
                              +{item.items.length} line items
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '16px 24px', color: '#475569', fontSize: '14px', whiteSpace: 'nowrap' }}>{formatDate(item.date)}</td>
                        <td style={{ padding: '16px 24px', color: '#0F172A', fontSize: '15px', fontWeight: '800' }}>
                          ₹{Number(item.amount).toLocaleString()}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '700',
                            background: isPaid ? '#DCFCE7' : '#FEF3C7',
                            color: isPaid ? '#15803D' : '#B45309'
                          }}>
                            {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            {isPaid ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <button onClick={() => setViewItem(item)} title="View Invoice" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#EFF6FF', color: '#3B82F6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Eye size={16} /></button>
                            <button onClick={() => handleEdit(item)} title="Edit Invoice" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Pencil size={15} /></button>
                            <button onClick={() => setDeleteId(item._id)} title="Delete Invoice" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
          itemName={type === 'Quotation' ? 'quotations' : type === 'Barcode' ? 'barcodes' : `${type.toLowerCase()} invoices`}
        />
      </div>



      {/* ======================================================== */}
      {/* MODAL 2: ADD/EDIT BULK QUOTATION                          */}
      {/* ======================================================== */}
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Phone Number</label>
                  <input
                    type="tel"
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

      {/* ======================================================== */}
      {/* MODAL 3: VIEW / PRINT FORMAL QUOTATION                    */}
      {/* ======================================================== */}
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
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Estimate Status</div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: viewingQuotation.status === 'Approved' ? '#16A34A' : viewingQuotation.status === 'Converted to Invoice' ? '#2563EB' : '#D97706' }}>
                  ● {viewingQuotation.status}
                </span>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>Formal validity guaranteed until: {formatDate(viewingQuotation.validUntil)}</div>
              </div>
            </div>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Specification / Item</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: '#64748B', textAlign: 'right' }}>Qty</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: '#64748B', textAlign: 'right' }}>Rate (₹)</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: '#64748B', textAlign: 'right' }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#0F172A', fontWeight: '500' }}>{viewingQuotation.items}</td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#475569', textAlign: 'right' }}>{viewingQuotation.quantity}</td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#475569', textAlign: 'right' }}>₹{Number(viewingQuotation.unitPrice).toLocaleString()}</td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#0F172A', fontWeight: '700', textAlign: 'right' }}>₹{(Number(viewingQuotation.quantity) * Number(viewingQuotation.unitPrice)).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <div style={{ width: '280px', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#64748B' }}>
                  <span>Gross Total:</span>
                  <span>₹{(Number(viewingQuotation.quantity) * Number(viewingQuotation.unitPrice)).toLocaleString()}</span>
                </div>
                {viewingQuotation.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#16A34A', fontWeight: '600' }}>
                    <span>Volume Discount ({viewingQuotation.discount}%):</span>
                    <span>-₹{Math.round((Number(viewingQuotation.quantity) * Number(viewingQuotation.unitPrice)) * (Number(viewingQuotation.discount) / 100)).toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #E2E8F0', paddingTop: '8px', fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                  <span>Final Quoted:</span>
                  <span>₹{Number(viewingQuotation.amount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {viewingQuotation.notes && (
              <div style={{ padding: '12px 16px', background: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A', fontSize: '13px', color: '#92400E', marginBottom: '24px' }}>
                <strong>Commercial Terms:</strong> {viewingQuotation.notes}
              </div>
            )}

            <div style={{ display: 'flex', gap: '14px' }}>
              <button type="button" onClick={() => setViewingQuotation(null)} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Close</button>
              <button 
                type="button" 
                onClick={() => window.print()} 
                style={{ flex: 1.5, padding: '12px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Printer size={16} /> Print Formal PDF
              </button>
            </div>
          </div>
        </div>, document.body
      )}

      {/* ======================================================== */}
      {/* MODAL 4: CONVERT QUOTATION TO LIVE INVOICE                */}
      {/* ======================================================== */}
      {convertQuotation && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '440px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <Check size={28} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0' }}>
              Convert to Billing Invoice?
            </h2>
            <p style={{ color: '#64748B', fontSize: '14px', margin: '0 0 20px 0' }}>
              Quotation <strong>{convertQuotation.quoteNo}</strong> for <strong>{convertQuotation.customerName}</strong> worth <strong>₹{Number(convertQuotation.amount).toLocaleString()}</strong> will be booked as an official invoice.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setConvertQuotation(null)} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={() => handleConvertQuotation(convertQuotation)} style={{ flex: 1.5, padding: '12px', background: '#16A34A', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Confirm & Bill</button>
            </div>
          </div>
        </div>, document.body
      )}

      {/* ======================================================== */}
      {/* MODAL 5: GENERATE / REGISTER BARCODE STICKER              */}
      {/* ======================================================== */}
      {showBarcodeModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '520px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
                  Generate Item Barcode
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Assign physical scannable barcode tags to items and inventory.
                </p>
              </div>
              <button onClick={() => setShowBarcodeModal(false)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveBarcode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Item / Offering Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basmati Rice 5kg or AC Compressor"
                  value={barcodeFormData.name}
                  onChange={e => setBarcodeFormData({ ...barcodeFormData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Stock Keeping Unit (SKU) *</label>
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
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#0D9488', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                  Save & Tag
                </button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

      {/* ======================================================== */}
      {/* MODAL 6: PRINTABLE THERMAL BARCODE LABELS SHEET           */}
      {/* ======================================================== */}
      {printingBarcode && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '480px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Print Barcode Stickers
              </h2>
              <button onClick={() => setPrintingBarcode(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
            </div>

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
                style={{ flex: 1.5, padding: '12px', background: '#0D9488', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Printer size={16} /> Print Thermal Stickers
              </button>
            </div>
          </div>
        </div>, document.body
      )}



      {/* ======================================================== */}
      {/* MODAL 8: DELETE CONFIRMATION                              */}
      {/* ======================================================== */}
      {deleteId && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <AlertTriangle size={32} color="#EF4444" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: '0 0 12px 0' }}>Delete Record</h2>
            <p style={{ color: '#64748B', margin: '0 0 24px 0' }}>Are you sure you want to delete this invoice? This action cannot be undone.</p>
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
