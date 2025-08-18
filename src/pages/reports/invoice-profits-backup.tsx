import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker, Input, Select, Button, Table, Pagination } from "antd";
import { SearchOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import arEG from 'antd/es/date-picker/locale/ar_EG';
import { fetchBranches, Branch } from "@/lib/branches";
import Breadcrumb from "@/components/Breadcrumb";
import dayjs from 'dayjs';

const { Option } = Select;

interface WarehouseOption {
  id: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
}

interface PaymentMethodOption {
  id: string;
  name: string;
}

// أنواع بيانات الفاتورة (مأخوذة من صفحة المبيعات)
interface InvoiceRecord {
  key: string;
  invoiceNumber: string;
  date: string;
  branch: string;
  itemNumber: string;
  itemName: string;
  mainCategory: string;
  quantity: number;
  price: number;
  total: number;
  discountValue: number;
  discountPercent: number;
  taxValue: number;
  taxPercent: number;
  net: number;
  cost: number;
  profit: number;
  warehouse: string;
  customer: string;
  customerPhone: string;
  seller: string;
  paymentMethod: string;
  invoiceType: string;
  isReturn: boolean;
  extraDiscount?: number;
  itemData?: any;
}

import dayjs from 'dayjs';

const InvoiceProfits: React.FC = () => {
  const [showMore, setShowMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branchId, setBranchId] = useState<string>("");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [seller, setSeller] = useState<string>("");
  const [salesRepAccounts, setSalesRepAccounts] = useState<{ id: string; name: string; number: string; mobile?: string }[]>([]);

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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(30); // عدد الصفوف في كل صفحة
  // جلب طرق الدفع من قاعدة البيانات
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const snap = await getDocs(collection(db, 'paymentMethods'));
        const options = snap.docs.map(doc => ({ id: doc.id, name: doc.data().name || doc.id }));
        setPaymentMethods(options);
      } catch {
        setPaymentMethods([]);
      }
    };
    fetchPaymentMethods();
  }, []);

  // جلب المخازن من قاعدة البيانات
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const snap = await getDocs(collection(db, 'warehouses'));
        const options = snap.docs.map(doc => ({ 
          id: doc.id, 
          name: doc.data().name || doc.id,
          nameAr: doc.data().nameAr,
          nameEn: doc.data().nameEn
        }));
        setWarehouses(options);
      } catch {
        setWarehouses([]);
      }
    };
    fetchWarehouses();
  }, []);

  // جلب بيانات مندوبي المبيعات
  useEffect(() => {
    const fetchSalesReps = async () => {
      try {
        const { getDocs, collection, query, where } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        // جلب من مجموعة accounts مع فلتر classification
        const accountsQuery = query(
          collection(db, 'accounts'),
          where('classification', '==', 'مندوب مبيعات')
        );
        const accountsSnap = await getDocs(accountsQuery);
        const accountsReps = accountsSnap.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || doc.id,
          number: doc.data().number || '',
          mobile: doc.data().mobile || doc.data().phone || ''
        }));
        
        // جلب البائعين من الفواتير الموجودة
        const salesSnap = await getDocs(collection(db, 'sales_invoices'));
        const salesReps = Array.from(new Set(
          salesSnap.docs
            .map(doc => doc.data().delegate || doc.data().seller)
            .filter(seller => seller && seller.trim() !== '')
        )).map(seller => ({
          id: seller,
          name: seller,
          number: '',
          mobile: ''
        }));
        
        // دمج القوائم وإزالة المكرر
        const allReps = [...accountsReps, ...salesReps];
        const uniqueReps = allReps.filter((rep, index, self) => 
          index === self.findIndex(r => r.name === rep.name || r.id === rep.id)
        );
        
        setSalesRepAccounts(uniqueReps);
      } catch {
        setSalesRepAccounts([]);
      }
    };
    fetchSalesReps();
  }, []);

  // فلاتر البحث
  const [dateFrom, setDateFrom] = useState<any>(null);
  const [dateTo, setDateTo] = useState<any>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<string>(""); // ""=الكل, "فاتورة", "مرتجع"

  // بيانات الفواتير
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceRecord[]>([]);
  // إضافة حالة للفواتير المجمعة حسب رقم الفاتورة
  const [groupedInvoices, setGroupedInvoices] = useState<InvoiceRecord[]>([]);

  useEffect(() => {
    fetchBranches().then(data => {
      setBranches(data);
      setBranchesLoading(false);
    });
  }, []);

  // جلب الفواتير ومرتجعات المبيعات من Firebase
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const { getDocs, collection, query, where } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      // --- فواتير المبيعات ---
      let q = collection(db, 'sales_invoices');
      let filters: any[] = [];
      if (branchId) filters.push(where('branch', '==', branchId));
      if (invoiceNumber) filters.push(where('invoiceNumber', '==', invoiceNumber));
      if (dateFrom) filters.push(where('date', '>=', dayjs(dateFrom).format('YYYY-MM-DD')));
      if (dateTo) filters.push(where('date', '<=', dayjs(dateTo).format('YYYY-MM-DD')));
      if (warehouseId) filters.push(where('warehouse', '==', warehouseId));
      if (filters.length > 0) {
        const { query: qFn } = await import('firebase/firestore');
        q = qFn(q, ...filters);
      }
      const snapshot = await getDocs(q);
      let salesRecords: InvoiceRecord[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const invoiceNumber = data.invoiceNumber || '';
        const date = data.date || '';
        const branch = data.branch || '';
        const customer = data.customerName || data.customer || '';
        const customerPhone = data.customerPhone || '';
        const seller = data.delegate || data.seller || '';
        const paymentMethod = data.paymentMethod || '';
        const invoiceType = data.type || '';
        const items = Array.isArray(data.items) ? data.items : [];
        items.forEach((item: any, idx: number) => {
          const price = Number(item.price) || 0;
          const cost = Number(item.cost) || 0;
          const quantity = Number(item.quantity) || 0;
          const total = Number(item.total) || price * quantity;
          const discountValue = Number(item.discountValue) || 0;
          const discountPercent = Number(item.discountPercent) || 0;
          const taxValue = Number(item.taxValue) || 0;
          const taxPercent = Number(item.taxPercent) || 0;
          const net = Number(item.net) || (total - discountValue + taxValue);
          const profit = (price - cost) * quantity;
          salesRecords.push({
            key: doc.id + '-' + idx,
            invoiceNumber,
            date,
            branch,
            itemNumber: item.itemNumber || '',
            itemName: item.itemName || '',
            mainCategory: item.mainCategory || '',
            quantity,
            price,
            total,
            discountValue,
            discountPercent,
            taxValue,
            taxPercent,
            net,
            cost,
            profit,
            warehouse: item.warehouseId || data.warehouse || '',
            customer,
            customerPhone,
            seller,
            paymentMethod,
            invoiceType: invoiceType || 'فاتورة',
            isReturn: false,
            extraDiscount: item.extraDiscount,
            itemData: item
          });
        });
      });

      // --- مرتجعات المبيعات ---
      let qReturn = collection(db, 'sales_returns');
      let filtersReturn: any[] = [];
      if (branchId) filtersReturn.push(where('branch', '==', branchId));
      if (invoiceNumber) filtersReturn.push(where('invoiceNumber', '==', invoiceNumber));
      if (dateFrom) filtersReturn.push(where('date', '>=', dayjs(dateFrom).format('YYYY-MM-DD')));
      if (dateTo) filtersReturn.push(where('date', '<=', dayjs(dateTo).format('YYYY-MM-DD')));
      if (warehouseId) filtersReturn.push(where('warehouse', '==', warehouseId));
      if (filtersReturn.length > 0) {
        const { query: qFn } = await import('firebase/firestore');
        qReturn = qFn(qReturn, ...filtersReturn);
      }
      const snapshotReturn = await getDocs(qReturn);
      let returnRecords: InvoiceRecord[] = [];
      snapshotReturn.forEach(doc => {
        const data = doc.data();
        const invoiceNumber = data.invoiceNumber || '';
        const date = data.date || '';
        const branch = typeof doc.data().branch === 'string' ? doc.data().branch : '';
        const customer = data.customerName || data.customer || '';
        const customerPhone = data.customerPhone || '';
        const seller = data.seller || '';
        const paymentMethod = data.paymentMethod || '';
        const invoiceType = 'مرتجع';
        const items = Array.isArray(data.items) ? data.items : [];
        items.forEach((item: any, idx: number) => {
          const price = Number(item.price) || 0;
          const cost = Number(item.cost) || 0;
          const quantity = Number(item.returnedQty) || 0;
          const total = price * quantity;
          const discountPercent = Number(item.discountPercent) || 0;
          const discountValue = total * discountPercent / 100;
          const taxPercent = Number(item.taxPercent) || 0;
          const taxValue = (total - discountValue) * taxPercent / 100;
          const net = total - discountValue + taxValue;
          const profit = (price - cost) * quantity * -1;
          returnRecords.push({
            key: 'return-' + doc.id + '-' + idx,
            invoiceNumber,
            date,
            branch,
            itemNumber: item.itemNumber || '',
            itemName: item.itemName || '',
            mainCategory: '',
            quantity,
            price,
            total,
            discountValue,
            discountPercent,
            taxValue,
            taxPercent,
            net,
            cost,
            profit,
            warehouse: item.warehouseId || data.warehouse || '',
            customer,
            customerPhone,
            seller,
            paymentMethod,
            invoiceType,
            isReturn: true,
            extraDiscount: undefined,
            itemData: item
          });
        });
      });

      // تجميع المبيعات والمرتجعات لكل فاتورة
      const grouped: { [key: string]: { sales?: InvoiceRecord[]; returns?: InvoiceRecord[] } } = {};
      salesRecords.forEach(rec => {
        if (!grouped[rec.invoiceNumber]) grouped[rec.invoiceNumber] = {};
        if (!grouped[rec.invoiceNumber].sales) grouped[rec.invoiceNumber].sales = [];
        grouped[rec.invoiceNumber].sales!.push(rec);
      });
      returnRecords.forEach(rec => {
        if (!grouped[rec.invoiceNumber]) grouped[rec.invoiceNumber] = {};
        if (!grouped[rec.invoiceNumber].returns) grouped[rec.invoiceNumber].returns = [];
        grouped[rec.invoiceNumber].returns!.push(rec);
      });

      // بناء مصفوفة النتائج: صف للمبيعات وصف للمرتجع لكل فاتورة
      const result: InvoiceRecord[] = [];
      Object.entries(grouped).forEach(([invoiceNumber, { sales, returns }]) => {
        // فقط أضف صف المبيعات إذا كان هناك مبيعات حقيقية (وليس فقط وجود المفتاح)
        if (sales && sales.length > 0) {
          const first = sales[0];
          const total = sales.reduce((acc, r) => acc + r.total, 0);
          const discountValue = sales.reduce((acc, r) => acc + r.discountValue, 0);
          const cost = sales.reduce((acc, r) => acc + r.cost, 0);
          const taxValue = sales.reduce((acc, r) => acc + (r.taxValue || 0), 0);
          // تحقق أن الفاتورة تطابق كل الفلاتر المطلوبة
          let matches = true;
          if (invoiceNumber && first.invoiceNumber !== invoiceNumber) matches = false;
          if (branchId && first.branch !== branchId) matches = false;
          if (warehouseId && first.warehouse !== warehouseId) matches = false;
          if (paymentMethod && first.paymentMethod !== paymentMethod) matches = false;
          if (seller && first.seller !== seller) matches = false;
          if (matches) {
            result.push({
              ...first,
              total,
              discountValue,
              cost,
              taxValue,
              isReturn: false,
              invoiceType: 'فاتورة',
            });
          }
        }
        // فقط أضف صف المرتجع إذا كان هناك مرتجع حقيقي
        if (returns && returns.length > 0) {
          const first = returns[0];
          const total = returns.reduce((acc, r) => acc + r.total, 0);
          const discountValue = returns.reduce((acc, r) => acc + r.discountValue, 0);
          const cost = returns.reduce((acc, r) => acc + r.cost, 0);
          const taxValue = returns.reduce((acc, r) => acc + (r.taxValue || 0), 0);
          // تحقق أن الفاتورة تطابق كل الفلاتر المطلوبة
          let matches = true;
          if (invoiceNumber && first.invoiceNumber !== invoiceNumber) matches = false;
          if (branchId && first.branch !== branchId) matches = false;
          if (warehouseId && first.warehouse !== warehouseId) matches = false;
          if (paymentMethod && first.paymentMethod !== paymentMethod) matches = false;
          if (seller && first.seller !== seller) matches = false;
          if (matches) {
            result.push({
              ...first,
              total,
              discountValue,
              cost,
              taxValue,
              isReturn: true,
              invoiceType: 'مرتجع',
            });
          }
        }
      });
      setInvoices(result);
    } catch (err) {
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  // تطبيق الفلاتر بعد جلب البيانات - محسنة بـ useMemo
  const filteredRows = useMemo(() => {
    let filtered = invoices;
    
    // فلتر نوع الفاتورة
    if (invoiceTypeFilter) {
      if (invoiceTypeFilter === 'فاتورة') {
        filtered = filtered.filter(inv => !inv.isReturn);
      } else if (invoiceTypeFilter === 'مرتجع') {
        filtered = filtered.filter(inv => inv.isReturn);
      } else {
        filtered = filtered.filter(inv => inv.invoiceType === invoiceTypeFilter);
      }
    }
    
    // فلتر طريقة الدفع
    if (paymentMethod) {
      filtered = filtered.filter(inv => inv.paymentMethod === paymentMethod);
    }
    
    // فلتر البائع
    if (seller) {
      filtered = filtered.filter(inv => inv.seller === seller);
    }
    
    return filtered;
  }, [invoices, invoiceTypeFilter, paymentMethod, seller]);

  // دالة للحصول على البيانات المقسمة على صفحات - محسنة بـ useMemo
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredRows.slice(startIndex, endIndex);
  }, [filteredRows, currentPage, pageSize]);

  // حساب إجمالي عدد الصفحات - محسنة بـ useMemo
  const totalPages = useMemo(() => {
    return Math.ceil(filteredRows.length / pageSize);
  }, [filteredRows.length, pageSize]);

  // دالة للتوافق مع الكود القديم
  const getFilteredRows = () => filteredRows;
  const getPaginatedRows = () => paginatedRows;
  const getTotalPages = () => totalPages;

  // إعادة تعيين الصفحة الحالية إلى 1 عند تغيير الفلاتر
  useEffect(() => {
    setCurrentPage(1);
  }, [invoiceTypeFilter, paymentMethod, seller, invoices]);

  // تطبيق فلاتر التصفية القديمة
  useEffect(() => {
    setFilteredInvoices(filteredRows);
  }, [filteredRows]);

  // عند الضغط على بحث
  const handleSearch = () => {
    fetchInvoices();
  };

  // دالة لجلب اسم الفرع من القائمة
  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : branchId;
  };

  // دالة لجلب اسم المخزن من القائمة
  const getWarehouseName = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse ? (warehouse.nameAr || warehouse.name || warehouse.nameEn || warehouseId) : warehouseId;
  };

  // دالة لجلب اسم البائع من القائمة
  const getSalesRepName = (salesRepId: string) => {
    // إذا كان salesRepId فارغ أو undefined، أرجع قيمة افتراضية
    if (!salesRepId || salesRepId.trim() === '') return 'غير محدد';
    
    // ابحث في قائمة حسابات البائعين أولاً
    const foundRep = salesRepAccounts.find(rep => 
      rep.id === salesRepId ||
      rep.name === salesRepId ||
      rep.name.toLowerCase().includes(salesRepId.toLowerCase()) ||
      salesRepId.toLowerCase().includes(rep.name.toLowerCase()) ||
      rep.number === salesRepId
    );
    
    if (foundRep) {
      return foundRep.name + (foundRep.mobile ? ` (${foundRep.mobile})` : '');
    }
    
    // في حالة عدم العثور عليه في الحسابات، ابحث في البائعين الموجودين في الفواتير
    const uniqueSellers = Array.from(new Set(invoices.map(inv => inv.seller).filter(s => !!s && s !== '')));
    const foundSeller = uniqueSellers.find(seller => 
      seller === salesRepId ||
      seller.toLowerCase().includes(salesRepId.toLowerCase()) || 
      salesRepId.toLowerCase().includes(seller.toLowerCase())
    );
    
    return foundSeller || salesRepId;
  };

  // دالة تصدير البيانات إلى ملف Excel باستخدام exceljs (حل متوافق مع Vite والمتصفح)
  const handleExport = async () => {
    // تحميل exceljs من CDN إذا لم يكن موجوداً في window
    let ExcelJS = (window as any).ExcelJS;
    if (!ExcelJS) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/exceljs@4.3.0/dist/exceljs.min.js';
        script.onload = () => {
          ExcelJS = (window as any).ExcelJS;
          resolve(null);
        };
        script.onerror = reject;
        document.body.appendChild(script);
      });
      ExcelJS = (window as any).ExcelJS;
    }
    const exportData = filteredInvoices.map(inv => {
      const sign = inv.invoiceType === 'مرتجع' ? -1 : 1;
      return [
        inv.invoiceNumber,
        dayjs(inv.date).format('YYYY-MM-DD'),
        (sign * inv.total),
        'ريال سعودي',
        (sign * inv.discountValue),
        (sign * inv.cost),
        (sign * ((inv.total - (inv.taxValue ?? 0)) - inv.cost)),
        inv.invoiceType,
        getBranchName(inv.branch),
        inv.paymentMethod,
        inv.seller,
        inv.customer
      ];
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('تقرير الأرباح');

    // إعداد الأعمدة
    sheet.columns = [
      { header: 'رقم الفاتورة', key: 'invoiceNumber', width: 25 },
      { header: 'تاريخ الفاتورة', key: 'date', width: 15 },
      { header: 'قيمة الفاتورة', key: 'total', width: 15 },
      { header: 'العملة', key: 'currency', width: 12 },
      { header: 'قيمة الخصم', key: 'discount', width: 15 },
      { header: 'التكلفة', key: 'cost', width: 15 },
      { header: 'الربح', key: 'profit', width: 15 },
      { header: 'نوع الفاتورة', key: 'type', width: 12 },
      { header: 'الفرع', key: 'branch', width: 15 },
      { header: 'طريقة الدفع', key: 'payment', width: 15 },
      { header: 'البائع', key: 'seller', width: 21 },

      { header: 'العميل', key: 'customer', width: 26 },
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
        // صفوف متبادلة اللون
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
    // إضافة autofilter
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
    a.download = `تقرير_الأرباح_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-6 flex flex-col gap-6 bg-gray-50">
          <Helmet>
        <title>تقرير الأرباح | ERP90 Dashboard</title>
        <meta name="description" content="تقرير فواتير المبيعات، عرض وطباعة فواتير العملاء، ERP90 Dashboard" />
        <meta name="keywords" content="ERP, فواتير, مبيعات, تقرير, عملاء, ضريبة, طباعة, Sales, Invoice, Report, Tax, Customer" />
      </Helmet>
         <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          {/* Invoice Icon */}
          <svg className="h-8 w-8 text-blue-600 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="2" />
            <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" />
            <line x1="8" y1="16" x2="12" y2="16" stroke="currentColor" strokeWidth="2" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800">تقارير أرباح الفواتير </h1>
        </div>
        <p className="text-gray-600 mt-2">تقرير أرباح فواتير المبيعات  </p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
      </div>
        <Breadcrumb
          items={[
            { label: "الرئيسية", to: "/" },
          { label: "إدارة المبيعات", to: "/management/sales" },
            { label: "تقرير بارباح الفواتير" }
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
            transition={{ delay: 0.1 }}
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
            transition={{ delay: 0.2 }}
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
              <Option value="">اختر الفرع</Option>
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
                  <label className="text-sm mb-1 text-gray-600">المخزن</label>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="اختر المخزن"
                    value={warehouseId || undefined}
                    onChange={value => setWarehouseId(value)}
                    allowClear
                  >
                    <Option value="">اختر المخزن</Option>
                    {warehouses.map(w => (
                      <Option key={w.id} value={w.id}>{w.name}</Option>
                    ))}
                  </Select>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col"
                >
                  <label className="text-sm mb-1 text-gray-600">طريقة الدفع</label>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="اختر طريقة الدفع"
                    value={paymentMethod || undefined}
                    onChange={value => setPaymentMethod(value)}
                    allowClear
                  >
                    <Option value="">اختر طريقة الدفع</Option>
                    {paymentMethods.map(m => (
                      <Option key={m.id} value={m.name}>{m.name}</Option>
                    ))}
                  </Select>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col"
                >
                  <label className="text-sm mb-1 text-gray-600">نوع الفاتورة</label>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="الكل"
                    value={invoiceTypeFilter}
                    onChange={v => setInvoiceTypeFilter(v)}
                  >
                    <Option value="">الكل</Option>
                    <Option value="فاتورة">فاتورة</Option>
                    <Option value="مرتجع">مرتجع</Option>
                  </Select>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col"
                >
                  <label className="text-sm mb-1 text-gray-600">البائع</label>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="اختر البائع"
                    value={seller || undefined}
                    onChange={value => setSeller(value)}
                    allowClear
                  >
                    <Select.Option value="">اختر البائع</Select.Option>
                    {Array.from(new Set(invoices.map(inv => inv.seller).filter(s => !!s && s !== ''))).map(s => (
                      <Select.Option key={s} value={s}>{s}</Select.Option>
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
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري البحث...
              </>
            ) : "بحث"}
          </motion.button>
          <span className="text-gray-500 text-sm">نتائج البحث: {filteredInvoices.length}</span>
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
              disabled={filteredInvoices.length === 0}
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

        {/* Results Table */}
        <div className="overflow-x-auto mt-4">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden border rounded-lg">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-blue-600">
                  <tr>
                    {["رقم الفاتورة", "تاريخ الفاتورة", "قيمة الفاتورة", "العملة", "قيمة الخصم", "التكلفة", "الربح"].map((header, index) => (
                      <th 
                        key={index}
                        scope="col"
                        className="px-4 py-3 text-xs font-medium text-white uppercase tracking-wider text-center border border-gray-300"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv, idx) => {
                      // إذا كان مرتجع، اعرض القيم بالسالب
                      const sign = inv.invoiceType === 'مرتجع' ? -1 : 1;
                      return (
                        <tr key={inv.invoiceNumber + '-' + inv.invoiceType}>
                          <td className="px-4 py-2 text-center border border-gray-300">{inv.invoiceNumber}</td>
                          <td className="px-4 py-2 text-center border border-gray-300">{dayjs(inv.date).format('YYYY-MM-DD')}</td>
                          <td className="px-4 py-2 text-center border border-gray-300">{(sign * inv.total).toFixed(2)}</td>
                          <td className="px-4 py-2 text-center border border-gray-300">ريال سعودي</td>
                          <td className="px-4 py-2 text-center border border-gray-300">{(sign * inv.discountValue).toFixed(2)}</td>
                          <td className="px-4 py-2 text-center border border-gray-300">{(sign * inv.cost).toFixed(2)}</td>
                          <td className={"px-4 py-2 text-center border border-gray-300 " + (inv.invoiceType === 'مرتجع' ? 'text-red-600 font-bold' : '')}>
                            {/* الربح غير شامل الضريبة */}
                            {(sign * ((inv.total - (inv.taxValue ?? 0)) - inv.cost)).toFixed(2)}
                          </td>
                          {/* عرض اسم الفرع بدلاً من المعرف إذا أردت في الجدول */}
                          {/* <td className="px-4 py-2 text-center border border-gray-300">{getBranchName(inv.branch)}</td> */}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td 
                        className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center border border-gray-300" 
                        colSpan={7}
                      >
                        {isLoading ? (
                          <div className="flex justify-center items-center py-8">
                            <div className="animate-pulse flex space-x-4">
                              <div className="flex-1 space-y-4 py-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400">لا توجد بيانات</div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InvoiceProfits;