import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  Search, 
  Eye, 
  Edit, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Crown,
  User,
  Users,
  Building,
  Filter,
  BarChart3
} from 'lucide-react';
import Breadcrumb from "@/components/Breadcrumb";
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Customer {
  id: string;
  nameAr: string;
  nameEn: string;
  branch: string;
  commercialReg: string;
  businessType: string;
  activity: string;
  city: string;
  creditLimit: string;
  mobile: string;
  email: string;
  status: "نشط" | "متوقف";
  category?: "VIP" | "ذهبي" | "فضي" | "عادي";
  priority?: "عالي" | "متوسط" | "منخفض";
  docId?: string;
}

type CustomerCategory = "VIP" | "ذهبي" | "فضي" | "عادي";
type CustomerPriority = "عالي" | "متوسط" | "منخفض";

const CustomerClassificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | CustomerCategory>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | CustomerPriority>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const categories: CustomerCategory[] = ["VIP", "ذهبي", "فضي", "عادي"];
  const priorities: CustomerPriority[] = ["عالي", "متوسط", "منخفض"];

  const columns = [
    { key: "id", label: "رقم العميل", width: "w-24" },
    { key: "nameAr", label: "الاسم بالعربي", width: "w-48" },
    { key: "branch", label: "الفرع", width: "w-32" },
    { key: "businessType", label: "نوع العمل", width: "w-32" },
    { key: "creditLimit", label: "الحد الائتماني", width: "w-32" },
    { key: "category", label: "التصنيف", width: "w-24" },
    { key: "priority", label: "الأولوية", width: "w-24" },
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

  // تحديث تصنيف العميل
  const handleCategoryChange = async (customerId: string, newCategory: CustomerCategory) => {
    try {
      await updateDoc(doc(db, "customers", customerId), { 
        category: newCategory,
        lastCategoryUpdate: new Date().toISOString()
      });
      
      toast({
        title: "تم التحديث",
        description: `تم تغيير تصنيف العميل إلى "${newCategory}" بنجاح`,
        variant: "default",
      });
      
      // تحديث التصنيف في الـ state
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.docId === customerId 
            ? { ...customer, category: newCategory }
            : customer
        )
      );
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث تصنيف العميل",
        variant: "destructive",
      });
    }
  };

  // تحديث أولوية العميل
  const handlePriorityChange = async (customerId: string, newPriority: CustomerPriority) => {
    try {
      await updateDoc(doc(db, "customers", customerId), { 
        priority: newPriority,
        lastPriorityUpdate: new Date().toISOString()
      });
      
      toast({
        title: "تم التحديث",
        description: `تم تغيير أولوية العميل إلى "${newPriority}" بنجاح`,
        variant: "default",
      });
      
      // تحديث الأولوية في الـ state
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.docId === customerId 
            ? { ...customer, priority: newPriority }
            : customer
        )
      );
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث أولوية العميل",
        variant: "destructive",
      });
    }
  };

  // تصنيف تلقائي بناءً على الحد الائتماني
  const handleAutoClassification = async () => {
    if (!confirm("هل أنت متأكد من التصنيف التلقائي للعملاء؟")) return;
    
    setLoading(true);
    try {
      const updates = customers.map(customer => {
        if (!customer.docId) return Promise.resolve();
        
        const creditLimit = parseFloat(customer.creditLimit) || 0;
        let category: CustomerCategory;
        let priority: CustomerPriority;
        
        // تصنيف بناءً على الحد الائتماني
        if (creditLimit >= 1000000) {
          category = "VIP";
          priority = "عالي";
        } else if (creditLimit >= 500000) {
          category = "ذهبي";
          priority = "عالي";
        } else if (creditLimit >= 100000) {
          category = "فضي";
          priority = "متوسط";
        } else {
          category = "عادي";
          priority = "منخفض";
        }
        
        return updateDoc(doc(db, "customers", customer.docId), { 
          category,
          priority,
          lastAutoClassification: new Date().toISOString()
        });
      });
      
      await Promise.all(updates);
      
      toast({
        title: "تم التصنيف",
        description: "تم تصنيف العملاء تلقائياً بنجاح",
        variant: "default",
      });
      
      fetchCustomers();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء التصنيف التلقائي",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // تصفية العملاء
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = Object.values(customer).some(
      value => value && 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesCategory = categoryFilter === "all" || customer.category === categoryFilter;
    const matchesPriority = priorityFilter === "all" || customer.priority === priorityFilter;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // ترقيم الصفحات
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // إحصائيات التصنيف
  const getCategoryCount = (category: CustomerCategory) => {
    return customers.filter(c => c.category === category).length;
  };

  const getPriorityCount = (priority: CustomerPriority) => {
    return customers.filter(c => c.priority === priority).length;
  };

  const getCategoryBadgeColor = (category?: CustomerCategory) => {
    switch (category) {
      case "VIP": return "bg-purple-600 text-white";
      case "ذهبي": return "bg-yellow-500 text-white";
      case "فضي": return "bg-gray-400 text-white";
      case "عادي": return "bg-blue-500 text-white";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  const getPriorityBadgeColor = (priority?: CustomerPriority) => {
    switch (priority) {
      case "عالي": return "bg-red-500 text-white";
      case "متوسط": return "bg-orange-500 text-white";
      case "منخفض": return "bg-green-500 text-white";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  const getCategoryIcon = (category?: CustomerCategory) => {
    switch (category) {
      case "VIP": return <Crown className="h-4 w-4" />;
      case "ذهبي": return <Star className="h-4 w-4" />;
      case "فضي": return <User className="h-4 w-4" />;
      case "عادي": return <Users className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background rtl" dir="rtl">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-600 ml-3" />
            <h1 className="text-2xl font-bold text-gray-800">تصنيف العملاء</h1>
          </div>
          <p className="text-gray-600 mt-2">تصنيف العملاء حسب النوع والقيمة والأولوية</p>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-purple-500"></div>
        </div>

        <Breadcrumb
          items={[
            { label: "الرئيسية", to: "/" },
            { label: "إدارة المبيعات", to: "/management/sales" },
            { label: "تصنيف العملاء" },
          ]}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">عملاء VIP</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {getCategoryCount("VIP")}
                  </p>
                </div>
                <Crown className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">عملاء ذهبيون</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {getCategoryCount("ذهبي")}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">عملاء فضيون</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {getCategoryCount("فضي")}
                  </p>
                </div>
                <User className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">عملاء عاديون</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {getCategoryCount("عادي")}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Priority Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">أولوية عالية</p>
                  <p className="text-2xl font-bold text-red-600">
                    {getPriorityCount("عالي")}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">أولوية متوسطة</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {getPriorityCount("متوسط")}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">أولوية منخفضة</p>
                  <p className="text-2xl font-bold text-green-600">
                    {getPriorityCount("منخفض")}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleAutoClassification} 
              disabled={loading}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Star className="h-4 w-4" />
              تصنيف تلقائي
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as "all" | CustomerCategory)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">جميع التصنيفات</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as "all" | CustomerPriority)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">جميع الأولويات</option>
              {priorities.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
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
                <TableHead className="w-32">تغيير التصنيف</TableHead>
                <TableHead className="w-32">تغيير الأولوية</TableHead>
                <TableHead className="w-24">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 3} className="text-center py-6">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 3} className="text-center py-6">
                    {searchTerm || categoryFilter !== "all" || priorityFilter !== "all" ? "لا توجد نتائج للبحث" : "لا يوجد عملاء"}
                  </TableCell>
                </TableRow>
              ) : paginatedCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium">{customer.id}</TableCell>
                  <TableCell className="font-medium">{customer.nameAr}</TableCell>
                  <TableCell>{customer.branch}</TableCell>
                  <TableCell>{customer.businessType}</TableCell>
                  <TableCell>
                    {customer.creditLimit ? `${parseFloat(customer.creditLimit).toLocaleString()} ر.س` : "غير محدد"}
                  </TableCell>
                  <TableCell>
                    <Badge className={`gap-1 ${getCategoryBadgeColor(customer.category)}`}>
                      {getCategoryIcon(customer.category)}
                      {customer.category || "غير محدد"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getPriorityBadgeColor(customer.priority)}`}>
                      {customer.priority || "غير محدد"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={customer.category || ""}
                      onValueChange={(value) => customer.docId && handleCategoryChange(customer.docId, value as CustomerCategory)}
                    >
                      <SelectTrigger className="w-28 h-8">
                        <SelectValue placeholder="اختر" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={customer.priority || ""}
                      onValueChange={(value) => customer.docId && handlePriorityChange(customer.docId, value as CustomerPriority)}
                    >
                      <SelectTrigger className="w-28 h-8">
                        <SelectValue placeholder="اختر" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map(priority => (
                          <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/customers/edit/${customer.docId}`)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
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

export default CustomerClassificationPage;
