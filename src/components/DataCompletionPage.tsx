import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { getDocs, query, where, collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Building, Phone, MapPin, FileText, Calendar, User, Hash, Flag, ChevronLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DataCompletionPageProps {
  onComplete: (data?: any) => void;
  onBack?: () => void;
}

const DataCompletionPage = ({ onComplete, onBack }: DataCompletionPageProps) => {
  // تحقق إذا كانت هناك بيانات شركة موجودة بالفعل (بدون ربط بحساب)
  useEffect(() => {
    const checkCompanyData = async () => {
      const q = query(collection(db, "companies"));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        // إذا كانت البيانات موجودة، لا تظهر الصفحة
        // تمرير بيانات الشركة عند الاكتمال
        onComplete(snapshot.docs[0]?.data() || formData);
      }
    };
    checkCompanyData();
  }, [onComplete]);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    // Basic Information
    arabicName: "",
    englishName: "",
    commercialRegistration: "",
    taxFile: "",
    registrationDate: "",
    issuingAuthority: "",
    companyType: "",
    activityType: "",
    nationality: "",
    
    // Address Information
    city: "",
    region: "",
    street: "",
    district: "",
    buildingNumber: "",
    postalCode: "",
    
    // Contact Information
    countryCode: "SA",
    phone: "",
    mobile: ""
  });

  const [activeSection, setActiveSection] = useState<"basic" | "address" | "contact">("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateSection = (section: "basic" | "address" | "contact") => {
    if (section === "basic") {
      const requiredFields = [
        'arabicName', 'englishName', 'commercialRegistration', 
        'taxFile', 'companyType', 'activityType', 'nationality'
      ];
      return requiredFields.every(field => formData[field as keyof typeof formData]);
    }
    
    if (section === "address") {
      return !!formData.city;
    }
    
    if (section === "contact") {
      return !!formData.mobile;
    }
    
    return false;
  };

  const calculateCompletion = () => {
    const totalFields = 15; // Total fields we consider important
    let completedFields = 0;

    // Basic info (7 fields)
    if (formData.arabicName) completedFields++;
    if (formData.englishName) completedFields++;
    if (formData.commercialRegistration) completedFields++;
    if (formData.taxFile) completedFields++;
    if (formData.companyType) completedFields++;
    if (formData.activityType) completedFields++;
    if (formData.nationality) completedFields++;

    // Address info (5 fields)
    if (formData.city) completedFields++;
    if (formData.region) completedFields++;
    if (formData.street) completedFields++;
    if (formData.buildingNumber) completedFields++;
    if (formData.postalCode) completedFields++;

    // Contact info (3 fields)
    if (formData.phone) completedFields++;
    if (formData.mobile) completedFields += 2; // Mobile is more important

    return Math.min(Math.round((completedFields / totalFields) * 100), 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all required fields
    if (!validateSection("basic") || !validateSection("address") || !validateSection("contact")) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إكمال جميع الحقول المطلوبة في جميع الأقسام",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // حفظ البيانات في Firestore
      // إضافة البريد الإلكتروني للمستخدم للربط
      let userEmail = "";
      if (auth.currentUser) userEmail = auth.currentUser.email || "";
      await addDoc(collection(db, "companies"), { ...formData, email: userEmail });
      toast({
        title: "تم حفظ البيانات بنجاح",
        description: "جاري توجيهك إلى النظام...",
        className: "bg-green-600 text-white"
      });
      setTimeout(() => {
        onComplete(formData);
      }, 1500);
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "فشل في حفظ البيانات، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    toast({
      title: "تم حفظ المسودة",
      description: "يمكنك إكمال البيانات لاحقاً من لوحة التحكم",
      className: "bg-blue-600 text-white"
    });
  };

  const handleSectionChange = (section: "basic" | "address" | "contact") => {
    if (section === "address" && !validateSection("basic")) {
      toast({
        title: "يرجى إكمال المعلومات الأساسية أولاً",
        variant: "destructive"
      });
      return;
    }
    
    if (section === "contact" && (!validateSection("basic") || !validateSection("address"))) {
      toast({
        title: "يرجى إكمال المعلومات الأساسية والعنوان أولاً",
        variant: "destructive"
      });
      return;
    }
    
    setActiveSection(section);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 rtl" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600 font-arabic">
              اكتمال البيانات ({calculateCompletion()}%)
            </span>
            <span className="text-xs text-gray-500 font-arabic">
              {calculateCompletion() >= 100 ? "جاهز للتسجيل" : "مطلوب المزيد من البيانات"}
            </span>
          </div>
          <Progress value={calculateCompletion()} className="h-2.5" />
        </div>

        {/* Header Section */}
        <div className="text-center mb-8 relative">
          {onBack && (
            <Button 
              variant="ghost" 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-600 hover:bg-gray-100"
              onClick={onBack}
            >
              <ChevronLeft className="w-5 h-5 ml-1" />
              رجوع
            </Button>
          )}
          
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Building className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 font-arabic mb-2">
            إكمال بيانات الشركة
          </h1>
          <p className="text-gray-600 font-arabic max-w-md mx-auto">
            يرجى إدخال البيانات الأساسية للشركة لتكملة التسجيل في النظام
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => handleSectionChange("basic")}
            className={`px-4 py-3 text-sm font-medium font-arabic transition-colors duration-200 ${
              activeSection === "basic"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            المعلومات الأساسية
          </button>
          <button
            onClick={() => handleSectionChange("address")}
            className={`px-4 py-3 text-sm font-medium font-arabic transition-colors duration-200 ${
              activeSection === "address"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            معلومات العنوان
          </button>
          <button
            onClick={() => handleSectionChange("contact")}
            className={`px-4 py-3 text-sm font-medium font-arabic transition-colors duration-200 ${
              activeSection === "contact"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            معلومات الاتصال
          </button>
        </div>

        {/* Form Sections */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          {activeSection === "basic" && (
            <Card className="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-600 text-white">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-800 font-arabic">
                      المعلومات الأساسية
                    </CardTitle>
                    <CardDescription className="font-arabic text-gray-600">
                      البيانات الرسمية للشركة حسب السجلات الحكومية
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Arabic Name */}
                <div className="space-y-2">
                  <Label htmlFor="arabicName" className="font-arabic font-medium text-gray-700 flex items-center">
                    الاسم بالعربي <span className="text-red-500 mr-1">*</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-gray-400 hover:text-gray-500 cursor-help mr-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="font-arabic">
                          <p>الاسم كما هو مسجل بالسجل التجاري</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="arabicName"
                    placeholder="اسم الشركة باللغة العربية"
                    value={formData.arabicName}
                    onChange={(e) => handleInputChange("arabicName", e.target.value)}
                    className="font-arabic"
                    required
                  />
                </div>

                {/* English Name */}
                <div className="space-y-2">
                  <Label htmlFor="englishName" className="font-arabic font-medium text-gray-700 flex items-center">
                    الاسم بالإنجليزي <span className="text-red-500 mr-1">*</span>
                  </Label>
                  <Input
                    id="englishName"
                    placeholder="Company Name in English"
                    value={formData.englishName}
                    onChange={(e) => handleInputChange("englishName", e.target.value)}
                    className="ltr"
                    required
                  />
                </div>

                {/* Commercial Registration */}
                <div className="space-y-2">
                  <Label htmlFor="commercialRegistration" className="font-arabic font-medium text-gray-700 flex items-center">
                    السجل التجاري <span className="text-red-500 mr-1">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="commercialRegistration"
                      placeholder="رقم السجل التجاري"
                      value={formData.commercialRegistration}
                      onChange={(e) => handleInputChange("commercialRegistration", e.target.value)}
                      className="pr-10"
                      required
                    />
                    <FileText className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                {/* Tax File */}
                <div className="space-y-2">
                  <Label htmlFor="taxFile" className="font-arabic font-medium text-gray-700 flex items-center">
                    الملف الضريبي <span className="text-red-500 mr-1">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="taxFile"
                      placeholder="رقم الملف الضريبي"
                      value={formData.taxFile}
                      onChange={(e) => handleInputChange("taxFile", e.target.value)}
                      className="pr-10"
                      required
                    />
                    <FileText className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                {/* Registration Date */}
                <div className="space-y-2">
                  <Label htmlFor="registrationDate" className="font-arabic font-medium text-gray-700">
                    تاريخ السجل
                  </Label>
                  <div className="relative">
                    <Input
                      id="registrationDate"
                      type="date"
                      value={formData.registrationDate}
                      onChange={(e) => handleInputChange("registrationDate", e.target.value)}
                      className="pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                {/* Issuing Authority */}
                <div className="space-y-2">
                  <Label htmlFor="issuingAuthority" className="font-arabic font-medium text-gray-700">
                    جهة الإصدار
                  </Label>
                  <Input
                    id="issuingAuthority"
                    placeholder="جهة إصدار السجل التجاري"
                    value={formData.issuingAuthority}
                    onChange={(e) => handleInputChange("issuingAuthority", e.target.value)}
                    className="font-arabic"
                  />
                </div>

                {/* Company Type */}
                <div className="space-y-2">
                  <Label htmlFor="companyType" className="font-arabic font-medium text-gray-700 flex items-center">
                    نوع الشركة <span className="text-red-500 mr-1">*</span>
                  </Label>
                  <Select 
                    value={formData.companyType} 
                    onValueChange={(value) => handleInputChange("companyType", value)}
                  >
                    <SelectTrigger className="font-arabic">
                      <SelectValue placeholder="اختر نوع الشركة" />
                    </SelectTrigger>
                    <SelectContent className="font-arabic">
                      <SelectItem value="company">شركة مساهمة</SelectItem>
                      <SelectItem value="llc">شركة ذات مسئولية محدودة</SelectItem>
                      <SelectItem value="establishment">مؤسسة</SelectItem>
                      <SelectItem value="individual">منشأة فردية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Activity Type */}
                <div className="space-y-2">
                  <Label htmlFor="activityType" className="font-arabic font-medium text-gray-700 flex items-center">
                    النشاط الرئيسي <span className="text-red-500 mr-1">*</span>
                  </Label>
                  <Select 
                    value={formData.activityType} 
                    onValueChange={(value) => handleInputChange("activityType", value)}
                  >
                    <SelectTrigger className="font-arabic">
                      <SelectValue placeholder="اختر نوع النشاط" />
                    </SelectTrigger>
                    <SelectContent className="font-arabic">
                      <SelectItem value="contracting">المقاولات</SelectItem>
                      <SelectItem value="wholesale">تجارة جملة</SelectItem>
                      <SelectItem value="retail">تجارة تجزئة</SelectItem>
                      <SelectItem value="services">خدمات</SelectItem>
                      <SelectItem value="manufacturing">تصنيع</SelectItem>
                      <SelectItem value="consulting">استشارات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Nationality */}
                <div className="space-y-2">
                  <Label htmlFor="nationality" className="font-arabic font-medium text-gray-700 flex items-center">
                    الجنسية <span className="text-red-500 mr-1">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="nationality"
                      placeholder="جنسية الشركة"
                      value={formData.nationality}
                      onChange={(e) => handleInputChange("nationality", e.target.value)}
                      className="font-arabic"
                      required
                    />
                    <Flag className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Address Information Section */}
          {activeSection === "address" && (
            <Card className="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-600 text-white">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-800 font-arabic">
                      معلومات العنوان
                    </CardTitle>
                    <CardDescription className="font-arabic text-gray-600">
                      عنوان الشركة الرئيسي حسب السجلات الرسمية
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city" className="font-arabic font-medium text-gray-700 flex items-center">
                    المدينة <span className="text-red-500 mr-1">*</span>
                  </Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => handleInputChange("city", value)}
                  >
                    <SelectTrigger className="font-arabic">
                      <SelectValue placeholder="اختر المدينة" />
                    </SelectTrigger>
                    <SelectContent className="font-arabic">
                      <SelectItem value="riyadh">الرياض</SelectItem>
                      <SelectItem value="jeddah">جدة</SelectItem>
                      <SelectItem value="dammam">الدمام</SelectItem>
                      <SelectItem value="khobar">الخبر</SelectItem>
                      <SelectItem value="medina">المدينة المنورة</SelectItem>
                      <SelectItem value="makkah">مكة المكرمة</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Region */}
                <div className="space-y-2">
                  <Label htmlFor="region" className="font-arabic font-medium text-gray-700">
                    المنطقة
                  </Label>
                  <Input
                    id="region"
                    placeholder="المنطقة"
                    value={formData.region}
                    onChange={(e) => handleInputChange("region", e.target.value)}
                    className="font-arabic"
                  />
                </div>

                {/* Street */}
                <div className="space-y-2">
                  <Label htmlFor="street" className="font-arabic font-medium text-gray-700">
                    اسم الشارع
                  </Label>
                  <Input
                    id="street"
                    placeholder="اسم الشارع"
                    value={formData.street}
                    onChange={(e) => handleInputChange("street", e.target.value)}
                    className="font-arabic"
                  />
                </div>

                {/* District */}
                <div className="space-y-2">
                  <Label htmlFor="district" className="font-arabic font-medium text-gray-700">
                    اسم الحي
                  </Label>
                  <Input
                    id="district"
                    placeholder="اسم الحي"
                    value={formData.district}
                    onChange={(e) => handleInputChange("district", e.target.value)}
                    className="font-arabic"
                  />
                </div>

                {/* Building Number */}
                <div className="space-y-2">
                  <Label htmlFor="buildingNumber" className="font-arabic font-medium text-gray-700">
                    رقم المبنى
                  </Label>
                  <div className="relative">
                    <Input
                      id="buildingNumber"
                      placeholder="رقم المبنى"
                      value={formData.buildingNumber}
                      onChange={(e) => handleInputChange("buildingNumber", e.target.value)}
                      className="pr-10"
                    />
                    <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                {/* Postal Code */}
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="font-arabic font-medium text-gray-700">
                    الرمز البريدي
                  </Label>
                  <Input
                    id="postalCode"
                    placeholder="الرمز البريدي"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Information Section */}
          {activeSection === "contact" && (
            <Card className="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-600 text-white">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-800 font-arabic">
                      معلومات الاتصال
                    </CardTitle>
                    <CardDescription className="font-arabic text-gray-600">
                      وسائل الاتصال بالشركة للمراسلات الرسمية
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Country Code */}
                <div className="space-y-2">
                  <Label htmlFor="countryCode" className="font-arabic font-medium text-gray-700">
                    كود الدولة
                  </Label>
                  <Input
                    id="countryCode"
                    value="+966"
                    disabled
                    className="bg-gray-100"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-arabic font-medium text-gray-700">
                    رقم الهاتف
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="رقم الهاتف الأرضي"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="pr-10"
                    />
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="font-arabic font-medium text-gray-700 flex items-center">
                    رقم الجوال <span className="text-red-500 mr-1">*</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-gray-400 hover:text-gray-500 cursor-help mr-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="font-arabic">
                          <p>سيتم استخدامه لإرسال التنبيهات والتحقق</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="relative">
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="مثال: 512345678"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange("mobile", e.target.value)}
                      className="pr-10"
                      required
                    />
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex flex-col-reverse md:flex-row gap-4 pt-4">
            {activeSection !== "basic" && (
              <Button 
                type="button"
                variant="outline"
                className="px-6 font-arabic border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setActiveSection(activeSection === "address" ? "basic" : "address")}
              >
                السابق
              </Button>
            )}
            
            <div className="flex-1 flex flex-col-reverse md:flex-row gap-4">
              <Button 
                type="button"
                variant="outline"
                className="px-6 font-arabic border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={handleSaveDraft}
              >
                حفظ كمسودة
              </Button>
              
              {activeSection !== "contact" ? (
                <Button 
                  type="button"
                  onClick={() => setActiveSection(activeSection === "basic" ? "address" : "contact")}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-arabic font-medium py-4 shadow-md hover:shadow-lg transition-all"
                  disabled={
                    (activeSection === "basic" && !validateSection("basic")) ||
                    (activeSection === "address" && !validateSection("address"))
                  }
                >
                  التالي
                </Button>
              ) : (
                <Button 
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-arabic font-medium py-4 shadow-md hover:shadow-lg transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري التسجيل...
                    </span>
                  ) : (
                    "تسجيل البيانات والمتابعة"
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500 font-arabic">
          <p>جميع البيانات المقدمة محمية وفقاً لسياسة الخصوصية وشروط الاستخدام</p>
          <p className="mt-1">© {new Date().getFullYear()} نظام الشركات. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
};

export default DataCompletionPage;