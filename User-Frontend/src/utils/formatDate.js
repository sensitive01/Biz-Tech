export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const datePart = typeof dateStr === 'string' && dateStr.includes('T')
      ? dateStr.split('T')[0]
      : (typeof dateStr === 'string' ? dateStr : '');

    if (datePart && datePart.includes('-')) {
      const [year, month, day] = datePart.split('-');
      if (year && month && day) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const mIdx = parseInt(month, 10) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          return `${day.slice(0, 2)} ${monthNames[mIdx]} ${year}`;
        }
        return `${day.slice(0, 2)}/${month}/${year}`;
      }
    }

    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return String(dateStr);
  } catch {
    return String(dateStr);
  }
};
