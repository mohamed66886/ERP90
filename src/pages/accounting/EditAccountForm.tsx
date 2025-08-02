import React, { useState, useEffect } from 'react';
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
import { AlertCircle } from 'lucide-react';

interface Account {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  nature: 'مدينة' | 'دائنة';
  balance: number;
  createdAt: string;
}

interface EditAccountFormProps {
  account: Account;
  onSubmit: (account: {
    code: string;
    nameAr: string;
    nameEn: string;
    nature: 'مدينة' | 'دائنة';
    balance: number;
  }) => void;
  onCancel: () => void;
  existingCodes: string[];
}

const EditAccountForm: React.FC<EditAccountFormProps> = ({ account, onSubmit, onCancel, existingCodes }) => {
  const [formData, setFormData] = useState({
    code: account.code,
    nameAr: account.nameAr,
    nameEn: account.nameEn,
    nature: account.nature,
    balance: account.balance
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      code: account.code,
      nameAr: account.nameAr,
      nameEn: account.nameEn,
      nature: account.nature,
      balance: account.balance
    });
  }, [account]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate code
    if (!formData.code.trim()) {
      newErrors.code = 'كود الحساب مطلوب';
    } else if (existingCodes.includes(formData.code.trim())) {
      newErrors.code = 'كود الحساب موجود بالفعل';
    } else if (!/^\d+$/.test(formData.code.trim())) {
      newErrors.code = 'كود الحساب يجب أن يكون أرقام فقط';
    }

    // Validate Arabic name
    if (!formData.nameAr.trim()) {
      newErrors.nameAr = 'اسم الحساب بالعربية مطلوب';
    } else if (formData.nameAr.trim().length < 2) {
      newErrors.nameAr = 'اسم الحساب يجب أن يكون حرفين على الأقل';
    }

    // Validate English name
    if (!formData.nameEn.trim()) {
      newErrors.nameEn = 'اسم الحساب بالإنجليزية مطلوب';
    } else if (formData.nameEn.trim().length < 2) {
      newErrors.nameEn = 'اسم الحساب يجب أن يكون حرفين على الأقل';
    }

    // Validate nature
    if (!formData.nature) {
      newErrors.nature = 'طبيعة الحساب مطلوبة';
    }

    // Validate balance
    if (formData.balance < 0) {
      newErrors.balance = 'الرصيد لا يمكن أن يكون سالب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        code: formData.code.trim(),
        nameAr: formData.nameAr.trim(),
        nameEn: formData.nameEn.trim(),
        nature: formData.nature,
        balance: formData.balance
      });
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Code */}
        <div className="space-y-2">
          <Label htmlFor="code" className="text-right">كود الحساب *</Label>
          <Input
            id="code"
            type="text"
            placeholder="مثال: 1001"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            className={`text-right ${errors.code ? 'border-red-500' : ''}`}
            dir="ltr"
          />
          {errors.code && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.code}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Balance */}
        <div className="space-y-2">
          <Label htmlFor="balance" className="text-right">الرصيد الحالي</Label>
          <Input
            id="balance"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={formData.balance}
            onChange={(e) => handleInputChange('balance', parseFloat(e.target.value) || 0)}
            className={`text-right ${errors.balance ? 'border-red-500' : ''}`}
            dir="ltr"
          />
          {errors.balance && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.balance}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Arabic Name */}
      <div className="space-y-2">
        <Label htmlFor="nameAr" className="text-right">اسم الحساب (عربي) *</Label>
        <Input
          id="nameAr"
          type="text"
          placeholder="أدخل اسم الحساب بالعربية"
          value={formData.nameAr}
          onChange={(e) => handleInputChange('nameAr', e.target.value)}
          className={`text-right ${errors.nameAr ? 'border-red-500' : ''}`}
        />
        {errors.nameAr && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.nameAr}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* English Name */}
      <div className="space-y-2">
        <Label htmlFor="nameEn" className="text-right">اسم الحساب (إنجليزي) *</Label>
        <Input
          id="nameEn"
          type="text"
          placeholder="Enter account name in English"
          value={formData.nameEn}
          onChange={(e) => handleInputChange('nameEn', e.target.value)}
          className={`text-left ${errors.nameEn ? 'border-red-500' : ''}`}
          dir="ltr"
        />
        {errors.nameEn && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.nameEn}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Nature */}
      <div className="space-y-2">
        <Label htmlFor="nature" className="text-right">طبيعة الحساب *</Label>
        <Select value={formData.nature} onValueChange={(value: 'مدينة' | 'دائنة') => handleInputChange('nature', value)}>
          <SelectTrigger className={`text-right ${errors.nature ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="اختر طبيعة الحساب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="مدينة">مدينة (Debit)</SelectItem>
            <SelectItem value="دائنة">دائنة (Credit)</SelectItem>
          </SelectContent>
        </Select>
        {errors.nature && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.nature}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Account Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">معلومات إضافية</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">تاريخ الإنشاء:</span>
            <span className="mr-2 font-medium">{new Date(account.createdAt).toLocaleDateString('ar-SA')}</span>
          </div>
          <div>
            <span className="text-gray-500">رقم الحساب:</span>
            <span className="mr-2 font-medium">{account.id}</span>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          حفظ التعديلات
        </Button>
      </div>
    </form>
  );
};

export default EditAccountForm;
