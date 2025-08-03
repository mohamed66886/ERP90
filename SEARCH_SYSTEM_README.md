# نظام البحث الشامل المطور

تم تطوير نظام بحث شامل ومتقدم للنظام يتيح البحث في جميع البيانات بطريقة احترافية وسريعة.

## المميزات الرئيسية

### 🔍 البحث الشامل
- البحث في جميع جداول قاعدة البيانات
- نتائج مرتبة حسب الصلة
- البحث الفوري مع التأخير الذكي (debouncing)
- دعم البحث بالعربية والإنجليزية

### 📊 أنواع البيانات المدعومة
- **الفواتير**: فواتير المبيعات والمشتريات
- **العملاء**: البحث بالاسم، الهاتف، البريد الإلكتروني
- **الموردين**: جميع بيانات الموردين
- **الأصناف**: المنتجات مع دعم البحث بالباركود
- **الحسابات**: حسابات دليل الحسابات
- **الفروع**: فروع الشركة
- **المخازن**: جميع المخازن
- **المرتجعات**: مرتجعات المبيعات
- **المندوبين**: بيانات المندوبين
- **الصناديق**: صناديق النقد

### 🎯 مكونات النظام

#### 1. `searchService.ts`
خدمة البحث الرئيسية التي تحتوي على:
- `universalSearch()`: البحث الشامل في جميع الجداول
- `quickSearch()`: البحث السريع للاقتراحات
- `searchByBarcode()`: البحث بالباركود
- نظام cache ذكي لتحسين الأداء

#### 2. `Header.tsx`
تم تطوير الهيدر ليشمل:
- بحث فوري في سطح المكتب
- بحث منسدل في الموبايل
- عرض النتائج مع الأيقونات
- التنقل المباشر للنتائج

#### 3. `AdvancedSearch.tsx`
مكون البحث المتقدم مع:
- فلاتر متقدمة حسب نوع البيانات
- واجهة احترافية
- نتائج مفصلة مع الأوصاف

#### 4. `useSearch.ts`
Hook مخصص للبحث يتيح:
- إدارة حالة البحث
- البحث التلقائي أو اليدوي
- hooks مخصصة لكل نوع بيانات

#### 5. `QuickItemSearch.tsx`
بحث سريع للمنتجات مع:
- دعم البحث بالباركود
- ماسح الباركود المدمج
- عرض تفاصيل المنتج

#### 6. `QuickCustomerSearch.tsx`
بحث سريع للعملاء مع:
- البحث بالاسم والهاتف
- خيار إضافة عميل جديد
- عرض معلومات العميل

## طريقة الاستخدام

### 1. البحث من الهيدر
```tsx
// البحث متاح تلقائياً في الهيدر
// يمكن البحث بكتابة أي شيء والحصول على نتائج فورية
```

### 2. استخدام البحث المتقدم
```tsx
import AdvancedSearch from '@/components/AdvancedSearch';

<AdvancedSearch
  onResultSelect={(result) => {
    console.log('النتيجة المختارة:', result);
    // التعامل مع النتيجة
  }}
  enableFilters={true}
  defaultTypes={['invoice', 'customer']}
/>
```

### 3. استخدام Hook البحث
```tsx
import { useSearch } from '@/hooks/useSearch';

const MyComponent = () => {
  const {
    query,
    setQuery,
    results,
    isSearching,
    search,
    clearSearch
  } = useSearch({
    types: ['customer', 'item'],
    limit: 10,
    debounceMs: 300
  });

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحث..."
      />
      {isSearching && <div>جاري البحث...</div>}
      {results.map(result => (
        <div key={result.id}>{result.title}</div>
      ))}
    </div>
  );
};
```

### 4. البحث في المنتجات
```tsx
import QuickItemSearch from '@/components/QuickItemSearch';

<QuickItemSearch
  onItemSelect={(item) => {
    console.log('تم اختيار:', item);
  }}
  showBarcodeButton={true}
/>
```

### 5. البحث في العملاء
```tsx
import QuickCustomerSearch from '@/components/QuickCustomerSearch';

<QuickCustomerSearch
  onCustomerSelect={(customer) => {
    console.log('تم اختيار العميل:', customer);
  }}
  showAddNew={true}
  onAddNew={() => {
    // فتح نموذج إضافة عميل جديد
  }}
/>
```

## خصائص متقدمة

### 1. البحث بالباركود
```tsx
import { searchService } from '@/services/searchService';

const searchByBarcode = async (barcode: string) => {
  const results = await searchService.searchByBarcode(barcode);
  if (results.length > 0) {
    console.log('تم العثور على المنتج:', results[0]);
  }
};
```

### 2. البحث المخصص
```tsx
const customSearch = async () => {
  const results = await searchService.universalSearch({
    query: 'أحمد',
    types: ['customer', 'invoice'],
    limit: 20
  });
  console.log('النتائج:', results);
};
```

### 3. Hooks مخصصة
```tsx
import { 
  useInvoiceSearch,
  useCustomerSearch,
  useItemSearch 
} from '@/hooks/useSearch';

// البحث في الفواتير فقط
const { results: invoices } = useInvoiceSearch();

// البحث في العملاء فقط
const { results: customers } = useCustomerSearch();

// البحث في المنتجات فقط
const { results: items } = useItemSearch();
```

## تحسينات الأداء

### 1. Cache System
- النتائج محفوظة مؤقتاً لمدة 5 دقائق
- تقليل استعلامات قاعدة البيانات
- استجابة أسرع للمستخدم

### 2. Debouncing
- تأخير البحث 300ms بعد التوقف عن الكتابة
- تقليل العمليات غير الضرورية
- تحسين تجربة المستخدم

### 3. Lazy Loading
- تحميل النتائج حسب الحاجة
- تحديد عدد النتائج المعروضة
- أداء أفضل مع كميات البيانات الكبيرة

## التخصيص

### 1. إضافة نوع بيانات جديد
```tsx
// في searchService.ts
private async searchNewType(searchTerm: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  
  try {
    const snapshot = await getDocs(collection(db, 'new_collection'));
    // منطق البحث
    return results;
  } catch (error) {
    console.error('خطأ في البحث:', error);
    return [];
  }
}
```

### 2. تخصيص واجهة البحث
```tsx
// تخصيص الألوان والأيقونات
const getResultTypeColor = (type: SearchResult['type']) => {
  const colors = {
    // ألوان مخصصة
  };
  return colors[type];
};
```

## أمثلة عملية

### مثال 1: صفحة الفواتير
راجع `InvoicesWithSearchExample.tsx` لمثال كامل على استخدام النظام في صفحة الفواتير.

### مثال 2: البحث العام
راجع `SearchPage.tsx` لصفحة البحث الرئيسية.

## الأمان والأداء

### 1. التحقق من الصلاحيات
- يتم البحث فقط في البيانات المسموحة للمستخدم
- فلترة النتائج حسب صلاحيات المستخدم

### 2. حماية من الاستعلامات الضارة
- تحديد طول النص المطلوب للبحث
- حماية من SQL Injection
- تحديد عدد النتائج المعروضة

### 3. مراقبة الأداء
- تتبع أوقات الاستجابة
- مراقبة استخدام الذاكرة
- تحسين الاستعلامات

## المتطلبات

### Firebase Collections المطلوبة:
- `sales_invoices`
- `customers`
- `suppliers`
- `inventory_items`
- `accounts`
- `branches`
- `warehouses`
- `sales_returns`
- `purchases_invoices`
- `delegates`
- `cashBoxes`

### Dependencies:
- `firebase/firestore`
- `framer-motion`
- `lucide-react`
- `React Router`

## الدعم والصيانة

لأي استفسارات أو مشاكل تقنية، يرجى مراجعة:
1. ملفات الأمثلة المرفقة
2. التعليقات في الكود
3. وثائق Firebase Firestore

---

تم تطوير هذا النظام ليكون مرناً وقابلاً للتوسع ويدعم جميع احتياجات البحث في النظام.
