# نظام إدارة المبيعات والمندوبين

## نظرة عامة

هذا النظام عبارة عن حل متكامل لإدارة المبيعات والمندوبين في نظام ERP90. يوفر النظام إدارة شاملة للمندوبين، أهدافهم، عمولاتهم، وتقييم أدائهم بطريقة مترابطة ومتكاملة.

## الصفحات المتاحة

### 1. إدارة المندوبين (`/management/sales-representatives`)
- **الوصف**: الصفحة الرئيسية لإدارة المندوبين
- **الميزات**:
  - عرض قائمة جميع المندوبين مع معلوماتهم الأساسية
  - إضافة مندوبين جدد
  - تعديل بيانات المندوبين الموجودين
  - حذف المندوبين
  - فلترة حسب الحالة والفرع
  - عرض إحصائيات سريعة (إجمالي المندوبين، النشطين، المبيعات، العمولات)
  - أزرار تنقل سريع لباقي الصفحات

### 2. تقييم الأداء (`/management/performance-evaluation`)
- **الوصف**: تقييم أداء المندوبين بناءً على المبيعات والأهداف المحققة
- **الميزات**:
  - حساب نقاط الأداء التلقائي بناءً على:
    - نسبة تحقيق الأهداف (50 نقطة)
    - حجم المبيعات (30 نقطة)
    - عدد العملاء الجدد (20 نقطة)
  - تصنيف المندوبين (ممتاز، جيد، متوسط، ضعيف)
  - عرض تصنيفات أفضل المندوبين
  - فلترة حسب المندوب والفترة الزمنية

### 3. عمولات المبيعات (`/management/sales-commissions`)
- **الوصف**: إدارة عمولات المندوبين وحساباتها
- **الميزات**:
  - حساب العمولات التلقائي من المبيعات الفعلية
  - إدارة حالات العمولات (في الانتظار، موافق عليها، تم الدفع)
  - إضافة مكافآت وخصومات
  - فلترة حسب المندوب والحالة
  - تتبع تواريخ الدفع

### 4. أهداف المبيعات (`/management/sales-targets`)
- **الوصف**: تحديد ومتابعة أهداف المندوبين
- **الميزات**:
  - تحديد أهداف شهرية، ربع سنوية، وسنوية
  - متابعة التقدم التلقائي بناءً على المبيعات الفعلية
  - حساب نسب الإنجاز
  - تحديث حالة الأهداف تلقائياً (في الانتظار، قيد التنفيذ، تم تحقيقه، لم يتحقق)
  - فلترة حسب المندوب والحالة

## التكامل بين الصفحات

### التنقل المترابط
- كل صفحة تحتوي على أزرار تنقل سريع للصفحات الأخرى
- إمكانية الانتقال المباشر من صفحة لأخرى مع الاحتفاظ بفلتر المندوب المحدد
- رابط "العودة للمندوبين" في كل صفحة فرعية

### مشاركة البيانات
- **المبيعات الفعلية**: يتم جلبها من `sales_invoices` وتستخدم في:
  - حساب العمولات
  - تقييم الأداء
  - متابعة تقدم الأهداف

- **بيانات المندوبين**: مشتركة عبر جميع الصفحات من `salesRepresentatives`

- **حساب التقييمات**: يعتمد على بيانات الأهداف والعمولات والمبيعات

### الخدمات المشتركة

#### 1. `SalesRepresentativeService`
```typescript
// جلب جميع المندوبين
const representatives = await SalesRepresentativeService.getAll();

// إضافة مندوب جديد
const id = await SalesRepresentativeService.create(newRepData);

// تحديث مندوب
await SalesRepresentativeService.update(id, updateData);
```

#### 2. `SalesTargetService`
```typescript
// جلب أهداف مندوب محدد
const targets = await SalesTargetService.getByRepresentative(repId);

// إنشاء هدف جديد
await SalesTargetService.create(targetData);
```

#### 3. `SalesCommissionService`
```typescript
// حساب العمولة
const finalAmount = SalesCommissionService.calculateCommission(
  totalSales, commissionRate, bonusAmount, deductions
);
```

#### 4. `PerformanceEvaluationService`
```typescript
// حساب بيانات الأداء
const performanceData = await PerformanceEvaluationService
  .calculatePerformanceData(representatives);
```

### الخطاطات المخصصة (Custom Hooks)

#### 1. `useSalesRepresentatives()`
```typescript
const {
  representatives,
  loading,
  createRepresentative,
  updateRepresentative,
  deleteRepresentative
} = useSalesRepresentatives();
```

#### 2. `useSalesTargets(representativeId?)`
```typescript
const {
  targets,
  loading,
  createTarget,
  updateTarget
} = useSalesTargets(selectedRepId);
```

#### 3. `useSalesCommissions(representativeId?)`
```typescript
const {
  commissions,
  loading,
  calculateCommission
} = useSalesCommissions(selectedRepId);
```

#### 4. `usePerformanceEvaluation()`
```typescript
const {
  performanceData,
  loading
} = usePerformanceEvaluation();
```

## سير العمل النموذجي

### 1. إضافة مندوب جديد
1. الذهاب لصفحة إدارة المندوبين
2. الضغط على "إضافة مندوب جديد"
3. ملء البيانات (الاسم، الإيميل، الهاتف، الفرع، القسم، نسبة العمولة)
4. الحفظ

### 2. تحديد أهداف للمندوب
1. من صفحة المندوبين، الضغط على أيقونة الأهداف بجانب المندوب
2. أو الذهاب لصفحة الأهداف وفلترة حسب المندوب
3. إضافة هدف جديد مع تحديد الفترة والمبلغ المطلوب

### 3. متابعة الأداء
1. المبيعات تتم من صفحة المبيعات العادية
2. النظام يحسب التقدم تلقائياً
3. يمكن مراجعة الأداء من صفحة تقييم الأداء
4. العمولات تحسب تلقائياً ويمكن مراجعتها من صفحة العمولات

## الفلاتر والبحث

### الفلاتر المتاحة
- **حسب المندوب**: متاح في جميع الصفحات
- **حسب الحالة**: متاح في الأهداف والعمولات
- **حسب الفرع**: متاح في صفحة المندوبين
- **حسب الفترة الزمنية**: متاح في تقييم الأداء

### البحث النصي
- البحث في أسماء المندوبين
- البحث في الإيميلات وأرقام الهاتف
- البحث حسب الفرع أو القسم

## الإحصائيات المتاحة

### صفحة المندوبين
- إجمالي المندوبين
- المندوبين النشطين
- إجمالي المبيعات
- إجمالي العمولات

### صفحة تقييم الأداء
- إجمالي المبيعات للفترة
- متوسط نقاط الأداء
- عدد المتميزين
- إجمالي العمولات

### صفحة العمولات
- إجمالي العمولات
- العمولات في الانتظار
- العمولات الموافق عليها
- إجمالي المبلغ المدفوع

### صفحة الأهداف
- إجمالي الأهداف
- الأهداف النشطة
- الأهداف المحققة
- الأهداف المنتهية الصلاحية

## ملاحظات التطوير

### هيكل الملفات
```
src/
  pages/management/
    SalesRepresentativesPage.tsx    # إدارة المندوبين
    PerformanceEvaluationPage.tsx   # تقييم الأداء
    SalesCommissionsPage.tsx        # عمولات المبيعات
    SalesTargetsPage.tsx            # أهداف المبيعات
    SalesManagement.tsx             # الصفحة الرئيسية
  
  services/
    salesManagementService.ts       # الخدمات المشتركة
  
  hooks/
    useSalesManagement.ts          # الخطاطات المخصصة
```

### قاعدة البيانات
```
collections:
  salesRepresentatives/          # بيانات المندوبين
  salesTargets/                 # أهداف المبيعات
  salesCommissions/             # عمولات المبيعات
  sales_invoices/              # فواتير المبيعات (للحساب)
  branches/                    # بيانات الفروع
```

### التوجيه
```typescript
// في App.tsx أو Index.tsx
<Route path="/management/sales-representatives" element={<SalesRepresentativesPage />} />
<Route path="/management/performance-evaluation" element={<PerformanceEvaluationPage />} />
<Route path="/management/sales-commissions" element={<SalesCommissionsPage />} />
<Route path="/management/sales-targets" element={<SalesTargetsPage />} />
```

## المتطلبات التقنية

### المكتبات المستخدمة
- React 18+
- TypeScript
- Ant Design (antd)
- React Router Dom
- Firebase/Firestore
- Day.js

### المتغيرات البيئية
تأكد من إعداد Firebase في `src/lib/firebase.ts`

### الأذونات المطلوبة
- قراءة وكتابة في جميع الـ collections المذكورة
- رفع الملفات (للصور الشخصية للمندوبين)

هذا النظام يوفر حل متكامل ومترابط لإدارة المبيعات والمندوبين مع تجربة مستخدم سلسة وبيانات متسقة عبر جميع الصفحات.
