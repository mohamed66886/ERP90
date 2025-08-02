import { addAccount } from './accountsService';

// بيانات تجريبية للحسابات
const sampleAccounts = [
  {
    code: '1001',
    nameAr: 'النقدية بالصندوق',
    nameEn: 'Cash on Hand',
    nature: 'مدينة' as const,
    balance: 15000
  },
  {
    code: '1002',
    nameAr: 'النقدية بالبنك',
    nameEn: 'Cash at Bank',
    nature: 'مدينة' as const,
    balance: 250000
  },
  {
    code: '2001',
    nameAr: 'حسابات دائنة',
    nameEn: 'Accounts Payable',
    nature: 'دائنة' as const,
    balance: 25000
  },
  {
    code: '2002',
    nameAr: 'أوراق دفع',
    nameEn: 'Notes Payable',
    nature: 'دائنة' as const,
    balance: 50000
  },
  {
    code: '3001',
    nameAr: 'رأس المال',
    nameEn: 'Capital',
    nature: 'دائنة' as const,
    balance: 100000
  },
  {
    code: '4001',
    nameAr: 'مبيعات',
    nameEn: 'Sales Revenue',
    nature: 'دائنة' as const,
    balance: 180000
  },
  {
    code: '5001',
    nameAr: 'مشتريات',
    nameEn: 'Purchases',
    nature: 'مدينة' as const,
    balance: 75000
  },
  {
    code: '6001',
    nameAr: 'مصاريف إدارية',
    nameEn: 'Administrative Expenses',
    nature: 'مدينة' as const,
    balance: 12000
  },
  {
    code: '6002',
    nameAr: 'مصاريف بيع وتسويق',
    nameEn: 'Selling & Marketing Expenses',
    nature: 'مدينة' as const,
    balance: 8000
  },
  {
    code: '7001',
    nameAr: 'إيرادات أخرى',
    nameEn: 'Other Income',
    nature: 'دائنة' as const,
    balance: 5000
  }
];

// دالة إضافة البيانات التجريبية
export const addSampleAccounts = async () => {
  try {
    console.log('بدء إضافة البيانات التجريبية...');
    
    for (const account of sampleAccounts) {
      try {
        await addAccount(account);
        console.log(`تم إضافة الحساب: ${account.nameAr} - ${account.code}`);
      } catch (error) {
        console.error(`فشل في إضافة الحساب ${account.code}:`, error);
      }
    }
    
    console.log('تم الانتهاء من إضافة البيانات التجريبية');
  } catch (error) {
    console.error('خطأ في إضافة البيانات التجريبية:', error);
  }
};

// استدعاء الدالة إذا تم تشغيل الملف مباشرة
// في المتصفح، يمكنك استدعاء:
// import { addSampleAccounts } from '@/lib/sampleData';
// addSampleAccounts();
