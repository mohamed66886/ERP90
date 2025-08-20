import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker, Input, Select, Button, Table } from "antd";
import { SearchOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import arEG from 'antd/es/date-picker/locale/ar_EG';
import { fetchBranches, Branch } from "@/lib/branches";
import Breadcrumb from "@/components/Breadcrumb";
import dayjs from 'dayjs';
import { collection, query, where, orderBy, getDocs, getDoc, doc, limit, startAfter } from 'firebase/firestore';
import type { Query, DocumentData } from 'firebase/firestore';

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
  itemData?: Record<string, unknown>;
}

// تعريف نوع للـ ExcelJS
interface ExcelJSCell {
  font: Record<string, unknown>;
  alignment: Record<string, unknown>;
  fill?: Record<string, unknown>;
  border?: Record<string, unknown>;
}

interface ExcelJSRow {
  eachCell: (callback: (cell: ExcelJSCell) => void) => void;
  font: Record<string, unknown>;
  alignment: Record<string, unknown>;
}

interface ExcelJSWorksheet {
  columns: Array<{ header: string; key: string; width: number }>;
  addRows: (data: unknown[][]) => void;
  getRow: (index: number) => ExcelJSRow;
  rowCount: number;
  columnCount: number;
  views?: Array<{ state: string; ySplit: number }>;
  autoFilter?: { from: { row: number; column: number }; to: { row: number; column: number } };
}

interface ExcelJSWorkbook {
  addWorksheet: (name: string) => ExcelJSWorksheet;
  xlsx: {
    writeBuffer: () => Promise<ArrayBuffer>;
  };
}

interface ExcelJSType {
  Workbook: new () => ExcelJSWorkbook;
}

interface WindowWithExcelJS extends Window {
  ExcelJS?: ExcelJSType;
}

function InvoiceProfits() {
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
        const { getDocs, collection, query, where, getDoc, doc } = await import('firebase/firestore');
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
        
        // جلب البائعين من الفواتير الموجودة وتحويل الـ IDs إلى أسماء
        const salesSnap = await getDocs(collection(db, 'sales_invoices'));
        const sellerIds = new Set<string>();
        
        salesSnap.docs.forEach(docSnap => {
          const data = docSnap.data();
          const seller = data.delegate || data.seller;
          if (seller && seller.trim() !== '') {
            sellerIds.add(seller);
          }
        });
        
        // تحويل الـ IDs إلى أسماء عن طريق البحث في accounts
        const salesReps: Array<{ id: string; name: string; number: string; mobile: string }> = [];
        
        for (const sellerId of Array.from(sellerIds)) {
          // أولاً، تحقق إذا كان موجود في accountsReps
          const existingRep = accountsReps.find(rep => 
            rep.id === sellerId || 
            rep.name === sellerId ||
            rep.number === sellerId
          );
          
          if (existingRep) {
            // إذا كان موجود، لا تضيفه مرة أخرى
            continue;
          }
          
          // إذا بدا sellerId كأنه ID، حاول جلب الاسم من accounts
          if (sellerId.length > 10 && /^[a-zA-Z0-9_-]+$/.test(sellerId)) {
            try {
              const accountDoc = await getDoc(doc(db, 'accounts', sellerId));
              if (accountDoc.exists()) {
                const accountData = accountDoc.data();
                salesReps.push({
                  id: sellerId,
                  name: accountData.name || sellerId,
                  number: accountData.number || '',
                  mobile: accountData.mobile || accountData.phone || ''
                });
              } else {
                // إذا لم يوجد في accounts، أضف sellerId كما هو
                salesReps.push({
                  id: sellerId,
                  name: sellerId,
                  number: '',
                  mobile: ''
                });
              }
            } catch {
              // في حالة حدوث خطأ، أضف sellerId كما هو
              salesReps.push({
                id: sellerId,
                name: sellerId,
                number: '',
                mobile: ''
              });
            }
          } else {
            // إذا لم يبدو كأنه ID، أضفه كاسم
            salesReps.push({
              id: sellerId,
              name: sellerId,
              number: '',
              mobile: ''
            });
          }
        }
        
        // دمج القوائم وإزالة المكرر
        const allReps = [...accountsReps, ...salesReps];
        const uniqueReps = allReps.filter((rep, index, self) => 
          index === self.findIndex(r => 
            r.name.toLowerCase() === rep.name.toLowerCase() || 
            r.id === rep.id
          )
        );
        
        setSalesRepAccounts(uniqueReps);
      } catch {
        setSalesRepAccounts([]);
      }
    };
    fetchSalesReps();
  }, []);

  // فلاتر البحث
  const [dateFrom, setDateFrom] = useState<dayjs.Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<dayjs.Dayjs | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<string>(""); // ""=الكل, "فاتورة", "مرتجع"

  // بيانات الفواتير
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceRecord[]>([]);

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
      const { getDocs, collection, query, where, Query, CollectionReference } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      // --- فواتير المبيعات ---
      let q: Query<DocumentData> = collection(db, 'sales_invoices');
      const filters: ReturnType<typeof where>[] = [];
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
      const salesRecords: InvoiceRecord[] = [];
      snapshot.forEach(doc => {
        const data = doc.data() as Record<string, unknown>;
        const invoiceNumber = (data.invoiceNumber as string) || '';
        const date = (data.date as string) || '';
        const branch = (data.branch as string) || '';
        const customer = (data.customerName as string) || (data.customer as string) || '';
        const customerPhone = (data.customerPhone as string) || '';
        const seller = (data.delegate as string) || (data.seller as string) || '';
        const paymentMethod = (data.paymentMethod as string) || '';
        const invoiceType = (data.type as string) || '';
        const items = Array.isArray(data.items) ? data.items : [];
        items.forEach((item: Record<string, unknown>, idx: number) => {
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
            itemNumber: (item.itemNumber as string) || '',
            itemName: (item.itemName as string) || '',
            mainCategory: (item.mainCategory as string) || '',
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
            warehouse: (item.warehouseId as string) || (data.warehouse as string) || '',
            customer,
            customerPhone,
            seller,
            paymentMethod,
            invoiceType: invoiceType || 'فاتورة',
            isReturn: false,
            extraDiscount: Number(item.extraDiscount) || undefined,
            itemData: item
          });
        });
      });

      // --- مرتجعات المبيعات ---
      let qReturn: Query<DocumentData> = collection(db, 'sales_returns');
      const filtersReturn: ReturnType<typeof where>[] = [];
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
      const returnRecords: InvoiceRecord[] = [];
      snapshotReturn.forEach(doc => {
        const data = doc.data() as Record<string, unknown>;
        const invoiceNumber = (data.invoiceNumber as string) || '';
        const date = (data.date as string) || '';
        const rawData = doc.data() as Record<string, unknown>;
        const branch = typeof rawData.branch === 'string' ? rawData.branch : '';
        const customer = (data.customerName as string) || (data.customer as string) || '';
        const customerPhone = (data.customerPhone as string) || '';
        const seller = (data.seller as string) || '';
        const paymentMethod = (data.paymentMethod as string) || '';
        const invoiceType = 'مرتجع';
        const items = Array.isArray(data.items) ? data.items : [];
        items.forEach((item: Record<string, unknown>, idx: number) => {
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
            itemNumber: (item.itemNumber as string) || '',
            itemName: (item.itemName as string) || '',
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
            warehouse: (item.warehouseId as string) || (data.warehouse as string) || '',
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
    
    // فلتر البائع - محسن للتعامل مع الأسماء والـ IDs
    if (seller) {
      filtered = filtered.filter(inv => {
        if (!inv.seller) return false;
        
        // أولاً: مقارنة مباشرة
        if (inv.seller === seller) return true;
        
        // ثانياً: البحث في قائمة salesRepAccounts
        const foundRep = salesRepAccounts.find(rep => 
          (rep.id === inv.seller && rep.name === seller) ||
          (rep.name === inv.seller && rep.name === seller)
        );
        if (foundRep) return true;
        
        // ثالثاً: التحويل باستخدام نفس منطق getSalesRepName
        // البحث بالـ ID
        const foundRepById = salesRepAccounts.find(rep => rep.id === inv.seller);
        if (foundRepById && foundRepById.name === seller) return true;
        
        // البحث بالاسم
        const foundRepByName = salesRepAccounts.find(rep => 
          rep.name === inv.seller ||
          rep.name.toLowerCase() === inv.seller.toLowerCase()
        );
        if (foundRepByName && foundRepByName.name === seller) return true;
        
        // البحث برقم الحساب
        const foundRepByNumber = salesRepAccounts.find(rep => rep.number === inv.seller);
        if (foundRepByNumber && foundRepByNumber.name === seller) return true;
        
        return false;
      });
    }
    
    return filtered;
  }, [invoices, invoiceTypeFilter, paymentMethod, seller, salesRepAccounts]);

  // دالة للتوافق مع الكود القديم
  const getFilteredRows = () => filteredRows;

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
    
    // أولاً: ابحث في قائمة حسابات البائعين بالـ ID
    const foundRepById = salesRepAccounts.find(rep => rep.id === salesRepId);
    if (foundRepById) {
      return foundRepById.name;
    }
    
    // ثانياً: ابحث في قائمة حسابات البائعين بالاسم
    const foundRepByName = salesRepAccounts.find(rep => 
      rep.name === salesRepId ||
      rep.name.toLowerCase() === salesRepId.toLowerCase()
    );
    if (foundRepByName) {
      return foundRepByName.name;
    }
    
    // ثالثاً: ابحث برقم الحساب
    const foundRepByNumber = salesRepAccounts.find(rep => rep.number === salesRepId);
    if (foundRepByNumber) {
      return foundRepByNumber.name;
    }
    
    // رابعاً: بحث جزئي في الأسماء
    const foundRepPartial = salesRepAccounts.find(rep => 
      rep.name.toLowerCase().includes(salesRepId.toLowerCase()) ||
      salesRepId.toLowerCase().includes(rep.name.toLowerCase())
    );
    if (foundRepPartial) {
      return foundRepPartial.name;
    }
    
    // خامساً: في حالة عدم العثور عليه في الحسابات، ابحث في البائعين الموجودين في الفواتير
    const uniqueSellers = Array.from(new Set(invoices.map(inv => inv.seller).filter(s => !!s && s !== '')));
    const foundSeller = uniqueSellers.find(seller => 
      seller === salesRepId || // مطابقة كاملة
      seller.toLowerCase().includes(salesRepId.toLowerCase()) || 
      salesRepId.toLowerCase().includes(seller.toLowerCase())
    );
    
    if (foundSeller) {
      return foundSeller;
    }
    
    // أخيراً: إذا بدا salesRepId كأنه ID (يحتوي على أرقام وحروف)، أرجع "غير محدد"
    // وإلا أرجع القيمة كما هي
    const isLikelyId = /^[a-zA-Z0-9_-]{10,}$/.test(salesRepId);
    return isLikelyId ? 'غير محدد' : salesRepId;
  };

  // دالة تصدير البيانات إلى ملف Excel باستخدام exceljs (حل متوافق مع Vite والمتصفح)
  const handleExport = async () => {
    // تحميل exceljs من CDN إذا لم يكن موجوداً في window
    let ExcelJS = (window as WindowWithExcelJS).ExcelJS;
    if (!ExcelJS) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/exceljs@4.3.0/dist/exceljs.min.js';
        script.onload = () => {
          ExcelJS = (window as WindowWithExcelJS).ExcelJS;
          resolve(null);
        };
        script.onerror = reject;
        document.body.appendChild(script);
      });
      ExcelJS = (window as WindowWithExcelJS).ExcelJS;
    }
    const exportData = filteredInvoices.map(inv => {
      const sign = inv.invoiceType === 'مرتجع' ? -1 : 1;
      const afterDiscount = inv.total - inv.discountValue;
      const profit = (inv.total - (inv.taxValue ?? 0)) - inv.cost;
      
      return [
        inv.invoiceNumber,
        dayjs(inv.date).format('YYYY-MM-DD'),
        inv.customer || '-',
        inv.customerPhone || '-',
        (sign * inv.total),
        (sign * inv.discountValue),
        (sign * afterDiscount),
        (sign * (inv.taxValue ?? 0)),
        (sign * (inv.net || 0)),
        (sign * inv.cost),
        (sign * profit),
        inv.invoiceType,
        getBranchName(inv.branch),
        getWarehouseName(inv.warehouse),
        inv.paymentMethod || '-',
        getSalesRepName(inv.seller)
      ];
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('تقرير الأرباح');

    // إعداد الأعمدة
    sheet.columns = [
      { header: 'رقم الفاتورة', key: 'invoiceNumber', width: 25 },
      { header: 'تاريخ الفاتورة', key: 'date', width: 15 },
      { header: 'العميل', key: 'customer', width: 26 },
      { header: 'رقم العميل', key: 'customerPhone', width: 15 },
      { header: 'قيمة الفاتورة', key: 'total', width: 15 },
      { header: 'قيمة الخصم', key: 'discount', width: 15 },
      { header: 'بعد الخصم', key: 'afterDiscount', width: 15 },
      { header: 'قيمة الضريبة', key: 'tax', width: 15 },
      { header: 'الصافي بعد الضريبة', key: 'net', width: 18 },
      { header: 'التكلفة', key: 'cost', width: 15 },
      { header: 'الربح', key: 'profit', width: 15 },
      { header: 'نوع الفاتورة', key: 'type', width: 12 },
      { header: 'الفرع', key: 'branch', width: 15 },
      { header: 'المخزن', key: 'warehouse', width: 15 },
      { header: 'طريقة الدفع', key: 'payment', width: 15 },
      { header: 'البائع', key: 'seller', width: 21 },
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
    <>
      <Helmet>
        <title>تقرير أرباح الفواتير | ERP90 Dashboard</title>
        <meta name="description" content="تقرير أرباح فواتير المبيعات، عرض وتحليل الأرباح، ERP90 Dashboard" />
        <meta name="keywords" content="ERP, فواتير, أرباح, مبيعات, تقرير, عملاء, Sales, Invoice, Profit, Report" />
      </Helmet>
      <div className="w-full min-h-screen p-4 md:p-6 flex flex-col gap-6 bg-gray-50" dir="rtl">
 
        {/* العنوان الرئيسي */}
        <div className="p-3 sm:p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
          <div className="flex items-center">
            <FileTextOutlined className="h-5 w-5 sm:h-8 sm:w-8 text-emerald-600 ml-1 sm:ml-3" />
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800">تقرير أرباح الفواتير</h1>
          </div>
          <p className="text-xs sm:text-base text-gray-600 mt-2">تقرير أرباح فواتير المبيعات</p>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500"></div>
        </div>

        <Breadcrumb
          items={[
            { label: "الرئيسية", to: "/" },
            { label: "إدارة المبيعات", to: "/management/sales" },
            { label: "تقرير أرباح الفواتير" }
          ]}
        />

        {/* Search Options */}
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
                    <span style={labelStyle}>المخزن</span>
                    <Select
                      value={warehouseId || undefined}
                      onChange={setWarehouseId}
                      placeholder="اختر المخزن"
                      style={{ width: '100%', ...largeControlStyle }}
                      size="large"
                      optionFilterProp="label"
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        option?.children?.toString().toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {warehouses.map(w => (
                        <Option key={w.id} value={w.id}>{w.nameAr || w.name || w.nameEn || w.id}</Option>
                      ))}
                    </Select>
                  </div>
                  
                  <div className="flex flex-col">
                    <span style={labelStyle}>طريقة الدفع</span>
                    <Select
                      value={paymentMethod || undefined}
                      onChange={setPaymentMethod}
                      placeholder="اختر طريقة الدفع"
                      style={{ width: '100%', ...largeControlStyle }}
                      size="large"
                      optionFilterProp="label"
                      allowClear
                    >
                      {paymentMethods.map(m => (
                        <Option key={m.id} value={m.name}>{m.name}</Option>
                      ))}
                    </Select>
                  </div>
                  
                  <div className="flex flex-col">
                    <span style={labelStyle}>نوع الفاتورة</span>
                    <Select
                      value={invoiceTypeFilter}
                      onChange={v => setInvoiceTypeFilter(v)}
                      placeholder="اختر نوع الفاتورة"
                      style={{ width: '100%', ...largeControlStyle }}
                      size="large"
                      allowClear
                    >
                      <Option value="">الكل</Option>
                      <Option value="فاتورة">فاتورة</Option>
                      <Option value="مرتجع">مرتجع</Option>
                    </Select>
                  </div>
                  
                  <div className="flex flex-col">
                    <span style={labelStyle}>البائع</span>
                    <Select
                      value={seller || undefined}
                      onChange={setSeller}
                      placeholder="اختر البائع"
                      style={{ width: '100%', ...largeControlStyle }}
                      size="large"
                      optionFilterProp="label"
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        option?.children?.toString().toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {/* أولاً عرض البائعين من حسابات المندوبين */}
                      {salesRepAccounts.map(rep => (
                        <Option key={rep.id} value={rep.name}>{rep.name}</Option>
                      ))}
                      {/* ثم عرض البائعين الإضافيين الموجودين في الفواتير والغير موجودين في الحسابات */}
                      {Array.from(new Set(invoices.map(inv => inv.seller).filter(s => {
                        if (!s || s === '') return false;
                        // تحقق من عدم وجود هذا البائع في حسابات المندوبين
                        return !salesRepAccounts.some(rep => 
                          rep.id === s ||
                          rep.name === s ||
                          rep.name.toLowerCase().includes(s.toLowerCase()) ||
                          s.toLowerCase().includes(rep.name.toLowerCase())
                        );
                      }))).map(s => {
                        const displayName = getSalesRepName(s);
                        return (
                          <Option key={s} value={displayName}>{displayName}</Option>
                        );
                      })}
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
            <span className="text-gray-500 text-sm">
              نتائج البحث: {filteredInvoices.length} فاتورة
            </span>
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

        {/* Search Results */}
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
              نتائج البحث ({filteredInvoices.length} فاتورة)
            </h3>
            <div className="flex items-center gap-2">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExport}
                disabled={filteredInvoices.length === 0}
                className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                size="large"
              >
                تصدير إكسل
              </Button>
            </div>
          </div>

          <Table
            columns={[
              {
                title: 'رقم الفاتورة',
                dataIndex: 'invoiceNumber',
                key: 'invoiceNumber',
                width: 160,
                sorter: (a: InvoiceRecord, b: InvoiceRecord) => a.invoiceNumber.localeCompare(b.invoiceNumber),
                render: (text: string) => (
                  <span className="font-medium text-blue-600">{text}</span>
                )
              },
              {
                title: 'تاريخ الفاتورة',
                dataIndex: 'date',
                key: 'date',
                width: 120,
                sorter: (a: InvoiceRecord, b: InvoiceRecord) => dayjs(a.date).unix() - dayjs(b.date).unix(),
                render: (text: string) => dayjs(text).format('YYYY-MM-DD')
              },
              {
                title: 'قيمة الفاتورة',
                dataIndex: 'total',
                key: 'total',
                width: 140,
                align: 'center',
                sorter: (a: InvoiceRecord, b: InvoiceRecord) => a.total - b.total,
                render: (value: number, record: InvoiceRecord) => {
                  const sign = record.invoiceType === 'مرتجع' ? -1 : 1;
                  return (
                    <span className={record.invoiceType === 'مرتجع' ? 'text-red-600' : 'text-green-600'}>
                      {(sign * value).toLocaleString()} ر.س
                    </span>
                  );
                }
              },
              {
                title: 'قيمة الخصم',
                dataIndex: 'discountValue',
                key: 'discountValue',
                width: 120,
                align: 'center',
                sorter: (a: InvoiceRecord, b: InvoiceRecord) => a.discountValue - b.discountValue,
                render: (value: number, record: InvoiceRecord) => {
                  const sign = record.invoiceType === 'مرتجع' ? -1 : 1;
                  return `${(sign * (value || 0)).toLocaleString()} ر.س`;
                }
              },
              {
                title: 'بعد الخصم',
                key: 'afterDiscount',
                width: 120,
                align: 'center',
                render: (record: InvoiceRecord) => {
                  const afterDiscount = record.total - record.discountValue;
                  const sign = record.invoiceType === 'مرتجع' ? -1 : 1;
                  return `${(sign * afterDiscount).toLocaleString()} ر.س`;
                },
                sorter: (a: InvoiceRecord, b: InvoiceRecord) => (a.total - a.discountValue) - (b.total - b.discountValue),
              },
              {
                title: 'قيمة الضريبة',
                dataIndex: 'taxValue',
                key: 'taxValue',
                width: 120,
                align: 'center',
                sorter: (a: InvoiceRecord, b: InvoiceRecord) => (a.taxValue || 0) - (b.taxValue || 0),
                render: (value: number, record: InvoiceRecord) => {
                  const sign = record.invoiceType === 'مرتجع' ? -1 : 1;
                  return `${(sign * (value || 0)).toLocaleString()} ر.س`;
                }
              },
              {
                title: 'الصافي بعد الضريبة',
                dataIndex: 'net',
                key: 'net',
                width: 160,
                align: 'center',
                render: (net: number, record: InvoiceRecord) => {
                  const sign = record.invoiceType === 'مرتجع' ? -1 : 1;
                  return `${(sign * (net || 0)).toLocaleString()} ر.س`;
                },
                sorter: (a: InvoiceRecord, b: InvoiceRecord) => (a.net || 0) - (b.net || 0),
              },
              {
                title: 'التكلفة',
                dataIndex: 'cost',
                key: 'cost',
                width: 120,
                align: 'center',
                sorter: (a: InvoiceRecord, b: InvoiceRecord) => a.cost - b.cost,
                render: (value: number, record: InvoiceRecord) => {
                  const sign = record.invoiceType === 'مرتجع' ? -1 : 1;
                  return (
                    <span>
                      {(sign * value).toLocaleString()} ر.س
                    </span>
                  );
                }
              },
              {
                title: 'الربح',
                key: 'profit',
                width: 120,
                align: 'center',
                sorter: (a: InvoiceRecord, b: InvoiceRecord) => ((a.total - (a.taxValue ?? 0)) - a.cost) - ((b.total - (b.taxValue ?? 0)) - b.cost),
                render: (record: InvoiceRecord) => {
                  const sign = record.invoiceType === 'مرتجع' ? -1 : 1;
                  const profit = sign * ((record.total - (record.taxValue ?? 0)) - record.cost);
                  return (
                    <span className={profit >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {profit.toLocaleString()} ر.س
                    </span>
                  );
                }
              },
              {
                title: 'نوع الفاتورة',
                dataIndex: 'invoiceType',
                key: 'invoiceType',
                width: 120,
                align: 'center',
                sorter: (a: InvoiceRecord, b: InvoiceRecord) => a.invoiceType.localeCompare(b.invoiceType),
                render: (text: string) => (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    text === 'مرتجع' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {text}
                  </span>
                )
              },
              {
                title: 'الفرع',
                dataIndex: 'branch',
                key: 'branch',
                width: 120,
                sorter: (a: InvoiceRecord, b: InvoiceRecord) => getBranchName(a.branch).localeCompare(getBranchName(b.branch)),
                render: (text: string) => getBranchName(text)
              },
              {
                title: 'المخزن',
                dataIndex: 'warehouse',
                key: 'warehouse',
                width: 120,
                sorter: (a: InvoiceRecord, b: InvoiceRecord) => getWarehouseName(a.warehouse).localeCompare(getWarehouseName(b.warehouse)),
                render: (warehouse: string) => getWarehouseName(warehouse),
              },
              {
                title: 'طريقة الدفع',
                dataIndex: 'paymentMethod',
                key: 'paymentMethod',
                width: 120,
                render: (method: string) => method || '-'
              },
              {
                title: 'البائع',
                dataIndex: 'seller',
                key: 'seller',
                width: 150,
                sorter: (a: InvoiceRecord, b: InvoiceRecord) => getSalesRepName(a.seller).localeCompare(getSalesRepName(b.seller)),
                render: (seller: string) => getSalesRepName(seller)
              }
            ]}
            dataSource={getFilteredRows()}
            rowKey="key"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              position: ['bottomRight'],
              showTotal: (total, range) => `عرض ${range[0]}-${range[1]} من ${total} فاتورة`
            }}
            loading={isLoading}
            scroll={{ x: 1400 }}
            size="small"
            bordered
            className="[&_.ant-table-thead_>_tr_>_th]:bg-gray-400 [&_.ant-table-thead_>_tr_>_th]:text-white [&_.ant-table-thead_>_tr_>_th]:border-gray-400 [&_.ant-table-tbody_>_tr:hover_>_td]:bg-emerald-50"
            locale={{
              emptyText: isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">لا توجد بيانات</div>
              )
            }}
            summary={() => {
              if (getFilteredRows().length === 0) return null;
              
              // حساب الإجماليات
              const allRows = getFilteredRows();
              let totalAmount = 0;
              let totalDiscount = 0;
              let totalAfterDiscount = 0;
              let totalTax = 0;
              let totalNet = 0;
              let totalCost = 0;
              let totalProfit = 0;

              allRows.forEach((row: InvoiceRecord) => {
                const sign = row.invoiceType === 'مرتجع' ? -1 : 1;
                totalAmount += sign * row.total;
                totalDiscount += sign * row.discountValue;
                totalAfterDiscount += sign * (row.total - row.discountValue);
                totalTax += sign * (row.taxValue ?? 0);
                totalNet += sign * (row.net || 0);
                totalCost += sign * row.cost;
                totalProfit += sign * ((row.total - (row.taxValue ?? 0)) - row.cost);
              });

              return (
                <Table.Summary fixed>
                  <Table.Summary.Row className="">
                    <Table.Summary.Cell index={0} className="text-center font-bold">الإجماليات</Table.Summary.Cell>
                    <Table.Summary.Cell index={1}></Table.Summary.Cell>
                    <Table.Summary.Cell index={2}></Table.Summary.Cell>
                    <Table.Summary.Cell index={3}></Table.Summary.Cell>
                    <Table.Summary.Cell index={4} className="text-center font-bold text-blue-600">
                      {totalAmount.toLocaleString()} ر.س
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} className="text-center font-bold text-red-600">
                      {totalDiscount.toLocaleString()} ر.س
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6} className="text-center font-bold text-orange-600">
                      {totalAfterDiscount.toLocaleString()} ر.س
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={7} className="text-center font-bold text-purple-600">
                      {totalTax.toLocaleString()} ر.س
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={8} className="text-center font-bold text-emerald-600">
                      {totalNet.toLocaleString()} ر.س
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={9} className="text-center font-bold">
                      {totalCost.toLocaleString()} ر.س
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={10} className={`text-center font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalProfit.toLocaleString()} ر.س
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={11}></Table.Summary.Cell>
                    <Table.Summary.Cell index={12}></Table.Summary.Cell>
                    <Table.Summary.Cell index={13}></Table.Summary.Cell>
                    <Table.Summary.Cell index={14}></Table.Summary.Cell>
                    <Table.Summary.Cell index={15}></Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </motion.div>
      </div>
    </>
  );
};

export default InvoiceProfits;
