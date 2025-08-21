import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker, Input, Select, Table, Button } from "antd";
import { SearchOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import arEG from 'antd/es/date-picker/locale/ar_EG';
import { fetchBranches, Branch } from "@/lib/branches";
import Breadcrumb from "@/components/Breadcrumb";
import dayjs, { Dayjs } from 'dayjs';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { useFinancialYear } from "@/hooks/useFinancialYear";
import { BarChartOutlined, TableOutlined, PrinterOutlined } from '@ant-design/icons';
import { Helmet } from "react-helmet";
import styles from './ReceiptVoucher.module.css';

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
  
  // ستايل موحد لعناصر الإدخال والدروب داون مثل صفحة أمر البيع
  const largeControlStyle = {
    height: 48,
    fontSize: 18,
    borderRadius: 8,
    padding: '8px 16px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
    background: '#fff',
    border: '1.5px solid #d9d9d9',
    transition: 'border-color 0.3s',
  };
  const labelStyle = { fontSize: 18, fontWeight: 500, marginBottom: 2, display: 'block' };

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
          return {
            id: doc.id,
            name: data.name || data.customerName || doc.id
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
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const snap = await getDocs(collection(db, 'items'));
        const options = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || data.itemName || doc.id,
            itemNumber: data.itemNumber || data.number || doc.id
          };
        });
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
          return {
            id: doc.id,
            name: data.name || data.categoryName || doc.id
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
          return {
            id: doc.id,
            name: data.name || data.supplierName || doc.id
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
            const customerMatch = data.customerId === customerId || 
                                data.customerName === customerId || 
                                data.customer === customerId;
            if (!customerMatch) includeItem = false;
          }
          if (itemId && (item.itemNumber as string) !== itemId) includeItem = false;
          if (categoryId && (item.mainCategory as string) !== categoryId) includeItem = false;
          if (supplierId && (item.supplier as string) !== supplierId) includeItem = false;
          
          if (includeItem) {
            const record: SoldItemRecord = {
              key: `${docSnapshot.id}-${item.itemNumber}-${Math.random()}`,
              itemNumber: item.itemNumber || '',
              itemName: item.itemName || '',
              category: item.mainCategory || '',
              unit: item.unit || '',
              salePrice: parseFloat(item.price) || 0,
              quantity: parseFloat(item.quantity) || 0,
              totalAmount: (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0),
              invoiceNumber,
              date,
              branch,
              customer,
              warehouse,
              supplier: item.supplier || ''
            };
            records.push(record);
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
    <>
      <Helmet>
        <title>تقرير الأصناف المباعة | ERP90 Dashboard</title>
        <meta name="description" content="تقرير الأصناف المباعة، عرض وإدارة الأصناف المباعة، ERP90 Dashboard" />
        <meta name="keywords" content="ERP, أصناف, مبيعات, تقرير, عملاء, مخازن, Sales, Items, Report" />
      </Helmet>
      <div className="w-full min-h-screen p-4 md:p-6 flex flex-col gap-6 bg-gray-50" dir="rtl">
 
        {/* العنوان الرئيسي */}
        <div className="p-3 sm:p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
          <div className="flex items-center">
            <BarChartOutlined className="h-5 w-5 sm:h-8 sm:w-8 text-emerald-600 ml-1 sm:ml-3" />
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800">تقرير الأصناف المباعة</h1>
          </div>
          <p className="text-xs sm:text-base text-gray-600 mt-2">عرض وإدارة تقرير الأصناف المباعة</p>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500"></div>
        </div>

      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "إدارة المبيعات", to: "/management/sales" },
          { label: "تقرير الأصناف المباعة" }
        ]}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-white p-2 sm:p-4 rounded-lg border border-emerald-100 flex flex-col gap-4 shadow-sm relative"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-500"></div>
        
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <SearchOutlined className="text-emerald-600" /> خيارات البحث
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span style={labelStyle}>من تاريخ</span>
            <DatePicker 
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="اختر التاريخ"
              style={largeControlStyle}
              size="large"
              format="YYYY-MM-DD"
              locale={arEG}
            />
          </div>
          
          <div className="flex flex-col">
            <span style={labelStyle}>إلى تاريخ</span>
            <DatePicker 
              value={dateTo}
              onChange={setDateTo}
              placeholder="اختر التاريخ"
              style={largeControlStyle}
              size="large"
              format="YYYY-MM-DD"
              locale={arEG}
            />
          </div>
          
          <div className="flex flex-col">
            <span style={labelStyle}>رقم الفاتورة</span>
            <Input 
              value={invoiceNumber}
              onChange={e => setInvoiceNumber(e.target.value)}
              placeholder="ادخل رقم الفاتورة"
              style={largeControlStyle}
              size="large"
              allowClear
            />
          </div>
          
          <div className="flex flex-col">
            <span style={labelStyle}>الفرع</span>
            <Select
              value={branchId}
              onChange={setBranchId}
              placeholder="اختر الفرع"
              style={{ width: '100%', ...largeControlStyle }}
              size="large"
              className={styles.noAntBorder}
              optionFilterProp="label"
              allowClear
              showSearch
              loading={branchesLoading}
              filterOption={(input, option) =>
                option?.children?.toString().toLowerCase().includes(input.toLowerCase())
              }
            >
              {branches.map(branch => (
                <Option key={branch.id} value={branch.id}>
                  {branch.name}
                </Option>
              ))}
            </Select>
          </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                <div className="flex flex-col">
                  <span style={labelStyle}>العميل</span>
                  <Select
                    value={customerId || undefined}
                    onChange={setCustomerId}
                    placeholder="اختر العميل"
                    style={{ width: '100%', ...largeControlStyle }}
                    size="large"
                    className={styles.noAntBorder}
                    optionFilterProp="label"
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      option?.children?.toString().toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    <Option value="">جميع العملاء</Option>
                    {customers.map(customer => (
                      <Option key={customer.id} value={customer.id}>{customer.name}</Option>
                    ))}
                  </Select>
                </div>
                
                <div className="flex flex-col">
                  <span style={labelStyle}>المخزن</span>
                  <Select
                    value={warehouseId || undefined}
                    onChange={setWarehouseId}
                    placeholder="اختر المخزن"
                    style={{ width: '100%', ...largeControlStyle }}
                    size="large"
                    className={styles.noAntBorder}
                    optionFilterProp="label"
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      option?.children?.toString().toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    <Option value="">جميع المخازن</Option>
                    {warehouses.map(warehouse => (
                      <Option key={warehouse.id} value={warehouse.id}>{warehouse.name}</Option>
                    ))}
                  </Select>
                </div>
                
                <div className="flex flex-col">
                  <span style={labelStyle}>الصنف</span>
                  {itemsLoading && (
                    <div className="text-xs text-gray-500 mb-1">
                      التحميل: {itemsLoading ? "جاري التحميل..." : "مكتمل"} | الأصناف: {items.length}
                    </div>
                  )}
                  <Select
                    value={itemId || undefined}
                    onChange={setItemId}
                    placeholder="اختر الصنف"
                    style={{ width: '100%', ...largeControlStyle }}
                    size="large"
                    className={styles.noAntBorder}
                    optionFilterProp="label"
                    allowClear
                    showSearch
                    loading={itemsLoading}
                    filterOption={(input, option) =>
                      String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                    }
                    notFoundContent={itemsLoading ? "جاري تحميل الأصناف..." : "لا توجد أصناف متاحة"}
                    onDropdownVisibleChange={(open) => {
                      if (open && items.length === 0 && !itemsLoading) {
                        console.log('إعادة محاولة تحميل الأصناف عند فتح القائمة');
                      }
                    }}
                  >
                    <Option value="">جميع الأصناف</Option>
                    {items.map(item => (
                      <Option key={item.id} value={item.itemNumber}>{item.name} - {item.itemNumber}</Option>
                    ))}
                  </Select>
                </div>
                
                <div className="flex flex-col">
                  <span style={labelStyle}>الفئة</span>
                  <Select
                    value={categoryId || undefined}
                    onChange={setCategoryId}
                    placeholder="اختر الفئة"
                    style={{ width: '100%', ...largeControlStyle }}
                    size="large"
                    className={styles.noAntBorder}
                    optionFilterProp="label"
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      option?.children?.toString().toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    <Option value="">جميع الفئات</Option>
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>{category.name}</Option>
                    ))}
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                <div className="flex flex-col">
                  <span style={labelStyle}>المورد</span>
                  <Select
                    value={supplierId || undefined}
                    onChange={setSupplierId}
                    placeholder="اختر المورد"
                    style={{ width: '100%', ...largeControlStyle }}
                    size="large"
                    className={styles.noAntBorder}
                    optionFilterProp="label"
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      option?.children?.toString().toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    <Option value="">جميع الموردين</Option>
                    {suppliers.map(supplier => (
                      <Option key={supplier.id} value={supplier.id}>{supplier.name}</Option>
                    ))}
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex items-center gap-4 mt-4">
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={isLoading}
            className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
            size="large"
          >
            {isLoading ? "جاري البحث..." : "بحث"}
          </Button>
          <span className="text-gray-500 text-sm">نتائج البحث: {filteredItems.length}</span>
        </div>
        
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

      {/* نتائج البحث */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="w-full bg-white p-2 sm:p-4 rounded-lg border border-emerald-100 flex flex-col gap-4 shadow-sm overflow-x-auto relative"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-500"></div>
        
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            نتائج البحث ({filteredItems.length} صنف)
          </h3>
          <div className="flex items-center gap-2">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              disabled={filteredItems.length === 0}
              className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
              size="large"
            >
              تصدير Excel
            </Button>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
              size="large"
            >
              طباعة
            </Button>
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
      </motion.div>

      {/* Charts Section */}
      {chartData.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="w-full bg-white p-2 sm:p-4 rounded-lg border border-emerald-100 flex flex-col gap-4 shadow-sm relative"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-500"></div>
          
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            الرسوم البيانية
          </h3>

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
                  <YAxis />
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
    </>
  );
};

export default SoldItems;
