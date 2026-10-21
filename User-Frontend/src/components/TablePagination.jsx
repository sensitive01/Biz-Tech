import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TablePagination = ({
  currentPage = 1,
  setCurrentPage,
  totalItems = 0,
  itemsPerPage = 10,
  setItemsPerPage,
  itemName = 'records'
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div style={{ 
      padding: '16px 24px', 
      background: '#F8FAFC', 
      borderTop: '1px solid var(--border-color, #E2E8F0)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      {/* Left: Summary */}
      <div style={{ fontSize: '14px', color: 'var(--text-secondary, #64748B)' }}>
        Showing{' '}
        <strong>{totalItems === 0 ? 0 : startIndex + 1}</strong>
        {' '}-{' '}
        <strong>{endIndex}</strong>
        {' '}of{' '}
        <strong>{totalItems}</strong> {itemName}
      </div>

      {/* Right: Show section in front of Previous & Next buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* Section to adjust data count placed in front of Previous button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-secondary, #64748B)', fontWeight: '500' }}>
            Show:
          </label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              padding: '6px 10px',
              border: '1px solid var(--border-color, #E2E8F0)',
              borderRadius: '6px',
              background: 'white',
              color: 'var(--text-title, #0F172A)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary, #64748B)' }}>per page</span>
        </div>

        {/* Previous and Next Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            type="button"
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              padding: '6px 12px', 
              border: '1px solid var(--border-color, #E2E8F0)', 
              borderRadius: '6px', 
              background: 'white', 
              color: currentPage === 1 ? 'var(--text-muted, #94A3B8)' : 'var(--text-title, #0F172A)',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              opacity: currentPage === 1 ? 0.6 : 1,
              transition: 'all 0.15s'
            }}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <button 
            type="button"
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalItems === 0}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              padding: '6px 12px', 
              border: '1px solid var(--border-color, #E2E8F0)', 
              borderRadius: '6px', 
              background: 'white', 
              color: (currentPage === totalPages || totalItems === 0) ? 'var(--text-muted, #94A3B8)' : 'var(--text-title, #0F172A)',
              cursor: (currentPage === totalPages || totalItems === 0) ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              opacity: (currentPage === totalPages || totalItems === 0) ? 0.6 : 1,
              transition: 'all 0.15s'
            }}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
