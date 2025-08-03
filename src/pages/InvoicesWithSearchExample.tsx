import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus, Edit, Trash2, Eye } from 'lucide-react';
import AdvancedSearch from '@/components/AdvancedSearch';
import QuickCustomerSearch from '@/components/QuickCustomerSearch';
import QuickItemSearch from '@/components/QuickItemSearch';
import { SearchResult } from '@/services/searchService';
import { useInvoiceSearch } from '@/hooks/useSearch';

// صفحة مثال للفواتير مع البحث المطور
const InvoicesWithSearchExample: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<SearchResult | null>(null);
  const [selectedItems, setSelectedItems] = useState<SearchResult[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // استخدام البحث المخصص للفواتير
  const {
    query: invoiceQuery,
    setQuery: setInvoiceQuery,
    results: invoiceResults,
    isSearching: isSearchingInvoices,
    clearSearch: clearInvoiceSearch
  } = useInvoiceSearch();

  const handleCustomerSelect = (customer: SearchResult) => {
    setSelectedCustomer(customer);
    console.log('تم اختيار العميل:', customer);
  };

  const handleItemSelect = (item: SearchResult) => {
    // تجنب إضافة نفس الصنف مرتين
    if (!selectedItems.find(i => i.id === item.id)) {
      setSelectedItems(prev => [...prev, item]);
    }
    console.log('تم اختيار الصنف:', item);
  };

  const removeSelectedItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSearchResult = (result: SearchResult) => {
    console.log('نتيجة البحث المتقدم:', result);
    // يمكن إضافة منطق إضافي حسب نوع النتيجة
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الفواتير - مع البحث المطور</h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          فاتورة جديدة
        </Button>
      </div>

      {/* البحث المتقدم */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            البحث الشامل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdvancedSearch
            onResultSelect={handleSearchResult}
            placeholder="ابحث في الفواتير والعملاء والمنتجات..."
            enableFilters={true}
            defaultTypes={['invoice', 'customer', 'item']}
          />
        </CardContent>
      </Card>

      {/* بحث الفواتير المخصص */}
      <Card>
        <CardHeader>
          <CardTitle>البحث في الفواتير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={invoiceQuery}
                onChange={(e) => setInvoiceQuery(e.target.value)}
                placeholder="ابحث في الفواتير..."
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={clearInvoiceSearch}
                disabled={!invoiceQuery}
              >
                مسح
              </Button>
            </div>

            {isSearchingInvoices && (
              <div className="text-center py-4">
                <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">جاري البحث في الفواتير...</p>
              </div>
            )}

            {invoiceResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {invoiceResults.map((invoice, index) => (
                  <div
                    key={`${invoice.id}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{invoice.title}</h3>
                      <p className="text-sm text-gray-600">{invoice.subtitle}</p>
                      <p className="text-xs text-gray-500">{invoice.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* بحث العملاء */}
        <Card>
          <CardHeader>
            <CardTitle>بحث العملاء</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickCustomerSearch
              onCustomerSelect={handleCustomerSelect}
              showAddNew={true}
              onAddNew={() => console.log('إضافة عميل جديد')}
            />
            
            {selectedCustomer && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      العميل المختار: {selectedCustomer.title}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {selectedCustomer.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* بحث المنتجات */}
        <Card>
          <CardHeader>
            <CardTitle>بحث المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickItemSearch
              onItemSelect={handleItemSelect}
              showBarcodeButton={true}
            />
            
            {selectedItems.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium">المنتجات المختارة:</h4>
                {selectedItems.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-blue-800 dark:text-blue-200">
                        {item.title}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {item.subtitle}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSelectedItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">25</div>
              <div className="text-sm text-gray-600">فواتير اليوم</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">847</div>
              <div className="text-sm text-gray-600">إجمالي العملاء</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">1,234</div>
              <div className="text-sm text-gray-600">الأصناف</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">45,678</div>
              <div className="text-sm text-gray-600">مبيعات الشهر</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoicesWithSearchExample;
