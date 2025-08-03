import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addAccount, getAccounts } from '@/services/accountsService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import Typography from 'antd/lib/typography';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from 'sonner';
import { AlertCircle, ArrowRight, Plus } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';

interface Account {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  classification: string;
  nature: 'مدينة' | 'دائنة';
  balance: number;
  level?: number;
  createdAt: string;
}

interface AddAccountPageProps {
  onBack?: () => void;
  existingCodes?: string[];
}

const AddAccountPage: React.FC<AddAccountPageProps> = ({ 
  onBack, 
  existingCodes = [] 
}) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    classification: 'أصول',
    nature: '' as 'مدينة' | 'دائنة' | '',
    balance: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate Arabic name
    if (!formData.nameAr.trim()) {
      newErrors.nameAr = 'اسم الحساب بالعربية مطلوب';
    } else if (formData.nameAr.trim().length < 2) {
      newErrors.nameAr = 'اسم الحساب بالعربية يجب أن يكون حرفين على الأقل';
    }

    // Validate English name
    if (!formData.nameEn.trim()) {
      newErrors.nameEn = 'اسم الحساب بالإنجليزية مطلوب';
    } else if (formData.nameEn.trim().length < 2) {
      newErrors.nameEn = 'اسم الحساب بالإنجليزية يجب أن يكون حرفين على الأقل';
    }

    // Validate nature
    if (!formData.nature) {
      newErrors.nature = 'طبيعة الحساب مطلوبة';
    }

    // Validate balance
    if (formData.balance < 0) {
      newErrors.balance = 'الرصيد لا يمكن أن يكون سالباً';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateAccountCode = async (): Promise<string> => {
    try {
      const accounts = await getAccounts();
      // فلترة الحسابات المستوى الأول فقط
      const level1Accounts = accounts.filter(account => account.level === 1);
      
      if (level1Accounts.length === 0) {
        return '1000'; // الكود الأول
      }
      
      // الحصول على جميع الأكواد الموجودة وتحويلها لأرقام
      const codes = level1Accounts
        .map(account => parseInt(account.code))
        .filter(code => !isNaN(code))
        .sort((a, b) => a - b); // ترتيب تصاعدي
      
      if (codes.length === 0) {
        return '1000';
      }
      
      // البحث عن أول فجوة في التسلسل أو إضافة رقم جديد
      let nextCode = 1000;
      for (const code of codes) {
        if (code === nextCode) {
          nextCode += 1000;
        } else {
          break;
        }
      }
      
      return nextCode.toString();
    } catch (error) {
      console.error('Error generating account code:', error);
      return '1000'; // القيمة الافتراضية في حالة حدوث خطأ
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      // جلب جميع الحسابات الرئيسية للتحقق من التكرار
      const allAccounts = await getAccounts();
      const level1Accounts = allAccounts.filter(acc => acc.level === 1);
      const existsAr = level1Accounts.some(acc => acc.nameAr.trim() === formData.nameAr.trim());
      const existsEn = level1Accounts.some(acc => acc.nameEn.trim().toLowerCase() === formData.nameEn.trim().toLowerCase());
      if (existsAr || existsEn) {
        toast.error('يوجد حساب رئيسي بنفس الاسم العربي أو الإنجليزي بالفعل');
        setIsSubmitting(false);
        return;
      }
      // إنشاء كود تلقائي للحساب الرئيسي
      const autoCode = await generateAccountCode();
      // إضافة الحساب مباشرة إلى Firebase كمستوى أول
      const newAccount = {
        code: autoCode,
        nameAr: formData.nameAr,
        nameEn: formData.nameEn,
        classification: formData.nameAr, // التصنيف = اسم الحساب للمستوى الأول
        nature: formData.nature as 'مدينة' | 'دائنة',
        balance: formData.balance,
        level: 1,
        createdAt: new Date().toISOString()
      };
      await addAccount(newAccount);
      toast.success('تم حفظ الحساب بنجاح');
      setTimeout(() => {
        navigate('/accounting/accounts-settlement');
      }, 800);
    } catch (error) {
      console.error('Error adding account:', error);
      toast.error('حدث خطأ أثناء حفظ الحساب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="w-full p-6 space-y-6 min-h-screen" dir="rtl">
      {/* Header */}
      <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          <Plus className="h-8 w-8 text-blue-600 ml-3" />
          <h1 className="text-2xl font-bold text-gray-800">إضافة حساب جديد</h1>
        </div>
        <p className="text-gray-600 mt-2">إضافة حساب جديد إلى شجرة الحسابات</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
      </div>

                         <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "الادارة الماليه", to: "/management/financial" }, 
          { label: "تصنيف الحسابات" , to: "/accounting/accounts-settlement" },
          { label: "إضافة حساب جديد" },
        ]}
      />

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>بيانات الحساب</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Nature & Arabic Name */}
              <div className="flex flex-col md:flex-row gap-6 w-full md:col-span-2">
                <div className="space-y-2 w-full">
                  <Typography.Text className="text-sm font-medium text-gray-700">طبيعة الحساب *</Typography.Text>
                  <Select
                    value={formData.nature || undefined}
                    onChange={(value) => handleInputChange('nature', value)}
                    placeholder="اختر طبيعة الحساب"
                    style={{ width: '100%' }}
                    size="large"
                    allowClear
                  >
                    <Select.Option value="مدينة">مدينة</Select.Option>
                    <Select.Option value="دائنة">دائنة</Select.Option>
                  </Select>
                  {errors.nature && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{errors.nature}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2 w-full">
                  <Typography.Text className="text-sm font-medium text-gray-700">اسم الحساب (عربي) *</Typography.Text>
                  <Input
                    id="nameAr"
                    value={formData.nameAr}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('nameAr', e.target.value)}
                    placeholder="مثال: النقدية بالصندوق"
                    size="large"
                    status={errors.nameAr ? 'error' : ''}
                  />
                  {errors.nameAr && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{errors.nameAr}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* English Name & Balance */}
              <div className="flex flex-col md:flex-row gap-6 w-full md:col-span-2">
                <div className="space-y-2 w-full">
                  <Typography.Text className="text-sm font-medium text-gray-700">اسم الحساب (انجليزي) *</Typography.Text>
                  <Input
                    id="nameEn"
                    value={formData.nameEn}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('nameEn', e.target.value)}
                    placeholder="Example: Cash on Hand"
                    size="large"
                    status={errors.nameEn ? 'error' : ''}
                  />
                  {errors.nameEn && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{errors.nameEn}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2 w-full">
                  <Typography.Text className="text-sm font-medium text-gray-700">الرصيد الافتتاحي</Typography.Text>
                  <Input
                    id="balance"
                    type="number"
                    value={formData.balance}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('balance', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    size="large"
                    status={errors.balance ? 'error' : ''}
                  />
                  {errors.balance && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{errors.balance}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ الحساب'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddAccountPage;
