import { useState, useEffect } from 'react';

/**
 * Debounce any fast-changing value (e.g. search input)
 * @param {any} value Value to debounce
 * @param {number} delay Milliseconds to delay update
 * @returns {any} Debounced value
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;

