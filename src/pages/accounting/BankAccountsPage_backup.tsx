import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Input,
  Card,
  Modal,
  Select,
  Table,
  Tag,
  Alert,
  Form,
  message,
  Space,
  Typography,
  Row,
  Col,
  Spin
} from 'antd';
import { PlusOutlined, DownloadOutlined, EditOutlined, DeleteOutlined, BankOutlined } from '@ant-design/icons';
import {
  fetchBankAccounts,
  addBankAccount,
  addBankAccountWithSubAccount,
  updateBankAccount,
  deleteBankAccount,
  deleteBankAccountWithSubAccount,
  BankAccount as FirebaseBankAccount
} from '@/services/bankAccountsService';
import { fetchBranches, Branch } from '../../utils/branches';
import Breadcrumb from '@/components/Breadcrumb';
import { getMainAccounts, getAccountsByLevel, getAccountLevels, Account } from '../../services/accountsService';

const { Title, Text } = Typography;
const { Option } = Select;


type BankAccount = FirebaseBankAccount;

interface BankAccountsPageProps {
  onBack?: () => void;
}

const BankAccountsPage: React.FC<BankAccountsPageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [form] = Form.useForm();
  const [errors, setErrors] = useState<{ 
    arabicName?: string; 
    englishName?: string;
    branch?: string;
    mainAccount?: string;
  }>({});
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [mainAccounts, setMainAccounts] = useState<Account[]>([]);
  const [accountLevels, setAccountLevels] = useState<number[]>([]);
  const [accountsByLevel, setAccountsByLevel] = useState<Account[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
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
    fetchBranches().then(setBranches);
    getMainAccounts().then(setMainAccounts);
    getAccountLevels().then(setAccountLevels);
  }, []);

  const handleAdd = () => {
    setEditingAccount(null);
    setFormData({ arabicName: '', englishName: '', branch: '', mainAccount: '' });
    setSelectedLevel(null);
    setAccountsByLevel([]);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      arabicName: account.arabicName,
      englishName: account.englishName,
      branch: account.branch || '',
      mainAccount: account.mainAccount || ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا البنك؟')) {
      try {
        await deleteBankAccountWithSubAccount(id);
        setSuccessMessage('تم حذف البنك والحساب الفرعي بنجاح');
        loadAccounts();
      } catch (e) {
        setSuccessMessage('حدث خطأ أثناء حذف البنك');
      } finally {
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };

  const handleLevelChange = async (level: string) => {
    setSelectedLevel(level);
    const accounts = await getAccountsByLevel(parseInt(level));
    setAccountsByLevel(accounts);
    // Clear the selected account when level changes
    setFormData({ ...formData, mainAccount: '' });
  };

  const validateForm = () => {
    const newErrors: { 
      arabicName?: string; 
      englishName?: string;
      branch?: string;
      mainAccount?: string;
    } = {};

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

    if (!formData.branch.trim()) {
      newErrors.branch = 'يرجى اختيار الفرع';
    }

    if (!formData.mainAccount.trim()) {
      newErrors.mainAccount = 'يرجى اختيار الحساب الأب';
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
        await addBankAccountWithSubAccount({
          arabicName: formData.arabicName,
          englishName: formData.englishName,
          branch: formData.branch,
          mainAccount: formData.mainAccount
        });
        setSuccessMessage('تم إضافة البنك والحساب الفرعي بنجاح');
      }
      setIsModalOpen(false);
      setFormData({ arabicName: '', englishName: '', branch: '', mainAccount: '' });
      setSelectedLevel(null);
      setAccountsByLevel([]);
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
            <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          <Building2 className="h-8 w-8 text-blue-600 ml-3" />
          <h1 className="text-2xl font-bold text-gray-800">ادارة الحسابات البنكية</h1>
        </div>
        <p className="text-gray-600 mt-2">إدارة الحسابات البنكية</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
      </div>
                               <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "الادارة الماليه", to: "/management/financial" }, 
          { label: "البنوك" },
        ]}
      />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <CardTitle className=" text-gray-800">الحسابات البنكية</CardTitle>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
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
                      onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
                      placeholder="أدخل اسم البنك بالعربية"
                    />
                    {errors.arabicName && (
                      <p className="text-sm text-red-600">{errors.arabicName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="englishName">الاسم الأجنبي</Label>
                    <Input
                      value={formData.englishName}
                      onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                      placeholder="Enter bank name in English"
                    />
                    {errors.englishName && (
                      <p className="text-sm text-red-600">{errors.englishName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch">الفرع</Label>
                    <Select
                      value={formData.branch}
                      onValueChange={(value) => setFormData({ ...formData, branch: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفرع" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map(branch => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.branch && (
                      <p className="text-sm text-red-600">{errors.branch}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountLevel">مستوى الحساب</Label>
                    <Select
                      value={selectedLevel || ""}
                      onValueChange={handleLevelChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مستوى الحساب" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountLevels.map(level => (
                          <SelectItem key={level} value={level.toString()}>
                            المستوى {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mainAccount">الحساب الأب</Label>
                    <Select
                      value={formData.mainAccount}
                      onValueChange={(value) => setFormData({ ...formData, mainAccount: value })}
                      disabled={!selectedLevel}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحساب الأب" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountsByLevel.map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.nameAr} - {account.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.mainAccount && (
                      <p className="text-sm text-red-600">{errors.mainAccount}</p>
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

          <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
            <Table className="min-w-full text-sm">
              <TableHeader>
                <TableRow className="bg-blue-600 border-b border-blue-700 select-none">
                  <TableHead className="text-center w-20 font-bold text-white border-l border-blue-700">الترقيم</TableHead>
                  <TableHead className="text-right font-bold text-white border-l border-blue-700">اسم البنك</TableHead>
                  <TableHead className="text-left font-bold text-white border-l border-blue-700">الاسم الأجنبي</TableHead>
                  <TableHead className="text-right font-bold text-white border-l border-blue-700">الفرع</TableHead>
                  <TableHead className="text-right font-bold text-white border-l border-blue-700">الحساب الفرعي</TableHead>
                  <TableHead className="text-center w-32 font-bold text-white">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">جاري التحميل...</TableCell>
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
                      <TableCell className="text-right border-l border-gray-200 align-middle">
                        {branches.find(b => b.id === account.branch)?.name || 'غير محدد'}
                      </TableCell>
                      <TableCell className="text-right border-l border-gray-200 align-middle">
                        {account.subAccountCode || 'لم يتم إنشاء حساب فرعي'}
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
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      لا توجد بيانات
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

        

      
        </CardContent>
        </Card>
    </div>
  );
};

export default BankAccountsPage;