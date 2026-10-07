import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search, Filter, Package, Tag, Archive, Trash2, X, AlertTriangle } from 'lucide-react';

const Products = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [catForm, setCatForm] = useState({ name: '', description: '', image: null, itemType: 'Product', transactionType: 'Sales' });
  const [subCatForm, setSubCatForm] = useState({ name: '', categoryId: '', description: '' });
  const [prodForm, setProdForm] = useState({ name: '', sku: '', categoryId: '', subCategoryId: '', price: '', stock: '', image: null, itemType: 'Product', description: '' });

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
    
    if (activeTab === 'categories') {
      endpoint = '/api/categories';
      bodyData = new FormData();
      Object.keys(catForm).forEach(key => {
        if (catForm[key] !== null && catForm[key] !== '') {
          bodyData.append(key, catForm[key]);
        }
      });
    } else if (activeTab === 'subcategories') {
      endpoint = '/api/subcategories';
      bodyData = JSON.stringify(subCatForm);
      headers['Content-Type'] = 'application/json';
    } else {
      endpoint = '/api/products';
      bodyData = new FormData();
      Object.keys(prodForm).forEach(key => {
        if (prodForm[key] !== null && prodForm[key] !== '') {
          bodyData.append(key, prodForm[key]);
        }
      });
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: bodyData
      });
      if (res.ok) {
        setShowModal(false);
        setCatForm({ name: '', description: '', image: null, itemType: 'Product', transactionType: 'Sales' });
        setSubCatForm({ name: '', categoryId: '', description: '' });
        setProdForm({ name: '', sku: '', categoryId: '', subCategoryId: '', price: '', stock: '', image: null, itemType: 'Product', description: '' });
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

    return data.filter(item => 
      (item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
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
        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'var(--primary-blue)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}>
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
        <div style={{ padding: '20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', background: '#F8FAFC', padding: '4px', borderRadius: '10px' }}>
            <button onClick={() => setActiveTab('categories')} style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', background: activeTab === 'categories' ? 'white' : 'transparent', color: activeTab === 'categories' ? '#0F172A' : '#64748B', border: 'none', boxShadow: activeTab === 'categories' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Categories</button>
            <button onClick={() => setActiveTab('subcategories')} style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', background: activeTab === 'subcategories' ? 'white' : 'transparent', color: activeTab === 'subcategories' ? '#0F172A' : '#64748B', border: 'none', boxShadow: activeTab === 'subcategories' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Sub Categories</button>
            <button onClick={() => setActiveTab('products')} style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', background: activeTab === 'products' ? 'white' : 'transparent', color: activeTab === 'products' ? '#0F172A' : '#64748B', border: 'none', boxShadow: activeTab === 'products' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Products & Services</button>
          </div>
          
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px 16px 10px 38px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Name</th>
                {activeTab === 'categories' && (
                  <>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Item Type</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Transaction Type</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Description</th>
                  </>
                )}
                {activeTab === 'subcategories' && (
                  <>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Parent Category</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Description</th>
                  </>
                )}
                {activeTab === 'products' && (
                  <>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Category</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Type</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Price</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase' }}>Stock</th>
                  </>
                )}
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>No items found</td></tr>
              ) : (
                filteredData.map(item => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '16px 24px', fontWeight: '600', color: '#0F172A' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.image ? (
                          <img src={`${import.meta.env.VITE_API_URL}${item.image}`} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={16} color="#94A3B8" /></div>
                        )}
                        {item.name}
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
                      <button onClick={() => setDeleteId(item._id)} style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={16} /></button>
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
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                Add {activeTab === 'categories' ? 'Category' : activeTab === 'subcategories' ? 'Sub Category' : 'Product / Service'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {activeTab === 'categories' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Category Name</label>
                    <input type="text" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Description</label>
                    <textarea value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} rows="3"></textarea>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Category Image</label>
                    <input type="file" accept="image/*" onChange={e => setCatForm({...catForm, image: e.target.files[0]})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Type</label>
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
                </>
              )}

              {activeTab === 'subcategories' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Sub Category Name</label>
                    <input type="text" value={subCatForm.name} onChange={e => setSubCatForm({...subCatForm, name: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Parent Category</label>
                    <select value={subCatForm.categoryId} onChange={e => setSubCatForm({...subCatForm, categoryId: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                      <option value="">Select Category...</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Description</label>
                    <textarea value={subCatForm.description} onChange={e => setSubCatForm({...subCatForm, description: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} rows="3"></textarea>
                  </div>
                </>
              )}

              {activeTab === 'products' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Name</label>
                    <input type="text" value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Description</label>
                    <textarea value={prodForm.description} onChange={e => setProdForm({...prodForm, description: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} rows="2"></textarea>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Category</label>
                      <select value={prodForm.categoryId} onChange={e => setProdForm({...prodForm, categoryId: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                        <option value="">Select...</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Sub Category</label>
                      <select value={prodForm.subCategoryId} onChange={e => setProdForm({...prodForm, subCategoryId: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                        <option value="">None</option>
                        {subcategories.filter(sc => sc.categoryId?._id === prodForm.categoryId).map(sc => <option key={sc._id} value={sc._id}>{sc.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>SKU</label>
                      <input type="text" value={prodForm.sku} onChange={e => setProdForm({...prodForm, sku: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Type</label>
                      <select value={prodForm.itemType} onChange={e => setProdForm({...prodForm, itemType: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                        <option value="Product">Product</option>
                        <option value="Service">Service</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Price</label>
                      <input type="number" value={prodForm.price} onChange={e => setProdForm({...prodForm, price: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Stock Quantity</label>
                      <input type="number" value={prodForm.stock} onChange={e => setProdForm({...prodForm, stock: e.target.value})} disabled={prodForm.itemType === 'Service'} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', background: prodForm.itemType === 'Service' ? '#F1F5F9' : 'white' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Product/Service Image</label>
                    <input type="file" accept="image/*" onChange={e => setProdForm({...prodForm, image: e.target.files[0]})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '14px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Save</button>
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
