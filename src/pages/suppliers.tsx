import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc,  query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiPlus, FiEdit, FiTrash2, FiUser, FiPhone, FiMapPin, FiCreditCard, FiSearch, FiTruck } from 'react-icons/fi';
import { toast } from '@/hooks/use-toast';

// Types
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
  // States
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
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
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    companyNumber: '',
    phone: '',
    address: '',
    email: '',
    branch: 'no-branch'
  });

  // Fetch suppliers from Firebase
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const suppliersSnapshot = await getDocs(collection(db, 'suppliers'));
      const suppliersData: Supplier[] = suppliersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Supplier[];
      setSuppliers(suppliersData);
      setFilteredSuppliers(suppliersData);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "خطأ في التحميل",
        description: "حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch branches from Firebase
  const fetchBranches = async () => {
    try {
      const branchesSnapshot = await getDocs(collection(db, 'branches'));
      const branchesData: Branch[] = branchesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Branch[];
      setBranches(branchesData);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  // Search functionality
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredSuppliers(suppliers);
    } else {
      const filtered = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(term.toLowerCase()) ||
        supplier.phone.includes(term) ||
        (supplier.companyNumber && supplier.companyNumber.includes(term)) ||
        (supplier.email && supplier.email.toLowerCase().includes(term.toLowerCase()))
      );
      setFilteredSuppliers(filtered);
    }
  };

  // Validation functions
  const validateUniqueness = async (field: string, value: string, excludeId?: string) => {
    if (!value.trim()) return true;
    
    const existingSupplier = suppliers.find(supplier => 
      supplier[field as keyof Supplier] === value && supplier.id !== excludeId
    );
    
    return !existingSupplier;
  };

  const validateForm = async (isEdit = false) => {
    const newErrors = { name: '', phone: '', companyNumber: '' };
    let isValid = true;

    // Check required fields
    if (!formData.name.trim()) {
      newErrors.name = 'اسم المورد مطلوب';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
      isValid = false;
    }

    // Check phone format (simple validation)
    if (formData.phone.trim() && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
      isValid = false;
    }

    // Check email format if provided
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.companyNumber = 'البريد الإلكتروني غير صحيح';
      isValid = false;
    }

    // Check uniqueness
    const excludeId = isEdit ? selectedSupplier?.id : undefined;

    if (formData.name.trim()) {
      const isNameUnique = await validateUniqueness('name', formData.name, excludeId);
      if (!isNameUnique) {
        newErrors.name = 'هذا الاسم موجود مسبقاً';
        isValid = false;
      }
    }

    if (formData.phone.trim()) {
      const isPhoneUnique = await validateUniqueness('phone', formData.phone, excludeId);
      if (!isPhoneUnique) {
        newErrors.phone = 'رقم الهاتف موجود مسبقاً';
        isValid = false;
      }
    }

    if (formData.companyNumber.trim()) {
      const isCompanyNumberUnique = await validateUniqueness('companyNumber', formData.companyNumber, excludeId);
      if (!isCompanyNumberUnique) {
        newErrors.companyNumber = 'رقم الشركة موجود مسبقاً';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  useEffect(() => {
    fetchSuppliers();
    fetchBranches();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSuppliers(suppliers);
    } else {
      const filtered = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.phone.includes(searchTerm) ||
        (supplier.companyNumber && supplier.companyNumber.includes(searchTerm)) ||
        (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredSuppliers(filtered);
    }
  }, [suppliers, searchTerm]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      companyNumber: '',
      phone: '',
      address: '',
      email: '',
      branch: 'no-branch'
    });
    setErrors({ name: '', phone: '', companyNumber: '' });
  };

  // Handle add supplier
  const handleAddSupplier = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      const supplierData = {
        ...formData,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        companyNumber: formData.companyNumber.trim(),
        address: formData.address.trim(),
        email: formData.email.trim(),
        branch: formData.branch === 'no-branch' ? '' : formData.branch.trim(),
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'suppliers'), supplierData);
      
      toast({
        title: "✅ تم الحفظ بنجاح",
        description: "تم إضافة المورد بنجاح",
      });
      
      setIsAddDialogOpen(false);
      resetForm();
      fetchSuppliers();
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast({
        title: "❌ خطأ في الإضافة",
        description: "حدث خطأ أثناء إضافة المورد. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  // Handle edit supplier
  const handleEditSupplier = async () => {
    const isValid = await validateForm(true);
    if (!isValid || !selectedSupplier) return;

    try {
      const updateData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        companyNumber: formData.companyNumber.trim(),
        address: formData.address.trim(),
        email: formData.email.trim(),
        branch: formData.branch === 'no-branch' ? '' : formData.branch.trim()
      };

      await updateDoc(doc(db, 'suppliers', selectedSupplier.id), updateData);
      
      toast({
        title: "✅ تم التحديث بنجاح",
        description: "تم تحديث بيانات المورد بنجاح",
      });
      
      setIsEditDialogOpen(false);
      setSelectedSupplier(null);
      resetForm();
      fetchSuppliers();
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast({
        title: "❌ خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث المورد. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  // Handle delete supplier
  const handleDeleteSupplier = async (supplier: Supplier) => {
    try {
      await deleteDoc(doc(db, 'suppliers', supplier.id));
      
      toast({
        title: "✅ تم الحذف بنجاح",
        description: "تم حذف المورد بنجاح",
      });
      
      fetchSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast({
        title: "❌ خطأ في الحذف",
        description: "حدث خطأ أثناء حذف المورد. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      companyNumber: supplier.companyNumber,
      phone: supplier.phone,
      address: supplier.address,
      email: supplier.email || '',
      branch: supplier.branch || 'no-branch'
    });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-200 ring-1 ring-blue-200/50 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center animate-pulse shadow-lg">
              <FiTruck className="w-8 h-8 text-white" />
            </div>
            <div className="text-xl font-semibold text-gray-700">جاري تحميل البيانات...</div>
            <div className="w-32 h-2 bg-blue-200 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-2xl ring-1 ring-blue-200/50 backdrop-blur-sm border border-blue-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-blue-400/30">
              <FiTruck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">إدارة الموردين</h1>
              <p className="text-blue-600 mt-1">إضافة وإدارة بيانات الموردين</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{suppliers.length}</div>
              <div className="text-sm text-blue-600">إجمالي الموردين</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{filteredSuppliers.length}</div>
              <div className="text-sm text-green-600">النتائج الظاهرة</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <Card className="border-none shadow-xl ring-1 ring-blue-200/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
              <Input
                placeholder="البحث عن مورد (الاسم، الهاتف، رقم الشركة، البريد)"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 border-blue-200 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/50"
              />
            </div>

            {/* Add Button */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg ring-2 ring-blue-400/30">
                  <FiPlus className="w-4 h-4 ml-2" />
                  إضافة مورد جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white shadow-2xl border border-blue-100 rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-right text-xl font-bold text-blue-900">إضافة مورد جديد</DialogTitle>
                  <DialogDescription className="text-right text-blue-600">
                    أدخل بيانات المورد الجديد
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name" className="text-blue-800">اسم المورد *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="أدخل اسم المورد"
                      className={`mt-1 ${errors.name ? 'border-red-500' : 'border-blue-200'}`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="companyNumber" className="text-blue-800">رقم الشركة / السجل التجاري</Label>
                    <Input
                      id="companyNumber"
                      value={formData.companyNumber}
                      onChange={(e) => setFormData({ ...formData, companyNumber: e.target.value })}
                      placeholder="أدخل رقم الشركة"
                      className={`mt-1 ${errors.companyNumber ? 'border-red-500' : 'border-blue-200'}`}
                    />
                    {errors.companyNumber && <p className="text-red-500 text-sm mt-1">{errors.companyNumber}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-blue-800">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="أدخل رقم الهاتف"
                      className={`mt-1 ${errors.phone ? 'border-red-500' : 'border-blue-200'}`}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-blue-800">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="أدخل البريد الإلكتروني"
                      className="mt-1 border-blue-200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-blue-800">العنوان</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="أدخل العنوان"
                      className="mt-1 border-blue-200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="branch" className="text-blue-800">الفرع</Label>
                    <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
                      <SelectTrigger className="mt-1 border-blue-200">
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
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      resetForm();
                    }}
                    variant="outline"
                    className="ml-2"
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleAddSupplier}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    حفظ
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers List */}
      <Card className="border-none shadow-xl ring-1 ring-blue-200/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl">
          <CardTitle className="text-white flex items-center">
            <FiTruck className="ml-2" />
            قائمة الموردين
          </CardTitle>
          <CardDescription className="text-blue-100">
            جميع الموردين المسجلين في النظام
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredSuppliers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTruck className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد موردين</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'لم يتم العثور على موردين مطابقين لبحثك' : 'لم يتم إضافة أي موردين بعد'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <FiPlus className="w-4 h-4 ml-2" />
                  إضافة أول مورد
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-50 border-b border-blue-200">
                    <th className="text-right p-4 font-semibold text-blue-800">اسم المورد</th>
                    <th className="text-right p-4 font-semibold text-blue-800">رقم الشركة</th>
                    <th className="text-right p-4 font-semibold text-blue-800">الهاتف</th>
                    <th className="text-right p-4 font-semibold text-blue-800">البريد الإلكتروني</th>
                    <th className="text-right p-4 font-semibold text-blue-800">العنوان</th>
                    <th className="text-right p-4 font-semibold text-blue-800">الفرع</th>
                    <th className="text-center p-4 font-semibold text-blue-800">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier, index) => (
                    <tr
                      key={supplier.id}
                      className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-md">
                            <FiTruck className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{supplier.name}</div>
                            <div className="text-sm text-blue-600">
                              مضاف في: {new Date(supplier.createdAt || '').toLocaleDateString('ar-EG')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-700">{supplier.companyNumber || '-'}</td>
                      <td className="p-4">
                        <div className="flex items-center text-gray-700">
                          <FiPhone className="w-4 h-4 ml-2 text-green-600" />
                          {supplier.phone}
                        </div>
                      </td>
                      <td className="p-4 text-gray-700">{supplier.email || '-'}</td>
                      <td className="p-4">
                        <div className="flex items-center text-gray-700">
                          <FiMapPin className="w-4 h-4 ml-2 text-red-500" />
                          <span className="truncate max-w-xs">{supplier.address || '-'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-gray-700">
                          <FiMapPin className="w-4 h-4 ml-2 text-blue-500" />
                          <span className="truncate max-w-xs">{supplier.branch || 'غير محدد'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => openEditDialog(supplier)}
                            size="sm"
                            variant="outline"
                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                          >
                            <FiEdit className="w-4 h-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
                                <AlertDialogDescription className="text-right">
                                  هل أنت متأكد من حذف المورد "{supplier.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-white shadow-2xl border border-blue-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-right text-xl font-bold text-blue-900">تعديل بيانات المورد</DialogTitle>
            <DialogDescription className="text-right text-blue-600">
              تحديث بيانات المورد
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name" className="text-blue-800">اسم المورد *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أدخل اسم المورد"
                className={`mt-1 ${errors.name ? 'border-red-500' : 'border-blue-200'}`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="edit-companyNumber" className="text-blue-800">رقم الشركة / السجل التجاري</Label>
              <Input
                id="edit-companyNumber"
                value={formData.companyNumber}
                onChange={(e) => setFormData({ ...formData, companyNumber: e.target.value })}
                placeholder="أدخل رقم الشركة"
                className={`mt-1 ${errors.companyNumber ? 'border-red-500' : 'border-blue-200'}`}
              />
              {errors.companyNumber && <p className="text-red-500 text-sm mt-1">{errors.companyNumber}</p>}
            </div>

            <div>
              <Label htmlFor="edit-phone" className="text-blue-800">رقم الهاتف *</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="أدخل رقم الهاتف"
                className={`mt-1 ${errors.phone ? 'border-red-500' : 'border-blue-200'}`}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="edit-email" className="text-blue-800">البريد الإلكتروني</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="أدخل البريد الإلكتروني"
                className="mt-1 border-blue-200"
              />
            </div>

            <div>
              <Label htmlFor="edit-address" className="text-blue-800">العنوان</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="أدخل العنوان"
                className="mt-1 border-blue-200"
              />
            </div>

            <div>
              <Label htmlFor="edit-branch" className="text-blue-800">الفرع</Label>
              <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
                <SelectTrigger className="mt-1 border-blue-200">
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
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedSupplier(null);
                resetForm();
              }}
              variant="outline"
              className="ml-2"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleEditSupplier}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
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
