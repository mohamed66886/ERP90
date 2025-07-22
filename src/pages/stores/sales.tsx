import React, { useState, useEffect, useMemo } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/useAuth';
import { doc, getDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import dayjs from 'dayjs';
import { Button, Input, Select, Table, message, Form, Row, Col, DatePicker, Spin, Modal } from 'antd';
import * as XLSX from 'xlsx';
import Divider from 'antd/es/divider';
import Breadcrumb from "../../components/Breadcrumb";
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
  // تم حذف الخصم الإضافي
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
  tax: number;
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
  extraDiscount?: number;
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
  // تم حذف الخصم الإضافي
  taxPercent: '15',
  taxValue: 0,
  total: 0
};


// دالة توليد رقم فاتورة جديد بناءً على رقم الفرع والتاريخ والتسلسل اليومي
async function generateInvoiceNumberAsync(branchCode: string): Promise<string> {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const dateStr = `${y}${m}${d}`;
  const branchPart = branchCode && !isNaN(Number(branchCode)) ? String(Number(branchCode)).padStart(3, '0') : '000';
  // جلب عدد الفواتير لنفس الفرع في نفس اليوم
  const { getDocs, collection, query, where } = await import('firebase/firestore');
  const q = query(
    collection(db, 'sales_invoices'),
    where('branch', '==', branchCode),
    where('date', '==', `${y}-${m}-${d}`)
  );
  const snapshot = await getDocs(q);
  const count = snapshot.size + 1;
  const serial = String(count).padStart(4, '0');
  return `INV-${branchPart}-${dateStr}-${serial}`;
}

function getTodayString(): string {
  return dayjs().format('YYYY-MM-DD');
}

const SalesPage: React.FC = () => {
  // --- Add Customer Modal State (fix: must be inside component, before return) ---
  const businessTypes = ["شركة", "مؤسسة", "فرد"];
  const initialAddCustomer = {
    nameAr: '',
    phone: '',
    businessType: '',
    commercialReg: '',
    taxFileNumber: ''
  };
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [addCustomerForm, setAddCustomerForm] = useState(initialAddCustomer);
  const [addCustomerLoading, setAddCustomerLoading] = useState(false);
  const handleAddCustomerChange = (field, value) => {
    setAddCustomerForm(prev => ({ ...prev, [field]: value }));
  };
  const handleAddCustomer = async () => {
    if (!addCustomerForm.nameAr || !addCustomerForm.phone || !addCustomerForm.businessType) {
      message.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    if ((addCustomerForm.businessType === 'شركة' || addCustomerForm.businessType === 'مؤسسة') && (!addCustomerForm.commercialReg || !addCustomerForm.taxFileNumber)) {
      message.error('يرجى ملء السجل التجاري والملف الضريبي');
      return;
    }
    setAddCustomerLoading(true);
    try {
      const maxNum = customers
        .map(c => {
          const match = /^c-(\d{4})$/.exec(c.id);
          return match ? parseInt(match[1], 10) : 0;
        })
        .reduce((a, b) => Math.max(a, b), 0);
      const nextNum = maxNum + 1;
      const newId = `c-${nextNum.toString().padStart(4, '0')}`;
      const docData = {
        id: newId,
        nameAr: addCustomerForm.nameAr,
        phone: addCustomerForm.phone,
        businessType: addCustomerForm.businessType,
        commercialReg: addCustomerForm.businessType === 'فرد' ? '' : addCustomerForm.commercialReg,
        taxFileNumber: addCustomerForm.businessType === 'فرد' ? '' : addCustomerForm.taxFileNumber,
        status: 'نشط',
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'customers'), docData);
      message.success('تم إضافة العميل بنجاح! يمكنك تعديل باقي البيانات من صفحة العملاء.');
      setShowAddCustomerModal(false);
      setAddCustomerForm(initialAddCustomer);
      // Optionally, you can refresh the customers list here if you have a fetchCustomers function available
    } catch (err) {
      message.error('حدث خطأ أثناء إضافة العميل');
    } finally {
      setAddCustomerLoading(false);
    }
  };
  // بيانات الشركة
  const [companyData, setCompanyData] = useState<any>({});
  // دالة تصدير سجل الفواتير إلى ملف Excel
  const exportInvoicesToExcel = () => {
    if (!invoices.length) {
      message.info('لا يوجد بيانات للتصدير');
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
    invoiceNumber: '',
    entryNumber: generateEntryNumber(),
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

  // توليد رقم فاتورة جديد عند كل إعادة تعيين أو تغيير الفرع
  // دالة توليد رقم قيد تلقائي
  function generateEntryNumber() {
    // رقم عشوائي بين 100000 و 999999
    return 'EN-' + Math.floor(100000 + Math.random() * 900000);
  }

  const generateAndSetInvoiceNumber = async (branchCodeValue: string) => {
    const invoiceNumber = await generateInvoiceNumberAsync(branchCodeValue);
    setInvoiceData(prev => ({ ...prev, invoiceNumber, entryNumber: generateEntryNumber() }));
  };

  // توليد رقم فاتورة عند تحميل الصفحة لأول مرة إذا كان رقم الفرع موجود
  useEffect(() => {
    if (branchCode) {
      generateAndSetInvoiceNumber(branchCode);
    }
  }, [branchCode]);
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
    total: 0,
    tax: 0
  });

  const [taxRate, setTaxRate] = useState<string>('15');
  const [priceType, setPriceType] = useState<'سعر البيع' | 'آخر سعر العميل'>('سعر البيع');
  const [invoices, setInvoices] = useState<(InvoiceRecord & { firstLevelCategory?: string })[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState<boolean>(false);
  // حالة المودال بعد الحفظ
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [lastSavedInvoice, setLastSavedInvoice] = useState<any>(null);

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
    // تم حذف الخصم الإضافي
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
      message.info('يجب إدخال اسم الصنف، الكمية والسعر');
      return;
    }

    if (isNaN(Number(item.quantity)) || isNaN(Number(item.price))) {
      message.info('يجب أن تكون الكمية والسعر أرقاماً صحيحة');
      return;
    }

    if (warehouseMode === 'multiple' && !item.warehouseId) {
      message.info('يرجى اختيار المخزن لهذا الصنف');
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

  // تحديث الإجماليات مع جمع الضريبة
  const updateTotals = (itemsList: InvoiceItem[]) => {
    let totalTax = 0;
    const calculated = itemsList.reduce((acc, item) => {
      const lineTotal = item.total || 0;
      const discount = item.discountValue || 0;
      const tax = item.taxValue || 0;
      totalTax += tax;
      return {
        afterDiscount: acc.afterDiscount + (lineTotal - discount),
        afterTax: acc.afterTax + (lineTotal - discount + tax),
        total: acc.total + lineTotal
      };
    }, { afterDiscount: 0, afterTax: 0, total: 0 });
    setTotals({
      afterDiscount: parseFloat(calculated.afterDiscount.toFixed(2)),
      afterTax: parseFloat(calculated.afterTax.toFixed(2)),
      total: parseFloat(calculated.total.toFixed(2)),
      tax: parseFloat(totalTax.toFixed(2))
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
      totals: {
        ...totals
      },
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
      setTotals({ afterDiscount: 0, afterTax: 0, total: 0, tax: 0 });
      // توليد رقم فاتورة جديد بعد الحفظ
      if (branchCode) {
        generateAndSetInvoiceNumber(branchCode);
      } else {
        setInvoiceData(prev => ({
          ...prev,
          invoiceNumber: '',
          entryNumber: generateEntryNumber(),
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
        }));
      }
      // تحديث سجل الفواتير
      await fetchInvoices();
      // حفظ بيانات الفاتورة الأخيرة للمودال
      setLastSavedInvoice({ ...invoice });
      setShowPrintModal(true);
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
    {
      title: 'المخزن',
      dataIndex: 'warehouseId',
      width: 120,
      align: 'center' as const,
      render: (_: string | undefined, record: { warehouseId?: string }) => {
        const warehouseId = record.warehouseId || invoiceData.warehouse;
        if (!warehouseId) return '';
        const warehouse = warehouses.find(w => w.id === warehouseId);
        return warehouse ? warehouse.name || warehouse.id : warehouseId;
      }
    },
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
      title: 'الإجمالي بعد الخصم', 
      key: 'netAfterDiscount',
      width: 110,
      align: 'center' as const,
      render: (_: any, record: any) => {
        const subtotal = Number(record.price) * Number(record.quantity);
        const discountValue = subtotal * Number(record.discountPercent) / 100;
        return (subtotal - discountValue).toFixed(2);
      }
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
      // الإجمالي النهائي = (السعر * الكمية - قيمة الخصم) + قيمة الضريبة
      render: (_: any, record: any) => {
        const quantity = Number(record.quantity) || 0;
        const price = Number(record.price) || 0;
        const discountPercent = Number(record.discountPercent) || 0;
        const subtotal = price * quantity;
        const discountValue = subtotal * discountPercent / 100;
        const taxableAmount = subtotal - discountValue;
        const taxPercent = Number(record.taxPercent) || 0;
        const taxValue = taxableAmount * taxPercent / 100;
        const finalTotal = taxableAmount + taxValue;
        return finalTotal.toFixed(2);
      }
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

  const handleEditInvoice = (record: any) => {
    // تعبئة بيانات الفاتورة المختارة في النموذج
    setInvoiceData({
      ...invoiceData,
      ...record,
      delegate: record.delegate || record.seller || '',
      branch: record.branch || '',
      warehouse: record.warehouse || '',
      customerNumber: record.customerNumber || '',
      customerName: record.customerName || record.customer || '',
      priceRule: record.priceRule || '',
      commercialRecord: record.commercialRecord || '',
      taxFile: record.taxFile || '',
    });
    setItems(record.items || []);
    setTotals(record.totals || totals);
    setLastSavedInvoice(record);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteInvoice = async (record: any) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return;
    setInvoicesLoading(true);
    try {
      // حذف الفاتورة من قاعدة البيانات (Firebase أو أي مصدر آخر)
      // مثال: await deleteInvoiceById(record.id)
      // إذا كنت تستخدم Firebase:
      if (record.id) {
        const { deleteDoc, doc } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        await deleteDoc(doc(db, 'salesInvoices', record.id));
        setInvoices(prev => prev.filter(inv => inv.id !== record.id));
      } else {
        setInvoices(prev => prev.filter(inv => inv.invoiceNumber !== record.invoiceNumber));
      }
    } catch (err) {
      alert('حدث خطأ أثناء الحذف');
    } finally {
      setInvoicesLoading(false);
    }
  };

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
    {
      title: 'إجراءات',
      key: 'actions',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button
            type="primary"
            size="small"
            onClick={() => handleEditInvoice(record)}
            style={{ fontWeight: 600 }}
          >
            تعديل
          </Button>
          <Button
            danger
            size="small"
            onClick={() => handleDeleteInvoice(record)}
            style={{ fontWeight: 600 }}
          >
            حذف
          </Button>
        </div>
      )
    },
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
        // جلب البائعين
        const delegatesSnap = await getDocs(collection(db, 'delegates'));
        setDelegates(delegatesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
    afterDiscount: totals.afterDiscount.toFixed(2),
    tax: totals.tax.toFixed(2), // الضريبة الفعلية
    net: totals.afterTax.toFixed(2) // الصافي = الاجمالي بعد الخصم + الضريبة
  }), [totals]);

  // حالة إظهار/إخفاء جدول سجل الفواتير
  const [showInvoicesTable, setShowInvoicesTable] = useState(false);

  // حالة مودال البحث عن عميل
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearchText, setCustomerSearchText] = useState('');

  // تصفية العملاء حسب البحث
  const filteredCustomers = useMemo(() => {
    if (!customerSearchText) return customers;
    const search = customerSearchText.toLowerCase();
    return customers.filter(c =>
      (c.nameAr && c.nameAr.toLowerCase().includes(search)) ||
      (c.nameEn && c.nameEn.toLowerCase().includes(search)) ||
      (c.phone && c.phone.toLowerCase().includes(search)) ||
      (c.mobile && c.mobile.toLowerCase().includes(search)) ||
      (c.phoneNumber && c.phoneNumber.toLowerCase().includes(search)) ||
      (c.commercialReg && c.commercialReg.toLowerCase().includes(search)) ||
      (c.taxFile && c.taxFile.toLowerCase().includes(search))
    );
  }, [customerSearchText, customers]);

  // دالة طباعة الفاتورة
const handlePrint = () => {
    // جلب بيانات الشركة من الإعدادات
    (async () => {
      let companyData: any = {
        arabicName: '',
        englishName: '',
        logoUrl: '',
        commercialRegistration: '',
        taxFile: '',
        registrationDate: '',
        issuingAuthority: '',
        companyType: '',
        activityType: '',
        nationality: '',
        city: '',
        region: '',
        street: '',
        district: '',
        buildingNumber: '',
        postalCode: '',
        countryCode: '',
        phone: '',
        mobile: '',
        fiscalYear: '',
        taxRate: '',
        website: '',
      };
      try {
        const { getDocs, collection } = await import('firebase/firestore');
        const companiesSnap = await getDocs(collection(db, 'companies'));
        if (!companiesSnap.empty) {
          companyData = { ...companyData, ...companiesSnap.docs[0].data() };
        }
      } catch {}

      const invoice = lastSavedInvoice;
      if (!invoice) return;

      // Generate QR code data URL (using qrcode library)
      let qrDataUrl = '';
      try {
        // Dynamically import qrcode library
        const QRCode = (await import('qrcode')).default;
        // You can customize the QR content as needed (e.g., invoice number, company, total, date)
        const qrContent = JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
          company: companyData.arabicName,
          date: invoice.date,
          total: invoice.totals?.afterTax
        });
        qrDataUrl = await QRCode.toDataURL(qrContent, { width: 120, margin: 1 });
      } catch (e) {
        qrDataUrl = '';
      }

      const printWindow = window.open('', '', 'height=900,width=800');
      printWindow?.document.write(`
        <html>
        <head>
          <title>فاتورة ضريبية | Tax Invoice</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
          <style>
            @page { size: A4; margin: 10mm; }
            body {
              font-family: 'Tajawal', sans-serif;
              direction: rtl;
              padding: 5mm;
              color: #000;
              font-size: 12px;
              line-height: 1.4;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 5mm;
              border-bottom: 1px solid #000;
              padding-bottom: 3mm;
            }
            .header-section {
              flex: 1;
              min-width: 0;
              padding: 0 8px;
              box-sizing: border-box;
            }
            .header-section.center {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              flex: 0 0 120px;
              max-width: 120px;
              min-width: 100px;
            }
            .logo {
              width: 150px;
              height: auto;
              margin-bottom: 8px;
            }
            .company-info-ar {
              text-align: right;
              font-size: 13px;
              font-weight: 500;
              line-height: 1.5;
            }
            .company-info-en {
              text-align: left;
              font-family: Arial, sans-serif;
              direction: ltr;
              font-size: 12px;
              font-weight: 500;
              line-height: 1.5;
            }
            .info-row-table {
              border: 1px solid #bbb;
              border-radius: 4px;
              margin-bottom: 0;
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
              margin-top: 0;
            }
            .info-row-table td {
              border: none;
              padding: 2px 8px;
              vertical-align: middle;
              font-weight: 500;
            }
            .info-row-table .label {
              color: #444;
              font-weight: bold;
              min-width: 80px;
              text-align: right;
            }
            .info-row-table .value {
              color: #222;
              text-align: left;
            }
            .info-row-container {
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 10px;
              gap: 16px;
            }
            .info-row-table.left {
              direction: rtl;
            }
            .info-row-table.right {
              direction: rtl;
            }
            .qr-center {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-width: 100px;
              max-width: 120px;
              flex: 0 0 120px;
            }
            .qr-code {
              width: 80px;
              height: 80px;
              border: 1px solid #ddd;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: Arial;
              font-size: 8px;
              text-align: center;
              margin-top: 4px;
            }
            .invoice-title { text-align: center; font-size: 16px; font-weight: bold; margin: 5mm 0; border: 1px solid #000; padding: 2mm; background-color: #f3f3f3; }
            .customer-info { margin-bottom: 5mm; border: 1px solid #ddd; padding: 3mm; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 5mm; font-size: 11px; }
            th, td { border: 1px solid #000; padding: 2mm; text-align: center; }
            th {
              background-color: #305496;
              color: #fff;
              font-weight: bold;
              font-size: 12.5px;
              letter-spacing: 0.5px;
            }
            .totals { margin-top: 5mm; border-top: 1px solid #000; padding-top: 3mm; font-weight: bold; }
            .policy { font-size: 10px; border: 1px solid #ddd; padding: 3mm; /*margin-top: 5mm;*/ }
            .policy-title { font-weight: bold; margin-bottom: 2mm; }
            .signature { margin-top: 5mm; display: flex; justify-content: space-between; }
            .signature-box { width: 45%; border-top: 1px solid #000; padding-top: 3mm; }
            .footer { margin-top: 5mm; text-align: center; font-size: 10px; }
            /* Ensure totals and policy are always side by side on print */
            .totals-policy-row {
              display: flex;
              flex-direction: row;
              flex-wrap: nowrap !important;
              justify-content: flex-end;
              align-items: flex-start;
              gap: 24px;
              margin-top: 5mm;
            }
            @media print {
              .totals-policy-row {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: nowrap !important;
                justify-content: flex-end !important;
                align-items: flex-start !important;
                gap: 24px !important;
                margin-top: 5mm !important;
              }
              .policy { margin-top: 0 !important; }
            }
          </style>
        </head>
        <body>
          <!-- Header Section: Arabic (right), Logo (center), English (left) -->
          <div class="header">
            <div class="header-section company-info-ar">
              <div>${companyData.arabicName || ''}</div>
              <div>${companyData.companyType || ''}</div>
              <div>السجل التجاري: ${companyData.commercialRegistration || ''}</div>
              <div>الملف الضريبي: ${companyData.taxFile || ''}</div>
              <div>العنوان: ${companyData.city || ''} ${companyData.region || ''} ${companyData.street || ''} ${companyData.district || ''} ${companyData.buildingNumber || ''}</div>
              <div>الرمز البريدي: ${companyData.postalCode || ''}</div>
              <div>الهاتف: ${companyData.phone || ''}</div>
              <div>الجوال: ${companyData.mobile || ''}</div>
            </div>
            <div class="header-section center">
              <img src="${companyData.logoUrl || 'https://via.placeholder.com/100x50?text=Company+Logo'}" class="logo" alt="Company Logo">
            </div>
            <div class="header-section company-info-en">
              <div>${companyData.englishName || ''}</div>
              <div>${companyData.companyType || ''}</div>
              <div>Commercial Reg.: ${companyData.commercialRegistration || ''}</div>
              <div>Tax File: ${companyData.taxFile || ''}</div>
              <div>Address: ${companyData.city || ''} ${companyData.region || ''} ${companyData.street || ''} ${companyData.district || ''} ${companyData.buildingNumber || ''}</div>
              <div>Postal Code: ${companyData.postalCode || ''}</div>
              <div>Phone: ${companyData.phone || ''}</div>
              <div>Mobile: ${companyData.mobile || ''}</div>
            </div>
          </div>
          <!-- Info Row Section: Invoice info (right), QR (center), Customer info (left) -->
          <div class="info-row-container">
            <table class="info-row-table right">
              <tr><td class="label">طريقة الدفع</td><td class="value">${invoice.paymentMethod || ''}</td></tr>
              <tr><td class="label">رقم الفاتورة</td><td class="value">${invoice.invoiceNumber || ''}</td></tr>
              <tr><td class="label">تاريخ الفاتورة</td><td class="value">${invoice.date || ''}</td></tr>
              <tr><td class="label">تاريخ الاستحقاق</td><td class="value">${invoice.dueDate || ''}</td></tr>
            </table>
            <div class="qr-center">
              <div style="font-size:13px;font-weight:bold;margin-bottom:4px;">
                ${(() => {
                  const branch = (typeof branches !== 'undefined' && Array.isArray(branches))
                    ? branches.find(b => b.id === invoice.branch)
                    : null;
                  return branch ? (branch.name || branch.id) : (invoice.branch || '');
                })()}
              </div>
              <div class="qr-code">
                <img src="${qrDataUrl}" alt="QR Code" style="width:80px;height:80px;" /><br>
               </div>
            </div>
            <table class="info-row-table left">
              <tr><td class="label">اسم العميل</td><td class="value">${invoice.customerName || ''}</td></tr>
              <tr><td class="label">رقم الجوال</td><td class="value">${invoice.customerNumber || ''}</td></tr>
              <tr><td class="label">م.ض</td><td class="value">${invoice.taxFile || ''}</td></tr>
              <tr><td class="label">عنوان العميل</td><td class="value">${invoice.customerAddress || ''}</td></tr>
            </table>
          </div>
          <!-- Items Table -->
          <table>
            <thead>
              <tr>
                <th>الرقم</th>
                <th>كود الصنف</th>
                <th>اسم الصنف</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>نسبة الخصم %</th>
                <th>مبلغ الخصم</th>
                <th>الإجمالي قبل الضريبة</th>
                <th>قيمة الضريبة</th>
                <th>الإجمالي شامل الضريبة</th>
                <th>المخزن</th>
              </tr>
            </thead>
            <tbody>
              ${(invoice.items || []).map((it: any, idx: number) => {
                const subtotal = Number(it.price) * Number(it.quantity);
                const discountValue = Number(it.discountValue) || 0;
                const taxValue = Number(it.taxValue) || 0;
                const afterDiscount = subtotal - discountValue;
                const net = afterDiscount + taxValue;
                let warehouseId = it.warehouseId || invoice.warehouse;
                let warehouseObj = Array.isArray(warehouses) ? warehouses.find(w => w.id === warehouseId) : null;
                let warehouseName = warehouseObj ? (warehouseObj.name || warehouseObj.id) : (warehouseId || '');
                return `<tr>
                  <td>${idx + 1}</td>
                  <td>${it.itemNumber || ''}</td>
                  <td>${it.itemName || ''}</td>
                  <td>${it.quantity || ''}</td>
                  <td>${Number(it.price).toFixed(2)}</td>
                  <td>${it.discountPercent || '0'}</td>
                  <td>${discountValue.toFixed(2)}</td>
                  <td>${afterDiscount.toFixed(2)}</td>
                  <td>${taxValue.toFixed(2)}</td>
                  <td>${net.toFixed(2)}</td>
                  <td>${warehouseName}</td>
                </tr>`;
              }).join('')}
            </tbody>
            <!-- Summary Row -->
            <tfoot>
              <tr style="background:#f3f3f3; font-weight:bold;">
                <td colspan="6" style="text-align:right; font-weight:bold; color:#000;">الإجماليات:</td>
                <td style="color:#dc2626; font-weight:bold;">
                  ${(() => {
                    // إجمالي الخصم
                    if (!invoice.items) return '0.00';
                    let total = 0;
                    invoice.items.forEach((it:any) => { total += Number(it.discountValue) || 0; });
                    return total.toFixed(2);
                  })()}
                </td>
                <td style="color:#ea580c; font-weight:bold;">
                  ${(() => {
                    // إجمالي قبل الضريبة
                    if (!invoice.items) return '0.00';
                    let total = 0;
                    invoice.items.forEach((it:any) => {
                      const subtotal = Number(it.price) * Number(it.quantity);
                      const discountValue = Number(it.discountValue) || 0;
                      total += subtotal - discountValue;
                    });
                    return total.toFixed(2);
                  })()}
                </td>
                <td style="color:#9333ea; font-weight:bold;">
                  ${(() => {
                    // إجمالي الضريبة
                    if (!invoice.items) return '0.00';
                    let total = 0;
                    invoice.items.forEach((it:any) => { total += Number(it.taxValue) || 0; });
                    return total.toFixed(2);
                  })()}
                </td>
                <td style="color:#059669; font-weight:bold;">
                  ${(() => {
                    // إجمالي النهائي
                    if (!invoice.items) return '0.00';
                    let total = 0;
                    invoice.items.forEach((it:any) => {
                      const subtotal = Number(it.price) * Number(it.quantity);
                      const discountValue = Number(it.discountValue) || 0;
                      const taxValue = Number(it.taxValue) || 0;
                      total += (subtotal - discountValue + taxValue);
                    });
                    return total.toFixed(2);
                  })()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          <!-- Totals and Policies Section side by side -->
          <div class="totals-policy-row">
           <div style="flex: 1 1 340px; min-width: 260px; max-width: 600px;">
              <div class="policy">
                <div class="policy-title">سياسة الاستبدال والاسترجاع:</div>
                <div>1- يستوجب أن يكون المنتج بحالته الأصلية بدون أي استعمال وبكامل اكسسواراته وبالتعبئة الأصلية.</div>
                <div>2- البضاعة المباعة ترد أو تستبدل خلال ثلاثة أيام من تاريخ استلام العميل للمنتج مع إحضار أصل الفاتورة وتكون البضاعة بحالة سليمة ومغلقة.</div>
                <div>3- يتحمل العميل قيمة التوصيل في حال إرجاع الفاتورة ويتم إعادة المبلغ خلال 3 أيام عمل.</div>
                <div>4- ${companyData.arabicName || 'الشركة'} غير مسؤولة عن تسليم البضاعة بعد 10 أيام من تاريخ الفاتورة.</div>
                <div class="policy-title" style="margin-top: 3mm;">سياسة التوصيل:</div>
                <div>1- توصيل الطلبات من 5 أيام إلى 10 أيام عمل.</div>
                <div>2- الحد المسموح به للتوصيل هو الدور الأرضي كحد أقصى، وفي حال رغبة العميل بالتوصيل لأعلى من الحد المسموح به، يتم ذلك بواسطة العميل.</div>
                <div>3- يتم التوصيل حسب جدول المواعيد المحدد من ${companyData.arabicName || 'الشركة'}، كما أن ${companyData.arabicName || 'الشركة'} غير مسؤولة عن أي أضرار ناتجه بسبب التأخير او تأجيل موعد التوصيل.</div>
                <div>4- يستوجب فحص المنتج أثناء استلامه مع التوقيع باستلامه، وعدم الفحص يسقط حق العميل في المطالبة بالاسترجاع او الاستبدال في حال وجود كسر.</div>
                <div>5- لايوجد لدينا تركيب الضمان هو ضمان ${companyData.arabicName || 'الشركة'}، كما أن الضمان لا يشمل سوء الاستخدام الناتج من العميل.</div>
              </div>
            </div>
            <div style="flex: 0 0 320px; max-width: 340px; min-width: 220px;">
              <table style="border:1.5px solid #000; border-radius:6px; font-size:13px; min-width:220px; max-width:320px; margin-left:0; margin-right:0; border-collapse:collapse; box-shadow:none; width:100%;">
                <tbody>
                  <tr>
                    <td style="font-weight:bold; color:#000; text-align:right; padding:7px 12px; border:1px solid #000; background:#fff;">إجمالى الفاتورة</td>
                    <td style="text-align:left; font-weight:500; border:1px solid #000; background:#fff;">${invoice.totals?.total?.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="font-weight:bold; color:#000; text-align:right; padding:7px 12px; border:1px solid #000; background:#fff;">مبلغ الخصم</td>
                    <td style="text-align:left; font-weight:500; border:1px solid #000; background:#fff;">${(invoice.totals?.total - invoice.totals?.afterDiscount).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="font-weight:bold; color:#000; text-align:right; padding:7px 12px; border:1px solid #000; background:#fff;">الاجمالى بعد الخصم</td>
                    <td style="text-align:left; font-weight:500; border:1px solid #000; background:#fff;">${invoice.totals?.afterDiscount?.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="font-weight:bold; color:#000; text-align:right; padding:7px 12px; border:1px solid #000; background:#fff;">الضريبة (${invoice.items && invoice.items[0] ? (invoice.items[0].taxPercent || 0) : 0}%)</td>
                    <td style="text-align:left; font-weight:500; border:1px solid #000; background:#fff;">${(invoice.totals?.afterTax - invoice.totals?.afterDiscount).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="font-weight:bold; color:#000; text-align:right; padding:7px 12px; border:1px solid #000; background:#fff;">الاجمالى النهايي</td>
                    <td style="text-align:left; font-weight:700; border:1px solid #000; background:#fff;">${invoice.totals?.afterTax?.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
           
          </div>
          <!-- Signature Section -->
          <div class="signature">
            <div class="signature-box">
              <div>اسم العميل: ${invoice.customerName || ''}</div>
              <div>التوقيع: ___________________</div>
            </div>
            <div class="signature-box" style="position:relative;">
              <div>البائع: ${invoice.delegate || ''}</div>
              <div>التاريخ: ${invoice.date || ''}</div>
              <!-- Decorative Stamp -->
              <div style="
                margin-top:18px;
                display:flex;
                justify-content:center;
                align-items:center;
                width:160px;
                height:60px;
                border:2.5px dashed #888;
                border-radius:50%;
                box-shadow:0 2px 8px 0 rgba(0,0,0,0.08);
                opacity:0.85;
                background: repeating-linear-gradient(135deg, #f8f8f8 0 8px, #fff 8px 16px);
                font-family: 'Cairo', 'Tajawal', Arial, sans-serif;
                font-size:15px;
                font-weight:bold;
                color:#222;
                letter-spacing:1px;
                text-align:center;
                position:absolute;
                left:50%;
                transform:translateX(-50%);
                bottom:-80px;
                z-index:2;
              ">
                <div style="width:100%;">
                  <div style="font-size:16px; font-weight:700;">${companyData.arabicName || 'الشركة'}</div>
                  <div style="font-size:13px; font-weight:500; margin-top:2px;">${companyData.phone ? 'هاتف: ' + companyData.phone : ''}</div>
                </div>
              </div>
            </div>
          </div>
          <!-- Footer -->
          <div class="footer">
            ${companyData.website ? `لزيارة متجرنا الإلكتروني / Visit our e-shop: ${companyData.website}` : ''}
          </div>
        </body>
        </html>
      `);
    
      printWindow?.document.close();
      printWindow?.focus();
      setTimeout(() => {
        printWindow?.print();
        printWindow?.close();
      }, 500);
    })();
};

  // ref for item name select
  const itemNameSelectRef = React.useRef<any>(null);

  // تعديل addItem ليعيد التركيز على اسم الصنف بعد الإضافة

  const handleAddItem = async () => {
    await addItem();
    setItem(prev => ({ ...prev, quantity: '1' })); // إعادة تعيين الكمية إلى 1 بعد الإضافة (كسلسلة نصية)
    setTimeout(() => {
      itemNameSelectRef.current?.focus?.();
    }, 100); // تأخير بسيط لضمان إعادة التهيئة
  };

  return (
    <div className="p-2 sm:p-6 w-full max-w-none">
      <div className="p-4 font-['Tajawal'] bg-white rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] mb-4 animate-[bounce_2s_infinite] relative overflow-hidden">
        <div className="flex items-center">

          <h1 className="text-2xl font-bold text-blue-800">فاتورة مبيعات جديده
</h1>
          {/* إيموجي متحركة باي باي */}
          <span className="animate-[wave_2s_infinite] text-3xl mr-3">👋</span>
        </div>
        {/* تأثيرات إضافية */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500 animate-[pulse_3s_infinite]"></div>
      </div>

<style jsx global>{`
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }
  
  @keyframes wave {
    0%, 100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(20deg);
    }
    75% {
      transform: rotate(-20deg);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`}</style>
      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "فاتورة مبيعات" }
        ]}
      />
      <Spin spinning={fetchingItems}>
        {/* مودال الطباعة بعد الحفظ */}

        <Card 
          title={
<div className="flex items-center gap-4 px-3 py-2 bg-gray-50 rounded-lg">

  


  <Select
    value={invoiceType}
    style={{ minWidth: 170, height: 38 }}
    onChange={setInvoiceType}
    size="middle"
    placeholder="نوع الفاتورة"
    options={[
      { label: 'ضريبة مبسطة', value: 'ضريبة مبسطة' },
      { label: 'ضريبة', value: 'ضريبة' }
    ]}
  />

  <Select
    value={warehouseMode}
    style={{ minWidth: 170, height: 38 }}
    onChange={setWarehouseMode}
    size="middle"
    placeholder="نظام المخزن"
    options={[
      { label: 'مخزن واحد', value: 'single' },
      { label: 'مخازن متعددة', value: 'multiple' }
    ]}
  />

  <Select
    value={priceType}
    style={{ minWidth: 170, height: 38, fontFamily: 'sans-serif' }}
    onChange={async (value) => {
      setPriceType(value);
      if (value === 'آخر سعر العميل' && item.itemName && invoiceData.customerName) {
        try {
          const lastPrice = await fetchLastCustomerPrice(invoiceData.customerName, item.itemName);
          if (lastPrice) {
            setItem(prev => ({ ...prev, price: String(lastPrice) }));
            message.success('تم تطبيق آخر سعر للعميل بنجاح');
          }
        } catch (error) {
          console.error('فشل في جلب آخر سعر:', error);
          message.error('حدث خطأ أثناء جلب آخر سعر للعميل');
        }
      } else if (value === 'سعر البيع' && item.itemName) {
        const selected = itemNames.find(i => i.name === item.itemName);
        setItem(prev => ({
          ...prev,
          price: selected?.salePrice ? String(selected.salePrice) : ''
        }));
      }
    }}
    size="middle"
    placeholder="نوع السعر"
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
                  value={invoiceData.invoiceNumber || ''}
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
                  disabled
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
                    // توليد رقم فاتورة احترافي: INV-رقم الفرع الحقيقي-التاريخ-رقم الفاتورة
                    setBranchCode('');
                    const today = dayjs().format('YYYYMMDD');
                    // جلب رقم الفرع الحقيقي من كائن الفروع
                    const branchObj = branches.find(b => b.id === value);
                    const branchCode = branchObj?.code || branchObj?.id || value;
                    const serial = Math.floor(1000 + Math.random() * 9000); // رقم عشوائي بين 1000 و9999
                    const invoiceNumber = `INV-${branchCode}-${today}-${serial}`;
                    setInvoiceData(prev => ({
                      ...prev,
                      branch: value,
                      invoiceNumber
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
              {/* إخفاء حقل المخزن إذا كان warehouseMode === 'multiple' */}
              {warehouseMode !== 'multiple' && (
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
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="رقم العميل">
                <Input
                  id="customerNumber"
                  value={invoiceData.customerNumber}
                  placeholder="رقم العميل"
                  disabled
                />
              </Form.Item>
            </Col>
            {/* إضافة حقل البائع بجانب رقم العميل */}
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="البائع">
                <Select
                  showSearch
                  value={invoiceData.delegate}
                  onChange={value => setInvoiceData({ ...invoiceData, delegate: value })}
                  placeholder="اختر البائع"
                  style={{ fontFamily: 'Cairo, sans-serif' }}
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={delegates?.map(d => ({ label: d.name || d.id, value: d.name || d.id })) || []}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16} className="mb-4">
            <Col xs={24} sm={24} md={24}>
              <Form.Item label="اسم العميل">
                
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Button
                    type="default"
                    style={{ padding: '0 8px', fontWeight: 700, background: 'transparent', boxShadow: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}
                    onClick={() => setShowAddCustomerModal(true)}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {/* Modern Add User Icon */}
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="8" r="4" fill="#2563eb" fillOpacity="0.12" stroke="#2563eb" strokeWidth="1.5" />
                        <path d="M4 20c0-2.5 3.5-4.5 8-4.5s8 2 8 4.5" stroke="#2563eb" strokeWidth="1.5" fill="none" />
                        <g>
                          <circle cx="17.5" cy="7.5" r="2.5" fill="#22c55e" stroke="#2563eb" strokeWidth="1.2" />
                          <path d="M17.5 6v3M16 7.5h3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
                        </g>
                      </svg>
                    </span>
                  </Button>
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
                        taxFile: selected ? (selected.taxFileNumber || selected.taxFile || '') : ''
                      });
                    }}
                    style={{ fontFamily: 'Cairo, sans-serif', fontWeight: 500, fontSize: 16, width: '100%' }}
                    filterOption={(input, option) =>
                      String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    allowClear
                    options={customers.map(customer => ({ 
                      label: customer.nameAr, 
                      value: customer.nameAr 
                    }))}
                  />

      {/* Add Customer Modal */}
      <Modal
        open={showAddCustomerModal}
        onCancel={() => setShowAddCustomerModal(false)}
        footer={null}
        title={<span style={{fontFamily:'Cairo',fontWeight:700}}>إضافة عميل جديد</span>}
        width={420}
        bodyStyle={{ background: '#f8fafc', borderRadius: 12, padding: 24 }}
      >
        <div style={{ marginBottom: 12, padding: 8, background: '#e0e7ef', borderRadius: 8, textAlign: 'center', fontWeight: 500, color: '#305496', fontFamily: 'Cairo', fontSize: 15 }}>
          يرجى تعبئة بيانات العميل بدقة
        </div>
        <Form layout="vertical" onFinish={handleAddCustomer} style={{ gap: 0 }}>
          <Form.Item label={<span style={{fontWeight:600}}>اسم العميل</span>} required style={{ marginBottom: 14 }}>
            <input
              className="ant-input"
              value={addCustomerForm.nameAr}
              onChange={e => handleAddCustomerChange('nameAr', e.target.value)}
              placeholder="اسم العميل"
              style={{
                fontFamily: 'Cairo',
                fontWeight: 500,
                fontSize: 15,
                borderRadius: 6,
                border: '1.5px solid #b6c2d6',
                background: '#fff',
                width: '100%',
                display: 'block',
                padding: '6px 12px',
                boxSizing: 'border-box'
              }}
              required
              autoFocus
            />
          </Form.Item>
          <Form.Item label={<span style={{fontWeight:600}}>رقم الهاتف</span>} required style={{ marginBottom: 14 }}>
            <input
              className="ant-input"
              value={addCustomerForm.phone}
              onChange={e => handleAddCustomerChange('phone', e.target.value)}
              placeholder="رقم الهاتف"
              
                 style={{
                fontFamily: 'Cairo',
                fontWeight: 500,
                fontSize: 15,
                borderRadius: 6,
                border: '1.5px solid #b6c2d6',
                background: '#fff',
                width: '100%',
                display: 'block',
                padding: '6px 12px',
                boxSizing: 'border-box'
              }}
              required
            />
          </Form.Item>
          <Form.Item label={<span style={{fontWeight:600}}>نوع العمل</span>} required style={{ marginBottom: 14 }}>
            <select
              className="ant-select"
              value={addCustomerForm.businessType || 'فرد'}
              onChange={e => handleAddCustomerChange('businessType', e.target.value)}
              style={{ fontFamily: 'Cairo', fontWeight: 500, fontSize: 15, width: '100%', borderRadius: 6, border: '1.5px solid #b6c2d6', background: '#fff', padding: '6px 8px' }}
              required
            >
              <option value="">اختر نوع العمل</option>
              {businessTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </Form.Item>
          {(addCustomerForm.businessType === 'شركة' || addCustomerForm.businessType === 'مؤسسة') && (
            <div style={{ background: '#f1f5f9', borderRadius: 8, padding: 12, marginBottom: 10, border: '1px solid #e0e7ef' }}>
              <Form.Item label={<span style={{fontWeight:600}}>السجل التجاري</span>} required style={{ marginBottom: 12 }}>
                <input
                  className="ant-input"
                  value={addCustomerForm.commercialReg}
                  onChange={e => handleAddCustomerChange('commercialReg', e.target.value)}
                  placeholder="السجل التجاري"
              style={{
                fontFamily: 'Cairo',
                fontWeight: 500,
                fontSize: 15,
                borderRadius: 6,
                border: '1.5px solid #b6c2d6',
                background: '#fff',
                width: '100%',
                display: 'block',
                padding: '6px 12px',
                boxSizing: 'border-box'
              }}
                                required
                />
              </Form.Item>
              <Form.Item label={<span style={{fontWeight:600}}>الملف الضريبي</span>} required style={{ marginBottom: 0 }}>
                <input
                  className="ant-input"
                  value={addCustomerForm.taxFileNumber}
                  onChange={e => handleAddCustomerChange('taxFileNumber', e.target.value)}
                  placeholder="الملف الضريبي"
              style={{
                fontFamily: 'Cairo',
                fontWeight: 500,
                fontSize: 15,
                borderRadius: 6,
                border: '1.5px solid #b6c2d6',
                background: '#fff',
                width: '100%',
                display: 'block',
                padding: '6px 12px',
                boxSizing: 'border-box'
              }}                  required
                />
              </Form.Item>
            </div>
          )}
          <Form.Item style={{ marginTop: 18, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={addCustomerLoading}
              style={{ width: '100%', fontFamily: 'Cairo', fontWeight: 700, fontSize: 16, borderRadius: 8, height: 44, boxShadow: '0 2px 8px #e0e7ef' }}
            >
              إضافة
            </Button>
          </Form.Item>
        </Form>
        <div style={{fontSize:13, color:'#6b7280', marginTop:14, textAlign:'center'}}>
          بعد الإضافة يمكنك تعديل باقي بيانات العميل من صفحة العملاء.
        </div>
      </Modal>
                  <Button
                    type="default"
                    icon={<SearchOutlined />}
                    style={{ minWidth: 40 }}
                    onClick={() => setShowCustomerSearch(true)}
                  />
      {/* مودال البحث عن عميل */}
      <Modal
        open={showCustomerSearch}
        onCancel={() => setShowCustomerSearch(false)}
        footer={null}
        title={<span style={{fontFamily:'Cairo',fontWeight:700}}>بحث عن عميل</span>}
        width={600}
      >
        <Input
          placeholder="ابحث بالاسم أو رقم الهاتف أو أي معلومة..."
          value={customerSearchText}
          onChange={e => setCustomerSearchText(e.target.value)}
          style={{ marginBottom: 16, fontFamily: 'Cairo' }}
          allowClear
          prefix={<SearchOutlined />}
        />
        <Table
          dataSource={filteredCustomers}
          rowKey={row => row.id || row.nameAr}
          columns={[
            { title: 'الاسم', dataIndex: 'nameAr', key: 'nameAr' },
            { title: 'الجوال', dataIndex: 'mobile', key: 'mobile' },
            { title: 'الهاتف', dataIndex: 'phone', key: 'phone' },
            { title: 'السجل التجاري', dataIndex: 'commercialReg', key: 'commercialReg' },
            { title: 'الملف الضريبي', dataIndex: 'taxFile', key: 'taxFile' },
            {
              title: 'اختيار',
              key: 'select',
              render: (_, record) => (
                <Button type="link" onClick={() => {
                  setInvoiceData({
                    ...invoiceData,
                    customerName: record.nameAr || '',
                    customerNumber: record.phone || record.mobile || record.phoneNumber || '',
                    commercialRecord: record.commercialReg || '',
                    taxFile: record.taxFileNumber || record.taxFile || ''
                  });
                  setShowCustomerSearch(false);
                }}>اختيار</Button>
              )
            }
          ]}
          pagination={{ pageSize: 8 }}
          size="small"
        />
      </Modal>
                </div>
              </Form.Item>
            </Col>
            {invoiceType === 'ضريبة' && (
              <>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item label="السجل التجاري">
                    <Input
                      id="commercialRecord"
                      value={invoiceData.commercialRecord}
                      placeholder="السجل التجاري"
                      disabled
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item label="الملف الضريبي">
                    <Input
                      id="taxFile"
                      value={invoiceData.taxFile}
                      placeholder="الملف الضريبي"
                      disabled
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
              <div style={{ marginBottom: 4, fontWeight: 500 }}>كود الصنف</div>
              <Input
                value={item.itemNumber}
                placeholder="كود الصنف"
                disabled
              />
            </Col>
            <Col xs={24} sm={12} md={8}>

              <div style={{ marginBottom: 4, fontWeight: 500 }}>اسم الصنف</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Select
                  ref={itemNameSelectRef}
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
                    taxPercent: selected && selected.isVatIncluded ? taxRate : '0',
                    quantity: '1' // الكمية الافتراضية عند اختيار صنف (كسلسلة نصية)
                  });
                  }}
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                  options={itemNames.map(i => ({ label: i.name, value: i.name }))}
                />
  
              </div>
            </Col>
            {warehouseMode === 'multiple' && (
              <Col xs={24} sm={12} md={4}>
                <div style={{ marginBottom: 4, fontWeight: 500 }}>المخزن</div>
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
            <Col xs={24} sm={12} md={2}>
              <div style={{ marginBottom: 4, fontWeight: 500 }}>الكمية</div>
              <Input
                name="quantity"
                value={item.quantity}
                onChange={handleItemChange}
                placeholder="الكمية"
                type="number"
                min={1}
                style={{  paddingLeft: 6, paddingRight: 6, fontSize: 15 }}
              />
            </Col>
            <Col xs={24} sm={12} md={3}>
              <div style={{ marginBottom: 4, fontWeight: 500 }}>الوحدة</div>
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
            <Col xs={24} sm={12} md={2}>
              <div style={{ marginBottom: 4, fontWeight: 500 }}>السعر</div>
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
          <Col xs={24} sm={12} md={2}>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>% الخصم</div>
            <Input
              name="discountPercent"
              value={item.discountPercent}
              onChange={handleItemChange}
              placeholder="% الخصم"
              style={{ fontFamily: 'Cairo', paddingLeft: 4, paddingRight: 4, fontSize: 15 }}
              type="number"
              min={0}
              max={100}
            />
          </Col>
          <Col xs={24} sm={12} md={2}>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>% الضريبة</div>
            <Input 
              name="taxPercent"
              value={item.taxPercent} 
              onChange={handleItemChange} 
              placeholder="% الضريبة" 
              style={{ fontFamily: 'Cairo',  paddingLeft: 4, paddingRight: 4, fontSize: 15 }}
              type="number" 
              min={0}
            />
          </Col>
          <Col xs={24} sm={12} md={1}>
            <div style={{ marginBottom: 4, fontWeight: 500, visibility: 'hidden' }}>إضافة</div>
            <Button 
              type="primary"
              onClick={handleAddItem}
              disabled={
                !invoiceData.paymentMethod ||
                !invoiceData.branch ||
                (warehouseMode !== 'multiple' && !invoiceData.warehouse) ||
                !invoiceData.customerName
              }
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m4-4H8" />
                </svg>
              }
            />
          </Col>
          </Row>

          {/* Items Table */}
          <div className="mb-4">
            <style>{`
              .custom-items-table .ant-table-thead > tr > th {
                background: #2563eb !important;
                color: #fff !important;
                font-weight: bold;
              }
            `}</style>
            <Table 
              className="custom-items-table"
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
          <Row gutter={16} justify="end" className="mb-4 ">
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <div className="flex justify-between">
                  <span style={{ color: '#2563eb', fontWeight: 600 }}>الإجمالي:</span>
                  <span className="font-bold" style={{ color: '#2563eb' }}>{totals.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#dc2626', fontWeight: 600 }}>الخصم:</span>
                  <span className="font-bold" style={{ color: '#dc2626' }}>{(totals.total - totals.afterDiscount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#ea580c', fontWeight: 600 }}>الإجمالي بعد الخصم:</span>
                  <span className="font-bold" style={{ color: '#ea580c' }}>{totals.afterDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#9333ea', fontWeight: 600 }}>قيمة الضريبة:</span>
                  <span className="font-bold" style={{ color: '#9333ea' }}>{totals.tax.toFixed(2)}</span>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between">
                  <span style={{ color: '#059669', fontWeight: 700 }}>الإجمالي النهائي:</span>
                  <span className="font-bold text-lg" style={{ color: '#059669' }}>{totals.afterTax.toFixed(2)}</span>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Save Button */}
          <Row justify="center" gutter={12}>
            <Col>
              <Button 
                type="primary" 
                size="large" 
                icon={<SaveOutlined />} 
                onClick={async () => {
                  if (Number(totalsDisplay.net) <= 0) {
                    if (typeof message !== 'undefined' && message.error) {
                      message.error('لا يمكن حفظ الفاتورة إذا كان الإجمالي النهائي صفر أو أقل');
                    } else {
                      alert('لا يمكن حفظ الفاتورة إذا كان الإجمالي النهائي صفر أو أقل');
                    }
                    return;
                  }
                  await handleSave();
                  // بعد الحفظ: توليد رقم فاتورة احترافي: INV-رقم الفرع الحقيقي-التاريخ-رقم الفاتوره
                  const today = dayjs().format('YYYYMMDD');
                  const branchObj = branches.find(b => b.id === invoiceData.branch);
                  const branchCode = branchObj?.code || branchObj?.id || invoiceData.branch || '000';
                  const serial = Math.floor(1000 + Math.random() * 9000); // رقم عشوائي بين 1000 و9999
                  const newInvoiceNumber = `INV-${branchCode}-${today}-${serial}`;
                  setInvoiceData(prev => ({
                    ...prev,
                    invoiceNumber: newInvoiceNumber
                  }));
                }}
                style={{ width: 150 }}
                loading={loading}
              >
                حفظ الفاتورة 
              </Button>
            </Col>
            <Col>
              <Button
                type="default"
                size="large"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V2h12v7" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2h-1" />
                    <rect x="6" y="14" width="12" height="8" rx="2" />
                  </svg>
                }
                onClick={handlePrint}
                disabled={loading || !lastSavedInvoice}
                style={{ width: 150 }}
              >
                طباعة الفاتورة
              </Button>
            </Col>
            <Col>
              <Button
                type="default"
                size="large"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h8M8 12h8M8 18h8M4 6h.01M4 12h.01M4 18h.01" />
                  </svg>
                }
                onClick={() => {/* TODO: implement print entry logic */}}
                disabled={loading}
                style={{ width: 150 }}
              >
                طباعة القيد
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
