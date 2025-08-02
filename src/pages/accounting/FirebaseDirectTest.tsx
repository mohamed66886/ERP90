import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/services/firebase';

interface TestAccount {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  nature: 'مدينة' | 'دائنة';
  balance: number;
  createdAt: string;
}

const FirebaseDirectTest: React.FC = () => {
  const [accounts, setAccounts] = useState<TestAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testAccount, setTestAccount] = useState({
    code: '',
    nameAr: '',
    nameEn: '',
    nature: 'مدينة' as 'مدينة' | 'دائنة',
    balance: 0
  });

  // اختبار الاتصال المباشر مع Firebase
  const testDirectConnection = async () => {
    try {
      setIsLoading(true);
      toast.info('جاري اختبار الاتصال المباشر مع Firebase...');
      
      console.log('Testing direct Firebase connection...');
      
      // جلب البيانات مباشرة
      const q = query(collection(db, 'accounts'), orderBy('code', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const firebaseAccounts: TestAccount[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        code: doc.data().code || '',
        nameAr: doc.data().nameAr || '',
        nameEn: doc.data().nameEn || '',
        nature: doc.data().nature || 'مدينة',
        balance: doc.data().balance || 0,
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString()
      }));
      
      console.log('Direct Firebase accounts:', firebaseAccounts);
      setAccounts(firebaseAccounts);
      
      toast.success(`تم جلب ${firebaseAccounts.length} حساب مباشرة من Firebase`);
    } catch (error) {
      console.error('Direct Firebase connection failed:', error);
      toast.error(`فشل الاتصال المباشر: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // إضافة حساب مباشرة
  const addAccountDirect = async () => {
    if (!testAccount.code || !testAccount.nameAr || !testAccount.nameEn) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setIsLoading(true);
      toast.info('جاري إضافة الحساب مباشرة...');

      const accountData = {
        ...testAccount,
        balance: Number(testAccount.balance),
        createdAt: Timestamp.now()
      };

      console.log('Adding account directly:', accountData);
      
      const docRef = await addDoc(collection(db, 'accounts'), accountData);
      
      console.log('Account added with ID:', docRef.id);
      toast.success('تم إضافة الحساب بنجاح!');
      
      // إعادة تعيين النموذج
      setTestAccount({
        code: '',
        nameAr: '',
        nameEn: '',
        nature: 'مدينة',
        balance: 0
      });
      
      // إعادة جلب البيانات
      await testDirectConnection();
    } catch (error) {
      console.error('Direct add failed:', error);
      toast.error(`فشل في إضافة الحساب: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // حذف حساب مباشرة
  const deleteAccountDirect = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الحساب؟')) return;

    try {
      setIsLoading(true);
      toast.info('جاري حذف الحساب...');

      await deleteDoc(doc(db, 'accounts', id));
      
      console.log('Account deleted:', id);
      toast.success('تم حذف الحساب بنجاح!');
      
      // إعادة جلب البيانات
      await testDirectConnection();
    } catch (error) {
      console.error('Direct delete failed:', error);
      toast.error(`فشل في حذف الحساب: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // تحديث حساب مباشرة
  const updateAccountDirect = async (id: string, updates: Partial<TestAccount>) => {
    try {
      setIsLoading(true);
      toast.info('جاري تحديث الحساب...');

      await updateDoc(doc(db, 'accounts', id), {
        ...updates,
        updatedAt: Timestamp.now()
      });
      
      console.log('Account updated:', id, updates);
      toast.success('تم تحديث الحساب بنجاح!');
      
      // إعادة جلب البيانات
      await testDirectConnection();
    } catch (error) {
      console.error('Direct update failed:', error);
      toast.error(`فشل في تحديث الحساب: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    testDirectConnection();
  }, []);

  return (
    <div className="w-full p-6 space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>اختبار Firebase المباشر - إدارة الحسابات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* أزرار الاختبار */}
          <div className="flex gap-4 flex-wrap">
            <Button 
              onClick={testDirectConnection} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'جاري التحميل...' : 'جلب الحسابات'}
            </Button>
          </div>

          {/* نموذج إضافة حساب جديد */}
          <Card>
            <CardHeader>
              <CardTitle>إضافة حساب جديد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">كود الحساب</Label>
                  <Input
                    id="code"
                    value={testAccount.code}
                    onChange={(e) => setTestAccount(prev => ({...prev, code: e.target.value}))}
                    placeholder="مثال: 1001"
                  />
                </div>
                <div>
                  <Label htmlFor="nameAr">الاسم العربي</Label>
                  <Input
                    id="nameAr"
                    value={testAccount.nameAr}
                    onChange={(e) => setTestAccount(prev => ({...prev, nameAr: e.target.value}))}
                    placeholder="مثال: النقدية بالصندوق"
                  />
                </div>
                <div>
                  <Label htmlFor="nameEn">الاسم الإنجليزي</Label>
                  <Input
                    id="nameEn"
                    value={testAccount.nameEn}
                    onChange={(e) => setTestAccount(prev => ({...prev, nameEn: e.target.value}))}
                    placeholder="Example: Cash on Hand"
                  />
                </div>
                <div>
                  <Label htmlFor="balance">الرصيد</Label>
                  <Input
                    id="balance"
                    type="number"
                    value={testAccount.balance}
                    onChange={(e) => setTestAccount(prev => ({...prev, balance: Number(e.target.value) || 0}))}
                    placeholder="0"
                  />
                </div>
              </div>
              <Button 
                onClick={addAccountDirect} 
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'جاري الإضافة...' : 'إضافة الحساب'}
              </Button>
            </CardContent>
          </Card>

          {/* عرض الحسابات */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">
              الحسابات من Firebase ({accounts.length})
            </h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span>جاري التحميل...</span>
                </div>
              </div>
            ) : accounts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">لا توجد حسابات في Firebase</p>
            ) : (
              <div className="space-y-2">
                {accounts.map((account) => (
                  <div 
                    key={account.id} 
                    className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-blue-600">{account.code}</span>
                        <span className="font-medium">{account.nameAr}</span>
                        <span className="text-sm text-gray-600">{account.nameEn}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          account.nature === 'مدينة' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {account.nature}
                        </span>
                        <span className="text-sm">{account.balance?.toLocaleString?.()} ريال</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {account.id} | تاريخ الإنشاء: {new Date(account.createdAt).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateAccountDirect(account.id, {
                          balance: (account.balance || 0) + 100
                        })}
                        size="sm"
                        variant="outline"
                        disabled={isLoading}
                      >
                        +100
                      </Button>
                      <Button
                        onClick={() => deleteAccountDirect(account.id)}
                        size="sm"
                        variant="destructive"
                        disabled={isLoading}
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FirebaseDirectTest;
