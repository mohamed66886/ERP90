# نظام إدارة الحسابات - Firebase Integration

تم ربط صفحات إدارة الحسابات بـ Firebase بنجاح. يتضمن النظام الميزات التالية:

## الميزات المتاحة

### 1. عرض الحسابات (AccountsSettlementPage)
- **التحميل من Firebase**: يتم تحميل جميع الحسابات تلقائياً من Firestore
- **البحث**: البحث في كود الحساب والأسماء العربية والإنجليزية
- **التصدير**: تصدير البيانات إلى ملف CSV
- **العمليات**: تعديل وحذف الحسابات

### 2. إضافة حساب جديد (AddAccountPage)
- **التحقق من التكرار**: يتم التحقق من عدم تكرار كود الحساب
- **التحقق من البيانات**: التحقق من صحة جميع البيانات المدخلة
- **الحفظ في Firebase**: يتم حفظ الحساب الجديد في Firestore
- **إشعارات**: إشعارات نجاح أو فشل العمليات

### 3. تعديل الحساب (EditAccountPage)
- **تحميل البيانات**: تحميل بيانات الحساب الحالية
- **التحديث**: تحديث البيانات في Firestore
- **التحقق**: التحقق من صحة البيانات قبل الحفظ

## طريقة الاستخدام

### استخدام الصفحة الرئيسية (موصى به)
```typescript
import { AccountsMainPage } from '@/pages/accounting';

function App() {
  return <AccountsMainPage />;
}
```

### استخدام الصفحات منفردة
```typescript
import { AccountsSettlementPage, AddAccountPage, EditAccountPage } from '@/pages/accounting';

// صفحة عرض الحسابات
<AccountsSettlementPage
  onNavigateToAdd={() => {/* انتقال لصفحة الإضافة */}}
  onNavigateToEdit={(account) => {/* انتقال لصفحة التعديل */}}
/>

// صفحة إضافة حساب
<AddAccountPage
  onBack={() => {/* العودة للصفحة الرئيسية */}}
  onSave={(account) => {/* حفظ الحساب */}}
/>

// صفحة تعديل حساب
<EditAccountPage
  account={selectedAccount}
  onBack={() => {/* العودة للصفحة الرئيسية */}}
  onSave={(account) => {/* حفظ التعديلات */}}
/>
```

## خدمات Firebase

### الخدمات المتاحة في `accountsService.ts`:

1. **getAccounts()**: جلب جميع الحسابات
2. **addAccount(accountData)**: إضافة حساب جديد
3. **updateAccount(id, accountData)**: تحديث حساب موجود
4. **deleteAccount(id)**: حذف حساب
5. **getAccountCodes()**: جلب جميع أكواد الحسابات (للتحقق من التكرار)
6. **searchAccounts(searchTerm)**: البحث في الحسابات

## هيكل البيانات في Firebase

```typescript
interface Account {
  id: string;           // معرف فريد من Firebase
  code: string;         // كود الحساب (أرقام فقط)
  nameAr: string;       // اسم الحساب بالعربية
  nameEn: string;       // اسم الحساب بالإنجليزية
  nature: 'مدينة' | 'دائنة';  // طبيعة الحساب
  balance: number;      // الرصيد
  createdAt: string;    // تاريخ الإنشاء
}
```

## مجموعة Firebase Collection

- **اسم المجموعة**: `accounts`
- **القواعد**: يجب تكوين قواعد الأمان في Firebase Console

## الإشعارات

يستخدم النظام مكتبة `sonner` لعرض الإشعارات:
- ✅ إشعارات النجاح عند إضافة أو تحديث أو حذف الحسابات
- ❌ إشعارات الخطأ عند فشل العمليات
- ⚠️ رسائل التحقق عند إدخال بيانات خاطئة

## المتطلبات

1. **Firebase**: مثبت ومكون في `src/lib/firebase.ts`
2. **Sonner**: مثبت للإشعارات
3. **React Hook Form**: للتحقق من صحة النماذج
4. **Lucide React**: للأيقونات

## ملاحظات مهمة

1. **الأمان**: تأكد من تكوين قواعد Firestore Security Rules بشكل صحيح
2. **التحقق**: يتم التحقق من صحة البيانات على مستوى الواجهة والخادم
3. **الأداء**: يتم تحميل البيانات مرة واحدة ويتم تحديثها حسب الحاجة
4. **الأخطاء**: جميع الأخطاء يتم التعامل معها وعرض رسائل مناسبة للمستخدم
