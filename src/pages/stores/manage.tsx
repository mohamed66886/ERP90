import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, MapPin, Search, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface Warehouse {
  id: string;
  name: string;
  branchId: string;
  branchName: string;
  description?: string;
  location?: string;
  isActive: boolean;
  createdAt: import('firebase/firestore').Timestamp | null;
  updatedAt: import('firebase/firestore').Timestamp | null;
}

interface Branch {
  id: string;
  name: string;
  location?: string;
  isActive: boolean;
}

const WarehouseManagement = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState<Warehouse | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    branchId: '',
    description: '',
    location: '',
    isActive: true
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBranches = React.useCallback(async () => {
    try {
      const branchesSnapshot = await getDocs(
        query(
          collection(db, 'branches'),
          orderBy('name', 'asc')
        )
      );
      const branchesData = branchesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Branch[];
      setBranches(branchesData);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الفروع",
        variant: "destructive"
      });
    }
  }, [toast]);

  const fetchWarehouses = React.useCallback(async () => {
    try {
      setLoading(true);
      const warehousesSnapshot = await getDocs(
        query(
          collection(db, 'warehouses'),
          orderBy('createdAt', 'desc')
        )
      );
      
      const warehousesData = await Promise.all(
        warehousesSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          let branchName = 'غير محدد';
          
          if (data.branchId) {
            const branchDoc = await getDocs(
              query(
                collection(db, 'branches'),
                where('__name__', '==', data.branchId)
              )
            );
            if (!branchDoc.empty) {
              branchName = branchDoc.docs[0].data().name;
            }
          }
          
          return {
            id: doc.id,
            ...data,
            branchName
          } as Warehouse;
        })
      );
      
      setWarehouses(warehousesData);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات المخازن",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBranches();
    fetchWarehouses();
  }, [fetchBranches, fetchWarehouses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال اسم المخزن",
        variant: "destructive"
      });
      return;
    }

    if (!formData.branchId) {
      toast({
        title: "خطأ",
        description: "يجب اختيار الفرع",
        variant: "destructive"
      });
      return;
    }

    try {
      const warehouseData = {
        ...formData,
        updatedAt: serverTimestamp()
      };

      if (currentWarehouse) {
        await updateDoc(doc(db, 'warehouses', currentWarehouse.id), warehouseData);
        toast({
          title: "تم التحديث",
          description: "تم تحديث بيانات المخزن بنجاح",
        });
      } else {
        await addDoc(collection(db, 'warehouses'), {
          ...warehouseData,
          createdAt: serverTimestamp()
        });
        toast({
          title: "تم الإضافة",
          description: "تم إضافة المخزن بنجاح",
        });
      }

      resetForm();
      fetchWarehouses();
    } catch (error) {
      console.error('Error saving warehouse:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ بيانات المخزن",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (warehouse: Warehouse) => {
    setCurrentWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      branchId: warehouse.branchId,
      description: warehouse.description || '',
      location: warehouse.location || '',
      isActive: warehouse.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!currentWarehouse) return;
    
    try {
      await deleteDoc(doc(db, 'warehouses', currentWarehouse.id));
      toast({
        title: "تم الحذف",
        description: "تم حذف المخزن بنجاح",
      });
      fetchWarehouses();
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المخزن",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCurrentWarehouse(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      branchId: '',
      description: '',
      location: '',
      isActive: true
    });
    setCurrentWarehouse(null);
    setIsDialogOpen(false);
  };

  const filteredWarehouses = warehouses.filter(warehouse => {
    const matchesSearch = warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.branchName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch === 'all' || warehouse.branchId === selectedBranch;
    return matchesSearch && matchesBranch;
  });

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
    <div className="p-2 sm:p-6 w-full max-w-none space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المخازن</h1>
          <p className="text-gray-600">إدارة وتنظيم المخازن والفروع</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          إضافة مخزن
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المخازن</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warehouses.length}</div>
            <p className="text-xs text-gray-500">+12% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">مخازن نشطة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warehouses.filter(w => w.isActive).length}</div>
            <p className="text-xs text-gray-500">+8% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">مخازن غير نشطة</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warehouses.filter(w => !w.isActive).length}</div>
            <p className="text-xs text-gray-500">-4% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">عدد الفروع</CardTitle>
            <MapPin className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches.length}</div>
            <p className="text-xs text-gray-500">لتعيين المخازن</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="ابحث عن مخزن..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-64">
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الفروع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفروع</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="w-full">
          {filteredWarehouses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">لا توجد مخازن</h3>
              <p className="text-sm text-gray-500">
                {searchTerm || selectedBranch ? 'لا توجد نتائج مطابقة للبحث' : 'لم يتم إضافة أي مخازن بعد'}
              </p>
              {!searchTerm && selectedBranch === 'all' && (
                <Button 
                  className="mt-4"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  إضافة مخزن جديد
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table className="min-w-full w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المخزن</TableHead>
                  <TableHead>الفرع</TableHead>
                  <TableHead>الموقع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWarehouses.map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Package className="h-4 w-4 text-blue-600" />
                        </div>
                        {warehouse.name}
                      </div>
                    </TableCell>
                    <TableCell>{warehouse.branchName}</TableCell>
                    <TableCell>{warehouse.location || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={warehouse.isActive ? "default" : "destructive"}>
                        {warehouse.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            نشط
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            غير نشط
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(warehouse)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setCurrentWarehouse(warehouse);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentWarehouse ? 'تعديل المخزن' : 'إضافة مخزن جديد'}</DialogTitle>
            <DialogDescription>
              {currentWarehouse ? 'تحديث بيانات المخزن المحدد' : 'أدخل بيانات المخزن الجديد'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                اسم المخزن *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="branch" className="text-right">
                الفرع *
              </Label>
              <Select 
                value={formData.branchId} 
                onValueChange={(value) => setFormData({...formData, branchId: value})}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر الفرع" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                الموقع
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                الوصف
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                الحالة
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="h-4 w-4 text-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium leading-none">
                  مخزن نشط
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {currentWarehouse ? 'حفظ التغييرات' : 'إضافة المخزن'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المخزن "{currentWarehouse?.name}" نهائياً ولا يمكن التراجع عن هذا الإجراء
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WarehouseManagement;