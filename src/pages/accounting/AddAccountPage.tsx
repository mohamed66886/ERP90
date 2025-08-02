import React, { useState } from 'react';
import { addAccount, getAccounts } from '@/lib/accountsService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowRight, Plus } from 'lucide-react';

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
      
      // العثور على أعلى كود رقمي
      const codes = level1Accounts
        .map(account => parseInt(account.code))
        .filter(code => !isNaN(code))
        .sort((a, b) => b - a);
      
      if (codes.length === 0) {
        return '1000';
      }
      
      // إنشاء الكود التالي
      const nextCode = codes[0] + 1;
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
      console.log('Account added successfully to Firebase as level 1 with auto code:', autoCode);
      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error('Error adding account:', error);
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

      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={handleCancel}
        className="flex items-center gap-2 mb-4 border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى قائمة الحسابات
      </Button>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>بيانات الحساب</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Nature */}
              <div className="space-y-2">
                <Label htmlFor="nature" className="text-sm font-medium text-gray-700">طبيعة الحساب *</Label>
                <Select 
                  value={formData.nature} 
                  onValueChange={(value) => handleInputChange('nature', value)}
                >
                  <SelectTrigger className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.nature ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 hover:border-blue-400'}`}>
                    <SelectValue placeholder="اختر طبيعة الحساب" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="مدينة" className="hover:bg-blue-50 focus:bg-blue-50">مدينة</SelectItem>
                    <SelectItem value="دائنة" className="hover:bg-blue-50 focus:bg-blue-50">دائنة</SelectItem>
                  </SelectContent>
                </Select>
                {errors.nature && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{errors.nature}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Arabic Name */}
              <div className="space-y-2">
                <Label htmlFor="nameAr" className="text-sm font-medium text-gray-700">اسم الحساب (عربي) *</Label>
                <Input
                  id="nameAr"
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => handleInputChange('nameAr', e.target.value)}
                  placeholder="مثال: النقدية بالصندوق"
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.nameAr ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 hover:border-blue-400'}`}
                />
                {errors.nameAr && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{errors.nameAr}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* English Name */}
              <div className="space-y-2">
                <Label htmlFor="nameEn" className="text-sm font-medium text-gray-700">اسم الحساب (انجليزي) *</Label>
                <Input
                  id="nameEn"
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => handleInputChange('nameEn', e.target.value)}
                  placeholder="Example: Cash on Hand"
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.nameEn ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 hover:border-blue-400'}`}
                />
                {errors.nameEn && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{errors.nameEn}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Balance */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="balance" className="text-sm font-medium text-gray-700">الرصيد الافتتاحي</Label>
                <Input
                  id="balance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => handleInputChange('balance', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.balance ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 hover:border-blue-400'}`}
                />
                {errors.balance && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{errors.balance}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 md:flex-none"
              >
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ الحساب'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                className="flex-1 md:flex-none"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddAccountPage;
