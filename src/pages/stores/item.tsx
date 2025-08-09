import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useDropzone } from 'react-dropzone';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trash2, Edit2, Save, X, ChevronDown, ChevronRight, Search, Plus, Upload, Download, Expand, Minus } from 'lucide-react';
import { Loader2, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// تعريف الأنواع
interface Supplier {
  id: string;
  name: string;
}

interface Item {
  id: number;
  name: string;
  type: 'رئيسي' | 'مستوى أول' | 'مستوى ثاني';
  parentId?: number;
}

interface ItemExtended extends Item {
  itemCode?: string;
  purchasePrice?: number;
  salePrice?: number;
  minOrder?: number;
  discount?: number;
  allowNegative?: boolean;
  isVatIncluded?: boolean;
  tempCodes?: boolean;
  supplier?: string;
  docId?: string;
}

const ItemManagementPage: React.FC = () => {
  // الحالات الأساسية
  const [items, setItems] = useState<ItemExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemExtended | null>(null);
  const [activeTab, setActiveTab] = useState<'tree' | 'list'>('tree');
  const [taxRate, setTaxRate] = useState<number>(0);
  
  // حالات النموذج
  const [formData, setFormData] = useState<Omit<ItemExtended, 'docId'>>({
    id: 0,
    name: '',
    type: 'رئيسي',
    parentId: undefined,
    itemCode: '',
    purchasePrice: 0,
    salePrice: 0,
    minOrder: 0,
    discount: 0,
    allowNegative: false,
    isVatIncluded: false,
    tempCodes: false,
    supplier: ''
  });

  // جلب الموردين
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'suppliers'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
        setSuppliers(data);
      } catch (e) {
        console.error('Error fetching suppliers:', e);
      }
    };
    fetchSuppliers();
  }, []);

  // جلب الأصناف
  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'inventory_items'), orderBy('id', 'asc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id } as ItemExtended));
      
      setItems(data);
      // تعيين آخر ID + 1 كقيمة افتراضية
      const maxId = data.length > 0 ? Math.max(...data.map(i => i.id)) : 0;
      setFormData(prev => ({ ...prev, id: maxId + 1 }));
    } catch (e) {
      setError('حدث خطأ أثناء جلب البيانات');
      console.error('Fetch error:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // التحكم في توسيع/طي العناصر
  const toggleExpand = (itemId: number) => {
    setExpandedItems(prev =>
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };

  const expandAll = () => {
    const allIds = items.map(item => item.id);
    setExpandedItems(allIds);
  };

  const collapseAll = () => {
    setExpandedItems([]);
  };

  const isExpanded = (itemId: number) => expandedItems.includes(itemId);

  // معالجة تغيير النموذج
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : name === 'parentId'
            ? value === '' ? undefined : Number(value)
            : type === 'number'
              ? Number(value)
              : value
    }));
    // إذا تغير النوع، مسح parentId
    if (name === 'type') {
      setFormData(prev => ({ ...prev, parentId: undefined }));
    }
  };

  // إضافة صنف جديد
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // التحقق من عدم وجود ID مكرر
      if (items.some(item => item.id === formData.id)) {
        setError('رقم الصنف مستخدم بالفعل. اختر رقم آخر.');
        setLoading(false);
        return;
      }
      
      // إنشاء كائن الصنف الجديد
      const newItem: Omit<ItemExtended, 'docId'> = {
        id: formData.id,
        name: formData.name,
        type: formData.type
      };
      
      // إضافة parentId إذا كان موجودًا
      if (formData.type !== 'رئيسي' && formData.parentId !== undefined) {
        newItem.parentId = formData.parentId;
      }
      // إضافة الحقول الإضافية للمستوى الثالث
      if (formData.type === 'مستوى ثاني') {
        Object.assign(newItem, {
          itemCode: formData.itemCode,
          purchasePrice: formData.purchasePrice,
          salePrice: formData.salePrice,
          minOrder: formData.minOrder,
          discount: formData.discount,
          allowNegative: formData.allowNegative,
          isVatIncluded: formData.isVatIncluded,
          tempCodes: formData.tempCodes,
          supplier: formData.supplier
        });
      }
      
      // إضافة إلى Firestore
      await addDoc(collection(db, 'inventory_items'), newItem);
      
      // إعادة تعيين النموذج
      setFormData({
        id: formData.id + 1, // زيادة ID تلقائيًا
        name: '',
        type: 'رئيسي',
        parentId: undefined,
        itemCode: '',
        purchasePrice: 0,
        salePrice: 0,
        minOrder: 0,
        discount: 0,
        allowNegative: false,
        isVatIncluded: false,
        tempCodes: false,
        supplier: ''
      });
      
      // تحديث القائمة
      await fetchItems();
    } catch (e) {
      console.error('Add error:', e);
      setError('حدث خطأ أثناء الإضافة. تحقق من الاتصال أو الصلاحيات.');
    }
    setLoading(false);
  };

  // حذف صنف
  const handleDelete = async (docId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الصنف؟ سيتم حذف جميع الأصناف الفرعية أيضًا.')) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'inventory_items', docId));
      await fetchItems();
      setSelectedItem(null);
    } catch (e) {
      setError('حدث خطأ أثناء الحذف');
      console.error('Delete error:', e);
    }
    setLoading(false);
  };

  // بدء التعديل
  const startEdit = (item: ItemExtended) => {
    setSelectedItem(item);
  };

  // حفظ التعديل
  const handleEditSave = async (updatedItem: ItemExtended) => {
    if (!updatedItem.docId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updateData: Partial<ItemExtended> = {
        name: updatedItem.name,
        type: updatedItem.type,
        parentId: updatedItem.type !== 'رئيسي' ? updatedItem.parentId : undefined,
        itemCode: updatedItem.itemCode,
        purchasePrice: updatedItem.purchasePrice,
        salePrice: updatedItem.salePrice,
        minOrder: updatedItem.minOrder,
        discount: updatedItem.discount,
        allowNegative: updatedItem.allowNegative,
        isVatIncluded: updatedItem.isVatIncluded,
        tempCodes: updatedItem.tempCodes,
        supplier: updatedItem.supplier
      };
      
      await updateDoc(doc(db, 'inventory_items', updatedItem.docId), updateData);
      await fetchItems();
      setSelectedItem(null);
    } catch (e) {
      console.error('Update error:', e);
      setError('حدث خطأ أثناء التعديل');
    }
    setLoading(false);
  };

  // البحث وتوسيع العناصر ذات الصلة
  useEffect(() => {
    if (searchTerm.trim() === '') {
      return;
    }
    
    const matched = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toString().includes(searchTerm)
    );
    
    const relatedIds = new Set<number>();
    
    const collectParents = (item: ItemExtended) => {
      if (item.parentId !== undefined) {
        relatedIds.add(item.parentId);
        const parent = items.find(i => i.id === item.parentId);
        if (parent) collectParents(parent);
      }
    };
    
    const collectChildren = (item: ItemExtended) => {
      const children = items.filter(i => i.parentId === item.id);
      for (const child of children) {
        relatedIds.add(child.id);
        collectChildren(child);
      }
    };
    
    matched.forEach(item => {
      relatedIds.add(item.id);
      collectParents(item);
      collectChildren(item);
    });
    
    setExpandedItems(Array.from(relatedIds));
  }, [searchTerm, items]);

  // تصفية العناصر للعرض
  const filteredItems = React.useMemo(() => {
    if (searchTerm.trim() === '') return items;

    const matched = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toString().includes(searchTerm)
    );

    const relatedIds = new Set<number>();

    const collectParents = (item: ItemExtended) => {
      if (item.parentId !== undefined) {
        relatedIds.add(item.parentId);
        const parent = items.find(i => i.id === item.parentId);
        if (parent) collectParents(parent);
      }
    };

    const collectChildren = (item: ItemExtended) => {
      const children = items.filter(i => i.parentId === item.id);
      for (const child of children) {
        relatedIds.add(child.id);
        collectChildren(child);
      }
    };

    matched.forEach(item => {
      relatedIds.add(item.id);
      collectParents(item);
      collectChildren(item);
    });

    // أضف كل الجذور (parentId === undefined) حتى لو لم تكن مطابقة للبحث
    items.forEach(item => {
      if (item.parentId === undefined) {
        relatedIds.add(item.id);
      }
    });

    return items.filter(item => relatedIds.has(item.id));
  }, [searchTerm, items]);

  // عرض العنصر في الشجرة
  const renderTreeItem = (item: ItemExtended, level = 0) => {
    const children: ItemExtended[] = filteredItems.filter(i => i.parentId === item.id);
    const hasChildren = children.length > 0;
    const expanded = isExpanded(item.id);
    const isSelected = selectedItem?.id === item.id;

    return (
      <motion.div 
        key={item.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-2"
      >
        <div className="flex items-start gap-2 group">
          {/* زر التوسيع/الطي */}
          {hasChildren && (
            <motion.button
              onClick={() => toggleExpand(item.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="mt-1 text-gray-500 hover:text-[#1a365d] focus:outline-none"
            >
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </motion.button>
          )}
          {!hasChildren && <div className="w-4"></div>}

          {/* بطاقة العنصر */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className={`flex-1 p-3 rounded-lg border transition-all cursor-pointer ${
              level === 0 ? 'bg-blue-50 border-blue-200' : 
              level === 1 ? 'bg-purple-50 border-purple-200' : 
              'bg-gray-50 border-gray-200'
            } ${
              isSelected ? 'ring-2 ring-[#1a365d]' : ''
            }`}
            onClick={() => setSelectedItem(item)}
          >
            <ItemView 
              item={item}
              level={level}
              hasChildren={hasChildren}
              expanded={expanded}
              onToggleExpand={() => toggleExpand(item.id)}
              onDelete={() => handleDelete(item.docId!)}
              suppliers={suppliers}
              items={items}
            />
          </motion.div>
        </div>

        {/* العناصر الفرعية */}
        <AnimatePresence>
          {hasChildren && expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-8 pl-2 border-l-2 border-gray-200"
            >
              {children.map((child) => renderTreeItem(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // عرض الشجرة
  const renderTree = () => {
    const rootItems = filteredItems.filter(item => item.parentId === undefined);
    return rootItems.map((item) => renderTreeItem(item));
  };

  // عرض القائمة المسطحة
  const renderList = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الرقم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التابع لـ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سعر البيع</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.type === 'رئيسي' ? 'bg-blue-100 text-blue-800' :
                    item.type === 'مستوى أول' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.parentId ? items.find(i => i.id === item.parentId)?.name || item.parentId : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.salePrice ? `${item.salePrice.toFixed(2)} ر.س` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => startEdit(item)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.docId!)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* شريط العنوان */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              إدارة الأصناف والمخزون
            </h1>
            <p className="text-gray-600 mt-1">نظام متكامل لإدارة شجرة الأصناف وتفاصيلها المالية</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={expandAll}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
            >
              <Expand className="w-4 h-4" />
              <span className="hidden sm:inline">توسيع الكل</span>
            </button>
            
            <button
              onClick={collapseAll}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
            >
              <Minus className="w-4 h-4" />
              <span className="hidden sm:inline">طي الكل</span>
            </button>
            
            <button
              onClick={fetchItems} 
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
            >
              <RefreshCcw className="w-4 h-4" />
              <span className="hidden sm:inline">تحديث</span>
            </button>
          </div>
        </div>

        {/* بطاقة المحتوى الرئيسية */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* تبويبات العرض */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('tree')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'tree' 
                    ? 'border-indigo-500 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                عرض الشجرة
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'list' 
                    ? 'border-indigo-500 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                القائمة المسطحة
              </button>
            </nav>
          </div>

          {/* محتوى التبويبات */}
          <div className="p-6">
            {/* شريط البحث والأدوات */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="ابحث بالأسم أو الرقم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <ExcelImportExport 
                  items={items} 
                  onImportSuccess={fetchItems}
                  suppliers={suppliers}
                />
              </div>
            </div>

            {/* محتوى التبويب المحدد */}
            {loading ? (
              <div className="flex items-center justify-center gap-3 text-gray-500 p-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>جاري تحميل الأصناف...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTab === 'tree' ? (
                  <div className="overflow-y-auto max-h-[500px] pr-2">
                    {filteredItems.length === 0 ? (
                      <div className="text-center text-gray-400 p-8">
                        {searchTerm ? 'لا توجد أصناف مطابقة للبحث' : 'لا توجد أصناف مسجلة'}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {renderTree()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-[500px]">
                    {filteredItems.length === 0 ? (
                      <div className="text-center text-gray-400 p-8">
                        {searchTerm ? 'لا توجد أصناف مطابقة للبحث' : 'لا توجد أصناف مسجلة'}
                      </div>
                    ) : (
                      renderList()
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* الشبكة السفلية للنماذج */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* نموذج الإضافة */}
          <div className="lg:col-span-1">
            <AddItemForm 
              formData={formData}
              items={items}
              suppliers={suppliers}
              onChange={handleFormChange}
              onSubmit={handleAdd}
              error={error}
              loading={loading}
            />
          </div>

          {/* تفاصيل الصنف المحدد */}
          <div className="lg:col-span-2">
            {selectedItem ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold text-xl text-gray-800">
                      تفاصيل الصنف المحدد
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(selectedItem)}
                        className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(selectedItem.docId!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <EditItemForm 
                    item={selectedItem}
                    items={items}
                    suppliers={suppliers}
                    onSave={handleEditSave}
                    onCancel={() => setSelectedItem(null)}
                    loading={loading}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 text-center text-gray-400">
                <p>اختر صنفاً من القائمة لعرض التفاصيل</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// مكون استيراد/تصدير Excel
const ExcelImportExport: React.FC<{
  items: ItemExtended[];
  onImportSuccess: () => void;
  suppliers: Supplier[];
}> = ({ items, onImportSuccess, suppliers }) => {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const [importing, setImporting] = useState(false);

  // دالة رفع الأصناف إلى قاعدة البيانات
  const handleImportToDB = async () => {
    setError(null);
    setSuccess(null);
    setImporting(true);
    try {
      // جلب الأصناف الحالية من القاعدة لمنع التكرار
      const snapshot = await getDocs(collection(db, 'inventory_items'));
      const existingIds = new Set(snapshot.docs.map(doc => doc.data().id));
      // الأصناف الجديدة فقط
      const newItems = previewData.filter(row => row.id && !existingIds.has(row.id));
      if (newItems.length === 0) {
        setError('كل الأصناف موجودة بالفعل في قاعدة البيانات.');
        setImporting(false);
        return;
      }
      // إضافة الأصناف
      for (const item of newItems) {
        await addDoc(collection(db, 'inventory_items'), item);
      }
      setSuccess(`تم استيراد ${newItems.length} صنف بنجاح!`);
      onImportSuccess();
    } catch (e) {
      setError('حدث خطأ أثناء الاستيراد.');
    }
    setImporting(false);
  };

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    setError(null);
    setDownloadUrl(null);
    setPreviewData([]);
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const json = XLSX.utils.sheet_to_json(ws, { defval: '' });

        // دوال مساعدة
        const normalize = (str: string) =>
          str.replace(/[^\x7f-\uffff\w\s]/g, '').toLowerCase();
        const getVal = (row: Record<string, unknown>, keys: string[], fuzzy?: boolean) => {
          for (const k of keys) {
            const normK = normalize(k);
            const found = Object.keys(row).find(col => normalize(col) === normK);
            if (found && row[found] !== undefined) return row[found];
          }
          if (fuzzy && keys.length > 0) {
            for (const k of keys) {
              const normK = normalize(k);
              const found = Object.keys(row).find(col => normalize(col).includes(normK));
              if (found && row[found] !== undefined) return row[found];
            }
          }
          return '';
        };

        // تعريف نوع للصف القادم من XLSX
        type ExcelRow = Record<string, unknown>;
        interface PreviewItem {
          id: number;
          name: string;
          type: 'رئيسي' | 'مستوى أول' | 'مستوى ثاني';
          parentId?: number;
          salePrice?: number;
          itemCode?: string;
        }

        let idCounter = 1;
        const mainLevels: Record<string, number> = {};
        const firstLevels: Record<string, number> = {};
        const secondLevels: Record<string, number> = {};
        const itemsArr: PreviewItem[] = [];

        for (const rowRaw of json) {
          const row = rowRaw as ExcelRow;
          // استخراج القيم من الصف
          const mainName = getVal(row, [
            'المستوى الرئيسي', 'رئيسي', 'mainLevel', 'main level', 'الرئيسي', 'المستوىالرئيسي', 'المستوى-الرئيسي', 'المستوى_الرئيسي', 'main', 'الرئيسى'
          ]).toString().trim() || 'غير محدد';
          const firstName = getVal(row, [
            'المستوى الأول', 'مستوى اول', 'firstLevel', 'first level', 'الاول', 'المستوىالاول', 'المستوى-الاول', 'المستوى_الاول', 'first', 'firstlevel', 'المستوىالأول', 'المستوى-الأول', 'المستوى_الأول',
            'مستوى1', 'المستوى1', 'first1', 'firstone', 'level1', 'levelone', 'مستوى١', 'المستوى١', 'first١', 'مستوى-1', 'مستوى_1', 'first-1', 'first_1', 'firstone', 'مستوىone', 'firstone', 'مستوىone', 'مستوىone1', 'firstone1'
          ], true).toString().trim() || 'غير محدد';
          const secondName = getVal(row, [
            'المستوى الثاني', 'مستوى ثاني', 'secondLevel', 'second level', 'الثاني', 'المستوىالثاني', 'المستوى-الثاني', 'المستوى_الثاني', 'second', 'secondlevel', 'المستوىالثانى', 'المستوى-الثانى', 'المستوى_الثانى'
          ]).toString().trim() || 'غير محدد';
          const salePrice = getVal(row, [
            'السعر', 'سعر البيع', 'سعر', 'salePrice', 'price', 'سعر البيع شامل الضريبة', 'سعر البيع بدون ضريبة', 'سعرالوحدة', 'unit price', 'unitprice'
          ]);
          const itemCode = getVal(row, [
            'كود الصنف', 'itemCode', 'كود', 'code', 'كودالصنف', 'كود-الصنف', 'كود_الصنف', 'codeitem', 'item code', 'itemcode'
          ]);

          // المستوى الرئيسي
          let mainId = mainLevels[mainName];
          if (!mainId) {
            mainId = idCounter++;
            mainLevels[mainName] = mainId;
            itemsArr.push({
              id: mainId,
              name: mainName,
              type: 'رئيسي',
            });
          }

          // المستوى الأول
          const firstKey = mainId + '|' + firstName;
          let firstId = firstLevels[firstKey];
          if (!firstId) {
            firstId = idCounter++;
            firstLevels[firstKey] = firstId;
            itemsArr.push({
              id: firstId,
              name: firstName,
              type: 'مستوى أول',
              parentId: mainId,
            });
          }

          // المستوى الثاني (الصنف النهائي)
          const secondKey = firstId + '|' + secondName;
          let secondId = secondLevels[secondKey];
          if (!secondId) {
            secondId = idCounter++;
            secondLevels[secondKey] = secondId;
            itemsArr.push({
              id: secondId,
              name: secondName,
              type: 'مستوى ثاني',
              parentId: firstId,
              salePrice: salePrice ? Number(salePrice) : 0,
              itemCode: itemCode ? itemCode.toString() : '',
            });
          }
        }

        setPreviewData(itemsArr.map(item => ({ ...item }) as Record<string, unknown>));
        const newWs = XLSX.utils.json_to_sheet(itemsArr);
        const newWb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWb, newWs, 'Sheet1');
        const wbout = XLSX.write(newWb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        setDownloadUrl(URL.createObjectURL(blob));
      } catch (err) {
        setError('حدث خطأ أثناء معالجة الملف. تأكد من صحة الملف.');
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    } 
  });

  // تصدير البيانات الحالية
  const handleExport = () => {
    const dataToExport = items.map(item => ({
      'ID': item.id,
      'الاسم': item.name,
      'النوع': item.type,
      'التابع لـ': item.parentId,
      'كود الصنف': item.itemCode,
      'سعر الشراء': item.purchasePrice,
      'سعر البيع': item.salePrice,
      'الحد الأدنى للطلب': item.minOrder,
      'نسبة الخصم': item.discount,
      'السماح بالسالب': item.allowNegative ? 'نعم' : 'لا',
      'شامل الضريبة': item.isVatIncluded ? 'نعم' : 'لا',
      'إيقاف مؤقت': item.tempCodes ? 'نعم' : 'لا',
      'المورد': item.supplier
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الأصناف');
    XLSX.writeFile(wb, 'الأصناف.xlsx');
  };

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
      >
        <Download className="w-4 h-4" />
        <span>تصدير Excel</span>
      </button>
      
      <div className="relative inline-block">
        <button
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 shadow-sm ml-2"
          onClick={() => document.getElementById('importModal')?.classList.remove('hidden')}
        >
          <Upload className="w-4 h-4" />
          <span>استيراد Excel</span>
        </button>

        {/* نافذة الاستيراد */}
        <div id="importModal" className="hidden fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">استيراد الأصناف من ملف Excel</h3>
              <button
                onClick={() => document.getElementById('importModal')?.classList.add('hidden')}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
              isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white'
            }`}>
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>أسقط الملف هنا ...</p>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 mx-auto text-gray-400" />
                  <p>اسحب ملف Excel هنا أو اضغط لاختيار ملف</p>
                  <p className="text-xs text-gray-500">(يدعم صيغ .xlsx و .xls)</p>
                </div>
              )}
            </div>
            
            {error && <div className="text-red-600 mt-2 p-3 bg-red-50 rounded-lg">{error}</div>}
            {success && <div className="text-green-700 mt-2 p-3 bg-green-50 rounded-lg">{success}</div>}
            
            {/* معاينة البيانات */}
            {previewData.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">معاينة البيانات المستوردة</h4>
                <div className="overflow-x-auto max-h-60 border rounded-lg bg-white shadow">
                  <table className="min-w-full text-sm text-right">
                    <thead className="bg-gray-100">
                      <tr>
                        {Object.keys(previewData[0]).map((key) => (
                          <th key={key} className="px-3 py-2 font-medium text-gray-700">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="border-b last:border-b-0">
                          {Object.values(row).map((val, i) => (
                            <td key={i} className="px-3 py-2 text-gray-600">{val as string}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.length > 5 && (
                    <div className="text-xs text-gray-500 p-2">عرض أول 5 صفوف فقط للمعاينة...</div>
                  )}
                </div>
                
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={handleImportToDB}
                    disabled={importing}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {importing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        استيراد البيانات
                      </>
                    )}
                  </button>
                  
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      download="items_reordered.xlsx"
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      تحميل بعد الترتيب
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// مكون نموذج الإضافة
const AddItemForm: React.FC<{
  formData: Omit<ItemExtended, 'docId'>;
  items: ItemExtended[];
  suppliers: Supplier[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
  loading: boolean;
}> = ({ formData, items, suppliers, onChange, onSubmit, error, loading }) => {
  const getParentOptions = () => {
    if (formData.type === 'مستوى أول') {
      return items.filter(i => i.type === 'رئيسي');
    } else if (formData.type === 'مستوى ثاني') {
      return items.filter(i => i.type === 'مستوى أول');
    }
    return [];
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
      <div className="p-6">
        <h3 className="font-semibold text-lg text-gray-800 border-b pb-3 mb-4">إضافة صنف جديد</h3>
        
        <form onSubmit={onSubmit} className="space-y-4">
          {/* الحقول الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">رقم الصنف</label>
              <input
                type="number"
                name="id"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                value={formData.id}
                onChange={onChange}
                min={1}
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">اسم الصنف</label>
              <input
                type="text"
                name="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                value={formData.name}
                onChange={onChange}
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">التمركز</label>
              <select
                name="type"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                value={formData.type}
                onChange={onChange}
              >
                <option value="رئيسي">رئيسي</option>
                <option value="مستوى أول">مستوى أول</option>
                <option value="مستوى ثاني">مستوى ثاني</option>
              </select>
            </div>
            
            {(formData.type === 'مستوى أول' || formData.type === 'مستوى ثاني') && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {formData.type === 'مستوى أول' ? 'المستوى الرئيسي' : 'المستوى الأول'}
                </label>
                <select
                  name="parentId"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                  value={formData.parentId || ''}
                  onChange={onChange}
                  required
                >
                  <option value="">اختر...</option>
                  {getParentOptions().map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name} (ID: {opt.id})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          {/* الحقول الإضافية للمستوى الثالث */}
          {formData.type === 'مستوى ثاني' && (
            <>
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-sm text-gray-700 mb-3">تفاصيل التسعير</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-500">سعر الشراء</label>
                    <input
                      type="number"
                      name="purchasePrice"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                      value={formData.purchasePrice}
                      onChange={onChange}
                      min={0}
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-500">سعر البيع</label>
                    <input
                      type="number"
                      name="salePrice"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                      value={formData.salePrice}
                      onChange={onChange}
                      min={0}
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-500">كود الصنف</label>
                    <input
                      type="text"
                      name="itemCode"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                      value={formData.itemCode}
                      onChange={onChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-500">المورد</label>
                    <select
                      name="supplier"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                      value={formData.supplier}
                      onChange={onChange}
                    >
                      <option value="">اختر المورد...</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-500">الحد الأدنى للطلب</label>
                    <input
                      type="number"
                      name="minOrder"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                      value={formData.minOrder}
                      onChange={onChange}
                      min={0}
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-500">نسبة الخصم %</label>
                    <input
                      type="number"
                      name="discount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                      value={formData.discount}
                      onChange={onChange}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="allowNegative"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={formData.allowNegative}
                      onChange={onChange}
                    />
                    <span className="text-xs text-gray-700">السماح بالسالب</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isVatIncluded"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={formData.isVatIncluded}
                      onChange={onChange}
                    />
                    <span className="text-xs text-gray-700">شامل الضريبة</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="tempCodes"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={formData.tempCodes}
                      onChange={onChange}
                    />
                    <span className="text-xs text-gray-700">إيقاف مؤقت</span>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {error && (
            <div className="mt-4 text-red-600 text-sm p-3 bg-red-50 rounded-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow transition-all"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>إضافة صنف جديد</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// مكون عرض العنصر
const ItemView: React.FC<{
  item: ItemExtended;
  level: number;
  hasChildren: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  suppliers: Supplier[];
  items: ItemExtended[];
}> = ({ item, level, hasChildren, expanded, onToggleExpand, onDelete, suppliers, items }) => {
  const levelColors = [
    { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
  ];
  
  const colorIndex = Math.min(level, levelColors.length - 1);
  
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold ${levelColors[colorIndex].bg} ${levelColors[colorIndex].text}`}>
            {item.id}
          </div>
          
          <div>
            <h3 className={`font-medium ${levelColors[colorIndex].text}`}>{item.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${levelColors[colorIndex].bg} ${levelColors[colorIndex].text}`}>
                {item.type}
              </span>
              
              {item.parentId && (
                <span className="text-xs text-gray-500">
                  التابع لـ: {items.find(i => i.id === item.parentId)?.name || item.parentId}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {hasChildren && (
            <button 
              type="button" 
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              onClick={onToggleExpand}
            >
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      
      {/* تفاصيل المستوى الأخير */}
      {item.type === 'مستوى ثاني' && (
        <div className={`mt-2 p-3 rounded-lg border ${levelColors[colorIndex].border} grid grid-cols-2 md:grid-cols-3 gap-3`}>
          <DetailItem label="كود الصنف" value={item.itemCode || '-'} />
          <DetailItem label="سعر الشراء" value={item.purchasePrice ? `${item.purchasePrice.toFixed(2)} ر.س` : '-'} />
          <DetailItem label="سعر البيع" value={item.salePrice ? `${item.salePrice.toFixed(2)} ر.س` : '-'} />
          <DetailItem label="الحد الأدنى" value={item.minOrder || '-'} />
          <DetailItem label="الخصم" value={item.discount ? `${item.discount}%` : '-'} />
          <DetailItem 
            label="المورد" 
            value={item.supplier || '-'} 
            supplier={suppliers.find(s => s.name === item.supplier)}
          />
          {item.tempCodes && (
            <div className="col-span-2 md:col-span-3">
              <span className="inline-block bg-yellow-200 text-yellow-900 px-3 py-1 rounded font-bold text-xs">إيقاف مؤقت</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// مكون عرض التفاصيل
const DetailItem: React.FC<{ label: string; value: string | number; supplier?: Supplier }> = ({ label, value, supplier }) => {
  return (
    <div className="text-sm">
      <span className="text-gray-500 text-xs">{label}:</span>{' '}
      {supplier ? (
        <span className="font-medium text-gray-800 text-sm">
          {supplier.name}
        </span>
      ) : (
        <span className="font-medium text-gray-800 text-sm">{value}</span>
      )}
    </div>
  );
};

// مكون نموذج التعديل
const EditItemForm: React.FC<{
  item: ItemExtended;
  items: ItemExtended[];
  suppliers: Supplier[];
  onSave: (updatedItem: ItemExtended) => void;
  onCancel: () => void;
  loading: boolean;
}> = ({ item, items, suppliers, onSave, onCancel, loading }) => {
  const [editData, setEditData] = useState<Omit<ItemExtended, 'docId'>>({
    id: item.id,
    name: item.name,
    type: item.type,
    parentId: item.parentId,
    itemCode: item.itemCode || '',
    purchasePrice: item.purchasePrice || 0,
    salePrice: item.salePrice || 0,
    minOrder: item.minOrder || 0,
    discount: item.discount || 0,
    allowNegative: item.allowNegative || false,
    isVatIncluded: item.isVatIncluded || false,
    tempCodes: item.tempCodes || false,
    supplier: item.supplier || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : name === 'parentId'
            ? value === '' ? undefined : Number(value)
            : type === 'number'
              ? Number(value)
              : value
    }));
    if (name === 'type') {
      setEditData(prev => ({ ...prev, parentId: undefined }));
    }
  };

  const getParentOptions = () => {
    if (editData.type === 'مستوى أول') {
      return items.filter(i => i.type === 'رئيسي' && i.id !== item.id);
    } else if (editData.type === 'مستوى ثاني') {
      return items.filter(i => i.type === 'مستوى أول' && i.id !== item.id);
    }
    return [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Always ensure tempCodes is boolean
    onSave({ ...editData, tempCodes: !!editData.tempCodes, docId: item.docId });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">اسم الصنف</label>
            <input
              type="text"
              name="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={editData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">التمركز</label>
            <select
              name="type"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={editData.type}
              onChange={handleChange}
            >
              <option value="رئيسي">رئيسي</option>
              <option value="مستوى أول">مستوى أول</option>
              <option value="مستوى ثاني">مستوى ثاني</option>
            </select>
          </div>
          
          {(editData.type === 'مستوى أول' || editData.type === 'مستوى ثاني') && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                {editData.type === 'مستوى أول' ? 'المستوى الرئيسي' : 'المستوى الأول'}
              </label>
              <select
                name="parentId"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                value={editData.parentId || ''}
                onChange={handleChange}
                required
              >
                <option value="">اختر...</option>
                {getParentOptions().map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name} (ID: {opt.id})</option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {/* الحقول الإضافية للمستوى الثالث */}
        {editData.type === 'مستوى ثاني' && (
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">كود الصنف</label>
              <input
                type="text"
                name="itemCode"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                value={editData.itemCode}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">سعر الشراء</label>
                <input
                  type="number"
                  name="purchasePrice"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={editData.purchasePrice}
                  onChange={handleChange}
                  min={0}
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">سعر البيع</label>
                <input
                  type="number"
                  name="salePrice"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={editData.salePrice}
                  onChange={handleChange}
                  min={0}
                  step="0.01"
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">المورد</label>
              <select
                name="supplier"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                value={editData.supplier}
                onChange={handleChange}
              >
                <option value="">اختر المورد...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="allowNegative"
                  id="editAllowNegative"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={editData.allowNegative}
                  onChange={handleChange}
                />
                <label htmlFor="editAllowNegative" className="text-xs text-gray-700">السماح بالسالب</label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isVatIncluded"
                  id="editIsVatIncluded"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={editData.isVatIncluded}
                  onChange={handleChange}
                />
                <label htmlFor="editIsVatIncluded" className="text-xs text-gray-700">شامل الضريبة</label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="tempCodes"
                  id="editTempCodes"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={editData.tempCodes}
                  onChange={handleChange}
                />
                <label htmlFor="editTempCodes" className="text-xs text-gray-700">إيقاف مؤقت</label>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-end gap-2 pt-6 mt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          إلغاء
        </button>
        
        <button
          type="submit"
          className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              حفظ التعديلات
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ItemManagementPage;