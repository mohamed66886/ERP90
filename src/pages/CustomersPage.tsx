// ...existing code...
import * as XLSX from "xlsx";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
// ...existing code...
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, PlusCircle, Loader2, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

// أنواع TypeScript
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

const columns = [
  { key: "id", label: "رقم العميل", width: "w-24" },
  { key: "nameAr", label: "الاسم بالعربي", width: "w-48" },
  { key: "nameEn", label: "الاسم بالإنجليزي", width: "w-48" },
  { key: "branch", label: "الفرع", width: "w-32" },
  { key: "commercialReg", label: "السجل التجاري", width: "w-32" },
  { key: "regDate", label: "تاريخ السجل", width: "w-32" },
  { key: "businessType", label: "نوع العمل", width: "w-32" },
  { key: "status", label: "الحالة", width: "w-24" },
];

const today = new Date();
const todayStr = format(today, "yyyy-MM-dd");

const initialForm: Customer = {
  id: "",
  nameAr: "",
  nameEn: "",
  branch: "",
  commercialReg: "",
  regDate: todayStr,
  regAuthority: "",
  businessType: "",
  activity: "",
  startDate: "",
  city: "",
  creditLimit: "",
  region: "",
  district: "",
  street: "",
  buildingNo: "",
  postalCode: "",
  countryCode: "SA",
  phone: "",
  mobile: "",
  email: "",
  status: "نشط",
  taxFileNumber: "",
  taxFileExpiry: ""
};

const businessTypes = ["شركة", "مؤسسة", "فرد"];
const activities = ["مقاولات", "تجارة تجزئة", "صناعة", "خدمات"];
  // ...
const cities = ["الرياض", "جدة", "الدمام", "مكة", "الخبر", "الطائف"];
const statusOptions = ["نشط", "متوقف"] as const;


const CustomersPage = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // جلب الفروع من Firestore
  const [branches, setBranches] = useState<string[]>([]);
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [form, setForm] = useState<Customer>(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // توزيع العملاء عشوائياً على الفروع
  const handleDistributeBranches = async () => {
    if (customers.length === 0) return;
    setLoading(true);
    try {
      const updates = customers.map(async (customer) => {
        const randomBranch = branches[Math.floor(Math.random() * branches.length)];
        if (customer.docId) {
          await updateDoc(doc(db, "customers", customer.docId), { branch: randomBranch });
        }
      });
      await Promise.all(updates);
      toast({
        title: "تم التوزيع",
        description: "تم توزيع العملاء عشوائياً على الفروع",
        variant: "default",
      });
      fetchCustomers();
    } catch (err) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء توزيع العملاء",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // دالة استيراد العملاء من ملف Excel
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
  // توزيع العملاء عشوائياً على الفروع
  const handleDistributeBranches = async () => {
    if (customers.length === 0) return;
    setLoading(true);
    try {
      const updates = customers.map(async (customer) => {
        const randomBranch = branches[Math.floor(Math.random() * branches.length)];
        if (customer.docId) {
          await updateDoc(doc(db, "customers", customer.docId), { branch: randomBranch });
        }
      });
      await Promise.all(updates);
      toast({
        title: "تم التوزيع",
        description: "تم توزيع العملاء عشوائياً على الفروع",
        variant: "default",
      });
      fetchCustomers();
    } catch (err) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء توزيع العملاء",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });

      // استخراج آخر رقم عميل حالي
      let maxNum = customers
        .map(c => {
          const match = /^c-(\d{4})$/.exec(c.id);
          return match ? parseInt(match[1], 10) : 0;
        })
        .reduce((a, b) => Math.max(a, b), 0);

      let addedCount = 0;
      for (const row of rows) {
        // تحويل رؤوس الأعمدة إلى حقول Customer
        const customer: Partial<Customer> = {
          nameAr: row["اسم العميل"] || row["اسم العميل "] || row["الاسم بالعربي"] || "",
          branch: row["الفرع"] || "",
          commercialReg: row["رقم البطاقة / الهوية"] || row["السجل التجاري"] || "",
          regDate: row["تاريخ إصدار البطاقة / الهوية"] || row["تاريخ السجل"] || todayStr,
          regAuthority: row["الجهة المُصدرة للهوية"] || row["جهة الإصدار"] || "",
          businessType: row["نوع العميل"] || row["نوع العمل"] || "",
          activity: row["مجال الصناعة"] || row["النشاط"] || "",
          startDate: row["تاريخ الإنشاء"] || row["تاريخ بداية التعامل"] || "",
          city: row["المدينة"] || "",
          creditLimit: row["الحد الائتماني"] || "",
          region: row["المنطقة"] || "",
          district: row["الحي"] || "",
          street: row["الشارع"] || "",
          buildingNo: row["رقم المبنى"] || "",
          postalCode: row["الرمز البريدي"] || "",
          countryCode: row["كود الدولة"] || "SA",
          phone: row["الهاتف"] || row["رقم التليفون"] || "",
          mobile: row["المحمول"] || row["موبايل الكفيل"] || row["موبايل"] || "",
          email: row["البريد الإلكتروني"] || row["بريد إلكتروني إضافي"] || "",
          status: row["اسم الحالة"] === "متوقف" ? "متوقف" : "نشط",
          taxFileNumber: row["رقم الملف الضريبي"] || "",
          taxFileExpiry: row["تاريخ انتهاء الملف الضريبي"] || "",
        };
        // الاسم بالإنجليزي تلقائي
        customer.nameEn = arabicToEnglish(customer.nameAr || "");
        // رقم العميل تلقائي
        maxNum++;
        customer.id = `c-${maxNum.toString().padStart(4, "0")}`;
        // إضافة العميل
        await addDoc(collection(db, "customers"), {
          ...initialForm,
          ...customer,
          createdAt: new Date().toISOString(),
        });
        addedCount++;
      }
      toast({
        title: "تم الاستيراد",
        description: `تم استيراد ${addedCount} عميل بنجاح`,
        variant: "default",
      });
      fetchCustomers();
    } catch (err) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء استيراد الملف",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // جلب العملاء من Firestore مع memoization
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "customers"), orderBy("id", "asc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(docSnap => ({ 
        ...docSnap.data() as Customer, 
        docId: docSnap.id 
      }));
      setCustomers(data);
    } catch (err) {
      setError("تعذر تحميل العملاء");
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات العملاء",
        variant: "destructive",
        action: <ToastAction altText="حاول مرة أخرى" onClick={fetchCustomers}>حاول مرة أخرى</ToastAction>,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // تحويل الاسم العربي إلى إنجليزي بشكل منطوق
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
    const { name, value } = e.target;
    
    if (name === "nameAr") {
      setForm(prev => ({
        ...prev,
        nameAr: value,
        nameEn: !prev.nameEn || prev.nameEn === arabicToEnglish(prev.nameAr) 
          ? arabicToEnglish(value) 
          : prev.nameEn
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: keyof Customer, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setIsEditing(false);
    setShowForm(false);
  };

  const handleEdit = (customer: Customer) => {
    setForm(customer);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (docId: string) => {
    try {
      await deleteDoc(doc(db, "customers", docId));
      toast({
        title: "تم الحذف",
        description: "تم حذف العميل بنجاح",
        variant: "default",
      });
      fetchCustomers();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف العميل",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isEditing && form.docId) {
        // استبعاد docId من التحديث
        const { docId, ...updateData } = form;
        await updateDoc(doc(db, "customers", form.docId), updateData);
        toast({
          title: "تم التحديث",
          description: "تم تحديث بيانات العميل بنجاح",
          variant: "default",
        });

      } else {
        // Find the max numeric part of id, ignoring non-matching ids
        const maxNum = customers
          .map(c => {
            const match = /^c-(\d{4})$/.exec(c.id);
            return match ? parseInt(match[1], 10) : 0;
          })
          .reduce((a, b) => Math.max(a, b), 0);
        const nextNum = maxNum + 1;
        const newId = `c-${nextNum.toString().padStart(4, '0')}`;

        await addDoc(collection(db, "customers"), { 
          ...form, 
          id: newId,
          createdAt: new Date().toISOString()
        });
        toast({
          title: "تم الإضافة",
          description: "تم إضافة العميل بنجاح",
          variant: "default",
        });
      }
      
      fetchCustomers();
      resetForm();
    } catch (err) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // تصفية العملاء حسب البحث
  const filteredCustomers = customers.filter(customer =>
    Object.values(customer).some(
      value => value && 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // ترقيم الصفحات
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: arSA });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-background rtl" dir="rtl">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-y-auto">
          <Header
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            isSidebarCollapsed={sidebarCollapsed}
            onLogout={() => { /* TODO: implement logout */ }}
          />
          <main className="flex-1 p-6 lg:p-8">
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold font-arabic">إدارة العملاء</h1>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Button onClick={handleDistributeBranches} variant="secondary" className="gap-2">
                    توزيع عشوائي على الفروع
                  </Button>
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ابحث عن عميل..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    <span>عميل جديد</span>
                  </Button>
                  <Button asChild variant="outline" className="gap-2">
                    <label htmlFor="import-excel" className="flex items-center cursor-pointer">
                      <input
                        id="import-excel"
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        style={{ display: 'none' }}
                        onChange={handleImportExcel}
                      />
                      <span>استيراد من Excel</span>
                    </label>
                  </Button>
                </div>
              </div>

              {/* Customer Form Card - only show if showForm or editing */}
              {(showForm || isEditing) && (
                <Card className="p-6 mb-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                      {isEditing ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
                    </h2>
                    <Button variant="outline" onClick={resetForm} size="sm">
                      {isEditing ? "إلغاء التعديل" : "مسح النموذج"}
                    </Button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* العمود الأول */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">رقم العميل</label>
                          <Input
                            name="id"
                            value={form.id}
                            placeholder="تلقائي"
                            disabled
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
                          <div className="flex gap-2">
                            <Input 
                              name="countryCode" 
                              value={form.countryCode} 
                              onChange={handleChange} 
                              className="w-20"
                            />
                            <Input 
                              name="mobile" 
                              value={form.mobile} 
                              onChange={handleChange} 
                              required
                            />
                          </div>
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
                        <div className="flex items-end gap-2 pt-2">
                          <Button type="submit" className="flex-1" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "حفظ التعديلات" : "حفظ العميل"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={resetForm}
                            className="flex-1"
                          >
                            إلغاء
                          </Button>
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
                            value={form.taxFileNumber}
                            onChange={handleChange}
                            placeholder="أدخل رقم الملف الضريبي"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">تاريخ انتهاء الملف الضريبي</label>
                          <Input
                            name="taxFileExpiry"
                            value={form.taxFileExpiry}
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
                          <label className="block text-sm font-medium mb-1">رقم التليفون</label>
                          <Input 
                            name="phone" 
                            value={form.phone} 
                            onChange={handleChange} 
                          />
                        </div>
                      </div>
                    </Card>
                  </form>
                </Card>
              )}

              {/* Customers Table */}
              <Card className="p-0 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map(col => (
                        <TableHead key={col.key} className={col.width}>
                          {col.label}
                        </TableHead>
                      ))}
                      <TableHead className="w-32">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={columns.length + 1} className="text-center py-6">
                          <div className="flex justify-center items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            جاري التحميل...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={columns.length + 1} className="text-center text-red-600 py-6">
                          {error}
                        </TableCell>
                      </TableRow>
                    ) : paginatedCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={columns.length + 1} className="text-center py-6">
                          لا يوجد عملاء
                        </TableCell>
                      </TableRow>
                    ) : paginatedCustomers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-gray-50/50">
                        <TableCell>{customer.id}</TableCell>
                        <TableCell className="font-medium">{customer.nameAr}</TableCell>
                        <TableCell>{customer.nameEn}</TableCell>
                        <TableCell>{customer.branch}</TableCell>
                        <TableCell>{customer.commercialReg}</TableCell>
                        <TableCell>{formatDate(customer.regDate)}</TableCell>
                        <TableCell>{customer.businessType}</TableCell>
                        <TableCell>
                          <Badge variant={customer.status === "نشط" ? "default" : "destructive"}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEdit(customer)}
                              className="h-8 px-2"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => customer.docId && handleDelete(customer.docId)}
                              className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {filteredCustomers.length > itemsPerPage && (
                  <div className="flex items-center justify-between p-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      عرض {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCustomers.length)}-
                      {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} من {filteredCustomers.length} عميل
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;