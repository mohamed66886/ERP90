import React, { useState, useRef } from 'react';
import { Search, Scan, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useItemSearch } from '@/hooks/useSearch';
import { searchService, SearchResult } from '@/services/searchService';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickItemSearchProps {
  onItemSelect: (item: SearchResult) => void;
  placeholder?: string;
  className?: string;
  showBarcodeButton?: boolean;
}

const QuickItemSearch: React.FC<QuickItemSearchProps> = ({
  onItemSelect,
  placeholder = "ابحث عن منتج أو امسح الباركود...",
  className = "",
  showBarcodeButton = true
}) => {
  const {
    query,
    setQuery,
    results,
    isSearching,
    clearSearch
  } = useItemSearch();

  const [showResults, setShowResults] = useState(false);
  const [barcodeMode, setBarcodeMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleItemSelect = (item: SearchResult) => {
    onItemSelect(item);
    clearSearch();
    setShowResults(false);
    setBarcodeMode(false);
  };

  const handleBarcodeSearch = async () => {
    if (!query.trim()) return;

    try {
      const results = await searchService.searchByBarcode(query);
      if (results.length > 0) {
        handleItemSelect(results[0]);
      } else {
        // إذا لم يتم العثور على المنتج بالباركود، جرب البحث العادي
        console.log('لم يتم العثور على منتج بهذا الباركود');
      }
    } catch (error) {
      console.error('خطأ في البحث بالباركود:', error);
    }
  };

  const toggleBarcodeMode = () => {
    setBarcodeMode(!barcodeMode);
    setQuery("");
    inputRef.current?.focus();
  };

  // إظهار النتائج عند وجود منتجات
  React.useEffect(() => {
    setShowResults(results.length > 0 && query.trim().length > 0);
  }, [results, query]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && barcodeMode) {
                handleBarcodeSearch();
              }
            }}
            placeholder={barcodeMode ? "امسح أو اكتب الباركود..." : placeholder}
            className={`w-full pl-10 pr-10 py-2 text-right ${
              barcodeMode ? 'border-orange-300 dark:border-orange-600' : ''
            }`}
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
          {barcodeMode && (
            <div className="absolute left-12 top-1/2 transform -translate-y-1/2">
              <Badge variant="outline" className="text-xs bg-orange-50 border-orange-200 text-orange-700">
                باركود
              </Badge>
            </div>
          )}
        </div>

        {showBarcodeButton && (
          <Button
            variant={barcodeMode ? "default" : "outline"}
            size="sm"
            onClick={toggleBarcodeMode}
            className={`px-3 ${barcodeMode ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
          >
            <Scan className="h-4 w-4" />
          </Button>
        )}

        {barcodeMode && query && (
          <Button
            onClick={handleBarcodeSearch}
            size="sm"
            className="px-3"
          >
            بحث
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
                ) : results.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {results.map((result, index) => (
                      <button
                        key={`${result.id}-${index}`}
                        onClick={() => handleItemSelect(result)}
                        className="w-full p-3 text-right hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg mt-1">📦</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                {result.title}
                              </h3>
                              {result.data?.itemCode && (
                                <Badge variant="secondary" className="text-xs">
                                  {result.data.itemCode}
                                </Badge>
                              )}
                            </div>
                            {result.subtitle && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
                                كود: {result.subtitle}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {result.data?.salePrice && (
                                <span>السعر: {result.data.salePrice} ريال</span>
                              )}
                              {result.data?.barcode && (
                                <span>باركود: {result.data.barcode}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : query.trim() ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">لم يتم العثور على منتجات</p>
                    {barcodeMode && (
                      <p className="text-xs mt-1">تأكد من صحة رقم الباركود</p>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickItemSearch;
