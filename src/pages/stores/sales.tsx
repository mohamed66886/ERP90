import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import dayjs from 'dayjs';
import { Button, Input, Select, Table, message, Form, Row, Col, DatePicker, Spin } from 'antd';
import * as XLSX from 'xlsx';
import Divider from 'antd/es/divider';
import Card from 'antd/es/card';
import { PlusOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
import { db } from '@/lib/firebase';

// تعريف نوع العنصر
interface InventoryItem {
  id: string;
  name: string;
  itemCode?: string;
  salePrice?: number;
  discount?: number;
  isVatIncluded?: boolean;
  type?: string;
}

interface InvoiceItem {
  itemNumber: string;
  itemName: string;
  quantity: string;
  unit: string;
  price: string;
  discountPercent: string;
  discountValue: number;
  taxPercent: string;
  taxValue: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  entryNumber: string;
  date: string;
  paymentMethod: string;
  branch: string;
  warehouse: string;
  customerNumber: string;
  customerName: string;
  delegate: string;
  priceRule: string;
  commercialRecord: string;
  taxFile: string;
}

interface Totals {
  afterDiscount: number;
  afterTax: number;
  total: number;
}

interface InvoiceRecord {
  key: string;
  invoiceNumber: string;
  date: string;
  branch: string; // إضافة الفرع
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
  itemData?: any; // لإظهار بيانات الصنف المؤقتة
}

const initialItem: InvoiceItem = {
  itemNumber: '',
  itemName: '',
  quantity: '',
  unit: 'قطعة',
  price: '',
  discountPercent: '0',
  discountValue: 0,
  taxPercent: '15',
  taxValue: 0,
  total: 0
};

function generateInvoiceNumber(branchCode?: string | number): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  // إذا كان هناك كود فرع رقمي، أضفه لرقم الفاتورة
  const branchPart = branchCode && !isNaN(Number(branchCode)) ? String(Number(branchCode)).padStart(3, '0') + '-' : '';
  return `INV-${branchPart}${y}${m}${d}-${rand}`;
}

function getTodayString(): string {
  return dayjs().format('YYYY-MM-DD');
}

const SalesPage: React.FC = () => {
  // دالة تصدير سجل الفواتير إلى ملف Excel
  const exportInvoicesToExcel = () => {
    if (!invoices.length) {
      message.warning('لا يوجد بيانات للتصدير');
      return;
    }
    // تجهيز البيانات
    const data = invoices.map(inv => {
      // البحث عن اسم المخزن بناءً على id
      let warehouseName = inv.warehouse;
      if (warehouses && Array.isArray(warehouses)) {
        const found = warehouses.find(w => w.id === inv.warehouse);
        if (found) warehouseName = found.name || found.id;
      }
      // البحث عن اسم الفرع بناءً على id
      let branchName = inv.branch;
      if (branches && Array.isArray(branches)) {
        const foundBranch = branches.find(b => b.id === inv.branch);
        if (foundBranch) branchName = foundBranch.name || foundBranch.id;
      }
      return {
        'رقم الفاتورة': inv.invoiceNumber,
        'التاريخ': inv.date,
        'الفرع': branchName,
        'كود الصنف': inv.itemNumber,
        'اسم الصنف': inv.itemName,
        'المجموعة الرئيسية': inv.firstLevelCategory || '',
        'المستوى الأول': inv.mainCategory || '',
        'الكمية': inv.quantity,
        'السعر': inv.price,
        'الإجمالي': inv.total,
        'قيمة الخصم': inv.discountValue,
        '% الخصم': inv.discountPercent,
        'قيمة الضريبة': inv.taxValue,
        '% الضريبة': inv.taxPercent,
        'الصافي': inv.net,
        'التكلفة': inv.cost,
        'ربح الصنف': inv.profit,
        'المخزن': warehouseName,
        'العميل': inv.customer,
        'تليفون العميل': inv.customerPhone,
        'البائع': inv.seller,
        'طريقة الدفع': inv.paymentMethod,
        'نوع الفاتورة': inv.invoiceType
      };
    });

    // بيانات الشركة (يمكنك التعديل)
    const companyInfo = ['شركة حساب عربي', 'الهاتف: 01000000000', 'العنوان: القاهرة - مصر'];
    const companyTitle = 'سجل فواتير المبيعات';
    const userName = (user?.displayName || user?.name || user?.email || '');
    const exportDate = new Date().toLocaleString('ar-EG');

    // إجماليات
    const totalsRow = {
      'رقم الفاتورة': 'الإجماليات',
      'التاريخ': '',
      'الفرع': '',
      'كود الصنف': '',
      'اسم الصنف': '',
      'المجموعة الرئيسية': '',
      'المستوى الأول': '',
      'الكمية': data.reduce((sum, r) => sum + Number(r['الكمية'] || 0), 0),
      'السعر': '',
      'الإجمالي': data.reduce((sum, r) => sum + Number(r['الإجمالي'] || 0), 0),
      'قيمة الخصم': data.reduce((sum, r) => sum + Number(r['قيمة الخصم'] || 0), 0),
      '% الخصم': '',
      'قيمة الضريبة': data.reduce((sum, r) => sum + Number(r['قيمة الضريبة'] || 0), 0),
      '% الضريبة': '',
      'الصافي': data.reduce((sum, r) => sum + Number(r['الصافي'] || 0), 0),
      'التكلفة': data.reduce((sum, r) => sum + Number(r['التكلفة'] || 0), 0),
      'ربح الصنف': data.reduce((sum, r) => sum + Number(r['ربح الصنف'] || 0), 0),
      'المخزن': '',
      'العميل': '',
      'تليفون العميل': '',
      'البائع': '',
      'طريقة الدفع': '',
      'نوع الفاتورة': ''
    };

    // بناء الورقة
    const ws = XLSX.utils.json_to_sheet([]);
    // عنوان الشركة
    XLSX.utils.sheet_add_aoa(ws, [[companyTitle]], { origin: 'A1' });
    ws['!merges'] = ws['!merges'] || [];
    const colCount = Object.keys(data[0]).length;
    ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } });
    // بيانات الشركة
    XLSX.utils.sheet_add_aoa(ws, [companyInfo], { origin: 'A2' });
    ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } });
    // إضافة البيانات مع رؤوس الأعمدة
    XLSX.utils.sheet_add_json(ws, data, { origin: 'A4', header: Object.keys(data[0]) });
    // صف الإجماليات
    XLSX.utils.sheet_add_json(ws, [totalsRow], { origin: `A${data.length + 5}`, skipHeader: true });
    // ترويسة التصدير
    XLSX.utils.sheet_add_aoa(ws, [[`تم التصدير بواسطة: ${userName} - التاريخ: ${exportDate}`]], { origin: `A${data.length + 7}` });
    ws['!merges'].push({ s: { r: data.length + 6, c: 0 }, e: { r: data.length + 6, c: colCount - 1 } });

    // تنسيق العنوان الرئيسي
    const titleCell = ws[XLSX.utils.encode_cell({ r: 0, c: 0 })];
    if (titleCell) {
      titleCell.s = {
        font: { bold: true, sz: 18, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '305496' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }
    // تنسيق بيانات الشركة
    const infoCell = ws[XLSX.utils.encode_cell({ r: 1, c: 0 })];
    if (infoCell) {
      infoCell.s = {
        font: { bold: true, sz: 12, color: { rgb: '305496' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }
    // تنسيق صف العناوين
    const headerRow = 3; // الصف الرابع (A4)
    for (let c = 0; c < colCount; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r: headerRow, c })];
      if (cell) {
        cell.s = {
          font: { bold: true, sz: 13, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '4472C4' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: 'AAAAAA' } },
            bottom: { style: 'thin', color: { rgb: 'AAAAAA' } },
            left: { style: 'thin', color: { rgb: 'AAAAAA' } },
            right: { style: 'thin', color: { rgb: 'AAAAAA' } }
          }
        };
      }
    }
    // تنسيق الأرقام وتوسيط الأعمدة وإضافة حدود
    const rowCount = data.length;
    for (let r = headerRow + 1; r <= headerRow + rowCount + 1; r++) {
      for (let c = 0; c < colCount; c++) {
        const cell = ws[XLSX.utils.encode_cell({ r, c })];
        if (cell) {
          // تنسيق الأرقام لبعض الأعمدة
          if ([6,7,8,9,10,11,12,13,14,15,16].includes(c)) {
            cell.z = '#,##0.00';
          }
          // إبراز الصافي والربح في صف الإجماليات
          if (r === headerRow + rowCount + 1 && (c === 13 || c === 15)) {
            cell.s = {
              font: { bold: true, sz: 13, color: { rgb: 'FFFFFF' } },
              fill: { fgColor: { rgb: c === 13 ? '70AD47' : 'FFC000' } },
              alignment: { horizontal: 'center', vertical: 'center' },
              border: {
                top: { style: 'thin', color: { rgb: 'AAAAAA' } },
                bottom: { style: 'thin', color: { rgb: 'AAAAAA' } },
                left: { style: 'thin', color: { rgb: 'AAAAAA' } },
                right: { style: 'thin', color: { rgb: 'AAAAAA' } }
              }
            };
          } else {
            cell.s = {
              alignment: { horizontal: 'center', vertical: 'center' },
              border: {
                top: { style: 'thin', color: { rgb: 'AAAAAA' } },
                bottom: { style: 'thin', color: { rgb: 'AAAAAA' } },
                left: { style: 'thin', color: { rgb: 'AAAAAA' } },
                right: { style: 'thin', color: { rgb: 'AAAAAA' } }
              }
            };
          }
        }
      }
    }
    // ترويسة التصدير
    const footerCell = ws[XLSX.utils.encode_cell({ r: data.length + 6, c: 0 })];
    if (footerCell) {
      footerCell.s = {
        font: { italic: true, sz: 11, color: { rgb: '888888' } },
        alignment: { horizontal: 'right', vertical: 'center' }
      };
    }
    // ضبط عرض الأعمدة تلقائيًا حسب المحتوى
    ws['!cols'] = Object.keys(data[0]).map((k, i) => {
      const maxLen = Math.max(
        k.length,
        ...data.map(row => String(row[k] ?? '').length),
        String(totalsRow[k] ?? '').length
      );
      return { wch: Math.min(Math.max(maxLen + 2, 12), 30) };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'سجل الفواتير');
    XLSX.writeFile(wb, `سجل_الفواتير_${new Date().toISOString().slice(0,10)}.xlsx`);
  };
  const { user } = useAuth();
  const [invoiceType, setInvoiceType] = useState<'ضريبة مبسطة' | 'ضريبة'>('ضريبة مبسطة');
  const [warehouseMode, setWarehouseMode] = useState<'single' | 'multiple'>('single');
  const [branchCode, setBranchCode] = useState<string>('');
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: generateInvoiceNumber(),
    entryNumber: '',
    date: getTodayString(),
    paymentMethod: '',
    branch: '',
    warehouse: '',
    customerNumber: '',
    customerName: '',
    delegate: user?.displayName || user?.name || user?.email || '',
    priceRule: '',
    commercialRecord: '',
    taxFile: ''
  });
  const [delegates, setDelegates] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [priceRules, setPriceRules] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [itemNames, setItemNames] = useState<InventoryItem[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingItems, setFetchingItems] = useState<boolean>(false);
  const [item, setItem] = useState<InvoiceItem & { warehouseId?: string }>(initialItem);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [totals, setTotals] = useState<Totals>({
    afterDiscount: 0,
    afterTax: 0,
    total: 0
  });
  const [taxRate, setTaxRate] = useState<string>('15');
  const [priceType, setPriceType] = useState<'سعر البيع' | 'آخر سعر العميل'>('سعر البيع');
  const [invoices, setInvoices] = useState<(InvoiceRecord & { firstLevelCategory?: string })[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState<boolean>(false);

  // جلب الفواتير من Firebase
  const fetchInvoices = async () => {
    try {
      setInvoicesLoading(true);
      const invoicesSnap = await getDocs(collection(db, 'sales_invoices'));
      const invoicesData: (InvoiceRecord & { firstLevelCategory?: string })[] = [];
      // جلب الأصناف لتعريف المستويات
      let inventoryItems: any[] = [];
      try {
        const itemsSnap = await getDocs(collection(db, 'inventory_items'));
        inventoryItems = itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch {}
      
      invoicesSnap.forEach(doc => {
        const data = doc.data();
        if (Array.isArray(data.items)) {
          data.items.forEach((item: any) => {
            // البحث عن الصنف لجلب المستويات
            const foundItem = inventoryItems.find(i => i.name === item.itemName);
            // البحث عن اسم الصنف الرئيسي (الأب) واسمه الأعلى (الجد) إذا كان هناك parentId
            let parentName = '';
            let grandParentName = '';
            if (foundItem && foundItem.parentId) {
              const parentItem = inventoryItems.find(i => i.id === foundItem.parentId || i.id === String(foundItem.parentId));
              parentName = parentItem?.name || '';
              if (parentItem && parentItem.parentId) {
                const grandParentItem = inventoryItems.find(i => i.id === parentItem.parentId || i.id === String(parentItem.parentId));
                grandParentName = grandParentItem?.name || '';
              }
            }
            invoicesData.push({
              key: doc.id + '-' + item.itemNumber,
              invoiceNumber: data.invoiceNumber || 'N/A',
              date: data.date || '',
              branch: data.branch || '',
              itemNumber: item.itemNumber || 'N/A',
              itemName: item.itemName || '',
              mainCategory: parentName,
              firstLevelCategory: grandParentName,
              quantity: Number(item.quantity) || 0,
              price: Number(item.price) || 0,
              total: Number(item.total) || 0,
              discountValue: Number(item.discountValue) || 0,
              discountPercent: Number(item.discountPercent) || 0,
              taxValue: Number(item.taxValue) || 0,
              taxPercent: Number(item.taxPercent) || 0,
              net: (Number(item.total) - Number(item.discountValue) + Number(item.taxValue)) || 0,
              cost: Number(item.cost) || 0,
              profit: (Number(item.total) - Number(item.discountValue) - Number(item.cost)) || 0,
              warehouse: data.warehouse || '',
              customer: data.customerName || '',
              customerPhone: data.customerNumber || '',
              seller: data.delegate || '',
              paymentMethod: data.paymentMethod || '',
              invoiceType: data.type || '',
              itemData: foundItem || {}
            });
          });
        }
      });
      setInvoices(invoicesData);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      message.error('تعذر تحميل سجل الفواتير');
    } finally {
      setInvoicesLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // جلب نسبة الضريبة من إعدادات الشركة (companies)
  useEffect(() => {
    const fetchTaxRate = async () => {
      try {
        const companiesSnap = await getDocs(collection(db, 'companies'));
        if (!companiesSnap.empty) {
          const companyData = companiesSnap.docs[0].data();
          if (companyData.taxRate) setTaxRate(String(companyData.taxRate));
        }
      } catch (err) {
        console.error('Failed to fetch tax rate from company settings:', err);
      }
    };
    fetchTaxRate();
  }, []);

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvoiceData({ ...invoiceData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (invoiceType !== 'ضريبة') {
      setInvoiceData(prev => ({ ...prev, commercialRecord: '', taxFile: '' }));
    }
  }, [invoiceType]);

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const fetchLastCustomerPrice = async (customerName: string, itemName: string) => {
    try {
      const salesSnap = await getDocs(collection(db, 'sales_invoices'));
      const filtered = salesSnap.docs
        .map(doc => doc.data())
        .filter(inv => inv.customerName === customerName && Array.isArray(inv.items))
        .flatMap(inv => inv.items.filter((it: any) => it.itemName === itemName))
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (filtered.length > 0) {
        return filtered[0].price;
      }
    } catch (err) {
      // ignore error
    }
    return '';
  };

  const calculateItemValues = (item: InvoiceItem) => {
    const quantity = Math.max(0, Number(item.quantity) || 0);
    const price = Math.max(0, Number(item.price) || 0);
    const discountPercent = Math.min(100, Math.max(0, Number(item.discountPercent) || 0));
    const taxPercent = Math.max(0, Number(item.taxPercent) || 0);
    
    const subtotal = price * quantity;
    const discountValue = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountValue;
    const taxValue = taxableAmount * (taxPercent / 100);
    
    return {
      discountValue: parseFloat(discountValue.toFixed(2)),
      taxValue: parseFloat(taxValue.toFixed(2)),
      total: parseFloat(subtotal.toFixed(2))
    };
  };

  const addItem = () => {
    if (!item.itemName || !item.quantity || !item.price) {
      message.warning('يجب إدخال اسم الصنف، الكمية والسعر');
      return;
    }

    if (isNaN(Number(item.quantity)) || isNaN(Number(item.price))) {
      message.warning('يجب أن تكون الكمية والسعر أرقاماً صحيحة');
      return;
    }

    if (warehouseMode === 'multiple' && !item.warehouseId) {
      message.warning('يرجى اختيار المخزن لهذا الصنف');
      return;
    }

    const { discountValue, taxValue, total } = calculateItemValues(item);
    // جلب بيانات الصنف من قائمة الأصناف
    const selected = itemNames.find(i => i.name === item.itemName);
    const mainCategory = selected?.type || '';
    // إذا كان يوجد cost في بيانات الصنف
    const cost = selected && typeof (selected as any).cost !== 'undefined' ? Number((selected as any).cost) : 0;

    const newItem: InvoiceItem & { warehouseId?: string; mainCategory?: string; cost?: number } = {
      ...item,
      itemNumber: item.itemNumber || 'N/A',
      discountValue,
      taxValue,
      total,
      mainCategory,
      cost
    };

    const newItems = [...items, newItem];
    setItems(newItems);
    setItem(initialItem);
    updateTotals(newItems);
  };

  const updateTotals = (itemsList: InvoiceItem[]) => {
    const calculated = itemsList.reduce((acc, item) => {
      const lineTotal = item.total || 0;
      const discount = item.discountValue || 0;
      const tax = item.taxValue || 0;
      
      return {
        afterDiscount: acc.afterDiscount + (lineTotal - discount),
        afterTax: acc.afterTax + (lineTotal - discount + tax),
        total: acc.total + lineTotal
      };
    }, { afterDiscount: 0, afterTax: 0, total: 0 });
    
    setTotals({
      afterDiscount: parseFloat(calculated.afterDiscount.toFixed(2)),
      afterTax: parseFloat(calculated.afterTax.toFixed(2)),
      total: parseFloat(calculated.total.toFixed(2))
    });
  };

  const handleSave = async () => {
    if (items.length === 0) {
      message.error('لا يمكن حفظ فاتورة بدون أصناف');
      return;
    }
    setLoading(true);
    // حذف الحقول الفارغة من بيانات الفاتورة
    const cleanInvoiceData = Object.fromEntries(
      Object.entries(invoiceData).filter(([_, v]) => v !== '')
    );
    const invoice = {
      ...cleanInvoiceData,
      items,
      totals,
      type: invoiceType,
      createdAt: new Date().toISOString()
    };
    try {
      // حفظ الفاتورة في Firestore مباشرة
      const { addDoc, collection } = await import('firebase/firestore');
      await addDoc(collection(db, 'sales_invoices'), invoice);
      message.success('تم حفظ الفاتورة بنجاح!');
      // إعادة تعيين النموذج
      setItems([]);
      setTotals({ afterDiscount: 0, afterTax: 0, total: 0 });
      setInvoiceData({
        invoiceNumber: generateInvoiceNumber(branchCode),
        entryNumber: '',
        date: getTodayString(),
        paymentMethod: '',
        branch: '',
        warehouse: '',
        customerNumber: '',
        customerName: '',
        delegate: '',
        priceRule: '',
        commercialRecord: '',
        taxFile: ''
      });
      // تحديث سجل الفواتير
      await fetchInvoices();
    } catch (err) {
      console.error('Error saving invoice:', err);
      message.error(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const itemColumns = [
    { 
      title: 'كود الصنف', 
      dataIndex: 'itemNumber',
      width: 100,
      align: 'center' as const
    },
    { 
      title: 'اسم الصنف', 
      dataIndex: 'itemName',
      width: 150
    },
    { 
      title: 'الكمية', 
      dataIndex: 'quantity',
      width: 80,
      align: 'center' as const
    },
    { 
      title: 'الوحدة', 
      dataIndex: 'unit',
      width: 80,
      align: 'center' as const
    },
    // إظهار عمود المخزن فقط إذا كان وضع المخزن multiple
    ...(warehouseMode === 'multiple' ? [
      {
        title: 'المخزن',
        dataIndex: 'warehouseId',
        width: 120,
        align: 'center' as const,
        render: (warehouseId: string | undefined) => {
          if (!warehouseId) return '';
          const warehouse = warehouses.find(w => w.id === warehouseId);
          return warehouse ? warehouse.name || warehouse.id : warehouseId;
        }
      }
    ] : []),
    { 
      title: 'السعر', 
      dataIndex: 'price',
      width: 100,
      align: 'center' as const,
      render: (text: string) => `${parseFloat(text).toFixed(2)}`
    },
    { 
      title: '% الخصم', 
      dataIndex: 'discountPercent',
      width: 80,
      align: 'center' as const
    },
    { 
      title: 'قيمة الخصم', 
      dataIndex: 'discountValue',
      width: 100,
      align: 'center' as const,
      render: (text: number) => `${text.toFixed(2)}`
    },
    { 
      title: '% الضريبة', 
      dataIndex: 'taxPercent',
      width: 80,
      align: 'center' as const
    },
    { 
      title: 'قيمة الضريبة', 
      dataIndex: 'taxValue',
      width: 100,
      align: 'center' as const,
      render: (text: number) => `${text.toFixed(2)}`
    },
    { 
      title: 'الإجمالي', 
      dataIndex: 'total',
      width: 100,
      align: 'center' as const,
      render: (text: number) => `${text.toFixed(2)}`
    },
    {
      title: 'إجراءات',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: InvoiceItem, index: number) => (
        <Button 
          danger 
          size="small"
          onClick={() => {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
            updateTotals(newItems);
          }}
        >
          حذف
        </Button>
      )
    }
  ];

  const invoiceColumns = [
    {
      title: 'رقم الفاتورة',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 150,
      fixed: 'left' as const,
      sorter: (a: InvoiceRecord, b: InvoiceRecord) => a.invoiceNumber.localeCompare(b.invoiceNumber)
    },
    {
      title: 'التاريخ',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      sorter: (a: InvoiceRecord, b: InvoiceRecord) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (date: string) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: 'الفرع',
      dataIndex: 'branch',
      key: 'branch',
      width: 120,
      render: (branchId: string) => {
        const branch = branches.find(b => b.id === branchId);
        return branch ? (branch.name || branch.id) : branchId;
      }
    },
    {
      title: 'كود الصنف',
      dataIndex: 'itemNumber',
      key: 'itemNumber',
      width: 100,
      align: 'center' as const
    },
    {
      title: 'اسم الصنف',
      dataIndex: 'itemName',
      key: 'itemName',
      width: 150
    },
    {
      title: 'المجموعة الرئيسية',
      dataIndex: 'firstLevelCategory',
      key: 'firstLevelCategory',
      width: 150,
      render: (value: string) => value || ''
    },
    {
      title: 'المستوى الأول',
      dataIndex: 'mainCategory',
      key: 'mainCategory',
      width: 150,
      render: (value: string) => value || ''
    },
    {
      title: 'الكمية',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center' as const,
      sorter: (a: InvoiceRecord, b: InvoiceRecord) => a.quantity - b.quantity,
      render: (quantity: number) => Math.round(quantity).toString()
    },
    {
      title: 'السعر',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      align: 'center' as const,
      sorter: (a: InvoiceRecord, b: InvoiceRecord) => a.price - b.price,
      render: (price: number) => price.toFixed(2)
    },
    {
      title: 'الإجمالي',
      dataIndex: 'total',
      key: 'total',
      width: 100,
      align: 'center' as const,
      sorter: (a: InvoiceRecord, b: InvoiceRecord) => a.total - b.total,
      render: (total: number) => total.toFixed(2)
    },
    {
      title: 'قيمة الخصم',
      dataIndex: 'discountValue',
      key: 'discountValue',
      width: 100,
      align: 'center' as const,
      sorter: (a: InvoiceRecord, b: InvoiceRecord) => a.discountValue - b.discountValue,
      render: (discount: number) => discount.toFixed(2)
    },
    {
      title: '% الخصم',
      dataIndex: 'discountPercent',
      key: 'discountPercent',
      width: 80,
      align: 'center' as const,
      sorter: (a: InvoiceRecord, b: InvoiceRecord) => a.discountPercent - b.discountPercent,
      render: (percent: number) => percent.toFixed(2)
    },
    {
      title: 'قيمة الضريبة',
      dataIndex: 'taxValue',
      key: 'taxValue',
      width: 100,
      align: 'center' as const,
      sorter: (a: InvoiceRecord, b: InvoiceRecord) => a.taxValue - b.taxValue,
      render: (tax: number) => tax.toFixed(2)
    },
    {
      title: '% الضريبة',
      dataIndex: 'taxPercent',
      key: 'taxPercent',
      width: 80,
      align: 'center' as const,
      sorter: (a: InvoiceRecord, b: InvoiceRecord) => a.taxPercent - b.taxPercent,
      render: (percent: number) => percent.toFixed(2)
    },
    {
      title: 'الصافي',
      dataIndex: 'net',
      key: 'net',
      width: 100,
      align: 'center' as const,
      sorter: (a: InvoiceRecord, b: InvoiceRecord) => a.net - b.net,
      render: (net: number) => net.toFixed(2)
    },
    {
      title: 'التكلفة',
      dataIndex: 'cost',
      key: 'cost',
      width: 100,
      align: 'center' as const,
      sorter: (a: InvoiceRecord, b: InvoiceRecord) => a.cost - b.cost,
      render: (cost: number) => cost.toFixed(2)
    },
    {
      title: 'ربح الصنف',
      dataIndex: 'profit',
      key: 'profit',
      width: 100,
      align: 'center' as const,
      sorter: (a: InvoiceRecord, b: InvoiceRecord) => a.profit - b.profit,
      render: (profit: number) => profit.toFixed(2)
    },
    {
      title: 'المخزن',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: 120
    ,
      render: (warehouseId: string) => {
        const warehouse = warehouses.find(w => w.id === warehouseId);
        return warehouse ? (warehouse.name || warehouse.id) : warehouseId;
      }
    },
    {
      title: 'العميل',
      dataIndex: 'customer',
      key: 'customer',
      width: 150
    },
    {
      title: 'تليفون العميل',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
      width: 120
    },
    {
      title: 'البائع',
      dataIndex: 'seller',
      key: 'seller',
      width: 150
    },
    {
      title: 'طريقة الدفع',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 120
    },
    {
      title: 'نوع الفاتورة',
      dataIndex: 'invoiceType',
      key: 'invoiceType',
      width: 120,
      render: (type: string) => type === 'ضريبة' ? 'ضريبة' : 'ضريبة مبسطة'
    },
    // ...existing code...
  ];

  // جلب القوائم من Firebase
  useEffect(() => {
    const fetchLists = async () => {
      try {
        setFetchingItems(true);
        // جلب الفروع
        const branchesSnap = await getDocs(collection(db, 'branches'));
        setBranches(branchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        // جلب طرق الدفع
        const paymentSnap = await getDocs(collection(db, 'paymentMethods'));
        setPaymentMethods(paymentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        // جلب العملاء من صفحة العملاء (collection: 'customers')
        const customersSnap = await getDocs(collection(db, 'customers'));
        setCustomers(customersSnap.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, ...data, taxFile: data.taxFile || '' };
        }));
        // جلب المخازن
        const warehousesSnap = await getDocs(collection(db, 'warehouses'));
        setWarehouses(warehousesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        // قوائم ثابتة
        setUnits(['قطعة', 'كرتونة', 'كيلو', 'جرام', 'لتر', 'متر', 'علبة']);
        setPriceRules(['السعر العادي', 'سعر الجملة', 'سعر التخفيض']);
        // جلب الأصناف
        const itemsSnap = await getDocs(collection(db, 'inventory_items'));
        const itemsData = itemsSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            itemCode: data.itemCode || '',
            salePrice: data.salePrice || 0,
            discount: data.discount || 0,
            isVatIncluded: data.isVatIncluded || false,
            type: data.type || ''
          };
        }).filter(item => item.name);
        setItemNames(itemsData);
      } catch (err) {
        console.error('Error fetching lists:', err);
        message.error('تعذر تحميل القوائم من قاعدة البيانات');
      } finally {
        setFetchingItems(false);
      }
    };
    fetchLists();
  }, []);

  // حساب الإجماليات باستخدام useMemo لتحسين الأداء
  const totalsDisplay = useMemo(() => ({
    total: totals.total.toFixed(2),
    discount: (totals.total - totals.afterDiscount).toFixed(2),
    tax: (totals.afterTax - totals.afterDiscount).toFixed(2),
    net: totals.afterTax.toFixed(2)
  }), [totals]);

  // حالة إظهار/إخفاء جدول سجل الفواتير
  const [showInvoicesTable, setShowInvoicesTable] = useState(false);

  return (
    <div className="p-4">
      <style>{`
        body, .ant-typography, .ant-input, .ant-select, .ant-btn, .ant-card, .ant-table, .ant-form, .ant-row, .ant-col, .ant-picker, .ant-spin {
          font-family: 'Cairo', 'sans-serif' !important;
        }
      `}</style>
      <Spin spinning={fetchingItems}>
        <Card 
          title={
            <div className="flex items-center gap-4">
              <span>فاتورة مبيعات</span>
              <Select
                value={invoiceType}
                style={{ minWidth: 140 }}
                onChange={setInvoiceType}
                size="small"
                options={[
                  { label: 'ضريبة مبسطة', value: 'ضريبة مبسطة' },
                  { label: 'ضريبة', value: 'ضريبة' }
                ]}
              />
              <Select
                value={warehouseMode}
                style={{ minWidth: 150 }}
                onChange={setWarehouseMode}
                size="small"
                options={[
                  { label: 'مخزن واحد', value: 'single' },
                  { label: 'مخازن متعددة', value: 'multiple' }
                ]}
              />
              <Select
                value={priceType}
                style={{ minWidth: 150, fontFamily: 'Cairo, sans-serif' }}
                onChange={async (value) => {
                  setPriceType(value);
                  if (value === 'آخر سعر العميل' && item.itemName && invoiceData.customerName) {
                    const lastPrice = await fetchLastCustomerPrice(invoiceData.customerName, item.itemName);
                    if (lastPrice) setItem(prev => ({ ...prev, price: String(lastPrice) }));
                  } else if (value === 'سعر البيع' && item.itemName) {
                    const selected = itemNames.find(i => i.name === item.itemName);
                    setItem(prev => ({
                      ...prev,
                      price: selected && selected.salePrice ? String(selected.salePrice) : ''
                    }));
                  }
                }}
                options={[
                  { label: 'سعر البيع', value: 'سعر البيع' },
                  { label: 'آخر سعر العميل', value: 'آخر سعر العميل' }
                ]}
              />
            </div>
          }
          className="shadow-md"
        >
          {/* Invoice Header */}
          <Row gutter={16} className="mb-4">
            {/* تم حذف حقل البائع (المستخدم الحالي) */}
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="رقم الفاتورة">
                <Input
                  value={invoiceData.invoiceNumber}
                  placeholder="رقم الفاتورة"
                  disabled
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="رقم القيد">
                <Input 
                  name="entryNumber"
                  value={invoiceData.entryNumber} 
                  onChange={handleInvoiceChange} 
                  placeholder="رقم القيد" 
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="التاريخ">
                <DatePicker
                  style={{ width: '100%' }}
                  value={invoiceData.date ? dayjs(invoiceData.date) : null}
                  onChange={(_, dateString) => setInvoiceData({
                    ...invoiceData, 
                    date: Array.isArray(dateString) ? dateString[0] : dateString as string
                  })}
                  format="YYYY-MM-DD"
                  placeholder="التاريخ"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="طريقة الدفع">
                <Select
                  showSearch
                  value={invoiceData.paymentMethod}
                  onChange={(value) => setInvoiceData({...invoiceData, paymentMethod: value})}
                  disabled={paymentMethods.length === 0}
                  placeholder="اختر طريقة الدفع"
                  style={{ fontFamily: 'Cairo, sans-serif' }}
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={paymentMethods.map(method => ({
                    label: method.name || method.id,
                    value: method.name || method.id
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} className="mb-4">
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="الفرع">
                <Select
                  showSearch
                  value={invoiceData.branch}
                  onChange={(value) => {
                    // جلب كود الفرع عند تغييره
                    const selectedBranch = branches.find(b => b.id === value);
                    // استخدم أول رقم صحيح موجود (code أو branchCode أو id)
                    let code = selectedBranch?.code || selectedBranch?.branchCode || value;
                    // إذا كان الكود نصي فيه أرقام وحروف، استخرج الرقم فقط
                    if (typeof code === 'string') {
                      const match = code.match(/\d+/);
                      if (match) code = match[0];
                    }
                    setBranchCode(code);
                    setInvoiceData(prev => ({
                      ...prev,
                      branch: value,
                      invoiceNumber: generateInvoiceNumber(code)
                    }));
                  }}
                  disabled={branches.length === 0}
                  placeholder="اختر الفرع"
                  style={{ fontFamily: 'Cairo, sans-serif' }}
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={branches.map(branch => ({ 
                    label: branch.name || branch.id, 
                    value: branch.id 
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="المخزن">
                <Select
                  showSearch
                  value={invoiceData.warehouse}
                  onChange={(value) => setInvoiceData({...invoiceData, warehouse: value})}
                  disabled={warehouses.length === 0}
                  placeholder="اختر المخزن"
                  style={{ fontFamily: 'Cairo, sans-serif' }}
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={warehouses.map(warehouse => ({ 
                    label: warehouse.name || warehouse.id, 
                    value: warehouse.id 
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="رقم العميل">
                <Input 
                  name="customerNumber"
                  value={invoiceData.customerNumber} 
                  onChange={handleInvoiceChange} 
                  placeholder="رقم العميل" 
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="اسم العميل">
                <Select
                  showSearch
                  value={invoiceData.customerName}
                  placeholder="اسم العميل"
                  onChange={(value) => {
                    const selected = customers.find(c => c.nameAr === value);
                    setInvoiceData({
                      ...invoiceData,
                      customerName: value || '',
                      customerNumber: selected ? (selected.phone || selected.mobile || selected.phoneNumber || '') : '',
                      commercialRecord: selected ? (selected.commercialReg || '') : '',
                      taxFile: selected ? (selected.taxFile || '') : ''
                    });
                  }}
                  style={{ fontFamily: 'Cairo, sans-serif' }}
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                  options={customers.map(customer => ({ 
                    label: customer.nameAr, 
                    value: customer.nameAr 
                  }))}
                />
              </Form.Item>
            </Col>
            {invoiceType === 'ضريبة' && (
              <>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item label="السجل التجاري">
                    <Input
                      name="commercialRecord"
                      value={invoiceData.commercialRecord}
                      onChange={handleInvoiceChange}
                      placeholder="السجل التجاري"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item label="الملف الضريبي">
                    <Input
                      name="taxFile"
                      value={invoiceData.taxFile}
                      onChange={handleInvoiceChange}
                      placeholder="الملف الضريبي"
                    />
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>

          <Divider orientation="left" style={{ fontFamily: 'Cairo, sans-serif' }}>إضافة أصناف المبيعات</Divider>

          {/* Item Entry */}
          <Row gutter={16} className="mb-4">
            <Col xs={24} sm={12} md={4}>
              <Input
                value={item.itemNumber}
                placeholder="كود الصنف"
                disabled
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                showSearch
                value={item.itemName}
                placeholder="اسم الصنف"
                style={{ width: '100%', fontFamily: 'Cairo, sans-serif' }}
                onChange={async (value) => {
                  const selected = itemNames.find(i => i.name === value);
                  let price = selected && selected.salePrice ? String(selected.salePrice) : '';
                  if (priceType === 'آخر سعر العميل' && invoiceData.customerName) {
                    const lastPrice = await fetchLastCustomerPrice(invoiceData.customerName, value);
                    if (lastPrice) price = String(lastPrice);
                  }
                  setItem({
                    ...item,
                    itemName: value,
                    itemNumber: selected ? (selected.itemCode || '') : item.itemNumber,
                    price,
                    discountPercent: selected && selected.discount ? String(selected.discount) : '0',
                    taxPercent: selected && selected.isVatIncluded ? taxRate : '0'
                  });
                }}
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                allowClear
                options={itemNames.map(i => ({ 
                  label: i.name, 
                  value: i.name 
                }))}
              />
            </Col>
            {warehouseMode === 'multiple' && (
              <Col xs={24} sm={12} md={4}>
                <Select
                  showSearch
                  value={item.warehouseId}
                  placeholder="اختر المخزن"
                  style={{ width: '100%', fontFamily: 'Cairo, sans-serif' }}
                  onChange={(value) => setItem({ ...item, warehouseId: value })}
                  options={warehouses.map(warehouse => ({
                    label: warehouse.name || warehouse.id,
                    value: warehouse.id
                  }))}
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                />
              </Col>
            )}
            <Col xs={24} sm={12} md={3}>
              <Input 
                name="quantity"
                value={item.quantity} 
                onChange={handleItemChange} 
                placeholder="الكمية" 
                type="number" 
                min={1}
              />
            </Col>
            <Col xs={24} sm={12} md={3}>
              <Select
                showSearch
                value={item.unit}
                onChange={(value) => setItem({...item, unit: value})}
                style={{ width: '100%', fontFamily: 'Cairo, sans-serif' }}
                placeholder="الوحدة"
                options={units.map(unit => ({ 
                  label: unit, 
                  value: unit 
                }))}
              />
            </Col>
            <Col xs={24} sm={12} md={3}>
              <Input 
                name="price"
                value={item.price} 
                onChange={handleItemChange} 
                placeholder="السعر" 
                type="number" 
                min={0}
                step={0.01}
              />
            </Col>
            <Col xs={24} sm={12} md={3}>
              <Input
                name="discountPercent"
                value={item.discountPercent}
                onChange={handleItemChange}
                placeholder="% الخصم"
                style={{ fontFamily: 'Cairo' }}
                type="number"
                min={0}
                max={100}
              />
            </Col>
            <Col xs={24} sm={12} md={3}>
              <Input 
                name="taxPercent"
                value={item.taxPercent} 
                onChange={handleItemChange} 
                placeholder="% الضريبة" 
                type="number" 
                min={0}
              />
            </Col>
            <Col xs={24} sm={12} md={1}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={addItem}
                block
              />
            </Col>
          </Row>

          {/* Items Table */}
          <div className="mb-4">
            <Table 
              columns={itemColumns} 
              dataSource={items} 
              pagination={false} 
              rowKey={(record) => `${record.itemNumber}-${record.itemName}`}
              bordered
              scroll={{ x: true }}
              size="middle"
            />
          </div>

          {/* Totals */}
          <Row gutter={16} justify="end" className="mb-4">
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <div className="flex justify-between">
                  <span>الإجمالي:</span>
                  <span className="font-bold">{totalsDisplay.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>الخصم:</span>
                  <span className="font-bold">{totalsDisplay.discount}</span>
                </div>
                <div className="flex justify-between">
                  <span>الضريبة:</span>
                  <span className="font-bold">{totalsDisplay.tax}</span>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between">
                  <span>صافي الفاتورة:</span>
                  <span className="font-bold text-lg">{totalsDisplay.net}</span>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Save Button */}
          <Row justify="center">
            <Col>
              <Button 
                type="primary" 
                size="large" 
                icon={<SaveOutlined />} 
                onClick={handleSave}
                style={{ width: 150 }}
                loading={loading}
              >
                حفظ فاتورة مبيعات
              </Button>
            </Col>
          </Row>

          {/* Invoices Table Toggle Button */}
          <Divider orientation="left" style={{ fontFamily: 'Cairo, sans-serif' }}>سجل الفواتير</Divider>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Button type="primary" onClick={() => setShowInvoicesTable(v => !v)}>
              {showInvoicesTable ? 'إخفاء سجل الفواتير' : 'عرض سجل الفواتير'}
            </Button>
            {showInvoicesTable && (
              <Button type="default" style={{ marginRight: 8 }} onClick={exportInvoicesToExcel}>
                تنزيل Excel
              </Button>
            )}
          </div>
          {showInvoicesTable && (
            <div className="mt-6">
              <Table
                columns={invoiceColumns}
                dataSource={invoices}
                loading={invoicesLoading}
                pagination={{ pageSize: 10 }}
                bordered
                scroll={{ x: 3000 }}
                size="middle"
                rowKey="key"
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
                        <strong>الإجماليات</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="center">
                        <strong>
                          {invoices.reduce((sum, record) => sum + record.quantity, 0).toFixed(2)}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="center">
                        <strong>
                          {invoices.reduce((sum, record) => sum + record.price, 0).toFixed(2)}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="center">
                        <strong>
                          {invoices.reduce((sum, record) => sum + record.total, 0).toFixed(2)}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} align="center">
                        <strong>
                          {invoices.reduce((sum, record) => sum + record.discountValue, 0).toFixed(2)}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5} align="center">
                        <strong>
                          {invoices.length > 0 
                            ? (invoices.reduce((sum, record) => sum + record.discountValue, 0) / 
                               invoices.reduce((sum, record) => sum + record.total, 0) * 100).toFixed(2)
                            : '0.00'}%
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6} align="center">
                        <strong>
                          {invoices.reduce((sum, record) => sum + record.taxValue, 0).toFixed(2)}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7} align="center">
                        <strong>
                          {invoices.length > 0 
                            ? (invoices.reduce((sum, record) => sum + record.taxValue, 0) / 
                               (invoices.reduce((sum, record) => sum + record.total, 0) - 
                                invoices.reduce((sum, record) => sum + record.discountValue, 0)) * 100).toFixed(2)
                            : '0.00'}%
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={8} align="center">
                        <strong>
                          {invoices.reduce((sum, record) => sum + record.net, 0).toFixed(2)}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={9} align="center">
                        <strong>
                          {invoices.reduce((sum, record) => sum + record.cost, 0).toFixed(2)}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={10} align="center">
                        <strong>
                          {invoices.reduce((sum, record) => sum + record.profit, 0).toFixed(2)}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={11} colSpan={6}></Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </div>
          )}
        </Card>
      </Spin>
    </div>
  );
};

export default SalesPage;

// إضافة خط Cairo للصفحة إذا لم يكن مضافاً في مكان آخر
if (typeof document !== 'undefined' && !document.getElementById('cairo-font')) {
  const link = document.createElement('link');
  link.id = 'cairo-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap';
  document.head.appendChild(link);
}