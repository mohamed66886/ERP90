import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiPlus, FiEdit, FiTrash2, FiUser, FiPhone, FiMapPin, FiCreditCard, FiSearch, FiTruck, FiMail } from 'react-icons/fi';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Supplier {
  id: string;
  name: string;
  companyNumber: string;
  phone: string;
  address: string;
  email?: string;
  branch?: string;
  createdAt?: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  manager: string;
}

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    companyNumber: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    companyNumber: '',
    phone: '',
    address: '',
    email: '',
    branch: 'no-branch'
  });

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const suppliersSnapshot = await getDocs(collection(db, 'suppliers'));
      const suppliersData = suppliersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Supplier[];
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "خطأ في التحميل",
        description: "حدث خطأ في تحميل بيانات الموردين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const branchesSnapshot = await getDocs(collection(db, 'branches'));
      const branchesData = branchesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Branch[];
      setBranches(branchesData);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone.includes(searchTerm) ||
    (supplier.companyNumber && supplier.companyNumber.includes(searchTerm)) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const validateForm = async () => {
    const newErrors = { name: '', phone: '', companyNumber: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'اسم المورد مطلوب';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
      isValid = false;
    }

    if (formData.phone.trim() && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
      isValid = false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.companyNumber = 'البريد الإلكتروني غير صحيح';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAddSupplier = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      await addDoc(collection(db, 'suppliers'), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة المورد الجديد بنجاح",
      });
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        companyNumber: '',
        phone: '',
        address: '',
        email: '',
        branch: 'no-branch'
      });
      fetchSuppliers();
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast({
        title: "خطأ في الإضافة",
        description: "حدث خطأ أثناء إضافة المورد",
        variant: "destructive",
      });
    }
  };

  const handleEditSupplier = async () => {
    if (!selectedSupplier) return;
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      await updateDoc(doc(db, 'suppliers', selectedSupplier.id), formData);
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات المورد بنجاح",
      });
      setIsEditDialogOpen(false);
      fetchSuppliers();
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث المورد",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    try {
      await deleteDoc(doc(db, 'suppliers', supplier.id));
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المورد بنجاح",
      });
      fetchSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف المورد",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      companyNumber: supplier.companyNumber || '',
      phone: supplier.phone,
      address: supplier.address || '',
      email: supplier.email || '',
      branch: supplier.branch || 'no-branch'
    });
    setIsEditDialogOpen(true);
  };

  useEffect(() => {
    fetchSuppliers();
    fetchBranches();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6 space-y-6 w-full max-w-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة الموردين</h1>
          <p className="text-gray-600">إدارة وتنظيم بيانات الموردين</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <FiPlus className="mr-2" />
              إضافة مورد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>إضافة مورد جديد</DialogTitle>
              <DialogDescription>أدخل بيانات المورد الجديد</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  اسم المورد *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="col-span-3"
                />
                {errors.name && <p className="col-span-4 text-right text-sm text-red-500">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="companyNumber" className="text-right">
                  رقم الشركة
                </Label>
                <Input
                  id="companyNumber"
                  value={formData.companyNumber}
                  onChange={(e) => setFormData({...formData, companyNumber: e.target.value})}
                  className="col-span-3"
                />
                {errors.companyNumber && <p className="col-span-4 text-right text-sm text-red-500">{errors.companyNumber}</p>}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  رقم الهاتف *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="col-span-3"
                />
                {errors.phone && <p className="col-span-4 text-right text-sm text-red-500">{errors.phone}</p>}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  العنوان
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="branch" className="text-right">
                  الفرع
                </Label>
                <Select 
                  value={formData.branch} 
                  onValueChange={(value) => setFormData({...formData, branch: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="اختر الفرع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-branch">بدون فرع محدد</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.name}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button 
                type="submit"
                onClick={handleAddSupplier}
              >
                حفظ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموردين</CardTitle>
            <FiUser className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-gray-500">+20% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">موردين نشطين</CardTitle>
            <FiUser className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-gray-500">+5% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">موردين جدد</CardTitle>
            <FiPlus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-500">هذا الشهر</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">فروع متاحة</CardTitle>
            <FiMapPin className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches.length}</div>
            <p className="text-xs text-gray-500">لتعيين الموردين</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="ابحث عن مورد..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1">
                {filteredSuppliers.length} من {suppliers.length} مورد
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="w-full">
          {filteredSuppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FiTruck className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">لا توجد موردين</h3>
              <p className="text-sm text-gray-500">
                {searchTerm ? 'لا توجد نتائج مطابقة للبحث' : 'لم يتم إضافة أي موردين بعد'}
              </p>
              {!searchTerm && (
                <Button 
                  className="mt-4"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <FiPlus className="mr-2" />
                  إضافة مورد جديد
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table className="min-w-full w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المورد</TableHead>
                  <TableHead>رقم الشركة</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>البريد</TableHead>
                  <TableHead>الفرع</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <FiUser className="h-4 w-4 text-blue-600" />
                        </div>
                        {supplier.name}
                      </div>
                    </TableCell>
                    <TableCell>{supplier.companyNumber || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FiPhone className="h-4 w-4 text-green-500" />
                        {supplier.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      {supplier.email ? (
                        <div className="flex items-center gap-2">
                          <FiMail className="h-4 w-4 text-blue-500" />
                          {supplier.email}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {supplier.branch ? (
                        <Badge variant="outline">{supplier.branch}</Badge>
                      ) : (
                        <Badge variant="secondary">غير محدد</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(supplier)}
                        >
                          <FiEdit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                              <AlertDialogDescription>
                                سيتم حذف المورد نهائياً ولا يمكن التراجع عن هذا الإجراء
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteSupplier(supplier)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المورد</DialogTitle>
            <DialogDescription>تحديث بيانات المورد المحدد</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                اسم المورد *
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="col-span-3"
              />
              {errors.name && <p className="col-span-4 text-right text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-companyNumber" className="text-right">
                رقم الشركة
              </Label>
              <Input
                id="edit-companyNumber"
                value={formData.companyNumber}
                onChange={(e) => setFormData({...formData, companyNumber: e.target.value})}
                className="col-span-3"
              />
              {errors.companyNumber && <p className="col-span-4 text-right text-sm text-red-500">{errors.companyNumber}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                رقم الهاتف *
              </Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="col-span-3"
              />
              {errors.phone && <p className="col-span-4 text-right text-sm text-red-500">{errors.phone}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                البريد الإلكتروني
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-address" className="text-right">
                العنوان
              </Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-branch" className="text-right">
                الفرع
              </Label>
              <Select 
                value={formData.branch} 
                onValueChange={(value) => setFormData({...formData, branch: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر الفرع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-branch">بدون فرع محدد</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.name}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              type="submit"
              onClick={handleEditSupplier}
            >
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Suppliers;