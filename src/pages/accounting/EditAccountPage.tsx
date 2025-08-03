import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
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
import { AlertCircle, ArrowRight, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { updateAccount, getAccountCodes, getAccountById, type Account } from '@/services/accountsService';
import Breadcrumb from '@/components/Breadcrumb';

interface EditAccountPageProps {
  account?: Account;
  onBack?: () => void;
  onSave?: (account: Omit<Account, 'id' | 'createdAt'>) => void;
  existingCodes?: string[];
}

const EditAccountPage: React.FC<EditAccountPageProps> = ({ 
  account: propAccount, 
  onBack, 
  onSave, 
  existingCodes: propExistingCodes = [] 
}) => {
  
  // Routing hooks for direct navigation support
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Account state - can come from props or routing
  const [account, setAccount] = useState<Account | null>(propAccount || null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    nameAr: '',
    nameEn: '',
    nature: '' as 'مدينة' | 'دائنة' | '',
    balance: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingCodes, setExistingCodes] = useState<string[]>(propExistingCodes);

  // Load account from routing if not provided as prop
  useEffect(() => {
    const loadAccountFromRouting = async () => {
      // Check if account is passed via location state first
      if (location.state?.account) {
        setAccount(location.state.account);
        return;
      }
      
      // If no prop account and we have an ID, load from Firebase
      if (!propAccount && id) {
        setIsLoadingAccount(true);
        try {
          const loadedAccount = await getAccountById(id);
          if (loadedAccount) {
            setAccount(loadedAccount);
          } else {
            toast.error('لم يتم العثور على الحساب المطلوب');
            navigate('/accounting/accounts-settlement');
          }
        } catch (error) {
          console.error('Error loading account:', error);
          toast.error('فشل في تحميل بيانات الحساب');
          navigate('/accounting/accounts-settlement');
        } finally {
          setIsLoadingAccount(false);
        }
      }
    };

    loadAccountFromRouting();
  }, [id, propAccount, location.state, navigate]);

  // Load existing codes from Firebase
  useEffect(() => {
    const loadExistingCodes = async () => {
      try {
        const codes = await getAccountCodes();
        setExistingCodes(codes);
      } catch (error) {
        console.error('Error loading existing codes:', error);
      }
    };

    if (propExistingCodes.length === 0) {
      loadExistingCodes();
    }
  }, [propExistingCodes]);

  useEffect(() => {
    if (account) {
      setFormData({
        code: account.code,
        nameAr: account.nameAr,
        nameEn: account.nameEn,
        nature: account.nature,
        balance: account.balance
      });
    }
  }, [account]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate code
    if (!formData.code.trim()) {
      newErrors.code = 'كود الحساب مطلوب';
    } else if (existingCodes.includes(formData.code.trim()) && formData.code !== account?.code) {
      newErrors.code = 'كود الحساب موجود بالفعل';
    } else if (!/^\d+$/.test(formData.code.trim())) {
      newErrors.code = 'كود الحساب يجب أن يكون أرقام فقط';
    }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!account) {
      toast.error('لا يمكن العثور على بيانات الحساب');
      return;
    }

    // Check if any changes were made
    const hasChanges = 
      formData.code !== account.code ||
      formData.nameAr !== account.nameAr ||
      formData.nameEn !== account.nameEn ||
      formData.nature !== account.nature ||
      formData.balance !== account.balance;

    if (!hasChanges) {
      toast.info('لم يتم إجراء أي تغييرات');
      if (onBack) {
        onBack();
      } else {
        // Navigate to accounts settlement page after save
        navigate('/accounting/accounts-settlement');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Build accountData and remove undefined fields
      const rawAccountData = {
        code: formData.code,
        nameAr: formData.nameAr,
        nameEn: formData.nameEn,
        nature: formData.nature as 'مدينة' | 'دائنة',
        balance: formData.balance,
        classification: account.classification,
        level: account.level,
        parentId: account.parentId,
        costCenter: account.costCenter,
        isClosed: account.isClosed,
        status: account.status,
        hasSubAccounts: account.hasSubAccounts
      };
      // Remove undefined fields (replace with null if needed)
      const accountData = Object.fromEntries(
        Object.entries(rawAccountData).filter(([_, v]) => v !== undefined)
      );

      if (onSave) {
        await updateAccount(account.id, accountData);
        toast.success('تم تحديث الحساب بنجاح');
        onSave(accountData as unknown as Omit<Account, 'id' | 'createdAt'>);
      } else {
        await updateAccount(account.id, accountData);
        toast.success('تم تحديث الحساب بنجاح');
      }
      // Always navigate to accounts settlement page after save
      navigate('/accounting/accounts-settlement');
    } catch (error) {
      console.error('Error updating account:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('فشل في تحديث الحساب');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onBack) {
      onBack();
    } else {
      // Navigate back to accounts settlement page
      navigate('/accounting/accounts-settlement');
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
    
    // Real-time validation for code field
    if (field === 'code' && typeof value === 'string' && account) {
      const trimmedValue = value.trim();
      if (trimmedValue && existingCodes.includes(trimmedValue) && trimmedValue !== account.code) {
        setErrors(prev => ({
          ...prev,
          code: 'كود الحساب موجود بالفعل'
        }));
      }
    }
  };

  if (!account || isLoadingAccount) {
    return (
      <div className="w-full p-6 space-y-6 min-h-screen" dir="rtl">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">جاري تحميل بيانات الحساب...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6 min-h-screen" dir="rtl">
      {/* Header */}
      <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          <Edit className="h-8 w-8 text-blue-600 ml-3" />
          <h1 className="text-2xl font-bold text-gray-800">تعديل الحساب</h1>
        </div>
        <p className="text-gray-600 mt-2">تعديل بيانات الحساب: {account.nameAr}</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
      </div>

                         <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "الادارة الماليه", to: "/management/financial" }, 
          { label: "تصنيف الحسابات" , to: "/accounting/accounts-settlement"}, 
          { label: "تعديل الحساب"},
        ]}
      />

      {/* Form Card */}
      <Card className="shadow-md" style={{ fontFamily: 'Cairo, Tajawal, sans-serif', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Cairo, Tajawal, sans-serif', fontSize: 18, fontWeight: 700 }}>
            تعديل بيانات الحساب
          </CardTitle>

        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Code */}
              <div className="space-y-2">
                <Label 
                  htmlFor="code" 
                  className="text-sm font-medium text-gray-700"
                  style={{ fontFamily: 'Cairo, Tajawal, sans-serif', fontWeight: 600 }}
                >
                  كود الحساب *
                </Label>
                <Input
                  id="code"
                  type="text"
                  value={formData.code}
                  disabled
                  // onChange={(e) => handleInputChange('code', e.target.value)}
                  placeholder="مثال: 1001"
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.code ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 hover:border-blue-400'
                  }`}
                  style={{
                    fontFamily: 'Cairo, Tajawal, sans-serif',
                    fontSize: 14,
                    borderRadius: 8,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.07)'
                  }}
                />
                {errors.code && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{errors.code}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Account Nature */}
              <div className="space-y-2">
                <Label 
                  htmlFor="nature" 
                  className="text-sm font-medium text-gray-700"
                  style={{ fontFamily: 'Cairo, Tajawal, sans-serif', fontWeight: 600 }}
                >
                  طبيعة الحساب *
                </Label>
                <Select 
                  value={formData.nature} 
                  onValueChange={(value) => handleInputChange('nature', value)}
                >
                  <SelectTrigger 
                    className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.nature ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 hover:border-blue-400'
                    }`}
                    style={{
                      fontFamily: 'Cairo, Tajawal, sans-serif',
                      fontSize: 14,
                      borderRadius: 8,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.07)'
                    }}
                  >
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
                <Label 
                  htmlFor="nameAr" 
                  className="text-sm font-medium text-gray-700"
                  style={{ fontFamily: 'Cairo, Tajawal, sans-serif', fontWeight: 600 }}
                >
                  اسم الحساب (عربي) *
                </Label>
                <Input
                  id="nameAr"
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => handleInputChange('nameAr', e.target.value)}
                  placeholder="مثال: النقدية بالصندوق"
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.nameAr ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 hover:border-blue-400'
                  }`}
                  style={{
                    fontFamily: 'Cairo, Tajawal, sans-serif',
                    fontSize: 14,
                    borderRadius: 8,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.07)'
                  }}
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
                <Label 
                  htmlFor="nameEn" 
                  className="text-sm font-medium text-gray-700"
                  style={{ fontFamily: 'Cairo, Tajawal, sans-serif', fontWeight: 600 }}
                >
                  اسم الحساب (انجليزي) *
                </Label>
                <Input
                  id="nameEn"
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => handleInputChange('nameEn', e.target.value)}
                  placeholder="Example: Cash on Hand"
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.nameEn ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 hover:border-blue-400'
                  }`}
                  style={{
                    fontFamily: 'Cairo, Tajawal, sans-serif',
                    fontSize: 14,
                    borderRadius: 8,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.07)'
                  }}
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
                <Label 
                  htmlFor="balance" 
                  className="text-sm font-medium text-gray-700"
                  style={{ fontFamily: 'Cairo, Tajawal, sans-serif', fontWeight: 600 }}
                >
                  الرصيد الحالي
                </Label>
                <Input
                  id="balance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => handleInputChange('balance', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.balance ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 hover:border-blue-400'
                  }`}
                  style={{
                    fontFamily: 'Cairo, Tajawal, sans-serif',
                    fontSize: 14,
                    borderRadius: 8,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.07)'
                  }}
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
                className="flex-1 md:flex-none h-11 px-8 font-medium transition-all duration-200 disabled:opacity-50"
                style={{
                  fontFamily: 'Cairo, Tajawal, sans-serif',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  border: 'none',
                  borderRadius: 8,
                  boxShadow: '0 2px 6px rgba(59, 130, 246, 0.15)',
                  minWidth: 150
                }}
              >
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                className="flex-1 md:flex-none h-11 px-8 font-medium transition-all duration-200"
                style={{
                  fontFamily: 'Cairo, Tajawal, sans-serif',
                  fontWeight: 600,
                  borderColor: '#6b7280',
                  color: '#6b7280',
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.07)',
                  minWidth: 150
                }}
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

export default EditAccountPage;
