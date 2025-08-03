import React, { useState } from 'react';
import { Search, Phone, Mail, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCustomerSearch } from '@/hooks/useSearch';
import { SearchResult } from '@/services/searchService';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickCustomerSearchProps {
  onCustomerSelect: (customer: SearchResult) => void;
  placeholder?: string;
  className?: string;
  showAddNew?: boolean;
  onAddNew?: () => void;
}

const QuickCustomerSearch: React.FC<QuickCustomerSearchProps> = ({
  onCustomerSelect,
  placeholder = "ابحث عن عميل...",
  className = "",
  showAddNew = false,
  onAddNew
}) => {
  const {
    query,
    setQuery,
    results,
    isSearching,
    clearSearch
  } = useCustomerSearch();

  const [showResults, setShowResults] = useState(false);

  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  const handleCustomerSelect = (customer: SearchResult) => {
    onCustomerSelect(customer);
    clearSearch();
    setShowResults(false);
  };

  const handleAddNew = () => {
    if (onAddNew) {
      onAddNew();
      clearSearch();
      setShowResults(false);
    }
  };

  // إظهار النتائج عند وجود عملاء
  React.useEffect(() => {
    setShowResults(results.length > 0 && query.trim().length > 0);
  }, [results, query]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 text-right"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* نتائج البحث */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="max-h-80 overflow-hidden">
              <CardContent className="p-0">
                {isSearching ? (
                  <div className="p-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">جاري البحث...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {results.length > 0 && (
                      <div className="max-h-64 overflow-y-auto">
                        {results.map((result, index) => (
                          <button
                            key={`${result.id}-${index}`}
                            onClick={() => handleCustomerSelect(result)}
                            className="w-full p-3 text-right hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-lg mt-1">👤</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                    {result.title}
                                  </h3>
                                  {result.data?.commercialRecord && (
                                    <Badge variant="secondary" className="text-xs">
                                      سجل تجاري
                                    </Badge>
                                  )}
                                </div>
                                {result.subtitle && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
                                    {result.subtitle}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  {result.data?.customerPhone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {result.data.customerPhone}
                                    </span>
                                  )}
                                  {result.data?.email && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {result.data.email}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* خيار إضافة عميل جديد */}
                    {showAddNew && query.trim() && (
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={handleAddNew}
                          className="w-full p-3 text-right hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors text-blue-600 dark:text-blue-400"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">➕</span>
                            <div>
                              <p className="font-medium">إضافة عميل جديد</p>
                              <p className="text-xs text-gray-500">"{query}"</p>
                            </div>
                          </div>
                        </button>
                      </div>
                    )}

                    {results.length === 0 && query.trim() && !isSearching && (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">لم يتم العثور على عملاء</p>
                        <p className="text-xs mt-1">جرب البحث باسم آخر أو رقم الهاتف</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickCustomerSearch;
