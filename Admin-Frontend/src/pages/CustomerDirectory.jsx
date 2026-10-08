import { exportToCSV } from '../utils/exportToCSV';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Store, Users, Map, ChevronLeft, ChevronRight, Filter, ChevronDown, Download, ArrowUp, ArrowDown, ArrowUpDown, X, User, Mail, Phone, MapPin, Briefcase, Calendar, Eye, Trash2, AlertTriangle, Building2 } from 'lucide-react';

const CustomerDirectory = () => {
  const navigate = useNavigate();
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All Clients (3)');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [customersData, setCustomersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [deleteCustomerId, setDeleteCustomerId] = useState(null);

  const fetchCustomers = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`)
      .then(res => res.json())
      .then(data => {
        const formattedData = data.map(user => ({
          _id: user._id,
          id: user._id.substring(user._id.length - 6).toUpperCase(),
          businessName: user.businessName || (user.fullName + "'s Business"),
          type: user.businessType,
          typeLabel: `Type ${user.businessType}: ${user.businessType === 1 ? 'Sole Operator' : user.businessType === 2 ? 'Single Branch + Staff' : user.businessType === 3 ? 'Multi-Branch Enterprise' : 'Multi-Business Conglomerate'}`,
          typeDesc: user.businessType === 1 ? '1 Owner • 1 Shop' : user.businessType === 2 ? '1 Owner • 1 Shop' : user.businessType === 3 ? '1 Owner • Multiple Branches' : '1 Owner • Multiple Businesses',
          contactName: user.fullName,
          contactEmail: user.email,
          contactPhone: user.phone || 'N/A',
          industry: user.industry || 'Not specified',
          fullAddress: user.address || 'Not specified',
          joinedAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
          locations: user.address || (user.businessType >= 3 ? 'Multiple Locations' : '1 Shop'),
          staff: user.businessType === 1 ? 'Owner Only' : 'Staff Enrolled',
          staffDesc: user.businessType === 1 ? '0 Staff' : 'Uses Roster',
          status: 'Active',
          modules: user.modules || []
        }));
        setCustomersData(formattedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch users", err);
        setLoading(false);
      });
  };

  React.useEffect(() => {
    fetchCustomers();
  }, []);

  const confirmDelete = async () => {
    if (!deleteCustomerId) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${deleteCustomerId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDeleteCustomerId(null);
        fetchCustomers();
      } else {
        alert('Failed to delete customer');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting customer');
    }
  };

  const sortedCustomers = React.useMemo(() => {
    let sortableItems = [...customersData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [sortConfig, customersData]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} style={{ color: 'var(--primary-blue)' }} /> : <ArrowDown size={14} style={{ color: 'var(--primary-blue)' }} />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Customers</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            View and manage all registered business clients
          </p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => navigate('/admin/customers/new')}
        >
          <Plus size={18} />
          Add New Customer
        </button>
      </div>

      {/* Search & Filter Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by business name or owner..." 
            style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', outline: 'none', background: 'white' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <button 
              className="btn-secondary" 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', background: 'white' }}
            >
              <Filter size={16} /> {selectedFilter} <ChevronDown size={16} />
            </button>
            {showFilterDropdown && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '280px', zIndex: 10, overflow: 'hidden' }}>
                {['All Clients', 'Type 1: Sole Operator', 'Type 2: Single Branch + Staff', 'Type 3: Multi-Branch Enterprise', 'Type 4: Multi-Business Conglomerate'].map((filter, idx) => (
                  <button 
                    key={filter}
                    onClick={() => { setSelectedFilter(filter); setShowFilterDropdown(false); }}
                    style={{ 
                      display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: '13px', 
                      color: filter === selectedFilter ? 'var(--primary-blue)' : 'var(--text-title)', 
                      background: filter === selectedFilter ? '#EFF4FF' : 'transparent', 
                      borderBottom: idx === 4 ? 'none' : '1px solid var(--border-color)', 
                      fontWeight: '500', cursor: 'pointer' 
                    }}
                    onMouseOver={(e) => { if(filter !== selectedFilter) e.currentTarget.style.background = '#F8FAFC' }}
                    onMouseOut={(e) => { if(filter !== selectedFilter) e.currentTarget.style.background = 'transparent' }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button onClick={() => exportToCSV(filteredItems, 'CustomerDirectory')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#475569', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}><Download size={16} /> Export</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-blue)' }}></div>
          Active Directory &bull; {customersData.length} Total Enterprises
        </div>
      </div>

      {/* Data Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '16px 24px', fontWeight: '600', width: '60px' }}>S.NO</th>
              <th onClick={() => requestSort('businessName')} style={{ padding: '16px 24px', fontWeight: '600', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>Business Name</span> {renderSortIcon('businessName')}</div>
              </th>
              <th onClick={() => requestSort('type')} style={{ padding: '16px 24px', fontWeight: '600', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>Business Archetype</span> {renderSortIcon('type')}</div>
              </th>
              <th onClick={() => requestSort('contactName')} style={{ padding: '16px 24px', fontWeight: '600', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>Primary Contact</span> {renderSortIcon('contactName')}</div>
              </th>
              <th onClick={() => requestSort('locations')} style={{ padding: '16px 24px', fontWeight: '600', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>Locations</span> {renderSortIcon('locations')}</div>
              </th>
              <th onClick={() => requestSort('staff')} style={{ padding: '16px 24px', fontWeight: '600', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>Staffing Size</span> {renderSortIcon('staff')}</div>
              </th>
              <th onClick={() => requestSort('status')} style={{ padding: '16px 24px', fontWeight: '600', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>Status</span> {renderSortIcon('status')}</div>
              </th>
              <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCustomers.map((customer, idx) => (
              <tr key={customer.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '500' }}>{idx + 1}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: `var(--badge-type${customer.type}-bg)`, color: customer.type === 1 ? 'var(--primary-blue)' : `var(--badge-type${customer.type}-text)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {customer.type === 1 && <Store size={20} />}
                      {customer.type === 2 && <Users size={20} />}
                      {customer.type === 3 && <Map size={20} />}
                      {customer.type === 4 && <Building2 size={20} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-title)', fontSize: '15px' }}>{customer.businessName}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ID: {customer.id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                    <span className="badge" style={{ background: `var(--badge-type${customer.type}-bg)`, color: customer.type === 1 ? 'var(--primary-blue)' : `var(--badge-type${customer.type}-text)` }}>{customer.typeLabel}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {customer.typeDesc}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: '500', color: 'var(--text-title)', fontSize: '14px' }}>{customer.contactName}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{customer.contactEmail}</div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span className="badge" style={{ background: '#F1F5F9', color: 'var(--text-title)' }}>{customer.locations}</span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: '500', color: 'var(--text-title)', fontSize: '14px' }}>{customer.staff}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{customer.staffDesc}</div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span className="badge" style={{ background: customer.status === 'Active' ? 'var(--badge-active-bg)' : 'var(--badge-pending-bg)', color: customer.status === 'Active' ? 'var(--badge-active-text)' : 'var(--badge-pending-text)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                    {customer.status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <button type="button" onClick={() => setViewCustomer(customer)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#EFF6FF', color: '#3B82F6', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }} title="View Details" onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'} onMouseOut={(e) => e.currentTarget.style.background = '#EFF6FF'}>
                      <Eye size={16} />
                    </button>
                    <button type="button" onClick={() => setDeleteCustomerId(customer._id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }} title="Delete Customer" onMouseOver={(e) => e.currentTarget.style.background = '#FECACA'} onMouseOut={(e) => e.currentTarget.style.background = '#FEE2E2'}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div style={{ padding: '16px 24px', background: '#F8FAFC', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Showing <strong>{sortedCustomers.length}</strong> of <strong>{customersData.length}</strong> customers
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'white', color: 'var(--text-muted)' }}>
              <ChevronLeft size={16} />
            </button>
            <button style={{ padding: '4px 12px', border: '1px solid var(--primary-blue)', borderRadius: '6px', background: 'white', color: 'var(--primary-blue)', fontWeight: '600' }}>
              1
            </button>
            <button style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'white', color: 'var(--text-muted)' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {viewCustomer && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '600px', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `var(--badge-type${viewCustomer.type}-bg)`, color: viewCustomer.type === 1 ? 'var(--primary-blue)' : `var(--badge-type${viewCustomer.type}-text)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {viewCustomer.type === 1 && <Store size={24} />}
                  {viewCustomer.type === 2 && <Users size={24} />}
                  {viewCustomer.type === 3 && <Map size={24} />}
                  {viewCustomer.type === 4 && <Building2 size={24} />}
                </div>
                <div>
                  <h2 style={{ fontSize: '22px', margin: 0, color: 'var(--text-title)' }}>{viewCustomer.businessName}</h2>
                  <span className="badge" style={{ marginTop: '4px', background: `var(--badge-type${viewCustomer.type}-bg)`, color: viewCustomer.type === 1 ? 'var(--primary-blue)' : `var(--badge-type${viewCustomer.type}-text)` }}>{viewCustomer.typeLabel}</span>
                </div>
              </div>
              <button onClick={() => setViewCustomer(null)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', fontWeight: '600' }}>Contact Details</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><User size={16} color="var(--text-muted)" /> <span style={{ fontSize: '14px', fontWeight: '500' }}>{viewCustomer.contactName}</span></div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Mail size={16} color="var(--text-muted)" /> <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{viewCustomer.contactEmail}</span></div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Phone size={16} color="var(--text-muted)" /> <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{viewCustomer.contactPhone}</span></div>
                </div>
              </div>

              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', fontWeight: '600' }}>Business Info</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}><Briefcase size={16} color="var(--text-muted)" style={{ marginTop: '2px' }} /> <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{viewCustomer.industry}</span></div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}><MapPin size={16} color="var(--text-muted)" style={{ marginTop: '2px' }} /> <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{viewCustomer.fullAddress}</span></div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Calendar size={16} color="var(--text-muted)" /> <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Joined {viewCustomer.joinedAt}</span></div>
                </div>
              </div>
            </div>

            {viewCustomer.modules && viewCustomer.modules.length > 0 && (
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', fontWeight: '600' }}>Active Modules</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {viewCustomer.modules.map(mod => (
                    <span key={mod} className="badge" style={{ background: '#EFF6FF', color: '#2563EB', textTransform: 'capitalize' }}>
                      {mod.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setViewCustomer(null)} className="btn-primary" style={{ padding: '10px 24px' }}>Close Details</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deleteCustomerId && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <AlertTriangle size={32} color="#EF4444" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: '0 0 12px 0' }}>Delete Customer</h2>
            <p style={{ color: '#64748B', margin: '0 0 24px 0', lineHeight: '1.5' }}>Are you sure you want to delete this customer? This action cannot be undone.</p>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <button type="button" onClick={() => setDeleteCustomerId(null)} style={{ flex: 1, padding: '14px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#475569', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                Cancel
              </button>
              <button type="button" onClick={confirmDelete} style={{ flex: 1, padding: '14px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 6px -1px rgba(239,68,68,0.2)' }} onMouseOver={(e) => e.currentTarget.style.background = '#DC2626'} onMouseOut={(e) => e.currentTarget.style.background = '#EF4444'}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default CustomerDirectory;
