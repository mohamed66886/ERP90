import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  Search, 
  Edit, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  Clock,
  User
} from 'lucide-react';
import Breadcrumb from "@/components/Breadcrumb";
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

interface Customer {
  id: string;
  nameAr: string;
  nameEn: string;
  branch: string;
  businessType: string;
  city: string;
  mobile: string;
  email: string;
  status: "نشط" | "متوقف";
  category?: "VIP" | "ذهبي" | "فضي" | "عادي";
  lastContactDate?: string;
  nextFollowUpDate?: string;
  customerNotes?: string;
  docId?: string;
}

interface FollowUpRecord {
  id?: string;
  customerId: string;
  customerName: string;
  contactType: "مكالمة" | "بريد إلكتروني" | "زيارة" | "رسالة";
  contactDate: string;
  nextFollowUpDate?: string;
  notes: string;
  status: "مكتمل" | "مجدول" | "متأخر";
  createdBy: string;
  createdAt: string;
}

const CustomerFollowUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [followUpRecords, setFollowUpRecords] = useState<FollowUpRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "due" | "overdue" | "completed">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const itemsPerPage = 10;

  const [newFollowUp, setNewFollowUp] = useState<Partial<FollowUpRecord>>({
    contactType: "مكالمة",
    contactDate: format(new Date(), "yyyy-MM-dd"),
    status: "مكتمل",
    notes: "",
    createdBy: "المستخدم الحالي" // TODO: replace with actual user
  });

  const contactTypes = ["مكالمة", "بريد إلكتروني", "زيارة", "رسالة"];
  const followUpStatuses = ["مكتمل", "مجدول", "متأخر"];

  // جلب العملاء من Firestore
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
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات العملاء",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // جلب سجلات المتابعة
  const fetchFollowUpRecords = useCallback(async () => {
    try {
      const q = query(collection(db, "customerFollowUps"), orderBy("contactDate", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(docSnap => ({ 
        ...docSnap.data() as FollowUpRecord, 
        id: docSnap.id 
      }));
      setFollowUpRecords(data);
    } catch (err) {
      console.error("Error fetching follow-up records:", err);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchFollowUpRecords();
  }, [fetchCustomers, fetchFollowUpRecords]);

  // إضافة متابعة جديدة
  const handleAddFollowUp = async () => {
    if (!selectedCustomer || !newFollowUp.notes) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع البيانات المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      const followUpData: FollowUpRecord = {
        customerId: selectedCustomer.docId!,
        customerName: selectedCustomer.nameAr,
        contactType: newFollowUp.contactType!,
        contactDate: newFollowUp.contactDate!,
        nextFollowUpDate: newFollowUp.nextFollowUpDate,
        notes: newFollowUp.notes!,
        status: newFollowUp.status!,
        createdBy: newFollowUp.createdBy!,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "customerFollowUps"), followUpData);

      // تحديث تاريخ آخر اتصال للعميل
      if (selectedCustomer.docId) {
        await updateDoc(doc(db, "customers", selectedCustomer.docId), {
          lastContactDate: newFollowUp.contactDate,
          nextFollowUpDate: newFollowUp.nextFollowUpDate,
          lastFollowUpUpdate: new Date().toISOString()
        });
      }

      toast({
        title: "تم الحفظ",
        description: "تم إضافة متابعة العميل بنجاح",
        variant: "default",
      });

      setShowAddDialog(false);
      setSelectedCustomer(null);
      setNewFollowUp({
        contactType: "مكالمة",
        contactDate: format(new Date(), "yyyy-MM-dd"),
        status: "مكتمل",
        notes: "",
        createdBy: "المستخدم الحالي"
      });

      fetchCustomers();
      fetchFollowUpRecords();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ المتابعة",
        variant: "destructive",
      });
    }
  };

  // حساب حالة المتابعة
  const getFollowUpStatus = (customer: Customer) => {
    const today = new Date();
    const nextFollowUp = customer.nextFollowUpDate ? new Date(customer.nextFollowUpDate) : null;
    
    if (!nextFollowUp) return "no-date";
    if (nextFollowUp < today) return "overdue";
    if (nextFollowUp.toDateString() === today.toDateString()) return "due";
    return "scheduled";
  };

  // تصفية العملاء
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = Object.values(customer).some(
      value => value && 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    let matchesStatus = true;
    if (statusFilter !== "all") {
      const followUpStatus = getFollowUpStatus(customer);
      switch (statusFilter) {
        case "due":
          matchesStatus = followUpStatus === "due";
          break;
        case "overdue":
          matchesStatus = followUpStatus === "overdue";
          break;
        case "completed":
          matchesStatus = followUpStatus === "scheduled";
          break;
      }
    }
    
    return matchesSearch && matchesStatus;
  });

  // ترقيم الصفحات
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "غير محدد";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: arSA });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (customer: Customer) => {
    const status = getFollowUpStatus(customer);
    switch (status) {
      case "overdue":
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />متأخر</Badge>;
      case "due":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />مستحق اليوم</Badge>;
      case "scheduled":
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />مجدول</Badge>;
      default:
        return <Badge variant="outline" className="gap-1">غير محدد</Badge>;
    }
  };

  const getFollowUpStats = () => {
    const today = new Date();
    let due = 0, overdue = 0, scheduled = 0;
    
    customers.forEach(customer => {
      const status = getFollowUpStatus(customer);
      switch (status) {
        case "due": due++; break;
        case "overdue": overdue++; break;
        case "scheduled": scheduled++; break;
      }
    });
    
    return { due, overdue, scheduled, total: customers.length };
  };

  const stats = getFollowUpStats();

  return (
    <div className="min-h-screen bg-background rtl" dir="rtl">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-indigo-600 ml-3" />
            <h1 className="text-2xl font-bold text-gray-800">متابعة العملاء</h1>
          </div>
          <p className="text-gray-600 mt-2">متابعة وتقييم العملاء وجدولة الاتصالات</p>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-500"></div>
        </div>

        <Breadcrumb
          items={[
            { label: "الرئيسية", to: "/" },
            { label: "إدارة المبيعات", to: "/management/sales" },
            { label: "متابعة العملاء" },
          ]}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <User className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">متابعة اليوم</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.due}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">متابعة متأخرة</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">متابعة مجدولة</p>
                  <p className="text-2xl font-bold text-green-600">{stats.scheduled}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              عرض {filteredCustomers.length} من {customers.length} عميل
            </span>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن عميل..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "due" | "overdue" | "completed")}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">جميع الحالات</option>
              <option value="due">مستحق اليوم</option>
              <option value="overdue">متأخر</option>
              <option value="completed">مجدول</option>
            </select>
          </div>
        </div>

        {/* Customers Table */}
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">رقم العميل</TableHead>
                <TableHead className="w-48">اسم العميل</TableHead>
                <TableHead className="w-32">الفرع</TableHead>
                <TableHead className="w-32">نوع العمل</TableHead>
                <TableHead className="w-32">الجوال</TableHead>
                <TableHead className="w-32">آخر اتصال</TableHead>
                <TableHead className="w-32">المتابعة القادمة</TableHead>
                <TableHead className="w-24">الحالة</TableHead>
                <TableHead className="w-32">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6">
                    {searchTerm || statusFilter !== "all" ? "لا توجد نتائج للبحث" : "لا يوجد عملاء"}
                  </TableCell>
                </TableRow>
              ) : paginatedCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium">{customer.id}</TableCell>
                  <TableCell className="font-medium">{customer.nameAr}</TableCell>
                  <TableCell>{customer.branch}</TableCell>
                  <TableCell>{customer.businessType}</TableCell>
                  <TableCell>{customer.mobile}</TableCell>
                  <TableCell>{formatDate(customer.lastContactDate)}</TableCell>
                  <TableCell>{formatDate(customer.nextFollowUpDate)}</TableCell>
                  <TableCell>{getStatusBadge(customer)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/customers/view/${customer.docId}`)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCustomer(customer)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rtl" dir="rtl">
                          <DialogHeader>
                            <DialogTitle>إضافة متابعة للعميل</DialogTitle>
                            <DialogDescription>
                              إضافة سجل متابعة جديد للعميل: {customer.nameAr}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">نوع الاتصال</label>
                              <Select
                                value={newFollowUp.contactType || ""}
                                onValueChange={(value) => setNewFollowUp(prev => ({ ...prev, contactType: value as "مكالمة" | "بريد إلكتروني" | "زيارة" | "رسالة" }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر نوع الاتصال" />
                                </SelectTrigger>
                                <SelectContent>
                                  {contactTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">تاريخ الاتصال</label>
                              <Input
                                type="date"
                                value={newFollowUp.contactDate || ""}
                                onChange={(e) => setNewFollowUp(prev => ({ ...prev, contactDate: e.target.value }))}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">تاريخ المتابعة القادمة</label>
                              <Input
                                type="date"
                                value={newFollowUp.nextFollowUpDate || ""}
                                onChange={(e) => setNewFollowUp(prev => ({ ...prev, nextFollowUpDate: e.target.value }))}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">حالة المتابعة</label>
                              <Select
                                value={newFollowUp.status || ""}
                                onValueChange={(value) => setNewFollowUp(prev => ({ ...prev, status: value as "مكتمل" | "مجدول" | "متأخر" }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر الحالة" />
                                </SelectTrigger>
                                <SelectContent>
                                  {followUpStatuses.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">ملاحظات المتابعة</label>
                              <Textarea
                                value={newFollowUp.notes || ""}
                                onChange={(e) => setNewFollowUp(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="أدخل ملاحظات المتابعة..."
                                rows={3}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setSelectedCustomer(null)}>
                              إلغاء
                            </Button>
                            <Button type="button" onClick={handleAddFollowUp}>
                              حفظ المتابعة
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
                <span className="flex items-center px-3 text-sm">
                  صفحة {currentPage} من {totalPages}
                </span>
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

        {/* Recent Follow-ups */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">آخر المتابعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {followUpRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {record.contactType === "مكالمة" && <Phone className="h-4 w-4 text-blue-600" />}
                      {record.contactType === "بريد إلكتروني" && <Mail className="h-4 w-4 text-blue-600" />}
                      {record.contactType === "زيارة" && <User className="h-4 w-4 text-blue-600" />}
                      {record.contactType === "رسالة" && <MessageSquare className="h-4 w-4 text-blue-600" />}
                    </div>
                    <div>
                      <p className="font-medium">{record.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.contactType} - {formatDate(record.contactDate)}
                      </p>
                      <p className="text-sm">{record.notes}</p>
                    </div>
                  </div>
                  <Badge variant={record.status === "مكتمل" ? "default" : "secondary"}>
                    {record.status}
                  </Badge>
                </div>
              ))}
              {followUpRecords.length === 0 && (
                <p className="text-center text-muted-foreground py-6">لا توجد متابعات مسجلة</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerFollowUpPage;
