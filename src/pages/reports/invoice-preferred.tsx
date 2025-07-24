
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker, Input, Select } from "antd";
import arEG from 'antd/es/date-picker/locale/ar_EG';
import { fetchBranches, Branch } from "@/lib/branches";
import Breadcrumb from "@/components/Breadcrumb";
import dayjs from 'dayjs';


interface WarehouseOption {
  id: string;
  name: string;
}

interface PaymentMethodOption {
  id: string;
  name: string;
}

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
  customerMobile?: string;
  seller: string;
  paymentMethod: string;
  invoiceType: string;
  isReturn: boolean;
  extraDiscount?: number;
  itemData?: any;
  createdAt?: any;
  unit?: string;
}



const InvoicePreferred: React.FC = () => {
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
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const snap = await getDocs(collection(db, 'warehouses'));
        const options = snap.docs.map(doc => ({ id: doc.id, name: doc.data().name || doc.id }));
        setWarehouses(options);
      } catch {
        setWarehouses([]);
      }
    };
    fetchWarehouses();
  }, []);
  const [dateFrom, setDateFrom] = useState<any>(null);
  const [dateTo, setDateTo] = useState<any>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhoneFilter, setCustomerPhoneFilter] = useState<string>("");
  const [itemName, setItemName] = useState<string>("");
  const [itemNumberFilter, setItemNumberFilter] = useState<string>("");
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<string>("");
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  // سنستخدم نوع جديد يمثل كل صنف في الفاتورة
  interface InvoiceItemRow extends InvoiceRecord {
    unit?: string;
    totalAfterDiscount?: number;
  }
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceItemRow[]>([]);

  // Debug: طباعة النتائج المفلترة في الكونسول كلما تغيرت
  useEffect(() => {
    console.log('DEBUG - filteredInvoices:', filteredInvoices);
  }, [filteredInvoices]);

  // Debug: طباعة الفواتير بعد الجلب
  useEffect(() => {
    console.log('DEBUG - invoices:', invoices);
  }, [invoices]);
  useEffect(() => {
    fetchBranches().then(data => {
      setBranches(data);
      setBranchesLoading(false);
    });
  }, []);
  // تعديل: جعل fetchInvoices تقبل فلاتر كوسائط (للاستخدام عند البحث فقط)
  const fetchInvoices = async (filtersParams?: {
    branchId?: string;
    invoiceNumber?: string;
    dateFrom?: any;
    dateTo?: any;
    warehouseId?: string;
    customerName?: string;
    customerPhone?: string;
    itemName?: string;
    itemNumber?: string;
  }) => {
    console.log('DEBUG - fetchInvoices called', filtersParams);
    setIsLoading(true);
    try {
      const { getDocs, collection, query, where } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      // جلب جميع الأصناف
      let inventoryItems: any[] = [];
      try {
        const itemsSnap = await getDocs(collection(db, 'inventory_items'));
        inventoryItems = itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.log('DEBUG - error fetching inventory_items:', e);
      }
      let q = collection(db, 'sales_invoices');
      let filters: any[] = [];
      const params = filtersParams || {};
      if (params.branchId) filters.push(where('branch', '==', params.branchId));
      if (params.invoiceNumber) filters.push(where('invoiceNumber', '==', params.invoiceNumber));
      if (params.dateFrom) filters.push(where('date', '>=', dayjs(params.dateFrom).format('YYYY-MM-DD')));
      if (params.dateTo) filters.push(where('date', '<=', dayjs(params.dateTo).format('YYYY-MM-DD')));
      if (params.warehouseId) filters.push(where('warehouse', '==', params.warehouseId));
      if (filters.length > 0) {
        const { query: qFn } = await import('firebase/firestore');
        q = qFn(q, ...filters);
      }
      // لا يمكن عمل تصفية مباشرة على الحقول غير المفهرسة أو الفرعية، سنستخدم الفلاتر بعد الجلب
      const snapshot = await getDocs(q);
      let salesRecords: InvoiceRecord[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const invoiceNumber = data.invoiceNumber || '';
        const date = data.date || '';
        const branch = data.branch || '';
        const customer = data.customerName || data.customer || '';
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
          // استخراج رقم العميل من جميع الحقول المحتملة مع التأكد من أنها سترينج
          const customerPhone =
            (typeof item.customerPhone === 'string' && item.customerPhone.trim() !== '' && item.customerPhone) ||
            (typeof item.customerMobile === 'string' && item.customerMobile.trim() !== '' && item.customerMobile) ||
            (typeof item.customerNumber === 'string' && item.customerNumber.trim() !== '' && item.customerNumber) ||
            (typeof item.phone === 'string' && item.phone.trim() !== '' && item.phone) ||
            (typeof item.mobile === 'string' && item.mobile.trim() !== '' && item.mobile) ||
            (typeof item.phoneNumber === 'string' && item.phoneNumber.trim() !== '' && item.phoneNumber) ||
            (typeof data.customerPhone === 'string' && data.customerPhone.trim() !== '' && data.customerPhone) ||
            (typeof data.customerMobile === 'string' && data.customerMobile.trim() !== '' && data.customerMobile) ||
            (typeof data.customerNumber === 'string' && data.customerNumber.trim() !== '' && data.customerNumber) ||
            (typeof data.phone === 'string' && data.phone.trim() !== '' && data.phone) ||
            (typeof data.mobile === 'string' && data.mobile.trim() !== '' && data.mobile) ||
            (typeof data.phoneNumber === 'string' && data.phoneNumber.trim() !== '' && data.phoneNumber) ||
            '';
          // جلب اسم الفئة الرئيسية (الأب) من inventory_items
          let parentName = '';
          const foundItem = inventoryItems.find(i => i.name === item.itemName);
          if (foundItem && foundItem.parentId) {
            const parentItem = inventoryItems.find(i => i.id === foundItem.parentId || i.id === String(foundItem.parentId));
            parentName = parentItem?.name || '';
          }
          salesRecords.push({
            key: doc.id + '-' + idx,
            invoiceNumber,
            date,
            branch,
            itemNumber: item.itemNumber || '',
            itemName: item.itemName || '',
            mainCategory: parentName,
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
            itemData: item,
            createdAt: data.createdAt || undefined
          });
        });
      });
      let qReturn = collection(db, 'sales_returns');
      let filtersReturn: any[] = [];
      if (params.branchId) filtersReturn.push(where('branch', '==', params.branchId));
      if (params.invoiceNumber) filtersReturn.push(where('invoiceNumber', '==', params.invoiceNumber));
      if (params.dateFrom) filtersReturn.push(where('date', '>=', dayjs(params.dateFrom).format('YYYY-MM-DD')));
      if (params.dateTo) filtersReturn.push(where('date', '<=', dayjs(params.dateTo).format('YYYY-MM-DD')));
      if (params.warehouseId) filtersReturn.push(where('warehouse', '==', params.warehouseId));
      if (filtersReturn.length > 0) {
        const { query: qFn } = await import('firebase/firestore');
        qReturn = qFn(qReturn, ...filtersReturn);
      }
      const snapshotReturn = await getDocs(qReturn);
      let returnRecords: InvoiceRecord[] = [];
      snapshotReturn.forEach(doc => {
      const data = doc.data();
        // استخدم رقم المرتجع بدلاً من رقم الفاتورة في المرتجع
        const referenceNumber = data.referenceNumber || '';
        const invoiceNumber = referenceNumber || data.invoiceNumber || '';
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
          // استخراج رقم العميل من جميع الحقول المحتملة مع التأكد من أنها سترينج
          const customerPhone =
            (typeof item.customerPhone === 'string' && item.customerPhone.trim() !== '' && item.customerPhone) ||
            (typeof item.customerMobile === 'string' && item.customerMobile.trim() !== '' && item.customerMobile) ||
            (typeof item.customerNumber === 'string' && item.customerNumber.trim() !== '' && item.customerNumber) ||
            (typeof item.phone === 'string' && item.phone.trim() !== '' && item.phone) ||
            (typeof item.mobile === 'string' && item.mobile.trim() !== '' && item.mobile) ||
            (typeof item.phoneNumber === 'string' && item.phoneNumber.trim() !== '' && item.phoneNumber) ||
            (typeof data.customerPhone === 'string' && data.customerPhone.trim() !== '' && data.customerPhone) ||
            (typeof data.customerMobile === 'string' && data.customerMobile.trim() !== '' && data.customerMobile) ||
            (typeof data.customerNumber === 'string' && data.customerNumber.trim() !== '' && data.customerNumber) ||
            (typeof data.phone === 'string' && data.phone.trim() !== '' && data.phone) ||
            (typeof data.mobile === 'string' && data.mobile.trim() !== '' && data.mobile) ||
            (typeof data.phoneNumber === 'string' && data.phoneNumber.trim() !== '' && data.phoneNumber) ||
            '';
          // جلب اسم الفئة الرئيسية (الأب) من inventory_items إذا لم تكن موجودة
          let parentName = item.mainCategory || '';
          if (!parentName && inventoryItems && item.itemName) {
            const foundItem = inventoryItems.find(i => i.name === item.itemName);
            if (foundItem && foundItem.parentId) {
              const parentItem = inventoryItems.find(i => i.id === foundItem.parentId || i.id === String(foundItem.parentId));
              parentName = parentItem?.name || '';
            }
          }
          returnRecords.push({
            key: 'return-' + doc.id + '-' + idx,
            invoiceNumber, // سيحمل رقم المرتجع في حالة المرتجع
            date,
            branch,
            itemNumber: item.itemNumber || '',
            itemName: item.itemName || '',
            mainCategory: parentName,
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
            itemData: item,
            createdAt: data.createdAt || undefined
          });
        });
      });
      // بدلاً من التجميع، اعرض كل الأصناف مباشرة
      const all = [...salesRecords, ...returnRecords];
      // تصفية إضافية بعد الجلب
      let filteredAll = all;
      if (params.customerName) {
        filteredAll = filteredAll.filter(inv =>
          inv.customer && inv.customer.toLowerCase().includes(params.customerName.toLowerCase())
        );
      }
      if (params.customerPhone) {
        filteredAll = filteredAll.filter(inv =>
          inv.customerPhone && inv.customerPhone.toLowerCase().includes(params.customerPhone.toLowerCase())
        );
      }
      if (params.itemName) {
        filteredAll = filteredAll.filter(inv =>
          inv.itemName && inv.itemName.toLowerCase().includes(params.itemName.toLowerCase())
        );
      }
      if (params.itemNumber) {
        filteredAll = filteredAll.filter(inv =>
          inv.itemNumber && inv.itemNumber.toLowerCase().includes(params.itemNumber.toLowerCase())
        );
      }
      setInvoices(filteredAll);
      console.log('DEBUG - setInvoices called with:', all);
      // Debug: طباعة النتائج النهائية في الكونسول
      console.log('DEBUG - Final result array:', all);
    } catch (err) {
      setInvoices([]);
      console.log('DEBUG - fetchInvoices error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // جلب كل البيانات عند تحميل الصفحة فقط (بدون فلاتر)
  useEffect(() => {
    console.log('DEBUG - useEffect (initial load) calling fetchInvoices');
    fetchInvoices();
    // eslint-disable-next-line
  }, []);

  // عند تغيير invoices (بعد الجلب)، اعرض كل البيانات مباشرة في الجدول
  useEffect(() => {
    // لكل فاتورة، إذا كان فيها أصناف (itemData.items)، أنشئ صف لكل صنف
    let allRows: InvoiceItemRow[] = [];
    invoices.forEach(inv => {
      if (inv.itemData && Array.isArray(inv.itemData.items)) {
        inv.itemData.items.forEach((item: any) => {
          const price = Number(item.price) || 0;
          const quantity = Number(item.quantity) || Number(item.returnedQty) || 0;
          const discountValue = Number(item.discountValue) || 0;
          const totalAfterDiscount = (price * quantity) - discountValue;
          allRows.push({
            ...inv,
            itemNumber: item.itemNumber || '',
            itemName: item.itemName || '',
            mainCategory: inv.mainCategory || '',
            quantity,
            price,
            discountValue,
            discountPercent: Number(item.discountPercent) || 0,
            taxValue: Number(item.taxValue) || 0,
            taxPercent: Number(item.taxPercent) || 0,
            net: Number(item.net) || 0,
            unit: item.unit || inv.unit || (inv.itemData && inv.itemData.unit) || '',
            createdAt: item.createdAt || inv.createdAt,
            warehouse: item.warehouseId || inv.warehouse,
            totalAfterDiscount: totalAfterDiscount < 0 ? 0 : totalAfterDiscount,
            itemData: item,
          });
        });
      } else {
        allRows.push(inv);
      }
    });
    setFilteredInvoices(allRows);
  }, [invoices]);
  // دالة تعرض البيانات المفلترة للعرض فقط حسب الفلاتر الإضافية
  const getFilteredRows = () => {
    // إذا لم يتم اختيار أي فلتر، أرجع كل البيانات
    if (!invoiceTypeFilter && !paymentMethod && !seller) {
      console.log('DEBUG - getFilteredRows (no filters):', filteredInvoices);
      return filteredInvoices;
    }
    let filtered = filteredInvoices;
    if (invoiceTypeFilter) {
      if (invoiceTypeFilter === 'فاتورة') {
        filtered = filtered.filter(inv => !inv.isReturn);
      } else if (invoiceTypeFilter === 'مرتجع') {
        filtered = filtered.filter(inv => inv.isReturn);
      } else {
        filtered = filtered.filter(inv => inv.invoiceType === invoiceTypeFilter);
      }
    }
    if (paymentMethod) {
      filtered = filtered.filter(inv => inv.paymentMethod === paymentMethod);
    }
    if (seller) {
      filtered = filtered.filter(inv => inv.seller === seller);
    }
    console.log('DEBUG - getFilteredRows (with filters):', filtered);
    return filtered;
  };
  // عند الضغط على زر البحث: جلب البيانات مع الفلاتر
  const handleSearch = () => {
    console.log('DEBUG - handleSearch calling fetchInvoices');
    fetchInvoices({
      branchId,
      invoiceNumber,
      dateFrom,
      dateTo,
      warehouseId,
      customerName,
      customerPhone: customerPhoneFilter,
      itemName,
      itemNumber: itemNumberFilter
    }).then((result) => {
      // بعد جلب النتائج، إذا كان هناك اسم عميل محدد ونتيجة واحدة فقط، ضع رقم العميل تلقائياً
      // نستخدم النتائج الجديدة مباشرة
      if (customerName && Array.isArray(result)) {
        const filtered = result.filter(inv => inv.customer && inv.customer === customerName);
        if (filtered.length === 1 && filtered[0].customerPhone) {
          setCustomerPhoneFilter(filtered[0].customerPhone);
        }
      }
    });
  };
  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : branchId;
  };
  const handleExport = async () => {
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
    // استخراج كل الأصناف (items) من الفواتير المفلترة
    const allItems = invoices
      .filter(inv => {
        // نفس الفلاتر المستخدمة في الجدول
        if (invoiceTypeFilter) {
          if (invoiceTypeFilter === 'فاتورة' && inv.isReturn) return false;
          if (invoiceTypeFilter === 'مرتجع' && !inv.isReturn) return false;
          if (invoiceTypeFilter !== 'فاتورة' && invoiceTypeFilter !== 'مرتجع' && inv.invoiceType !== invoiceTypeFilter) return false;
        }
        if (paymentMethod && inv.paymentMethod !== paymentMethod) return false;
        if (seller && inv.seller !== seller) return false;
        return true;
      })
      .flatMap(inv => inv.itemData && Array.isArray(inv.itemData.items) ? inv.itemData.items.map((item, idx) => ({
        ...inv,
        // استخدم بيانات الصنف
        itemNumber: item.itemNumber || '',
        itemName: item.itemName || '',
        mainCategory: inv.mainCategory || '',
        quantity: Number(item.quantity) || Number(item.returnedQty) || 0,
        price: Number(item.price) || 0,
        discountValue: Number(item.discountValue) || 0,
        discountPercent: Number(item.discountPercent) || 0,
        taxValue: Number(item.taxValue) || 0,
        taxPercent: Number(item.taxPercent) || 0,
        net: Number(item.net) || 0,
        unit: item.unit || '',
        createdAt: item.createdAt || inv.createdAt,
        isReturn: inv.isReturn,
        invoiceType: inv.invoiceType,
        customerPhone: inv.customerPhone,
        customer: inv.customer,
        warehouse: item.warehouseId || inv.warehouse,
        // إجمالي بعد الخصم للصنف
        totalAfterDiscount: ((Number(item.price) || 0) * (Number(item.quantity) || Number(item.returnedQty) || 0)) - (Number(item.discountValue) || 0)
      })) : [inv]);

    const exportData = allItems.map(inv => {
      const sign = inv.invoiceType === 'مرتجع' ? -1 : 1;
      const parseTime = (val) => {
        if (!val) return '';
        if (typeof val === 'object' && val.seconds) {
          return dayjs(val.seconds * 1000).format('hh:mm:ss A');
        }
        if (typeof val === 'string') {
          const d = dayjs(val);
          if (d.isValid()) return d.format('hh:mm:ss A');
        }
        return '';
      };
      const price = Number(inv.price) || 0;
      const quantity = Number(inv.quantity) || 0;
      const discountValue = Number(inv.discountValue) || 0;
      // إجمالي بعد الخصم للصنف
      let totalAfterDiscount = typeof inv.totalAfterDiscount !== 'undefined'
        ? inv.totalAfterDiscount
        : (price * quantity) - discountValue;
      if (totalAfterDiscount < 0) totalAfterDiscount = 0;
      totalAfterDiscount = sign * totalAfterDiscount;
      return [
        // إذا كان مرتجع استخدم رقم المرتجع (referenceNumber) إن وجد
        (inv.isReturn && inv.itemData && inv.itemData.referenceNumber) ? inv.itemData.referenceNumber : inv.invoiceNumber,
        dayjs(inv.date).format('YYYY-MM-DD'),
        inv.invoiceType,
        inv.itemNumber,
        inv.itemName,
        inv.mainCategory || '',
        inv.quantity,
        inv.unit || inv.itemData?.unit || '',
        inv.price,
        inv.discountPercent + '%',
        (sign * discountValue).toFixed(2),
        totalAfterDiscount.toFixed(2),
        (sign * inv.taxValue).toFixed(2),
        (sign * inv.net).toFixed(2),
        inv.customer,
        (inv.customerPhone && inv.customerPhone.trim() !== '' ? inv.customerPhone : 'غير متوفر'),
        parseTime(inv.createdAt) || parseTime(inv.itemData?.createdAt) || (inv.date ? dayjs(inv.date).format('hh:mm:ss A') : ''),
        inv.taxPercent + '%',
        'ريال سعودي',
        getWarehouseName(inv.warehouse)
      ];
    });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('تقرير الفواتير المفضلة');
    sheet.columns = [
      { header: 'رقم الفاتورة', key: 'invoiceNumber', width: 20 },
      { header: 'تاريخ الفاتورة', key: 'date', width: 15 },
      { header: 'نوع الفاتورة', key: 'type', width: 12 },
      { header: 'كود الصنف', key: 'itemNumber', width: 14 },
      { header: 'اسم الصنف', key: 'itemName', width: 50 },
      { header: 'الفئة', key: 'mainCategory', width: 15 },
      { header: 'الكمية', key: 'quantity', width: 10 },
      { header: 'الوحدة', key: 'unit', width: 10 },
      { header: 'سعر الوحدة', key: 'price', width: 12 },
      { header: 'نسبة الخصم', key: 'discountPercent', width: 12 },
      { header: 'قيمة الخصم', key: 'discountValue', width: 14 },
      { header: 'الإجمالي بعد الخصم', key: 'totalAfterDiscount', width: 18 },
      { header: 'قيمة الضريبة المضافة', key: 'taxValue', width: 16 },
      { header: 'الصافي', key: 'net', width: 12 },
      { header: 'اسم العميل', key: 'customer', width: 45 },
      { header: 'رقم العميل', key: 'customerPhone', width: 18 },
      { header: 'وقت الإنشاء', key: 'createdAt', width: 14 },
      { header: 'نسبة الضريبة', key: 'taxPercent', width: 12 },
      { header: 'العملة', key: 'currency', width: 12 },
      { header: 'المخزن', key: 'warehouse', width: 15 },
    ];
    sheet.addRows(exportData);
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
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: sheet.columnCount }
    };
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_الفواتير_المفضلة_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  };
  // دالة لجلب اسم المخزن من القائمة
  const getWarehouseName = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse ? warehouse.name : warehouseId;
  };
  return (
    <div className="w-full min-h-screen p-4 md:p-6 flex flex-col gap-6 bg-gray-50">
      <div className="p-4 font-['Tajawal'] bg-white rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] mb-4 relative overflow-hidden">
        <div className="flex items-center">
          <h1 className="text-xl md:text-2xl font-bold text-blue-800">تقرير فواتير المبيعات التفصيلي</h1>
            <span className="animate-[wave_2s_infinite] text-2xl md:text-3xl mr-3">👋</span>        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500 animate-[pulse_3s_infinite]"></div>
      </div>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "التقارير" },
          { label: "تقرير الفواتير المفضلة" }
        ]}
      />
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
              value={dateFrom}
              onChange={setDateFrom}
              format="YYYY-MM-DD"
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
              value={dateTo}
              onChange={setDateTo}
              format="YYYY-MM-DD"
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
          {/* خيارات تصفية إضافية */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col"
          >
            <label className="text-sm mb-1 text-gray-600">اسم العميل</label>
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder="اسم العميل"
              value={customerName || undefined}
              onChange={value => {
                setCustomerName(value);
                // عند اختيار اسم العميل، ابحث عن أول رقم هاتف مطابق واملأه تلقائياً
                if (value) {
                  const found = invoices.find(inv => inv.customer === value && inv.customerPhone && inv.customerPhone.trim() !== '');
                  if (found) {
                    setCustomerPhoneFilter(found.customerPhone);
                  } else {
                    setCustomerPhoneFilter('');
                  }
                } else {
                  setCustomerPhoneFilter('');
                }
              }}
              allowClear
              filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
            >
              <Select.Option value="">الكل</Select.Option>
              {Array.from(new Set(invoices.map(inv => inv.customer).filter(s => !!s && s !== ''))).map(s => (
                <Select.Option key={s} value={s}>{s}</Select.Option>
              ))}
            </Select>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col"
          >
            <label className="text-sm mb-1 text-gray-600">رقم العميل</label>
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder="رقم العميل"
              value={customerPhoneFilter || undefined}
              onChange={value => {
                setCustomerPhoneFilter(value);
                // عند اختيار رقم العميل، ابحث عن أول اسم عميل مطابق واملأه تلقائياً
                if (value) {
                  const found = invoices.find(inv => inv.customerPhone === value && inv.customer && inv.customer.trim() !== '');
                  if (found) {
                    setCustomerName(found.customer);
                  } else {
                    setCustomerName('');
                  }
                } else {
                  setCustomerName('');
                }
              }}
              allowClear
              filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
            >
              <Select.Option value="">الكل</Select.Option>
              {Array.from(new Set(invoices.map(inv => inv.customerPhone).filter(s => !!s && s !== ''))).map(s => (
                <Select.Option key={s} value={s}>{s}</Select.Option>
              ))}
            </Select>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col"
          >
            <label className="text-sm mb-1 text-gray-600">اسم الصنف</label>
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder="اسم الصنف"
              value={itemName || undefined}
              onChange={value => {
                setItemName(value);
                // عند اختيار اسم الصنف، ابحث عن أول كود صنف مطابق واملأه تلقائياً
                if (value) {
                  const found = invoices.find(inv => inv.itemName === value && inv.itemNumber && inv.itemNumber.trim() !== '');
                  if (found) {
                    setItemNumberFilter(found.itemNumber);
                  } else {
                    setItemNumberFilter('');
                  }
                } else {
                  setItemNumberFilter('');
                }
              }}
              allowClear
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              options={[
                { label: 'الكل', value: '' },
                ...Array.from(new Set(invoices.map(inv => inv.itemName).filter(s => !!s && s !== ''))).map(s => ({ label: s, value: s }))
              ]}
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col"
          >
            <label className="text-sm mb-1 text-gray-600">كود الصنف</label>
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder="كود الصنف"
              value={itemNumberFilter || undefined}
              onChange={value => {
                setItemNumberFilter(value);
                // عند اختيار كود الصنف، ابحث عن أول اسم صنف مطابق واملأه تلقائياً
                if (value) {
                  const found = invoices.find(inv => inv.itemNumber === value && inv.itemName && inv.itemName.trim() !== '');
                  if (found) {
                    setItemName(found.itemName);
                  } else {
                    setItemName('');
                  }
                } else {
                  setItemName('');
                }
              }}
              allowClear
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              options={[
                { label: 'الكل', value: '' },
                ...Array.from(new Set(invoices.map(inv => inv.itemNumber).filter(s => !!s && s !== ''))).map(s => ({ label: s, value: s }))
              ]}
            />
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
                    allowClear
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
                    <Option value="">اختر البائع</Option>
                    {Array.from(new Set(invoices.map(inv => inv.seller).filter(s => !!s && s !== ''))).map(s => (
                      <Option key={s} value={s}>{s}</Option>
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
          <span className="text-gray-500 text-sm">نتائج البحث: {getFilteredRows().length}</span>
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
        <div className="overflow-x-auto mt-4">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden border rounded-lg">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-blue-600">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-white text-center border border-gray-300 w-56 min-w-[14rem]">رقم الفاتورة</th>
                    <th className="px-4 py-3 text-xs font-medium text-white text-center border border-gray-300 w-44 min-w-[10rem]">تاريخ الفاتورة</th>
                    <th className="px-4 py-3 text-xs font-medium text-white text-center border border-gray-300">نوع الفاتورة</th>
                    <th className="px-4 py-3 text-xs font-medium text-white text-center border border-gray-300">كود الصنف</th>
                    <th className="px-4 py-3 text-xs font-medium text-white text-center border border-gray-300">اسم الصنف</th>
                    <th className="px-4 py-3 text-xs font-medium text-white text-center border border-gray-300">الفئة</th>
                    <th className="px-4 py-3 text-xs font-medium text-white text-center border border-gray-300">الكمية</th>
                    <th className="px-4 py-3 text-xs font-medium text-white text-center border border-gray-300">الوحدة</th>
                    <th className="px-4 py-3 text-xs font-medium text-white text-center border border-gray-300">سعر الوحدة</th>
                    <th className="px-4 py-3 text-xs font-medium text-white text-center border border-gray-300">نسبة الخصم</th>
                    <th className="px-4 py-3 text-xs font-medium text-white text-center border border-gray-300">قيمة الخصم</th>
                    <th className="px-4 py-3 text-xs font-medium text-white text-center border border-gray-300">الإجمالي بعد الخصم</th>
                    <th className="px-4 py-3 text-xs font-medium text-white text-center border border-gray-300">قيمة الضريبة المضافة</th>
                    <th className="px-4 py-3 text-xs font-medium text-white text-center border border-gray-300">الصافي</th>
                    <th className="px-4 py-3 text-xs font-medium text-white text-center border border-gray-300 w-64 min-w-[15rem] ">اسم العميل</th>
                    <th className="px-4 py-3 text-xs font-medium text-white text-center border border-gray-300">رقم العميل</th>

                    <th className="px-4 py-3 text-xs font-medium text-white text-center border border-gray-300">وقت الإنشاء</th>
                    <th className="px-4 py-3 text-xs font-medium text-white text-center border border-gray-300">نسبة الضريبة</th>
                    <th className="px-4 py-3 text-xs font-medium text-white text-center border border-gray-300">العملة</th>
                    <th className="px-4 py-3 text-xs font-medium text-white text-center border border-gray-300">المخزن</th>
                  </tr>
                </thead>
                <tbody className="bg-white">

                  {getFilteredRows().length > 0 ? (
                    <>
                      {getFilteredRows().map((inv, idx) => {
                        const sign = inv.invoiceType === 'مرتجع' ? -1 : 1;
                        return (
                          <tr
                            key={inv.invoiceNumber + '-' + inv.invoiceType + '-' + inv.itemNumber + '-' + idx}
                            className={
                              `${idx % 2 === 0 ? 'bg-blue-50' : 'bg-transparent'} transition-colors duration-150 hover:bg-blue-100 cursor-pointer`
                            }
                          >
                            <td className="px-4 py-2 text-center border border-gray-300 w-40 min-w-[10rem]">{inv.invoiceNumber}</td>
                            <td className="px-4 py-2 text-center border border-gray-300 w-44 min-w-[10rem]">{dayjs(inv.date).format('YYYY-MM-DD')}</td>
                            <td className="px-4 py-2 text-center border border-gray-300 w-23 min-w-[6rem]">{inv.invoiceType}</td>
                            <td className="px-4 py-2 text-center border border-gray-300 w-30 min-w-[8rem]">{inv.itemNumber}</td>
                            <td className="px-4 py-2 text-center border border-gray-300 w-55 min-w-[14rem]">{inv.itemName}</td>
                            <td className="px-4 py-2 text-center border border-gray-300 w-44 min-w-[8rem]">{inv.mainCategory || ''}</td>
                            <td className="px-4 py-2 text-center border border-gray-300">{inv.quantity}</td>
                            <td className="px-4 py-2 text-center border border-gray-300">{inv.unit || ''}</td>
                            <td className="px-4 py-2 text-center border border-gray-300">{inv.price}</td>
                            <td className="px-4 py-2 text-center border border-gray-300">{inv.discountPercent}%</td>
                            <td className="px-4 py-2 text-center border border-gray-300">{(sign * (inv.discountValue || 0)).toFixed(2)}</td>
                            <td className="px-4 py-2 text-center border border-gray-300">{(sign * (inv.totalAfterDiscount ?? ((inv.price || 0) * (inv.quantity || 0) - (inv.discountValue || 0)))).toFixed(2)}</td>
                            <td className="px-4 py-2 text-center border border-gray-300">{(sign * (inv.taxValue || 0)).toFixed(2)}</td>
                            <td className="px-4 py-2 text-center border border-gray-300">{(sign * (inv.net || 0)).toFixed(2)}</td>
                            <td className="px-4 py-2 text-center border border-gray-300">{inv.customer}</td>
                            <td className="px-4 py-2 text-center border border-gray-300">{inv.customerPhone && inv.customerPhone.trim() !== '' ? inv.customerPhone : 'غير متوفر'}</td>
                            <td className="px-4 py-2 text-center border border-gray-300 w-44 min-w-[8rem]">{
                              (() => {
                                const parseTime = (val: { seconds?: number } | string | undefined | null) => {
                                  if (!val) return '';
                                  if (typeof val === 'object' && val.seconds) {
                                    return dayjs(val.seconds * 1000).format('hh:mm:ss A');
                                  }
                                  if (typeof val === 'string') {
                                    const d = dayjs(val);
                                    if (d.isValid()) return d.format('hh:mm:ss A');
                                  }
                                  return '';
                                };
                                return (
                                  parseTime(inv.createdAt) ||
                                  (inv.date ? dayjs(inv.date).format('hh:mm:ss A') : '')
                                );
                              })()
                            }</td>
                            <td className="px-4 py-2 text-center border border-gray-300">{inv.taxPercent}%</td>
                            <td className="px-4 py-2 text-center border border-gray-300 w-44 min-w-[10rem]">ريال سعودي</td>
                            <td className="px-4 py-2 text-center border border-gray-300 w-44 min-w-[10rem]">{getWarehouseName(inv.warehouse)}</td>
                          </tr>
                        );
                      })}
                      {/* صف الإجمالي */}
                      {
                        (() => {
                          const rows = getFilteredRows();
                          let totalDiscount = 0, totalAfterDiscount = 0, totalTax = 0, totalNet = 0;
                          rows.forEach(inv => {
                            const sign = inv.invoiceType === 'مرتجع' ? -1 : 1;
                            totalDiscount += sign * (inv.discountValue || 0);
                            totalAfterDiscount += sign * (inv.totalAfterDiscount ?? ((inv.price || 0) * (inv.quantity || 0) - (inv.discountValue || 0)));
                            totalTax += sign * (inv.taxValue || 0);
                            totalNet += sign * (inv.net || 0);
                          });
                          return (
                            <tr className=" font-bold">
                              <td className="px-4 py-2 text-center border border-gray-300" colSpan={10}>الإجمالي</td>
                              <td className="px-4 py-2 text-center border border-gray-300">{totalDiscount.toFixed(2)}</td>
                              <td className="px-4 py-2 text-center border border-gray-300">{totalAfterDiscount.toFixed(2)}</td>
                              <td className="px-4 py-2 text-center border border-gray-300">{totalTax.toFixed(2)}</td>
                              <td className="px-4 py-2 text-center border border-gray-300">{totalNet.toFixed(2)}</td>
                              <td className="px-4 py-2 text-center border border-gray-300" colSpan={5}></td>
                            </tr>
                          );
                        })()
                      }
                    </>
                  ) : (
                    <tr>
                      <td 
                        className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center border border-gray-300" 
                        colSpan={19}
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

export default InvoicePreferred;
