import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';
import { searchService, SearchResult, SearchOptions } from '@/services/searchService';
import { useNavigate } from 'react-router-dom';

interface AdvancedSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  enableFilters?: boolean;
  defaultTypes?: SearchResult['type'][];
  className?: string;
}

const typeLabels: Record<SearchResult['type'], string> = {
  invoice: 'فواتير المبيعات',
  customer: 'العملاء',
  supplier: 'الموردين',
  item: 'الأصناف',
  account: 'الحسابات',
  branch: 'الفروع',
  warehouse: 'المخازن',
  return: 'مرتجعات المبيعات',
  purchase: 'فواتير المشتريات',
  delegate: 'المندوبين',
  cashbox: 'الصناديق'
};

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onResultSelect,
  placeholder = "ابحث في جميع البيانات...",
  enableFilters = true,
  defaultTypes,
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<SearchResult['type'][]>(
    defaultTypes || Object.keys(typeLabels) as SearchResult['type'][]
  );
  const [showFilters, setShowFilters] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const navigate = useNavigate();

  // وظيفة البحث الرئيسية
  const performSearch = useCallback(async (query: string, types?: SearchResult['type'][]) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const options: SearchOptions = {
        query: query.trim(),
        types: types || selectedTypes,
        limit: 20
      };

      const results = await searchService.universalSearch(options);
      setSearchResults(results);
    } catch (error) {
      console.error('خطأ في البحث:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [selectedTypes]);

  // البحث مع التأخير
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  // تحديث البحث عند تغيير الفلاتر
  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery, selectedTypes);
    }
  }, [selectedTypes, searchQuery, performSearch]);

  const handleResultClick = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      navigate(result.route);
    }
    setSearchQuery("");
    setShowResults(false);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim() && searchResults.length > 0) {
      setShowResults(true);
    }
  };

  const toggleType = (type: SearchResult['type']) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    searchInputRef.current?.focus();
  };

  const getResultIcon = (type: SearchResult['type']) => {
    const icons = {
      invoice: '📋',
      customer: '👤',
      supplier: '🏢',
      item: '📦',
      account: '💰',
      branch: '🏪',
      warehouse: '🏭',
      return: '↩️',
      purchase: '🛒',
      delegate: '👨‍💼',
      cashbox: '💳'
    };
    return icons[type] || '📄';
  };

  const getResultTypeColor = (type: SearchResult['type']) => {
    const colors = {
      invoice: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      customer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      supplier: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      item: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      account: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      branch: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      warehouse: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      return: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      purchase: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
      delegate: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      cashbox: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center gap-2">
        {/* حقل البحث */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 text-right"
          />
          {searchQuery && (
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

        {/* زر الفلاتر */}
        {enableFilters && (
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="px-3">
                <Filter className="h-4 w-4 ml-2" />
                فلاتر
                {selectedTypes.length !== Object.keys(typeLabels).length && (
                  <Badge variant="secondary" className="mr-1 h-5 px-1 text-xs">
                    {selectedTypes.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">فلاتر البحث</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTypes(Object.keys(typeLabels) as SearchResult['type'][])}
                  >
                    تحديد الكل
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(typeLabels).map(([type, label]) => (
                    <div key={type} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={type}
                        checked={selectedTypes.includes(type as SearchResult['type'])}
                        onCheckedChange={() => toggleType(type as SearchResult['type'])}
                      />
                      <Label htmlFor={type} className="text-sm cursor-pointer">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
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
            <Card className="max-h-96 overflow-hidden">
              <CardContent className="p-0">
                {isSearching ? (
                  <div className="p-6 text-center">
                    <div className="inline-flex items-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">جاري البحث...</span>
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}-${index}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full p-4 text-right hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl mt-1">{getResultIcon(result.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                {result.title}
                              </h3>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getResultTypeColor(result.type)}`}
                              >
                                {typeLabels[result.type]}
                              </Badge>
                            </div>
                            {result.subtitle && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
                                {result.subtitle}
                              </p>
                            )}
                            {result.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                {result.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>لا توجد نتائج للبحث "{searchQuery}"</p>
                    <p className="text-xs mt-1">جرب استخدام كلمات مختلفة أو تعديل الفلاتر</p>
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

export default AdvancedSearch;
