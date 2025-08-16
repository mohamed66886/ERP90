import React, { useState, useEffect, useCallback } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import { motion } from 'framer-motion';
import { Table, Select, DatePicker, Button, Typography, Card, Row, Col, Statistic } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { BarChartOutlined, TableOutlined, PrinterOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useFinancialYear } from '@/hooks/useFinancialYear';
import { fetchBranches, Branch } from '@/lib/branches';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Helmet } from "react-helmet";

const { Option } = Select;
const { Title } = Typography;

interface BranchSalesRecord {
  key: string;
  branchId: string;
  branchName: string;
  totalSales: number;
  totalDiscount: number;
  totalTax: number;
  salesCost: number;
  profitLoss: number;
  netTotal: number;
  invoiceCount: number;
}

interface ChartDataItem {
  branchName: string;
  totalSales: number;
  profitLoss: number;
}

interface InvoiceItem {
  itemNumber: string;
  quantity: string;
  price: string;
  discountValue: string;
  taxValue: string;
}

const BranchSales: React.FC = () => {
  const [showMore, setShowMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  
  // خيارات البحث
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [invoiceType, setInvoiceType] = useState<string>("all"); // all, sales or returns

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

  // بيانات التقرير
  const [branchSales, setBranchSales] = useState<BranchSalesRecord[]>([]);
  const [filteredSales, setFilteredSales] = useState<BranchSalesRecord[]>([]);

  // بيانات الرسم البياني
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  // إحصائيات إجمالية
  const [totalStats, setTotalStats] = useState({
    totalSales: 0,
    totalDiscount: 0,
    totalTax: 0,
    totalCost: 0,
    totalProfit: 0,
    totalNet: 0
  });

  useEffect(() => {
    fetchBranches().then(data => {
      setBranches(data);
      setBranchesLoading(false);
    });
  }, []);

  // جلب بيانات مبيعات الفروع من Firebase
  const fetchBranchSalesData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { getDocs, collection, query, where } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      // تحديد المجموعات بناءً على نوع الفاتورة
      let invoiceCollections: string[] = [];
      if (invoiceType === 'all') {
        invoiceCollections = ['sales_invoices', 'sales_returns'];
      } else if (invoiceType === 'returns') {
        invoiceCollections = ['sales_returns'];
      } else {
        invoiceCollections = ['sales_invoices'];
      }

      let allDocs: Array<import('firebase/firestore').QueryDocumentSnapshot> = [];
      for (const collectionName of invoiceCollections) {
        const baseQuery = collection(db, collectionName);
        const constraints = [];
        if (dateFrom) constraints.push(where('date', '>=', dayjs(dateFrom).format('YYYY-MM-DD')));
        if (dateTo) constraints.push(where('date', '<=', dayjs(dateTo).format('YYYY-MM-DD')));
        const finalQuery = constraints.length > 0 ? query(baseQuery, ...constraints) : baseQuery;
        const snapshot = await getDocs(finalQuery);
        allDocs = allDocs.concat(snapshot.docs);
      }
      const branchSalesMap: { [key: string]: BranchSalesRecord } = {};
      
      // للتشخيص: طباعة معرفات الفروع الموجودة في البيانات
      const foundBranchIds = new Set<string>();
      
      // جلب بيانات الأصناف للحصول على أسعار الشراء
      const itemsSnapshot = await getDocs(collection(db, 'items'));
      const itemCosts: { [key: string]: number } = {};
      
      itemsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        itemCosts[doc.id] = data.purchasePrice || data.cost || 0;
      });
      
      for (const docSnapshot of allDocs) {
        const invoiceData = docSnapshot.data();
        const invoiceBranchId = invoiceData.branch;
        
        if (!invoiceBranchId) continue;
        
        // إضافة معرف الفرع إلى مجموعة الفروع الموجودة
        foundBranchIds.add(invoiceBranchId);
        
        // تطبيق فلترة الفروع المحددة هنا بدلاً من في الاستعلام
        if (branchIds.length > 0 && !branchIds.includes(invoiceBranchId)) {
          continue;
        }
        
        // الحصول على اسم الفرع
        const branch = branches.find(b => b.id === invoiceBranchId);
        const branchName = branch?.name || invoiceBranchId;
        
        // إنشاء سجل جديد إذا لم يكن موجوداً
        if (!branchSalesMap[invoiceBranchId]) {
          branchSalesMap[invoiceBranchId] = {
            key: invoiceBranchId,
            branchId: invoiceBranchId,
            branchName,
            totalSales: 0,
            totalDiscount: 0,
            totalTax: 0,
            salesCost: 0,
            profitLoss: 0,
            netTotal: 0,
            invoiceCount: 0
          };
        }
        
        // حساب إجماليات الفاتورة
        const items = invoiceData.items || [];
        let invoiceSales = 0;
        let invoiceDiscount = 0;
        let invoiceTax = 0;
        let invoiceCost = 0;
        
        items.forEach((item: InvoiceItem) => {
          const quantity = parseFloat(item.quantity) || 0;
          const price = parseFloat(item.price) || 0;
          const discountValue = parseFloat(item.discountValue) || 0;
          const taxValue = parseFloat(item.taxValue) || 0;
          
          // البحث عن تكلفة الصنف
          const itemCost = itemCosts[item.itemNumber] || 0;
          
          invoiceSales += quantity * price;
          invoiceDiscount += discountValue;
          invoiceTax += taxValue;
          invoiceCost += quantity * itemCost;
        });
        
        // الخصم الإضافي على مستوى الفاتورة
        const extraDiscount = parseFloat(invoiceData.extraDiscount) || 0;
        invoiceDiscount += extraDiscount;
        
        // إضافة البيانات إلى إجماليات الفرع
        branchSalesMap[invoiceBranchId].totalSales += invoiceSales;
        branchSalesMap[invoiceBranchId].totalDiscount += invoiceDiscount;
        branchSalesMap[invoiceBranchId].totalTax += invoiceTax;
        branchSalesMap[invoiceBranchId].salesCost += invoiceCost;
        branchSalesMap[invoiceBranchId].invoiceCount += 1;
      }
      
      // للتشخيص: طباعة معرفات الفروع الموجودة
      console.log('معرفات الفروع الموجودة في البيانات:', Array.from(foundBranchIds));
      console.log('معرفات الفروع المحددة:', branchIds);
      console.log('عدد الفواتير المسترجعة:', allDocs.length);
      
      // حساب الربح/الخسارة والصافي لكل فرع
      Object.values(branchSalesMap).forEach(branch => {
        branch.profitLoss = branch.totalSales - branch.totalDiscount - branch.salesCost;
        branch.netTotal = branch.totalSales - branch.totalDiscount - branch.totalTax;
      });
      
      const records = Object.values(branchSalesMap);
      setBranchSales(records);
      setFilteredSales(records);
      
      // حساب الإحصائيات الإجمالية
      const stats = records.reduce(
        (acc, branch) => ({
          totalSales: acc.totalSales + branch.totalSales,
          totalDiscount: acc.totalDiscount + branch.totalDiscount,
          totalTax: acc.totalTax + branch.totalTax,
          totalCost: acc.totalCost + branch.salesCost,
          totalProfit: acc.totalProfit + branch.profitLoss,
          totalNet: acc.totalNet + branch.netTotal
        }),
        { totalSales: 0, totalDiscount: 0, totalTax: 0, totalCost: 0, totalProfit: 0, totalNet: 0 }
      );
      setTotalStats(stats);
      
      // إعداد بيانات الرسم البياني
      const chartData: ChartDataItem[] = records.map(branch => ({
        branchName: branch.branchName,
        totalSales: branch.totalSales,
        profitLoss: branch.profitLoss
      }));
      
      // ترتيب البيانات حسب المبيعات
      const sortedData = chartData.sort((a, b) => b.totalSales - a.totalSales);
      setChartData(sortedData);
      
    } catch (err) {
      console.error('خطأ في جلب بيانات مبيعات الفروع:', err);
      setBranchSales([]);
      setFilteredSales([]);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  }, [branchIds, invoiceType, dateFrom, dateTo, branches]);

  // تشغيل البحث تلقائياً عند تحميل الصفحة أو تغيير المعايير
  useEffect(() => {
    if (!branchesLoading && branches.length >= 0) {
      fetchBranchSalesData();
    }
  }, [branchesLoading, branches.length, fetchBranchSalesData]);

  // عند الضغط على بحث
  const handleSearch = () => {
    fetchBranchSalesData();
  };

  // دالة تصدير البيانات إلى ملف Excel
  const handleExport = async () => {
    // تحميل exceljs من CDN إذا لم يكن موجوداً في window
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ExcelJS = (window as any).ExcelJS;
    if (!ExcelJS) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ExcelJS = (window as any).ExcelJS;
    }

    const exportData = filteredSales.map(branch => [
      branch.branchName,
      branch.totalSales.toFixed(2),
      branch.totalDiscount.toFixed(2),
      branch.totalTax.toFixed(2),
      branch.netTotal.toFixed(2),
      branch.invoiceCount
    ]);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('تقرير مبيعات الفروع');

    // إعداد الأعمدة
    sheet.columns = [
      { header: 'الفرع', key: 'branchName', width: 20 },
      { header: 'إجمالي المبيعات', key: 'totalSales', width: 15 },
      { header: 'إجمالي الخصم', key: 'totalDiscount', width: 15 },
      { header: 'إجمالي الضريبة', key: 'totalTax', width: 15 },
      { header: 'الصافي', key: 'netTotal', width: 15 },
      { header: 'عدد الفواتير', key: 'invoiceCount', width: 12 }
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
          top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
          bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
          left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
          right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        };
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
    a.download = `تقرير_مبيعات_الفروع_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  // ألوان الرسم البياني
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#387908', '#00ff00'];

  // أعمدة الجدول
  const columns = [
    {
      title: 'الفرع',
      dataIndex: 'branchName',
      key: 'branchName',
      width: 150,
    },
    {
      title: 'إجمالي المبيعات',
      dataIndex: 'totalSales',
      key: 'totalSales',
      width: 120,
      render: (value: number) => `${value.toFixed(2)} ر.س`,
      sorter: (a: BranchSalesRecord, b: BranchSalesRecord) => a.totalSales - b.totalSales,
    },
    {
      title: 'إجمالي الخصم',
      dataIndex: 'totalDiscount',
      key: 'totalDiscount',
      width: 120,
      render: (value: number) => `${value.toFixed(2)} ر.س`,
      sorter: (a: BranchSalesRecord, b: BranchSalesRecord) => a.totalDiscount - b.totalDiscount,
    },
    {
      title: 'إجمالي الضريبة',
      dataIndex: 'totalTax',
      key: 'totalTax',
      width: 120,
      render: (value: number) => `${value.toFixed(2)} ر.س`,
      sorter: (a: BranchSalesRecord, b: BranchSalesRecord) => a.totalTax - b.totalTax,
    },
    {
      title: 'الصافي',
      dataIndex: 'netTotal',
      key: 'netTotal',
      width: 120,
      render: (value: number) => `${value.toFixed(2)} ر.س`,
      sorter: (a: BranchSalesRecord, b: BranchSalesRecord) => a.netTotal - b.netTotal,
    },
    {
      title: 'عدد الفواتير',
      dataIndex: 'invoiceCount',
      key: 'invoiceCount',
      width: 100,
      sorter: (a: BranchSalesRecord, b: BranchSalesRecord) => a.invoiceCount - b.invoiceCount,
    },
  ];

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
    <div className="p-2 sm:p-4 space-y-6 font-['Tajawal'] bg-gray-50 min-h-screen w-full max-w-full">
      <Helmet>
        <title>تقرير مبيعات الفروع | ERP90 Dashboard</title>
        <meta name="description" content="تقرير فواتير المبيعات، عرض وطباعة فواتير العملاء، ERP90 Dashboard" />
        <meta name="keywords" content="ERP, فواتير, مبيعات, تقرير, عملاء, ضريبة, طباعة, Sales, Invoice, Report, Tax, Customer" />
      </Helmet>
     <div className="p-2 sm:p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden w-full max-w-full">
        <div className="flex items-center">
          <BarChartOutlined className="h-8 w-8 text-green-600 ml-3" />
          <h1 className="text-2xl font-bold text-gray-800"> تقرير مبيعات الفروع</h1>
        </div>
        <p className="text-gray-600 mt-2">عرض وإدارة تقرير مبيعات الفروع</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
      </div>
      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "إدارة المبيعات", to: "/management/sales" },
          { label: "تقرير مبيعات الفروع" }
        ]}
      />

      {/* Search Options */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-white p-2 sm:p-4 rounded-lg border border-blue-100 flex flex-col gap-4 shadow-sm relative"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        
        <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <SearchOutlined className="text-blue-600 text-lg" /> خيارات البحث
        </h3>
        
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">الفرع</label>
            <Select
              mode="multiple"
              value={branchIds}
              onChange={setBranchIds}
              placeholder="اختر الفروع"
              className="w-full"
              allowClear
              loading={branchesLoading}
              showSearch
              filterOption={(input, option) =>
                option?.label?.toString().toLowerCase().includes(input.toLowerCase()) ||
                option?.children?.toString().toLowerCase().includes(input.toLowerCase())
              }
              dropdownRender={(menu) => (
                <div>
                  <div className="p-2 border-b border-gray-200">
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        if (branchIds.length === branches.length) {
                          setBranchIds([]);
                        } else {
                          setBranchIds(branches.map(branch => branch.id));
                        }
                      }}
                      className="text-blue-600 p-0"
                    >
                      {branchIds.length === branches.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                    </Button>
                  </div>
                  {menu}
                </div>
              )}
            >
              {branches.map(branch => (
                <Option key={branch.id} value={branch.id}>
                  {branch.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">نوع الفاتورة</label>
            <Select
              value={invoiceType}
              onChange={setInvoiceType}
              className="w-full"
            >
              <Option value="sales">فواتير المبيعات</Option>
              <Option value="returns">مردودات المبيعات</Option>
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">من تاريخ</label>
            <DatePicker
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="اختر التاريخ"
              className="w-full"
              format="YYYY-MM-DD"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">إلى تاريخ</label>
            <DatePicker
              value={dateTo}
              onChange={setDateTo}
              placeholder="اختر التاريخ"
              className="w-full"
              format="YYYY-MM-DD"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-wrap w-full">
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={isLoading}
            className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
          >
            بحث
          </Button>




        </div>

        {/* تم حذف الخيارات المتقدمة */}
      </motion.div>

      {/* تم حذف كروت الإحصائيات الإجمالية بناءً على طلب المستخدم */}

      {/* Search Results */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="w-full bg-white p-2 sm:p-4 rounded-lg border border-blue-100 flex flex-col gap-4 shadow-sm overflow-x-auto"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
        
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <TableOutlined className="text-blue-600 text-lg" /> نتائج البحث
            {branchIds.length > 0 && (
              <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                ({branchIds.length} فرع محدد)
              </span>
            )}
            {isLoading && (
              <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded animate-pulse">
                جاري البحث...
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            إجمالي: {filteredSales.length} فرع
            {filteredSales.length > 0 && (
              <>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                  className="bg-green-600 hover:bg-green-700 border-green-600 text-white ml-2 px-5 py-2 text-base font-bold"
                  size="middle"
                >
                  تصدير Excel
                </Button>
                <Button
                  icon={<PrinterOutlined style={{ fontSize: 18, color: '#2563eb' }} />}
                  onClick={() => window.print()}
                  className="bg-blue-100 hover:bg-blue-200 border-blue-200 text-blue-700 ml-2 px-5 py-2 text-base font-bold"
                  size="middle"
                  style={{ boxShadow: 'none' }}
                >
                  طباعة
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            dataSource={filteredSales}
            loading={isLoading}
            size="small"
            scroll={{ x: 800 }}
            pagination={{
              total: filteredSales.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} من ${total} فرع`,
            }}
            locale={{
              emptyText: branchIds.length > 0 
                ? `لا توجد بيانات للفروع المحددة في الفترة المحددة`
                : 'لا توجد بيانات مبيعات في الفترة المحددة',
              filterConfirm: 'موافق',
              filterReset: 'إعادة تعيين',
              selectAll: 'تحديد الكل',
              selectInvert: 'عكس التحديد',
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
          className="w-full bg-white p-2 sm:p-4 rounded-lg border border-blue-100 flex flex-col gap-4 shadow-sm overflow-x-auto"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <BarChartOutlined className="text-purple-600 text-lg" /> الرسوم البيانية
          </h3>

          <div className="w-full overflow-x-auto">
            {/* Bar Chart */}
            <div className="bg-gray-50 p-2 sm:p-4 rounded-lg w-full min-w-[320px]">
              <Title level={5} className="text-center mb-4">مبيعات الفروع</Title>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="branchName" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)} ر.س`, 'مبيعات الفرع']}
                  />
                  <Bar dataKey="totalSales" fill="#8884d8" name="مبيعات الفرع" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BranchSales;
