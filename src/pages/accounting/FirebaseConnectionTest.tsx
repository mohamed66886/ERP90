import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';

const FirebaseConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    try {
      setIsLoading(true);
      setConnectionStatus('testing');
      
      console.log('Testing Firebase connection...');
      
      // Test reading from accounts collection
      const querySnapshot = await getDocs(collection(db, 'accounts'));
      const accountsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setAccounts(accountsData);
      setConnectionStatus('connected');
      
      toast.success(`تم الاتصال بـ Firebase بنجاح! تم العثور على ${accountsData.length} حساب`);
      
    } catch (error) {
      console.error('Firebase connection failed:', error);
      setConnectionStatus('failed');
      toast.error(`فشل الاتصال بـ Firebase: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addTestAccount = async () => {
    try {
      setIsLoading(true);
      
      const testAccount = {
        code: '9999',
        nameAr: 'حساب تجريبي',
        nameEn: 'Test Account',
        classification: 'اختبار',
        balance: 0,
        level: 1,
        status: 'نشط',
        hasSubAccounts: false,
        nature: 'مدينة',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'accounts'), testAccount);
      
      toast.success('تم إضافة حساب تجريبي بنجاح!');
      
      // Refresh the accounts list
      await testConnection();
      
    } catch (error) {
      console.error('Failed to add test account:', error);
      toast.error(`فشل في إضافة الحساب التجريبي: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>اختبار الاتصال بـ Firebase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'testing' ? 'bg-yellow-500 animate-pulse' :
              connectionStatus === 'connected' ? 'bg-green-500' :
              'bg-red-500'
            }`}></div>
            <span className="text-lg">
              {connectionStatus === 'testing' ? 'جاري اختبار الاتصال...' :
               connectionStatus === 'connected' ? 'متصل بنجاح' :
               'فشل الاتصال'}
            </span>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={testConnection} 
              disabled={isLoading}
              className="mr-2"
            >
              {isLoading ? 'جاري الاختبار...' : 'اختبار الاتصال'}
            </Button>
            
            <Button 
              onClick={addTestAccount} 
              disabled={isLoading || connectionStatus !== 'connected'}
              variant="outline"
            >
              إضافة حساب تجريبي
            </Button>
          </div>

          {accounts.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">الحسابات الموجودة ({accounts.length}):</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {accounts.map((account, index) => (
                  <div key={account.id || index} className="p-2 bg-gray-50 rounded">
                    <div className="text-sm">
                      <strong>{account.code}</strong> - {account.nameAr} ({account.nameEn})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FirebaseConnectionTest;
