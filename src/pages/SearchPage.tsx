import React, { useState } from 'react';
import { Search as SearchIcon, Filter, TrendingUp, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdvancedSearch from '@/components/AdvancedSearch';
import { SearchResult } from '@/services/searchService';

const SearchPage: React.FC = () => {
  const [recentSearches] = useState<string[]>([
    'فاتورة 2024-001',
    'أحمد محمد',
    'منتجات الكترونية',
    'فرع الرياض',
    'مرتجع'
  ]);

  const [popularSearches] = useState<string[]>([
    'فواتير اليوم',
    'عملاء جدد',
    'أعلى المبيعات',
    'المخزون المنخفض',
    'التقارير المالية'
  ]);

  const handleResultSelect = (result: SearchResult) => {
    console.log('تم اختيار النتيجة:', result);
    // يمكن إضافة منطق إضافي هنا
  };

  const handleQuickSearch = (query: string) => {
    // تنفيذ البحث السريع
    console.log('بحث سريع:', query);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <SearchIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              البحث الشامل
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            ابحث في جميع بيانات النظام - الفواتير، العملاء، المنتجات، التقارير وأكثر
          </p>
        </div>

        {/* مربع البحث الرئيسي */}
        <div className="mb-8">
          <AdvancedSearch
            onResultSelect={handleResultSelect}
            placeholder="ابحث في أي شيء في النظام..."
            enableFilters={true}
            className="w-full"
          />
        </div>

        {/* البحث السريع */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* البحث الحديث */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-gray-600" />
                البحث الأخير
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickSearch(search)}
                    className="w-full justify-start text-right h-8 px-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <SearchIcon className="h-3 w-3 ml-2 opacity-50" />
                    {search}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* البحث الشائع */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                البحث الشائع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {popularSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickSearch(search)}
                    className="w-full justify-start text-right h-8 px-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <Star className="h-3 w-3 ml-2 opacity-50" />
                    {search}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* فئات البحث */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              البحث حسب الفئة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { icon: '📋', label: 'الفواتير', type: 'invoice' },
                { icon: '👤', label: 'العملاء', type: 'customer' },
                { icon: '🏢', label: 'الموردين', type: 'supplier' },
                { icon: '📦', label: 'الأصناف', type: 'item' },
                { icon: '💰', label: 'الحسابات', type: 'account' },
                { icon: '🏪', label: 'الفروع', type: 'branch' },
                { icon: '🏭', label: 'المخازن', type: 'warehouse' },
                { icon: '↩️', label: 'المرتجعات', type: 'return' },
                { icon: '🛒', label: 'المشتريات', type: 'purchase' },
                { icon: '👨‍💼', label: 'المندوبين', type: 'delegate' },
                { icon: '💳', label: 'الصناديق', type: 'cashbox' }
              ].map((category, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 flex-col gap-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-950"
                  onClick={() => handleQuickSearch(category.label)}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span>{category.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* نصائح البحث */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">نصائح للبحث الفعال</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">البحث العام:</h4>
                <ul className="space-y-1">
                  <li>• استخدم كلمات مفتاحية واضحة</li>
                  <li>• يمكن البحث بالأرقام أو النصوص</li>
                  <li>• البحث لا يتأثر بحالة الأحرف</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">البحث المتقدم:</h4>
                <ul className="space-y-1">
                  <li>• استخدم الفلاتر لتضييق النتائج</li>
                  <li>• البحث بالباركود للمنتجات</li>
                  <li>• البحث بالتاريخ للفواتير</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SearchPage;
