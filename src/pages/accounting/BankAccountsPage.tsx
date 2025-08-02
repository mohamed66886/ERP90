import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from 'antd';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Plus, Download, Edit, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  fetchBankAccounts,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
  BankAccount as FirebaseBankAccount
} from '@/services/bankAccountsService';


type BankAccount = FirebaseBankAccount;

interface BankAccountsPageProps {
  onBack?: () => void;
}

const BankAccountsPage: React.FC<BankAccountsPageProps> = ({ onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState({ arabicName: '', englishName: '' });
  const [errors, setErrors] = useState<{ arabicName?: string; englishName?: string }>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const accounts = await fetchBankAccounts();
      setBankAccounts(accounts);
    } catch (e) {
      setSuccessMessage('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    // eslint-disable-next-line
  }, []);

  const handleAdd = () => {
    setEditingAccount(null);
    setFormData({ arabicName: '', englishName: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      arabicName: account.arabicName,
      englishName: account.englishName,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا البنك؟')) {
      try {
        await deleteBankAccount(id);
        setSuccessMessage('تم حذف البنك بنجاح');
        loadAccounts();
      } catch (e) {
        setSuccessMessage('حدث خطأ أثناء حذف البنك');
      } finally {
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };

  const validateForm = () => {
    const newErrors: { arabicName?: string; englishName?: string } = {};

    if (!formData.arabicName.trim()) {
      newErrors.arabicName = 'يرجى إدخال اسم البنك';
    } else if (formData.arabicName.length < 2) {
      newErrors.arabicName = 'اسم البنك يجب أن يكون أكثر من حرفين';
    } else {
      // تحقق من التكرار (تجاهل البنك الجاري تعديله)
      const exists = bankAccounts.some(
        (acc) =>
          acc.arabicName.trim() === formData.arabicName.trim() &&
          (!editingAccount || acc.id !== editingAccount.id)
      );
      if (exists) {
        newErrors.arabicName = 'اسم البنك موجود بالفعل';
      }
    }

    if (!formData.englishName.trim()) {
      newErrors.englishName = 'يرجى إدخال الاسم الأجنبي للبنك';
    } else if (formData.englishName.length < 2) {
      newErrors.englishName = 'الاسم الأجنبي يجب أن يكون أكثر من حرفين';
    } else {
      const exists = bankAccounts.some(
        (acc) =>
          acc.englishName.trim().toLowerCase() === formData.englishName.trim().toLowerCase() &&
          (!editingAccount || acc.id !== editingAccount.id)
      );
      if (exists) {
        newErrors.englishName = 'الاسم الأجنبي موجود بالفعل';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingAccount && editingAccount.id) {
        await updateBankAccount(editingAccount.id, formData);
        setSuccessMessage('تم تحديث البنك بنجاح');
      } else {
        await addBankAccount(formData);
        setSuccessMessage('تم إضافة البنك بنجاح');
      }
      setIsModalOpen(false);
      setFormData({ arabicName: '', englishName: '' });
      loadAccounts();
    } catch (e) {
      setSuccessMessage('حدث خطأ أثناء الحفظ');
    } finally {
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['الترقيم', 'اسم البنك', 'الاسم الأجنبي'].join(','),
      ...bankAccounts.map((account, idx) =>
        [idx + 1, account.arabicName, account.englishName].join(',')
      )
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'bank_accounts.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccessMessage('تم تصدير البيانات بنجاح');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="w-full p-6 space-y-6 min-h-screen bg-gray-50" dir="rtl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              {onBack && (
                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="flex items-center space-x-2 space-x-reverse"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>رجوع</span>
                </Button>
              )}
              <CardTitle className="text-2xl font-bold text-gray-800">الحسابات البنكية</CardTitle>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {successMessage && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center space-x-2 space-x-reverse mb-6">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAdd} className="flex items-center space-x-2 space-x-reverse bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4" />
                  <span>جديد</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]" dir="rtl">
                <DialogHeader>
                  <DialogTitle>
                    {editingAccount ? 'تحديث بنك' : 'إضافة بنك جديد'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="arabicName">اسم البنك</Label>
                    <Input
                      value={formData.arabicName}
                      onChange={e => setFormData({ ...formData, arabicName: e.target.value })}
                      placeholder="أدخل اسم البنك بالعربية"
                      size="large"
                    />
                    {errors.arabicName && (
                      <p className="text-sm text-red-600">{errors.arabicName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="englishName">الاسم الأجنبي</Label>
                    <Input
                      value={formData.englishName}
                      onChange={e => setFormData({ ...formData, englishName: e.target.value })}
                      placeholder="Enter bank name in English"
                      size="large"
                    />
                    {errors.englishName && (
                      <p className="text-sm text-red-600">{errors.englishName}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                      إلغاء
                    </Button>
                    <Button onClick={handleSave}>
                      حفظ
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              onClick={handleExport}
              className="flex items-center space-x-2 space-x-reverse bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4" />
              <span>تصدير</span>
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
            <Table className="min-w-full text-sm">
              <TableHeader>
                <TableRow className="bg-blue-600 border-b border-blue-700 select-none">
                  <TableHead className="text-center w-20 font-bold text-white border-l border-blue-700">الترقيم</TableHead>
                  <TableHead className="text-right font-bold text-white border-l border-blue-700">اسم البنك</TableHead>
                  <TableHead className="text-left font-bold text-white border-l border-blue-700">الاسم الأجنبي</TableHead>
                  <TableHead className="text-center w-32 font-bold text-white">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">جاري التحميل...</TableCell>
                  </TableRow>
                ) : bankAccounts.length > 0 ? (
                  bankAccounts.map((account, idx) => (
                    <TableRow
                      key={account.id}
                      className={
                        (idx % 2 === 0 ? 'bg-white' : 'bg-gray-50') +
                        ' hover:bg-inherit'
                      }
                    >
                      <TableCell className="text-center font-medium border-l border-gray-200 align-middle">
                        <Badge variant="secondary">{idx + 1}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium border-l border-gray-200 align-middle">
                        {account.arabicName}
                      </TableCell>
                      <TableCell className="text-left border-l border-gray-200 align-middle">
                        {account.englishName}
                      </TableCell>
                      <TableCell className="text-center align-middle">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(account)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(account.id!)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      لا توجد بيانات
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {bankAccounts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد بيانات
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BankAccountsPage;