import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  Edit, 
  ArrowRight, 
  User, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CreditCard,
  Star,
  Activity,
  FileText,
  Loader2
} from 'lucide-react';
import Breadcrumb from "@/components/Breadcrumb";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

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
  category?: "VIP" | "ذهبي" | "فضي" | "عادي";
  priority?: "عالي" | "متوسط" | "منخفض";
  taxFileNumber?: string;
  taxFileExpiry?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  customerNotes?: string;
  createdAt?: string;
  docId?: string;
}

const ViewCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

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

      setLoading(true);
      try {
        const customerDoc = await getDoc(doc(db, "customers", customerId));
        if (customerDoc.exists()) {
          const customerData = { ...customerDoc.data(), docId: customerDoc.id } as Customer;
          setCustomer(customerData);
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
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, navigate, toast]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "غير محدد";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: arSA });
    } catch {
      return dateStr;
    }
  };

  const getCategoryBadgeColor = (category?: string) => {
    switch (category) {
      case "VIP": return "bg-purple-600 text-white";
      case "ذهبي": return "bg-yellow-500 text-white";
      case "فضي": return "bg-gray-400 text-white";
      case "عادي": return "bg-blue-500 text-white";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  const getPriorityBadgeColor = (priority?: string) => {
    switch (priority) {
      case "عالي": return "bg-red-500 text-white";
      case "متوسط": return "bg-orange-500 text-white";
      case "منخفض": return "bg-green-500 text-white";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background rtl flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>جاري تحميل بيانات العميل...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-600 ml-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">عرض بيانات العميل</h1>
                <p className="text-gray-600">{customer.nameAr} - {customer.id}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate(`/customers/edit/${customerId}`)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                تعديل
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/customers/directory')}
                className="gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                العودة
              </Button>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        </div>

        <Breadcrumb
          items={[
            { label: "الرئيسية", to: "/" },
            { label: "إدارة المبيعات", to: "/management/sales" },
            { label: "دليل العملاء", to: "/customers/directory" },
            { label: "عرض العميل" },
          ]}
        />

        {/* Customer Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">حالة العميل</p>
                  <Badge variant={customer.status === "نشط" ? "default" : "secondary"}>
                    {customer.status}
                  </Badge>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">تصنيف العميل</p>
                  <Badge className={getCategoryBadgeColor(customer.category)}>
                    {customer.category || "غير محدد"}
                  </Badge>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الأولوية</p>
                  <Badge className={getPriorityBadgeColor(customer.priority)}>
                    {customer.priority || "غير محدد"}
                  </Badge>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الحد الائتماني</p>
                  <p className="text-lg font-bold">
                    {customer.creditLimit ? `${parseFloat(customer.creditLimit).toLocaleString()} ر.س` : "غير محدد"}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                المعلومات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">رقم العميل</p>
                  <p className="font-medium">{customer.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الفرع</p>
                  <p className="font-medium">{customer.branch}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الاسم بالعربي</p>
                  <p className="font-medium">{customer.nameAr}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الاسم بالإنجليزي</p>
                  <p className="font-medium">{customer.nameEn}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">نوع العمل</p>
                  <p className="font-medium">{customer.businessType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">النشاط</p>
                  <p className="font-medium">{customer.activity}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                المعلومات التجارية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">السجل التجاري</p>
                  <p className="font-medium">{customer.commercialReg || "غير محدد"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">تاريخ السجل</p>
                  <p className="font-medium">{formatDate(customer.regDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">جهة الإصدار</p>
                  <p className="font-medium">{customer.regAuthority || "غير محدد"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">تاريخ بداية التعامل</p>
                  <p className="font-medium">{formatDate(customer.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">رقم الملف الضريبي</p>
                  <p className="font-medium">{customer.taxFileNumber || "غير محدد"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">تاريخ انتهاء الملف الضريبي</p>
                  <p className="font-medium">{formatDate(customer.taxFileExpiry)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                معلومات الاتصال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">رقم الجوال</p>
                  <p className="font-medium">{customer.mobile}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الهاتف</p>
                  <p className="font-medium">{customer.phone || "غير محدد"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</p>
                  <p className="font-medium">{customer.email || "غير محدد"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                معلومات العنوان
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">المدينة</p>
                  <p className="font-medium">{customer.city}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">المنطقة</p>
                  <p className="font-medium">{customer.region || "غير محدد"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الحي</p>
                  <p className="font-medium">{customer.district || "غير محدد"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الشارع</p>
                  <p className="font-medium">{customer.street || "غير محدد"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">رقم المبنى</p>
                  <p className="font-medium">{customer.buildingNo || "غير محدد"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الرمز البريدي</p>
                  <p className="font-medium">{customer.postalCode || "غير محدد"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Follow-up Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              معلومات المتابعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">تاريخ التسجيل</p>
                <p className="font-medium">{formatDate(customer.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">آخر تاريخ اتصال</p>
                <p className="font-medium">{formatDate(customer.lastContactDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">تاريخ المتابعة القادمة</p>
                <p className="font-medium">{formatDate(customer.nextFollowUpDate)}</p>
              </div>
            </div>
            {customer.customerNotes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">ملاحظات العميل</p>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">{customer.customerNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewCustomerPage;
