import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  Search, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  UserCheck,
  UserX,
  Filter,
  RotateCcw
} from 'lucide-react';
import Breadcrumb from "@/components/Breadcrumb";
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
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
  businessType: string;
  activity: string;
  city: string;
  mobile: string;
  email: string;
  status: "نشط" | "متوقف";
  docId?: string;
  createdAt?: string;
}

const CustomerStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "نشط" | "متوقف">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const columns = [
    { key: "id", label: "رقم العميل", width: "w-24" },
    { key: "nameAr", label: "الاسم بالعربي", width: "w-48" },
    { key: "branch", label: "الفرع", width: "w-32" },
    { key: "businessType", label: "نوع العمل", width: "w-32" },
    { key: "city", label: "المدينة", width: "w-32" },
    { key: "mobile", label: "الجوال", width: "w-32" },
    { key: "status", label: "الحالة الحالية", width: "w-24" },
    { key: "lastUpdate", label: "آخر تحديث", width: "w-32" },
  ];

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

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // تغيير حالة العميل
  const handleStatusChange = async (customerId: string, newStatus: "نشط" | "متوقف") => {
    try {
      await updateDoc(doc(db, "customers", customerId), { 
        status: newStatus,
        lastStatusUpdate: new Date().toISOString()
      });
      
      toast({
        title: "تم التحديث",
        description: `تم تغيير حالة العميل إلى "${newStatus}" بنجاح`,
        variant: "default",
      });
      
      // تحديث الحالة في الـ state
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.docId === customerId 
            ? { ...customer, status: newStatus }
            : customer
        )
      );
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة العميل",
        variant: "destructive",
      });
    }
  };

  // تفعيل جميع العملاء
  const handleActivateAll = async () => {
    if (!confirm("هل أنت متأكد من تفعيل جميع العملاء؟")) return;
    
    setLoading(true);
    try {
      const inactiveCustomers = customers.filter(c => c.status === "متوقف");
      const updates = inactiveCustomers.map(customer => 
        customer.docId ? updateDoc(doc(db, "customers", customer.docId), { 
          status: "نشط",
          lastStatusUpdate: new Date().toISOString()
        }) : Promise.resolve()
      );
      
      await Promise.all(updates);
      
      toast({
        title: "تم التفعيل",
        description: `تم تفعيل ${inactiveCustomers.length} عميل بنجاح`,
        variant: "default",
      });
      
      fetchCustomers();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تفعيل العملاء",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // إلغاء تفعيل جميع العملاء
  const handleDeactivateAll = async () => {
    if (!confirm("هل أنت متأكد من إلغاء تفعيل جميع العملاء؟")) return;
    
    setLoading(true);
    try {
      const activeCustomers = customers.filter(c => c.status === "نشط");
      const updates = activeCustomers.map(customer => 
        customer.docId ? updateDoc(doc(db, "customers", customer.docId), { 
          status: "متوقف",
          lastStatusUpdate: new Date().toISOString()
        }) : Promise.resolve()
      );
      
      await Promise.all(updates);
      
      toast({
        title: "تم الإلغاء",
        description: `تم إلغاء تفعيل ${activeCustomers.length} عميل بنجاح`,
        variant: "default",
      });
      
      fetchCustomers();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إلغاء تفعيل العملاء",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // تصفية العملاء حسب البحث والحالة
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = Object.values(customer).some(
      value => value && 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // ترقيم الصفحات
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "غير محدد";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: arSA });
    } catch {
      return dateStr;
    }
  };

  const getStatusCount = (status: "نشط" | "متوقف") => {
    return customers.filter(c => c.status === status).length;
  };

  return (
    <div className="min-h-screen bg-background rtl" dir="rtl">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-emerald-600 ml-3" />
            <h1 className="text-2xl font-bold text-gray-800">تفعيل/إلغاء العملاء</h1>
          </div>
          <p className="text-gray-600 mt-2">إدارة حالة العملاء النشطة والمتوقفة</p>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
        </div>

        <Breadcrumb
          items={[
            { label: "الرئيسية", to: "/" },
            { label: "إدارة المبيعات", to: "/management/sales" },
            { label: "تفعيل/إلغاء العملاء" },
          ]}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
                  <p className="text-2xl font-bold">{customers.length}</p>
                </div>
                <UserCheck className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">العملاء النشطون</p>
                  <p className="text-2xl font-bold text-green-600">
                    {getStatusCount("نشط")}
                  </p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">العملاء المتوقفون</p>
                  <p className="text-2xl font-bold text-red-600">
                    {getStatusCount("متوقف")}
                  </p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <UserX className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">نسبة التفعيل</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {customers.length > 0 ? Math.round((getStatusCount("نشط") / customers.length) * 100) : 0}%
                  </p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleActivateAll} 
              disabled={loading || getStatusCount("متوقف") === 0}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <UserCheck className="h-4 w-4" />
              تفعيل الكل
            </Button>
            <Button 
              onClick={handleDeactivateAll} 
              disabled={loading || getStatusCount("نشط") === 0}
              variant="destructive"
              className="gap-2"
            >
              <UserX className="h-4 w-4" />
              إلغاء تفعيل الكل
            </Button>
            <Button 
              onClick={fetchCustomers} 
              variant="outline"
              disabled={loading}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              تحديث
            </Button>
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
              onChange={(e) => setStatusFilter(e.target.value as "all" | "نشط" | "متوقف")}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">جميع الحالات</option>
              <option value="نشط">نشط فقط</option>
              <option value="متوقف">متوقف فقط</option>
            </select>
          </div>
        </div>

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
                <TableHead className="w-32">تغيير الحالة</TableHead>
                <TableHead className="w-24">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="text-center py-6">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="text-center py-6">
                    {searchTerm || statusFilter !== "all" ? "لا توجد نتائج للبحث" : "لا يوجد عملاء"}
                  </TableCell>
                </TableRow>
              ) : paginatedCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium">{customer.id}</TableCell>
                  <TableCell className="font-medium">{customer.nameAr}</TableCell>
                  <TableCell>{customer.branch}</TableCell>
                  <TableCell>{customer.businessType}</TableCell>
                  <TableCell>{customer.city}</TableCell>
                  <TableCell>{customer.mobile}</TableCell>
                  <TableCell>
                    <Badge variant={customer.status === "نشط" ? "default" : "secondary"}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(customer.createdAt || "")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={customer.status === "نشط"}
                        onCheckedChange={(checked) => 
                          customer.docId && handleStatusChange(customer.docId, checked ? "نشط" : "متوقف")
                        }
                      />
                      <span className="text-xs text-muted-foreground">
                        {customer.status === "نشط" ? "مفعل" : "متوقف"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/customers/view/${customer.docId}`)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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
      </div>
    </div>
  );
};

export default CustomerStatusPage;
