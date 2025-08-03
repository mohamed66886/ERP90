import { useState, useEffect, useCallback, useRef } from 'react';
import { searchService, SearchResult, SearchOptions } from '@/services/searchService';

export interface UseSearchOptions extends Omit<SearchOptions, 'query'> {
  debounceMs?: number;
  autoSearch?: boolean;
  minQueryLength?: number;
}

export interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isSearching: boolean;
  hasSearched: boolean;
  error: string | null;
  search: (customQuery?: string) => Promise<void>;
  clearSearch: () => void;
  searchByBarcode: (barcode: string) => Promise<void>;
}

export const useSearch = (options: UseSearchOptions = {}): UseSearchReturn => {
  const {
    debounceMs = 300,
    autoSearch = true,
    minQueryLength = 2,
    types,
    limit = 20,
    includeRecentItems = false
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout>();

  // وظيفة البحث الرئيسية
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.trim().length < minQueryLength) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const searchOptions: SearchOptions = {
        query: searchQuery.trim(),
        types,
        limit,
        includeRecentItems
      };

      const searchResults = await searchService.universalSearch(searchOptions);
      setResults(searchResults);
      setHasSearched(true);
    } catch (err) {
      console.error('خطأ في البحث:', err);
      setError('حدث خطأ أثناء البحث');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [types, limit, includeRecentItems, minQueryLength]);

  // البحث مع التأخير (debouncing)
  useEffect(() => {
    if (!autoSearch) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.trim()) {
      timeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, debounceMs);
    } else {
      setResults([]);
      setHasSearched(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, autoSearch, debounceMs, performSearch]);

  // البحث اليدوي
  const search = useCallback(async (customQuery?: string) => {
    const searchQuery = customQuery || query;
    await performSearch(searchQuery);
  }, [query, performSearch]);

  // مسح البحث
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setError(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // البحث بالباركود
  const searchByBarcode = useCallback(async (barcode: string) => {
    if (!barcode.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const results = await searchService.searchByBarcode(barcode);
      setResults(results);
      setHasSearched(true);
      setQuery(barcode);
    } catch (err) {
      console.error('خطأ في البحث بالباركود:', err);
      setError('حدث خطأ أثناء البحث بالباركود');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // تنظيف التايمر عند إلغاء المكون
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    hasSearched,
    error,
    search,
    clearSearch,
    searchByBarcode
  };
};

// Hook للبحث السريع (للاقتراحات)
export const useQuickSearch = (minQueryLength: number = 2) => {
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < minQueryLength) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchService.quickSearch(query, 5);
      setSuggestions(results);
    } catch (error) {
      console.error('خطأ في جلب الاقتراحات:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [minQueryLength]);

  return {
    suggestions,
    isLoading,
    getSuggestions
  };
};

// Hook للبحث حسب النوع
export const useTypeSearch = (type: SearchResult['type']) => {
  return useSearch({
    types: [type],
    autoSearch: true,
    debounceMs: 400
  });
};

// Hook للبحث في الفواتير فقط
export const useInvoiceSearch = () => useTypeSearch('invoice');

// Hook للبحث في العملاء فقط
export const useCustomerSearch = () => useTypeSearch('customer');

// Hook للبحث في الأصناف فقط
export const useItemSearch = () => useTypeSearch('item');

// Hook للبحث في الموردين فقط
export const useSupplierSearch = () => useTypeSearch('supplier');

export default useSearch;
