import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, ArrowRight, Loader2 } from 'lucide-react';
import Breadcrumb from "@/components/Breadcrumb";
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Customer {
  id: string;
  nameAr: string;
  nameEn: string;
  branch: string;
  commercialReg: string;
  regDate: string;
  regAuthority: string;
  businessType: string;
  activity: string;
  startDate: string;
  city: string;
  creditLimit: string;
  region: string;
  district: string;
  street: string;
  buildingNo: string;
  postalCode: string;
  countryCode: string;
  phone: string;
  mobile: string;
  email: string;
  status: "نشط" | "متوقف";
  taxFileNumber?: string;
  taxFileExpiry?: string;
  docId?: string;
}

const EditCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [branches, setBranches] = useState<string[]>([]);
  const [form, setForm] = useState<Customer | null>(null);

  const businessTypes = ["شركة", "مؤسسة", "فرد"];
  const activities = ["مقاولات", "تجارة تجزئة", "صناعة", "خدمات"];
  const cities = ["الرياض", "جدة", "الدمام", "مكة", "الخبر", "الطائف"];
  const statusOptions = ["نشط", "متوقف"] as const;

  // جلب الفروع من Firestore
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const snapshot = await getDocs(collection(db, "branches"));
        setBranches(snapshot.docs.map(doc => (doc.data().name as string)));
      } catch (err) {
        setBranches([]);
      }
    };
    fetchBranches();
  }, []);

  // جلب بيانات العميل
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) {
        toast({
          title: "خطأ",
          description: "معرف العميل غير صحيح",
          variant: "destructive",
        });
        navigate('/customers/directory');
        return;
      }

      setInitialLoading(true);
      try {
        const customerDoc = await getDoc(doc(db, "customers", customerId));
        if (customerDoc.exists()) {
          const customerData = { ...customerDoc.data(), docId: customerDoc.id } as Customer;
          setForm(customerData);
        } else {
          toast({
            title: "خطأ",
            description: "العميل غير موجود",
            variant: "destructive",
          });
          navigate('/customers/directory');
        }
      } catch (err) {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء جلب بيانات العميل",
          variant: "destructive",
        });
        navigate('/customers/directory');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, navigate, toast]);

  // تحويل الاسم العربي إلى إنجليزي
  const arabicToEnglish = useCallback((text: string) => {
    const namesMap: Record<string, string> = {
      'محمد': 'mohammed', 'محمود': 'mahmoud', 'أحمد': 'ahmed', 'مصطفى': 'mostafa',
      'علي': 'ali', 'حسن': 'hassan', 'حسين': 'hussein', 'ابراهيم': 'ibrahim',
      'يوسف': 'youssef', 'سعيد': 'saeed', 'عبدالله': 'abdullah', 'عبد الله': 'abdullah',
      'خالد': 'khaled', 'سارة': 'sarah', 'فاطمة': 'fatima', 'ياسين': 'yassin',
      'ياسر': 'yasser', 'رشاد': 'rashad', 'سامي': 'sami', 'سلمى': 'salma',
      'نور': 'noor', 'منى': 'mona', 'مريم': 'maryam', 'عمر': 'omar',
      'طارق': 'tarek', 'شريف': 'sherif', 'شيماء': 'shaimaa', 'جميلة': 'jamila',
      'سعد': 'saad', 'عبده': 'abdou',
    };

    let result = text.replace(/[\u064B-\u0652]/g, '');
    
    Object.keys(namesMap).forEach(arabicName => {
      const regex = new RegExp(arabicName, 'g');
      result = result.replace(regex, namesMap[arabicName]);
    });

    result = result
      .replace(/تش/g, 'ch').replace(/ث/g, 'th').replace(/خ/g, 'kh')
      .replace(/ذ/g, 'dh').replace(/ش/g, 'sh').replace(/غ/g, 'gh')
      .replace(/ظ/g, 'z').replace(/ق/g, 'q').replace(/ص/g, 's')
      .replace(/ض/g, 'd').replace(/ط/g, 't').replace(/ع/g, 'a')
      .replace(/ء/g, '').replace(/ؤ/g, 'w').replace(/ئ/g, 'y')
      .replace(/ى/g, 'a').replace(/ة/g, 'a').replace(/ﻻ/g, 'la');

    const map: Record<string, string> = {
      'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'a', 'ب': 'b', 'ت': 't',
      'ج': 'j', 'ح': 'h', 'د': 'd', 'ر': 'r', 'ز': 'z',
      'س': 's', 'ف': 'f', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
      'ه': 'h', 'و': 'w', 'ي': 'y', ' ': ' '
    };

    result = result.split('').map(c => map[c] || c).join('');
    return result.replace(/\s+/g, ' ').trim();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return;
    
    const { name, value } = e.target;
    
    if (name === "nameAr") {
      setForm(prev => prev ? ({
        ...prev,
        nameAr: value,
        nameEn: !prev.nameEn || prev.nameEn === arabicToEnglish(prev.nameAr) 
          ? arabicToEnglish(value) 
          : prev.nameEn
      }) : null);
    } else {
      setForm(prev => prev ? ({ ...prev, [name]: value }) : null);
    }
  };

  const handleSelectChange = (name: keyof Customer, value: string) => {
    setForm(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !customerId) return;
    
    setLoading(true);
    
    try {
      // استبعاد docId من التحديث
      const { docId, ...updateData } = form;
      await updateDoc(doc(db, "customers", customerId), updateData);
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات العميل بنجاح",
        variant: "default",
      });
      
      // توجيه المستخدم إلى صفحة دليل العملاء
      setTimeout(() => {
        navigate('/customers/directory');
      }, 1500);
      
    } catch (err) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث بيانات العميل",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background rtl flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>جاري تحميل بيانات العميل...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-background rtl flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600">لم يتم العثور على بيانات العميل</p>
          <Button onClick={() => navigate('/customers/directory')} className="mt-4">
            العودة إلى دليل العملاء
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background rtl" dir="rtl">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
          <div className="flex items-center">
            <Edit className="h-8 w-8 text-green-600 ml-3" />
            <h1 className="text-2xl font-bold text-gray-800">تعديل بيانات العميل</h1>
          </div>
          <p className="text-gray-600 mt-2">تحديث معلومات العميل: {form.nameAr}</p>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
        </div>

        <Breadcrumb
          items={[
            { label: "الرئيسية", to: "/" },
            { label: "إدارة المبيعات", to: "/management/sales" },
            { label: "دليل العملاء", to: "/customers/directory" },
            { label: "تعديل العميل" },
          ]}
        />

        {/* Form Card */}
        <Card className="mt-6 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">تعديل بيانات العميل - {form.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* العمود الأول */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">رقم العميل</label>
                    <Input
                      name="id"
                      value={form.id}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">الاسم بالعربي*</label>
                    <Input 
                      name="nameAr" 
                      value={form.nameAr} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">الاسم بالإنجليزي</label>
                    <Input
                      name="nameEn"
                      value={form.nameEn}
                      placeholder="تلقائي"
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">الفرع*</label>
                    <Select 
                      value={form.branch} 
                      onValueChange={(value) => handleSelectChange("branch", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفرع" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map(branch => (
                          <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* العمود الثاني */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">السجل التجاري</label>
                    <Input 
                      name="commercialReg" 
                      value={form.commercialReg} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">تاريخ السجل</label>
                    <Input 
                      name="regDate" 
                      value={form.regDate} 
                      onChange={handleChange} 
                      type="date" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">جهة الإصدار</label>
                    <Input 
                      name="regAuthority" 
                      value={form.regAuthority} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">نوع العمل*</label>
                    <Select 
                      value={form.businessType} 
                      onValueChange={(value) => handleSelectChange("businessType", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع العمل" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* العمود الثالث */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">النشاط*</label>
                    <Select 
                      value={form.activity} 
                      onValueChange={(value) => handleSelectChange("activity", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النشاط" />
                      </SelectTrigger>
                      <SelectContent>
                        {activities.map(activity => (
                          <SelectItem key={activity} value={activity}>{activity}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">تاريخ بداية التعامل</label>
                    <Input 
                      name="startDate" 
                      value={form.startDate} 
                      onChange={handleChange} 
                      type="date" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">المدينة*</label>
                    <Select 
                      value={form.city} 
                      onValueChange={(value) => handleSelectChange("city", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المدينة" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">الحد الائتماني (ر.س)</label>
                    <Input 
                      name="creditLimit" 
                      value={form.creditLimit} 
                      onChange={handleChange} 
                      type="number" 
                    />
                  </div>
                </div>

                {/* العمود الرابع */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">الحالة*</label>
                    <Select 
                      value={form.status} 
                      onValueChange={(value) => handleSelectChange("status", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">رقم الجوال*</label>
                    <Input 
                      name="mobile" 
                      value={form.mobile} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                    <Input 
                      name="email" 
                      value={form.email} 
                      onChange={handleChange} 
                      type="email" 
                    />
                  </div>
                </div>
              </div>

              {/* تفاصيل الملف الضريبي والعنوان */}
              <Card className="p-4 mt-4">
                <h3 className="font-medium mb-3">تفاصيل الملف الضريبي والعنوان</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">رقم الملف الضريبي</label>
                    <Input
                      name="taxFileNumber"
                      value={form.taxFileNumber || ""}
                      onChange={handleChange}
                      placeholder="أدخل رقم الملف الضريبي"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">تاريخ انتهاء الملف الضريبي</label>
                    <Input
                      name="taxFileExpiry"
                      value={form.taxFileExpiry || ""}
                      onChange={handleChange}
                      type="date"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">المنطقة</label>
                    <Input 
                      name="region" 
                      value={form.region} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">الحي</label>
                    <Input 
                      name="district" 
                      value={form.district} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">الشارع</label>
                    <Input 
                      name="street" 
                      value={form.street} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">رقم المبنى</label>
                    <Input 
                      name="buildingNo" 
                      value={form.buildingNo} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">الرمز البريدي</label>
                    <Input 
                      name="postalCode" 
                      value={form.postalCode} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">الهاتف</label>
                    <Input 
                      name="phone" 
                      value={form.phone} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  حفظ التغييرات
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/customers/directory')}
                  className="gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditCustomerPage;
