import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Breadcrumb from "../../components/Breadcrumb";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { DatePicker, Select, Spin } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { PrinterOutlined, ExportOutlined } from '@ant-design/icons';
import { Package } from "lucide-react";

const StockPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  // الأصناف مستوى ثالث (مستوى ثاني)
  const [thirdLevelItems, setThirdLevelItems] = useState([]);
  const [firstLevelItems, setFirstLevelItems] = useState([]); // الأصناف مستوى أول
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null); // الفئة المختارة
  const [searchResults, setSearchResults] = useState([]);
  const [resultsCount, setResultsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  // جلب الفروع من Firebase
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "branches"));
        setBranches(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("خطأ في جلب الفروع:", error);
      }
    };
    const fetchWarehouses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "warehouses"));
        setWarehouses(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("خطأ في جلب المخازن:", error);
      }
    };
    fetchBranches();
    fetchWarehouses();
    // جلب الأصناف مستوى ثاني فقط
    const fetchThirdLevelItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "inventory_items"));
        const items = querySnapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id })) as any[];
        const filtered = items.filter(item => item && item.type === "مستوى ثاني");
        setThirdLevelItems(filtered);
        // جلب الأصناف مستوى أول
        const firstLevelFiltered = items.filter(item => item && item.type === "مستوى أول");
        setFirstLevelItems(firstLevelFiltered);
      } catch (error) {
        console.error("خطأ في جلب الأصناف مستوى ثاني أو أول:", error);
      }
    };
    fetchThirdLevelItems();
    // جلب الموردين
    const fetchSuppliers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "suppliers"));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSuppliers(data);
      } catch (error) {
        console.error("خطأ في جلب الموردين:", error);
      }
    };
    fetchSuppliers();
  }, []);

  // جلب وتجميع بيانات الوارد من فواتير المشتريات
  // تعريف نوع صف المخزون
  type StockRow = {
    code: string;
    sku: string;
    company: string;
    category: string;
    model: string;
    store: string;
    country: string;
    name: string;
    incoming: number;
    outgoing: number;
    balance: number;
    parentOfModel?: string;
    allowNegative?: boolean;
    tempCodes?: boolean;
  };


  const handleSearch = async () => {
    setIsLoading(true);
    setSearchTriggered(true);
    try {
      // جلب فواتير المشتريات
      const purchasesSnap = await getDocs(collection(db, "purchases_invoices"));
      const allPurchases = purchasesSnap.docs.map(doc => doc.data());
      // جلب فواتير المبيعات
      const salesSnap = await getDocs(collection(db, "sales_invoices"));
      const allSales = salesSnap.docs.map(doc => doc.data());
      // جلب مرتجعات المبيعات
      const salesReturnsSnap = await getDocs(collection(db, "sales_returns"));
      const allSalesReturns = salesReturnsSnap.docs.map(doc => doc.data());

      // تجميع الوارد لكل صنف/مخزن
      const incomingMap: Record<string, StockRow> = {};
      // مشتريات = وارد
      allPurchases.forEach(inv => {
        if (Array.isArray(inv.items)) {
          inv.items.forEach((item: any) => {
            const key = `${item.itemNumber || item.itemName || ''}_${inv.warehouse || item.warehouseId || ''}`;
            if (!incomingMap[key]) {
              incomingMap[key] = {
                code: item.itemNumber || '',
                sku: '',
                company: '',
                category: '',
                model: '',
                store: warehouses.find((w: any) => w.id === (inv.warehouse || item.warehouseId))?.name || (inv.warehouse || item.warehouseId || ''),
                country: '',
                name: item.itemName || '',
                incoming: 0,
                outgoing: 0,
                balance: 0,
              };
            }
            incomingMap[key].incoming += Number(item.quantity) || 0;
          });
        }
      });

      // مرتجعات المبيعات = وارد فقط في المخزن الخاص بالمرتجع
      allSalesReturns.forEach((ret) => {
        if (Array.isArray(ret.items)) {
          ret.items.forEach((item: any) => {
            // المخزن: أولوية لـ item.warehouseId ثم item.warehouse ثم ret.warehouse
            const warehouseId = item.warehouseId || item.warehouse || ret.warehouse || '';
            // اسم المخزن: أولوية لـ item.warehouseName (لو موجود) ثم من جدول المخازن ثم المعرف
            let warehouseName = '';
            if (item.warehouseName) {
              warehouseName = item.warehouseName;
            } else {
              const warehouseObj = warehouses.find((w: any) => w.id === warehouseId);
              warehouseName = warehouseObj && warehouseObj.name ? warehouseObj.name : warehouseId;
            }
            const key = `${item.itemNumber || item.itemName || ''}_${warehouseId}`;
            if (!incomingMap[key]) {
              incomingMap[key] = {
                code: item.itemNumber || '',
                sku: '',
                company: '',
                category: '',
                model: '',
                store: warehouseName,
                country: '',
                name: item.itemName || '',
                incoming: 0,
                outgoing: 0,
                balance: 0,
              };
            }
            // الكمية المرتجعة فقط
            const returnedQty = typeof item.returnedQty !== 'undefined' ? Number(item.returnedQty) : 0;
            incomingMap[key].incoming += returnedQty;
          });
        }
      });

      // خصم المبيعات من الوارد وإضافتها إلى المنصرف
      allSales.forEach(inv => {
        if (Array.isArray(inv.items)) {
          inv.items.forEach((item: any) => {
            const key = `${item.itemNumber || item.itemName || ''}_${inv.warehouse || item.warehouseId || ''}`;
            if (!incomingMap[key]) {
              incomingMap[key] = {
                code: item.itemNumber || '',
                sku: '',
                company: '',
                category: '',
                model: '',
                store: warehouses.find((w: any) => w.id === (inv.warehouse || item.warehouseId))?.name || (inv.warehouse || item.warehouseId || ''),
                country: '',
                name: item.itemName || '',
                incoming: 0,
                outgoing: 0,
                balance: 0,
              };
            }
            incomingMap[key].outgoing += Number(item.quantity) || 0;
          });
        }
      });

      // دمج بيانات الأصناف
      Object.values(incomingMap).forEach(row => {
        // جلب بيانات الصنف من thirdLevelItems أو firstLevelItems
        const allItems = [...firstLevelItems, ...thirdLevelItems];
        const item = allItems.find(i => i.itemCode === row.code || i.name === row.name);
        if (item) {
          row.sku = item.sku || item.itemCode || '';
          row.company = item.company || '';
          let parentName = '';
          let categoryName = '';
          let parentOfModelName = '';
          // الفئة = اسم الجذر الأعلى (المستوى الرئيسي)
          let current = item;
          let safety = 0;
          while (current && current.parentId != null && current.parentId !== '' && safety < 20) {
            const next = allItems.find((i: any) => String(i.id) === String(current.parentId));
            if (!next) break;
            current = next;
            safety++;
          }
          if (current) {
            categoryName = current.name || '';
          }
          // الموديل هو الأب المباشر (إن وجد)
          let modelParent = null;
          if (item.parentId != null && item.parentId !== '') {
            modelParent = allItems.find((i: any) => String(i.id) === String(item.parentId));
            if (modelParent) {
              parentName = modelParent.name || '';
            } else {
              parentName = item.name || '';
            }
          } else {
            parentName = item.name || '';
          }
          // أب الموديل (الفئة الأعلى للموديل المباشر)
          if (modelParent && modelParent.parentId != null && modelParent.parentId !== '') {
            const parentOfModel = allItems.find((i: any) => String(i.id) === String(modelParent.parentId));
            if (parentOfModel) {
              parentOfModelName = parentOfModel.name || '';
            }
          }
          row.model = parentName;
          row.category = categoryName;
          // يمكنك الآن استخدام parentOfModelName في الجدول أو طباعته
          row.parentOfModel = parentOfModelName;
          if (!row.category) {
            // طباعة تحذير للمطور فقط
            //console.warn('الصنف بدون فئة (جذر أعلى):', item, row);
          }
          row.country = item.country || '';
          row.allowNegative = item.allowNegative || false;
          row.tempCodes = item.tempCodes || false;
        }
        // الرصيد = الوارد - المنصرف
        row.balance = row.incoming - row.outgoing;
      });
      // فلترة النتائج حسب رقم الصنف/اسم الصنف والمخزن
      let results = Object.values(incomingMap);
      if (selectedItem) {
        // selectedItem هو id من thirdLevelItems
        const selectedObj = thirdLevelItems.find(item => item.id === selectedItem);
        if (selectedObj) {
          results = results.filter(row => row.code === selectedObj.itemCode || row.name === selectedObj.name);
        }
      }
      if (selectedWarehouse) {
        // selectedWarehouse هو id من warehouses
        const selectedWarehouseObj = warehouses.find(w => w.id === selectedWarehouse);
        if (selectedWarehouseObj) {
          results = results.filter(row => row.store === selectedWarehouseObj.name || row.store === selectedWarehouseObj.id);
        }
      }
      setSearchResults(results);
      setResultsCount(results.length);
    } catch (err) {
      setSearchResults([]);
      setResultsCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Load font dynamically
  useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('tajawal-font')) {
      const link = document.createElement('link');
      link.id = 'tajawal-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  return (


    <div className="p-4 space-y-6 font-['Tajawal'] bg-gray-50 min-h-screen">
    <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          <Package className="h-8 w-8 text-orange-600 ml-3" />
          <h1 className="text-2xl font-bold text-gray-800">جرد المخازن </h1>
        </div>
        <p className="text-gray-600 mt-2">  جرد النظام المخزني والمستودعات</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-purple-500"></div>
      </div>

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "المخازن", to: "/management/warehouse" },
          { label: "المخزون" }
        ]}
      />
      {/* Search Options Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <div className="p-4 pb-0 border-r-[6px] border-blue-600 bg-gradient-to-r from-blue-50 to-white">
          <h2 className="text-xl font-bold text-gray-800">خيارات البحث</h2>
          <hr className="my-4 border-t-2 border-blue-100" />
        </div>
        
        <div className="p-6">
          {/* First Row */}
          <div className="grid grid-cols-4 gap-6 mb-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col gap-2"
            >
              <label className="text-base font-bold text-gray-700">رقم الصنف واسم الصنف</label>
              <Select
                showSearch
                placeholder="اختر رقم أو اسم الصنف"
                style={{ height: '44px' }}
                allowClear
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={thirdLevelItems.map(item => ({
                  label: `${item.itemCode || item.id} - ${item.name}`,
                  value: item.id
                }))}
                value={selectedItem}
                onChange={setSelectedItem}
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="flex flex-col gap-2"
            >
              <label className="text-base font-bold text-gray-700">الفئة</label>
              <Select
                showSearch
                placeholder="اختر الفئة"
                style={{ height: '44px' }}
                allowClear
                filterOption={(input, option) => {
                  // نبحث في اسم الفئة
                  return (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase());
                }}
                value={selectedCategory}
                onChange={setSelectedCategory}
              >
                {firstLevelItems.map(item => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name} ({item.id})
                  </Select.Option>
                ))}
              </Select>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-2"
            >
              <label className="text-base font-bold text-gray-700">المخزن</label>
              <Select
                showSearch
                placeholder="اختر المخزن"
                style={{ height: '44px' }}
                allowClear
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={warehouses.map(warehouse => ({ label: warehouse.name, value: warehouse.id }))}
                value={selectedWarehouse}
                onChange={setSelectedWarehouse}
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex flex-col gap-2"
            >
              <label className="text-base font-bold text-gray-700">فلتر حسب</label>
              <Select
                showSearch
                placeholder="فلتر حسب"
                className="w-full"
                style={{ height: '44px' }}
                allowClear
                filterOption={(input, option) => String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
              >
                <Select.Option value="all">الكل</Select.Option>
                <Select.Option value="zero">الصفرية</Select.Option>
                <Select.Option value="negative">السوالب</Select.Option>
                <Select.Option value="positive">لها رصيد</Select.Option>
              </Select>
            </motion.div>
          </div>
          
          {/* Second Row */}
          <div className="grid grid-cols-4 gap-6 mb-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-2"
            >
              <label className="text-base font-bold text-gray-700">رقم هاتف المورد واسمه</label>
              <Select
                showSearch
                placeholder="اختر رقم هاتف المورد أو الاسم"
                style={{ height: '44px' }}
                allowClear
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={suppliers.map(supplier => ({
                  label: `${supplier.phone || ''} - ${supplier.name || ''}`,
                  value: supplier.id
                }))}
                value={selectedSupplier}
                onChange={setSelectedSupplier}
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex flex-col gap-2"
            >
              <label className="text-base font-bold text-gray-700">من تاريخ</label>
              <DatePicker
                className="w-full"
                style={{ height: '44px', borderRadius: '6px' }}
                format="YYYY-MM-DD"
                placeholder="YYYY-MM-DD"
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-2"
            >
              <label className="text-base font-bold text-gray-700">إلى تاريخ</label>
              <DatePicker
                className="w-full"
                style={{ height: '44px', borderRadius: '6px' }}
                format="YYYY-MM-DD"
                placeholder="YYYY-MM-DD"
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="flex flex-col gap-2"
            >
              <label className="text-base font-bold text-gray-700">الجهة</label>
              <Select
                showSearch
                placeholder="اختر الجهة"
                className="w-full"
                style={{ height: '44px' }}
                allowClear
                filterOption={(input, option) => String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
              >
                <Select.Option value="side1">جهة 1</Select.Option>
                <Select.Option value="side2">جهة 2</Select.Option>
              </Select>
            </motion.div>
          </div>
          
          {/* Third Row */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-2"
            >
              <label className="text-base font-bold text-gray-700">الشركة المصنعة</label>
              <Select
                showSearch
                placeholder="اختر الشركة المصنعة"
                className="w-full"
                style={{ height: '44px' }}
                allowClear
                filterOption={(input, option) => String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
              >
                <Select.Option value="company1">شركة 1</Select.Option>
                <Select.Option value="company2">شركة 2</Select.Option>
              </Select>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="flex flex-col gap-2"
            >
              <label className="text-base font-bold text-gray-700">الدولة المصنعة</label>
              <Select
                showSearch
                placeholder="اختر الدولة المصنعة"
                className="w-full"
                style={{ height: '44px' }}
                allowClear
                filterOption={(input, option) => String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
              >
                <Select.Option value="country1">دولة 1</Select.Option>
                <Select.Option value="country2">دولة 2</Select.Option>
              </Select>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col gap-2"
            >
              <label className="text-base font-bold text-gray-700">الكود المصنعي (SKU)</label>
              <Input 
                className="border border-gray-300 bg-white px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                style={{ borderRadius: '6px', height: '44px' }} 
                placeholder="الكود المصنعي (SKU)" 
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="flex flex-col gap-2"
            >
              <label className="text-base font-bold text-gray-700">الفرع</label>
              <Select
                showSearch
                placeholder="اختر الفرع"
                style={{ height: '44px' }}
                allowClear
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={branches.map(branch => ({ label: branch.name, value: branch.id }))}
                value={selectedBranch}
                onChange={setSelectedBranch}
              />
            </motion.div>
          </div>
          
          {/* Search Button and Results Count */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-6"
          >
            <Button 
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {isLoading ? 'جاري البحث...' : 'بحث'}
            </Button>
            <motion.span 
              animate={{ 
                scale: searchTriggered ? [1, 1.05, 1] : 1,
                color: searchTriggered ? '#2563eb' : '#374151'
              }}
              transition={{ duration: 0.5 }}
              className="text-base font-medium"
            >
              نتائج البحث: {resultsCount}
            </motion.span>
          </motion.div>
        </div>
      </motion.div>

      {/* Results Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex justify-between items-center bg-white rounded-lg shadow-lg p-4 border-r-[6px] border-blue-600"
      >
        <span className="font-bold text-lg text-gray-800">نتائج البحث</span>
        <div className="flex gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6 py-2 rounded-md shadow transition-all duration-300 hover:shadow-lg">
            <PrinterOutlined />
            طباعة
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-6 py-2 rounded-md shadow transition-all duration-300 hover:shadow-lg">
            <ExportOutlined />
            تصدير
          </Button>
        </div>
      </motion.div>

      {/* Results Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200"
      >
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Spin size="large" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-center">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">كود الصنف</th>
                  <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">الكود المصنعي</th>
                  <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">الشركة المصنعة</th>
                  <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">الفئة</th>
                  <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">الموديل</th>
                  <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">المخزن</th>
                  <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">الدولة</th>
                  <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">اسم الصنف</th>
                  <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">السماح بالسالب</th>
                  <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">الحالة</th>
                  <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">الوارد</th>
                  <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">المنصرف</th>
                  <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">الرصيد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {searchResults.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={13} className="px-6 py-8 text-gray-500 text-center">
                        {searchTriggered ? 'لا توجد نتائج مطابقة لبحثك' : 'استخدم خيارات البحث للعثور على العناصر'}
                      </td>
                    </motion.tr>
                  ) : (
                    searchResults.map((row, idx) => (
                      <motion.tr 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                      >
                        <td className="px-6 py-4 text-sm border-b border-gray-200">{row.code}</td>
                        <td className="px-6 py-4 text-sm border-b border-gray-200">{row.sku}</td>
                        <td className="px-6 py-4 text-sm border-b border-gray-200">{row.company}</td>
                        <td className="px-6 py-4 text-sm border-b border-gray-200">{row.category}</td>
                        <td className="px-6 py-4 text-sm border-b border-gray-200">{row.model}</td>
                        <td className="px-6 py-4 text-sm border-b border-gray-200">{row.store}</td>
                        <td className="px-6 py-4 text-sm border-b border-gray-200">{row.country}</td>
                        <td className="px-6 py-4 text-sm font-medium border-b border-gray-200">{row.name}</td>
                        <td className="px-6 py-4 text-sm border-b border-gray-200">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.allowNegative 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {row.allowNegative ? '✓ مسموح' : '✗ غير مسموح'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm border-b border-gray-200">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.tempCodes 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {row.tempCodes ? '⛔ موقوف' : '✓ نشط'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm border-b border-gray-200 text-green-600 font-medium">+{row.incoming}</td>
                        <td className="px-6 py-4 text-sm border-b border-gray-200 text-red-600 font-medium">-{row.outgoing}</td>
                        <td className={`px-6 py-4 text-sm border-b border-gray-200 font-bold ${
                          row.balance < 0 ? 'text-red-600' : row.balance === 0 ? 'text-gray-500' : 'text-green-600'
                        }`}>{row.balance}</td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
              {searchResults.length > 0 && (
                <tfoot>
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: searchResults.length * 0.05 + 0.2 }}
                    className="bg-gray-100 font-semibold"
                  >
                    <td colSpan={8} className="px-6 py-3 text-sm border-t border-gray-300"></td>
                    <td className="px-6 py-3 text-sm border-t border-gray-300">الإجمالي</td>
                    <td className="px-6 py-3 text-sm border-t border-gray-300"></td>
                    <td className="px-6 py-3 text-sm border-t border-gray-300 text-green-600 font-bold">
                      +{searchResults.reduce((sum, row) => sum + (row.incoming || 0), 0)}
                    </td>
                    <td className="px-6 py-3 text-sm border-t border-gray-300 text-red-600 font-bold">
                      -{searchResults.reduce((sum, row) => sum + (row.outgoing || 0), 0)}
                    </td>
                    <td className="px-6 py-3 text-sm border-t border-gray-300 font-bold">
                      {searchResults.reduce((sum, row) => sum + (row.balance || 0), 0)}
                    </td>
                  </motion.tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default StockPage;