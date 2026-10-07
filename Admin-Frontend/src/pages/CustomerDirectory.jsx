import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Store, Users, Map, ChevronLeft, ChevronRight, Filter, ChevronDown, Download, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

const CustomerDirectory = () => {
  const navigate = useNavigate();
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All Clients (3)');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [customersData, setCustomersData] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`)
      .then(res => res.json())
      .then(data => {
        const formattedData = data.map(user => ({
          id: user._id.substring(user._id.length - 6).toUpperCase(),
          businessName: user.businessName || (user.fullName + "'s Business"),
          type: user.businessType,
          typeLabel: `Type ${user.businessType}: ${user.businessType === 1 ? 'Sole Operator' : user.businessType === 2 ? 'Single Branch + Staff' : 'Multi-Branch Enterprise'}`,
          typeDesc: user.businessType === 1 ? '1 Owner • 1 Shop' : user.businessType === 2 ? '1 Owner • 1 Shop' : '1 Owner • Multiple Branches',
          contactName: user.fullName,
          contactEmail: user.email,
          locations: user.address || (user.businessType === 3 ? 'Multiple Locations' : '1 Shop'),
          staff: user.businessType === 1 ? 'Owner Only' : 'Staff Enrolled',
          staffDesc: user.businessType === 1 ? '0 Staff' : 'Uses Roster',
          status: 'Active'
        }));
        setCustomersData(formattedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch users", err);
        setLoading(false);
      });
  }, []);

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
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '260px', zIndex: 10, overflow: 'hidden' }}>
                {['All Clients (3)', 'Type 1: Sole Operator', 'Type 2: Single Branch + Staff', 'Type 3: Multi-Branch Enterprise'].map((filter, idx) => (
                  <button 
                    key={filter}
                    onClick={() => { setSelectedFilter(filter); setShowFilterDropdown(false); }}
                    style={{ 
                      display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: '13px', 
                      color: filter === selectedFilter ? 'var(--primary-blue)' : 'var(--text-title)', 
                      background: filter === selectedFilter ? '#EFF4FF' : 'transparent', 
                      borderBottom: idx === 3 ? 'none' : '1px solid var(--border-color)', 
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
          
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', background: 'white' }}>
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-blue)' }}></div>
          Active Directory &bull; {customersData.length} Total Enterprises
        </div>
      </div>

      {/* Data Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
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
                  <a href="#" style={{ fontWeight: '600', fontSize: '14px' }}>View Details</a>
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
    </div>
  );
};

export default CustomerDirectory;
