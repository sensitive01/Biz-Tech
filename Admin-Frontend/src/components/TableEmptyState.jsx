import React from 'react';

const TableEmptyState = ({ colSpan = 7, icon: Icon, title = 'No Records Found', subtitle = 'No data matching your current filters or search query.' }) => {
  return (
    <tr>
      <td colSpan={colSpan} style={{ textAlign: 'center', padding: '48px 20px', color: '#94A3B8' }}>
        {Icon && <Icon size={40} style={{ opacity: 0.3, marginBottom: '10px', display: 'inline-block' }} />}
        <h4 style={{ margin: '0 0 6px 0', color: '#334155', fontSize: '16px', fontWeight: '700' }}>
          {title}
        </h4>
        {subtitle && (
          <p style={{ margin: 0, fontSize: '13.5px', color: '#94A3B8' }}>
            {subtitle}
          </p>
        )}
      </td>
    </tr>
  );
};

export default TableEmptyState;
