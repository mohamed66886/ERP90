import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker, Input, Select, Table } from "antd";
import arEG from 'antd/es/date-picker/locale/ar_EG';
import { fetchBranches, Branch } from "@/lib/branches";
import Breadcrumb from "@/components/Breadcrumb";
import dayjs, { Dayjs } from 'dayjs';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { useFinancialYear } from "@/hooks/useFinancialYear";
import { BarChartOutlined, TableOutlined, PrinterOutlined } from '@ant-design/icons';
import { Helmet } from "react-helmet";

const { Option } = Select;

interface WarehouseOption {
  id: string;
  name: string;
}

interface CustomerOption {
  id: string;
  name: string;
}

interface ItemOption {
  id: string;
  name: string;
  itemNumber: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface SupplierOption {
  id: string;
  name: string;
}

interface ChartDataItem {
  itemName: string;
  totalQuantity: number;
  totalAmount: number;
}

// بيانات الأصناف المباعة
interface SoldItemRecord {
  key: string;
  itemNumber: string;
  itemName: string;
  category: string;
  unit: string;
  salePrice: number;
  quantity: number;
  totalAmount: number;
  invoiceNumber: string;
  date: string;
  branch: string;
  customer: string;
  warehouse: string;
  supplier: string;
}

const SoldItems: React.FC = () => {
  const [showMore, setShowMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(true);
  

  // خيارات البحث
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);
  const [branchId, setBranchId] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [itemId, setItemId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>("");

  // السنة المالية من السياق
  const { currentFinancialYear } = useFinancialYear();

  // تعيين التواريخ الافتراضية حسب السنة المالية
  useEffect(() => {
    if (currentFinancialYear) {
      const start = dayjs(currentFinancialYear.startDate);
      const end = dayjs(currentFinancialYear.endDate);
      setDateFrom(start);
      setDateTo(end);
    }
  }, [currentFinancialYear]);

  // قوائم الخيارات
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);

  // بيانات التقرير
  const [soldItems, setSoldItems] = useState<SoldItemRecord[]>([]);
  const [filteredItems, setFilteredItems] = useState<SoldItemRecord[]>([]);

  // بيانات الرسم البياني
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  useEffect(() => {
    fetchBranches().then(data => {
      setBranches(data);
      setBranchesLoading(false);
    });
    
    // اختبار الاتصال بـ Firebase
    const testFirebaseConnection = async () => {
      try {
        const { getFirestore, connectFirestoreEmulator } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        console.log('Firebase DB متصل:', !!db);
      } catch (error) {
        console.error('خطأ في الاتصال بـ Firebase:', error);
      }
    };
    testFirebaseConnection();
  }, []);

  // جلب المخازن من قاعدة البيانات
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const snap = await getDocs(collection(db, 'warehouses'));
        const options = snap.docs.map(doc => {
          const data = doc.data();
          let name = '';
          if (data.nameAr && typeof data.nameAr === 'string') name = data.nameAr;
          else if (data.name && typeof data.name === 'string') name = data.name;
          else if (data.nameEn && typeof data.nameEn === 'string') name = data.nameEn;
          else name = doc.id;
          return {
            id: doc.id,
            name: name
          };
        });
        setWarehouses(options);
      } catch {
        setWarehouses([]);
      }
    };
    fetchWarehouses();
  }, []);

  // جلب العملاء من قاعدة البيانات
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const snap = await getDocs(collection(db, 'customers'));
        const options = snap.docs.map(doc => {
          const data = doc.data();
          let name = '';
          if (data.nameAr && typeof data.nameAr === 'string') name = data.nameAr;
          else if (data.name && typeof data.name === 'string') name = data.name;
          else if (data.customerName && typeof data.customerName === 'string') name = data.customerName;
          else if (data.nameEn && typeof data.nameEn === 'string') name = data.nameEn;
          else name = doc.id;
          return {
            id: doc.id,
            name: name
          };
        });
        setCustomers(options);
      } catch {
        setCustomers([]);
      }
    };
    fetchCustomers();
  }, []);

  // جلب الأصناف من قاعدة البيانات (نفس طريقة صفحة المبيعات)
  useEffect(() => {
    const fetchItems = async () => {
      setItemsLoading(true);
      console.log('بدء جلب الأصناف...');
      try {
        // استخدام نفس Firebase imports المستخدمة في صفحة المبيعات
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        console.log('الاتصال بقاعدة البيانات...');
        console.log('قاعدة البيانات:', db);
        
        const itemsCollection = collection(db, 'items');
        console.log('مجموعة الأصناف:', itemsCollection);
        
        const snapshot = await getDocs(itemsCollection);
        console.log('عدد وثائق الأصناف:', snapshot.docs.length);
        console.log('الوثائق:', snapshot.docs);
        
        if (snapshot.empty) {
          console.warn('لا توجد أصناف في قاعدة البيانات');
          setItems([]);
          return;
        }
        
        const options = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('بيانات الصنف:', { id: doc.id, data });
          
          // نفس منطق استخراج الاسم المستخدم في صفحة المبيعات
          const name = data.itemName || data.name || doc.id;
          const itemNumber = data.itemNumber || data.itemCode || doc.id;
          
          return {
            id: doc.id, 
            name: String(name),
            itemNumber: String(itemNumber)
          };
        });
        
        console.log('الأصناف المحملة:', options);
        console.log('عدد الأصناف المحملة:', options.length);
        setItems(options);
        
      } catch (error) {
        console.error('خطأ مفصل في جلب الأصناف:', error);
        console.error('تفاصيل الخطأ:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        setItems([]);
      } finally {
        setItemsLoading(false);
        console.log('انتهاء جلب الأصناف');
      }
    };
    
    // تأخير طفيف للتأكد من تحميل Firebase
    setTimeout(fetchItems, 100);
  }, []);

  // جلب الفئات من قاعدة البيانات
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const snap = await getDocs(collection(db, 'categories'));
        const options = snap.docs.map(doc => {
          const data = doc.data();
          let name = '';
          if (data.nameAr && typeof data.nameAr === 'string') name = data.nameAr;
          else if (data.name && typeof data.name === 'string') name = data.name;
          else if (data.nameEn && typeof data.nameEn === 'string') name = data.nameEn;
          else name = doc.id;
          return {
            id: doc.id,
            name: name
          };
        });
        setCategories(options);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // جلب الموردين من قاعدة البيانات
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const snap = await getDocs(collection(db, 'suppliers'));
        const options = snap.docs.map(doc => {
          const data = doc.data();
          let name = '';
          if (data.nameAr && typeof data.nameAr === 'string') name = data.nameAr;
          else if (data.name && typeof data.name === 'string') name = data.name;
          else if (data.nameEn && typeof data.nameEn === 'string') name = data.nameEn;
          else name = doc.id;
          return {
            id: doc.id,
            name: name
          };
        });
        setSuppliers(options);
      } catch {
        setSuppliers([]);
      }
    };
    fetchSuppliers();
  }, []);

  // جلب بيانات الأصناف المباعة من Firebase
  const fetchSoldItems = async () => {
    setIsLoading(true);
    try {
      const { getDocs, collection, query, where, doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      const baseQuery = collection(db, 'sales_invoices');
      const constraints = [];
      
      if (branchId) constraints.push(where('branch', '==', branchId));
      if (invoiceNumber) constraints.push(where('invoiceNumber', '==', invoiceNumber));
      if (dateFrom) constraints.push(where('date', '>=', dayjs(dateFrom).format('YYYY-MM-DD')));
      if (dateTo) constraints.push(where('date', '<=', dayjs(dateTo).format('YYYY-MM-DD')));
      if (warehouseId) constraints.push(where('warehouse', '==', warehouseId));
      
      const finalQuery = constraints.length > 0 ? query(baseQuery, ...constraints) : baseQuery;
      
      const snapshot = await getDocs(finalQuery);
      const records: SoldItemRecord[] = [];
      
      // جلب بيانات الأصناف لاستخراج الأسعار الأصلية
      const itemPrices: { [key: string]: { price: number; unit: string; category: string; name: string } } = {};
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const invoiceNumber = data.invoiceNumber || '';
        const date = data.date || '';
        const branch = data.branch || '';
        const customer = data.customerName || data.customer || '';
        const warehouse = data.warehouse || '';
        const items = Array.isArray(data.items) ? data.items : [];
        
        for (const item of items) {
          // تطبيق فلاتر إضافية على مستوى الصنف
          let includeItem = true;
          
          // فلتر العميل - التحقق من الاسم والـ ID
          if (customerId) {
            const selectedCustomerName = customers.find(c => c.id === customerId)?.name;
            // التحقق إذا كان العميل في الفاتورة يطابق الاسم أو الـ ID المحدد
            if (customer !== selectedCustomerName && customer !== customerId) {
              includeItem = false;
            }
          }
          if (itemId && (item.itemNumber as string) !== itemId) includeItem = false;
          if (categoryId && (item.mainCategory as string) !== categoryId) includeItem = false;
          if (supplierId && (item.supplier as string) !== supplierId) includeItem = false;
          
          if (includeItem) {
            const itemNumber = (item.itemNumber as string) || '';
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            const totalAmount = quantity * price;
            
            // جلب سعر البيع الأصلي للصنف إذا لم يكن موجوداً
            if (!itemPrices[itemNumber]) {
              try {
                const itemDoc = await getDoc(doc(db, 'items', itemNumber));
                if (itemDoc.exists()) {
                  const itemData = itemDoc.data();
                  itemPrices[itemNumber] = {
                    price: Number(itemData.salePrice) || Number(itemData.price) || price,
                    unit: itemData.unit || (item.unit as string) || 'قطعة',
                    category: itemData.category || itemData.mainCategory || (item.mainCategory as string) || '',
                    name: itemData.itemName || itemData.name || (item.itemName as string) || ''
                  };
                } else {
                  // استخدام البيانات من الفاتورة إذا لم توجد في مجموعة الأصناف
                  itemPrices[itemNumber] = {
                    price: price,
                    unit: (item.unit as string) || 'قطعة',
                    category: (item.mainCategory as string) || '',
                    name: (item.itemName as string) || ''
                  };
                }
              } catch {
                // استخدام البيانات من الفاتورة في حالة الخطأ
                itemPrices[itemNumber] = {
                  price: price,
                  unit: (item.unit as string) || 'قطعة',
                  category: (item.mainCategory as string) || '',
                  name: (item.itemName as string) || ''
                };
              }
            }
            
            records.push({
              key: docSnapshot.id + '-' + itemNumber,
              itemNumber,
              itemName: itemPrices[itemNumber].name || (item.itemName as string) || '',
              category: itemPrices[itemNumber].category || (item.mainCategory as string) || '',
              unit: itemPrices[itemNumber].unit || (item.unit as string) || 'قطعة',
              salePrice: itemPrices[itemNumber].price, // استخدام السعر الأصلي للصنف
              quantity,
              totalAmount,
              invoiceNumber,
              date,
              branch,
              customer: customers.find(c => c.id === customer || c.name === customer)?.name || customer,
              warehouse: (item.warehouseId as string) || warehouse,
              supplier: (item.supplier as string) || ''
            });
          }
        }
      }
      
      setSoldItems(records);
      setFilteredItems(records);
      
      // تجميع الأصناف لتجنب التكرار
      const groupedItems: { [key: string]: SoldItemRecord } = {};
      
      records.forEach(item => {
        const key = item.itemNumber;
        if (groupedItems[key]) {
          // إضافة الكمية إلى الصنف الموجود (مع الاحتفاظ بسعر البيع الأصلي)
          groupedItems[key].quantity += item.quantity;
          groupedItems[key].totalAmount += item.totalAmount;
        } else {
          // إضافة صنف جديد
          groupedItems[key] = { ...item };
        }
      });
      
      // تحويل إلى مصفوفة
      const groupedRecords = Object.values(groupedItems);
      
      setSoldItems(groupedRecords);
      setFilteredItems(groupedRecords);
      
      // إعداد بيانات الرسم البياني
      const chartData: ChartDataItem[] = groupedRecords.map(item => ({
        itemName: item.itemName,
        totalQuantity: item.quantity,
        totalAmount: item.totalAmount
      }));
      
      // ترتيب البيانات حسب الكمية وأخذ أفضل 10 أصناف
      const sortedData = chartData
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 10);
      
      setChartData(sortedData);
      
    } catch (err) {
      setSoldItems([]);
      setFilteredItems([]);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // عند الضغط على بحث
  const handleSearch = () => {
    fetchSoldItems();
  };

  // دالة لجلب اسم الفرع من القائمة
  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : branchId;
  };

  // دالة تصدير البيانات إلى ملف Excel
  const handleExport = async () => {
    // تحميل exceljs من CDN إذا لم يكن موجوداً في window
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ExcelJS = (window as any).ExcelJS;
    if (!ExcelJS) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/exceljs@4.3.0/dist/exceljs.min.js';
        script.onload = () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ExcelJS = (window as any).ExcelJS;
          resolve(null);
        };
        script.onerror = reject;
        document.body.appendChild(script);
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ExcelJS = (window as any).ExcelJS;
    }

    const exportData = filteredItems.map(item => [
      item.itemNumber,
      item.itemName,
      item.category,
      item.unit,
      item.salePrice,
      item.quantity
    ]);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('تقرير الأصناف المباعة');

    // إعداد الأعمدة
    sheet.columns = [
      { header: 'رقم الصنف', key: 'itemNumber', width: 20 },
      { header: 'اسم الصنف', key: 'itemName', width: 40 },
      { header: 'الفئة', key: 'category', width: 15 },
      { header: 'الوحدة', key: 'unit', width: 10 },
      { header: 'سعر البيع', key: 'salePrice', width: 12 },
      { header: 'الكمية المباعة', key: 'quantity', width: 15 }
    ];

    // إضافة البيانات
    sheet.addRows(exportData);

    // تنسيق رأس الجدول
    sheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FF305496' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDDEBF7' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFAAAAAA' } },
        bottom: { style: 'thin', color: { argb: 'FFAAAAAA' } },
        left: { style: 'thin', color: { argb: 'FFAAAAAA' } },
        right: { style: 'thin', color: { argb: 'FFAAAAAA' } },
      };
    });

    // تنسيق بقية الصفوف
    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      row.eachCell(cell => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFAAAAAA' } },
          bottom: { style: 'thin', color: { argb: 'FFAAAAAA' } },
          left: { style: 'thin', color: { argb: 'FFAAAAAA' } },
          right: { style: 'thin', color: { argb: 'FFAAAAAA' } },
        };
        if (i % 2 === 1) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF7F9FC' }
          };
        }
      });
    }

    // Freeze header row
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: sheet.columnCount }
    };

    // إنشاء ملف وحفظه
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_الأصناف_المباعة_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  // ألوان الرسم البياني
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#387908', '#00ff00'];

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
  
      <Helmet>
        <title>تقرير الأصناف المباعة | ERP90 Dashboard</title>
        <meta name="description" content="تقرير فواتير المبيعات، عرض وطباعة فواتير العملاء، ERP90 Dashboard" />
        <meta name="keywords" content="ERP, فواتير, مبيعات, تقرير, عملاء, ضريبة, طباعة, Sales, Invoice, Report, Tax, Customer" />
      </Helmet>
     <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          <BarChartOutlined className="h-8 w-8 text-green-600 ml-3" />
          <h1 className="text-2xl font-bold text-gray-800">تقرير الأصناف المباعة</h1>
        </div>
        <p className="text-gray-600 mt-2">عرض وإدارة تقرير الأصناف المباعة</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
      </div>

      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "إدارة المبيعات", to: "/management/sales" },
          { label: "تقرير الأصناف المباعة" }
        ]}
      />

      {/* Search Options */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-white p-4 rounded-lg border border-blue-100 flex flex-col gap-4 shadow-sm relative"
      >
        <div className="flex items-center">
          <div className="border-r-4 border-blue-500 pr-4 mr-4 h-10 flex items-center">
            <span className="text-lg font-semibold text-gray-700">خيارات البحث</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0 }}
            className="flex flex-col"
          >
            <label className="text-sm mb-1 text-gray-600">رقم الفاتورة</label>
            <Input 
              style={{ width: '100%' }}
              placeholder="رقم الفاتورة"
              value={invoiceNumber}
              onChange={e => setInvoiceNumber(e.target.value)}
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col"
          >
            <label className="text-sm mb-1 text-gray-600">من تاريخ</label>
            <DatePicker 
              style={{ width: '100%' }}
              locale={arEG}
              placeholder="اختر التاريخ"
              value={dateFrom}
              onChange={setDateFrom}
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col"
          >
            <label className="text-sm mb-1 text-gray-600">إلى تاريخ</label>
            <DatePicker 
              style={{ width: '100%' }}
              locale={arEG}
              placeholder="اختر التاريخ"
              value={dateTo}
              onChange={setDateTo}
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col"
          >
            <label className="text-sm mb-1 text-gray-600">الفرع</label>
            <Select
              style={{ width: '100%' }}
              placeholder="اختر الفرع"
              value={branchId || undefined}
              onChange={value => setBranchId(value)}
              loading={branchesLoading}
              allowClear
            >
              <Option value="">جميع الفروع</Option>
              {branches.map(branch => (
                <Option key={branch.id} value={branch.id}>{branch.name}</Option>
              ))}
            </Select>
          </motion.div>
        </div>

        <AnimatePresence>
          {showMore && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  className="flex flex-col"
                >
                  <label className="text-sm mb-1 text-gray-600">العميل</label>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="اختر العميل"
                    value={customerId || undefined}
                    onChange={value => setCustomerId(value)}
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    <Option value="">جميع العملاء</Option>
                    {customers.map(customer => (
                      <Option key={customer.id} value={customer.id}>{customer.name}</Option>
                    ))}
                  </Select>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col"
                >
                  <label className="text-sm mb-1 text-gray-600">المخزن</label>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="اختر المخزن"
                    value={warehouseId || undefined}
                    onChange={value => setWarehouseId(value)}
                    allowClear
                  >
                    <Option value="">جميع المخازن</Option>
                    {warehouses.map(warehouse => (
                      <Option key={warehouse.id} value={warehouse.id}>{warehouse.name}</Option>
                    ))}
                  </Select>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col"
                >
                  <label className="text-sm mb-1 text-gray-600">الصنف</label>
                  {/* مؤشر التشخيص */}
                  <div className="text-xs text-gray-500 mb-1">
                    التحميل: {itemsLoading ? 'جاري...' : 'مكتمل'} | الأصناف: {items.length}
                  </div>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="اختر الصنف"
                    value={itemId || undefined}
                    onChange={value => setItemId(value)}
                    allowClear
                    showSearch
                    loading={itemsLoading}
                    filterOption={(input, option) =>
                      String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                    }
                    notFoundContent={itemsLoading ? "جاري تحميل الأصناف..." : "لا توجد أصناف متاحة"}
                    onDropdownVisibleChange={(open) => {
                      if (open) {
                        console.log('فتح دروب داون الأصناف');
                        console.log('حالة التحميل:', itemsLoading);
                        console.log('عدد الأصناف:', items.length);
                        console.log('الأصناف الحالية:', items);
                      }
                    }}
                  >
                    <Option value="">جميع الأصناف</Option>
                    {items.map(item => {
                      console.log('إنشاء خيار للصنف:', item);
                      return (
                        <Option key={item.id} value={item.itemNumber}>
                          {item.name}{item.itemNumber !== item.name ? ` - ${item.itemNumber}` : ''}
                        </Option>
                      );
                    })}
                  </Select>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col"
                >
                  <label className="text-sm mb-1 text-gray-600">الفئة</label>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="اختر الفئة"
                    value={categoryId || undefined}
                    onChange={value => setCategoryId(value)}
                    allowClear
                  >
                    <Option value="">جميع الفئات</Option>
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>{category.name}</Option>
                    ))}
                  </Select>
                </motion.div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col"
                >
                  <label className="text-sm mb-1 text-gray-600">المورد</label>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="اختر المورد"
                    value={supplierId || undefined}
                    onChange={value => setSupplierId(value)}
                    allowClear
                  >
                    <Option value="">جميع الموردين</Option>
                    {suppliers.map(supplier => (
                      <Option key={supplier.id} value={supplier.id}>{supplier.name}</Option>
                    ))}
                  </Select>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4 mt-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearch}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                </svg>
                جاري البحث...
              </>
            ) : "بحث"}
          </motion.button>
          <span className="text-gray-500 text-sm">نتائج البحث: {filteredItems.length}</span>
        </div>

        {/* More Options Toggle */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="absolute left-4 top-4 flex items-center gap-2 cursor-pointer text-blue-600 select-none"
          onClick={() => setShowMore((prev) => !prev)}
        >
          <span className="text-sm font-medium">{showMore ? "إخفاء الخيارات الإضافية" : "عرض خيارات أكثر"}</span>
          <motion.svg
            animate={{ rotate: showMore ? 180 : 0 }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-4 h-4 transition-transform"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </motion.svg>
        </motion.div>
      </motion.div>

      {/* Search Results */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="w-full bg-white p-4 rounded-lg border border-blue-100 flex flex-col gap-4 shadow-sm"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="border-r-4 border-blue-500 pr-4 mr-4 h-10 flex items-center">
            <span className="text-lg font-semibold text-gray-700">نتائج البحث</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors flex items-center gap-1"
              onClick={handleExport}
              disabled={filteredItems.length === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              تصدير
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              طباعة
            </motion.button>
          </div>
        </div>

        {/* جدول النتائج باستخدام Ant Design Table */}
        <div className="mt-4">
          <Table
            dataSource={filteredItems}
            bordered
            columns={[
              {
                title: 'رقم الصنف',
                dataIndex: 'itemNumber',
                key: 'itemNumber',
                align: 'center',
              },
              {
                title: 'اسم الصنف',
                dataIndex: 'itemName',
                key: 'itemName',
                align: 'center',
              },
              {
                title: 'الفئة',
                dataIndex: 'category',
                key: 'category',
                align: 'center',
              },
              {
                title: 'الوحدة',
                dataIndex: 'unit',
                key: 'unit',
                align: 'center',
              },
              {
                title: 'سعر البيع',
                dataIndex: 'salePrice',
                key: 'salePrice',
                align: 'center',
                render: (value: number) => `${value.toFixed(2)} ريال`,
              },
              {
                title: 'الكمية المباعة',
                dataIndex: 'quantity',
                key: 'quantity',
                align: 'center',
              },
            ]}
            rowKey="key"
            locale={{ emptyText: 'لا توجد بيانات للعرض' }}
            pagination={{ pageSize: 20, showSizeChanger: true }}
            components={{
              header: {
                wrapper: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
                  <thead {...props} className="bg-blue-600 text-white" />
                ),
              },
            }}
          />
        </div>

        {/* Summary */}
        {/* تم حذف ملخص إجمالي الكمية وعدد الأصناف حسب طلب المستخدم */}
      </motion.div>

      {/* Charts Section */}
      {chartData.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="w-full bg-white p-4 rounded-lg border border-blue-100 flex flex-col gap-4 shadow-sm"
        >
          <div className="border-r-4 border-blue-500 pr-4 mr-4 h-10 flex items-center">
            <span className="text-lg font-semibold text-gray-700">الرسوم البيانية</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">أكثر الأصناف مبيعاً (حسب الكمية)</h3>
              <ResponsiveContainer width="100%" height={450}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" />
<XAxis 
  dataKey="itemName" 
  tick={({ x, y, payload }) => {
    return (
      <text
        x={x}
        y={y + 10}
        textAnchor="end"
        fill="#555"
        fontSize={10}
        transform={`rotate(-35, ${x}, ${y})`}
      >
        {payload.value.length > 10 ? payload.value.substring(0, 10) + "..." : payload.value}
      </text>
    );
  }}
  height={100}
  interval={0}
/>

                  <Tooltip 
                    formatter={(value, name) => [value, name === 'totalQuantity' ? 'الكمية' : 'المبلغ']}
                    labelFormatter={(label) => `الصنف: ${label}`}
                  />
                  <Legend 
                    formatter={(value) => value === 'totalQuantity' ? 'الكمية' : 'المبلغ'}
                  />
                  <Bar dataKey="totalQuantity" fill="#8884d8" name="totalQuantity" />
                </BarChart>
              </ResponsiveContainer>
            </div>


          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SoldItems;
