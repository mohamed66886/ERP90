import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  FileText,
  X,
  Edit,
  Trash2,
  Loader2,
  Search,
  Plus,
  Download,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { getAccounts, addAccount, deleteAccount, type Account } from '@/services/accountsService';
  // ...existing code...


interface AccountsSettlementPageProps {
  onNavigateToAdd?: () => void;
  onNavigateToEdit?: (account: Account) => void;
  accounts?: Account[];
  onDeleteAccount?: (id: string) => void;
}


const AccountsSettlementPage: React.FC<AccountsSettlementPageProps> = ({ 
  onNavigateToAdd, 
  onNavigateToEdit,
  accounts: externalAccounts,
  onDeleteAccount 
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterBalance, setFilterBalance] = useState<'all' | 'positive' | 'zero' | 'negative'>('all');

  // Get unique level 1 account names for filter options
  const getLevel1AccountNames = () => {
    const level1Accounts = accounts.filter(account => account.level === 1);
    return [...new Set(level1Accounts.map(account => account.nameAr))];
  };

  // Load accounts from Firebase
  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      console.log('Loading accounts from Firebase...');
      const firebaseAccounts = await getAccounts();
      console.log('Accounts loaded:', firebaseAccounts);
      setAccounts(firebaseAccounts);
      if (firebaseAccounts.length === 0) {
        toast.info('لا توجد حسابات في قاعدة البيانات. يمكنك إضافة حسابات جديدة.');
      } else {
        toast.success(`تم تحميل ${firebaseAccounts.length} حساب من قاعدة البيانات`);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error(`فشل في تحميل الحسابات: ${error.message || 'خطأ غير معروف'}`);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load accounts on component mount
  useEffect(() => {
    // Always load from Firebase first, ignore external accounts for now
    loadAccounts();
  }, []);

  const filteredAccounts = accounts.filter(account => {
    // فلترة المستوى الأول فقط
    const isLevelOne = account.level === 1;
    
    // فلترة النص
    const matchesSearch = account.code.includes(searchTerm) ||
      account.nameAr.includes(searchTerm) ||
      account.nameEn.toLowerCase().includes(searchTerm.toLowerCase());
    
    // فلترة النوع (استخدام اسم الحساب كتصنيف للمستوى الأول)
    const matchesType = filterType === 'all' || account.nameAr === filterType;
    
    // فلترة الرصيد
    let matchesBalance = true;
    if (filterBalance === 'positive') {
      matchesBalance = account.balance > 0;
    } else if (filterBalance === 'zero') {
      matchesBalance = account.balance === 0;
    } else if (filterBalance === 'negative') {
      matchesBalance = account.balance < 0;
    }
    
    return isLevelOne && matchesSearch && matchesType && matchesBalance;
  }).sort((a, b) => {
    // ترتيب الحسابات بناءً على الكود من الصغير إلى الكبير
    const codeA = parseInt(a.code) || 0;
    const codeB = parseInt(b.code) || 0;
    return codeA - codeB;
  });

  const handleDeleteAccount = async (id: string) => {
    // التحقق من وجود حسابات فرعية
    const accountToDelete = accounts.find(acc => acc.id === id);
    const subAccountsCount = accounts.filter(acc => acc.parentId === id).length;
    
    if (subAccountsCount > 0) {
      toast.error(`لا يمكن حذف الحساب "${accountToDelete?.nameAr}" لأنه يحتوي على ${subAccountsCount} حساب فرعي. يجب حذف الحسابات الفرعية أولاً.`);
      return;
    }
    
    if (window.confirm(`هل أنت متأكد من حذف الحساب "${accountToDelete?.nameAr}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
      try {
        setIsLoading(true);
        console.log('Deleting account with ID:', id);
        
        // Always use Firebase delete function
        await deleteAccount(id);
        console.log('Account deleted successfully');
        
        toast.success(`تم حذف الحساب "${accountToDelete?.nameAr}" بنجاح`);
        
        // Reload accounts from Firebase to reflect changes
        await loadAccounts();
        
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error(`فشل في حذف الحساب: ${error.message || 'خطأ غير معروف'}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditClick = (account: Account) => {
    console.log('Editing account:', account);
    toast.info(`جاري تحميل بيانات الحساب: ${account.nameAr}`);
    if (onNavigateToEdit) {
      onNavigateToEdit(account);
    }
  };

  const handleAddClick = () => {
    console.log('Add button clicked');
    if (onNavigateToAdd) {
      onNavigateToAdd();
    }
  };

  // ...existing code...

  const exportToCSV = () => {
    const headers = ['كود الحساب', 'اسم الحساب (عربي)', 'اسم الحساب (انجليزي)', 'عدد الحسابات الفرعية', 'طبيعة الحساب', 'الرصيد'];
    const csvContent = [
      headers.join(','),
      ...filteredAccounts.map(account => {
        const subAccountsCount = accounts.filter(acc => acc.parentId === account.id).length;
        return [
          account.code, 
          account.nameAr, 
          account.nameEn, 
          subAccountsCount,
          account.nature || 'غير محدد', 
          account.balance
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'main_accounts_level1.csv';
    link.click();
  };

  return (
    <div className="w-full p-6 space-y-6 min-h-screen" dir="rtl">
      {/* Header */}
      <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          <FileText className="h-8 w-8 text-blue-600 ml-3" />
          <h1 className="text-2xl font-bold text-gray-800">تصنيف الحسابات</h1>
        </div>
        <p className="text-gray-600 mt-2">إدارة وتصنيف الحسابات المالية</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">قائمة الحسابات</CardTitle>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                {isLoading ? (
                  <span>جاري التحميل...</span>
                ) : (
                  <>
                    <span>إجمالي: {accounts.filter(a => a.level === 1).length} حساب رئيسي</span>
                    <span>•</span>
                    <span>المعروض: {filteredAccounts.length} نتيجة</span>
                    <span>•</span>
                    <span className="text-blue-600">حسابات المستوى الأول فقط</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              {/* Search Input */}
              <div className="relative" style={{ minWidth: 280 }}>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="البحث بالكود أو الاسم..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 hover:border-blue-400"
                    style={{
                      fontFamily: 'Cairo, Tajawal, sans-serif',
                      fontSize: 14,
                      borderRadius: 8,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select
                  value={filterType}
                  onValueChange={(value) => setFilterType(value)}
                >
                  <SelectTrigger 
                    className="h-11 w-32 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 hover:border-blue-400"
                    style={{
                      fontFamily: 'Cairo, Tajawal, sans-serif',
                      fontSize: 14,
                      borderRadius: 8,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <SelectValue placeholder="النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الأنواع</SelectItem>
                    {getLevel1AccountNames().map((accountName) => (
                      <SelectItem key={accountName} value={accountName}>
                        {accountName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterBalance}
                  onValueChange={(value) => setFilterBalance(value as 'all' | 'positive' | 'zero' | 'negative')}
                >
                  <SelectTrigger 
                    className="h-11 w-32 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 hover:border-blue-400"
                    style={{
                      fontFamily: 'Cairo, Tajawal, sans-serif',
                      fontSize: 14,
                      borderRadius: 8,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <SelectValue placeholder="الرصيد" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الأرصدة</SelectItem>
                    <SelectItem value="positive">موجب</SelectItem>
                    <SelectItem value="zero">صفر</SelectItem>
                    <SelectItem value="negative">سالب</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={loadAccounts} 
                  disabled={isLoading}
                  variant="outline"
                  className="h-11 px-4 flex items-center gap-2 font-medium transition-all duration-200"
                  style={{
                    fontFamily: 'Cairo, Tajawal, sans-serif',
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'جاري التحميل...' : 'إعادة تحميل'}
                </Button>
                
                {(searchTerm || filterType !== 'all' || filterBalance !== 'all') && (
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('all');
                      setFilterBalance('all');
                    }}
                    variant="outline"
                    className="h-11 px-4 flex items-center gap-2 font-medium transition-all duration-200"
                    style={{
                      fontFamily: 'Cairo, Tajawal, sans-serif',
                      borderColor: '#6b7280',
                      color: '#6b7280',
                      backgroundColor: '#fff',
                      borderRadius: 8,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <X className="h-4 w-4" />
                    إعادة تعيين
                  </Button>
                )}
                
                {/* تم حذف زر إضافة حساب رئيسي "الأصول" */}
                
                <Button 
                  onClick={exportToCSV}
                  variant="outline"
                  className="h-11 px-4 flex items-center gap-2 font-medium transition-all duration-200"
                  style={{
                    fontFamily: 'Cairo, Tajawal, sans-serif',
                    borderColor: '#8b5cf6',
                    color: '#8b5cf6',
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <Download className="h-4 w-4" />
                  تصدير
                </Button>
                
                <Button 
                  onClick={handleAddClick}
                  className="h-11 px-4 flex items-center gap-2 font-medium transition-all duration-200"
                  style={{
                    fontFamily: 'Cairo, Tajawal, sans-serif',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    border: 'none',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                    color: '#fff'
                  }}
                >
                  <Plus className="h-4 w-4" />
                  إضافة حساب
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Active Filters Display */}
        {(searchTerm || filterType !== 'all' || filterBalance !== 'all') && (
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">الفلاتر النشطة:</span>
              {searchTerm && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  البحث: {searchTerm}
                </Badge>
              )}
              {filterType !== 'all' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  النوع: {filterType}
                </Badge>
              )}
              {filterBalance !== 'all' && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  الرصيد: {filterBalance === 'positive' ? 'موجب' : filterBalance === 'zero' ? 'صفر' : 'سالب'}
                </Badge>
              )}
            </div>
          </div>
        )}

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right w-16">#</TableHead>
                  <TableHead className="text-right">كود الحساب</TableHead>
                  <TableHead className="text-right">اسم الحساب (عربي)</TableHead>
                  <TableHead className="text-right">اسم الحساب (انجليزي)</TableHead>
                  <TableHead className="text-right">الحسابات الفرعية</TableHead>
                  <TableHead className="text-right">طبيعة الحساب</TableHead>
                  <TableHead className="text-right">الرصيد</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                        <p className="text-gray-500">جاري تحميل الحسابات...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-4">
                        <FileText className="h-12 w-12 text-gray-400" />
                        <div className="text-center">
                          <p className="text-gray-500 text-lg font-medium">لا توجد حسابات رئيسية متاحة</p>
                          <p className="text-gray-400 text-sm mt-1">
                            {accounts.filter(a => a.level === 1).length === 0 
                              ? 'لم يتم العثور على أي حسابات رئيسية (مستوى 1) في قاعدة البيانات'
                              : 'لا توجد نتائج تطابق البحث الحالي'
                            }
                          </p>
                          <p className="text-blue-600 text-xs mt-2">
                            💡 هذه الصفحة تعرض الحسابات الرئيسية (المستوى الأول) فقط
                          </p>
                          {/* لا تعرض زر إضافة حسابات تجريبية */}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAccounts.map((account, index) => {
                    // عد الحسابات الفرعية
                    const subAccountsCount = accounts.filter(acc => acc.parentId === account.id).length;
                    
                    return (
                      <TableRow key={account.id}>
                        <TableCell className="text-gray-500 font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium font-mono text-blue-600 bg-blue-50 rounded px-2 py-1">
                          {account.code}
                        </TableCell>
                        <TableCell className="font-medium">{account.nameAr}</TableCell>
                        <TableCell className="text-gray-600">{account.nameEn}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={subAccountsCount > 0 ? 'default' : 'secondary'}
                            className={
                              subAccountsCount > 0 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-600'
                            }
                          >
                            {subAccountsCount} حساب فرعي
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={account.nature === 'مدينة' ? 'default' : 'secondary'}
                            className={
                              account.nature === 'مدينة' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }
                          >
                            {account.nature}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-left" dir="ltr">
                          <span className={`font-medium ${account.balance > 0 ? 'text-green-600' : account.balance < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                            {account.balance.toLocaleString('ar-SA')} ريال
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(account)}
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="تعديل الحساب"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAccount(account.id)}
                              disabled={isLoading || subAccountsCount > 0}
                              className={`h-8 w-8 p-0 ${
                                subAccountsCount > 0 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                              }`}
                              title={
                                subAccountsCount > 0 
                                  ? `لا يمكن حذف هذا الحساب لأنه يحتوي على ${subAccountsCount} حساب فرعي`
                                  : "حذف الحساب"
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountsSettlementPage;
