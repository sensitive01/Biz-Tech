import { useState, useMemo } from 'react';

/**
 * Manage pagination state for tables and lists
 * @param {Array} items Complete list of items to paginate
 * @param {number} initialPageSize Initial items per page (default 10)
 */
export const usePagination = (items = [], initialPageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Auto-clamp page if items shrink
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, safeCurrentPage, itemsPerPage]);

  const goToNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const resetPage = () => setCurrentPage(1);

  return {
    currentPage: safeCurrentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    paginatedItems,
    setCurrentPage,
    setItemsPerPage,
    goToNextPage,
    goToPreviousPage,
    resetPage,
  };
};

export default usePagination;

