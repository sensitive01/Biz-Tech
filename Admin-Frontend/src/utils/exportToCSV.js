export const exportToCSV = (data, filename) => {
  if (!data || !data.length) {
    alert('No data to export');
    return;
  }
  
  // Exclude _id and other internal fields
  const excludeKeys = ['_id', '__v', 'tenantId', 'proofUrl'];
  const headers = Object.keys(data[0]).filter(k => !excludeKeys.includes(k));
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        let val = row[header];
        if (val === null || val === undefined) val = '';
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Show a visual toast notification
  const toast = document.createElement('div');
  toast.innerText = `Successfully exported ${filename}.csv!`;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: '#10B981',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    zIndex: 10000,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'opacity 0.3s',
    opacity: '0'
  });
  document.body.appendChild(toast);
  
  // Fade in
  setTimeout(() => { toast.style.opacity = '1'; }, 10);
  
  // Fade out and remove
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
};
