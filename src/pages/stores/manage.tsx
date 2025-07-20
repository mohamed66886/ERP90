import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, MapPin, Search, Eye, AlertCircle, CheckCircle } from 'lucide-react';
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
  where,
  getFirestore,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/useAuth';
import { TenantDatabase } from '@/lib/tenant-database';
import { useToast } from '@/hooks/use-toast';

interface Warehouse {
  id: string;
  name: string;
  branchId: string;
  branchName: string;
  description?: string;
  location?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Branch {
  id: string;
  name: string;
  location?: string;
  isActive: boolean;
}

const WarehouseManagement: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  
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
  }, [db, toast]);

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
        warehousesSnapshot.docs.map(async (warehouseDoc) => {
          const warehouseData = warehouseDoc.data();
          let branchName = 'غير محدد';
          
          if (warehouseData.branchId) {
            try {
              const branchDoc = await getDocs(
                query(
                  collection(db, 'branches'),
                  where('__name__', '==', warehouseData.branchId)
                )
              );
              if (!branchDoc.empty) {
                branchName = branchDoc.docs[0].data().name;
              }
            } catch (error) {
              console.error('Error fetching branch name:', error);
            }
          }
          
          return {
            id: warehouseDoc.id,
            ...warehouseData,
            branchName
          };
        })
      );
      
      setWarehouses(warehousesData as Warehouse[]);
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
  }, [db, toast]);

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

      if (editingWarehouse) {
        await updateDoc(doc(db, 'warehouses', editingWarehouse.id), warehouseData);
        toast({
          title: "تم بنجاح",
          description: "تم تحديث بيانات المخزن بنجاح",
          variant: "default"
        });
      } else {
        await addDoc(collection(db, 'warehouses'), {
          ...warehouseData,
          createdAt: serverTimestamp()
        });
        toast({
          title: "تم بنجاح",
          description: "تم إضافة المخزن بنجاح",
          variant: "default"
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
    setEditingWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      branchId: warehouse.branchId,
      description: warehouse.description || '',
      location: warehouse.location || '',
      isActive: warehouse.isActive
    });
    setShowAddForm(true);
  };

  const handleDelete = async (warehouseId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المخزن؟')) {
      try {
        await deleteDoc(doc(db, 'warehouses', warehouseId));
        toast({
          title: "تم بنجاح",
          description: "تم حذف المخزن بنجاح",
          variant: "default"
        });
        fetchWarehouses();
      } catch (error) {
        console.error('Error deleting warehouse:', error);
        toast({
          title: "خطأ",
          description: "فشل في حذف المخزن",
          variant: "destructive"
        });
      }
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
    setEditingWarehouse(null);
    setShowAddForm(false);
  };

  const filteredWarehouses = warehouses.filter(warehouse => {
    const matchesSearch = warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.branchName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch === '' || warehouse.branchId === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-custom-purple rounded-xl shadow-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة المخازن</h1>
              <p className="text-gray-600 mt-1">إدارة المخازن والفروع المختلفة</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث في المخازن..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-purple focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-purple focus:border-transparent"
            >
              <option value="">جميع الفروع</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-6 py-2 bg-custom-purple text-white rounded-lg hover:bg-custom-purple/90 transition-colors"
            >
              <Plus className="h-5 w-5" />
              إضافة مخزن
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingWarehouse ? 'تعديل المخزن' : 'إضافة مخزن جديد'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المخزن *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-purple focus:border-transparent"
                      placeholder="أدخل اسم المخزن"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الفرع *
                    </label>
                    <select
                      value={formData.branchId}
                      onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-purple focus:border-transparent"
                      required
                    >
                      <option value="">اختر الفرع</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الموقع
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-purple focus:border-transparent"
                      placeholder="أدخل موقع المخزن"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-custom-purple focus:ring-custom-purple border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="mr-3 text-sm font-medium text-gray-700">
                      مخزن نشط
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-purple focus:border-transparent"
                    placeholder="أدخل وصف المخزن"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-custom-purple text-white py-2 px-4 rounded-lg hover:bg-custom-purple/90 transition-colors"
                  >
                    {editingWarehouse ? 'حفظ التعديلات' : 'إضافة المخزن'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Warehouses List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">اسم المخزن</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">الفرع</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">الموقع</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredWarehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-custom-purple/10 flex items-center justify-center">
                            <Package className="h-5 w-5 text-custom-purple" />
                          </div>
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">{warehouse.name}</div>
                          {warehouse.description && (
                            <div className="text-sm text-gray-500">{warehouse.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 ml-1" />
                        <span className="text-sm text-gray-900">{warehouse.branchName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {warehouse.location || 'غير محدد'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        warehouse.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      )}>
                        {warehouse.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 ml-1" />
                            نشط
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 ml-1" />
                            غير نشط
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(warehouse)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="تعديل"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(warehouse.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredWarehouses.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مخازن</h3>
            <p className="text-gray-500">ابدأ بإضافة مخزن جديد</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseManagement;
