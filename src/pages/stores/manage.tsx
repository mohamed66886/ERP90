import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, MapPin, Search, CheckCircle, XCircle, ChevronDown, Loader2 } from 'lucide-react';
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
import Breadcrumb from "../../components/Breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

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

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0 }
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  exit: { y: 20, opacity: 0 }
};

const WarehouseManagement = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState<Warehouse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
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
      <motion.div 
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeIn}
        className="p-6 space-y-4"
      >
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
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeIn}
      className="p-2 sm:p-6 w-full max-w-none space-y-6"
    >
            <div className="p-4 font-['Tajawal'] bg-white rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] animate-[bounce_2s_infinite] relative overflow-hidden border-r-8 border-blue-500">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-blue-800">ادارة المخازن</h1>

          {/* إيموجي متحركة باي باي */}
          <span className="animate-[wave_2s_infinite] text-3xl mr-3">👋</span>
        </div>
        {/* تأثيرات إضافية */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500 animate-[pulse_3s_infinite]"></div>
      </div>

<style jsx global>{`
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }
  
  @keyframes wave {
    0%, 100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(20deg);
    }
    75% {
      transform: rotate(-20deg);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`}</style>
            {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "المخازن" }

        ]}
      />
      {/* Header */}
      <motion.div 
        variants={slideUp}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full"
      >
        <div>
          <p className="text-gray-600 dark:text-gray-400">إدارة وتنظيم المخازن والفروع</p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="shadow-md hover:shadow-lg transition-shadow"
        >
          <Plus className="mr-2 h-4 w-4" />
          إضافة مخزن
        </Button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={slideUp}>
        <Card className="w-full border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ابحث عن مخزن..."
                  className="pl-10 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-64">
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="جميع الفروع" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-200 dark:border-gray-700">
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
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <Package className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">لا توجد مخازن</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
              </motion.div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table className="min-w-full w-full">
                  <TableHeader className="bg-gray-50 dark:bg-gray-800">
            <TableRow className="bg-gradient-to-r from-blue-100 via-purple-100 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
              <TableHead className="text-center text-base font-bold text-blue-900 dark:text-blue-200 py-4">اسم المخزن</TableHead>
              <TableHead className="text-center text-base font-bold text-blue-900 dark:text-blue-200 py-4">الفرع</TableHead>
              <TableHead className="text-center text-base font-bold text-blue-900 dark:text-blue-200 py-4">الموقع</TableHead>
              <TableHead className="text-center text-base font-bold text-blue-900 dark:text-blue-200 py-4">الحالة</TableHead>
              <TableHead className="text-center text-base font-bold text-blue-900 dark:text-blue-200 py-4">الإجراءات</TableHead>
            </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredWarehouses.map((warehouse) => (
                        <motion.tr
                          key={warehouse.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              {warehouse.name}
                            </div>
                          </TableCell>
                          <TableCell>{warehouse.branchName}</TableCell>
                          <TableCell>
                            {warehouse.location ? (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                {warehouse.location}
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={warehouse.isActive ? "default" : "destructive"}
                              className="flex items-center gap-1"
                            >
                              {warehouse.isActive ? (
                                <>
                                  <CheckCircle className="h-3 w-3" />
                                  نشط
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3" />
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
                                className="hover:bg-gray-100 dark:hover:bg-gray-700"
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
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">
                {currentWarehouse ? 'تعديل المخزن' : 'إضافة مخزن جديد'}
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                {currentWarehouse ? 'تحديث بيانات المخزن المحدد' : 'أدخل بيانات المخزن الجديد'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-gray-700 dark:text-gray-300">
                  اسم المخزن *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="col-span-3 border-gray-300 dark:border-gray-600"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="branch" className="text-right text-gray-700 dark:text-gray-300">
                  الفرع *
                </Label>
                <Select 
                  value={formData.branchId} 
                  onValueChange={(value) => setFormData({...formData, branchId: value})}
                  required
                >
                  <SelectTrigger className="col-span-3 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="اختر الفرع" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-200 dark:border-gray-700">
                    {branches.map((branch) => (
                      <SelectItem 
                        key={branch.id} 
                        value={branch.id}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right text-gray-700 dark:text-gray-300">
                  الموقع
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="col-span-3 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right text-gray-700 dark:text-gray-300">
                  الوصف
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="col-span-3 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right text-gray-700 dark:text-gray-300">
                  الحالة
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
                    مخزن نشط
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {currentWarehouse ? 'حفظ التغييرات' : 'إضافة المخزن'}
                </Button>
              </DialogFooter>
            </form>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900 dark:text-white">
                هل أنت متأكد؟
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                سيتم حذف المخزن "{currentWarehouse?.name}" نهائياً ولا يمكن التراجع عن هذا الإجراء
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-300 dark:border-gray-600">
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default WarehouseManagement;