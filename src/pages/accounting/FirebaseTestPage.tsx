import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { 
  getAccounts, 
  addAccount, 
  deleteAccount, 
  type Account,
  type AccountInput 
} from '@/services/accountsService';
import { addSampleAccounts } from '@/utils/sampleData';

const FirebaseTestPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      const firebaseAccounts = await getAccounts();
      setAccounts(firebaseAccounts);
      toast.success(`تم تحميل ${firebaseAccounts.length} حساب من Firebase`);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('فشل في تحميل الحسابات من Firebase');
    } finally {
      setIsLoading(false);
    }
  };

  const addTestAccount = async () => {
    try {
      const testAccount: AccountInput = {
        code: `TEST${Date.now()}`,
        nameAr: 'حساب تجريبي',
        nameEn: 'Test Account',
        nature: 'مدينة',
        balance: 1000
      };

      await addAccount(testAccount);
      toast.success('تم إضافة الحساب التجريبي بنجاح');
      await loadAccounts(); // Reload accounts
    } catch (error) {
      console.error('Error adding test account:', error);
      toast.error('فشل في إضافة الحساب التجريبي');
    }
  };

  const addSampleData = async () => {
    try {
      await addSampleAccounts();
      toast.success('تم إضافة البيانات التجريبية بنجاح');
      await loadAccounts(); // Reload accounts
    } catch (error) {
      console.error('Error adding sample data:', error);
      toast.error('فشل في إضافة البيانات التجريبية');
    }
  };

  const deleteAllAccounts = async () => {
    if (!window.confirm('هل أنت متأكد من حذف جميع الحسابات؟')) {
      return;
    }

    try {
      for (const account of accounts) {
        await deleteAccount(account.id);
      }
      toast.success('تم حذف جميع الحسابات');
      setAccounts([]);
    } catch (error) {
      console.error('Error deleting accounts:', error);
      toast.error('فشل في حذف الحسابات');
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  return (
    <div className="w-full p-6 space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>اختبار Firebase - إدارة الحسابات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button onClick={loadAccounts} disabled={isLoading}>
              {isLoading ? 'جاري التحميل...' : 'تحميل الحسابات'}
            </Button>
            <Button onClick={addTestAccount} variant="outline">
              إضافة حساب تجريبي
            </Button>
            <Button onClick={addSampleData} variant="outline">
              إضافة بيانات تجريبية
            </Button>
            <Button onClick={deleteAllAccounts} variant="destructive">
              حذف جميع الحسابات
            </Button>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">
              الحسابات المحملة من Firebase ({accounts.length})
            </h3>
            
            {accounts.length === 0 ? (
              <p className="text-gray-500">لا توجد حسابات</p>
            ) : (
              <div className="space-y-2">
                {accounts.map((account) => (
                  <div 
                    key={account.id} 
                    className="p-3 border rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium">{account.code}</span> - 
                      <span className="mx-2">{account.nameAr}</span> - 
                      <span className="text-sm text-gray-600">{account.nameEn}</span>
                    </div>
                    <div className="text-sm">
                      <span className="mx-2">{account.nature}</span>
                      <span>{account.balance.toLocaleString()} ريال</span>
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

export default FirebaseTestPage;
